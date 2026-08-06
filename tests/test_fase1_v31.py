#!/usr/bin/env python3
"""Testes reproduzíveis da Fase 1 V3.1 — modal, LGPD e refinamento da home."""
from __future__ import annotations

import argparse
import os
import re
import subprocess
import sys
from pathlib import Path
from urllib.parse import parse_qs, unquote

from playwright.sync_api import Browser, Page, sync_playwright

REPO = Path(__file__).resolve().parents[1]
ROOT = Path(os.environ.get("SITE_ROOT", REPO / "dist"))
CHROMIUM = os.environ.get("CHROMIUM_PATH", "/usr/bin/chromium")
ASSERTIONS = 0


def check(condition: bool, message: str) -> None:
    global ASSERTIONS
    ASSERTIONS += 1
    if not condition:
        raise AssertionError(message)


def site_document(filename: str = "index.html", fetch_mode: str = "success") -> str:
    html = (ROOT / filename).read_text(encoding="utf-8")
    css = (ROOT / "assets/css/styles.css").read_text(encoding="utf-8")
    js = (ROOT / "assets/js/main.js").read_text(encoding="utf-8")
    mock_fetch = f"""
<script>
window.__fetchMode = {fetch_mode!r};
window.__fetchBodies = [];
window.__pendingResolve = null;
window.fetch = function (url, options) {{
  window.__fetchBodies.push((options && options.body) || '');
  if (window.__fetchMode === 'pending') {{
    return new Promise(function (resolve) {{
      window.__pendingResolve = function (ok) {{
        resolve({{ ok: ok !== false, status: ok === false ? 500 : 200 }});
        window.__pendingResolve = null;
      }};
    }});
  }}
  var ok = window.__fetchMode === 'success';
  return Promise.resolve({{ ok: ok, status: ok ? 200 : 500 }});
}};
</script>
"""
    html = re.sub(r'<link[^>]+href="/?assets/css/styles\.css"[^>]*>', lambda _m: f"<style>{css}</style>", html)
    html = re.sub(r'<script[^>]+src="/?assets/js/main\.js"[^>]*></script>', lambda _m: mock_fetch + f"<script>{js}</script>", html)
    html = re.sub(
        r'<script src="https://identity\.netlify\.com[^>]*></script>\s*<script>.*?</script>',
        "",
        html,
        flags=re.S,
    )
    html = re.sub(r'<link[^>]+fonts\.(?:googleapis|gstatic)[^>]+>', "", html)
    return html


def new_page(browser: Browser, width: int = 1440, height: int = 900, hide_lgpd: bool = True, fetch_mode: str = "success") -> Page:
    page = browser.new_page(viewport={"width": width, "height": height})
    page.set_default_timeout(8000)
    page.set_content(site_document(fetch_mode=fetch_mode), wait_until="domcontentloaded", timeout=8000)
    if hide_lgpd and page.locator("#lgpd").get_attribute("data-show") == "true":
        page.locator("#lgpd-reject").click()
    return page


def modal_is_open(page: Page) -> bool:
    return page.locator("#diagnostico").get_attribute("aria-modal") == "true"


def field(page: Page, name: str) -> str:
    return page.locator(f'#form-diagnostico [name="{name}"]').input_value()


def parse_body(body: str) -> dict[str, str]:
    parsed = parse_qs(body, keep_blank_values=True)
    return {key: values[-1] for key, values in parsed.items()}


def context_snapshot(page: Page) -> dict:
    return page.evaluate(
        """() => ({
          interest: document.querySelector('#form-diagnostico [name="interesse_codigo"]').value,
          cta: document.querySelector('#form-diagnostico [name="cta_codigo"]').value,
          ctaText: document.querySelector('#form-diagnostico [name="cta_texto"]').value,
          service: document.querySelector('#form-diagnostico [name="servico_interesse"]').value,
          plan: document.querySelector('#form-diagnostico [name="plano_interesse"]').value,
          lead: document.querySelector('#form-diagnostico [name="lead_id"]').value,
          title: document.getElementById('home-form-title').textContent.trim(),
          intro: document.getElementById('home-form-intro').textContent.trim(),
          button: document.getElementById('home-submit').textContent.trim(),
          summary: document.querySelector('#form-diagnostico [name="resumo_comercial"]').value,
          approach: document.querySelector('#form-diagnostico [name="abordagem_sugerida"]').value,
          planSummary: document.getElementById('home-interest-summary').textContent.trim(),
          planSummaryHidden: document.getElementById('home-interest-summary').hidden
        })"""
    )


def fill_required_home(page: Page, name: str = "Fernando Teste") -> None:
    page.locator("#nome").fill(name)
    page.locator("#whatsapp").fill("(21) 99999-9999")
    page.locator("#email").fill("teste@enterprise.com.br")
    page.locator("#segmento").select_option(label="Prestadores de serviço em geral")
    page.locator('#form-diagnostico [name="consentimento"]').check()


