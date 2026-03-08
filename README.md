# MindEase (Web)

Aplicação web de suporte cognitivo (TDAH, TEA, dislexia, burnout, ansiedade): tarefas, preferências acessíveis e gamificação. Projeto em **React + Vite + TypeScript**, com **Clean Architecture** e preparação para **microfrontends** e **Firebase**.

---

## Como rodar

```bash
npm install
npm run dev
```

> Porta padrão: **5173**.

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
  - **`infra/`** — implementações (auth e tarefas em localStorage; Firebase preparado)
  - **`view/`** — páginas, componentes, view models, tema, contexto (Auth, preferências)
  - **`shared/`** — container (DI), store global (shell), utils

**Rotas** com **lazy loading** (`React.lazy` + `Suspense`); fallback de carga é a tela de Splash.

---

## Features

### Autenticação (mock local; Firebase quando integrar)
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
- **Aba Dados e conta**: editar nome e e-mail, **alterar senha** (tudo preparado para Firebase)

### Persistência
- Preferências e gamificação: **Zustand persist** (localStorage)
- Auth e tarefas: **localStorage** (FakeAuthRepository, TasksRepositoryLocalStorage)
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

## Firebase (quando quiser ligar)

1. Criar `.env` a partir de `.env.example` e configurar o Firebase.
2. Implementar/ajustar `infra/auth/*Firebase.ts` e `infra/repositories/*Firebase.ts`.
3. Trocar os repositórios no `src/shared/container.ts` (auth e tarefas).

A infra de auth já prevê: login, registro (com nome), logout, esqueci senha, **atualizar perfil** (nome/e-mail) e **alterar senha**.

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
