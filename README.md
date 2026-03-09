# MindEase (Web)

Aplicação web de suporte cognitivo (TDAH, TEA, dislexia, burnout, ansiedade): tarefas, preferências acessíveis e gamificação. Projeto em **React + Vite + TypeScript**, com **Clean Architecture** e preparação para **microfrontends** e **Firebase**.

---

## Requisitos

- **Node.js**: versão **20.19+** ou **22.12+** (obrigatório para Vite 7; Node 18 causa erro `crypto.hash is not a function`).
  - Verificar: `node -v`
  - Instalar/gerenciar versões: [nvm](https://github.com/nvm-sh/nvm) — `nvm install 20` e `nvm use 20`.

---

## Como rodar

```bash
npm install
npm run dev
```

> Porta padrão: **5173**. Se a porta estiver em uso, rode `npm run dev:alt` (usa 5174) ou encerre o processo: `npx kill-port 5173`.

```bash
npm run build    # produção
npm run preview  # preview do build
```

---

## Stack e libs

| Uso | Tecnologia |
|-----|------------|
| **Core** | React 19, Vite 7, TypeScript 5.9 |
| **UI** | Material UI (MUI) 5, Emotion |
| **Roteamento** | React Router DOM 6 |
| **Estado** | Zustand (preferências, shell, gamificação) |
| **Drag and drop** | @dnd-kit (core, sortable, utilities) |
| **Estilos** | Sass (global), variáveis CSS, tema MUI |
| **Build** | Vite, @originjs/vite-plugin-federation (Module Federation) |

---

## Arquitetura

- **Clean Architecture + MVVM**: domínio isolado, casos de uso independentes de UI, adaptadores por interfaces.
- **Camadas**:
  - **`domain/`** — entidades, portas (repositórios), casos de uso
  - **`infra/`** — implementações (auth e tarefas: Firebase ou localStorage conforme config)
  - **`view/`** — páginas, componentes, view models, tema, contexto (Auth, preferências)
  - **`shared/`** — container (DI), store global (shell), utils

**Rotas** com **lazy loading** (`React.lazy` + `Suspense`); fallback de carga é a tela de Splash.

---

## Features

### Autenticação (Firebase Auth; fallback mock local sem .env)
- Splash, Login, Cadastro, Esqueci senha
- Cadastro: nome, e-mail, senha, **termos de uso** (página `/termos-de-uso`)
- Rotas públicas e protegidas com `AuthGuard`

### Painel cognitivo
- Complexidade (simples / padrão / detalhado)
- Modo foco, modo resumo, animações, alertas cognitivos (15/30/45 min)
- Contraste (normal / alto / muito alto), tamanho da fonte, espaçamento
- **Perfil de navegação** (padrão / foco profundo / assistido)
- **Necessidades específicas** (TDAH, dislexia, ansiedade, sobrecarga) com presets automáticos
- **Rotina** (estudo / trabalho / foco) para duração do Pomodoro

### Tarefas (Kanban)
- Colunas A fazer, Fazendo, Feito; drag and drop (@dnd-kit)
- **Timer de foco (Pomodoro)** por tarefa: iniciar, pausar, retomar; alerta de pausa conforme rotina (20/45/25 min)
- **Checklist** por tarefa; sugestão “Mover para Feito” quando todos os itens marcados
- Avisos de transição ao trocar de tarefa em foco; sugestão de próxima tarefa ao concluir
- Limite cognitivo (alerta com 3+ tarefas em “Fazendo”)
- Preferências aplicadas em tempo real (tema, foco, animações)

### Perfil
- **Aba Resumo**: preferências em chips, gamificação (pontos, total ganho), aviso sobre Firebase
- **Aba Dados e conta**: editar nome e e-mail, **alterar senha** (Firebase: senha atual obrigatória)

### Persistência
- **Com Firebase** (config em `src/lib/firebase.ts` ou `.env`): Auth (Firebase Auth), tarefas e preferências em **Firestore** (`users/{userId}`: profile, preferences, kanban.tasks). **Mesmos contratos do app mobile** — o que fizer na web reflete no mobile e vice-versa.
- **Sem Firebase** (sem config): Auth e tarefas em **localStorage** (FakeAuthRepository, TasksRepositoryLocalStorage); preferências em localStorage (Zustand persist).
- Tema e acessibilidade aplicados via `PreferencesEffects` (variáveis CSS e `data-*` no `:root`)

---

## Microfrontends (Module Federation)

O projeto **já está configurado** para Module Federation (Vite + `@originjs/vite-plugin-federation`). Hoje tudo roda como **um único app (host)**; não é obrigatório usar microapps.

Se no futuro você quiser extrair módulos em apps separados:

1. O `vite.config.ts` já expõe:
   - `./PanelApp` → `src/microfrontends/panel/remote.ts`
   - `./TasksApp` → `src/microfrontends/tasks/remote.ts`
   - `./ProfileApp` → `src/microfrontends/profile/remote.ts`
2. A comunicação entre “módulos” hoje é o **shell store** (Zustand): preferências, pontos, event bus (`emit` / `lastGlobalEvent`). O mesmo contrato serve para microapps quando forem remotes.
3. Para virar remotes de verdade: criar projetos Vite separados para cada módulo, configurar `remotes` no host e trocar imports locais por `import(...)` dos remotes.

Ou seja: **está pronto para usar microapps quando quiser**; até lá, o app único segue funcionando normalmente.

---

## Firebase (integrado; mesmo projeto do mobile)

A web usa **o mesmo projeto Firebase do app mobile** (config em `src/lib/firebase.ts` ou variáveis `VITE_FIREBASE_*` no `.env`). Contratos e estrutura de dados idênticos:

- **Auth**: Firebase Auth (login, registro com nome, logout, recuperar senha, atualizar perfil, alterar senha com reautenticação).
- **Firestore** `users/{userId}`: `profile`, `preferences`, `kanban.tasks` — tarefas e preferências sincronizadas entre web e mobile.

1. Opcional: criar `.env` a partir de `.env.example` e preencher `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, etc. Se não houver `.env`, a app usa a config padrão do mesmo projeto (ver `src/lib/firebase.ts`).
2. O `container` em `src/shared/container.ts` já escolhe Firebase quando `isFirebaseConfigured` é true; caso contrário usa FakeAuth + LocalStorage.

---

## Estrutura de pastas (resumo)

```txt
src/
  domain/          # entidades, portas, use cases
  infra/           # auth (fake + firebase stub), repositórios (local + firebase stub)
  view/            # App, AppRouter, layout, pages, components, viewmodels, theme, context
  microfrontends/  # remotes (panel, tasks, profile) para Module Federation
  shared/          # container, store (shell)
```

---
