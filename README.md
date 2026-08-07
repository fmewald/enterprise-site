# Enterprise Assessoria Contábil — site institucional V1.3

Projeto estático publicado pela Netlify exclusivamente a partir de `dist/`.

## Ambiente

- Node.js 22 (`.nvmrc` = `22`)
- Python 3.12 ou superior
- Decap CMS 3.11.0
- Netlify Identity + Git Gateway
- `publish_mode: editorial_workflow`

## Comandos

```bash
npm ci
npm run build
npm test
```

Se a suíte agregada ultrapassar o limite do ambiente, execute os grupos documentados em `tests/README.md` separadamente.

## Pré-lançamento e indexação

A indexação pública só é liberada quando **as duas** condições são verdadeiras:

```text
PUBLIC_INDEXING=true
CONTEXT=production
```

Qualquer outro contexto permanece `noindex, nofollow`.

## Assets com fingerprint

O build calcula SHA-256 do conteúdo de `assets/css/styles.css` e `assets/js/main.js` e publica nomes determinísticos como:

```text
/assets/css/styles.024d6a0a.css
/assets/js/main.f800d337.js
```

Os HTMLs de `dist/` são atualizados automaticamente. Assets fingerprinted recebem cache longo e `immutable`; HTML/rotas limpas continuam com revalidação imediata.

## Blog

Os artigos são gerados estaticamente a partir de `posts/*.md`. O Blog destaca automaticamente o artigo publicado/atualizado mais recente e monta a grade restante. A seção “Leia também” é gerada automaticamente: prioriza a mesma categoria por recência e completa até três itens com os artigos publicados mais recentes de outras categorias.

## CMS

O painel permanece em `/admin/`, usando `git-gateway` e `editorial_workflow`. `draft: true` continua disponível apenas como proteção técnica para arquivos presentes na branch de publicação.

## Pacotes de entrega

Use o ZIP **REPOSITORIO-PUBLICO** para atualizar o GitHub. O ZIP **AUDITORIA-INTERNA** contém relatórios, logs e screenshots e não deve ser enviado ao repositório público.
