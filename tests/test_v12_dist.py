#!/usr/bin/env python3
"""Suíte reproduzível V1.2: data, CMS, cache, entidades, indexação e dist."""
from __future__ import annotations

import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse

REPO = Path(__file__).resolve().parents[1]
DIST = REPO / "dist"
ASSERTIONS = 0
REFERENCE_DATE = "2026-08-06"


def check(condition: bool, message: str) -> None:
    global ASSERTIONS
    ASSERTIONS += 1
    if not condition:
        raise AssertionError(message)


def run_build(public: str | None = None, context: str | None = None, build_date: str | None = REFERENCE_DATE, expect_success: bool = True) -> subprocess.CompletedProcess[str]:
    env = os.environ.copy()
    if public is None: env.pop("PUBLIC_INDEXING", None)
    else: env["PUBLIC_INDEXING"] = public
    if context is None: env.pop("CONTEXT", None)
    else: env["CONTEXT"] = context
    if build_date is None: env.pop("BUILD_DATE", None)
    else: env["BUILD_DATE"] = build_date
    p = subprocess.run(["node", "scripts/build-site.js"], cwd=REPO, env=env, text=True, capture_output=True)
    if expect_success:
        check(p.returncode == 0, f"Build falhou ({public=}, {context=}, {build_date=}): {p.stderr or p.stdout}")
    else:
        check(p.returncode != 0, f"Build deveria falhar ({public=}, {context=}, {build_date=})")
    return p


def files_hash(base: Path) -> str:
    h = hashlib.sha256()
    for p in sorted(x for x in base.rglob("*") if x.is_file()):
        rel = p.relative_to(base).as_posix()
        h.update(rel.encode()); h.update(b"\0"); h.update(p.read_bytes()); h.update(b"\0")
    return h.hexdigest()


def source_hashes() -> dict[str, str]:
    roots = ["templates", "posts", "data", "config", "admin", "vendor"]
    files = [
        REPO / "scripts/build-site.js",
        REPO / "scripts/render_markdown.py",
        REPO / "scripts/build-date.js",
        REPO / "blog.html",
        REPO / "sobre.html",
        REPO / "politica-de-privacidade.html",
        REPO / "package.json",
        REPO / "package-lock.json",
        REPO / "netlify.toml",
    ]
    for root in roots:
        files += [p for p in (REPO / root).rglob("*") if p.is_file()]
    return {p.relative_to(REPO).as_posix(): hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(set(files))}


class IdParser(HTMLParser):
    def __init__(self):
        super().__init__(); self.ids=[]; self.forms=[]; self.current_form=None; self.inputs=[]
    def handle_starttag(self, tag, attrs):
        d=dict(attrs)
        if "id" in d: self.ids.append(d["id"])
        if tag == "form":
            self.current_form=d; self.forms.append(d)
        if tag in {"input","select","textarea"} and self.current_form is not None:
            self.inputs.append((self.current_form.get("name"), d.get("name")))
    def handle_endtag(self, tag):
        if tag == "form": self.current_form=None


def validate_public_allowlist() -> None:
    forbidden_ext={".md",".py",".log",".toml",".lock"}
    forbidden_dirs={"tests","scripts","templates","data","config","fixtures","node_modules",".git"}
    forbidden_names={"package.json","package-lock.json","netlify.toml","PENDENCIAS-DADOS-REAIS.md","build-info.json"}
    allowed_top_files={
        "404.html","_headers","_redirects","blog.html","contabilidade-para-clinicas-e-medicos.html",
        "contabilidade-para-construcao-civil.html","contabilidade-para-prestadores-de-servico.html",
        "contabilidade-para-transportadoras.html","contato.html","feed.xml","gestao-financeira.html",
        "index.html","planos.html","politica-de-privacidade.html","reforma-tributaria.html",
        "robots.txt","segmentos.html","servicos.html","sitemap.xml","sobre.html",
    }
    allowed_top_dirs={"admin","assets","blog"}
    allowed_suffixes={".html",".css",".js",".svg",".jpg",".jpeg",".png",".webp",".xml",".txt",".yml"}
    files=[p for p in DIST.rglob("*") if p.is_file()]
    check(bool(files), "dist vazio")
    for p in files:
        rel=p.relative_to(DIST)
        top=rel.parts[0]
        check(top in allowed_top_dirs or rel.as_posix() in allowed_top_files, f"Arquivo fora da allowlist pública: {rel}")
        check(not any(part in forbidden_dirs for part in rel.parts), f"Diretório interno publicado: {rel}")
        check(p.suffix.lower() not in forbidden_ext, f"Extensão interna publicada: {rel}")
        check(p.name not in forbidden_names, f"Arquivo interno publicado: {rel}")
        check(p.suffix.lower() in allowed_suffixes or p.name in {"_headers","_redirects"}, f"Tipo público não permitido: {rel}")
        check(not re.search(r"AUDITORIA|RELATORIO|CHECKLIST|PENDENCIAS|ROADMAP|CHANGELOG|MAPA-DE-", p.name, re.I), f"Documento interno publicado: {rel}")
    check(not any(p.suffix.lower()==".json" for p in files), "JSON público desnecessário foi publicado")



