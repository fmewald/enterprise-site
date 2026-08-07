#!/usr/bin/env python3
"""V1.3 — fingerprinting, Blog visual/estrutural, relacionados, limpeza e cache."""
from __future__ import annotations
import hashlib, json, os, re, shutil, subprocess, tempfile
from pathlib import Path

REPO=Path(__file__).resolve().parents[1]
DIST=REPO/'dist'
ASSERTIONS=0
BUILD_DATE='2026-08-07'

def check(cond,msg):
    global ASSERTIONS; ASSERTIONS+=1
    if not cond: raise AssertionError(msg)

def build(repo=REPO, date=BUILD_DATE):
    env=os.environ.copy();env.update(BUILD_DATE=date,PUBLIC_INDEXING='false',CONTEXT='deploy-preview')
    p=subprocess.run(['node','scripts/build-site.js'],cwd=repo,env=env,text=True,capture_output=True)
    check(p.returncode==0, p.stderr or p.stdout)
    return p

def asset_refs(dist=DIST):
    css=list((dist/'assets/css').glob('styles.*.css')); js=list((dist/'assets/js').glob('main.*.js'))
    check(len(css)==1,f'Esperado 1 CSS fingerprinted, encontrado {len(css)}')
    check(len(js)==1,f'Esperado 1 JS fingerprinted, encontrado {len(js)}')
    return css[0],js[0]

def copy_repo(dst):
    ignore=shutil.ignore_patterns('.git','dist','node_modules','__pycache__','*.zip','tests/screenshots-v13','release')
    shutil.copytree(REPO,dst,ignore=ignore,dirs_exist_ok=True)

def fixture(slug='artigo-v13-categoria-reforma', category='Reforma Tributária', draft=False):
    return f'''---\nslug: "{slug}"\ntitulo: "Artigo temporário V1.3"\nseo_title: "Artigo temporário V1.3"\nresumo: "Artigo temporário criado apenas para validar destaque, relacionados e atualização automática do Blog."\ncategoria: "{category}"\ndata: "2026-08-07"\natualizado: "2026-08-07"\nautor: "Equipe Técnica da Enterprise Assessoria Contábil"\ndraft: {str(draft).lower()}\ncta_interesse: "reforma-tributaria"\ncta_servico: "reforma-tributaria"\nresposta_direta: |\n  Conteúdo de teste usado apenas durante a suíte V1.3.\n\nsources:\n  - title: "Receita Federal"\n    url: "https://www.gov.br/receitafederal/pt-br"\n    accessed: "2026-08-07"\nredirect_from: []\n---\n\n## Conteúdo de teste\n\nEste arquivo é removido ao fim do teste e nunca integra a entrega.\n'''

def validate_fingerprints():
    css,js=asset_refs()
    check(re.fullmatch(r'styles\.[0-9a-f]{8}\.css',css.name) is not None,'Nome CSS não usa hash de 8 hex')
    check(re.fullmatch(r'main\.[0-9a-f]{8}\.js',js.name) is not None,'Nome JS não usa hash de 8 hex')
    exp_css=hashlib.sha256((REPO/'assets/css/styles.css').read_bytes()).hexdigest()[:8]
    exp_js=hashlib.sha256((REPO/'assets/js/main.js').read_bytes()).hexdigest()[:8]
    check(css.name==f'styles.{exp_css}.css','Hash CSS não deriva do conteúdo')
    check(js.name==f'main.{exp_js}.js','Hash JS não deriva do conteúdo')
    check(not (DIST/'assets/css/styles.css').exists(),'CSS sem fingerprint foi publicado')
    check(not (DIST/'assets/js/main.js').exists(),'JS sem fingerprint foi publicado')
    for html in DIST.rglob('*.html'):
        text=html.read_text()
        check('/assets/css/styles.css' not in text,f'CSS sem hash em {html.relative_to(DIST)}')
        check('/assets/js/main.js' not in text,f'JS sem hash em {html.relative_to(DIST)}')
        if html.relative_to(DIST).as_posix()!='admin/index.html':
            check(f'/assets/css/{css.name}' in text,f'CSS fingerprinted ausente em {html.relative_to(DIST)}')
            check(f'/assets/js/{js.name}' in text,f'JS fingerprinted ausente em {html.relative_to(DIST)}')

    # Build idêntico mantém os nomes.
    first=(css.name,js.name); build(); css2,js2=asset_refs(); check(first==(css2.name,js2.name),'Build idêntico mudou fingerprints')

    # Alterar cada conteúdo em cópia temporária muda apenas seu fingerprint correspondente.
    with tempfile.TemporaryDirectory(prefix='enterprise-v13-hash-') as tmp:
        repo=Path(tmp)/'repo'; copy_repo(repo); build(repo); c0,j0=asset_refs(repo/'dist')
        (repo/'assets/css/styles.css').write_text((repo/'assets/css/styles.css').read_text()+'\n/* fingerprint-test */\n')
        build(repo); c1,j1=asset_refs(repo/'dist')
        check(c1.name!=c0.name,'Alteração de CSS não mudou hash')
        check(j1.name==j0.name,'Alteração de CSS mudou hash do JS')
        (repo/'assets/js/main.js').write_text((repo/'assets/js/main.js').read_text()+'\n// fingerprint-test\n')
        build(repo); c2,j2=asset_refs(repo/'dist')
        check(c2.name==c1.name,'Alteração de JS mudou hash do CSS')
        check(j2.name!=j1.name,'Alteração de JS não mudou hash')

