# Enterprise Assessoria Contábil — site institucional

Projeto estático publicado pela Netlify a partir da pasta `dist/`.

## Ambiente

- Node.js 22
- Python 3.12 ou superior
- Netlify Identity habilitado
- Git Gateway habilitado
- Decap CMS 3.11.0

## Comandos

```bash
npm ci
npm run build
npm test
```

O build remove e recria `dist/`. Por segurança, a indexação pública só é liberada quando `PUBLIC_INDEXING=true` e `CONTEXT=production`.

## Blog e CMS

O painel permanece em `/admin/`, com `backend: git-gateway` e `publish_mode: editorial_workflow`. O fluxo editorial é a fonte principal de publicação. Um arquivo presente na branch principal é publicado, salvo quando contém `draft: true`.

## Data de referência

O build aceita `BUILD_DATE=YYYY-MM-DD`. Sem a variável, utiliza a data atual no fuso `America/Sao_Paulo`.

## Pacotes de entrega

Use o ZIP identificado como **REPOSITORIO-PUBLICO** para atualizar o GitHub. O pacote **AUDITORIA-INTERNA** contém documentos e logs que não devem ser enviados ao repositório público.
