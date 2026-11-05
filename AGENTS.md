# AGENTS.md — django-blog-web

Front-end do blog, em React + Vite + TypeScript. O backend fica em outro repositório (`django-blog`, Django) e está sendo convertido em uma API REST.

## Stack

- React + TypeScript, com Vite.
- Tailwind CSS v4 pelo plugin `@tailwindcss/vite`. **Não existe `tailwind.config.js`**: a entrada é `@import "tailwindcss";` em `src/index.css`, onde também ficam os tokens de tema.
- shadcn/ui: componentes em `src/components/ui/`, configuração em `components.json`, helper `cn()` em `src/lib/utils.ts`.
- Alias `@/` aponta para `src/` (definido em `tsconfig.json`, `tsconfig.app.json` e `vite.config.ts`).
- ESLint (flat config em `eslint.config.js`) e Husky.

## Comandos

Ambiente padrão (Docker), em PowerShell:

```powershell
docker compose up --build      # http://localhost:5173
docker compose restart web     # depois de instalar dependências novas
docker compose down            # parar
```

Sem Docker: `npm install` e `npm run dev`.

Antes de dar uma tarefa como concluída, rode `npm run lint` e `npm run build`. O hook de `pre-commit` do Husky também roda o lint. Confira o `package.json` para a lista atual de scripts.

## Convenções

- Componentes funcionais em TypeScript; evite `any`.
- Imports pelo alias `@/`.
- Estilo com classes utilitárias do Tailwind. Evite CSS avulso; ajustes de tema vão nos tokens do `src/index.css`.
- Novos componentes de UI: `npx shadcn@latest add <componente>`. Os arquivos de `src/components/ui/` são gerados; só edite à mão se for necessário. A regra `react-refresh/only-export-components` está desligada **somente** nessa pasta.
- Estrutura planejada: `src/pages`, `src/components`, `src/services` (cliente HTTP) e `src/lib`.
- Chamadas à API passam pelo cliente em `src/services`, usando `import.meta.env.VITE_API_URL` como base. Não espalhe `fetch` pelos componentes.
- Variáveis `VITE_*` são públicas, porque vão para o navegador. Nunca coloque segredos nelas.

## Backend e API

- O backend está em `django-blog`, com API planejada sob `/api/v1/` e porta 8000 em desenvolvimento.
- Nem todos os endpoints existem ainda. Confira o que está disponível antes de assumir. Se faltar um endpoint, avise em vez de inventar a resposta ou criar um mock sem avisar.
- Não altere o repositório do backend a partir daqui.

## Docker

- O `node_modules` do container fica em um volume nomeado, e o container roda `npm install` na subida.
- `HUSKY=0` no container evita que o Husky mexa nos hooks do Git.
- No Windows e no macOS, `VITE_USE_POLLING=true` é necessário para o hot reload.
- O `.env` não é versionado; o modelo é o `.env.example`.

## Regras de trabalho

- Não faça commit nem push sem pedido explícito. Mensagens no padrão Conventional Commits (`feat:`, `fix:`, `chore:`).
- Não use `git commit --no-verify`.
- Não instale dependências novas sem avisar e justificar.
- Nas decisões ainda em aberto (onde guardar o token de login, se a leitura de posts é pública, idioma da interface), pergunte antes de implementar.
- Se não conseguir rodar ou verificar algo, diga exatamente o que ficou sem verificação.
- Converse em português do Brasil; nomes de arquivos, variáveis e componentes em inglês.

## Backlog

As telas e a infraestrutura estão nas issues M10 a M21 do repositório (`Lucas-Brandi/django-blog-web`). Cada título traz as dependências, como `M12 — ... (depende de M2, M3, M10)`. Leia a issue inteira antes de implementar.