def validate_project_configuration() -> None:
    netlify=(REPO/"netlify.toml").read_text()
    package=json.loads((REPO/"package.json").read_text())
    lock=json.loads((REPO/"package-lock.json").read_text())
    cms=(REPO/"admin/config.yml").read_text()
    admin=(REPO/"admin/index.html").read_text()
    build=(REPO/"scripts/build-site.js").read_text()
    build_date=(REPO/"scripts/build-date.js").read_text()
    renderer=(REPO/"scripts/render_markdown.py").read_text()
    template=(REPO/"templates/blog.template.html").read_text()
    check('publish = "dist"' in netlify, "Netlify não publica dist")
    check('command = "node scripts/build-site.js"' in netlify, "Comando de build incorreto")
    check('NODE_VERSION = "22"' in netlify, "Node não fixado")
    check('PYTHON_VERSION = "3.12"' in netlify, "Python não fixado em 3.12")
    check(package["enterpriseBuild"]["markdownParser"]=="markdown-it-py", "Parser Markdown não documentado")
    check(package["enterpriseBuild"]["markdownParserVersion"]=="4.2.0", "Versão do parser divergente")
    check(package["enterpriseBuild"]["decapCmsVersion"]=="3.11.0", "Versão do Decap não documentada")
    check("@enterprise/markdown-renderer" in package.get("dependencies",{}), "Dependência vendorizada ausente")
    check("vendor/markdown-renderer" in lock.get("packages",{}), "Lockfile não registra o renderizador")
    check((REPO/"vendor/markdown-renderer/python/markdown_it").exists(), "markdown-it-py vendorizado ausente")
    check('backend:' in cms and 'name: git-gateway' in cms, "Git Gateway alterado")
    check('publish_mode: editorial_workflow' in cms, "Fluxo editorial não habilitado")
    check('name: "status"' not in cms and 'default: "draft"' not in cms, "CMS ainda expõe status manual")
    check('Use o fluxo editorial' in cms, "Ajuda do workflow ausente")
    check(all(not re.search(r'^status:',p.read_text(),re.M) for p in (REPO/'posts').glob('*.md')), "Artigo existente ainda contém status redundante")
    cms_urls=re.findall(r'<script[^>]+src="([^"]*decap-cms@[^"]+)"',admin)
    check(len(cms_urls)==1,"Script Decap ausente ou duplicado")
    check('@3.11.0/' in cms_urls[0],"Decap CMS não está fixado em 3.11.0")
    check(not re.search(r'@(latest|[~^])',cms_urls[0]),"Versão flutuante do Decap CMS")
    check('<!-- BLOG_CARDS_START -->' in template and '<!-- BLOG_CARDS_END -->' in template, "Marcadores do template ausentes")
    check("process.env.PUBLIC_INDEXING === 'true' && context === 'production'" in build, "Proteção de indexação por contexto ausente")
    check("fs.rmSync(dist" in build, "Build não limpa dist")
    check("validatePythonRuntime" in build and "Python 3.12 ou superior" in build, "Validação do Python ausente")
    check("getBuildDate" in build and "America/Sao_Paulo" in build_date, "Data dinâmica/fuso ausente")
    check("2026-08-06" not in build and "2026-08-06" not in build_date, "Data fixa permanece no código de produção")
    check("--json" in build and "renderMarkdownBatch" in build, "Renderização Markdown em lote ausente")
    check('MarkdownIt("commonmark"' in renderer and '"html": False' in renderer, "Markdown seguro não configurado")
    check("javascript:" in renderer and "ALLOWED_TAGS" in renderer, "Sanitização por allowlist ausente")
    check('\"priceRange\"' not in '\n'.join(p.read_text(errors='ignore') for p in REPO.glob('*.html')), 'priceRange ainda existe nas fontes HTML')
    check('FINGERPRINT_SOURCES' in build and 'createFingerprintAssets' in build, 'Fingerprinting não implementado no build')
    check('legacyPost' not in build, 'Arquitetura post.html legada permanece no build')


