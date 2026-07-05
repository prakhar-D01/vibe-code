# Vibe Code

An in-browser, AI-assisted code editor built with Next.js — write code in a full-featured Monaco editor, get AI-powered autocomplete, and run your project live in the browser via WebContainers.


## Features

- 🖊️ **Monaco-powered editor** — the same editor that powers VS Code, embedded via `@monaco-editor/react`
- 📦 **In-browser runtime** — spin up and run full Node.js projects directly in the browser using `@webcontainer/api`
- 🚀 **Starter templates** — bootstrap new projects from the `vibecode-starters` templates
- 🔐 **Authentication** — sign-in flow powered by `next-auth` (Auth.js v5) with Prisma adapter
- 🗄️ **Persistence** — projects, users, and sessions stored via Prisma ORM
- 🎨 **Modern UI** — built with `shadcn/ui`, Radix primitives, and Tailwind CSS
- 📊 **Charts & markdown** — rich content rendering with `recharts`, `react-markdown`, and KaTeX math support
- 🧩 **Command palette, resizable panels, toasts, drawers** — via `cmdk`, `react-resizable-panels`, `sonner`, and `vaul`
- 🧠 **State management** — `zustand` for lightweight global state

## Tech Stack

| Category | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| Language | TypeScript |
| UI | React 19, Tailwind CSS 4, shadcn/ui, Radix UI |
| Editor | Monaco Editor, Monacopilot |
| Sandboxing | WebContainers API |
| Auth | NextAuth (Auth.js) v5 |
| Database / ORM | Prisma |
| State | Zustand |
| Other | Recharts, React Markdown, KaTeX, Embla Carousel |

## Project Structure

```
vibe-code/
├── app/                  # Next.js App Router pages, layouts, and routes
├── components/           # Reusable UI components
├── hooks/                # Custom React hooks
├── lib/                  # Shared utilities and helper functions
├── modules/              # Feature modules (editor, projects, etc.)
├── prisma/               # Prisma schema and migrations
├── public/                # Static assets
├── vibecode-starters/    # Starter project templates users can spin up
├── auth.ts               # NextAuth configuration
├── auth.config.ts        # Auth providers/config
├── middleware.ts         # Route protection middleware
└── routes.ts             # Route definitions (public/protected)
```

## Getting Started

### Prerequisites

- Node.js 18+
- A Postgres (or other Prisma-supported) database
- npm / yarn / pnpm / bun

### 1. Clone the repo

```bash
git clone https://github.com/prakhar-D01/vibe-code.git
cd vibe-code
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/vibecode"

AUTH_SECRET="your-auth-secret"
# Add any OAuth provider credentials you use, e.g.:
# AUTH_GITHUB_ID=
# AUTH_GITHUB_SECRET=
# AUTH_GOOGLE_ID=
# AUTH_GOOGLE_SECRET=
```

### 4. Set up the database

```bash
npx prisma generate
npx prisma migrate dev
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build the app for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |

## Deployment

This is a standard Next.js app and can be deployed on [Vercel](https://vercel.com/new) or any platform that supports Node.js. Make sure to provision a database and set the required environment variables on your hosting platform.

## Contributing

Contributions, issues, and feature requests are welcome. Feel free to open a pull request or issue.

