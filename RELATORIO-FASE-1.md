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

## Fase 1 V3 — Modal inteligente e reinicialização

A V3 foi implementada sobre a versão homologada da Fase 1 V2, sem publicação e sem alteração do conteúdo de `contato.html`.

### Arquitetura do modal

O formulário visível existente da página inicial continua sendo o único formulário `diagnostico-home` apresentado ao visitante. Não houve clonagem, duplicação de IDs, criação de segundo formulário visível ou inclusão de listeners independentes por CTA.

A implementação utiliza o mesmo card `#diagnostico`:

- fechado, ele permanece incorporado ao local original da página inicial;
- ao acionar um dos sete CTAs, o card é movido temporariamente para o nível superior do `body` e recebe a classe de modal;
- ao fechar, o mesmo elemento é devolvido exatamente à posição original no DOM;
- o `href="#diagnostico"` permanece nos sete links como fallback sem JavaScript;
- com JavaScript ativo, o comportamento padrão da âncora é impedido e o modal abre na posição atual da navegação.

O fundo escurecido é criado uma única vez pelo JavaScript. A camada modal permanece acima do cabeçalho e do botão flutuante do WhatsApp. Quando o banner LGPD ainda está aberto, a altura disponível do modal é calculada para impedir sobreposição; após aceitar ou recusar, o modal volta a utilizar a altura disponível da tela.

### Abertura e fechamento

A abertura é centralizada em `setupHomeModal()` e executa, na ordem controlada:

1. validação do contexto seguro do CTA;
2. bloqueio da posição atual da página;
3. atualização do contexto comercial e dos campos ocultos;
4. atualização da etiqueta, título, texto, botão e plano;
5. elevação do mesmo card para a camada modal;
6. aplicação dos atributos de acessibilidade;
7. deslocamento do foco para o botão de fechar.

O modal pode ser fechado por:

- botão X com `aria-label="Fechar formulário"`;
- tecla `Esc`;
- clique no backdrop.

Cliques dentro do card não fecham o modal. Ao fechar, o bloqueio de rolagem é removido, a posição anterior é restaurada e o foco retorna ao CTA acionador.

### Controle de foco e acessibilidade

Durante a abertura, o card recebe comportamento equivalente a diálogo modal por meio de:

- `role="dialog"`;
- `aria-modal="true"`;
- `aria-labelledby="home-form-title"`;
- `aria-describedby="home-form-intro"`.

O conteúdo de fundo é temporariamente marcado com `aria-hidden` e `inert` quando suportado, sem ocultar o banner LGPD. O focus trap foi implementado em JavaScript puro e mantém `Tab` e `Shift + Tab` dentro do formulário. `Enter` continua acionando os links e a barra de espaço também abre o modal quando o CTA está focado.

As mensagens de sucesso e erro mantêm `role="status"` e `aria-live="polite"`. Labels, foco visível e navegação pelos campos foram preservados.

### Bloqueio de rolagem

A posição vertical atual é registrada antes de qualquer alteração visual do formulário. Enquanto o modal está aberto:

- o `body` é fixado na posição correspondente;
- a rolagem de fundo é bloqueada;
- a largura da barra de rolagem é compensada para evitar salto horizontal;
- a técnica funciona também nos navegadores móveis em que apenas `overflow: hidden` não é suficiente.

No fechamento, os estilos anteriores são restaurados e a página retorna à posição exata registrada.

### Preservação de dados antes do envio

Fechar e reabrir o modal antes de uma submissão bem-sucedida não executa `form.reset()`.

Permanecem preservados:

- nome;
- nome da empresa;
- WhatsApp;
- e-mail;
- segmento;
- regime;
- quantidade de funcionários;
- mensagem;
- consentimento.

Ao abrir por outro CTA, apenas o contexto comercial, o plano, os textos visuais e os campos ocultos são atualizados. O mesmo `lead_id` permanece associado à solicitação em andamento.

### Estado de envio e prevenção de duplicidade

O estado do formulário da home é mantido em um objeto controlado com:

- `leadId`;
- `submitting`;
- `completed`.

