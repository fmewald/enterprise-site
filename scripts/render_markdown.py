#!/usr/bin/env python3
"""Renderiza Markdown com markdown-it-py vendorizado e sanitização por allowlist."""
from __future__ import annotations

import html
import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "vendor" / "markdown-renderer" / "python"))

from markdown_it import MarkdownIt  # noqa: E402

SITE_HOST = "enterprisecontabilidade.com.br"
ALLOWED_TAGS = {
    "p", "h1", "h2", "h3", "h4", "h5", "h6", "a", "img", "ul", "ol", "li",
    "blockquote", "pre", "code", "hr", "strong", "em", "del", "table", "thead",
    "tbody", "tr", "th", "td", "br"
}
VOID_TAGS = {"img", "hr", "br"}
ALLOWED_ATTRS = {
    "a": {"href", "title", "target", "rel"},
    "img": {"src", "alt", "title", "loading", "decoding"},
    "code": {"class"},
    "th": {"scope", "align"},
    "td": {"align"},
}
SAFE_CLASS = re.compile(r"^language-[A-Za-z0-9_-]+$")


def safe_url(value: str, *, image: bool = False) -> str | None:
    value = (value or "").strip()
    if not value:
        return None
    lowered = value.lower().replace("\x00", "")
    if lowered.startswith("javascript:") or lowered.startswith("data:") or lowered.startswith("vbscript:"):
        return None
    if value.startswith(("/", "#")):
        return value
    parsed = urlparse(value)
    if parsed.scheme == "https":
        return value
    if not image and parsed.scheme in {"mailto", "tel"}:
        return value
    return None


def is_external(href: str) -> bool:
    parsed = urlparse(href)
    return parsed.scheme == "https" and parsed.hostname not in {SITE_HOST, f"www.{SITE_HOST}"}


class AllowlistSanitizer(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=False)
        self.out: list[str] = []
        self.skip_depth = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        tag = tag.lower()
        if tag in {"script", "style", "iframe", "object", "embed", "svg", "math"}:
            self.skip_depth += 1
            return
        if self.skip_depth or tag not in ALLOWED_TAGS:
            return
        cleaned: list[tuple[str, str]] = []
        allowed = ALLOWED_ATTRS.get(tag, set())
        attr_map = {name.lower(): (value or "") for name, value in attrs if name}
        for name in sorted(allowed):
            if name not in attr_map:
                continue
            value = attr_map[name]
            if name in {"href", "src"}:
                value = safe_url(value, image=(name == "src")) or ""
                if not value:
                    continue
            elif name == "class":
                if not SAFE_CLASS.fullmatch(value):
                    continue
            elif name == "target":
                if value != "_blank":
                    continue
            elif name == "rel":
                tokens = {token for token in value.split() if token in {"noopener", "noreferrer", "nofollow"}}
                value = " ".join(sorted(tokens))
                if not value:
                    continue
            elif name == "scope":
                if value not in {"col", "row"}:
                    continue
            elif name == "align":
                if value not in {"left", "center", "right"}:
                    continue
            cleaned.append((name, value))

        if tag == "a":
            href = next((v for n, v in cleaned if n == "href"), "")
            cleaned = [(n, v) for n, v in cleaned if n not in {"target", "rel"}]
            if href and is_external(href):
                cleaned.extend([("target", "_blank"), ("rel", "noopener noreferrer")])
        elif tag == "img":
            cleaned = [(n, v) for n, v in cleaned if n not in {"loading", "decoding"}]
            cleaned.extend([("loading", "lazy"), ("decoding", "async")])

        attr_text = "".join(f' {name}="{html.escape(value, quote=True)}"' for name, value in cleaned)
        self.out.append(f"<{tag}{attr_text}>")

    def handle_startendtag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        self.handle_starttag(tag, attrs)

    def handle_endtag(self, tag: str) -> None:
        tag = tag.lower()
        if tag in {"script", "style", "iframe", "object", "embed", "svg", "math"}:
            if self.skip_depth:
                self.skip_depth -= 1
            return
        if self.skip_depth or tag not in ALLOWED_TAGS or tag in VOID_TAGS:
            return
        self.out.append(f"</{tag}>")

    def handle_data(self, data: str) -> None:
        if not self.skip_depth:
            self.out.append(html.escape(data, quote=False))

    def handle_entityref(self, name: str) -> None:
        if not self.skip_depth:
            self.out.append(f"&{name};")

    def handle_charref(self, name: str) -> None:
        if not self.skip_depth:
            self.out.append(f"&#{name};")

    def get_html(self) -> str:
        return "".join(self.out)


def render(source: str) -> str:
    md = MarkdownIt("commonmark", {"html": False, "linkify": False, "typographer": False})
    md.enable("table")
    md.enable("strikethrough")
    rendered = md.render(source)
    sanitizer = AllowlistSanitizer()
    sanitizer.feed(rendered)
    sanitizer.close()
    cleaned = sanitizer.get_html()
    cleaned = cleaned.replace("<table>", '<div class="table-scroll"><table>').replace("</table>", "</table></div>")
    return cleaned


def main() -> int:
    source = sys.stdin.read()
    try:
        if "--json" in sys.argv:
            payload = json.loads(source)
            if not isinstance(payload, list) or not all(isinstance(item, str) for item in payload):
                raise ValueError("A entrada em lote deve ser uma lista JSON de strings")
            sys.stdout.write(json.dumps([render(item) for item in payload], ensure_ascii=False))
        else:
            sys.stdout.write(render(source))
    except Exception as exc:  # pragma: no cover - saída tratada pelo build
        print(f"Falha ao renderizar Markdown: {exc}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
