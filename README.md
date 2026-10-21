# Bytebank

Aplicativo de gerenciamento financeiro desenvolvido em React Native (Expo), com autenticação, transações financeiras, upload de recibos e integração com Firebase e Cloudinary.

## Funcionalidades

- Autenticação de usuários (login e cadastro) via Firebase Auth
- Dashboard com visão geral das finanças
- Listagem de transações com filtros por tipo (entrada/saída) e categoria
- Adição de novas transações com upload de recibo/comprovante

## Tecnologias utilizadas

- React Native
- Expo
- Firebase (Authentication, Firestore)
- Cloudinary (upload de imagens)
- Expo Router

## Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn
- Expo CLI (`npm install -g expo-cli`, opcional — o projeto já usa `npx expo`)
- Conta no Firebase
- Conta no Cloudinary

## Configuração do Firebase

1. Acesse o [Firebase Console](https://console.firebase.google.com/) e crie um novo projeto (ou use um existente).
2. Ative os seguintes serviços:
   - **Authentication** (método de login por Email/Senha)
   - **Cloud Firestore** (modo de produção ou teste, conforme necessidade)
3. Copie as credenciais do seu projeto (disponíveis em Configurações do Projeto > Geral > Seus apps) e adicione no arquivo:

```
src/services/firebaseConfig.js
```

Exemplo:

```javascript
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_PROJETO.firebaseapp.com",
  projectId: "SEU_PROJETO",
  storageBucket: "SEU_PROJETO.appspot.com",
  messagingSenderId: "SEU_SENDER_ID",
  appId: "SEU_APP_ID",
};
```

## Configuração do Cloudinary

1. Crie uma conta gratuita em [cloudinary.com](https://cloudinary.com/).
2. No painel, anote o **Cloud Name** do seu projeto.
3. Crie um **Upload Preset** sem assinatura (unsigned), em Settings > Upload > Upload presets.
4. Atualize o arquivo:

```
src/services/cloudinaryConfig.js
```

Com o seu Cloud Name e o nome do Upload Preset:

```javascript
const CLOUDINARY_CLOUD_NAME = 'SEU_CLOUD_NAME';
const CLOUDINARY_UPLOAD_PRESET = 'SEU_UPLOAD_PRESET';
```

## Instalação e execução

Clone o repositório e instale as dependências:

1. Clone o repositório:
```bash
git clone https://github.com/mikamoori/bytebank.git
```
 
2. Entre na pasta do projeto:
```bash
cd bytebank
```
 
3. Instale as dependências:
```bash
npm install
```
 
4. Inicie o servidor de desenvolvimento:
```bash
npx expo start --clear
```
 
5. Aguarde o terminal exibir o QR code e a mensagem `Using Expo Go (Press s to switch to development build)`.

Para abrir no navegador (web), pressione a tecla `w` (sem enter) diretamente no terminal onde o servidor está rodando. Isso abre automaticamente `http://localhost:8081`. Caso não abra sozinho, acesse esse endereço manualmente no navegador.

## Estrutura do projeto

```
bytebank/
├── src/
│   ├── app/            # Rotas e telas (Expo Router)
│   ├── components/     # Componentes reutilizáveis
│   ├── context/         # Contextos globais (autenticação)
│   ├── screens/         # Telas de login/cadastro
│   └── services/        # Configurações do Firebase e Cloudinary
├── assets/
├── app.json
└── package.json
```

## Autor

Thamiris Adriano — Tech Challenge Fase 03 (Pós Tech - Front-end Engineering)