Durante o envio:

- `submitting` impede submissões simultâneas;
- o botão é desabilitado;
- o texto muda para `Enviando...`;
- o modal permanece aberto.

O formulário da página de contato continua usando o fluxo já aprovado e não inicializa a arquitetura do modal.

### Sucesso e nova solicitação

O estado concluído somente é marcado após uma resposta HTTP real com sucesso.

Após sucesso:

- o modal permanece aberto;
- a confirmação é exibida;
- o botão permanece desabilitado;
- o WhatsApp aparece apenas como opção voluntária;
- nenhuma janela ou aplicativo é aberto automaticamente.

Na abertura seguinte de qualquer CTA, a função central de reinicialização:

1. executa `form.reset()`;
2. limpa mensagens de sucesso e erro;
3. oculta o WhatsApp da solicitação anterior;
4. remove os estados `submitting` e `completed`;
5. reabilita o botão;
6. restaura o texto correspondente ao novo CTA;
7. aplica o novo contexto comercial;
8. gera outro `lead_id`;
9. atualiza novamente todos os campos ocultos.

Foi validada a realização de dois envios independentes na mesma sessão, com IDs distintos e contextos diferentes.

### Comportamento após falha

Quando a resposta HTTP falha:

- o modal permanece aberto;
- todos os dados visíveis são preservados;
- o contexto comercial não é alterado;
- o botão é reativado;
- o texto correto do botão é restaurado;
- a mensagem aprovada de erro é exibida;
- o WhatsApp aparece apenas como alternativa voluntária;
- o erro é registrado no console;
- a solicitação não é marcada como concluída.

Uma nova tentativa utiliza o mesmo `lead_id`. O identificador somente muda após sucesso e início de uma solicitação realmente nova.

### Arquivos alterados na V3

- `index.html`;
- `assets/css/styles.css`;
- `assets/js/main.js`;
- `RELATORIO-FASE-1.md`;
- `tests/test_fase1_v3.py` — suíte executável;
- `tests/RESULTADOS-FASE-1-V3.txt` — log da execução.

O arquivo `contato.html` permaneceu idêntico ao da base V2.

### Testes executados

A suíte incluída em `tests/test_fase1_v3.py` concluiu **249 verificações aprovadas**. O resultado integral está registrado em `tests/RESULTADOS-FASE-1-V3.txt`.

Foram testados:

- os sete CTAs internos e todos os contextos comerciais da V2;
- abertura sem rolagem até a âncora;
- contexto de Reforma Tributária;
- planos SMART, ADVANCED e EXCLUSIVE sem reaproveitamento incorreto;
- preservação de dados antes do envio;
- sucesso, fechamento, reset e segundo envio na mesma sessão;
- geração de novo `lead_id` após sucesso;
- manutenção do mesmo `lead_id` após falha;
- falha HTTP e nova tentativa;
- formulário direto da home com contexto padrão;
- fechamento por X, `Esc` e backdrop;
- clique interno sem fechamento;
- retorno do foco ao acionador;
- abertura por `Enter` e barra de espaço;
- focus trap com `Tab` e `Shift + Tab`;
- larguras de 320, 375, 768, 1024 e 1440 px;
- ausência de rolagem horizontal;
- rolagem interna e acesso ao botão de envio;
- coexistência sem sobreposição com o banner LGPD;
- funcionamento do formulário `diagnostico-contato` sem modal;
- preservação dos 67 links contextualizados para `contato.html`;
- presença dos 37 campos nos formulários Netlify;
- ausência de clonagem, `.finally()` e `window.open()` no fluxo;
- manutenção da estrutura de UTMs, landing page e referrer;
- referências locais;
- sintaxe do JavaScript com `node --check`;
- build do blog com `npm run build`.

### Limitações e validação pendente

Os testes HTTP da suíte utilizam respostas simuladas de sucesso e falha para verificar determinísticamente os estados do formulário. A V3 não foi publicada e, por isso, o novo modal ainda deve ser conferido após implantação no ambiente real da Netlify, especialmente o recebimento do segundo envio consecutivo na mesma sessão.

