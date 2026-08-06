/* Enterprise Assessoria Contábil — main.js */
(function () {
  'use strict';

  var WHATSAPP_NUMBER = '552126764328';
  var STORAGE_PREFIX = 'enterprise_lead_';
  var UTM_FIELDS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

  var ORIGINS = {
    index: { path: '/index.html', title: 'Página inicial' },
    blog: { path: '/blog.html', title: 'Blog' },
    'clinicas-saude': { path: '/contabilidade-para-clinicas-e-medicos.html', title: 'Contabilidade para clínicas e médicos' },
    'construcao-civil': { path: '/contabilidade-para-construcao-civil.html', title: 'Contabilidade para construção civil' },
    'prestadores-servico': { path: '/contabilidade-para-prestadores-de-servico.html', title: 'Contabilidade para prestadores de serviço' },
    transportadoras: { path: '/contabilidade-para-transportadoras.html', title: 'Contabilidade para transportadoras' },
    contato: { path: '/contato.html', title: 'Contato' },
    'gestao-financeira': { path: '/gestao-financeira.html', title: 'Gestão financeira' },
    planos: { path: '/planos.html', title: 'Planos contábeis' },
    'politica-privacidade': { path: '/politica-de-privacidade.html', title: 'Política de Privacidade' },
    post: { path: '/post.html', title: 'Conteúdo do blog' },
    'reforma-tributaria': { path: '/reforma-tributaria.html', title: 'Reforma Tributária' },
    segmentos: { path: '/segmentos.html', title: 'Segmentos atendidos' },
    servicos: { path: '/servicos.html', title: 'Serviços contábeis' },
    sobre: { path: '/sobre.html', title: 'Sobre a Enterprise' }
  };

  var SEGMENTS = {
    'transporte-logistica': {
      label: 'Transporte e logística',
      title: 'Vamos entender o cenário da sua transportadora',
      support: 'Informe o básico sobre a operação. Nossa equipe entrará em contato para direcionar uma avaliação contábil e tributária do setor.',
      approach: 'Investigar regime tributário, ICMS, créditos, estrutura da frota e particularidades da operação de transporte.'
    },
    'construcao-civil': {
      label: 'Construção civil',
      title: 'Vamos entender o cenário da sua empresa de construção',
      support: 'Informe o básico sobre a operação para iniciarmos uma avaliação adequada às particularidades da construção civil.',
      approach: 'Investigar tipo de obra, retenções, ISS, INSS, subempreitadas e organização contábil por empreendimento.'
    },
    'clinicas-saude': {
      label: 'Clínicas, médicos e saúde',
      title: 'Vamos entender o cenário da sua clínica ou atividade médica',
      support: 'Informe o básico sobre a operação. Nossa equipe entrará em contato para direcionar a avaliação contábil e tributária.',
      approach: 'Investigar regime tributário, fator R, folha, pró-labore, retenções e estrutura da atividade médica.'
    },
    'prestadores-servico': {
      label: 'Prestadores de serviço',
      title: 'Vamos entender o cenário da sua empresa de serviços',
      support: 'Informe o básico sobre a atividade para que nossa equipe direcione a avaliação contábil e tributária adequada.',
      approach: 'Investigar atividade, regime tributário, fator R, retenções e estrutura de custos.'
    }
  };

  var PLANS = {
    smart: { label: 'SMART', type: 'contabil' },
    advanced: { label: 'ADVANCED', type: 'contabil' },
    exclusive: { label: 'EXCLUSIVE', type: 'contabil' },
    starter: { label: 'STARTER', type: 'bpo' },
    basic: { label: 'BASIC', type: 'bpo' },
    pro: { label: 'PRO', type: 'bpo' }
  };

  var SERVICES = {
    contabilidade: 'Contabilidade',
    'contabilidade-mensal': 'Contabilidade mensal',
    'abertura-empresa': 'Abertura de empresa',
    'departamento-pessoal': 'Departamento pessoal',
    'planejamento-tributario': 'Planejamento tributário',
    'troca-contador': 'Troca de contador',
    'regularizacao-empresa': 'Regularização de empresa',
    'reforma-tributaria': 'Reforma Tributária',
    'gestao-financeira': 'Gestão financeira/BPO'
  };

  var CTAS = {
    'acesso-direto': 'Acesso direto à página de contato',
    'formulario-home': 'Formulário de avaliação da página inicial',
    'falar-especialista': 'Falar com um especialista',
    'diagnostico-gratuito': 'Quero meu diagnóstico gratuito',
    'quero-diagnostico': 'Quero meu diagnóstico',
    'diagnostico-caso': 'Quero um diagnóstico do meu caso',
    'descobrir-perdas': 'Descobrir quanto estou perdendo',
    'simular-impacto': 'Simular o impacto na minha empresa',
    'abrir-empresa': 'Abrir minha empresa',
    'falar-folha': 'Falar sobre folha',
    'revisar-tributacao': 'Revisar minha tributação',
    'trocar-contador': 'Trocar de contador',
    'regularizar-empresa': 'Regularizar empresa',
    'solicitar-proposta': 'Solicitar proposta',
    'avaliacao-gratuita': 'Quero uma avaliação gratuita',
    'avaliacao-gratuita-minha': 'Quero minha avaliação gratuita',
    'falar-conosco': 'Falar com a Enterprise',
    'falar-com-a-gente': 'Falar com a gente',
    'fale-com-a-gente': 'Fale com a gente',
    'conversar-contador': 'Conversar com um contador'
  };

  var INTERESTS = {
    'contato-geral': {
      description: 'Contato geral',
      service: 'Atendimento geral',
      eyebrow: 'Contato',
      title: 'Conte o básico sobre a sua empresa',
      support: 'Nossa equipe analisará sua solicitação e direcionará o atendimento adequado.',
      formTag: 'Atendimento personalizado',
      formTitle: 'Envie sua solicitação',
      formIntro: 'Compartilhe algumas informações básicas para direcionarmos o atendimento.',
      button: 'Enviar solicitação',
      approach: 'Entender a demanda apresentada e direcionar para o responsável adequado.'
    },
    'diagnostico-geral': {
      description: 'Diagnóstico geral',
      service: 'Avaliação contábil e tributária',
      eyebrow: 'Avaliação inicial gratuita',
      title: 'Vamos iniciar a avaliação da sua empresa',
      support: 'Compartilhe algumas informações básicas para que nossa equipe entenda seu cenário e conduza os próximos passos.',
      formTag: 'Avaliação inicial gratuita',
      formTitle: 'Conte sobre a sua empresa',
      formIntro: 'Estas informações ajudam nossa equipe a direcionar a avaliação adequada ao seu caso.',
      button: 'Solicitar avaliação',
      approach: 'Entender a atividade, o regime tributário, a estrutura da empresa e o motivo principal da avaliação.'
    },
    'diagnostico-segmento': {
      description: 'Diagnóstico por segmento',
      service: 'Avaliação contábil e tributária especializada',
      eyebrow: 'Avaliação especializada',
      title: 'Vamos entender o cenário da sua empresa',
      support: 'Informe o básico sobre a operação para direcionarmos uma avaliação adequada ao seu setor.',
      formTag: 'Avaliação especializada',
      formTitle: 'Conte sobre a sua operação',
      formIntro: 'Nossa equipe usará estas informações para direcionar o atendimento especializado.',
      button: 'Solicitar avaliação',
      approach: 'Entender o segmento, a operação, o regime atual e os principais pontos de atenção contábil e tributária.'
    },
    'reforma-tributaria': {
      description: 'Reforma Tributária',
      service: 'Avaliação de impacto de IBS e CBS',
      eyebrow: 'Reforma Tributária',
      title: 'Vamos avaliar como a Reforma Tributária pode afetar sua empresa',
      support: 'Informe o básico sobre o negócio. Nossa equipe entrará em contato para entender sua operação e orientar a análise de IBS e CBS.',
      formTag: 'Avaliação tributária',
      formTitle: 'Conte sobre a operação da empresa',
      formIntro: 'Estas informações iniciam a avaliação dos possíveis impactos de IBS e CBS.',
      button: 'Solicitar avaliação tributária',
      approach: 'Entender a operação, o regime atual, os principais custos e o potencial impacto de IBS e CBS.'
    },
    'planejamento-tributario': {
      description: 'Planejamento ou revisão tributária',
      service: 'Planejamento tributário',
      eyebrow: 'Avaliação tributária',
      title: 'Vamos investigar possíveis riscos e oportunidades tributárias',
      support: 'Nossa equipe utilizará estas informações para iniciar a avaliação do regime e da estrutura tributária da empresa.',
      formTag: 'Revisão tributária',
      formTitle: 'Conte sobre a estrutura atual',
      formIntro: 'Compartilhe o básico para iniciarmos a análise do regime e da tributação da empresa.',
      button: 'Solicitar avaliação tributária',
      approach: 'Investigar atividade, regime atual, faturamento, custos, folha e oportunidades de enquadramento tributário.'
    },
    'abertura-empresa': {
      description: 'Abertura de empresa',
      service: 'Abertura de empresa',
      eyebrow: 'Abertura de empresa',
      title: 'Vamos preparar a abertura da sua empresa',
      support: 'Conte o básico sobre a atividade que pretende exercer. Nossa equipe orientará os próximos passos.',
      formTag: 'Orientação para abertura',
      formTitle: 'Conte sobre o negócio que pretende abrir',
      formIntro: 'Não é necessário já possuir empresa, funcionários ou regime tributário definido.',
      button: 'Solicitar orientação',
      approach: 'Entender atividade, local de operação, estrutura societária, expectativa de contratação e necessidade de emissão de notas.'
    },
    'departamento-pessoal': {
      description: 'Departamento pessoal',
      service: 'Folha e departamento pessoal',
      eyebrow: 'Departamento pessoal',
      title: 'Vamos entender sua necessidade de folha e departamento pessoal',
      support: 'Compartilhe algumas informações sobre a empresa e sua equipe para direcionarmos o atendimento.',
      formTag: 'Folha e equipe',
      formTitle: 'Conte sobre a sua necessidade',
      formIntro: 'Informe o básico sobre a empresa e a quantidade aproximada de funcionários.',
      button: 'Solicitar atendimento',
      approach: 'Entender folha, admissões, férias, rescisões, eSocial, quantidade de funcionários e urgência da demanda.'
    },
    'troca-contador': {
      description: 'Troca de contador',
      service: 'Troca de contador',
      eyebrow: 'Troca de contador',
      title: 'Vamos entender sua troca de contador',
      support: 'Conte o básico sobre sua empresa. Nossa equipe explicará como funciona a transição e os próximos passos.',
      formTag: 'Transição contábil',
      formTitle: 'Conte sobre a empresa e a troca',
      formIntro: 'Estas informações ajudam a preparar uma transição organizada e segura.',
      button: 'Falar sobre a troca',
      approach: 'Entender motivo da troca, regime, quantidade de funcionários, pendências e urgência da transição.'
    },
    'regularizacao-empresa': {
      description: 'Regularização de empresa',
      service: 'Regularização e certidões',
      eyebrow: 'Regularização',
      title: 'Vamos identificar o caminho para regularizar sua empresa',
      support: 'Informe o básico sobre a situação. Nossa equipe entrará em contato para entender as pendências.',
      formTag: 'Regularização empresarial',
      formTitle: 'Conte sobre a situação atual',
      formIntro: 'Descreva brevemente as pendências ou documentos que precisam ser regularizados.',
      button: 'Solicitar atendimento',
      approach: 'Identificar órgãos envolvidos, débitos, certidões, guias vencidas e grau de urgência.'
    },
    'proposta-contabil': {
      description: 'Proposta de contabilidade',
      service: 'Plano de contabilidade',
      eyebrow: 'Proposta contábil',
      title: 'Vamos preparar uma proposta adequada ao seu negócio',
      support: 'Informe o básico sobre sua empresa para que a proposta considere seu porte e sua necessidade real.',
      formTag: 'Proposta personalizada',
      formTitle: 'Conte sobre a sua empresa',
      formIntro: 'O porte, o regime e a estrutura da empresa ajudam a definir a proposta mais adequada.',
      button: 'Solicitar proposta',
      approach: 'Entender atividade, regime, volume da operação, quantidade de funcionários e nível de acompanhamento esperado.'
    },
    'avaliacao-bpo': {
      description: 'Avaliação de gestão financeira',
      service: 'Gestão financeira/BPO',
      eyebrow: 'Gestão financeira',
      title: 'Vamos avaliar a organização financeira da sua empresa',
      support: 'Conte o básico sobre sua operação para que nossa equipe entenda o nível de apoio financeiro necessário.',
      formTag: 'Avaliação financeira',
      formTitle: 'Conte sobre a rotina financeira',
      formIntro: 'Estas informações ajudam a identificar o nível de organização e apoio necessário.',
      button: 'Solicitar avaliação financeira',
      approach: 'Entender contas a pagar e receber, conciliação, fluxo de caixa, volume de movimentações e estrutura financeira atual.'
    },
    'proposta-bpo': {
      description: 'Proposta de gestão financeira',
      service: 'Gestão financeira/BPO',
      eyebrow: 'Plano de gestão financeira',
      title: 'Vamos preparar uma proposta adequada ao seu negócio',
      support: 'Informe o básico sobre sua empresa para que a proposta considere sua rotina e sua necessidade financeira real.',
      formTag: 'Proposta de gestão financeira',
      formTitle: 'Conte sobre a rotina financeira',
      formIntro: 'O volume da operação e o nível de apoio desejado ajudam a definir a proposta.',
      button: 'Solicitar proposta',
      approach: 'Entender contas a pagar e receber, conciliação, fluxo de caixa, volume de movimentações e estrutura financeira atual.'
    }
  };

  function hasOwn(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
  }

  function safeSessionGet(key) {
    try { return window.sessionStorage.getItem(STORAGE_PREFIX + key); } catch (err) { return null; }
  }

  function safeSessionSet(key, value) {
    try { window.sessionStorage.setItem(STORAGE_PREFIX + key, value); } catch (err) {}
  }

  function currentPageValue() {
    return window.location.pathname + window.location.search;
  }

  function initializeSessionTracking() {
    if (!safeSessionGet('landing_page')) safeSessionSet('landing_page', currentPageValue());
    if (!safeSessionGet('referrer_inicial')) safeSessionSet('referrer_inicial', document.referrer || 'Não informado');

    var params = new URLSearchParams(window.location.search);
    UTM_FIELDS.forEach(function (field) {
      var value = params.get(field);
      if (value) safeSessionSet(field, value.slice(0, 250));
    });
  }

  function validParam(params, name, allowed, fallback) {
    var value = params.get(name);
    return value && hasOwn(allowed, value) ? value : fallback;
  }

  function getContactContext() {
    var params = new URLSearchParams(window.location.search);
    var interestCode = validParam(params, 'interesse', INTERESTS, 'contato-geral');
    var originCode = validParam(params, 'origem', ORIGINS, 'contato');
    var ctaCode = validParam(params, 'cta', CTAS, 'acesso-direto');
    var segmentCode = validParam(params, 'segmento', SEGMENTS, '');
    var planCode = validParam(params, 'plano', PLANS, '');
    var serviceCode = validParam(params, 'servico', SERVICES, '');

    return {
      interestCode: interestCode,
      originCode: originCode,
      ctaCode: ctaCode,
      segmentCode: segmentCode,
      planCode: planCode,
      serviceCode: serviceCode
    };
  }

  function getHomeContext() {
    return {
      interestCode: 'diagnostico-geral',
      originCode: 'index',
      ctaCode: 'formulario-home',
      segmentCode: '',
      planCode: '',
      serviceCode: 'contabilidade'
    };
  }

  function normalizeCtaText(value) {
    return String(value || '').replace(/\s+/g, ' ').trim().slice(0, 180);
  }

  function getHomeContextFromLink(link) {
    if (!link) return null;

    var interestCode = link.getAttribute('data-lead-interest');
    var originCode = link.getAttribute('data-lead-origin');
    var ctaCode = link.getAttribute('data-lead-cta');
    var serviceCode = link.getAttribute('data-lead-service');
    var planCode = link.getAttribute('data-lead-plan') || '';
    var segmentCode = link.getAttribute('data-lead-segment') || '';

    if (!hasOwn(INTERESTS, interestCode) || !hasOwn(ORIGINS, originCode) || !hasOwn(CTAS, ctaCode) || !hasOwn(SERVICES, serviceCode)) return null;
    if (planCode && !hasOwn(PLANS, planCode)) return null;
    if (segmentCode && !hasOwn(SEGMENTS, segmentCode)) return null;

    return {
      interestCode: interestCode,
      originCode: originCode,
      ctaCode: ctaCode,
      ctaText: normalizeCtaText(link.textContent) || CTAS[ctaCode],
      segmentCode: segmentCode,
      planCode: planCode,
      serviceCode: serviceCode
    };
  }

  function resolveContext(context) {
    var interest = INTERESTS[context.interestCode] || INTERESTS['contato-geral'];
    var origin = ORIGINS[context.originCode] || ORIGINS.contato;
    var ctaText = context.ctaText || CTAS[context.ctaCode] || CTAS['acesso-direto'];
    var segment = context.segmentCode ? SEGMENTS[context.segmentCode] : null;
    var plan = context.planCode ? PLANS[context.planCode] : null;
    var service = context.serviceCode ? SERVICES[context.serviceCode] : interest.service;
    var presentation = {
      eyebrow: interest.eyebrow,
      title: interest.title,
      support: interest.support,
      formTag: interest.formTag,
      formTitle: interest.formTitle,
      formIntro: interest.formIntro,
      button: interest.button
    };

    if (segment && (context.interestCode === 'diagnostico-segmento' || context.interestCode === 'planejamento-tributario')) {
      presentation.eyebrow = context.interestCode === 'planejamento-tributario' ? 'Avaliação tributária especializada' : 'Avaliação especializada';
      presentation.title = segment.title;
      presentation.support = segment.support;
      presentation.formTag = segment.label;
      presentation.formTitle = 'Conte sobre a sua operação';
      presentation.formIntro = context.interestCode === 'planejamento-tributario'
        ? 'Estas informações ajudam a iniciar a revisão tributária considerando as particularidades do setor.'
        : 'Nossa equipe usará estas informações para direcionar a avaliação especializada.';
    }

    return {
      context: context,
      interest: interest,
      origin: origin,
      ctaText: ctaText,
      segment: segment,
      plan: plan,
      service: service,
      presentation: presentation,
      approach: segment && context.interestCode !== 'reforma-tributaria' && context.interestCode !== 'avaliacao-bpo' && context.interestCode !== 'proposta-bpo'
        ? segment.approach
        : interest.approach
    };
  }

  function planDisplay(resolved) {
    if (!resolved.plan) return '';
    return resolved.plan.type === 'bpo'
      ? 'Plano ' + resolved.plan.label + ' de gestão financeira'
      : 'Plano ' + resolved.plan.label;
  }

  function setText(id, value) {
    var el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function applyContactPresentation(resolved) {
    setText('contact-eyebrow', resolved.presentation.eyebrow);
    setText('contact-title', resolved.presentation.title);
    setText('contact-support', resolved.presentation.support);
    setText('contact-form-tag', resolved.presentation.formTag);
    setText('contact-form-title', resolved.presentation.formTitle);
    setText('contact-form-intro', resolved.presentation.formIntro);
    setText('contact-submit', resolved.presentation.button);
    var contactSubmit = document.getElementById('contact-submit');
    if (contactSubmit) contactSubmit.setAttribute('data-original-text', resolved.presentation.button);

    var summary = document.getElementById('contact-interest-summary');
    if (summary) {
      var plan = planDisplay(resolved);
      if (plan) {
        summary.textContent = 'Interesse informado: ' + plan;
        summary.hidden = false;
      } else if (resolved.segment) {
        summary.textContent = 'Atendimento direcionado para: ' + resolved.segment.label;
        summary.hidden = false;
      } else {
        summary.hidden = true;
        summary.textContent = '';
      }
    }
  }

  function homePresentation(resolved) {
    var presentation = {
      tag: 'Avaliação inicial gratuita',
      title: 'Vamos entender o cenário da sua empresa',
      intro: 'Preencha algumas informações básicas. Nossa equipe receberá o contexto da sua empresa e entrará em contato para direcionar a avaliação mais adequada ao seu caso.',
      button: 'Solicitar avaliação'
    };

    if (resolved.context.interestCode === 'reforma-tributaria') {
      presentation.tag = 'Reforma Tributária';
      presentation.title = 'Vamos avaliar como a Reforma Tributária pode afetar sua empresa';
      presentation.intro = 'Informe o básico sobre o negócio. Nossa equipe entrará em contato para entender sua operação e orientar a avaliação de IBS e CBS.';
      presentation.button = 'Solicitar avaliação tributária';
    } else if (resolved.context.interestCode === 'proposta-contabil') {
      presentation.tag = 'Proposta contábil';
      presentation.title = 'Vamos preparar uma proposta adequada ao seu negócio';
      presentation.intro = 'Informe o básico sobre sua empresa para que a proposta considere seu porte e sua necessidade real.';
      presentation.button = 'Solicitar proposta';
    } else if (resolved.context.interestCode === 'contato-geral') {
      presentation.tag = 'Atendimento personalizado';
      presentation.title = 'Conte o básico sobre a sua empresa';
      presentation.intro = 'Nossa equipe analisará sua solicitação e direcionará o atendimento adequado.';
      presentation.button = 'Enviar solicitação';
    }

    return presentation;
  }

  function applyHomePresentation(resolved) {
    var presentation = homePresentation(resolved);
    setText('home-form-tag', presentation.tag);
    setText('home-form-title', presentation.title);
    setText('home-form-intro', presentation.intro);
    setText('home-submit', presentation.button);

    var submit = document.getElementById('home-submit');
    if (submit) submit.setAttribute('data-original-text', presentation.button);

    var summary = document.getElementById('home-interest-summary');
    if (!summary) return;
    var plan = planDisplay(resolved);
    if (plan) {
      summary.textContent = 'Interesse informado: ' + plan;
      summary.hidden = false;
    } else {
      summary.textContent = '';
      summary.hidden = true;
    }
  }

  function formatBrasilia(date) {
    try {
      var parts = new Intl.DateTimeFormat('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false
      }).formatToParts(date);
      var values = {};
      parts.forEach(function (part) { values[part.type] = part.value; });
      return values.day + '/' + values.month + '/' + values.year + ' ' + values.hour + ':' + values.minute + ':' + values.second;
    } catch (err) {
      return date.toLocaleString('pt-BR');
    }
  }

  function makeLeadId(date) {
    var ymd = date.getUTCFullYear() +
      String(date.getUTCMonth() + 1).padStart(2, '0') +
      String(date.getUTCDate()).padStart(2, '0');
    var randomPart = '';
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
      randomPart = window.crypto.randomUUID().replace(/-/g, '').slice(0, 8);
    } else if (window.crypto && typeof window.crypto.getRandomValues === 'function') {
      var bytes = new Uint8Array(4);
      window.crypto.getRandomValues(bytes);
      randomPart = Array.prototype.map.call(bytes, function (b) { return b.toString(16).padStart(2, '0'); }).join('');
    } else {
      randomPart = Math.random().toString(16).slice(2, 10).padEnd(8, '0');
    }
    return 'ENT-' + ymd + '-' + randomPart;
  }

  function deviceClass() {
    var width = window.innerWidth || (window.screen && window.screen.width) || 0;
    if (!width) return 'Não identificado';
    if (width <= 767) return 'Celular';
    if (width <= 1024) return 'Tablet';
    return 'Desktop';
  }

  function absoluteOriginUrl(originPath) {
    try { return new URL(originPath.replace(/^\//, ''), window.location.href).href; }
    catch (err) { return originPath; }
  }

  function campaignSummary() {
    var source = safeSessionGet('utm_source') || 'Não informado';
    var medium = safeSessionGet('utm_medium') || 'Não informado';
    var campaign = safeSessionGet('utm_campaign') || 'Não informado';
    return source + ' / ' + medium + ' / ' + campaign;
  }

  function commercialSummary(resolved) {
    return [
      'Interesse: ' + resolved.interest.description,
      'Promessa que motivou o lead: ' + resolved.ctaText,
      'Página de origem: ' + resolved.origin.title,
      'Segmento contextual: ' + (resolved.segment ? resolved.segment.label : 'Não informado'),
      'Plano de interesse: ' + (planDisplay(resolved) || 'Não informado'),
      'Campanha: ' + campaignSummary()
    ].join('\n');
  }

  function setFormValue(form, name, value) {
    var field = form.elements.namedItem(name);
    if (field) field.value = value == null ? '' : String(value);
  }

  function populateTracking(form, resolved, createSubmissionData, leadId) {
    var now = new Date();
    var landingPage = safeSessionGet('landing_page') || currentPageValue();
    var referrer = safeSessionGet('referrer_inicial') || document.referrer || 'Não informado';

    setFormValue(form, 'lead_id', leadId || (createSubmissionData ? makeLeadId(now) : ''));
    setFormValue(form, 'data_hora_iso', createSubmissionData ? now.toISOString() : '');
    setFormValue(form, 'data_hora_brasilia', createSubmissionData ? formatBrasilia(now) : '');
    setFormValue(form, 'pagina_origem', resolved.origin.path);
    setFormValue(form, 'titulo_pagina_origem', resolved.origin.title);
    setFormValue(form, 'url_origem', absoluteOriginUrl(resolved.origin.path));
    setFormValue(form, 'pagina_formulario', window.location.pathname || '/');
    setFormValue(form, 'url_envio', window.location.href);
    setFormValue(form, 'cta_codigo', resolved.context.ctaCode);
    setFormValue(form, 'cta_texto', resolved.ctaText);
    setFormValue(form, 'interesse_codigo', resolved.context.interestCode);
    setFormValue(form, 'interesse_descricao', resolved.interest.description);
    setFormValue(form, 'servico_interesse', resolved.service);
    setFormValue(form, 'segmento_contexto', resolved.segment ? resolved.segment.label : 'Não informado');
    setFormValue(form, 'plano_interesse', planDisplay(resolved) || 'Não informado');
    setFormValue(form, 'landing_page', landingPage);
    setFormValue(form, 'referrer_inicial', referrer);
    UTM_FIELDS.forEach(function (field) { setFormValue(form, field, safeSessionGet(field) || 'Não informado'); });
    setFormValue(form, 'dispositivo', deviceClass());
    setFormValue(form, 'abordagem_sugerida', resolved.approach);
    setFormValue(form, 'resumo_comercial', commercialSummary(resolved));
    setFormValue(form, 'origem', resolved.origin.path);
  }

  function encodeForm(data) {
    return Object.keys(data).map(function (key) {
      return encodeURIComponent(key) + '=' + encodeURIComponent(data[key]);
    }).join('&');
  }

  function formDataObject(form) {
    var data = {};
    Array.prototype.forEach.call(form.elements, function (el) {
      if (!el.name || el.type === 'submit' || el.disabled) return;
      if (el.type === 'checkbox') data[el.name] = el.checked ? 'sim' : 'não';
      else data[el.name] = typeof el.value === 'string' ? el.value.trim() : el.value;
    });
    data['form-name'] = form.getAttribute('name') || 'diagnostico';
    return data;
  }

  function whatsappMessage(data, resolved, includeName) {
    var lines = [includeName
      ? 'Olá! Acabei de enviar uma solicitação pelo site da Enterprise.'
      : 'Olá! Quero falar com a Enterprise sobre uma solicitação iniciada no site.'];
    if (includeName) lines.push('Nome: ' + (data.nome || 'Não informado'));
    lines.push(
      'Interesse: ' + resolved.interest.description,
      'Segmento: ' + (resolved.segment ? resolved.segment.label : (data.segmento || 'Não informado')),
      'Plano: ' + (planDisplay(resolved) || 'Não informado'),
      'Identificador: ' + (data.lead_id || 'Não informado')
    );
    return lines.join('\n');
  }

  function configureWhatsappLink(link, data, resolved, options) {
    if (!link) return;
    options = options || {};
    link.href = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(
      whatsappMessage(data, resolved, options.includeName !== false)
    );
    if (options.label) link.textContent = options.label;
    link.classList.toggle('form-whatsapp--success', options.mode === 'success');
    link.hidden = false;
  }

  function showFormMessage(msg, text, type) {
    if (!msg) return;
    msg.textContent = text;
    msg.classList.remove('form-msg--success', 'form-msg--error');
    msg.classList.add(type === 'error' ? 'form-msg--error' : 'form-msg--success');
    msg.hidden = false;
  }

  function clearFormFeedback(form) {
    if (!form) return;
    var msg = form.querySelector('.form-msg');
    var whatsappLink = form.querySelector('.form-whatsapp');
    var actions = form.querySelector('.home-form-actions');
    if (msg) {
      msg.hidden = true;
      msg.textContent = '';
      msg.classList.remove('form-msg--success', 'form-msg--error');
    }
    if (whatsappLink) {
      whatsappLink.hidden = true;
      whatsappLink.href = 'https://wa.me/' + WHATSAPP_NUMBER;
      whatsappLink.classList.remove('form-whatsapp--success');
    }
    if (actions) actions.classList.remove('form-actions--completed');
  }

  function restoreSubmitButton(form, resolved, state) {
    if (!form || (state && state.submitting)) return;
    var button = form.querySelector('button[type="submit"]');
    if (!button) return;
    var text = form === document.getElementById('form-diagnostico')
      ? homePresentation(resolved).button
      : resolved.presentation.button;
    button.disabled = false;
    button.textContent = text;
    button.setAttribute('data-original-text', text);
  }

  function setHomeWhatsappState(form, resolved, state, mode) {
    if (!form || !resolved) return;
    var link = form.querySelector('.form-whatsapp');
    var actions = form.querySelector('.home-form-actions');
    var success = mode === 'success';
    var data = formDataObject(form);
    if (state && state.leadId) data.lead_id = state.leadId;
    configureWhatsappLink(link, data, resolved, {
      includeName: false,
      mode: success ? 'success' : 'initial',
      label: success ? 'Continuar agora pelo WhatsApp' : 'Prefere falar agora? Chame no WhatsApp'
    });
    if (actions) actions.classList.toggle('form-actions--completed', success);
  }

  function setSubmissionPending(form, state, pending) {
    if (!form || !state) return;
    state.submitting = pending;
    var closeButton = document.getElementById('home-form-close');
    if (pending) {
      form.setAttribute('aria-busy', 'true');
      form.setAttribute('data-submitting', 'true');
    } else {
      form.removeAttribute('aria-busy');
      form.removeAttribute('data-submitting');
    }
    if (closeButton) closeButton.disabled = pending;
  }

  function createHomeFormState() {
    return {
      leadId: makeLeadId(new Date()),
      submitting: false,
      completed: false
    };
  }

  function resetHomeFormForNewRequest(form, state, resolved) {
    if (!form || !state || state.submitting) return;
    form.reset();
    var optional = document.getElementById('home-form-optional');
    if (optional) optional.open = false;
    clearFormFeedback(form);
    form.removeAttribute('aria-busy');
    form.removeAttribute('data-submitting');
    state.leadId = makeLeadId(new Date());
    state.submitting = false;
    state.completed = false;
    applyHomePresentation(resolved);
    restoreSubmitButton(form, resolved, state);
    populateTracking(form, resolved, false, state.leadId);
    setHomeWhatsappState(form, resolved, state, 'initial');
  }

  function handleForm(form, contextProvider, options) {
    if (!form) return;
    options = options || {};
    var state = options.state || null;
    var isHomeForm = form.id === 'form-diagnostico';
    var getResolved = typeof contextProvider === 'function' ? contextProvider : function () { return contextProvider; };
    var initialResolved = getResolved();
    populateTracking(form, initialResolved, false, state ? state.leadId : '');
    if (isHomeForm) setHomeWhatsappState(form, initialResolved, state, 'initial');

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (state && state.submitting) return;

      var resolved = getResolved();
      var msg = form.querySelector('.form-msg');
      var whatsappLink = form.querySelector('.form-whatsapp');
      var honeypot = form.elements.namedItem('empresa_site');
      var button = form.querySelector('button[type="submit"]');
      var originalButtonText = button.getAttribute('data-original-text') || button.textContent;
      button.setAttribute('data-original-text', originalButtonText);

      if (honeypot && honeypot.value !== '') return;
      if (!form.checkValidity()) { form.reportValidity(); return; }

      if (msg) msg.hidden = true;
      if (isHomeForm) {
        var actions = form.querySelector('.home-form-actions');
        if (actions) actions.classList.remove('form-actions--completed');
        if (whatsappLink) whatsappLink.classList.remove('form-whatsapp--success');
      } else if (whatsappLink) {
        whatsappLink.hidden = true;
      }

      if (state && !state.leadId) state.leadId = makeLeadId(new Date());
      populateTracking(form, resolved, true, state ? state.leadId : '');
      var data = formDataObject(form);
      var firstName = (data.nome || '').split(/\s+/)[0];

      if (state) setSubmissionPending(form, state, true);
      button.disabled = true;
      button.textContent = state ? 'Enviando...' : 'Enviando…';

      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encodeForm(data)
      }).then(function (response) {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        if (state) {
          setSubmissionPending(form, state, false);
          state.completed = true;
        }
        showFormMessage(
          msg,
          'Recebemos sua solicitação' + (firstName ? ', ' + firstName : '') + '. Nossa equipe entrará em contato em até 1 dia útil.',
          'success'
        );
        button.textContent = 'Solicitação enviada';
        button.disabled = true;
        if (isHomeForm) setHomeWhatsappState(form, resolved, state, 'success');
        else configureWhatsappLink(whatsappLink, data, resolved);
        if (typeof options.onSuccess === 'function') options.onSuccess(data, resolved);
      }).catch(function (err) {
        if (window.console) console.error('Falha ao enviar o formulário à Netlify:', err);
        if (state) {
          setSubmissionPending(form, state, false);
          state.completed = false;
        }
        showFormMessage(
          msg,
          'Não foi possível enviar sua solicitação agora. Tente novamente ou fale conosco pelo WhatsApp.',
          'error'
        );
        restoreSubmitButton(form, resolved, state);
        if (isHomeForm) setHomeWhatsappState(form, resolved, state, 'initial');
        else configureWhatsappLink(whatsappLink, data, resolved);
        if (typeof options.onError === 'function') options.onError(err, data, resolved);
      });
    });
  }

  function setupHomeModal(form, dialog, getActiveContext, setActiveContext, state) {
    if (!form || !dialog) return null;

    var closeButton = document.getElementById('home-form-close');
    var originalParent = dialog.parentNode;
    var originalNextSibling = dialog.nextSibling;
    var opener = null;
    var open = false;
    var scrollY = 0;
    var bodyStyle = null;
    var backgroundState = [];
    var lgpdState = null;
    var backdrop = document.createElement('div');
    backdrop.className = 'home-form-backdrop';
    backdrop.id = 'home-form-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');
    backdrop.hidden = true;
    document.body.appendChild(backdrop);

    function trackedLinkFromEventTarget(target) {
      return target && typeof target.closest === 'function'
        ? target.closest('a[href="#diagnostico"][data-lead-interest]')
        : null;
    }

    function focusableElements() {
      var selector = [
        'a[href]',
        'button:not([disabled])',
        'input:not([disabled]):not([type="hidden"])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        'summary',
        '[tabindex]:not([tabindex="-1"])'
      ].join(',');
      return Array.prototype.filter.call(dialog.querySelectorAll(selector), function (element) {
        return !element.hidden && element.getAttribute('aria-hidden') !== 'true' && element.getClientRects().length > 0;
      });
    }

    function lockDocumentScroll() {
      scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
      var scrollbarWidth = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
      bodyStyle = {
        position: document.body.style.position,
        top: document.body.style.top,
        left: document.body.style.left,
        right: document.body.style.right,
        width: document.body.style.width,
        overflow: document.body.style.overflow,
        paddingRight: document.body.style.paddingRight
      };
      document.body.classList.add('body-modal-open');
      document.body.style.position = 'fixed';
      document.body.style.top = '-' + scrollY + 'px';
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      if (scrollbarWidth) document.body.style.paddingRight = scrollbarWidth + 'px';
    }

    function unlockDocumentScroll() {
      if (!bodyStyle) return;
      document.body.classList.remove('body-modal-open');
      document.body.style.position = bodyStyle.position;
      document.body.style.top = bodyStyle.top;
      document.body.style.left = bodyStyle.left;
      document.body.style.right = bodyStyle.right;
      document.body.style.width = bodyStyle.width;
      document.body.style.overflow = bodyStyle.overflow;
      document.body.style.paddingRight = bodyStyle.paddingRight;
      var rootScrollBehavior = document.documentElement.style.scrollBehavior;
      document.documentElement.style.scrollBehavior = 'auto';
      window.scrollTo(0, scrollY);
      document.documentElement.style.scrollBehavior = rootScrollBehavior;
      bodyStyle = null;
    }

    function hideLgpdForModal() {
      var banner = document.getElementById('lgpd');
      if (!banner || lgpdState) return;
      lgpdState = {
        banner: banner,
        hadHiddenClass: banner.classList.contains('lgpd--modal-hidden'),
        ariaHidden: banner.getAttribute('aria-hidden'),
        inertSupported: 'inert' in banner,
        inert: 'inert' in banner ? banner.inert : null,
        shouldHide: banner.getAttribute('data-show') === 'true'
      };
      if (!lgpdState.shouldHide) return;
      banner.classList.add('lgpd--modal-hidden');
      banner.setAttribute('aria-hidden', 'true');
      if (lgpdState.inertSupported) banner.inert = true;
    }

    function restoreLgpdAfterModal() {
      if (!lgpdState) return;
      var banner = lgpdState.banner;
      if (lgpdState.hadHiddenClass) banner.classList.add('lgpd--modal-hidden');
      else banner.classList.remove('lgpd--modal-hidden');
      if (lgpdState.ariaHidden === null) banner.removeAttribute('aria-hidden');
      else banner.setAttribute('aria-hidden', lgpdState.ariaHidden);
      if (lgpdState.inertSupported) banner.inert = lgpdState.inert;
      lgpdState = null;
    }

    function hideBackgroundFromAssistiveTechnology() {
      backgroundState = [];
      Array.prototype.forEach.call(document.body.children, function (element) {
        if (element === dialog || element === backdrop || element.id === 'lgpd' || element.tagName === 'SCRIPT') return;
        backgroundState.push({
          element: element,
          ariaHidden: element.getAttribute('aria-hidden'),
          inert: 'inert' in element ? element.inert : null
        });
        element.setAttribute('aria-hidden', 'true');
        if ('inert' in element) element.inert = true;
      });
    }

    function restoreBackgroundAccessibility() {
      backgroundState.forEach(function (item) {
        if (item.ariaHidden === null) item.element.removeAttribute('aria-hidden');
        else item.element.setAttribute('aria-hidden', item.ariaHidden);
        if (item.inert !== null) item.element.inert = item.inert;
      });
      backgroundState = [];
    }

    function prepareContext(nextContext) {
      if (state.submitting) return null;
      setActiveContext(nextContext);
      var resolved = resolveContext(getActiveContext());

      if (state.completed) {
        resetHomeFormForNewRequest(form, state, resolved);
      } else {
        clearFormFeedback(form);
        applyHomePresentation(resolved);
        restoreSubmitButton(form, resolved, state);
        populateTracking(form, resolved, false, state.leadId);
        setHomeWhatsappState(form, resolved, state, 'initial');
      }
      return resolved;
    }

    function openModal(link) {
      if (state.submitting) return false;
      var nextContext = getHomeContextFromLink(link);
      if (!nextContext) return false;
      opener = link;

      if (!open) lockDocumentScroll();
      var resolved = prepareContext(nextContext);
      if (!resolved) return false;

      if (!open) {
        backdrop.hidden = false;
        document.body.appendChild(dialog);
        dialog.classList.add('home-form-modal-open');
        dialog.setAttribute('role', 'dialog');
        dialog.setAttribute('aria-modal', 'true');
        dialog.setAttribute('aria-labelledby', 'home-form-title');
        dialog.setAttribute('aria-describedby', 'home-form-intro');
        if (closeButton) {
          closeButton.hidden = false;
          closeButton.disabled = false;
        }
        hideLgpdForModal();
        hideBackgroundFromAssistiveTechnology();
        open = true;
      }

      window.requestAnimationFrame(function () {
        if (closeButton) closeButton.focus();
        else document.getElementById('home-form-title').focus();
      });
      return true;
    }

    function closeModal() {
      if (!open || state.submitting) return false;
      open = false;
      dialog.classList.remove('home-form-modal-open');
      dialog.removeAttribute('role');
      dialog.removeAttribute('aria-modal');
      dialog.removeAttribute('aria-labelledby');
      dialog.removeAttribute('aria-describedby');
      if (closeButton) {
        closeButton.disabled = false;
        closeButton.hidden = true;
      }
      backdrop.hidden = true;
      restoreBackgroundAccessibility();
      restoreLgpdAfterModal();

      if (originalNextSibling && originalNextSibling.parentNode === originalParent) {
        originalParent.insertBefore(dialog, originalNextSibling);
      } else {
        originalParent.appendChild(dialog);
      }
      unlockDocumentScroll();

      var focusTarget = opener;
      opener = null;
      if (focusTarget && typeof focusTarget.focus === 'function') focusTarget.focus();
      return true;
    }

    document.addEventListener('click', function (event) {
      var link = trackedLinkFromEventTarget(event.target);
      if (!link) return;
      event.preventDefault();
      openModal(link);
    });

    document.addEventListener('keydown', function (event) {
      var link = trackedLinkFromEventTarget(event.target);
      if (!open && link && (event.key === ' ' || event.key === 'Spacebar')) {
        event.preventDefault();
        openModal(link);
        return;
      }

      if (!open) return;
      if (event.key === 'Escape' || event.key === 'Esc') {
        event.preventDefault();
        closeModal();
        return;
      }
      if (event.key !== 'Tab') return;

      var focusables = focusableElements();
      if (!focusables.length) {
        event.preventDefault();
        if (closeButton && !closeButton.disabled) closeButton.focus();
        else dialog.focus();
        return;
      }
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      } else if (!dialog.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
      }
    });

    if (closeButton) closeButton.addEventListener('click', closeModal);
    backdrop.addEventListener('click', closeModal);
    dialog.addEventListener('click', function (event) { event.stopPropagation(); });

    return {
      open: openModal,
      close: closeModal,
      isOpen: function () { return open; }
    };
  }

  initializeSessionTracking();

  /* ---------- Ano no rodapé ---------- */
  var year = document.getElementById('ano');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Menu mobile ---------- */
  var burger = document.querySelector('.burger');
  var nav = document.getElementById('nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.getAttribute('data-open') === 'true';
      nav.setAttribute('data-open', String(!open));
      burger.setAttribute('aria-expanded', String(!open));
      burger.setAttribute('aria-label', !open ? 'Fechar menu' : 'Abrir menu');
    });
    nav.addEventListener('click', function (event) {
      if (event.target.tagName === 'A') {
        nav.setAttribute('data-open', 'false');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- Máscara de telefone ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('input[type="tel"][name="whatsapp"]'), function (tel) {
    tel.addEventListener('input', function () {
      var value = tel.value.replace(/\D/g, '').slice(0, 11);
      if (value.length > 6) value = '(' + value.slice(0, 2) + ') ' + value.slice(2, 7) + '-' + value.slice(7);
      else if (value.length > 2) value = '(' + value.slice(0, 2) + ') ' + value.slice(2);
      else if (value.length > 0) value = '(' + value;
      tel.value = value;
    });
  });

  var homeContext = getHomeContext();
  var homeFormState = createHomeFormState();
  var contactResolved = resolveContext(getContactContext());
  applyContactPresentation(contactResolved);
  var homeForm = document.getElementById('form-diagnostico');
  var homeDialog = document.getElementById('diagnostico');
  applyHomePresentation(resolveContext(homeContext));
  handleForm(homeForm, function () { return resolveContext(homeContext); }, { state: homeFormState });
  setupHomeModal(
    homeForm,
    homeDialog,
    function () { return homeContext; },
    function (nextContext) { homeContext = nextContext; },
    homeFormState
  );
  var homeWhatsappLink = homeForm && homeForm.querySelector('.form-whatsapp');
  if (homeWhatsappLink) {
    homeWhatsappLink.addEventListener('click', function () {
      setHomeWhatsappState(
        homeForm,
        resolveContext(homeContext),
        homeFormState,
        homeFormState.completed ? 'success' : 'initial'
      );
    });
  }
  handleForm(document.getElementById('form-contato'), function () { return contactResolved; });

  /* ---------- Banner LGPD ---------- */
  var banner = document.getElementById('lgpd');
  var CONSENT_KEY = 'enterprise_consent';
  function decideConsent(value) {
    try { localStorage.setItem(CONSENT_KEY, value); } catch (err) {}
    banner.setAttribute('data-show', 'false');
    if (value === 'accept') loadMeasurement();
  }
  function loadMeasurement() {
    // Scripts de medição só devem ser incluídos aqui após consentimento.
  }
  if (banner) {
    var saved = null;
    try { saved = localStorage.getItem(CONSENT_KEY); } catch (err) {}
    if (!saved) banner.setAttribute('data-show', 'true');
    else if (saved === 'accept') loadMeasurement();
    var accept = document.getElementById('lgpd-accept');
    var reject = document.getElementById('lgpd-reject');
    if (accept) accept.addEventListener('click', function () { decideConsent('accept'); });
    if (reject) reject.addEventListener('click', function () { decideConsent('reject'); });
  }

  /* ---------- Reveal on scroll ---------- */
  var targets = document.querySelectorAll('.card, .seg, .plan, .quote, .steps li, .timeline li');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('is-in'); observer.unobserve(entry.target); }
      });
    }, { threshold: 0.15 });
    targets.forEach(function (el) { el.classList.add('reveal'); observer.observe(el); });
  }
})();
