#!/usr/bin/env python3
"""Auditoria E2E/visual V1.3 em Chromium headless. Sem servidor local e sem dependência no build Netlify."""
from __future__ import annotations
import argparse, base64, mimetypes, os, re
from pathlib import Path
from playwright.sync_api import sync_playwright

REPO=Path(__file__).resolve().parents[1]
DIST=REPO/'dist'
SHOT=REPO/'tests/screenshots-v13'
CHROMIUM=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium')
ASSERTIONS=0

def check(cond,msg):
    global ASSERTIONS; ASSERTIONS+=1
    if not cond: raise AssertionError(msg)

def data_uri(path:Path)->str:
    mime=mimetypes.guess_type(path.name)[0] or 'application/octet-stream'
    return f'data:{mime};base64,'+base64.b64encode(path.read_bytes()).decode()

def document(rel:str)->str:
    path=DIST/rel
    html=path.read_text(encoding='utf-8')
    css_ref=re.search(r'href="(/assets/css/styles\.[0-9a-f]{8}\.css)"',html)
    js_ref=re.search(r'src="(/assets/js/main\.[0-9a-f]{8}\.js)"',html)
    check(css_ref is not None and js_ref is not None,f'Assets fingerprinted ausentes em {rel}')
    css=(DIST/css_ref.group(1).lstrip('/')).read_text()
    js=(DIST/js_ref.group(1).lstrip('/')).read_text()
    html=re.sub(r'<link[^>]+href="/assets/css/styles\.[0-9a-f]{8}\.css"[^>]*>',lambda _:f'<style>{css}</style>',html)
    html=re.sub(r'<script[^>]+src="/assets/js/main\.[0-9a-f]{8}\.js"[^>]*></script>',lambda _:f'<script>{js}</script>',html)
    html=re.sub(r'<link[^>]+fonts\.(?:googleapis|gstatic)[^>]+>','',html)
    # Imagens locais viram data URI para a auditoria visual funcionar sem servidor HTTP.
    def img(m):
        ref=m.group(1); f=DIST/ref.lstrip('/')
        return f'src="{data_uri(f)}"' if f.is_file() else m.group(0)
    html=re.sub(r'src="(/assets/img/[^"]+)"',img,html)
    return html

def load(page,rel):
    page.set_content(document(rel),wait_until='domcontentloaded',timeout=15000)
    page.evaluate('window.scrollTo(0,0)')
    page.wait_for_timeout(100)

def dismiss_lgpd(page):
    lg=page.locator('#lgpd')
    if lg.count() and lg.is_visible():
        reject=page.locator('#lgpd-reject')
        if reject.count() and reject.is_visible(): reject.click()

def page_checks(page,label,width):
    metrics=page.evaluate('''() => ({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth,body:document.body.scrollWidth})''')
    check(metrics['sw']<=metrics['cw']+1,f'Overflow horizontal em {label} {width}px: {metrics}')
    check(metrics['body']<=metrics['cw']+1,f'Body overflow em {label} {width}px')
    h1=page.locator('h1').first
    check(h1.count()==1 and h1.is_visible(),f'H1 ausente/invisível em {label} {width}px')
    box=h1.bounding_box();check(box is not None and box['x']>=-1 and box['x']+box['width']<=width+1,f'H1 cortado em {label} {width}px')
    check(page.locator('footer.footer').count()==1,f'Footer ausente em {label}')
    check(page.locator('.header').count()==1,f'Header ausente em {label}')

def rects_overlap(a,b):
    if not a or not b: return False
    return not (a['x']+a['width'] <= b['x'] or b['x']+b['width'] <= a['x'] or a['y']+a['height'] <= b['y'] or b['y']+b['height'] <= a['y'])