def open_cta(page: Page, selector: str) -> tuple[int, int]:
    link = page.locator(selector).first
    link.scroll_into_view_if_needed()
    before = int(page.evaluate("window.scrollY"))
    link.evaluate("el => el.click()")
    check(modal_is_open(page), f"Modal não abriu para {selector}")
    page.locator("#home-form-close").wait_for(state="visible")
    page.wait_for_function("document.activeElement && document.activeElement.id === 'home-form-close'")
    body_top = page.evaluate("parseInt(document.body.style.top || '0', 10)")
    check(abs(body_top + before) <= 20, f"Posição da página não foi preservada para {selector}")
    return before, body_top


def close_x(page: Page) -> None:
    page.locator("#home-form-close").click()
    check(not modal_is_open(page), "Modal não fechou pelo X")


def test_static_regression() -> None:
    html_files = sorted(ROOT.glob("*.html"))
    index = (ROOT / "index.html").read_text(encoding="utf-8")
    js = (ROOT / "assets/js/main.js").read_text(encoding="utf-8")
    css = (ROOT / "assets/css/styles.css").read_text(encoding="utf-8")

    contact_links: list[str] = []
    for path in html_files:
        contact_links.extend(re.findall(r'href="(/contato[^\"]*)"', path.read_text(encoding="utf-8")))
    check(len(contact_links) == 67, "Quantidade de links contextualizados para /contato mudou")
    check(all("interesse=" in href and "origem=" in href and "cta=" in href for href in contact_links), "Link de contato perdeu contexto")
    check(index.count('href="#diagnostico"') == 7 and index.count('data-lead-interest=') >= 7, "Quantidade de CTAs internos mudou")
    check(index.count('id="form-diagnostico"') == 1, "Formulário visível da home foi duplicado")
    check(index.count('id="diagnostico"') == 1, "ID diagnostico foi duplicado")
    check(len(re.findall(r'<form\b[^>]*name="diagnostico-home"', index)) == 2, "Formulário Netlify da home foi alterado")
    check(len(re.findall(r'<form\b[^>]*name="diagnostico-contato"', index)) == 1, "Formulário oculto de contato foi alterado")

    for name in ("diagnostico-home", "diagnostico-contato"):
        forms = re.findall(r'<form\b[^>]*name="' + re.escape(name) + r'"[^>]*>(.*?)</form>', index, re.S)
        for form in forms:
            names = set(re.findall(r'name="([^"]+)"', form))
            check(len(names) == 37, f"{name} não preservou os 37 campos")

    check('id="home-form-optional"' in index and '<details class="home-form-optional"' in index, "Área opcional acessível ausente")
    check('id="regime" name="regime" required' not in index, "Regime permaneceu obrigatório na home")
    check(".finally(" not in js, "Falso sucesso via finally reapareceu")
    check("window.open(" not in js, "Abertura automática de janela reapareceu")
    check("form.cloneNode" not in js and "cloneNode(" not in js, "Formulário foi clonado")
    check("if (!open || state.submitting) return false;" in js, "Fechamento central não está protegido por state.submitting")
    check("if (state.submitting) return false;" in js, "Abertura/troca de contexto não está protegida")
    check("form.setAttribute('aria-busy', 'true')" in js and "form.removeAttribute('aria-busy')" in js, "aria-busy não foi implementado")
    check("closeButton.disabled = pending" in js, "Botão de fechar não acompanha o estado de envio")
    check("lgpd--modal-hidden" in js and "lgpd--modal-hidden" in css, "Integração temporária do banner LGPD ausente")
    check("body-modal-has-lgpd" not in js + css and "home-modal-bottom-offset" not in js + css, "Código morto da convivência modal/LGPD permaneceu")
    check("align-items:start" in css and ".hero{position:relative" in css, "Correção estrutural da hero ausente")
    check("home-form-primary-grid" in index + css, "Grade compacta da home ausente")
    check("form-whatsapp--secondary" in index + css, "Hierarquia secundária do WhatsApp ausente")
    check("Continuar agora pelo WhatsApp" in js, "Estado de WhatsApp após sucesso ausente")
    check("Nome: ' + (data.nome" in js, "Compatibilidade da mensagem da página de contato foi removida")
    check("includeName: false" in js, "WhatsApp da home ainda pode incluir o nome")
    check("Seguimentos Atendidos" not in "\n".join(p.read_text(encoding="utf-8") for p in html_files), "Erro ortográfico reapareceu")

    missing: list[str] = []
    for path in html_files:
        text = path.read_text(encoding="utf-8")
        for attr in re.findall(r'(?:href|src)="([^"]+)"', text):
            if attr.startswith(("http://", "https://", "mailto:", "tel:", "#", "data:")):
                continue
            clean = attr.split("#", 1)[0].split("?", 1)[0]
            if not clean or any(token in clean for token in ("'", '"', "+", "$", "{", "}")):
                continue
            if clean.startswith('/'):
                route = clean.lstrip('/')
                if not route:
                    continue
                candidates = [ROOT / route, ROOT / (route + '.html'), ROOT / route / 'index.html']
                if not any(candidate.exists() for candidate in candidates):
                    missing.append(f"{path.name}: {clean}")
            elif not (path.parent / clean).resolve().exists():
                missing.append(f"{path.name}: {clean}")
    check(not missing, "Referências locais ausentes: " + ", ".join(missing[:5]))


