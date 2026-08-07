# Manifesto do repositório público — V1.3

## Pacote correto para o GitHub

Utilize exclusivamente:

`enterprise-site-PRE-LANCAMENTO-INTEGRAL-V1.3-REPOSITORIO-PUBLICO.zip`

O pacote contém o snapshot limpo que deve substituir o conteúdo versionado do projeto, preservando código-fonte, templates, artigos, CMS, assets, scripts de build, dependências declaradas/vendorizadas, testes técnicos, configuração Netlify e `dist/` de homologação.

## Arquivos residuais que devem ser excluídos do repositório existente

Se ainda existirem no GitHub, exclua explicitamente:

- `GUIA-DE-PUBLICACAO.md`
- `RELATORIO-FASE-1.md`
- `build-blog-index.js`
- `post.html`
- `robots.txt` na raiz
- `sitemap.xml` na raiz
- `posts/index.json`
- `posts/teste-titulo.md`
- `posts/teste-2.md`
- `posts/reforma-tributaria-2026-o-que-muda.md`
- `dist/post.html`
- `dist/assets/css/styles.css`
- `dist/assets/js/main.js`
- `dist/assets/js/legacy-post.js`

`dist/robots.txt` e `dist/sitemap.xml` são arquivos gerados válidos e devem permanecer.

## Correção final pós-auditoria

- `.nvmrc` contém exatamente `22` e é validado contra Netlify e `package.json`.
- WhatsApp mobile usa botão compacto de 52 × 52 px com ícone e `aria-label`.
- Os CTAs editoriais de segmentos mantêm a seta ligada à última palavra.

## Novos mecanismos V1.3

- fingerprint determinístico de CSS e JS;
- Blog com artigo em destaque automático e grade editorial;
- “Leia também” horizontal, automático e sensível à categoria;
- testes V1.3 de build/cache/Blog;
- auditoria E2E separada para navegador/headless;
- rótulo global “Segmentos Atendidos” e quatro links editoriais da Home para as páginas setoriais.

## Conteúdo mantido fora do GitHub

O pacote público não contém:

- relatórios e auditorias internas;
- logs detalhados;
- screenshots E2E;
- checklists administrativos;
- documentos de planejamento;
- `__pycache__`, `node_modules` ou `.git`;
- tokens, senhas, credenciais ou dados administrativos de usuários.

Esses materiais de auditoria ficam somente no pacote `AUDITORIA-INTERNA`.

## Regra de segurança

Nunca envie ao GitHub senhas, tokens, chaves privadas, capturas de painel, lista de usuários do Identity ou e-mails pessoais de administradores.