def validate_blog_structure():
    blog=(DIST/'blog.html').read_text(); css=(REPO/'assets/css/styles.css').read_text()
    check(blog.count('post-card--featured')==1,'Blog deve ter um destaque')
    check(blog.count('class="post-card"')==4,'Blog deve ter quatro cards regulares com cinco artigos')
    for cls in ['post-card','post-card__cat','post-card__meta','post-card__link','related-articles','related-card','article-summary','article-cta','article-sources']:
        check(re.search(r'\.'+re.escape(cls)+r'(?:\b|[\s:{.,])',css) is not None,f'CSS ausente para {cls}')
    check('phero--blog' in blog,'Hero específico do Blog ausente')
    article=next((DIST/'blog').glob('*/index.html')).read_text()
    check('article-aside' not in article,'Sidebar Leia também ainda presente')
    check('related-articles__grid' in article,'Leia também horizontal ausente')
    check(article.count('class="related-card"')==3,'Leia também deve ter no máximo/exatamente 3 com a base atual')
    check('article-section' in article,'Coluna central de leitura ausente')


def validate_related_dynamic():
    with tempfile.TemporaryDirectory(prefix='enterprise-v13-related-') as tmp:
        repo=Path(tmp)/'repo'; copy_repo(repo)
        post=repo/'posts/artigo-v13-categoria-reforma.md'; post.write_text(fixture())
        build(repo)
        blog=(repo/'dist/blog.html').read_text()
        check('post-card post-card--featured' in blog and '/blog/artigo-v13-categoria-reforma/' in blog,'Novo artigo mais recente não virou destaque')
        check('/blog/artigo-v13-categoria-reforma/' in (repo/'dist/sitemap.xml').read_text(),'Novo artigo não entrou no sitemap')
        check('/blog/artigo-v13-categoria-reforma/' in (repo/'dist/feed.xml').read_text(),'Novo artigo não entrou no RSS')
        existing=repo/'dist/blog/ibs-cbs-o-que-as-empresas-precisam-preparar-para-a-transicao/index.html'
        html=existing.read_text(); block=re.search(r'<div class="related-articles__grid">([\s\S]*?)</div></div></section>',html)
        check(block is not None,'Bloco relacionados não encontrado')
        refs=re.findall(r'href="/blog/([^/]+)/"',block.group(1))
        # Cada card tem dois links; deduplica mantendo ordem.
        refs=list(dict.fromkeys(refs))
        check(refs[0]=='artigo-v13-categoria-reforma','Artigo da mesma categoria mais recente não foi priorizado')
        check('simples-nacional-com-ibs-e-cbs-principais-decisoes-para-empresas' in refs[:3],'Segundo artigo da mesma categoria não foi priorizado')
        check(len(refs)==3 and len(set(refs))==3,'Relacionados duplicados ou quantidade incorreta')
        # draft técnico não pode entrar.
        post.write_text(fixture(draft=True)); build(repo)
        corpus=(repo/'dist/blog.html').read_text()+(repo/'dist/sitemap.xml').read_text()+(repo/'dist/feed.xml').read_text()
        check('artigo-v13-categoria-reforma' not in corpus,'Draft entrou em blog/sitemap/RSS')
        check(not (repo/'dist/blog/artigo-v13-categoria-reforma').exists(),'Diretório do draft permaneceu')

