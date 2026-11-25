# django-blog-web

Interface web (front-end) do projeto **django-blog**, construída com React, Vite e TypeScript.

## Stack

| Tecnologia | Uso |
|---|---|
| [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) | Interface |
| [Vite](https://vite.dev/) | Servidor de desenvolvimento e build |
| [Tailwind CSS v4](https://tailwindcss.com/) | Estilização (via plugin `@tailwindcss/vite`) |
| [shadcn/ui](https://ui.shadcn.com/) | Componentes de interface (código dentro do projeto) |
| [ESLint](https://eslint.org/) | Análise estática |
| [Husky](https://typicode.github.io/husky/) | Hook de `pre-commit` que roda o lint |
| [Docker](https://www.docker.com/) | Ambiente de desenvolvimento e build de produção |

## Requisitos

Escolha **uma** das opções:

- **Docker** (recomendado): Docker Desktop (Windows/macOS) ou Docker Engine (Linux), com Compose v2.
- **Local**: Node.js 22 ou superior e npm 10 ou superior.

## Início rápido com Docker

```bash
git clone <url-do-repositorio>
cd django-blog-web

# 1. Crie o arquivo de variáveis de ambiente
cp .env.example .env              # PowerShell: Copy-Item .env.example .env

# 2. Suba o ambiente de desenvolvimento
docker compose up --build
```

Acesse **http://localhost:5173**. O hot reload já vem ativo: ao salvar um arquivo em `src/`, o navegador atualiza sozinho.

Comandos úteis:

```bash
docker compose up -d              # sobe em segundo plano
docker compose logs -f web        # acompanha os logs
docker compose restart web        # reinicia (reinstala dependências novas na subida)
docker compose stop               # para sem remover
docker compose down               # para e remove container e rede
docker compose down -v            # idem, e apaga o volume do node_modules
docker compose exec web sh        # abre um terminal dentro do container
```

## Início rápido sem Docker

```bash
npm install
cp .env.example .env
npm run dev
```

Acesse **http://localhost:5173**.

## Variáveis de ambiente

Definidas no arquivo `.env` (modelo em `.env.example`). O `.env` **não deve ser versionado**: confirme que ele está no `.gitignore`.

| Variável | Padrão | Descrição |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8000` | URL do backend, acessada pelo navegador |
| `VITE_USE_POLLING` | `true` | Ativa polling do file watcher. Necessário no Windows/macOS com Docker; em Linux nativo pode ser `false` |
| `FRONTEND_PORT` | `5173` | Porta do front no seu computador |
| `PROD_PORT` | `8080` | Porta do nginx no perfil de produção |

Somente variáveis com o prefixo `VITE_` chegam ao código do navegador. **Nunca coloque segredos nelas**, pois ficam visíveis a qualquer pessoa que abra o site. No código, leia assim:

```ts
const apiUrl = import.meta.env.VITE_API_URL
```

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento com hot reload |
| `npm run build` | Verifica os tipos (`tsc -b`) e gera o build em `dist/` |
| `npm run lint` | Roda o ESLint em todo o projeto |
| `npm run preview` | Serve o build gerado localmente |

Confira o `package.json` para a lista atual e completa.

## Estrutura do projeto

```
django-blog-web/
├── .husky/                  # hooks do Git (pre-commit roda o lint)
├── public/                  # arquivos estáticos
├── src/
│   ├── components/
│   │   └── ui/              # componentes gerados pelo shadcn/ui
│   ├── lib/
│   │   └── utils.ts         # helper cn() usado pelos componentes
│   ├── index.css            # Tailwind e tokens de tema
│   └── main.tsx             # ponto de entrada
├── components.json          # configuração do shadcn/ui
├── Dockerfile               # estágios: dev, build e prod
├── docker-compose.yml
├── nginx.conf               # usado no estágio de produção
├── eslint.config.js
├── vite.config.ts
├── tsconfig.json
├── tsconfig.app.json
└── tsconfig.node.json
```

## Tailwind CSS

A configuração usa o Tailwind v4, que **não precisa** de `tailwind.config.js` nem de PostCSS:

- O plugin `@tailwindcss/vite` está registrado no `vite.config.ts`.
- O `src/index.css` começa com `@import "tailwindcss";`.
- O `src/main.tsx` importa o `index.css`.

Basta usar as classes utilitárias nos componentes:

```tsx
<h1 className="text-3xl font-bold text-blue-500">Olá</h1>
```

Os tokens de tema (cores, raio de borda, modo escuro) ficam no `src/index.css`, na seção criada pelo shadcn/ui.

## shadcn/ui

O projeto já está inicializado (`components.json`) e usa o alias `@/` apontando para `src/`. O alias está configurado em três lugares, que devem permanecer em sincronia:

- `tsconfig.json` e `tsconfig.app.json` (`paths`), para o editor e o CLI;
- `vite.config.ts` (`resolve.alias`), para o build.

Para adicionar componentes:

```bash
npx shadcn@latest add button
npx shadcn@latest add card dialog input
```

Os arquivos são criados em `src/components/ui/` e usados assim:

```tsx
import { Button } from "@/components/ui/button"

export default function App() {
  return <Button>Salvar</Button>
}
```

Usando Docker, o comando pode rodar no seu computador (os arquivos aparecem no container pelo bind mount). Depois, execute `docker compose restart web` para o container instalar as dependências novas.

> **ESLint e shadcn/ui:** os componentes do shadcn exportam, no mesmo arquivo, componentes e funções (como `buttonVariants`), o que viola a regra `react-refresh/only-export-components`. Por isso a regra está desligada apenas para `src/components/ui/**` no `eslint.config.js`. O restante do projeto continua com a regra ativa.

## Docker em detalhes

O `Dockerfile` tem estágios independentes:

| Estágio | Finalidade |
|---|---|
| `dev` | Vite com hot reload (usado pelo `docker compose up`) |
| `build` | Gera o `dist/` com `npm run build` |
| `prod` | nginx servindo o build, com fallback para SPA |

Detalhes do ambiente de desenvolvimento:

- O código é montado por **bind mount** (`.:/app`), então as edições aparecem na hora.
- O `node_modules` do container fica em um **volume nomeado**, separado do `node_modules` do seu computador. Isso evita conflitos entre sistemas operacionais.
- Na subida, o container roda `npm install`. Por isso adicionar uma dependência não exige recriar volumes: basta `docker compose restart web`.
- `HUSKY=0` impede que o husky tente configurar hooks do Git dentro do container.

### Build de produção local

```bash
docker compose --profile prod up --build web-prod
```

Acesse **http://localhost:8080**. A `VITE_API_URL` é **embutida no build**, então, se ela mudar, rode o comando novamente com `--build`.

## Deploy na Vercel

O front é um SPA estático: a Vercel roda `npm run build` e serve o `dist/`. A configuração fica no `vercel.json`:

- **`framework: vite`**, `buildCommand`, `outputDirectory` e `installCommand` explícitos.
- **Rewrite de SPA**: qualquer rota sem extensão de arquivo (ex.: `/login`, `/posts/123`) cai no `index.html`, para que o React Router assuma o roteamento. Sem isso, recarregar uma rota interna daria 404. Os caminhos sob `/assets/` e os arquivos com extensão continuam sendo servidos como estáticos.
- **Cache dos assets**: os arquivos em `/assets/` têm nome com hash, então recebem `Cache-Control` de um ano, imutável.

Variáveis de ambiente no painel da Vercel (**Project → Settings → Environment Variables**):

| Variável | Valor | Observação |
|---|---|---|
| `VITE_API_URL` | `https://django-blog-mu.vercel.app` | URL do backend, **sem** barra no final e **sem** `/api/v1` (o cliente HTTP acrescenta o prefixo) |

Como `VITE_API_URL` é embutida no build, qualquer mudança no valor exige um novo deploy para ter efeito.

> **CORS:** o backend precisa liberar a origem do front em produção (o domínio `*.vercel.app` do deploy). Sem isso, as chamadas à API falham com erro de rede no navegador. O ajuste é feito no repositório do backend (`django-blog`).

### Windows e macOS

O Docker nesses sistemas não repassa eventos de arquivo para o container, por isso `VITE_USE_POLLING=true` é necessário para o hot reload funcionar. No `vite.config.ts`, a opção `server.watch.usePolling` deve ler essa variável:

```ts
server: {
  host: true,
  port: 5173,
  watch: { usePolling: process.env.VITE_USE_POLLING === 'true' },
}
```

No Windows, o desempenho é melhor com o Docker Desktop usando WSL2.

## Husky e commits

O hook `.husky/pre-commit` executa `npm run lint` antes de cada commit. Se houver erros, o commit é bloqueado até que sejam corrigidos. Evite `git commit --no-verify`, exceto em emergências.

Recomenda-se o padrão de mensagens [Conventional Commits](https://www.conventionalcommits.org/pt-br/), por exemplo:

```
feat: adiciona listagem de posts
fix: corrige redirecionamento após login
chore: atualiza dependências
```

## Usando com o backend

O backend (`django-blog`) é um repositório separado. Os dois sobem juntos, com o PostgreSQL, pelo compose da pasta `blog-stack`.

O backend expõe a **API REST em JSON** com Django REST Framework, sob o prefixo `/api/v1/`, e autentica por **JWT (Bearer)** com `rest_framework_simplejwt`. A origem do front já é liberada por CORS (`http://localhost:5173`). O cliente HTTP do front (`src/services/http.ts`) monta a baseURL como `${VITE_API_URL}/api/v1`.

Endpoints consumidos pelas telas de usuário (M12–M14):

| Fluxo | Método e rota |
|---|---|
| Health check | `GET /api/v1/health/` |
| Cadastro | `POST /api/v1/auth/register/` |
| Login (par de tokens) | `POST /api/v1/auth/login/` |
| Renovar access token | `POST /api/v1/auth/refresh/` |
| Logout (revoga refresh) | `POST /api/v1/auth/logout/` |
| Solicitar reset de senha | `POST /api/v1/auth/password-reset/` |
| Confirmar reset de senha | `POST /api/v1/auth/password-reset/confirm/` |
| Perfil do usuário atual | `GET`/`PATCH /api/v1/users/me/` |

A documentação interativa (Swagger UI) fica em `http://localhost:8000/api/docs/`. No fluxo de recuperação de senha em desenvolvimento, o e-mail com o link é impresso em `docker compose logs backend`.

Ao rodar a stack completa:

1. Pare o compose do front (`docker compose down`), pois ambos usam a porta 5173 por padrão. Se preferir manter os dois, altere `FRONTEND_PORT` em um deles.
2. Suba a stack a partir da pasta `blog-stack`.

## Solução de problemas

**A porta 5173 já está em uso.** Altere `FRONTEND_PORT` no `.env` (por exemplo, `5174`) e suba de novo.

**O hot reload não atualiza no Windows/macOS.** Confirme que `VITE_USE_POLLING=true` está no `.env` e que o `vite.config.ts` lê essa variável em `server.watch.usePolling`.

**Instalei uma dependência e o container não a enxerga.** Execute `docker compose restart web`. Se persistir, use `docker compose down -v` seguido de `docker compose up --build`.

**`Missing script: "test"` ao fazer commit.** O hook do husky está chamando um script que não existe. Edite `.husky/pre-commit` para usar `npm run lint`.

**`Fast refresh only works when a file only exports components` em `src/components/ui`.** Verifique se o bloco de override para `src/components/ui/**` está presente no `eslint.config.js`.

**Avisos `LF will be replaced by CRLF`.** São inofensivos. O `.gitattributes` do projeto normaliza as quebras de linha para LF.

**`Cannot find module '@/...'`.** Confira o alias `@` em `tsconfig.json`, `tsconfig.app.json` e `vite.config.ts`.

**Linux: arquivos criados pelo container ficam com dono `root`.** Corrija com `sudo chown -R $USER:$USER .`.