def test_cta_contexts(browser: Browser) -> None:
    cases = [
        ('a[data-lead-cta="diagnostico-gratuito"]', "diagnostico-geral", "diagnostico-gratuito", "Quero meu diagnóstico gratuito", "Contabilidade", "Não informado", "Vamos entender o cenário da sua empresa", "Solicitar avaliação"),
        ('a[data-lead-cta="simular-impacto"]', "reforma-tributaria", "simular-impacto", "Simular o impacto na minha empresa", "Reforma Tributária", "Não informado", "Vamos avaliar como a Reforma Tributária pode afetar sua empresa", "Solicitar avaliação tributária"),
        ('a[data-lead-cta="fale-com-a-gente"]', "contato-geral", "fale-com-a-gente", "fale com a gente", "Contabilidade", "Não informado", "Conte o básico sobre a sua empresa", "Enviar solicitação"),
        ('a[data-lead-plan="smart"]', "proposta-contabil", "solicitar-proposta", "Solicitar proposta", "Contabilidade", "Plano SMART", "Vamos preparar uma proposta adequada ao seu negócio", "Solicitar proposta"),
        ('a[data-lead-plan="advanced"]', "proposta-contabil", "solicitar-proposta", "Solicitar proposta", "Contabilidade", "Plano ADVANCED", "Vamos preparar uma proposta adequada ao seu negócio", "Solicitar proposta"),
        ('a[data-lead-plan="exclusive"]', "proposta-contabil", "solicitar-proposta", "Solicitar proposta", "Contabilidade", "Plano EXCLUSIVE", "Vamos preparar uma proposta adequada ao seu negócio", "Solicitar proposta"),
        ('a[data-lead-cta="conversar-contador"]', "contato-geral", "conversar-contador", "Conversar com um contador", "Contabilidade", "Não informado", "Conte o básico sobre a sua empresa", "Enviar solicitação"),
    ]
    for selector, interest, cta, cta_text, service, plan, title, button in cases:
        page = new_page(browser)
        open_cta(page, selector)
        snap = context_snapshot(page)
        check(snap["interest"] == interest, f"Interesse incorreto em {selector}")
        check(snap["cta"] == cta, f"CTA incorreto em {selector}")
        check(snap["ctaText"] == cta_text, f"Texto do CTA incorreto em {selector}")
        check(snap["service"] == service, f"Serviço incorreto em {selector}")
        check(snap["plan"] == plan, f"Plano incorreto em {selector}")
        check(snap["title"] == title, f"Título incorreto em {selector}")
        check(snap["button"] == button, f"Botão incorreto em {selector}")
        check(bool(snap["summary"]), f"Resumo comercial vazio em {selector}")
        check(bool(snap["approach"]), f"Abordagem sugerida vazia em {selector}")
        if plan != "Não informado":
            check(snap["planSummary"] == f"Interesse informado: {plan}", f"Resumo do plano incorreto em {selector}")
            check(not snap["planSummaryHidden"], f"Resumo do plano oculto em {selector}")
        check(page.locator("#home-form-close").is_visible(), f"Fechar não visível em {selector}")
        check(page.evaluate("document.activeElement.id") == "home-form-close", f"Foco inicial incorreto em {selector}")
        check(page.locator("#form-diagnostico .form-whatsapp").is_visible(), f"WhatsApp secundário ausente em {selector}")
        close_x(page)
        page.close()


