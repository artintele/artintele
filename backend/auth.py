"""Dashboard authentication: Google Workspace SSO, restricted to one domain.

Security model:
- Login is only possible through Google ("Sign in with Google").
- The signed-in account's email MUST be verified AND end in
  `@{ALLOWED_EMAIL_DOMAIN}` (default prachalas.com). This is checked
  server-side on every callback — the Google `hd` hint is only a convenience.
- On success a signed, http-only session cookie is issued (8h). All
  /api/admin/* routes and the /dashboard page require that session.
- No passwords are stored anywhere.
"""
import logging

from authlib.integrations.starlette_client import OAuth, OAuthError
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse, RedirectResponse
from starlette.status import HTTP_401_UNAUTHORIZED, HTTP_403_FORBIDDEN

from . import config

log = logging.getLogger("artintele.auth")

oauth = OAuth()
if config.OAUTH_CONFIGURED:
    oauth.register(
        name="google",
        server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
        client_id=config.GOOGLE_CLIENT_ID,
        client_secret=config.GOOGLE_CLIENT_SECRET,
        client_kwargs={"scope": "openid email profile", "prompt": "select_account"},
    )

router = APIRouter()


# --------------------------------------------------------------------------
# Helpers
# --------------------------------------------------------------------------
def email_allowed(email: str | None) -> bool:
    """True only if the email is on the allowed Workspace domain."""
    if not email:
        return False
    return email.strip().lower().endswith("@" + config.ALLOWED_EMAIL_DOMAIN.strip().lower())


def current_user(request: Request) -> dict | None:
    return request.session.get("user")


def require_user(request: Request) -> dict:
    """Dependency for protected API routes. Raises 401 if not signed in."""
    user = current_user(request)
    if not user:
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    return user


def _redirect_uri(request: Request) -> str:
    if config.PUBLIC_BASE_URL:
        return config.PUBLIC_BASE_URL + "/auth/callback"
    return str(request.url_for("auth_callback"))


# --------------------------------------------------------------------------
# Routes
# --------------------------------------------------------------------------
@router.get("/auth/login")
async def auth_login(request: Request):
    if not config.OAUTH_CONFIGURED:
        raise HTTPException(
            status_code=503,
            detail="Google sign-in is not configured (set GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET).",
        )
    redirect_uri = _redirect_uri(request)
    # `hd` nudges Google to the right Workspace; real enforcement is in callback.
    return await oauth.google.authorize_redirect(request, redirect_uri, hd=config.ALLOWED_EMAIL_DOMAIN)


@router.get("/auth/callback", name="auth_callback")
async def auth_callback(request: Request):
    try:
        token = await oauth.google.authorize_access_token(request)
    except OAuthError as exc:
        log.warning("OAuth error: %s", exc)
        return RedirectResponse(url="/login?error=oauth")

    info = token.get("userinfo") or {}
    email = info.get("email")
    verified = info.get("email_verified", False)

    if not verified or not email_allowed(email):
        log.warning("Rejected sign-in for %r (verified=%s)", email, verified)
        # Do NOT create a session. Send back to login with a clear reason.
        return RedirectResponse(url="/login?error=domain", status_code=302)

    request.session["user"] = {
        "email": email,
        "name": info.get("name", email),
        "picture": info.get("picture", ""),
    }
    log.info("Sign-in OK: %s", email)
    return RedirectResponse(url="/dashboard", status_code=302)


@router.get("/auth/logout")
async def auth_logout(request: Request):
    request.session.pop("user", None)
    return RedirectResponse(url="/login", status_code=302)


@router.get("/api/me")
async def whoami(request: Request):
    user = current_user(request)
    if not user:
        return JSONResponse({"authenticated": False}, status_code=HTTP_401_UNAUTHORIZED)
    return {"authenticated": True, "user": user, "domain": config.ALLOWED_EMAIL_DOMAIN}


@router.get("/auth/dev-login")
async def auth_dev_login(request: Request):
    """DEV ONLY. Grants a session without Google. 404 unless DASHBOARD_DEV_BYPASS."""
    if not config.DASHBOARD_DEV_BYPASS:
        raise HTTPException(status_code=404, detail="Not found")
    request.session["user"] = {
        "email": "dev@" + config.ALLOWED_EMAIL_DOMAIN,
        "name": "Dev User",
        "picture": "",
    }
    return RedirectResponse(url="/dashboard", status_code=302)