def validate_mobile_whatsapp(page,label,width):
    if width>375: return
    wa=page.locator('.wa')
    check(wa.count()==1,f'WhatsApp flutuante ausente em {label} {width}px')
    check(wa.get_attribute('aria-label')=='Falar no WhatsApp',f'aria-label do WhatsApp incorreto em {label} {width}px')
    box=wa.bounding_box(); check(box is not None and 48<=box['width']<=56 and 48<=box['height']<=56,f'WhatsApp mobile deve medir aproximadamente 48–56px em {label} {width}px: {box}')
    styles=wa.evaluate("el=>({fontSize:getComputedStyle(el).fontSize,borderRadius:getComputedStyle(el).borderRadius})")
    check(styles['fontSize']=='0px',f'Texto WhatsApp ainda ocupa espaço visual em {label} {width}px')
    svg=wa.locator('svg').bounding_box(); check(svg is not None and svg['width']>=20 and svg['height']>=20,f'Ícone WhatsApp pequeno/invisível em {label} {width}px')
    overlaps=page.evaluate('''() => {
      const wa=document.querySelector('.wa'); if(!wa) return ['sem-wa']; const wr=wa.getBoundingClientRect();
      const sels='main h1,main h2,main h3,main p,main li,main .article-meta__text,main .post-card__meta,main .related-card__link';
      const hit=(r)=>r.width>4&&r.height>4&&r.bottom>0&&r.top<innerHeight&&!(r.right<=wr.left||wr.right<=r.left||r.bottom<=wr.top||wr.bottom<=r.top);
      const out=[];
      for(const el of document.querySelectorAll(sels)){
        const cs=getComputedStyle(el); if(el.classList.contains('sr-only')||cs.clip==='rect(0px, 0px, 0px, 0px)'||cs.visibility==='hidden'||cs.display==='none') continue;
        const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);
        let node,found=false;
        while((node=walker.nextNode())){
          if(!node.textContent.trim()) continue;
          const range=document.createRange(); range.selectNodeContents(node);
          if([...range.getClientRects()].some(hit)){found=true;break;}
        }
        if(found) out.push(el.textContent.trim().slice(0,80));
      }
      return out;
    }''')
    check(not overlaps,f'WhatsApp cobre texto essencial em {label} {width}px: {overlaps}')

def validate_article_mobile_overlap(page,width):
    if width>375: return
    wa=page.locator('.wa')
    targets=[('.article-meta__text','metadados/autoria'),('.related-articles__head','título Leia também')]
    for selector,name in targets:
        loc=page.locator(selector).first
        if loc.count():
            loc.evaluate("el=>el.scrollIntoView({block:'center'})"); page.wait_for_timeout(40)
            check(not rects_overlap(wa.bounding_box(),loc.bounding_box()),f'WhatsApp cobre {name} em artigo {width}px')
    cards=page.locator('.related-card h3')
    for i in range(cards.count()):
        loc=cards.nth(i); loc.evaluate("el=>el.scrollIntoView({block:'center'})"); page.wait_for_timeout(30)
        check(not rects_overlap(wa.bounding_box(),loc.bounding_box()),f'WhatsApp cobre título de Leia também #{i+1} em {width}px')

def test_visual(browser,widths,clean=False):
    SHOT.mkdir(parents=True,exist_ok=True)
    if clean:
        for old in SHOT.glob('*.png'): old.unlink()
    article=next((DIST/'blog').glob('*/index.html')).relative_to(DIST).as_posix()
    pages=[('home','index.html'),('blog','blog.html'),('artigo',article),('sobre','sobre.html'),('servicos','servicos.html'),('segmentos','segmentos.html'),('planos','planos.html'),('gestao','gestao-financeira.html'),('reforma','reforma-tributaria.html'),('contato','contato.html')]
    for width in widths:
        height=780 if width<=375 else 900
        page=browser.new_page(viewport={'width':width,'height':height})
        for label,rel in pages:
            load(page,rel);dismiss_lgpd(page);page_checks(page,label,width)
            if label=='blog':
                check(page.locator('.post-card--featured').count()==1,f'Destaque incorreto Blog {width}px')
                check(page.locator('#blog-list .post-card').count()==4,f'Cards regulares incorretos Blog {width}px')
                cards=page.locator('#blog-list .post-card')
                a,b=cards.nth(0).bounding_box(),cards.nth(1).bounding_box()
                if width>=768: check(abs(a['y']-b['y'])<4,f'Blog não está em 2 colunas em {width}px')
                if width<=375: check(b['y']>a['y']+a['height']-2,f'Blog não empilhou em {width}px')
            if label=='artigo':
                content=page.locator('.article-content').bounding_box();check(content is not None and content['width']<=900,f'Artigo largo demais em {width}px')
                check(page.locator('.article-aside').count()==0,'Sidebar Leia também voltou')
                check(page.locator('.related-articles').count()==1,'Seção Leia também ausente')
                check(page.locator('.related-card').count()==3,'Quantidade de relacionados incorreta')
            page.screenshot(path=str(SHOT/f'{label}-{width}.png'),full_page=False)
            validate_mobile_whatsapp(page,label,width)
            if label=='artigo': validate_article_mobile_overlap(page,width)
        page.close()
    for width in widths:
        check(len(list(SHOT.glob(f'*-{width}.png')))==10,f'Quantidade de screenshots divergente em {width}px')

