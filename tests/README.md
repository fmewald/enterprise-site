# Testes do site Enterprise

## Preparação

```bash
npm ci
```

## Build de homologação determinístico

```bash
BUILD_DATE=2026-08-07 PUBLIC_INDEXING=false CONTEXT=deploy-preview npm run build
```

## Suítes estruturais

```bash
python3 tests/test_v13_dist.py
python3 tests/test_v12_blog.py
python3 tests/test_v12_dist.py
```

## Regressão V3.1

```bash
python3 tests/test_fase1_v31.py --group estatico
python3 tests/test_fase1_v31.py --group ctas
python3 tests/test_fase1_v31.py --group seguranca
python3 tests/test_fase1_v31.py --group layout
python3 tests/test_fase1_v31.py --group fluxos
python3 tests/test_fase1_v31.py --group regressao
```

## E2E/visual V1.3

A suíte usa Playwright/Chromium apenas para auditoria e não participa do build da Netlify.

```bash
python3 tests/test_v13_e2e.py --group navigation
python3 tests/test_v13_e2e.py --group ctas
python3 tests/test_v13_e2e.py --group visual --widths 320
python3 tests/test_v13_e2e.py --group visual --widths 375
python3 tests/test_v13_e2e.py --group visual --widths 768
python3 tests/test_v13_e2e.py --group visual --widths 1024
python3 tests/test_v13_e2e.py --group visual --widths 1366
python3 tests/test_v13_e2e.py --group visual --widths 1440
python3 tests/test_v13_e2e.py --group visual --widths 1920
```

Os screenshots são evidência de auditoria e devem permanecer somente no pacote interno.

## Checks pós-auditoria V1.3

`test_v13_dist.py` valida `.nvmrc = 22` e a consistência com Netlify/package.json. `test_v13_e2e.py` valida WhatsApp mobile compacto/sem sobreposição nos cenários críticos e a proteção contra quebra isolada da seta dos links de segmentos.