def test_pending_fetch_protection(browser: Browser) -> None:
    page = new_page(browser, fetch_mode="pending")
    open_cta(page, 'a[data-lead-cta="simular-impacto"]')
    fill_required_home(page, "Envio Pendente")
    before = context_snapshot(page)
    page.locator("#home-submit").click()
    page.locator('#form-diagnostico[aria-busy="true"]').wait_for(state="attached")
    check(page.locator("#home-form-close").is_disabled(), "Fechar não foi desabilitado durante envio")
    check(page.locator("#home-submit").is_disabled(), "Botão principal não foi desabilitado durante envio")
    check(page.locator("#home-submit").inner_text().strip() == "Enviando...", "Texto de envio incorreto")
    check(len(page.evaluate("window.__fetchBodies")) == 1, "Primeiro fetch não foi iniciado")

    page.locator("#home-form-close").evaluate("el => el.click()")
    page.keyboard.press("Escape")
    page.locator("#home-form-backdrop").evaluate("el => el.click()")
    page.locator('a[data-lead-plan="advanced"]').evaluate("el => el.click()")
    page.locator("#home-submit").evaluate("el => el.click()")

    pending = context_snapshot(page)
    check(modal_is_open(page), "Modal fechou durante fetch pendente")
    check(page.locator("#form-diagnostico").get_attribute("aria-busy") == "true", "aria-busy foi removido antes da resolução")
    check(page.locator("#form-diagnostico").get_attribute("data-submitting") == "true", "Estado observável de envio foi removido")
    check(page.locator("#home-form-close").is_disabled(), "Fechar foi reabilitado antes da resolução")
    check(page.locator("#home-submit").is_disabled(), "Botão foi reabilitado antes da resolução")
    check(page.locator("#home-submit").inner_text().strip() == "Enviando...", "Texto de envio mudou durante a Promise")
    check(pending["interest"] == "reforma-tributaria", "Interesse mudou durante envio")
    check(pending["plan"] == "Não informado", "Plano mudou durante envio")
    check(pending["lead"] == before["lead"], "lead_id mudou durante envio")
    check(pending["title"] == before["title"], "Título mudou durante envio")
    check(len(page.evaluate("window.__fetchBodies")) == 1, "Segundo envio foi iniciado durante a Promise")

    page.evaluate("window.__pendingResolve(true)")
    page.locator("#form-msg-home.form-msg--success").wait_for(state="visible")
    after = context_snapshot(page)
    check(after["interest"] == "reforma-tributaria", "Sucesso foi associado a outro interesse")
    check(after["title"] == "Vamos avaliar como a Reforma Tributária pode afetar sua empresa", "Título de Reforma não foi preservado")
    check(page.locator("#form-diagnostico").get_attribute("aria-busy") is None, "aria-busy permaneceu após sucesso")
    check(not page.locator("#home-form-close").is_disabled(), "Fechar permaneceu desabilitado após sucesso")
    close_x(page)

    open_cta(page, 'a[data-lead-plan="advanced"]')
    fresh = context_snapshot(page)
    check(fresh["lead"] != before["lead"], "Novo lead_id não foi criado após sucesso")
    check(fresh["interest"] == "proposta-contabil" and fresh["plan"] == "Plano ADVANCED", "Contexto ADVANCED não foi aplicado após sucesso")
    check(page.locator("#nome").input_value() == "", "Formulário não foi limpo após sucesso")
    check(page.locator("#home-submit").inner_text().strip() == "Solicitar proposta", "Botão não foi restaurado para ADVANCED")
    page.close()


def test_lgpd_integration(browser: Browser) -> None:
    page = new_page(browser, width=1024, height=900, hide_lgpd=False)
    banner = page.locator("#lgpd")
    check(banner.get_attribute("data-show") == "true", "Banner LGPD não iniciou pendente")
    check(banner.is_visible(), "Banner LGPD não estava visível antes do modal")
    before_aria = banner.get_attribute("aria-hidden")
    before_inert = page.evaluate("document.getElementById('lgpd').inert === true")

    open_cta(page, 'a[data-lead-cta="simular-impacto"]')
    check(not banner.is_visible(), "Banner LGPD permaneceu visível com o modal")
    check(banner.get_attribute("aria-hidden") == "true", "Banner LGPD não recebeu aria-hidden")
    check(page.evaluate("!('inert' in document.getElementById('lgpd')) || document.getElementById('lgpd').inert === true"), "Banner LGPD não recebeu inert")
    for _ in range(18):
        page.keyboard.press("Tab")
        check(page.evaluate("document.getElementById('diagnostico').contains(document.activeElement)"), "Foco escapou para fora do modal")

    close_x(page)
    check(banner.is_visible(), "Banner LGPD não reapareceu após fechar modal")
    check(banner.get_attribute("data-show") == "true", "Decisão LGPD foi gravada automaticamente")
    check(banner.get_attribute("aria-hidden") == before_aria, "aria-hidden anterior do banner não foi restaurado")
    check(page.evaluate("document.getElementById('lgpd').inert === true") == before_inert, "Estado inert anterior não foi restaurado")
    check(page.locator("#lgpd-accept").is_visible(), "Aceitar não voltou a ficar acessível")
    check(page.locator("#lgpd-reject").is_visible(), "Recusar não voltou a ficar acessível")
    check(page.locator('#lgpd a[href="/politica-de-privacidade"]').is_visible(), "Saiba mais não voltou a ficar acessível")
    page.close()