def test_navigation_and_segments(browser):
    widths=[320,375,768,1024,1366,1440,1920]
    expected={
      'Ver soluções para transportadoras →':'/contabilidade-para-transportadoras',
      'Ver soluções para construção civil →':'/contabilidade-para-construcao-civil',
      'Ver soluções para clínicas e médicos →':'/contabilidade-para-clinicas-e-medicos',
      'Ver soluções para prestadores de serviços →':'/contabilidade-para-prestadores-de-servico',
    }
    for width in widths:
        page=browser.new_page(viewport={'width':width,'height':900 if width>375 else 780});load(page,'index.html');dismiss_lgpd(page)
        nav=page.locator('#nav')
        if width<=900:
            burger=page.locator('.burger');check(burger.count()==1,f'Burger ausente em {width}px');burger.click();check(nav.evaluate("el=>el.classList.contains('is-open')") or nav.is_visible(),f'Menu mobile não abriu em {width}px')
        item=nav.locator('a[href="/segmentos"]')
        check(item.count()==1,f'Item /segmentos duplicado/ausente em {width}px')
        check(item.inner_text().strip()=='Segmentos Atendidos',f'Rótulo Segmentos Atendidos incorreto em {width}px')
        if width<=900: check(item.is_visible(),f'Segmentos Atendidos invisível no menu mobile em {width}px')
        for label,href in expected.items():
            link=page.get_by_role('link',name=label,exact=True)
            check(link.count()==1,f'Link editorial ausente em {width}px: {label}')
            check(link.get_attribute('href')==href,f'URL editorial incorreta em {width}px: {label}')
            check((DIST/(href.strip('/')+'.html')).exists(),f'Destino não existe: {href}')
            link.scroll_into_view_if_needed();box=link.bounding_box();check(box is not None and box['width']>=44 and box['height']>=40,f'Área clicável pequena em {width}px: {label}')
            link.focus();check(link.evaluate('el=>document.activeElement===el'),f'Link de segmento não recebe foco em {width}px: {label}')
            tail=link.locator('.seg__link-tail');check(tail.count()==1,f'Proteção da seta ausente em {width}px: {label}')
            check(tail.evaluate("el=>getComputedStyle(el).whiteSpace")=='nowrap',f'Seta pode quebrar isolada em {width}px: {label}')
            tb=tail.bounding_box(); lb=link.bounding_box();check(tb is not None and lb is not None and tb['x']>=lb['x']-1 and tb['x']+tb['width']<=lb['x']+lb['width']+1,f'Tail do CTA excede o link em {width}px: {label}')
        segs=page.locator('.seg--focus');check(segs.count()==4,f'Quantidade de cards de segmento incorreta em {width}px')
        for i in range(segs.count()):
            b=segs.nth(i).bounding_box();check(b is not None and b['x']>=-1 and b['x']+b['width']<=width+1,f'Card de segmento cortado em {width}px')
        page.close()

