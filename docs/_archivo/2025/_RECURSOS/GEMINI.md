# GEMINI.md

## Project Overview

This is a **CashGuard Paradise** project, a cash control system for Acuarios Paradise. It is a React application built with Vite, TypeScript, and Tailwind CSS. The application is designed to be mobile-first and can be installed as a Progressive Web App (PWA) for offline use. It features a dual-operation system for morning cash counts and evening cash cuts, with a three-phase cash counting process. The project emphasizes security with features like witness validation and anti-fraud protocols.

The project follows a "Docker-First" philosophy, meaning all development, testing, and execution should be performed within the provided Docker environment to ensure consistency.

## Building and Running

### Development

To run the application in a development environment, you need to have Docker and Docker Compose installed.

1.  **Build and Start the Container:**
    ```bash
    docker-compose --profile dev up --build
    ```

2.  **Accessing the Application:**
    The application will be available at [http://localhost:5173](http://localhost:5173).

### Testing

The project uses Vitest and React Testing Library for testing. All tests are run inside Docker containers.

*   **Run all tests:**
    ```bash
    ./Scripts/docker-test-commands.sh test
    ```

*   **Run unit tests:**
    ```bash
    ./Scripts/docker-test-commands.sh test:unit
    ```

*   **Run integration tests:**
    ```bash
    ./Scripts/docker-test-commands.sh test:integration
    ```

## Development Conventions

*   **Code Style:** The project uses ESLint for code linting. You can run the linter with `npm run lint`.
*   **Architecture:**
    *   The application uses a modular component structure, with components organized by feature.
    *   Business logic is encapsulated in custom hooks (`src/hooks`).
    *   **Wizard V3 Architecture:** For any component that guides the user through a sequence of steps, the "Wizard V3" architecture must be implemented. This architecture separates the UI (dumb component), logic (custom hook), and data (configuration file).
*   **Styling:** The project uses Tailwind CSS and a "Glass Effect Design System" with a specific color palette and blur effects.
*   **State Management:** The project uses React Hook Form for forms and `@tanstack/react-query` for server state management. Custom hooks like `usePhaseManager`, `useGuidedCounting`, and `useCalculations` are used for client-side state management.
*   **Validation:** Zod is used for data validation.
*   **Progressive Web App (PWA):** The application is a PWA, and its configuration can be found in `vite.config.ts`.

## Dual Operation Modes

*   **Morning Count (Inicio de turno):**
    *   Verifies the $50 change fund.
    *   A 2-phase process (no Phase 2 if ≤$50).
    *   Physical cash only.
    *   Uses an orange color gradient.
*   **Evening Cut (Fin de turno):**
    *   Compares with SICAR expected sales.
    *   A 3-phase process (including cash delivery if >$50).
    *   All payment types (cash + electronic).
    *   Uses a blue-purple color gradient.

## Anti-Fraud Measures

*   **Blind System:** No preview of totals during counting.
*   **Single Count Restriction:** Only one count is allowed per session.
*   **Mandatory Witness:** A witness (different from the cashier) is required.
*   **Alert System:** An alert is triggered for discrepancies greater than $3.00.
*   **Pattern Detection:** The system detects patterns of consecutive shortages.