def validate_authority_and_entities() -> None:
    auth=json.loads((REPO/"data/authority.json").read_text())
    expected=[auth["organization"]["legalName"],auth["organization"]["cnpj"],auth["organization"]["crc"],auth["responsibleTechnical"]["name"],auth["responsibleTechnical"]["crc"],auth["privacy"]["email"]]
    for rel in ["sobre.html","index.html","politica-de-privacidade.html"]:
        text=(DIST/rel).read_text()
        check("undefined" not in text and "null" not in text, f"Valor vazio em {rel}")
    about=(DIST/"sobre.html").read_text()
    footer=(DIST/"index.html").read_text()
    privacy=(DIST/"politica-de-privacidade.html").read_text()
    for value in expected[:5]: check(value in about, f"Autoridade ausente em Sobre: {value}")
    for value in expected[:3]+expected[3:5]: check(value in footer, f"Autoridade ausente no rodapé: {value}")
    for value in [expected[0],expected[1],expected[5]]: check(value in privacy, f"Controlador/LGPD ausente: {value}")
    for value in ["30 anos","5,0","mais de 200 avaliações",auth["organization"]["googleBusinessProfileUrl"]]: check(value in about, f"Prova social ausente: {value}")
    check("fundada em 1996" not in about.lower() and "fundada há 30" not in about.lower(), "Ano de fundação inventado")
    all_html="\n".join(p.read_text(errors="ignore") for p in DIST.rglob("*.html"))
    check("AggregateRating" not in all_html, "AggregateRating indevido")
    check('"priceRange"' not in all_html, "priceRange indevido")
    check(f'{auth["organization"]["googleBusinessProfileUrl"]}' in all_html, "Google Business Profile ausente")
    check('rel="noopener noreferrer"' in about, "Link Google sem noopener/noreferrer")
    check("#organization" in all_html and "#website" in all_html and "#editorial-team" in all_html and "#fernando-de-medeiros-ewald" in about, "Entidades não separadas")
    for html_file in DIST.rglob("*.html"):
        text=html_file.read_text(errors="ignore")
        for raw in re.findall(r'<script type="application/ld\+json">([\s\S]*?)</script>',text):
            graph=json.loads(raw).get("@graph",[])
            refs=[]
            def walk(value):
                if isinstance(value,dict):
                    if value.get("@id")=="https://enterprisecontabilidade.com.br/#website": refs.append(value)
                    for child in value.values(): walk(child)
                elif isinstance(value,list):
                    for child in value: walk(child)
            walk(graph)
            if refs:
                definitions=[x for x in graph if isinstance(x,dict) and x.get("@id")=="https://enterprisecontabilidade.com.br/#website" and x.get("@type")=="WebSite"]
                check(len(definitions)==1,f"Entidade WebSite ausente ou duplicada em {html_file.relative_to(DIST)}")
                check(definitions[0].get("publisher",{}).get("@id")=="https://enterprisecontabilidade.com.br/#organization",f"Publisher do WebSite incorreto em {html_file.relative_to(DIST)}")
    for article in (DIST/"blog").glob("*/index.html"):
        s=article.read_text()
        check('"author":{"@id":"https://enterprisecontabilidade.com.br/#editorial-team"}' in s, f"Autor incorreto: {article}")
        check('"publisher":{"@id":"https://enterprisecontabilidade.com.br/#organization"}' in s, f"Publisher incorreto: {article}")
        check("Revisado por Fernando" not in s, f"Revisão individual inventada: {article}")


