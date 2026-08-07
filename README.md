# Renderizador Markdown vendorizado

Este pacote local registra a dependência de build baseada em **markdown-it-py 4.2.0** e **mdurl 0.1.2**. O código Python é mantido em `python/` para que `npm ci` e o build da Netlify não dependam de download de pacotes externos.

A saída é filtrada por allowlist em `scripts/render_markdown.py`. HTML bruto fica desabilitado; scripts, atributos de evento e URLs `javascript:` não são aceitos.
