# Rifa Beneficente 🎟️

Sistema completo de gerenciamento de rifas em **React + Firebase Firestore**, sem
backend próprio, pronto para hospedar no **GitHub Pages**.

- Grade de números com status em tempo real (disponível / reservado / pago)
- Reserva de múltiplos números com confirmação por transação do Firestore
  (impede que duas pessoas reservem o mesmo número ao mesmo tempo)
- Painel administrativo com dashboard, busca, exportação em CSV, edição e
  cancelamento de reservas
- Tela de configuração da rifa (nome, valor, quantidade de números, PIX, etc.)

## 1. Estrutura do projeto

```
src/
  components/   → peças de interface reutilizáveis
  pages/        → Home (site público) e Admin (painel)
  services/      → firebase.js (conexão) e rifaService.js (regras de negócio)
  hooks/         → useRifa.js (dados em tempo real + estatísticas)
  utils/         → formatters.js e validators.js
  context/       → AuthContext.jsx (login do admin)
firestore.rules  → regras de segurança do Firestore
scripts/seedRifa.js → script opcional para popular números via linha de comando
```

## 2. Criar e configurar o projeto no Firebase

1. Acesse o [Console do Firebase](https://console.firebase.google.com/) e crie um novo projeto.
2. Ative o **Firestore Database** (modo produção).
3. Ative o **Authentication** → método "Email/senha".
4. Em **Configurações do projeto → Seus apps**, crie um app Web e copie as
   credenciais (`apiKey`, `authDomain`, etc.).
5. Copie `.env.example` para `.env` e preencha com essas credenciais:

   ```
   cp .env.example .env
   ```

6. Publique as regras de segurança (`firestore.rules`) usando a
   [Firebase CLI](https://firebase.google.com/docs/cli):

   ```
   npm install -g firebase-tools
   firebase login
   firebase init firestore   # aponte para o projeto criado, aceite os arquivos padrão
   firebase deploy --only firestore:rules
   ```

   Ou cole o conteúdo de `firestore.rules` diretamente em
   **Firestore Database → Regras** no Console.

## 3. Criar o primeiro administrador

Como o projeto não usa backend, a permissão de administrador é controlada por
um documento na coleção `admins`, cujo **ID é o UID do usuário**:

1. Em **Authentication → Users**, crie manualmente um usuário com email e senha.
2. Copie o **UID** desse usuário.
3. Em **Firestore Database**, crie a coleção `admins` e um documento com esse
   UID como ID (o conteúdo pode ser apenas `{ "email": "seuemail@exemplo.com" }`).

A partir daí, esse usuário poderá entrar em `/#/admin` e, uma vez logado,
poderá promover outros administradores pelo mesmo processo (ou diretamente
pelo Console).

## 4. Rodar localmente

```
npm install
npm run dev
```

Acesse `http://localhost:5173`. A área administrativa fica em
`http://localhost:5173/#/admin`.

## 5. Criar os números da rifa

Na primeira vez que você salvar a tela **Configuração** (dentro do painel
admin), o sistema cria automaticamente todos os documentos da coleção `rifa`
de `1` até a quantidade configurada — não é necessário nenhum script.

Se preferir popular via linha de comando (por exemplo, para um número muito
grande de rifas), use o script opcional em `scripts/seedRifa.js` (instruções
dentro do próprio arquivo).

## 6. Publicar no GitHub Pages

1. Crie um repositório no GitHub e suba o projeto.
2. Se o nome do repositório não for `rifa-beneficente`, ajuste a propriedade
   `base` em `vite.config.js` para `/nome-do-seu-repositorio/`.
3. Instale as dependências e publique:

   ```
   npm install
   npm run deploy
   ```

   Isso gera a build (`npm run build`) e publica a pasta `dist` na branch
   `gh-pages` usando o pacote `gh-pages`.
4. Em **Settings → Pages** do repositório, confirme que a branch `gh-pages`
   está selecionada como fonte.

> Importante: como o `.env` não é commitado (está no `.gitignore`), o GitHub
> Pages não terá acesso às variáveis de ambiente automaticamente. Rode
> `npm run build` localmente (com o `.env` preenchido) antes do `npm run deploy`,
> para que as credenciais do Firebase já fiquem embutidas nos arquivos gerados.

## 7. Como funciona a prevenção de concorrência

Ao confirmar uma reserva, o app roda uma **transação do Firestore**
(`runTransaction`) que:

1. Relê o estado atual de cada número selecionado direto do servidor;
2. Reserva apenas os que ainda estiverem disponíveis;
3. Retorna a lista de números que já haviam sido reservados por outra pessoa
   enquanto o formulário estava sendo preenchido.

Isso garante que, mesmo com dois usuários clicando em "Reservar" no mesmo
instante para o mesmo número, apenas um deles terá sucesso.

## 8. Personalizando o visual

As cores, tipografia e espaçamentos ficam centralizados em
`src/styles/global.css` (variáveis CSS no topo do arquivo), inspiradas em um
layout de rifa beneficente com tema de festa infantil — roxo profundo, ribbon
vermelho e um medalhão dourado com o valor do ponto. Basta editar as
variáveis para adaptar à identidade visual da sua própria rifa.
