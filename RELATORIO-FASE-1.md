# Relatório técnico - Fase 1

## Escopo executado

A Fase 1 foi implementada diretamente no site estático da Enterprise Assessoria Contábil, mantendo HTML, CSS e JavaScript puro e a compatibilidade com Netlify Forms.

Foram executados:

- contextualização dos 67 links internos que levam a `contato.html`;
- classificação padronizada do interesse comercial;
- registro da página de origem, CTA, segmento, serviço e plano;
- personalização dinâmica da página de contato;
- padronização dos formulários visíveis da página inicial e da página de contato;
- atualização dos dois formulários ocultos usados pela detecção da Netlify;
- persistência de UTMs, página inicial da sessão e primeiro referrer;
- geração de identificador único, datas, dispositivo, resumo comercial e abordagem sugerida;
- correção do falso sucesso do envio;
- remoção da abertura automática do WhatsApp;
- inclusão de mensagens distintas para sucesso e erro;
- ajustes mínimos de responsividade e acessibilidade.

Nenhuma publicação no GitHub ou na Netlify foi realizada.

## Arquivos alterados

- `index.html`
- `contato.html`
- `blog.html`
- `contabilidade-para-clinicas-e-medicos.html`
- `contabilidade-para-construcao-civil.html`
- `contabilidade-para-prestadores-de-servico.html`
- `contabilidade-para-transportadoras.html`
- `gestao-financeira.html`
- `planos.html`
- `politica-de-privacidade.html`
- `post.html`
- `reforma-tributaria.html`
- `segmentos.html`
- `servicos.html`
- `sobre.html`
- `assets/js/main.js`
- `assets/css/styles.css`
- `RELATORIO-FASE-1.md` - criado nesta fase.

Os demais arquivos foram preservados.

## Categorias de interesse

A configuração central do JavaScript reconhece:

- `contato-geral` - contato sem serviço específico;
- `diagnostico-geral` - avaliação inicial genérica;
- `diagnostico-segmento` - avaliação especializada por segmento;
- `reforma-tributaria` - análise de impacto de IBS e CBS;
- `planejamento-tributario` - revisão de regime, riscos e oportunidades;
- `abertura-empresa` - orientação para abertura;
- `departamento-pessoal` - folha e rotinas trabalhistas;
- `troca-contador` - transição de escritório contábil;
- `regularizacao-empresa` - pendências, certidões e regularização;
- `proposta-contabil` - proposta de plano contábil;
- `avaliacao-bpo` - avaliação de gestão financeira;
- `proposta-bpo` - proposta de plano de gestão financeira.

Segmentos reconhecidos:

- `transporte-logistica`;
- `construcao-civil`;
- `clinicas-saude`;
- `prestadores-servico`.

Planos contábeis reconhecidos:

- `smart`;
- `advanced`;
- `exclusive`.

Planos de gestão financeira reconhecidos:

- `starter`;
- `basic`;
- `pro`.

## Parâmetros utilizados nos links

Os links para contato utilizam, conforme o contexto:

- `interesse`;
- `origem`;
- `cta`;
- `segmento`;
- `plano`;
- `servico`.

Exemplo:

```text
contato.html?interesse=planejamento-tributario&origem=transportadoras&cta=descobrir-perdas&segmento=transporte-logistica
```

No HTML, os separadores foram gravados como `&amp;`.

Todos os parâmetros são validados contra configurações internas permitidas. Valores desconhecidos são ignorados e caem em um contexto seguro de contato geral. Conteúdo arbitrário da URL não é inserido com `innerHTML`.

## Campos visíveis dos formulários

Os formulários `diagnostico-home` e `diagnostico-contato` possuem a mesma estrutura.

Obrigatórios:

- nome;
- WhatsApp;
- e-mail;
- segmento da empresa;
- regime tributário atual;
- consentimento com a Política de Privacidade.

Opcionais:

- nome da empresa;
- quantidade aproximada de funcionários;
- situação específica ou mensagem.

Opções de funcionários:

- Nenhum;
- 1 a 5;
- 6 a 15;
- 16 a 40;
- Mais de 40;
- Não sei informar;
- Empresa ainda não aberta.