A base V2 já havia sido homologada no ambiente real. A V3 preserva o mesmo `name="diagnostico-home"`, a codificação do corpo, os 37 campos, o honeypot, o consentimento e o endpoint `fetch('/')`.

## Fase 1 V3.1 — Segurança, LGPD e refinamento da home

A V3.1 foi implementada sobre a Fase 1 V3 homologada, sem publicação e sem alteração do formulário `diagnostico-contato`. O rastreamento dos 67 links para `contato.html`, os sete contextos da home, os campos Netlify, as UTMs e a classificação comercial foram preservados.

### Proteção durante requisição

O estado central da home continua controlado por `leadId`, `submitting` e `completed`. A função `setSubmissionPending()` passou a concentrar a entrada e a saída do estado pendente.

Enquanto `state.submitting === true`:

- o formulário recebe `aria-busy="true"` e `data-submitting="true"`;
- o botão principal permanece desabilitado com o texto `Enviando...`;
- o botão X permanece visível, mas fica desabilitado;
- a função central `closeModal()` recusa qualquer fechamento;
- X, `Esc`, backdrop e fechamento programático utilizam essa mesma proteção;
- `openModal()` e `prepareContext()` recusam troca de interesse ou plano;
- os campos ocultos, o título, o botão e o `lead_id` não são alterados;
- uma segunda submissão é ignorada.

Após sucesso ou erro, `aria-busy` e `data-submitting` são removidos e o botão X é reabilitado. No sucesso, o estado é marcado como concluído e o botão principal continua desabilitado. No erro, os dados, o contexto e o mesmo `lead_id` são preservados para nova tentativa.

### Integração com o banner LGPD

O banner LGPD não permanece interativo simultaneamente ao diálogo modal.

Ao abrir o modal, quando o consentimento ainda está pendente:

- o estado visual e acessível anterior do banner é registrado;
- o banner recebe a classe temporária `lgpd--modal-hidden`;
- `aria-hidden="true"` é aplicado;
- `inert` é aplicado quando suportado;
- nenhuma aceitação ou recusa é registrada;
- nenhum script de medição é carregado.

Ao fechar o modal, a classe, o valor anterior de `aria-hidden` e o estado anterior de `inert` são restaurados. Os botões Aceitar, Recusar e o link Saiba mais voltam a ficar acessíveis e a decisão continua pendente.

A lógica anterior de convivência visual foi removida. Não permanecem `body-modal-has-lgpd`, `--home-modal-bottom-offset` ou código morto relacionado.

### Correção estrutural da hero

A causa do grande espaço vazio era o alinhamento vertical central das duas colunas da hero, que fazia a coluna de conteúdo acompanhar a altura do formulário.

A correção foi estrutural:

- `.hero__grid` passou a utilizar `align-items: start`;
- o `padding` vertical da hero foi recalibrado por breakpoint fluido;
- não foram utilizados deslocamentos negativos;
- fundo, arcos decorativos, conteúdo e responsividade foram preservados.

Nos testes de 320, 375, 768, 1024, 1366, 1440 e 1920 px, a etiqueta institucional iniciou entre 72 e 80 px abaixo do cabeçalho. Em desktop, as duas colunas iniciaram alinhadas pelo topo e o primeiro CTA apareceu na primeira dobra.

### Formulário compacto e campos opcionais

A home continua utilizando um único formulário visível `diagnostico-home`, dentro do mesmo card reutilizado pelo modal.

A primeira visualização agora apresenta:

- Nome;
- Nome da empresa, opcional;
- WhatsApp;
- E-mail;
- Segmento;
- consentimento;
- ação principal;
- alternativa secundária de WhatsApp.

Em larguras suficientes, Nome e Nome da empresa compartilham a primeira linha, e WhatsApp e E-mail compartilham a segunda. O Segmento permanece em largura total. Abaixo de 640 px, a grade retorna automaticamente para uma coluna e mantém a ordem lógica do HTML.

