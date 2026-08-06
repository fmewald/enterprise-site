#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');
const { getBuildDate, validateIsoDate, BUILD_TIME_ZONE } = require('./build-date');

const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');
const config = JSON.parse(fs.readFileSync(path.join(root, 'config/site.config.json'), 'utf8'));
const authority = JSON.parse(fs.readFileSync(path.join(root, 'data/authority.json'), 'utf8'));
const siteUrl = config.siteUrl.replace(/\/$/, '');
const context = process.env.CONTEXT || 'local';
const publicIndexing = process.env.PUBLIC_INDEXING === 'true' && context === 'production';
const buildDate = getBuildDate();

function fail(message) { throw new Error(message); }
function read(rel) { return fs.readFileSync(path.join(root, rel), 'utf8'); }
function write(rel, content) {
  const target = path.join(dist, rel);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, String(content).replace(/\r\n/g, '\n'));
}
function copyFile(srcRel, destRel = srcRel) {
  const src = path.join(root, srcRel); const dest = path.join(dist, destRel);
  fs.mkdirSync(path.dirname(dest), { recursive: true }); fs.copyFileSync(src, dest);
}
function copyDir(srcRel, destRel = srcRel) {
  const src = path.join(root, srcRel); const dest = path.join(dist, destRel);
  fs.cpSync(src, dest, { recursive: true });
}
function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function stripTags(html) { return String(html).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(); }
function safeUrl(url) {
  const value = String(url || '').trim();
  if (/^(https:\/\/|mailto:|tel:|\/|#)/i.test(value) && !/^javascript:/i.test(value)) return value;
  return '#';
}
function absUrl(value) { return /^https:\/\//i.test(value) ? value : siteUrl + (String(value).startsWith('/') ? value : '/' + value); }
function formatDate(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) fail(`Data inválida: ${date}`);
  const [y,m,d] = date.split('-'); return `${d}/${m}/${y}`;
}
function dateNotFuture(date) { return validateIsoDate(date, 'data editorial') <= buildDate; }
function hashBuffer(buf) { return crypto.createHash('sha256').update(buf).digest('hex'); }
function listFiles(base) {
  const out=[];
  function walk(dir){ for(const ent of fs.readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))){ const p=path.join(dir,ent.name); if(ent.isDirectory()) walk(p); else out.push(path.relative(base,p).replace(/\\/g,'/')); } }
  if(fs.existsSync(base)) walk(base); return out;
}
function dirHash(base) {
  const h=crypto.createHash('sha256');
  for(const rel of listFiles(base)){ h.update(rel); h.update('\0'); h.update(fs.readFileSync(path.join(base,rel))); h.update('\0'); }
  return h.digest('hex');
}

function validatePythonRuntime() {
  const result = spawnSync('python3', ['--version'], { encoding: 'utf8', cwd: root });
  if (result.error || result.status !== 0) {
    fail('Python 3 não está disponível. Configure PYTHON_VERSION=3.12 na Netlify e instale Python 3.12 ou superior no ambiente local.');
  }
  const output = `${result.stdout || ''} ${result.stderr || ''}`.trim();
  const match = output.match(/Python\s+(\d+)\.(\d+)(?:\.(\d+))?/i);
  if (!match) fail(`Não foi possível identificar a versão do Python: ${output}`);
  const major = Number(match[1]);
  const minor = Number(match[2]);
  if (major < 3 || (major === 3 && minor < 12)) {
    fail(`Python incompatível: ${output}. É necessário Python 3.12 ou superior.`);
  }
  return output;
}

function validateAuthority() {
  const o=authority.organization, p=authority.responsibleTechnical, privacy=authority.privacy;
  for(const [key,val] of Object.entries({displayName:o.displayName,legalName:o.legalName,cnpj:o.cnpj,crc:o.crc,googleBusinessProfileUrl:o.googleBusinessProfileUrl,googleRatingText:o.googleRatingText,googleReviewsText:o.googleReviewsText,responsibleName:p.name,responsibleCrc:p.crc,privacyEmail:privacy.email})) if(!val) fail(`Authority obrigatório ausente: ${key}`);
  if(!/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(o.cnpj)) fail('CNPJ em formato inválido');
  if(!/^CRC-RJ \d{6}\/O$/.test(o.crc) || !/^CRC-RJ \d{6}\/O$/.test(p.crc)) fail('CRC em formato inválido');
  if(!/^https:\/\//.test(o.googleBusinessProfileUrl)) fail('Perfil Google inválido');
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(privacy.email)) fail('E-mail de privacidade inválido');
}

