# Testes reproduzíveis — Enterprise V1.2

## Preparação

```bash
npm ci
```

O ambiente precisa de Node.js 22, Python 3.12+ e as dependências Python descritas em `tests/requirements.txt` para a regressão com Playwright.

## Execução completa

```bash
npm test
```

O comando utiliza `BUILD_DATE=2026-08-06` nas verificações determinísticas.

## Grupos separados

```bash
npm run test:dist
npm run test:blog
npm run test:regression
```

- `test:dist`: build, data dinâmica, Python, CMS, Decap, cache, entidades, indexação, formulários e saída pública.
- `test:blog`: workflow, `draft`, datas futuras, parser, sanitização, slug, exclusão, RSS e sitemap.
- `test:regression`: 357 verificações homologadas da V3.1.
- `test:packages`: separação entre repositório público e auditoria interna.
