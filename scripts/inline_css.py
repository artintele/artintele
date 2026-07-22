#!/usr/bin/env python3
"""Inline a minified copy of frontend/assets/css/v2.css into every public
page, replacing the render-blocking <link>. Idempotent: re-run after any
CSS edit and the embedded <style id="v2css"> blocks are refreshed."""
import pathlib, re

FE = pathlib.Path(__file__).resolve().parent.parent / 'frontend'
PAGES = ['index.html','pricing.html','contact.html','careers.html','blog.html','privacy.html','cookies.html','terms.html']

def minify(c):
    c = re.sub(r'/\*[\s\S]*?\*/', '', c)          # comments
    c = re.sub(r'\n\s*', '\n', c)                  # indentation
    c = re.sub(r'\n+', '\n', c).strip()            # blank lines
    c = re.sub(r'\s*([{};:,>])\s*', r'\1', c)      # space around punctuation
    c = c.replace(';}', '}')
    return c

css = minify((FE/'assets/css/v2.css').read_text())
style_block = f'<style id="v2css">{css}</style>'

for name in PAGES:
    p = FE/name; h = p.read_text()
    # lambda replacements: the CSS must be inserted verbatim — as a plain
    # replacement string, sequences like \00B7 would be eaten as escapes
    if '<style id="v2css">' in h:
        h2 = re.sub(r'<style id="v2css">[\s\S]*?</style>', lambda m: style_block, h, count=1)
    else:
        h2 = re.sub(r'<link rel="stylesheet" href="/assets/css/v2\.css[^"]*">', lambda m: style_block, h, count=1)
    assert '<style id="v2css">' in h2, name
    p.write_text(h2)
    print(name, 'inlined', len(css), 'bytes')