function parseScalar(raw) {
  const v=String(raw).trim();
  if(v==='[]') return [];
  if(v==='true') return true; if(v==='false') return false;
  if((v.startsWith('"')&&v.endsWith('"'))||(v.startsWith("'")&&v.endsWith("'"))) return v.slice(1,-1);
  return v;
}
function parseFrontMatter(source, filename) {
  const m=source.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/); if(!m) fail(`Frontmatter ausente: ${filename}`);
  const lines=m[1].split(/\r?\n/); const data={}; let i=0;
  while(i<lines.length){
    const line=lines[i]; if(!line.trim()){i++;continue;}
    const mm=line.match(/^([A-Za-z0-9_]+):(?:\s*(.*))?$/); if(!mm) fail(`Frontmatter inválido em ${filename}: ${line}`);
    const key=mm[1], raw=(mm[2]||'').trim();
    if(raw==='|'){
      i++; const parts=[]; while(i<lines.length && (/^\s{2}/.test(lines[i]) || !lines[i].trim())){ parts.push(lines[i].replace(/^\s{2}/,'')); i++; }
      data[key]=parts.join('\n').trim(); continue;
    }
    if(raw!==''){ data[key]=parseScalar(raw); i++; continue; }
    i++; const arr=[];
    while(i<lines.length && /^\s{2}-\s*/.test(lines[i])){
      const first=lines[i].match(/^\s{2}-\s*(.*)$/)[1];
      if(first.includes(':')){
        const obj={}; const fm=first.match(/^([A-Za-z0-9_]+):\s*(.*)$/); obj[fm[1]]=parseScalar(fm[2]); i++;
        while(i<lines.length && /^\s{4}[A-Za-z0-9_]+:/.test(lines[i])){ const sm=lines[i].match(/^\s{4}([A-Za-z0-9_]+):\s*(.*)$/); obj[sm[1]]=parseScalar(sm[2]); i++; }
        arr.push(obj);
      } else { arr.push(parseScalar(first)); i++; }
    }
    data[key]=arr;
  }
  return { data, body:m[2].trim() };
}