def validate_html_and_forms() -> None:
    for p in DIST.rglob("*.html"):
        parser=IdParser(); parser.feed(p.read_text())
        check(len(parser.ids)==len(set(parser.ids)), f"ID duplicado: {p.relative_to(DIST)}")
    index=(DIST/"index.html").read_text(); contact=(DIST/"contato.html").read_text()
    for name,html in [("diagnostico-home",index),("diagnostico-contato",contact)]:
        check(f'name="{name}"' in html, f"Formulário {name} ausente")
        check('data-netlify="true"' in html, f"Netlify ausente em {name}")
        check('name="form-name"' in html, f"form-name ausente em {name}")
        hp=re.search(r'netlify-honeypot="([^"]+)"',html)
        check(bool(hp), f"Honeypot ausente em {name}")
        if hp: check(f'name="{hp.group(1)}"' in html, f"Campo honeypot divergente em {name}")
        check('name="consentimento"' in html, f"Consentimento ausente em {name}")
    # formulários ocultos da Netlify e 37 campos homologados
    check(index.count('hidden="" name="diagnostico-home"') >= 1 or 'hidden name="diagnostico-home"' in index, "Formulário oculto home ausente")
    check(index.count('hidden="" name="diagnostico-contato"') >= 1 or 'hidden name="diagnostico-contato"' in index, "Formulário oculto contato ausente")
    expected=set(re.findall(r'<(?:input|select|textarea)[^>]+name="([^"]+)"', re.search(r'<form(?=[^>]*name="diagnostico-home")(?=[^>]*\shidden(?:=|\s|>))[^>]*>([\s\S]*?)</form>', index).group(1)))
    check(len(expected)==37, f"Formulário oculto deveria ter 37 campos, encontrou {len(expected)}")
    visible=set(re.findall(r'<(?:input|select|textarea)[^>]+name="([^"]+)"', re.search(r'<form[^>]+id="form-diagnostico"[\s\S]*?</form>', index).group(0)))
    check(expected==visible, "Campos visíveis e ocultos de diagnostico-home divergem")


def validate_blog_geo_content() -> None:
    articles=list((DIST/"blog").glob("*/index.html"))
    check(len(articles)==5, f"Esperados 5 artigos, encontrados {len(articles)}")
    sitemap=(DIST/"sitemap.xml").read_text(); feed=(DIST/"feed.xml").read_text(); blog=(DIST/"blog.html").read_text()
    check(not (DIST/"posts/index.json").exists(), "Índice JSON desnecessário foi publicado")
    check(not (DIST/"build-info.json").exists(), "Metadado interno de build foi publicado")
    for p in articles:
        slug=p.parent.name; html=p.read_text()
        check('id="resposta-direta"' in html and "Em resumo" in html, f"Bloco GEO ausente: {slug}")
        check(html.count('id="fontes-oficiais"')==1, f"Seção de fontes incorreta: {slug}")
        check(f"/blog/{slug}/" in sitemap, f"Artigo fora do sitemap: {slug}")
        check(f"/blog/{slug}/" in feed, f"Artigo fora do RSS: {slug}")
        check(f"/blog/{slug}/" in blog, f"Artigo fora da listagem: {slug}")
        check('<script>alert(' not in html, f"Script arbitrário renderizado: {slug}")
        check('javascript:' not in html.lower(), f"URL javascript renderizada: {slug}")
    aug=(DIST/"blog/ibs-cbs-o-que-as-empresas-precisam-preparar-para-a-transicao/index.html").read_text()
    for term in ["3 de agosto de 2026","1%","0,1% de IBS","0,9% de CBS","regime regular","notas técnicas","Simples Nacional"]:
        check(term in aug, f"Atualização tributária ausente: {term}")
    # lastmod editorial
    for date in re.findall(r"<lastmod>([^<]+)</lastmod>",sitemap):
        check(bool(re.fullmatch(r"\d{4}-\d{2}-\d{2}",date)), f"lastmod inválido: {date}")
        check(date<=REFERENCE_DATE, f"lastmod futuro: {date}")
    check("mtime" not in (REPO/"scripts/build-site.js").read_text(), "Build ainda usa mtime")