def test_hero_first_fold(browser: Browser) -> None:
    for width in (320, 375, 768, 1024, 1366, 1440, 1920):
        page = new_page(browser, width=width, height=900)
        metrics = page.evaluate(
            """() => {
              const header = document.querySelector('.header').getBoundingClientRect();
              const eyebrow = document.querySelector('.hero .eyebrow').getBoundingClientRect();
              const title = document.querySelector('.hero h1').getBoundingClientRect();
              const cta = document.querySelector('.hero__cta a').getBoundingClientRect();
              const form = document.getElementById('diagnostico').getBoundingClientRect();
              return {headerBottom:header.bottom, eyebrowTop:eyebrow.top, titleTop:title.top, ctaTop:cta.top,
                formTop:form.top, pageWidth:document.documentElement.scrollWidth, innerWidth:innerWidth};
            }"""
        )
        offset = metrics["eyebrowTop"] - metrics["headerBottom"]
        check(65 <= offset <= 115, f"Espaçamento inicial desequilibrado em {width}px: {offset}")
        check(metrics["titleTop"] > metrics["eyebrowTop"], f"Título sobrepôs etiqueta em {width}px")
        check(metrics["ctaTop"] < 900, f"Primeiro CTA não aparece cedo em {width}px")
        if width > 900:
            check(abs(metrics["formTop"] - metrics["eyebrowTop"]) <= 3, f"Colunas da hero não estão alinhadas pelo topo em {width}px")
        check(metrics["pageWidth"] <= metrics["innerWidth"], f"Rolagem horizontal na hero em {width}px")
        page.close()


def test_compact_form_layout(browser: Browser) -> None:
    page = new_page(browser, width=1440, height=900)
    open_cta(page, 'a[data-lead-cta="diagnostico-gratuito"]')
    check(not page.locator("#home-form-optional").get_attribute("open"), "Área opcional iniciou aberta")
    check(page.locator("#regime").is_hidden(), "Campo opcional apareceu antes da expansão")
    boxes = page.evaluate(
        """() => {
          const b=id=>document.getElementById(id).getBoundingClientRect();
          const d=document.getElementById('diagnostico').getBoundingClientRect();
          return {nome:b('nome'), empresa:b('empresa_nome'), wa:b('whatsapp'), email:b('email'), segmento:b('segmento'),
            submit:b('home-submit'), dialog:d, pageWidth:document.documentElement.scrollWidth, innerWidth:innerWidth};
        }"""
    )
    check(abs(boxes["nome"]["top"] - boxes["empresa"]["top"]) <= 2, "Nome e empresa não estão na mesma linha")
    check(abs(boxes["wa"]["top"] - boxes["email"]["top"]) <= 2, "WhatsApp e e-mail não estão na mesma linha")
    check(boxes["segmento"]["width"] > boxes["nome"]["width"] * 1.8, "Segmento não ocupa largura total")
    check(boxes["submit"]["bottom"] <= boxes["dialog"]["bottom"] + 2, "Botão principal exige rolagem longa na primeira visualização")
    page.locator("#home-form-optional summary").click()
    check(page.locator("#regime").is_visible(), "Área opcional não abriu pelo mouse")
    page.locator("#regime").select_option(label="Simples Nacional")
    page.locator("#home-form-optional summary").focus()
    page.keyboard.press("Enter")
    check(page.locator("#regime").is_hidden(), "Área opcional não fechou pelo teclado")
    page.locator("#home-form-optional summary").click()
    check(page.locator("#regime").input_value() == "Simples Nacional", "Dado opcional foi apagado ao recolher")
    page.close()

    mobile = new_page(browser, width=375, height=812)
    open_cta(mobile, 'a[data-lead-plan="advanced"]')
    m = mobile.evaluate(
        """() => {
          const b=id=>document.getElementById(id).getBoundingClientRect();
          return {nome:b('nome'), empresa:b('empresa_nome'), wa:b('whatsapp'), email:b('email'),
            pageWidth:document.documentElement.scrollWidth, innerWidth:innerWidth};
        }"""
    )
    check(m["empresa"]["top"] > m["nome"]["bottom"], "Campos não voltaram para uma coluna no celular")
    check(m["email"]["top"] > m["wa"]["bottom"], "WhatsApp e e-mail ficaram comprimidos no celular")
    check(m["pageWidth"] <= m["innerWidth"], "Formulário compacto criou rolagem horizontal no celular")
    mobile.locator("#home-submit").scroll_into_view_if_needed()
    check(mobile.locator("#home-submit").is_visible(), "Botão principal inacessível no celular")
    mobile.close()