## Campos ocultos de rastreamento

Os dois formulários visíveis e os dois formulários ocultos da Netlify reconhecem:

- `lead_id`;
- `data_hora_iso`;
- `data_hora_brasilia`;
- `pagina_origem`;
- `titulo_pagina_origem`;
- `url_origem`;
- `pagina_formulario`;
- `url_envio`;
- `cta_codigo`;
- `cta_texto`;
- `interesse_codigo`;
- `interesse_descricao`;
- `servico_interesse`;
- `segmento_contexto`;
- `plano_interesse`;
- `landing_page`;
- `referrer_inicial`;
- `utm_source`;
- `utm_medium`;
- `utm_campaign`;
- `utm_content`;
- `utm_term`;
- `dispositivo`;
- `abordagem_sugerida`;
- `resumo_comercial`.

O campo legado `origem` foi mantido por compatibilidade e recebe a mesma página registrada em `pagina_origem`.

## Identificação e datas

O identificador usa o padrão:

```text
ENT-AAAAMMDD-xxxxxxxx
```

O código usa `crypto.randomUUID()` quando disponível, com alternativas por `crypto.getRandomValues()` e aleatoriedade baseada em data apenas como último fallback.

São registradas:

- data/hora ISO;
- data/hora legível no fuso `America/Sao_Paulo`.

Esses valores são atualizados imediatamente antes de cada tentativa de envio.

## Persistência de UTMs

O JavaScript é carregado em todas as páginas e verifica os parâmetros:

- `utm_source`;
- `utm_medium`;
- `utm_campaign`;
- `utm_content`;
- `utm_term`.

Quando encontrados, são armazenados em `sessionStorage`. A mesma sessão também guarda:

- primeira página acessada;
- primeiro referrer disponível.

A implementação possui tratamento de erro para navegadores que bloqueiem armazenamento. Nesse caso, o formulário continua funcionando e os campos recebem valores de fallback.

Não foram adicionados Google Analytics, Meta Pixel, cookies publicitários ou fingerprinting.

## Página de contato dinâmica

A lógica de apresentação está centralizada em objetos de configuração dentro de `assets/js/main.js`.

Conforme o contexto, são alterados por `textContent`:

- etiqueta superior;
- título principal;
- texto de apoio;
- etiqueta do formulário;
- título do formulário;
- introdução do formulário;
- texto do botão;
- indicação discreta do segmento ou plano selecionado.

Acesso direto a `contato.html`, sem parâmetros, exibe o conteúdo de contato geral e não gera erros.

## Resumo e abordagem comercial

`resumo_comercial` reúne em texto legível:

- interesse;
- promessa/CTA que motivou o contato;
- página de origem;
- segmento contextual;
- plano de interesse;
- campanha.

`abordagem_sugerida` oferece uma orientação inicial para o comercial conforme o interesse ou segmento. O texto não representa conclusão técnica.

## Comportamento de sucesso

Somente uma resposta HTTP com `response.ok === true` gera sucesso.

Após sucesso real:

- é exibida a confirmação de recebimento;
- o primeiro nome pode ser incluído na mensagem;
- o botão muda para `Solicitação enviada`;
- o botão permanece desabilitado para evitar duplicidade;
- aparece um link voluntário para o WhatsApp;
- nenhuma janela do WhatsApp é aberta automaticamente.

## Comportamento de erro

Quando há erro de rede ou resposta HTTP inválida:

- nenhuma mensagem de sucesso é exibida;
- o botão é reativado;
- o texto original do botão é restaurado;
- é exibida uma mensagem clara de erro;
- aparece um link voluntário para o WhatsApp;
- o erro é registrado no console do navegador.

Uma nova tentativa pode ser realizada normalmente.

## Acessibilidade e responsividade

Foram preservados:

- honeypot anti-spam;
- consentimento LGPD;
- navegação por teclado;
- `role="status"` e `aria-live="polite"` nas mensagens;
- menu mobile;
- banner LGPD;
- identidade visual existente.

Ajustes mínimos foram incluídos para:

