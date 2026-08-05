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

  function populateTracking(form, resolved, createSubmissionData) {
    var now = new Date();
    var landingPage = safeSessionGet('landing_page') || currentPageValue();
    var referrer = safeSessionGet('referrer_inicial') || document.referrer || 'Não informado';

    setFormValue(form, 'lead_id', createSubmissionData ? makeLeadId(now) : '');
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

  function whatsappMessage(data, resolved) {
    return [
      'Olá! Acabei de enviar uma solicitação pelo site da Enterprise.',
      'Nome: ' + (data.nome || 'Não informado'),
      'Interesse: ' + resolved.interest.description,
      'Segmento: ' + (resolved.segment ? resolved.segment.label : (data.segmento || 'Não informado')),
      'Plano: ' + (planDisplay(resolved) || 'Não informado'),
      'Identificador: ' + (data.lead_id || 'Não informado')
    ].join('\n');
  }

  function configureWhatsappLink(link, data, resolved) {
    if (!link) return;
    link.href = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(whatsappMessage(data, resolved));
    link.hidden = false;
  }

  function showFormMessage(msg, text, type) {
    if (!msg) return;
    msg.textContent = text;
    msg.classList.remove('form-msg--success', 'form-msg--error');
    msg.classList.add(type === 'error' ? 'form-msg--error' : 'form-msg--success');
    msg.hidden = false;
  }

  function handleForm(form, contextProvider) {
    if (!form) return;
    var getResolved = typeof contextProvider === 'function' ? contextProvider : function () { return contextProvider; };
    populateTracking(form, getResolved(), false);

    form.addEventListener('submit', function (event) {
      event.preventDefault();
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
      if (whatsappLink) whatsappLink.hidden = true;
      populateTracking(form, resolved, true);
      var data = formDataObject(form);
      var firstName = (data.nome || '').split(/\s+/)[0];

      button.disabled = true;
      button.textContent = 'Enviando…';

      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encodeForm(data)
      }).then(function (response) {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        showFormMessage(
          msg,
          'Recebemos sua solicitação' + (firstName ? ', ' + firstName : '') + '. Nossa equipe entrará em contato em até 1 dia útil.',
          'success'
        );
        button.textContent = 'Solicitação enviada';
        button.disabled = true;
        configureWhatsappLink(whatsappLink, data, resolved);
      }).catch(function (err) {
        if (window.console) console.error('Falha ao enviar o formulário à Netlify:', err);
        showFormMessage(
          msg,
          'Não foi possível enviar sua solicitação agora. Tente novamente ou fale conosco pelo WhatsApp.',
          'error'
        );
        button.disabled = false;
        button.textContent = originalButtonText;
        configureWhatsappLink(whatsappLink, data, resolved);
      });
    });
  }

  function setupHomeCtaTracking(form, getActiveContext, setActiveContext) {
    if (!form) return;

    document.addEventListener('click', function (event) {
      var target = event.target;
      var link = target && typeof target.closest === 'function' ? target.closest('a[href="#diagnostico"][data-lead-interest]') : null;
      if (!link) return;

      var nextContext = getHomeContextFromLink(link);
      if (!nextContext) return;

      setActiveContext(nextContext);
      var resolved = resolveContext(getActiveContext());
      applyHomePresentation(resolved);
      populateTracking(form, resolved, false);
    });
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
  var contactResolved = resolveContext(getContactContext());
  applyContactPresentation(contactResolved);
  var homeForm = document.getElementById('form-diagnostico');
  applyHomePresentation(resolveContext(homeContext));
  handleForm(homeForm, function () { return resolveContext(homeContext); });
  setupHomeCtaTracking(
    homeForm,
    function () { return homeContext; },
    function (nextContext) { homeContext = nextContext; }
  );
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
