# MindEase (Web) — Hackathon Pós Tech

Base inicial do projeto **MindEase** (versão Web) com:
- **React + Vite + TypeScript**
- Preparação para **Microfrontends (Module Federation + Vite)**
- **Clean Architecture + MVVM** separados em camadas **View / Domain / Infra**
- Infra preparada para Firebase (stub), usando **dados mockados (localStorage)** por enquanto

O briefing pede, entre outros pontos:

- Microfrontends com separação clara entre módulos (painel, biblioteca, tarefas, perfil) e comunicação entre microapps
- Clean Architecture com domínio isolado, casos de uso independentes de UI e adaptadores/interfaces claras
- Acessibilidade cognitiva obrigatória (complexidade ajustável, foco, redução de estímulos, animações controláveis)

## Rodando localmente

```bash
npm install
npm run dev
```

> Porta padrão: `5173`.

## Estrutura de pastas (camadas)

```txt
src/
  domain/          # regras + contratos (independente de UI)
  infra/           # implementações (mock/localStorage hoje; Firebase amanhã)
  view/            # UI (React) + ViewModels (MVVM)
  microfrontends/  # “módulos” prontos para serem extraídos em microapps
  shared/          # composition root (DI), utils, tipos
```

### MVVM (na prática)
- **View**: páginas e componentes em `src/view/*` (somente renderização e eventos)
- **ViewModel**: `src/view/viewmodels/*` (estado + orquestração de usecases)
- **Domain**: entidades + casos de uso + portas (interfaces) em `src/domain/*`
- **Infra**: repos concretos em `src/infra/repositories/*`

## Microfrontends (preparação)

O `vite.config.ts` já expõe entradas para cada módulo:
- `./PanelApp`  → `src/microfrontends/panel/remote.ts`
- `./TasksApp`  → `src/microfrontends/tasks/remote.ts`
- `./ProfileApp` → `src/microfrontends/profile/remote.ts`
- `./LibraryApp` → `src/microfrontends/library/remote.ts`

Por enquanto, tudo roda como um único app (host). Depois você pode:
1. Copiar cada pasta de `src/microfrontends/*` para um projeto Vite separado
2. Ajustar o `federation({ name, exposes, remotes })`
3. Substituir os imports locais por remotes

## Firebase (quando você quiser ligar)

1. Crie um `.env` baseado no `.env.example`
2. Implemente `infra/repositories/*Firebase.ts`
3. Troque os repositórios no `src/shared/container.ts`

## O que já vem pronto (mock)

- **Painel Cognitivo**: complexidade, foco, resumo, contraste, fonte, espaçamento, animações, alertas cognitivos
- **Tarefas**: Kanban simples + checklist + Pomodoro (adaptável)
- **Perfil**: preferências persistidas (localStorage)

---

## Referência do briefing
O PDF do briefing está no repositório (ou no envio do trabalho): `POSTECH - FRNT - Hackathon.pdf`
