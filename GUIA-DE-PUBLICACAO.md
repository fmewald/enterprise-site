# Guia de Publicação — Enterprise Assessoria Contábil

Este guia leva o site do zero ao ar, com blog editável e captura de formulários.
Você faz isto **uma vez**. Depois, o site se atualiza sozinho e sua assistente publica no blog sem ajuda técnica.

Tempo estimado: 30 a 40 minutos.

---

## Visão geral do que vamos ligar

- **Hospedagem:** Netlify (grátis)
- **Arquivos do site:** GitHub (grátis) — funciona como a "gaveta" onde o site fica guardado
- **Captura de formulários:** Netlify Forms — cada lead chega no seu e-mail e num painel
- **Blog:** painel visual em `seusite.com.br/admin` para sua assistente publicar

Você só precisa de um e-mail e do acesso ao painel do seu domínio `enterprisecontabilidade.com.br`.

> **Estratégia de lançamento:** faça as Partes 1 a 4 agora. O site fica no ar num endereço `.netlify.app`, invisível ao Google, para você revisar ao vivo. Só faça as Partes 5 e 6 (domínio + abrir ao Google) quando aprovar tudo.

---

## Parte 1 — Criar a conta no GitHub (5 min)

1. Acesse **https://github.com** e clique em **Sign up**.
2. Crie a conta com o e-mail da empresa. Guarde o login e a senha.
3. Confirme o e-mail que o GitHub enviar.

Pronto. Você não vai precisar mexer em nada técnico aqui — o GitHub só guarda os arquivos.

---

## Parte 2 — Enviar o site para o GitHub (10 min)

1. Logado no GitHub, clique no **+** (canto superior direito) → **New repository**.
2. Em *Repository name*, escreva: `enterprise-site`.
3. Deixe como **Public** (ou Private, se preferir) e clique em **Create repository**.
4. Na página seguinte, clique no link **"uploading an existing file"**.
5. **Arraste para a área de upload TODO o conteúdo** da pasta do site (todos os arquivos e pastas: `index.html`, `assets`, `posts`, `admin`, etc.).
6. Clique em **Commit changes**.

> Dica: descompacte o `enterprise-site.zip` antes e arraste o conteúdo de dentro da pasta — não a pasta compactada.

---

## Parte 3 — Publicar na Netlify (10 min)

1. Acesse **https://app.netlify.com** e clique em **Sign up** → escolha **GitHub** (login com a conta que você criou).
2. No painel, clique em **Add new site** → **Import an existing project**.
3. Escolha **GitHub** e autorize.
4. Selecione o repositório **enterprise-site**.
5. Em *Build settings*, a Netlify já lê o arquivo `netlify.toml` — apenas confirme e clique em **Deploy**.
6. Em cerca de 1 minuto, o site está no ar num endereço tipo `nome-aleatorio.netlify.app`. Abra e confira.

---

## Parte 4 — Ligar o painel do blog (5 min)

1. No painel da Netlify do seu site, vá em **Integrations** (ou *Site configuration*) → procure **Identity** e clique em **Enable Identity**.
2. Ainda em Identity, em *Registration*, mude para **Invite only** (só quem você convidar publica).
3. Em **Services → Git Gateway**, clique em **Enable Git Gateway**.
4. Vá em **Identity → Invite users** e convide o e-mail da sua assistente (e o seu).
5. Cada convidado recebe um e-mail, cria a senha, e pronto: acessa **seusite.com.br/admin**, faz login e publica.

> A assistente só vê a tela de escrever artigo. Ela nunca vê GitHub nem código.

---

## Parte 5 — Apontar o seu domínio (10 min + espera de DNS)

> **Faça esta parte só quando aprovar o site.** Até lá, ele fica no ar apenas no endereço `.netlify.app`, invisível ao Google (modo bastidor). É assim de propósito: você revisa ao vivo sem ninguém encontrar o site antes da hora.

1. No painel da Netlify: **Domain settings** → **Add custom domain** → digite `enterprisecontabilidade.com.br`.
2. A Netlify mostra os registros de DNS a configurar.
3. Entre no painel onde você registrou o domínio (Registro.br ou sua hospedagem atual) e:
   - Aponte o domínio para a Netlify conforme as instruções que aparecerem (normalmente alterando os *nameservers* ou criando um registro CNAME/A).
4. Aguarde a propagação (de minutos a algumas horas). Depois disso, o site responde em `enterprisecontabilidade.com.br` com HTTPS automático.

---

## Parte 6 — Abrir a porta (lançamento oficial)

O site vem configurado em **modo bastidor**: no ar, mas bloqueado para o Google, para você revisar em paz. Quando aprovar tudo, libere a indexação em dois passos simples:

1. **No arquivo `netlify.toml`:** apague o bloco marcado como *MODO BASTIDOR* (as 4 linhas com `X-Robots-Tag = "noindex, nofollow"`).
2. **No arquivo `robots.txt`:** troque `Disallow: /` por `Allow: /` (deixando `Disallow: /admin/`). O próprio arquivo tem a instrução comentada.
3. Suba os dois arquivos alterados no GitHub. Em ~1 minuto o site republica, agora visível ao Google.

> Se preferir, me mande um aviso quando chegar a hora e eu te entrego os dois arquivos já com a porta aberta, prontos para subir.

---

## Onde os leads chegam

- Cada formulário enviado aparece em **Netlify → Forms**, separado por `diagnostico-home` e `diagnostico-contato`.
- Para receber por e-mail: **Forms → Settings → Form notifications → Add notification → Email notification** e coloque `contato@enterprisecontabilidade.com.br`.
- Para jogar numa planilha Google: use o **Make.com** ou **Zapier** (gratuito no seu volume) conectando "Netlify Forms" a "Google Sheets". Posso deixar esse passo pronto quando você quiser.

Quando contratar um CRM, o destino muda aqui, sem tocar no site.

---

## Como sua assistente publica um artigo

1. Acessa **enterprisecontabilidade.com.br/admin** e faz login.
2. Clica em **Artigos do Blog → New Artigo**.
3. Preenche: título, resumo, categoria, imagem de capa (opcional) e o texto.
4. Clica em **Publish**.
5. Em ~1 minuto o artigo aparece sozinho na página do blog. Nada mais é preciso.

---

## Resumo do que é automático depois de configurado

- Publicou artigo no painel → site atualiza sozinho.
- Recebeu lead no formulário → chega no e-mail e no painel da Netlify.
- Alterou qualquer arquivo no GitHub → site republica sozinho.

Qualquer dúvida na configuração, me chame que eu destravo o passo específico.