Regime tributário, quantidade de funcionários e mensagem foram movidos para um `<details>` acessível com o resumo **Adicionar mais informações — opcional**. A área inicia recolhida, abre por mouse ou teclado e não apaga valores quando é fechada. Os nomes dos campos e o envio para a Netlify foram preservados; esses três campos não são obrigatórios.

### Hierarquia das ações e WhatsApp

Antes do envio, o botão contextual do formulário é a única ação primária preenchida. O WhatsApp aparece como alternativa de menor peso visual, com contorno, altura reduzida e o texto:

`Prefere falar agora? Chame no WhatsApp`

A mensagem continua contextualizada por interesse, segmento, plano e identificador, sem incluir nome, e-mail, telefone ou mensagem digitada. O WhatsApp nunca abre automaticamente.

Após sucesso, a confirmação permanece visível e o link recebe o texto **Continuar agora pelo WhatsApp**, com destaque secundário maior. Ao iniciar outra solicitação, o link retorna ao estado inicial, a confirmação anterior desaparece e um novo `lead_id` é criado.

### Arquivos alterados na V3.1

- `index.html`;
- `assets/css/styles.css`;
- `assets/js/main.js`;
- `RELATORIO-FASE-1.md`;
- `tests/test_fase1_v31.py`;
- `tests/RESULTADOS-FASE-1-V3.1.txt`.

O arquivo `contato.html` permaneceu idêntico ao da V3.

### Testes executados

A suíte reproduzível `tests/test_fase1_v31.py` foi executada em seis grupos isolados. Foram aprovadas **355 verificações**, registradas em `tests/RESULTADOS-FASE-1-V3.1.txt`:

- regressão estática, sintaxe JavaScript e build: 31;
- sete contextos da home: 111;
- segurança do fetch atrasado e LGPD: 61;
- hero e formulário compacto: 49;
- hierarquia das ações, sucesso, falha e acesso direto: 53;
- teclado, responsividade e formulário de contato: 50.

A cobertura inclui:

- Promise de `fetch()` mantida pendente até resolução manual;
- bloqueio de X, `Esc`, backdrop, troca para ADVANCED e segundo envio durante a requisição;
- manutenção de Reforma Tributária, plano não informado, título e `lead_id` durante a Promise;
- sucesso associado ao contexto original e nova abertura ADVANCED com formulário limpo e novo ID;
- ocultação e restauração integral do banner LGPD sem gravar decisão;
- focus trap com o banner temporariamente inerte;
- primeira dobra em 320, 375, 768, 1024, 1366, 1440 e 1920 px;
- grade de duas colunas no desktop e uma coluna no celular;
- abertura e fechamento do `<details>` por mouse e teclado, com preservação de valores;
- ação principal dominante e WhatsApp secundário antes do envio;
- WhatsApp pós-sucesso sem abertura automática;
- preservação antes do envio, reset depois do sucesso e nova tentativa após falha;
- mesmo `lead_id` após falha e novo `lead_id` após sucesso;
- formulário direto da home com contexto padrão;
- fechamento, teclado e responsividade do modal;
- regressão de `diagnostico-contato`;
- 67 links contextualizados;
- 37 campos nos formulários Netlify;
- ausência de IDs duplicados, clonagem, `.finally()` e `window.open()`;
- referências locais, `node --check` e `npm run build`.

A suíte completa pode ser executada com:

```bash
python3 tests/test_fase1_v31.py --group all
```

Também é possível executar isoladamente `estatico`, `ctas`, `seguranca`, `layout`, `fluxos` ou `regressao`. A opção `all` inicia cada grupo em processo independente para evitar acúmulo de renderizadores do Chromium em ambientes de CI limitados.

### Limitações

Os estados HTTP foram testados com `fetch()` controlado em navegador headless. Não houve publicação nesta etapa. O recebimento real na Netlify e o comportamento visual final em Safari/iPhone físico devem ser conferidos após a implantação, embora o bloqueio de rolagem, `dvh`, fallback de `vh`, foco, formulário e codificação do envio tenham sido preservados.

---

## Fase 1 V3.1 — Segurança, LGPD e refinamento da home

