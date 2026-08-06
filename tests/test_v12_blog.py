#!/usr/bin/env python3
"""Testes V1.2 do workflow editorial, draft técnico, datas e blog estático."""
from __future__ import annotations

import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
ASSERTIONS = 0
REFERENCE_DATE = "2026-08-06"


def check(condition: bool, message: str) -> None:
    global ASSERTIONS
    ASSERTIONS += 1
    if not condition:
        raise AssertionError(message)


def copy_repo(dst: Path) -> None:
    ignored = shutil.ignore_patterns('.git', 'dist', 'node_modules', '__pycache__', '.pytest_cache', '*.zip', 'release')
    shutil.copytree(REPO, dst, ignore=ignored, dirs_exist_ok=True)


def build(repo: Path, build_date: str = REFERENCE_DATE, expect_success: bool = True) -> subprocess.CompletedProcess[str]:
    env = os.environ.copy()
    env.update(PUBLIC_INDEXING='false', CONTEXT='deploy-preview', BUILD_DATE=build_date)
    p = subprocess.run(['node', 'scripts/build-site.js'], cwd=repo, env=env, text=True, capture_output=True)
    if expect_success:
        check(p.returncode == 0, f"Build editorial falhou: {p.stderr or p.stdout}")
    else:
        check(p.returncode != 0, "Build editorial deveria falhar")
    return p


def fixture(*, slug: str = 'artigo-fixture-editorial', draft: bool | None = None,
            date: str = '2026-08-05', updated: str = '2026-08-06', redirect: str | None = None,
            legacy_status: str | None = None) -> str:
    draft_line = '' if draft is None else f'draft: {str(draft).lower()}\n'
    status_line = '' if legacy_status is None else f'status: "{legacy_status}"\n'
    redirect_block = 'redirect_from: []' if not redirect else f'redirect_from:\n  - "{redirect}"'
    return f'''---
slug: "{slug}"
titulo: "Artigo fixture editorial"
seo_title: "Artigo fixture editorial"
resumo: "Conteúdo temporário para validar workflow, draft técnico, exclusão, slug, fontes, datas e Markdown."
categoria: "Contabilidade"
data: "{date}"
atualizado: "{updated}"
autor: "Equipe Técnica da Enterprise Assessoria Contábil"
{draft_line}{status_line}cta_interesse: "diagnostico-geral"
cta_servico: "contabilidade"
resposta_direta: |
  Este é um resumo direto criado exclusivamente para o teste editorial. O artigo presente na branch principal é publicável, salvo quando draft: true.
  
  Rascunhos e revisões do workflow não chegam à branch principal e, portanto, não entram no build público.
sources:
  - title: "Receita Federal"
    url: "https://www.gov.br/receitafederal/pt-br"
    accessed: "{updated}"
{redirect_block}
---

## Tabela e caracteres acentuados

| Campo | Situação |
| --- | --- |
| Publicação | válida |

> Uma citação segura e legível.

- Item principal
  - Item aninhado
  - Outro item

![Imagem institucional](/assets/img/og-enterprise-1200x630.jpg)

[Link externo](https://www.gov.br/receitafederal/pt-br)

[Link inseguro](javascript:alert(1))

```js
const valor = "código seguro";
```

<script>alert('não executar')</script>
'''


def assert_presence(repo: Path, slug: str, present: bool) -> None:
    dist = repo / 'dist'
    page = dist / 'blog' / slug / 'index.html'
    blog = (dist / 'blog.html').read_text()
    sitemap = (dist / 'sitemap.xml').read_text()
    feed = (dist / 'feed.xml').read_text()
    for label, value in [('página', page.exists()), ('card', f'/blog/{slug}/' in blog),
                         ('sitemap', f'/blog/{slug}/' in sitemap), ('RSS', f'/blog/{slug}/' in feed)]:
        check(value is present, f"Estado incorreto de {label} para {slug}: esperado {present}")