def test_action_hierarchy_and_success(browser: Browser) -> None:
    page = new_page(browser)
    open_cta(page, 'a[data-lead-plan="advanced"]')
    wa = page.locator("#form-diagnostico .form-whatsapp")
    primary = page.locator("#home-submit")
    check(wa.is_visible(), "WhatsApp não está disponível antes do envio")
    check(wa.inner_text().strip() == "Prefere falar agora? Chame no WhatsApp", "Texto secundário do WhatsApp incorreto")
    check("form-whatsapp--secondary" in (wa.get_attribute("class") or ""), "WhatsApp não usa estilo secundário")
    styles = page.evaluate(
        """() => {
          const p=getComputedStyle(document.getElementById('home-submit'));
          const w=getComputedStyle(document.querySelector('#form-diagnostico .form-whatsapp'));
          return {pbg:p.backgroundColor,wbg:w.backgroundColor,pheight:document.getElementById('home-submit').getBoundingClientRect().height,
            wheight:document.querySelector('#form-diagnostico .form-whatsapp').getBoundingClientRect().height};
        }"""
    )
    check(styles["pbg"] != styles["wbg"], "Ações principal e WhatsApp mantêm o mesmo peso visual")
    check(styles["wheight"] < styles["pheight"], "WhatsApp secundário mantém a mesma altura do botão principal")
    href = unquote(wa.get_attribute("href") or "")
    check("Interesse: Proposta de plano contábil" in href or "Interesse:" in href, "WhatsApp perdeu o interesse contextual")
    check("Plano: Plano ADVANCED" in href, "WhatsApp perdeu o plano")
    check("Nome:" not in href, "WhatsApp da home incluiu dado pessoal")

    fill_required_home(page, "Ação Sucesso")
    page.locator("#home-submit").click()
    page.locator("#form-msg-home.form-msg--success").wait_for(state="visible")
    check(wa.inner_text().strip() == "Continuar agora pelo WhatsApp", "WhatsApp não ganhou o texto pós-sucesso")
    check("form-whatsapp--success" in (wa.get_attribute("class") or ""), "WhatsApp não recebeu destaque pós-sucesso")
    check(page.locator("#form-msg-home").is_visible(), "Confirmação ficou oculta")
    check(page.locator("#home-submit").is_disabled(), "Botão concluído não permaneceu desabilitado")
    check(len(page.evaluate("window.__fetchBodies")) == 1, "WhatsApp abriu ou provocou envio automático")
    old_lead = field(page, "lead_id")
    close_x(page)
    open_cta(page, 'a[data-lead-cta="diagnostico-gratuito"]')
    check(wa.inner_text().strip() == "Prefere falar agora? Chame no WhatsApp", "WhatsApp não voltou ao estado inicial")
    check("form-whatsapp--success" not in (wa.get_attribute("class") or ""), "Destaque anterior do WhatsApp permaneceu")
    check(page.locator("#form-msg-home").is_hidden(), "Mensagem anterior permaneceu")
    check(field(page, "lead_id") != old_lead, "Novo lead_id não foi criado")
    page.close()


def test_preservation_success_failure_and_direct(browser: Browser) -> None:
    page = new_page(browser)
    open_cta(page, 'a[data-lead-cta="simular-impacto"]')
    lead_before = field(page, "lead_id")
    page.locator("#nome").fill("Maria Preservada")
    page.locator("#empresa_nome").fill("Empresa Preservada")
    page.locator("#whatsapp").fill("(21) 98888-7777")
    page.locator("#email").fill("maria@teste.com.br")
    page.locator("#segmento").select_option(label="Comércio")
    page.locator("#home-form-optional summary").click()
    page.locator("#regime").select_option(label="Lucro Presumido")
    page.locator("#funcionarios").select_option(label="1 a 5")
    page.locator("#mensagem").fill("Mensagem preservada")
    page.locator('#form-diagnostico [name="consentimento"]').check()
    close_x(page)
    open_cta(page, 'a[data-lead-plan="advanced"]')
    for selector, expected in (("#nome", "Maria Preservada"), ("#empresa_nome", "Empresa Preservada"), ("#whatsapp", "(21) 98888-7777"), ("#email", "maria@teste.com.br"), ("#mensagem", "Mensagem preservada")):
        check(page.locator(selector).input_value() == expected, f"Dado não preservado: {selector}")
    check(page.locator("#regime").input_value() == "Lucro Presumido", "Regime não foi preservado")
    check(page.locator("#funcionarios").input_value() == "1 a 5", "Funcionários não foram preservados")
    check(page.locator('#form-diagnostico [name="consentimento"]').is_checked(), "Consentimento não foi preservado")
    check(field(page, "lead_id") == lead_before, "lead_id mudou antes do sucesso")
    check(field(page, "plano_interesse") == "Plano ADVANCED", "Plano não mudou para ADVANCED")
    page.close()

    failure = new_page(browser, fetch_mode="failure")
    open_cta(failure, 'a[data-lead-cta="simular-impacto"]')
    fill_required_home(failure, "Falha Teste")
    lead = field(failure, "lead_id")
    failure.locator("#home-submit").click()
    failure.locator("#form-msg-home.form-msg--error").wait_for(state="visible")
    check(modal_is_open(failure), "Modal fechou após erro")
    check(failure.locator("#nome").input_value() == "Falha Teste", "Dados foram apagados após erro")
    check(not failure.locator("#home-submit").is_disabled(), "Botão não foi reativado após erro")
    check(failure.locator("#home-submit").inner_text().strip() == "Solicitar avaliação tributária", "Texto não foi restaurado após erro")
    check(field(failure, "lead_id") == lead, "lead_id mudou após erro")
    check(failure.locator("#form-diagnostico").get_attribute("aria-busy") is None, "aria-busy permaneceu após erro")
    failure.evaluate("window.__fetchMode = 'success'")
    failure.locator("#home-submit").click()
    failure.locator("#form-msg-home.form-msg--success").wait_for(state="visible")
    bodies = failure.evaluate("window.__fetchBodies.slice()")
    check(len(bodies) == 2, "Nova tentativa não foi enviada")
    check(parse_body(bodies[0])["lead_id"] == lead and parse_body(bodies[1])["lead_id"] == lead, "Nova tentativa não preservou o lead_id")
    failure.close()

    direct = new_page(browser)
    fill_required_home(direct, "Acesso Direto")
    snap = context_snapshot(direct)
    check(snap["interest"] == "diagnostico-geral", "Formulário direto perdeu interesse padrão")
    check(snap["cta"] == "formulario-home", "Formulário direto perdeu CTA padrão")
    check(snap["ctaText"] == "Formulário de avaliação da página inicial", "Texto padrão incorreto")
    check(snap["service"] == "Contabilidade" and snap["plan"] == "Não informado", "Serviço/plano padrão incorreto")
    direct.locator("#home-submit").click()
    direct.locator("#form-msg-home.form-msg--success").wait_for(state="visible")
    check(not modal_is_open(direct), "Envio direto abriu modal")
    body = parse_body(direct.evaluate("window.__fetchBodies[0]"))
    check(body["interesse_codigo"] == "diagnostico-geral" and body["cta_codigo"] == "formulario-home", "Envio direto classificado incorretamente")
    direct.close()