def validate_content_revisions() -> None:
    corpus="\n".join(p.read_text(errors="ignore") for p in DIST.rglob("*.html"))
    banned=["A maioria dos empresários já pagava imposto a mais antes da Reforma","É exatamente isso que o nosso diagnóstico gratuito calcula","Praticamente nenhum.","Empresa com o financeiro bagunçado vai perder crédito","para parar de pagar imposto a mais"]
    for phrase in banned: check(phrase not in corpus, f"Conteúdo absoluto remanescente: {phrase}")
    check("Muitas empresas possuem oportunidades de revisão tributária" in corpus, "Redação defensável da home ausente")
    check("pode aumentar o risco de falhas documentais" in corpus, "Redação defensável do BPO ausente")


def validate_redirects_and_404() -> None:
    redirects=(DIST/"_redirects").read_text().splitlines()
    check(any("www.enterprisecontabilidade.com.br" in x and "301" in x for x in redirects), "Redirect www ausente")
    for old,new in json.loads((REPO/"config/site.config.json").read_text())["legacyPages"].items():
        check(any(x.startswith(f"{old} {new} 301") for x in redirects), f"Redirect legado ausente: {old}")
    check(not (DIST/"post.html").exists(), "post.html legado foi publicado")
    check(any(line.startswith('/post.html p=') and ' 301!' in line for line in redirects), "Redirects dos links post.html?p=slug ausentes")
    check((DIST/"404.html").exists(), "404 ausente")
    e=(DIST/"404.html").read_text(); check('noindex, follow' in e, "404 sem noindex, follow")
    check(not any(re.match(r"/\*\s+/.+\s+200",x) for x in redirects), "Catch-all 200 indevido")
    check(len(redirects)==len(set(redirects)), "Redirects duplicados")


def node_eval(code: str, env: dict[str,str] | None = None) -> subprocess.CompletedProcess[str]:
    merged=os.environ.copy(); merged.update(env or {})
    return subprocess.run(["node","-e",code],cwd=REPO,env=merged,text=True,capture_output=True)


def validate_dynamic_dates() -> None:
    module="./scripts/build-date"
    for value in ["2026-08-05","2026-08-06","2026-08-07"]:
        p=node_eval(f"console.log(require('{module}').getBuildDate({{BUILD_DATE:'{value}'}},new Date('2000-01-01T00:00:00Z')))" )
        check(p.returncode==0 and p.stdout.strip()==value,f"BUILD_DATE válida rejeitada: {value}")
    for value in ["2026-02-30","06-08-2026","2026-8-06","texto"]:
        p=node_eval(f"require('{module}').getBuildDate({{BUILD_DATE:'{value}'}},new Date())")
        check(p.returncode!=0,f"BUILD_DATE inválida aceita: {value}")
    p=node_eval(f"console.log(require('{module}').formatDateInTimeZone(new Date('2026-08-07T01:30:00Z')))" )
    check(p.returncode==0 and p.stdout.strip()=="2026-08-06","Meia-noite UTC alterou indevidamente a data brasileira")
    p=node_eval(f"console.log(require('{module}').formatDateInTimeZone(new Date('2026-08-07T03:30:00Z')))" )
    check(p.returncode==0 and p.stdout.strip()=="2026-08-07","Virada real do dia em São Paulo não reconhecida")
    p=node_eval(f"console.log(require('{module}').getBuildDate({{}},new Date('2026-08-07T01:30:00Z')))" )
    check(p.returncode==0 and p.stdout.strip()=="2026-08-06","Fallback sem variável não usa São Paulo")
    p=node_eval(f"console.log(require('{module}').getBuildDate())",env={"TZ":"UTC"})
    expected=subprocess.run(["date","+%F"],env={**os.environ,"TZ":"America/Sao_Paulo"},text=True,capture_output=True).stdout.strip()
    check(p.returncode==0 and p.stdout.strip()==expected,"Data atual sem BUILD_DATE diverge de America/Sao_Paulo")


def parse_header_rules(text: str) -> dict[str,dict[str,str]]:
    rules={}; current=None
    for line in text.splitlines():
        if line and not line.startswith((' ','	')):
            current=line.strip(); rules[current]={}
        elif current and ':' in line:
            key,value=line.strip().split(':',1); rules[current][key.strip()]=value.strip()
    return rules


