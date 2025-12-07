# Equibase Upload

A modern web application built with React, TypeScript, and Vite for managing horse racing data uploads.

## Tech Stack

- **Framework:** [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **Data Fetching:** [TanStack Query](https://tanstack.com/query/latest)
- **Backend/Auth:** [Supabase](https://supabase.com/)
- **Testing:** [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/)

## Prerequisites

- Node.js (v18+ recommended)
- [pnpm](https://pnpm.io/) (preferred package manager)

## Getting Started

1.  **Clone the repository**

    ```bash
    git clone <repository-url>
    cd equibase-upload
    ```

2.  **Install dependencies**

    ```bash
    pnpm install
    ```

3.  **Environment Setup**

    Copy the example environment file:
    ```bash
    cp .env.example .env
    ```

    Fill in the required environment variables in `.env`:
    - `VITE_SUPABASE_URL`: Your Supabase project URL
    - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous API key
    - `VITE_API_URL`: Backend API URL (default: `http://localhost:3000`)

4.  **Run the development server**

    ```bash
    pnpm dev
    ```

    The app should be running at `http://localhost:5173`.

## Available Scripts

- `pnpm dev`: Starts the development server.
- `pnpm build`: Builds the app for production (type checks + builds).
- `pnpm preview`: Previews the production build locally.
- `pnpm test`: Runs unit tests with Vitest.
- `pnpm test:ui`: Runs Vitest with a UI.
- `pnpm lint`: Lints the codebase using ESLint.

## Project Structure

```
src/
├── components/   # Reusable UI components
├── hooks/        # Custom React hooks
├── lib/          # Utilities and configurations (supabase, utils)
└── ...
```

## License

This project is private.