def test_closing_keyboard_and_responsiveness(browser: Browser) -> None:
    page = new_page(browser)
    trigger = page.locator('a[data-lead-cta="diagnostico-gratuito"]')
    trigger.focus()
    page.keyboard.press("Space")
    check(modal_is_open(page), "Barra de espaço não abriu o modal")
    page.wait_for_function("document.activeElement && document.activeElement.id === 'home-form-close'")
    check(page.evaluate("document.activeElement.id") == "home-form-close", "Foco não entrou no modal")
    page.keyboard.press("Shift+Tab")
    check(page.evaluate("document.getElementById('diagnostico').contains(document.activeElement)"), "Shift+Tab escapou")
    page.keyboard.press("Escape")
    check(not modal_is_open(page), "Esc não fechou o modal")
    check(page.evaluate("document.activeElement.getAttribute('data-lead-cta')") == "diagnostico-gratuito", "Foco não voltou após Esc")
    trigger.press("Enter")
    page.locator("#home-form-title").click()
    check(modal_is_open(page), "Clique dentro do card fechou o modal")
    page.locator("#home-form-backdrop").click(position={"x": 5, "y": 5})
    check(not modal_is_open(page), "Backdrop não fechou o modal")
    trigger.click()
    close_x(page)
    check(page.evaluate("document.activeElement.getAttribute('data-lead-cta')") == "diagnostico-gratuito", "Foco não voltou após X")
    page.close()

    for width in (320, 375, 768, 1024, 1440):
        height = 760 if width <= 375 else 900
        p = new_page(browser, width, height)
        open_cta(p, 'a[data-lead-plan="advanced"]')
        metrics = p.evaluate(
            """() => {
              var d=document.getElementById('diagnostico'), r=d.getBoundingClientRect(), c=document.getElementById('home-form-close').getBoundingClientRect();
              return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,innerWidth:innerWidth,innerHeight:innerHeight,
                pageWidth:document.documentElement.scrollWidth,clientHeight:d.clientHeight,scrollHeight:d.scrollHeight,closeTop:c.top,closeRight:c.right};
            }"""
        )
        check(metrics["left"] >= 0 and metrics["right"] <= metrics["innerWidth"] + 1, f"Modal fora da tela em {width}px")
        check(metrics["top"] >= 0 and metrics["bottom"] <= metrics["innerHeight"] + 1, f"Altura fora da tela em {width}px")
        check(metrics["pageWidth"] <= metrics["innerWidth"], f"Rolagem horizontal em {width}px")
        check(metrics["closeTop"] >= 0 and metrics["closeRight"] <= metrics["innerWidth"] + 1, f"Fechar fora da tela em {width}px")
        p.locator("#home-submit").scroll_into_view_if_needed()
        check(p.locator("#home-submit").is_visible(), f"Botão de envio inacessível em {width}px")
        p.close()