def test_ctas(browser):
    cases=[
      ('a[data-lead-cta="diagnostico-gratuito"]','diagnostico-geral','diagnostico-gratuito','Não informado'),
      ('a[data-lead-cta="simular-impacto"]','reforma-tributaria','simular-impacto','Não informado'),
      ('a[data-lead-cta="fale-com-a-gente"]','contato-geral','fale-com-a-gente','Não informado'),
      ('a[data-lead-plan="smart"]','proposta-contabil','solicitar-proposta','Plano SMART'),
      ('a[data-lead-plan="advanced"]','proposta-contabil','solicitar-proposta','Plano ADVANCED'),
      ('a[data-lead-plan="exclusive"]','proposta-contabil','solicitar-proposta','Plano EXCLUSIVE'),
      ('a[data-lead-cta="conversar-contador"]','contato-geral','conversar-contador','Não informado'),
    ]
    for selector,interest,cta,plan in cases:
        page=browser.new_page(viewport={'width':1440,'height':900});load(page,'index.html');dismiss_lgpd(page)
        link=page.locator(selector).first;check(link.count()==1,f'CTA ausente: {selector}')
        link.scroll_into_view_if_needed();before=int(page.evaluate('window.scrollY'));link.click()
        check(page.locator('#diagnostico').get_attribute('aria-modal')=='true',f'Modal não abriu: {selector}')
        check(page.locator('#diagnostico').evaluate("el=>el.classList.contains('home-form-modal-open')"),f'Classe modal ausente: {selector}')
        check('#diagnostico' not in page.url,f'URL navegou para âncora: {selector}')
        body_top=page.evaluate("parseInt(document.body.style.top || '0',10)");check(abs(body_top+before)<=20,f'Posição não preservada: {selector}')
        vals=page.evaluate('''() => ({interest:document.querySelector('#form-diagnostico [name="interesse_codigo"]').value,cta:document.querySelector('#form-diagnostico [name="cta_codigo"]').value,plan:document.querySelector('#form-diagnostico [name="plano_interesse"]').value})''')
        check(vals['interest']==interest,f'Interesse incorreto: {selector}');check(vals['cta']==cta,f'CTA incorreto: {selector}');check(vals['plan']==plan,f'Plano incorreto: {selector}')
        check(page.locator('#form-diagnostico').count()==1,'Formulário visível clonado');check(page.locator('#home-form-close').evaluate('el=>document.activeElement===el'),'Foco não transferido ao modal')
        page.locator('#home-form-close').click();check(page.locator('#diagnostico').get_attribute('aria-modal')!='true',f'Modal não fechou: {selector}')
        after=int(page.evaluate('window.scrollY'));check(abs(after-before)<=20,f'Scroll mudou após fechar: {selector}')
        page.close()

def main():
    parser=argparse.ArgumentParser(description='Auditoria E2E/visual V1.3')
    parser.add_argument('--group',choices=('all','visual','navigation','ctas'),default='all')
    parser.add_argument('--widths',default='320,375,768,1024,1366,1440,1920',help='Larguras separadas por vírgula para o grupo visual')
    parser.add_argument('--clean-screenshots',action='store_true')
    args=parser.parse_args()
    widths=[int(x) for x in args.widths.split(',') if x.strip()]
    check(Path(CHROMIUM).exists(),f'Chromium não encontrado em {CHROMIUM}')
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True,executable_path=CHROMIUM,args=['--no-sandbox','--disable-gpu'])
        try:
            if args.group in ('all','visual'): test_visual(browser,widths,clean=args.clean_screenshots)
            if args.group in ('all','navigation'): test_navigation_and_segments(browser)
            if args.group in ('all','ctas'): test_ctas(browser)
        finally: browser.close()
    print(f'APROVADO — {ASSERTIONS} verificações E2E/visuais V1.3 no grupo {args.group}.')
    return 0
if __name__=='__main__':
    try: raise SystemExit(main())
    except Exception as exc:
        print(f'FALHA após {ASSERTIONS} verificações: {exc}',file=__import__('sys').stderr);raise