def validate_cleanup_text_cache():
    residuals=['GUIA-DE-PUBLICACAO.md','RELATORIO-FASE-1.md','build-blog-index.js','post.html','robots.txt','sitemap.xml','posts/index.json','posts/teste-titulo.md','posts/teste-2.md','posts/reforma-tributaria-2026-o-que-muda.md']
    for rel in residuals: check(not (REPO/rel).exists(),f'Resíduo antigo permanece na fonte: {rel}')
    check(not (DIST/'post.html').exists(),'post.html legado permanece em dist')
    redirects=(DIST/'_redirects').read_text()
    check('/post.html p=' in redirects,'Redirecionamento query dos artigos legados ausente')
    corpus='\n'.join(p.read_text(errors='ignore') for p in REPO.glob('*.html'))
    for phrase in ['30 anos de história','30 anos de excelência','De excelência em contabilidade','desonesto']:
        check(phrase.lower() not in corpus.lower(),f'Texto inadequado permanece: {phrase}')
    check('30 anos de experiência, 5 estrelas no Google' in (REPO/'index.html').read_text(),'Texto de autoridade não corrigido')
    expected='O investimento varia conforme o regime tributário, a quantidade de funcionários e a complexidade da operação. Por isso, cada proposta é preparada de acordo com a realidade da empresa.'
    check(expected in (REPO/'index.html').read_text() and expected in (REPO/'planos.html').read_text(),'Texto profissional de investimento ausente')
    headers=(DIST/'_headers').read_text()
    check('/assets/css/*\n  Cache-Control: public, max-age=31536000, immutable' in headers,'Cache immutable CSS ausente')
    check('/assets/js/*\n  Cache-Control: public, max-age=31536000, immutable' in headers,'Cache immutable JS ausente')
    check('/*\n  X-Robots-Tag: noindex, nofollow\n  Cache-Control: public, max-age=0, must-revalidate' in headers,'HTML de pré-lançamento não revalida/noindex')

    # Adendo V1.3 — navegação e links editoriais dos segmentos na Home.
    source_html=[p for p in REPO.glob('*.html')] + [REPO/'templates/blog.template.html']
    for page in source_html:
        text=page.read_text(errors='ignore')
        if '<nav aria-label="Menu principal"' in text:
            nav=re.search(r'<nav aria-label="Menu principal"[\s\S]*?</nav>',text)
            check(nav is not None and '<a href="/segmentos">Segmentos Atendidos</a>' in nav.group(0),f'Rótulo de navegação incorreto em {page.name}')
            check('<a href="/segmentos">Segmentos</a>' not in nav.group(0),f'Rótulo antigo Segmentos permanece no menu de {page.name}')
    home=(REPO/'index.html').read_text()
    segment_links={
        '/contabilidade-para-transportadoras':('Ver soluções para transportadoras →','transportadoras'),
        '/contabilidade-para-construcao-civil':('Ver soluções para construção civil →','civil'),
        '/contabilidade-para-clinicas-e-medicos':('Ver soluções para clínicas e médicos →','médicos'),
        '/contabilidade-para-prestadores-de-servico':('Ver soluções para prestadores de serviços →','serviços'),
    }
    for href,(label,tail) in segment_links.items():
        m=re.search(rf'<a class="seg__link" href="{re.escape(href)}">([\s\S]*?)</a>',home)
        check(m is not None,f'CTA editorial de segmento ausente: {href}')
        normalized=re.sub(r'<[^>]+>','',m.group(1)).replace('&nbsp;',' ').strip()
        check(normalized==label,f'Texto editorial divergente em {href}: {normalized!r}')
        check(f'<span class="seg__link-tail">{tail}&nbsp;→</span>' in m.group(1),f'Seta pode se separar da última palavra em {href}')
        check((DIST/(href.strip('/')+'.html')).exists(),f'Destino do CTA de segmento não foi publicado: {href}')
        check(not re.search(r'\brel="[^"]*(?:nofollow|sponsored|noopener)',m.group(0),re.I),f'Rel indevido em link interno de segmento: {href}')
    css=(REPO/'assets/css/styles.css').read_text()
    check('.seg--focus' in css and 'display:flex' in css and 'flex-direction:column' in css,'Cards de segmento não usam flex-column')
    check('.seg__link' in css and 'min-height:44px' in css and '.seg__link:focus-visible' in css,'CTA de segmento sem área/foco acessível')
    check('.seg__link-tail{white-space:nowrap}' in css,'Proteção de quebra da seta dos segmentos ausente')
    check('@media (max-width:560px)' in css and 'width:52px;height:52px' in css and 'font-size:0' in css,'WhatsApp mobile compacto não está definido')

def validate_runtime_consistency():
    nvm=REPO/'.nvmrc'
    check(nvm.exists(),'.nvmrc ausente')
    check(nvm.read_text().strip()=='22','.nvmrc deve conter exatamente 22')
    netlify=(REPO/'netlify.toml').read_text()
    check(re.search(r'NODE_VERSION\s*=\s*["\']22["\']',netlify) is not None,'netlify.toml não fixa NODE_VERSION=22')
    package=json.loads((REPO/'package.json').read_text())
    engine=str(package.get('engines',{}).get('node','')).strip()
    check(engine=='>=22',f'package.json deve exigir Node >=22, encontrado {engine!r}')
    sources={'nvmrc':nvm.read_text().strip(),'netlify':'22' if re.search(r'NODE_VERSION\s*=\s*["\']22["\']',netlify) else 'divergente','package':engine.removeprefix('>=')}
    check(len(set(sources.values()))==1,f'Versões Node divergentes: {sources}')

def main():
    build(); validate_runtime_consistency(); validate_fingerprints(); validate_blog_structure(); validate_related_dynamic(); validate_cleanup_text_cache(); build()
    print(f'APROVADO — {ASSERTIONS} verificações V1.3 de build/cache/blog/limpeza.')
    return 0
if __name__=='__main__':
    try: raise SystemExit(main())
    except Exception as exc:
        print(f'FALHA após {ASSERTIONS} verificações: {exc}',file=__import__('sys').stderr); raise