def test_contact_form_regression(browser: Browser) -> None:
    page = browser.new_page(viewport={"width": 1024, "height": 900})
    page.set_default_timeout(8000)
    page.set_content(site_document("contato.html"), wait_until="domcontentloaded", timeout=8000)
    if page.locator("#lgpd").get_attribute("data-show") == "true":
        page.locator("#lgpd-reject").click()
    check(page.locator("#home-form-backdrop").count() == 0, "Modal da home foi criado no contato")
    check(page.locator("#form-contato").count() == 1, "Formulário de contato ausente/duplicado")
    page.locator("#nome").fill("Contato Teste")
    page.locator("#whatsapp").fill("(21) 97777-6666")
    page.locator("#email").fill("contato@teste.com.br")
    page.locator("#segmento").select_option(label="Comércio")
    page.locator("#regime").select_option(label="Lucro Presumido")
    page.locator('#form-contato [name="consentimento"]').check()
    page.locator("#contact-submit").click()
    page.locator("#form-msg-contato.form-msg--success").wait_for(state="visible")
    check(page.locator("#contact-submit").is_disabled(), "Sucesso do contato não manteve botão desabilitado")
    contact_whatsapp = page.locator("#form-contato .form-whatsapp")
    check(contact_whatsapp.is_visible(), "WhatsApp voluntário do contato não apareceu")
    contact_href = unquote(contact_whatsapp.get_attribute("href") or "")
    check("Acabei de enviar uma solicitação pelo site da Enterprise" in contact_href, "Mensagem aprovada do WhatsApp de contato mudou")
    check("Nome: Contato Teste" in contact_href, "Nome deixou de ser incluído no WhatsApp de contato")
    body = parse_body(page.evaluate("window.__fetchBodies[0]"))
    check(body.get("form-name") == "diagnostico-contato", "Nome do formulário de contato mudou")
    check(body.get("interesse_codigo") == "contato-geral", "Contexto do contato mudou")
    page.close()


def run_browser_test(playwright, label: str, test_func) -> None:
    print("  - " + label, flush=True)
    launch_options = {"headless": True, "args": ["--no-sandbox", "--disable-gpu"]}
    if CHROMIUM and Path(CHROMIUM).exists():
        launch_options["executable_path"] = CHROMIUM
    browser = playwright.chromium.launch(**launch_options)
    try:
        test_func(browser)
    finally:
        browser.close()


def run_static_group() -> None:
    print("[estatico] Regressão, sintaxe e build", flush=True)
    test_static_regression()
    node_check = subprocess.run(["node", "--check", "assets/js/main.js"], cwd=REPO, capture_output=True, text=True)
    check(node_check.returncode == 0, "Falha de sintaxe JavaScript: " + node_check.stderr.strip())
    blog_env = os.environ.copy(); blog_env.update(BUILD_DATE="2026-08-06", PUBLIC_INDEXING="false", CONTEXT="deploy-preview")
    blog_build = subprocess.run(["npm", "run", "build"], cwd=REPO, env=blog_env, capture_output=True, text=True)
    check(blog_build.returncode == 0, "Falha no build do blog: " + blog_build.stderr.strip())


def run_playwright_group(group: str) -> None:
    groups = {
        "ctas": [("sete contextos da home", test_cta_contexts)],
        "seguranca": [
            ("fetch atrasado e bloqueios", test_pending_fetch_protection),
            ("integração LGPD", test_lgpd_integration),
        ],
        "layout": [
            ("primeira dobra da hero", test_hero_first_fold),
            ("formulário compacto", test_compact_form_layout),
        ],
        "fluxos": [
            ("hierarquia e WhatsApp", test_action_hierarchy_and_success),
            ("preservação, sucesso, erro e acesso direto", test_preservation_success_failure_and_direct),
        ],
        "regressao": [
            ("teclado e responsividade", test_closing_keyboard_and_responsiveness),
            ("formulário de contato", test_contact_form_regression),
        ],
    }
    with sync_playwright() as playwright:
        # Um navegador limpo por cenário evita acúmulo de renderizadores em CI
        # sem reduzir a cobertura ou alterar as asserções.
        for label, test_func in groups[group]:
            run_browser_test(playwright, label, test_func)


def main() -> int:
    parser = argparse.ArgumentParser(description="Suíte reproduzível da Fase 1 V3.1")
    parser.add_argument(
        "--group",
        choices=("all", "estatico", "ctas", "seguranca", "layout", "fluxos", "regressao"),
        default="all",
        help="Executa toda a suíte ou um grupo isolado.",
    )
    args = parser.parse_args()

    if args.group == "all":
        # A suíte completa executa cada grupo em um processo independente. O isolamento
        # impede acúmulo de renderizadores do Chromium em ambientes de CI modestos.
        total = 0
        for group in ("estatico", "ctas", "seguranca", "layout", "fluxos", "regressao"):
            result = subprocess.run(
                [sys.executable, str(Path(__file__).resolve()), "--group", group],
                cwd=REPO,
                capture_output=True,
                text=True,
                timeout=300,
            )
            if result.stdout:
                print(result.stdout, end="", flush=True)
            if result.stderr:
                print(result.stderr, end="", file=sys.stderr, flush=True)
            if result.returncode != 0:
                raise RuntimeError(f"Grupo '{group}' falhou com código {result.returncode}")
            match = re.search(r"APROVADO — (\d+) verificações", result.stdout)
            if match:
                total += int(match.group(1))
        print(f"APROVADO — {total} verificações executadas na suíte completa.", flush=True)
        return 0

    if args.group == "estatico":
        run_static_group()
    else:
        print("[" + args.group + "]", flush=True)
        run_playwright_group(args.group)

    print(f"APROVADO — {ASSERTIONS} verificações executadas no grupo '{args.group}'.", flush=True)
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"FALHA após {ASSERTIONS} verificações: {exc}", file=sys.stderr)
        raise