A V3.1 foi aplicada sobre a base homologada da V3, sem refazer o rastreamento, os formulários Netlify ou a classificação comercial. A página `contato.html` permaneceu inalterada. O formulário visível da página inicial continua sendo uma única instância de `diagnostico-home`, usada tanto incorporada à hero quanto elevada ao modal.

### Proteção durante requisição

O estado central do formulário da home continua controlado pelas propriedades `leadId`, `submitting` e `completed`. A função `setSubmissionPending()` passou a concentrar a transição do envio pendente:

- define `state.submitting`;
- aplica e remove `aria-busy="true"` no formulário;
- mantém um atributo observável `data-submitting="true"` durante os testes;
- desabilita e reabilita o botão de fechar;
- preserva o mesmo `lead_id` até a conclusão da requisição.

Enquanto `state.submitting === true`, a função central de fechamento retorna sem executar qualquer alteração. A mesma proteção atende ao botão X, à tecla `Esc`, ao clique no backdrop e a chamadas programáticas. A função central de abertura/contextualização também retorna sem aplicar interesse, plano, título, campos ocultos, reset ou novo identificador.

O botão principal permanece desabilitado e com o texto `Enviando...`. A restauração do botão verifica o estado pendente antes de habilitá-lo, impedindo que rotas paralelas alterem o estado visual durante a Promise.

Após sucesso real, `submitting` é removido, `completed` é marcado, `aria-busy` é retirado, o botão de fechar volta a funcionar e a confirmação permanece associada ao contexto originalmente enviado. Após erro, `completed` permanece falso, os dados e o mesmo `lead_id` são preservados, e o botão principal é restaurado para nova tentativa.

### Integração com o banner LGPD

O banner de consentimento não concorre mais com o diálogo modal. Ao abrir o modal, seu estado anterior é registrado e, quando a decisão ainda está pendente:

- o banner recebe a classe temporária `lgpd--modal-hidden`;
- recebe `aria-hidden="true"`;
- recebe `inert` quando suportado;
- nenhuma aceitação ou recusa é registrada;
- nenhum script de medição é carregado por essa ação.

Ao fechar o modal, visibilidade, `aria-hidden` e `inert` retornam exatamente aos valores anteriores. A decisão continua pendente e os controles Aceitar, Recusar e Saiba mais voltam a ficar acessíveis.

Foram removidos o código e os estilos antigos destinados à coexistência simultânea do modal com o banner, incluindo `body-modal-has-lgpd` e `--home-modal-bottom-offset`.

### Correção estrutural da hero

O grande espaço vazio da primeira faixa foi corrigido na causa estrutural:

- `.hero__grid` passou de alinhamento vertical central para `align-items: start`;
- o espaçamento vertical da hero foi recalibrado sem deslocamentos negativos;
- a coluna de conteúdo não depende mais da altura do formulário;
- o fundo, os arcos e a composição visual foram preservados.

Nas larguras testadas, a etiqueta institucional inicia entre aproximadamente 72 e 80 px abaixo do cabeçalho. Título, texto e primeiro CTA aparecem mais cedo, sem sobreposição e sem rolagem horizontal.

### Formulário compacto e campos opcionais

Os campos principais foram reorganizados para reduzir o atrito inicial:

- Nome e Nome da empresa ocupam a primeira linha em telas largas;
- WhatsApp e E-mail ocupam a segunda linha;
- Segmento permanece em largura total;
- consentimento e ação principal aparecem antes dos dados complementares.

Regime tributário, quantidade de funcionários e mensagem foram movidos para um componente nativo `<details>` com o resumo `Adicionar mais informações — opcional`. A área inicia recolhida, funciona por mouse e teclado, preserva os dados ao recolher e mantém os mesmos nomes de campo enviados à Netlify. O regime deixou de ser obrigatório apenas no formulário da home, conforme o novo fluxo de entrada; o formulário de contato não foi alterado.

Em telas estreitas, a grade retorna automaticamente para uma coluna, preservando a ordem lógica, os labels e a largura dos campos.