function renderMarkdownBatch(markdownItems) {
  const items = markdownItems.map(value => String(value || ''));
  const result = spawnSync('python3', [path.join(root, 'scripts/render_markdown.py'), '--json'], {
    input: JSON.stringify(items),
    encoding: 'utf8',
    cwd: root,
    maxBuffer: 50 * 1024 * 1024,
  });
  if (result.error) fail(`Não foi possível iniciar o renderizador Markdown: ${result.error.message}`);
  if (result.status !== 0) fail(`Falha no renderizador Markdown: ${(result.stderr || '').trim()}`);
  let output;
  try { output = JSON.parse(String(result.stdout || '[]')); }
  catch (error) { fail(`Saída inválida do renderizador Markdown: ${error.message}`); }
  if (!Array.isArray(output) || output.length !== items.length) fail('O renderizador Markdown retornou uma quantidade inesperada de resultados');
  return output.map(value => String(value || '').trim());
}
function prepareRenderedArticles(articles) {
  const sources=[];
  for (const article of articles) { sources.push(article.body, article.meta.resposta_direta); }
  const rendered=renderMarkdownBatch(sources);
  articles.forEach((article,index)=>{
    article.renderedBody=addHeadingIds(rendered[index*2]);
    article.renderedDirectAnswer=rendered[index*2+1];
  });
  return articles;
}
function addHeadingIds(html){ const used=new Set(); return html.replace(/<(h[2-6])>([\s\S]*?)<\/\1>/g,(_,tag,content)=>{ let id=stripTags(content).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')||'secao'; const base=id; let n=2; while(used.has(id))id=`${base}-${n++}`;used.add(id);return `<${tag} id="${id}">${content}</${tag}>`; }); }

function organizationEntity(){ const o=authority.organization; return {'@type':['AccountingService','Organization'],'@id':`${siteUrl}/#organization`,name:o.displayName,legalName:o.legalName,url:`${siteUrl}/`,taxID:o.cnpj,identifier:{'@type':'PropertyValue',propertyID:'CRC-RJ',value:o.crc.replace('CRC-RJ ','')},logo:absUrl('/assets/img/logo-vertical.svg'),image:absUrl(config.defaultOgImage),telephone:o.telephone,email:o.email,address:{'@type':'PostalAddress',...o.address},areaServed:o.areaServed.map(name=>({'@type':name==='Brasil'?'Country':name==='Rio de Janeiro'?'State':'City',name})),sameAs:[...o.socialProfiles,o.googleBusinessProfileUrl],openingHoursSpecification:{'@type':'OpeningHoursSpecification',dayOfWeek:o.openingHours.days,opens:o.openingHours.opens,closes:o.openingHours.closes}}; }
function personEntity(){ const p=authority.responsibleTechnical; return {'@type':'Person','@id':`${siteUrl}/#fernando-de-medeiros-ewald`,name:p.name,jobTitle:p.jobTitle,identifier:{'@type':'PropertyValue',propertyID:'CRC-RJ',value:p.crc.replace('CRC-RJ ','')},worksFor:{'@id':`${siteUrl}/#organization`}}; }
function websiteEntity(){ return {'@type':'WebSite','@id':`${siteUrl}/#website`,url:`${siteUrl}/`,name:authority.organization.displayName,publisher:{'@id':`${siteUrl}/#organization`},inLanguage:'pt-BR'}; }
function editorialEntity(){ return {'@type':'Organization','@id':`${siteUrl}/#editorial-team`,name:'Equipe Técnica da Enterprise Assessoria Contábil',parentOrganization:{'@id':`${siteUrl}/#organization`}}; }
function cleanStructured(value){ if(Array.isArray(value)) return value.map(cleanStructured).filter(Boolean); if(value&&typeof value==='object'){ const out={}; for(const [k,v] of Object.entries(value)){ if(['priceRange','aggregateRating','review','reviewedBy'].includes(k)) continue; const c=cleanStructured(v); if(c!==''&&c!==null&&c!==undefined) out[k]=c; } return out; } return value; }
function updateJsonLd(html, includePerson=false, includeEditorial=false){ return html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,(_,raw)=>{ let parsed; try{parsed=JSON.parse(raw)}catch{return _;} const entityIds=[`${siteUrl}/#organization`,`${siteUrl}/#website`,`${siteUrl}/#fernando-de-medeiros-ewald`,`${siteUrl}/#editorial-team`]; const graph=parsed['@graph']||[parsed]; const filtered=graph.filter(x=>!entityIds.includes(x&&x['@id'])); const entities=[organizationEntity(),websiteEntity()]; if(includePerson)entities.push(personEntity()); if(includeEditorial)entities.push(editorialEntity()); parsed={'@context':'https://schema.org','@graph':[...entities,...filtered]}; return `<script type="application/ld+json">${JSON.stringify(cleanStructured(parsed))}</script>`; }); }
function legalFooter(){ const o=authority.organization,p=authority.responsibleTechnical; return `<div class="footer__authority"><p>${escapeHtml(o.legalName)} · CNPJ ${escapeHtml(o.cnpj)} · Organização contábil registrada no ${escapeHtml(o.crc)}.</p><p>Responsável técnico: ${escapeHtml(p.name)} · ${escapeHtml(p.crc)}.</p></div>`; }
function injectFooter(html){ if(html.includes('footer__authority')) return html; return html.replace('<div class="footer__legal">',`${legalFooter()}\n<div class="footer__legal">`); }
function aboutAuthorityBlock(){ const o=authority.organization,p=authority.responsibleTechnical; return `<section class="section" id="autoridade"><div class="wrap"><div class="section__head"><span class="eyebrow">Autoridade e transparência</span><h2>Dados oficiais da Enterprise</h2><p>Informações institucionais e profissionais confirmadas para facilitar a verificação da organização contábil.</p></div><div class="grid grid--2"><article class="card"><h3>${escapeHtml(o.legalName)}</h3><p><strong>CNPJ:</strong> ${escapeHtml(o.cnpj)}<br><strong>Registro da organização:</strong> ${escapeHtml(o.crc)}</p><p>Organização contábil com ${o.yearsOfExperience} anos de experiência, atendimento local em Duque de Caxias e suporte digital para empresas.</p></article><article class="card"><h3>Responsável técnico</h3><p><strong>${escapeHtml(p.name)}</strong><br>${escapeHtml(p.jobTitle)}<br>${escapeHtml(p.crc)}</p></article></div><div class="card authority-google"><h3>Prova social verificável</h3><p><strong>Nota ${escapeHtml(o.googleRatingText)} no Google e ${escapeHtml(o.googleReviewsText)}.</strong> Essas informações são atualizáveis e devem ser conferidas no perfil oficial.</p><a class="btn btn--primary" href="${escapeHtml(o.googleBusinessProfileUrl)}" target="_blank" rel="noopener noreferrer" aria-label="Consultar avaliações no Google, abre em nova aba">Consultar avaliações no Google</a></div></div></section>`; }
function privacyControllerBlock(){ const o=authority.organization; return `<p><strong>Controlador:</strong> ${escapeHtml(o.legalName)}, CNPJ ${escapeHtml(o.cnpj)}, com endereço institucional informado neste site. Para exercer direitos de privacidade e LGPD, utilize <a href="mailto:${escapeHtml(authority.privacy.email)}">${escapeHtml(authority.privacy.email)}</a>.</p>`; }
function transformInstitutional(html, file){ html=html.replace(/<!-- AUTHORITY_BLOCK_START -->[\s\S]*?<!-- AUTHORITY_BLOCK_END -->/,aboutAuthorityBlock()); html=html.replace(/<!-- PRIVACY_CONTROLLER_START -->[\s\S]*?<!-- PRIVACY_CONTROLLER_END -->/,privacyControllerBlock()); html=injectFooter(html); html=updateJsonLd(html,file==='sobre.html',file==='blog.html'); html=html.replace(/"priceRange":"\$\$",?/g,''); return html; }

function loadArticles(){
  const out=[];
  const seen=new Set();
  const postsDir=path.join(root,'posts');
  for(const name of fs.readdirSync(postsDir).filter(x=>x.endsWith('.md')).sort()){
    const parsed=parseFrontMatter(read(`posts/${name}`),name);
    const m=parsed.data;
    const slug=m.slug||name.replace(/\.md$/,'');
    if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) fail(`Slug inválido: ${slug}`);
    if(seen.has(slug)) fail(`Slug duplicado: ${slug}`);
    seen.add(slug);
    if(Object.prototype.hasOwnProperty.call(m,'status')) fail(`Campo editorial redundante "status" não é permitido: ${name}. Use o workflow do CMS ou draft: true como proteção técnica.`);
    if(Object.prototype.hasOwnProperty.call(m,'draft') && typeof m.draft !== 'boolean') fail(`draft deve ser true ou false: ${name}`);
    if(!m.titulo||!m.resumo||!m.categoria||!m.data||!m.resposta_direta||!parsed.body) fail(`Campos editoriais obrigatórios ausentes: ${name}`);
    const publishedDate=validateIsoDate(m.data,`data de ${name}`);
    const updatedDate=validateIsoDate(m.atualizado||m.data,`data de atualização de ${name}`);
    if(!dateNotFuture(publishedDate)) fail(`Data futura em relação à data de referência ${buildDate}: ${name} (${publishedDate})`);
    if(!dateNotFuture(updatedDate)) fail(`Data futura em relação à data de referência ${buildDate}: ${name} (${updatedDate})`);
    if(updatedDate < publishedDate) fail(`Data de atualização anterior à publicação: ${name}`);
    if(m.capa&&!m.capa_alt) fail(`Imagem sem alt: ${name}`);
    if(!Array.isArray(m.sources)) m.sources=[];
    if(!Array.isArray(m.redirect_from)) m.redirect_from=[];
    const urls=new Set();
    for(const source of m.sources){
      if(!source.title||!/^https:\/\//.test(source.url||'')) fail(`Fonte inválida: ${name}`);
      if(urls.has(source.url)) fail(`Fonte duplicada: ${name}`);
      urls.add(source.url);
      if(source.accessed) validateIsoDate(source.accessed,`data de acesso em ${name}`);
    }
    if(/^#{1,6}\s+Fontes/im.test(parsed.body)) fail(`Seção manual de fontes não permitida: ${name}`);
    out.push({file:name,slug,meta:m,body:parsed.body});
  }
  return out.filter(x=>x.meta.draft!==true).sort((a,b)=>(b.meta.atualizado||b.meta.data).localeCompare(a.meta.atualizado||a.meta.data)||a.meta.titulo.localeCompare(b.meta.titulo));
}
function extractCommon(template){ const take=(re,label)=>{const m=template.match(re);if(!m)fail(`Bloco ${label} ausente no template do blog`);return m[0];}; return {header:take(/<header class="header">[\s\S]*?<\/header>/,'header'),footer:take(/<footer class="footer">[\s\S]*?<\/footer>/,'footer'),wa:take(/<a aria-label="Falar no WhatsApp" class="wa"[\s\S]*?<\/a>/,'WhatsApp'),cookie:take(/<div aria-label="Aviso de cookies"[\s\S]*?<\/div>\s*<\/div>/,'cookie')}; }
function blogCard(a){ return `<article class="post-card"><span class="post-card__cat">${escapeHtml(a.meta.categoria)}</span><h2><a href="/blog/${escapeHtml(a.slug)}/">${escapeHtml(a.meta.titulo)}</a></h2><p>${escapeHtml(a.meta.resumo)}</p><div class="post-card__meta">Atualizado em ${formatDate(a.meta.atualizado||a.meta.data)} · ${escapeHtml(a.meta.autor)}</div><a class="post-card__link" href="/blog/${escapeHtml(a.slug)}/">Ler artigo</a></article>`; }
function renderBlog(articles){ let html=read('templates/blog.template.html'); const cards=articles.map(blogCard).join('\n'); html=html.replace(/<!-- BLOG_CARDS_START -->[\s\S]*?<!-- BLOG_CARDS_END -->/,`<!-- BLOG_CARDS_START -->\n${cards}\n<!-- BLOG_CARDS_END -->`); html=injectFooter(html); html=updateJsonLd(html,false,true); return html; }
function articleHead(a){ const m=a.meta, canonical=`${siteUrl}/blog/${a.slug}/`, title=`${m.seo_title||m.titulo} | Enterprise`, desc=m.resumo, image=absUrl(m.capa||config.defaultOgImage); const schema={'@context':'https://schema.org','@graph':[organizationEntity(),websiteEntity(),editorialEntity(),{'@type':'BlogPosting','@id':`${canonical}#article`,mainEntityOfPage:{'@id':`${canonical}#webpage`},headline:m.titulo,description:desc,datePublished:`${m.data}T09:00:00-03:00`,dateModified:`${m.atualizado||m.data}T09:00:00-03:00`,author:{'@id':`${siteUrl}/#editorial-team`},publisher:{'@id':`${siteUrl}/#organization`},image:{'@type':'ImageObject',url:image,width:1200,height:630},articleSection:m.categoria,inLanguage:'pt-BR'},{'@type':'WebPage','@id':`${canonical}#webpage`,url:canonical,name:title,isPartOf:{'@id':`${siteUrl}/#website`},breadcrumb:{'@id':`${canonical}#breadcrumb`}},{'@type':'BreadcrumbList','@id':`${canonical}#breadcrumb`,itemListElement:[{'@type':'ListItem',position:1,name:'Início',item:`${siteUrl}/`},{'@type':'ListItem',position:2,name:'Blog',item:`${siteUrl}/blog`},{'@type':'ListItem',position:3,name:m.titulo,item:canonical}]}]}; return `<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title><meta name="description" content="${escapeHtml(desc)}"><link rel="canonical" href="${canonical}"><meta name="robots" content="index, follow, max-image-preview:large"><meta property="og:type" content="article"><meta property="og:locale" content="pt_BR"><meta property="og:site_name" content="${escapeHtml(authority.organization.displayName)}"><meta property="og:title" content="${escapeHtml(title)}"><meta property="og:description" content="${escapeHtml(desc)}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${image}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="${escapeHtml(m.capa_alt||'Enterprise Assessoria Contábil — conteúdo técnico para empresas')}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escapeHtml(title)}"><meta name="twitter:description" content="${escapeHtml(desc)}"><meta name="twitter:image" content="${image}"><link rel="alternate" type="application/rss+xml" title="Blog da Enterprise" href="${siteUrl}/feed.xml"><link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Libre+Franklin:wght@400;600;700;800&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&display=swap" rel="stylesheet"><link rel="stylesheet" href="/assets/css/styles.css"><script type="application/ld+json">${JSON.stringify(cleanStructured(schema))}</script>`; }
function renderSources(a){ if(!a.meta.sources.length)return''; return `<section class="article-sources" id="fontes-oficiais"><h2>Fontes oficiais</h2><ul>${a.meta.sources.map(s=>`<li><a href="${escapeHtml(s.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(s.title)}</a>${s.accessed?` <span>— acesso em ${formatDate(s.accessed)}</span>`:''}</li>`).join('')}</ul></section>`; }
function renderArticle(a,common,articles){ let tpl=read('templates/article.template.html'); const content=a.renderedBody; const direct=`<section class="article-summary" aria-labelledby="resposta-direta"><h2 id="resposta-direta">Em resumo</h2>${a.renderedDirectAnswer}</section>`; const authorityNote=`<aside class="article-authority"><p>Conteúdo produzido pela equipe técnica da ${escapeHtml(authority.organization.displayName)}. O escritório é registrado no ${escapeHtml(authority.organization.crc)} e tem como responsável técnico ${escapeHtml(authority.responsibleTechnical.name)}, ${escapeHtml(authority.responsibleTechnical.crc)}.</p></aside>`; const params=new URLSearchParams({interesse:a.meta.cta_interesse||'diagnostico-geral',origem:'blog-artigo',cta:'avaliacao-artigo',servico:a.meta.cta_servico||'contabilidade'}); if(a.meta.cta_segmento)params.set('segmento',a.meta.cta_segmento); const cta=`<section class="article-cta"><h2>Próximo passo</h2><p>Solicite uma avaliação inicial. Nossa equipe entra em contato para entender o cenário e indicar quais documentos e análises são necessários.</p><a class="btn btn--primary" href="/contato?${params.toString().replace(/&/g,'&amp;')}">Solicitar avaliação inicial</a></section>`; const related=articles.filter(x=>x.slug!==a.slug).slice(0,3).map(x=>`<a class="related-card" href="/blog/${x.slug}/"><strong>${escapeHtml(x.meta.titulo)}</strong><span>${escapeHtml(x.meta.categoria)}</span></a>`).join(''); const replacements={HEAD:articleHead(a),HEADER:common.header,FOOTER:injectFooter(common.footer),WA:common.wa,COOKIE:common.cookie,BREADCRUMB:`<nav class="crumbs" aria-label="Você está em"><a href="/">Início</a> › <a href="/blog">Blog</a> › ${escapeHtml(a.meta.titulo)}</nav>`,CATEGORY:escapeHtml(a.meta.categoria),TITLE:escapeHtml(a.meta.titulo),DESCRIPTION:escapeHtml(a.meta.resumo),PUBLISHED:formatDate(a.meta.data),UPDATED:formatDate(a.meta.atualizado||a.meta.data),AUTHOR:escapeHtml(a.meta.autor),DIRECT_ANSWER:direct,CONTENT:content,SOURCES:renderSources(a),AUTHORITY_NOTE:authorityNote,CTA:cta,RELATED:related}; for(const [k,v] of Object.entries(replacements)) tpl=tpl.replaceAll(`{{${k}}}`,v); return tpl; }
function render404(common){ return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Página não encontrada | Enterprise</title><meta name="description" content="A página solicitada não foi encontrada. Acesse os serviços, segmentos, Reforma Tributária ou fale com a Enterprise."><meta name="robots" content="noindex, follow"><link rel="canonical" href="${siteUrl}/404"><link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/assets/css/styles.css"></head><body><a class="skip" href="#conteudo">Ir para o conteúdo</a>${common.header}<main id="conteudo"><section class="error-page"><div class="wrap error-page__inner"><span class="eyebrow">Erro 404</span><h1>Esta página não foi encontrada</h1><p class="lead">O endereço pode ter mudado ou não existir. Escolha um caminho abaixo para continuar.</p><div class="error-page__actions"><a class="btn btn--primary" href="/">Página inicial</a><a class="btn btn--ghost" href="/servicos">Serviços</a><a class="btn btn--ghost" href="/segmentos">Segmentos</a><a class="btn btn--ghost" href="/reforma-tributaria">Reforma Tributária</a><a class="btn btn--ghost" href="/contato?interesse=contato-geral&amp;origem=404&amp;cta=falar-especialista">Contato</a></div></div></section></main>${injectFooter(common.footer)}${common.wa}${common.cookie}<script src="/assets/js/main.js" defer></script></body></html>`; }
function generateSitemap(articles){ const pages=config.publicPages.map(p=>({loc:siteUrl+p.path,lastmod:p.lastmod,changefreq:p.changefreq,priority:p.priority})); const posts=articles.map(a=>({loc:`${siteUrl}/blog/${a.slug}/`,lastmod:a.meta.atualizado||a.meta.data,changefreq:'monthly',priority:'0.7'})); const xml=pages.concat(posts).map(x=>`<url><loc>${x.loc}</loc>${x.lastmod?`<lastmod>${x.lastmod}</lastmod>`:''}<changefreq>${x.changefreq}</changefreq><priority>${x.priority}</priority></url>`).join('\n'); return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${xml}\n</urlset>\n`; }
function generateFeed(articles){ const latest=articles.reduce((m,a)=>Math.max(m,new Date(`${a.meta.atualizado||a.meta.data}T12:00:00-03:00`).getTime()),0); const items=articles.map(a=>{const url=`${siteUrl}/blog/${a.slug}/`;return `<item><title>${escapeHtml(a.meta.titulo)}</title><link>${url}</link><guid isPermaLink="true">${url}</guid><pubDate>${new Date(`${a.meta.data}T12:00:00-03:00`).toUTCString()}</pubDate><description>${escapeHtml(a.meta.resumo)}</description><category>${escapeHtml(a.meta.categoria)}</category><dc:creator>${escapeHtml(a.meta.autor)}</dc:creator></item>`;}).join('\n'); return `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/"><channel><title>Blog da Enterprise Assessoria Contábil</title><link>${siteUrl}/blog</link><description>Conteúdos contábeis, tributários e de gestão para empresas.</description><language>pt-BR</language><lastBuildDate>${new Date(latest).toUTCString()}</lastBuildDate><atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml"/>${items}</channel></rss>\n`; }
function generateHeaders(){
  const noindex=publicIndexing?'':'  X-Robots-Tag: noindex, nofollow\n';
  const csp="default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'; object-src 'none'; script-src 'self' https://identity.netlify.com https://unpkg.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https:; connect-src 'self' https://api.netlify.com https://*.netlify.com; upgrade-insecure-requests";
  return `/*\n${noindex}  Cache-Control: public, max-age=0, must-revalidate\n  X-Content-Type-Options: nosniff\n  X-Frame-Options: SAMEORIGIN\n  Referrer-Policy: strict-origin-when-cross-origin\n  Permissions-Policy: geolocation=(), microphone=(), camera=(), payment=(), usb=()\n  Strict-Transport-Security: max-age=31536000\n  Content-Security-Policy-Report-Only: ${csp}\n\n/assets/css/*\n  Cache-Control: public, max-age=3600, must-revalidate\n\n/assets/js/*\n  Cache-Control: public, max-age=3600, must-revalidate\n\n/assets/img/*\n  Cache-Control: public, max-age=86400, must-revalidate\n\n/admin/*\n  X-Robots-Tag: noindex, nofollow\n  Cache-Control: public, max-age=0, must-revalidate\n\n/robots.txt\n  Cache-Control: public, max-age=0, must-revalidate\n\n/sitemap.xml\n  Cache-Control: public, max-age=0, must-revalidate\n\n/feed.xml\n  Cache-Control: public, max-age=0, must-revalidate\n\n/404.html\n  X-Robots-Tag: noindex, follow\n  Cache-Control: public, max-age=0, must-revalidate\n`;
}
function generateRedirects(articles){ const lines=[]; lines.push('https://www.enterprisecontabilidade.com.br/* https://enterprisecontabilidade.com.br/:splat 301!'); for(const [from,to] of Object.entries(config.legacyPages))lines.push(`${from} ${to} 301!`); for(const p of config.publicPages)if(p.path!=='/')lines.push(`${p.path} /${p.file} 200`); for(const a of articles)for(const old of a.meta.redirect_from)lines.push(`${old} /blog/${a.slug}/ 301!`); return lines.join('\n')+'\n'; }
function legacyPost(articles){ const map=Object.fromEntries(articles.map(a=>[a.slug,`/blog/${a.slug}/`])); return `'use strict';(function(){var p=new URLSearchParams(location.search).get('p');var map=${JSON.stringify(map)};location.replace(map[p]||'/blog');})();\n`; }
function validateDist(articles){ const forbiddenNames=/^(tests|scripts|templates|data|config|node_modules|fixtures)(\/|$)/; const forbiddenExt=/\.(md|log|py|toml|lock)$/i; const forbiddenWords=/(AUDITORIA|RELATORIO|CHECKLIST|PENDENCIAS|ROADMAP|CHANGELOG|MAPA-DE-)/i; for(const rel of listFiles(dist)){ if(forbiddenNames.test(rel)||forbiddenExt.test(rel)||forbiddenWords.test(path.basename(rel))||['package.json','package-lock.json','netlify.toml'].includes(rel)) fail(`Arquivo interno em dist: ${rel}`); }
  const index=fs.readFileSync(path.join(dist,'index.html'),'utf8'),contact=fs.readFileSync(path.join(dist,'contato.html'),'utf8'); for(const [name,html] of [['home',index],['contato',contact]]){ if(!html.includes('data-netlify="true"'))fail(`Netlify ausente: ${name}`); if(!html.includes('form-name'))fail(`form-name ausente: ${name}`); const hp=html.match(/netlify-honeypot="([^"]+)"/); if(!hp||!new RegExp(`name=\"${hp[1].replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}\"`).test(html))fail(`honeypot ausente ou divergente: ${name}`); }
  for(const rel of listFiles(dist).filter(x=>x.endsWith('.html'))){ const html=fs.readFileSync(path.join(dist,rel),'utf8'); const ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]); if(new Set(ids).size!==ids.length)fail(`IDs duplicados: ${rel}`); if(/undefined|null|\{\{[A-Z_]+\}\}/.test(html))fail(`Placeholder em saída: ${rel}`); if(/"priceRange"|AggregateRating/.test(html))fail(`Schema proibido: ${rel}`); }
  for(const a of articles){ const file=path.join(dist,'blog',a.slug,'index.html'); if(!fs.existsSync(file))fail(`Artigo ausente: ${a.slug}`); const html=fs.readFileSync(file,'utf8'); if((html.match(/id="fontes-oficiais"/g)||[]).length>1)fail(`Fontes duplicadas: ${a.slug}`); }
}

function main(){ const pythonVersion=validatePythonRuntime(); validateAuthority(); fs.rmSync(dist,{recursive:true,force:true}); fs.mkdirSync(dist,{recursive:true}); copyDir('assets'); copyDir('admin'); const articles=prepareRenderedArticles(loadArticles()); const blogTemplate=read('templates/blog.template.html'); const common=extractCommon(blogTemplate);
  for(const page of config.publicPages){ if(page.file==='blog.html')continue; let html=read(page.file); html=transformInstitutional(html,page.file); write(page.file,html); }
  write('blog.html',renderBlog(articles)); for(const a of articles)write(`blog/${a.slug}/index.html`,renderArticle(a,common,articles)); write('404.html',render404(common)); write('feed.xml',generateFeed(articles)); write('sitemap.xml',generateSitemap(articles)); write('robots.txt',publicIndexing?`User-agent: *\nAllow: /\nDisallow: /admin/\n\nSitemap: ${siteUrl}/sitemap.xml\n`:'User-agent: *\nDisallow: /\n'); write('_headers',generateHeaders()); write('_redirects',generateRedirects(articles)); write('assets/js/legacy-post.js',legacyPost(articles)); write('post.html',`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="robots" content="noindex, follow"><title>Artigo movido | Enterprise</title><script src="/assets/js/legacy-post.js" defer></script></head><body><main><h1>Este artigo mudou de endereço</h1><p><a href="/blog">Acessar o blog</a></p></main></body></html>`); validateDist(articles); console.log(`Build concluído em dist: ${articles.length} artigos; BUILD_DATE=${buildDate}; TIME_ZONE=${BUILD_TIME_ZONE}; PYTHON=${pythonVersion}; PUBLIC_INDEXING=${publicIndexing}; CONTEXT=${context}; hash=${dirHash(dist).slice(0,12)}`); }
main();