- textos longos não causarem rolagem horizontal;
- o menu mobile ser ativado também em 1024 px;
- itens de grade poderem encolher em telas estreitas;
- campos permanecerem legíveis em 320 px;
- mensagens de sucesso/erro e link opcional do WhatsApp respeitarem o atributo `hidden`.

## Testes executados

### Testes funcionais em Chromium headless

Foram executadas 135 verificações automatizadas, todas aprovadas.

Cenários principais:

1. acesso direto a `contato.html`;
2. planejamento tributário vindo da página de transportadoras;
3. simulação da Reforma Tributária;
4. abertura de empresa;
5. proposta do plano contábil ADVANCED;
6. proposta do plano financeiro PRO;
7. persistência de UTMs durante navegação entre páginas;
8. resposta HTTP válida, com sucesso somente após confirmação;
9. resposta HTTP 500, com erro, reativação e nova tentativa;
10. parâmetros de URL inválidos e tentativa de conteúdo malicioso;
11. menu mobile e banner LGPD;
12. ausência de rolagem horizontal em 320, 375, 768, 1024 e 1440 px.

Os testes de envio usaram respostas HTTP simuladas para validar isoladamente os dois fluxos do JavaScript, sem publicar o site.

### Testes estáticos

- sintaxe de `assets/js/main.js` verificada com `node --check`;
- build do blog executado com `npm run build`;
- 67 links para `contato.html` encontrados e todos com `interesse`, `origem` e `cta`;
- nenhum `href="contato.html"` genérico permaneceu;
- ausência de `.finally()` no fluxo de envio;
- ausência de `window.open()` automático;
- ausência de `innerHTML` para dados da URL;
- 494 referências locais verificadas, sem arquivo ausente;
- formulários ocultos conferidos com `data-netlify="true"`, `form-name` e honeypot preservados.

## Limitações e conferências após publicação

Não foi realizado um envio ao ambiente real da Netlify porque esta fase não inclui publicação. O comportamento do front-end foi testado com respostas HTTP válidas e inválidas simuladas.

Após criar um Deploy Preview na Netlify, conferir:

1. se os formulários `diagnostico-home` e `diagnostico-contato` aparecem no painel de Forms;
2. se todos os campos ocultos são exibidos em uma submissão real;
3. se um envio válido retorna sucesso no domínio publicado;
4. se uma falha real de rede mantém o botão disponível para nova tentativa;
5. se UTMs permanecem ao navegar entre páginas no domínio final;
6. se regras de segurança, redirects ou proteção anti-spam da conta Netlify não bloqueiam o POST;
7. se a equipe comercial considera legíveis `resumo_comercial` e `abordagem_sugerida` no painel ou nas notificações.

Nenhuma senha, chave, token ou dado sensível foi incluído.

## Correção V2 — CTAs internos da página inicial

A correção pontual da V2 foi executada sem refazer a Fase 1 e sem alterar as funcionalidades já aprovadas.

### Sete CTAs internos corrigidos

Os sete links da página inicial que apontam para `#diagnostico` passaram a utilizar atributos `data-*` validados e um único listener delegado:

1. **Quero meu diagnóstico gratuito** — diagnóstico geral;
2. **Simular o impacto na minha empresa** — Reforma Tributária;
3. **fale com a gente** — contato geral para segmentos não listados;
4. **Solicitar proposta** — plano SMART;
5. **Solicitar proposta** — plano ADVANCED;
6. **Solicitar proposta** — plano EXCLUSIVE;
7. **Conversar com um contador** — contato geral.

O comportamento original do link âncora foi preservado. O clique continua levando o visitante ao formulário `#diagnostico`, inclusive quando o link é acionado pelo teclado.

### Contexto ativo do formulário

O formulário da página inicial deixou de depender de um objeto resolvido apenas no carregamento. A implementação passou a manter um objeto de contexto ativo controlado e a fornecer o contexto resolvido no momento do envio.

Quando um CTA rastreado é acionado:

- o contexto é validado contra as configurações permitidas de interesse, origem, CTA, serviço, plano e segmento;
- os campos ocultos são atualizados imediatamente;
- o formulário é reapresentado conforme o interesse;
- o envio consulta novamente o contexto ativo;
- `resumo_comercial` e `abordagem_sugerida` refletem a motivação selecionada.

Quando o visitante chega ao formulário apenas por rolagem, permanece o contexto padrão:

- `interesse_codigo = diagnostico-geral`;
- `cta_codigo = formulario-home`;
- `cta_texto = Formulário de avaliação da página inicial`.

### Texto exato do CTA

Nos sete CTAs internos, `cta_texto` é obtido por `textContent`, normalizado apenas para espaços e limitado em tamanho. Não é utilizado `innerHTML`.

Na página de contato, foram adicionados códigos permitidos específicos para preservar os textos exatos:

- `avaliacao-gratuita-minha` — **Quero minha avaliação gratuita**;
- `falar-com-a-gente` — **Falar com a gente**;
- `fale-com-a-gente` — **Fale com a gente**.

Parâmetros arbitrários de URL continuam rejeitados pela lista de configurações permitidas.

### Apresentação dinâmica na página inicial

O formulário da página inicial passou a adaptar, de forma centralizada:

- etiqueta;
- título;
- texto introdutório;
- texto do botão;
- indicação discreta do plano SMART, ADVANCED ou EXCLUSIVE.

Foram implementadas as apresentações específicas de Reforma Tributária, proposta contábil e contato geral, mantendo os textos padrão quando nenhum CTA é acionado.

### Correção ortográfica

Foi realizada varredura em todas as páginas HTML visíveis. Todas as ocorrências de **Seguimentos Atendidos** foram substituídas por **Segmentos Atendidos**, sem alteração de URLs ou nomes técnicos.

### Arquivos alterados na V2

- `index.html`;
- `assets/js/main.js`;
- `gestao-financeira.html`;
- `politica-de-privacidade.html`;
- `segmentos.html`;
- `blog.html`;
- `contabilidade-para-clinicas-e-medicos.html`;
- `contabilidade-para-construcao-civil.html`;
- `contabilidade-para-prestadores-de-servico.html`;
- `contabilidade-para-transportadoras.html`;
- `contato.html`;
- `planos.html`;
- `post.html`;
- `reforma-tributaria.html`;
- `servicos.html`;
- `sobre.html`;
- `RELATORIO-FASE-1.md`.

As alterações nas páginas não relacionadas aos três CTAs de texto exato limitaram-se à correção ortográfica solicitada.

### Testes adicionais executados

A suíte da V2 concluiu **909 verificações aprovadas**.

Foram validados:

- os sete CTAs internos, individualmente;
- contexto ativo e atualização imediata dos campos ocultos;
- `interesse_codigo`, `cta_codigo`, `cta_texto`, `servico_interesse` e `plano_interesse`;
- etiqueta, título, introdução, botão e resumo de plano;
- `resumo_comercial` e `abordagem_sugerida`;
- Reforma Tributária sem classificação como diagnóstico geral;
- plano ADVANCED preservado até o corpo do envio;
- acesso por rolagem com o contexto padrão;
- ativação do CTA por teclado e manutenção do deslocamento para `#diagnostico`;
- os 67 links para `contato.html`, todos ainda contextualizados;
- os três textos exatos enviados por `contato.html`;
- rejeição de parâmetros de URL não permitidos;
- sucesso apenas após resposta HTTP válida;
- erro HTTP sem falso sucesso e com nova tentativa disponível;
- ausência de abertura automática do WhatsApp;
- dois formulários ocultos da Netlify completos;
- ausência de `innerHTML`, `.finally()` e `window.open()` no fluxo;
- ausência de rolagem horizontal em 320, 375, 768, 1024 e 1440 px, na página inicial e na página de contato;
- sintaxe de `assets/js/main.js` com `node --check`;
- build do blog com `npm run build`;
- 67 links de contato e mais de 400 referências locais verificadas;
- nenhuma ocorrência remanescente de **Seguimentos Atendidos**.

O envio ao ambiente real da Netlify continua pendente porque esta entrega não inclui publicação.