def effective_cache(path: str, rules: dict[str,dict[str,str]]) -> str | None:
    import fnmatch
    matched=[]
    for pattern,headers in rules.items():
        normalized=pattern.replace('/*','/**') if pattern.endswith('/*') else pattern
        if fnmatch.fnmatch(path,normalized) or pattern=='/*':
            if 'Cache-Control' in headers: matched.append((len(pattern.replace('*','')),headers['Cache-Control']))
    return sorted(matched,key=lambda x:x[0])[-1][1] if matched else None


def validate_cache_rules() -> None:
    rules=parse_header_rules((DIST/'_headers').read_text())
    immediate='public, max-age=0, must-revalidate'; moderate='public, max-age=3600, must-revalidate'; image='public, max-age=86400, must-revalidate'
    for path in ['/', '/sobre', '/blog', '/blog/artigo/', '/sitemap.xml', '/feed.xml']:
        check(effective_cache(path,rules)==immediate,f"Cache HTML/XML incorreto para {path}: {effective_cache(path,rules)}")
    fingerprinted='public, max-age=31536000, immutable'
    css_files=list((DIST/'assets/css').glob('styles.*.css')); js_files=list((DIST/'assets/js').glob('main.*.js'))
    check(len(css_files)==1 and len(js_files)==1, 'Assets fingerprinted ausentes ou duplicados')
    for path in ['/'+css_files[0].relative_to(DIST).as_posix(), '/'+js_files[0].relative_to(DIST).as_posix()]:
        check(effective_cache(path,rules)==fingerprinted,f"Cache fingerprinted incorreto para {path}")
    check(effective_cache('/assets/img/og-enterprise-1200x630.jpg',rules)==image,"Cache da imagem social incorreto")


def validate_indexing_matrix() -> None:
    matrix=[
      ("false","production",False),("true","production",True),("false","deploy-preview",False),
      ("true","deploy-preview",False),("true","branch-deploy",False),("true","dev",False),
      ("true",None,False),(None,"production",False),
    ]
    for public,context,indexable in matrix:
        run_build(public,context)
        robots=(DIST/"robots.txt").read_text(); headers=(DIST/"_headers").read_text()
        if indexable:
            check("Allow: /" in robots and "Sitemap:" in robots, "Produção não liberou sitemap")
            check("X-Robots-Tag" not in parse_header_rules(headers).get("/*",{}), "Produção manteve noindex global")
        else:
            check("Disallow: /" in robots and "Sitemap:" not in robots, "Homologação indexável")
            check("X-Robots-Tag: noindex, nofollow" in headers, "Homologação sem X-Robots-Tag")
        check("/admin/*" in headers and "noindex, nofollow" in headers, "Admin sem noindex")
        check("/404.html" in headers and "noindex, follow" in headers, "404 sem header específico")


def main() -> int:
    before=source_hashes()
    # limpeza e build base
    DIST.mkdir(exist_ok=True); (DIST/"arquivo-obsoleto.txt").write_text("stale")
    run_build("false","deploy-preview")
    check(not (DIST/"arquivo-obsoleto.txt").exists(), "Build não limpou dist anterior")
    first=files_hash(DIST); run_build("false","deploy-preview"); second=files_hash(DIST)
    check(first==second, "Dois builds idênticos produziram saída diferente")
    check(before==source_hashes(), "Build alterou arquivos-fonte")
    validate_public_allowlist(); validate_project_configuration(); validate_authority_and_entities(); validate_html_and_forms(); validate_blog_geo_content(); validate_content_revisions(); validate_redirects_and_404(); validate_dynamic_dates(); validate_cache_rules(); validate_indexing_matrix()
    # restaura saída segura para inspeção
    run_build("false","deploy-preview")
    check(before==source_hashes(), "Testes alteraram arquivos-fonte")
    print(f"APROVADO — {ASSERTIONS} verificações do build público V1.2.")
    return 0


if __name__=="__main__":
    try: raise SystemExit(main())
    except Exception as exc:
        print(f"FALHA após {ASSERTIONS} verificações: {exc}",file=sys.stderr)
        raise