### Hierarquia das ações e WhatsApp

Antes do envio, o botão principal mantém preenchimento, largura e destaque. O WhatsApp permanece disponível, porém como ação secundária com contorno, menor altura e o texto:

`Prefere falar agora? Chame no WhatsApp`

A mensagem continua contextualizada com interesse, segmento, plano e identificador, sem incluir nome ou outros dados pessoais do formulário da home.

Após sucesso, a confirmação continua visível e o WhatsApp recebe o texto `Continuar agora pelo WhatsApp` e um destaque secundário apropriado. Ele nunca é aberto automaticamente. Na próxima solicitação, o estado visual, o link, a confirmação e o identificador anteriores são removidos antes da aplicação do novo contexto.

### Preservação da posição da página

A restauração da posição após fechar o modal foi reforçada para neutralizar o `scroll-behavior: smooth` global. Durante o `window.scrollTo`, o comportamento da raiz é temporariamente definido como `auto`, evitando retorno gradual, corrida com uma nova abertura ou associação incorreta entre posição e CTA.

### Arquivos alterados na V3.1

- `index.html`;
- `assets/css/styles.css`;
- `assets/js/main.js`;
- `RELATORIO-FASE-1.md`;
- `tests/test_fase1_v31.py`;
- `tests/RESULTADOS-FASE-1-V3.1.txt`.

O arquivo `contato.html` permaneceu idêntico à base V3.

### Testes executados

A suíte reproduzível foi organizada em grupos para permitir execução isolada ou completa:

```bash
python3 tests/test_fase1_v31.py --group estatico
python3 tests/test_fase1_v31.py --group ctas
python3 tests/test_fase1_v31.py --group seguranca
python3 tests/test_fase1_v31.py --group layout
python3 tests/test_fase1_v31.py --group fluxos
python3 tests/test_fase1_v31.py --group regressao
```

Os seis grupos concluíram **355 verificações aprovadas**, registradas em `tests/RESULTADOS-FASE-1-V3.1.txt`:

- 31 verificações estáticas, sintaxe JavaScript e build do blog;
- 111 verificações dos sete contextos comerciais da home;
- 61 verificações de fetch atrasado, bloqueios e integração LGPD;
- 49 verificações da hero e do formulário compacto;
- 53 verificações de ações, WhatsApp, preservação, sucesso, falha e acesso direto;
- 50 verificações de teclado, foco, responsividade e formulário de contato.

O teste de fetch atrasado mantém a Promise pendente de forma manual e confirma que X, `Esc`, backdrop, troca para ADVANCED e segundo envio não alteram contexto, plano, `lead_id`, título, botão ou `aria-busy`. Após resolver a Promise, valida o sucesso da Reforma Tributária e a abertura limpa de ADVANCED com novo identificador.

Também foram validados:

- ocultação e restauração do banner LGPD sem gravar decisão;
- focus trap sem acesso ao fundo;
- hero em 320, 375, 768, 1024, 1366, 1440 e 1920 px;
- modal e formulário em 320, 375, 768, 1024 e 1440 px;
- layout de duas colunas e retorno para uma coluna;
- funcionamento e preservação da área opcional;
- hierarquia visual das ações antes e após sucesso;
- preservação de dados antes do envio;
- reset e novo `lead_id` após sucesso;
- manutenção do mesmo `lead_id` após falha;
- formulário direto da home com contexto padrão;
- página de contato sem modal e com envio preservado;
- 67 links contextualizados;
- 37 campos dos formulários Netlify;
- UTMs, landing page, referrer, honeypot e consentimento;
- ausência de `.finally()`, `window.open()`, clonagem e IDs duplicados;
- menu, referências locais, sintaxe e build do blog.

### Limitações e validação pendente

Os cenários HTTP da suíte utilizam respostas simuladas, incluindo uma Promise manualmente atrasada, para validar de forma determinística os estados do front-end. O site não foi publicado nesta etapa. O recebimento real pela Netlify e uma segunda submissão consecutiva devem ser conferidos após a implantação, sem alterar o código entregue.