def main() -> int:
    with tempfile.TemporaryDirectory(prefix='enterprise-v12-blog-') as tmp:
        repo = Path(tmp) / 'repo'
        copy_repo(repo)
        post = repo / 'posts' / 'artigo-fixture-editorial.md'
        cms = (repo / 'admin/config.yml').read_text()
        check('backend:\n  name: git-gateway' in cms, 'Git Gateway alterado')
        check('publish_mode: editorial_workflow' in cms, 'Workflow editorial ausente')
        check('name: "status"' not in cms, 'CMS ainda exige status manual')
        check('Use o fluxo editorial' in cms, 'Ajuda do workflow ausente')

        # Build inicial: rascunho/revisão do workflow não está na main e não aparece.
        build(repo)
        template_before = (repo / 'templates/blog.template.html').read_text()
        check('<!-- BLOG_CARDS_START -->' in template_before and '<!-- BLOG_CARDS_END -->' in template_before,
              'Marcadores permanentes ausentes')
        check(len(list((repo / 'dist/blog').glob('*/index.html'))) == 5, 'Build inicial deveria conter cinco artigos')
        assert_presence(repo, 'artigo-fixture-editorial', False)

        # Arquivo publicado pelo workflow chega à main sem segundo status e aparece.
        post.write_text(fixture(), encoding='utf-8')
        build(repo)
        assert_presence(repo, 'artigo-fixture-editorial', True)
        page = (repo / 'dist/blog/artigo-fixture-editorial/index.html').read_text()
        for fragment in ['<table>', '<blockquote>', '<ul>', 'Imagem institucional',
                         'target="_blank" rel="noopener noreferrer"', '<pre><code class="language-js">', 'código seguro']:
            check(fragment in page, f"Markdown não suportado: {fragment}")
        check('<script>alert' not in page, 'HTML arbitrário executável não foi sanitizado')
        check('&lt;script&gt;alert' in page, 'HTML bruto não foi escapado')
        check('href="javascript:' not in page.lower(), 'javascript: não foi bloqueado')
        check(page.count('id="fontes-oficiais"') == 1, 'Mais de uma seção de fontes')

        # draft false é publicável; draft true é proteção técnica e some.
        post.write_text(fixture(draft=False), encoding='utf-8')
        build(repo); assert_presence(repo, 'artigo-fixture-editorial', True)
        post.write_text(fixture(draft=True), encoding='utf-8')
        build(repo); assert_presence(repo, 'artigo-fixture-editorial', False)
        check(not (repo / 'dist/blog/artigo-fixture-editorial').exists(), 'Diretório do draft técnico permaneceu')

        # Campo legado status é recusado para impedir duas fontes de verdade.
        post.write_text(fixture(legacy_status='published'), encoding='utf-8')
        failed = build(repo, expect_success=False)
        check('Campo editorial redundante "status"' in (failed.stderr + failed.stdout), 'Erro claro do status legado ausente')

        # Data futura local: passa na data de referência igual e falha no dia anterior.
        post.write_text(fixture(date='2026-08-07', updated='2026-08-07'), encoding='utf-8')
        build(repo, build_date='2026-08-07')
        assert_presence(repo, 'artigo-fixture-editorial', True)
        failed = build(repo, build_date='2026-08-06', expect_success=False)
        check('Data futura em relação à data de referência 2026-08-06' in (failed.stderr + failed.stdout),
              'Falha de data futura não é clara')

        # Restauração, segundo build, mudança de slug e exclusão.
        post.write_text(fixture(), encoding='utf-8')
        build(repo); build(repo)
        assert_presence(repo, 'artigo-fixture-editorial', True)
        blog = (repo / 'dist/blog.html').read_text()
        check(blog.count('href="/blog/artigo-fixture-editorial/"') == 2, 'Card duplicado no segundo build')
        check((repo / 'templates/blog.template.html').read_text() == template_before, 'Build alterou template do blog')

        new_slug = 'artigo-fixture-renomeado'
        post.write_text(fixture(slug=new_slug, redirect='/blog/artigo-fixture-editorial/'), encoding='utf-8')
        build(repo)
        assert_presence(repo, new_slug, True)
        assert_presence(repo, 'artigo-fixture-editorial', False)
        redirects = (repo / 'dist/_redirects').read_text()
        check('/blog/artigo-fixture-editorial/ /blog/artigo-fixture-renomeado/ 301!' in redirects,
              'Redirect editorial de slug ausente')
        check(not (repo / 'dist/blog/artigo-fixture-editorial').exists(), 'Página do slug antigo permaneceu')

        post.unlink(); build(repo)
        assert_presence(repo, new_slug, False)
        check(not (repo / 'dist/blog' / new_slug).exists(), 'Diretório de artigo excluído permaneceu')
        check(len(list((repo / 'dist/blog').glob('*/index.html'))) == 5, 'Exclusão não restaurou quantidade original')

        for article in (repo / 'dist/blog').glob('*/index.html'):
            html = article.read_text(); ids = re.findall(r'\sid="([^"]+)"', html)
            check(len(ids) == len(set(ids)), f"IDs duplicados em {article.parent.name}")
            check(html.count('id="fontes-oficiais"') == 1, f"Fontes duplicadas em {article.parent.name}")
        check((repo / 'templates/blog.template.html').read_text() == template_before, 'Ciclo editorial alterou fonte')

    print(f"APROVADO — {ASSERTIONS} verificações do ciclo editorial V1.2.")
    return 0


if __name__ == '__main__':
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"FALHA após {ASSERTIONS} verificações: {exc}", file=sys.stderr)
        raise
