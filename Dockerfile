FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Writable dirs for the SQLite DB and uploaded resumes.
RUN mkdir -p data frontend/uploads

EXPOSE 8080

# Honour the platform-injected $PORT (Railway/Fly). --proxy-headers so the app
# sees the real https scheme behind the load balancer (needed for OAuth redirects).
CMD ["sh", "-c", "uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8080} --proxy-headers --forwarded-allow-ips='*'"]
