# Activity Trip Requests API

API REST para gerenciamento simplificado de solicitações de viagem institucional.

## Equipe

- [Francisco Alves Ribeiro Neto](https://github.com/fnetgit)
- [Fabrício Fontenele Vieira](https://github.com/Fabricio-Fontenele)
- [Gabriel Oliveira Pinto](https://github.com/gaboliveira-alt)
- [Ruan Pedro de Araujo Anjos](https://github.com/AnjosR)

## Tecnologias

- Node.js
- TypeScript em modo estrito
- Fastify
- Prisma
- PostgreSQL
- Docker Compose
- Vitest
- pnpm

SGBD escolhido: PostgreSQL.

Gerenciador de pacotes adotado: pnpm.

## Requisitos

- Node.js 22.16 ou superior
- Corepack habilitado
- Docker e Docker Compose

Observação sobre versão do Node.js: se `pnpm run dev` exibir um aviso como
`Unsupported engine: wanted: {"node":">=22.16 <25"} (current: {"node":"v22.14.0", ...})`,
atualize o Node.js para uma versão compatível com o projeto, por exemplo Node.js 22.16 ou superior
dentro da linha 22, ou outra versão menor que 25. Depois confirme com:

```bash
node --version
```

## Configuração

Instale as dependências:

```bash
pnpm install
```

Crie o arquivo de ambiente a partir do exemplo:

```bash
cp .env.example .env
```

O arquivo `.env.example` já contém valores funcionais para execução local:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/travel_requests
HOLIDAYS_API_BASE_URL=https://brasilapi.com.br
```

## Banco de dados

Suba apenas o PostgreSQL com Docker Compose:

```bash
docker compose up -d
```

Depois, no terminal do projeto, crie as estruturas do banco e popule os 10 registros iniciais com o script do pnpm:

```bash
pnpm run init:db
```

Não execute `docker run init:db`: esse comando faz o Docker procurar uma imagem chamada `init:db`, que não existe neste projeto.

O script `init:db` executa `prisma db push` e `prisma db seed`. Ele pode ser executado mais de uma vez sem quebrar a aplicação.

## Execução

Ambiente de desenvolvimento:

```bash
pnpm run dev
```

Build e execução de produção:

```bash
pnpm run build
pnpm start
```

## Testes

Execute a suíte automatizada:

```bash
pnpm test
```

Os testes usam fakes e mocks para não depender da disponibilidade real da BrasilAPI.

## Endpoints

Todas as respostas seguem o formato:

```json
{
  "success": true,
  "data": {}
}
```

Erros seguem o formato:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "A clear and objective error message"
  }
}
```

### POST /trip-requests

Cria uma solicitação de viagem.

Exemplo de corpo:

```json
{
  "requesterName": "Maria Silva",
  "origin": "Parnaiba",
  "destination": "Teresina",
  "departureAt": "2026-06-24T10:00:00.000Z",
  "returnAt": "2026-06-24T18:00:00.000Z",
  "purpose": "Participation in an institutional meeting",
  "passengerCount": 3
}
```

Regras principais:

- `status` inicial sempre `pending`;
- `returnAt` deve ser posterior ou igual a `departureAt`;
- `passengerCount` deve ser maior que zero;
- `departureAt` não pode cair em feriado nacional espelhado da BrasilAPI no banco de dados.

### GET /trip-requests

Lista as solicitações cadastradas.

### GET /trip-requests/:id

Consulta uma solicitação específica pelo identificador.

### PATCH /trip-requests/:id/cancel

Cancela uma solicitação existente.

Uma solicitação já cancelada retorna erro `TRIP_REQUEST_ALREADY_CANCELED`.

### GET /holidays/:year

Consulta feriados nacionais de um ano usando o espelho persistido no banco de dados.

Quando o ano ainda não está espelhado, a API consulta a BrasilAPI configurada por `HOLIDAYS_API_BASE_URL`,
salva os feriados no banco e reutiliza esses registros nas próximas consultas.
