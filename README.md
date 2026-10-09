# Boilerplate Full Stack

Base reutilizavel para iniciar aplicacoes web full stack. O boilerplate inclui
um frontend React/TypeScript, uma API Express e PostgreSQL, com um fluxo de
autenticacao de exemplo usando JWT e refresh token em cookie `HttpOnly`.

Use este repositorio como ponto de partida: adapte a identidade visual, as
funcionalidades, as configuracoes e os dados do exemplo para o seu projeto.

## Tecnologias

- Frontend: React, TypeScript, Vite e React Router
- Backend: Node.js, Express, JWT, bcrypt e Zod
- Banco de dados: PostgreSQL
- Ambiente local: Docker Compose

## Requisitos

- Docker Desktop com Docker Compose
- Git, caso queira clonar ou versionar o projeto

## Executar com Docker

Abra o PowerShell na pasta raiz do projeto:

```powershell
Copy-Item .env.example .env
```

Edite o arquivo `.env` e substitua as senhas e chaves de exemplo por valores
fortes, especialmente `POSTGRES_PASSWORD`, `JWT_SECRET` e
`REFRESH_TOKEN_SECRET`. O arquivo `.env` contem configuracoes locais e nao deve
ser enviado ao Git.

Inicie os servicos:

```powershell
docker compose up --build
```

Quando os containers estiverem prontos:

- Frontend: <http://localhost:5173>
- API: <http://localhost:3000>
- Verificacao da API: <http://localhost:3000/health>
- PostgreSQL: `localhost:5432`

Para parar os servicos, pressione `Ctrl+C` e execute:

```powershell
docker compose down
```

Os dados do PostgreSQL ficam no volume Docker `postgres_data` e permanecem
salvos ao parar os containers.

## Configuracao

As variaveis usadas pelo Docker Compose ficam em `.env`:

| Variavel | Descricao |
| --- | --- |
| `POSTGRES_DB` | Nome do banco de dados |
| `POSTGRES_USER` | Usuario do PostgreSQL |
| `POSTGRES_PASSWORD` | Senha do PostgreSQL |
| `POSTGRES_PORT` | Porta local publicada pelo PostgreSQL |
| `JWT_SECRET` | Chave secreta para assinar access tokens |
| `JWT_EXPIRES_IN` | Validade do access token, por exemplo `15m` |
| `REFRESH_TOKEN_SECRET` | Variavel de ambiente do Compose; nao e usada pelo codigo atual |
| `REFRESH_TOKEN_EXPIRES_IN` | Variavel de ambiente do Compose; a validade atual e fixa em sete dias |
| `FRONT_URL` | Origem do frontend permitida pela API |
| `VITE_BACK_URL` | Variavel de ambiente do Compose; a URL usada atualmente esta fixa no servico do frontend |

O backend cria as tabelas `users`, `sessions` e `refresh_tokens` ao iniciar.
Para conexoes feitas pelo Compose, ele usa o servico `postgres` como host do
banco. O frontend faz as chamadas a API em `http://localhost:3000`; portanto,
para acessar a aplicacao de outro host, sera necessario ajustar a URL no codigo
do frontend e as configuracoes de CORS.

## Exemplo incluido

O boilerplate traz um fluxo inicial de cadastro, login, renovacao de sessao e
logout, alem de uma pagina protegida para demonstrar o uso da autenticacao.
Esses recursos servem como referencia e podem ser adaptados ou substituidos.

### Paginas do exemplo

- `/` - pagina inicial
- `/register` - cadastro de usuario
- `/login` - login
- `/dashboard` - painel protegido

### Rotas principais da API

| Metodo | Rota | Descricao |
| --- | --- | --- |
| `GET` | `/health` | Verifica se a API esta ativa |
| `POST` | `/api/auth/register` | Cria uma conta |
| `POST` | `/api/auth/login` | Inicia uma sessao |
| `POST` | `/api/auth/refresh` | Renova a sessao |
| `POST` | `/api/auth/logout` | Encerra a sessao |
| `GET` | `/menu` | Exemplo de rota protegida |

O cadastro exige `nome`, `email` e uma senha com pelo menos seis caracteres.
O painel usa `/menu` como exemplo de chamada autenticada.

## Comandos uteis

Executar o lint do frontend dentro do container:

```powershell
docker compose exec frontend npm run lint
```

Gerar o build de producao do frontend:

```powershell
docker compose exec frontend npm run build
```

Ver os logs dos servicos:

```powershell
docker compose logs -f
```

## Estrutura do projeto

```text
.
├── backend/
│   ├── auth/           # Rotas e middleware de autenticacao
│   ├── database/       # Conexao e inicializacao das tabelas
│   └── server.js       # Inicializacao da API Express
├── frontend/
│   └── src/
│       ├── pages/      # Paginas da aplicacao
│       └── services/   # Chamadas a API e contexto de autenticacao
├── .env.example        # Modelo das variaveis locais
└── docker-compose.yml  # Frontend, backend e PostgreSQL
```

## Observacoes de seguranca

- Nao versione `.env` nem inclua senhas ou chaves reais em commits.
- Os valores de `.env.example` sao apenas exemplos para desenvolvimento.
- Antes de publicar em producao, configure segredos fortes, HTTPS, origens
  permitidas e as variaveis de ambiente apropriadas para o ambiente de destino.
