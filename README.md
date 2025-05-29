
# StretchyKats - A Line-Drawing Puzzle Game

StretchyKats is a fun and challenging line-drawing puzzle game built with Next.js and React. The objective is to connect all pairs of colored dots on a grid by drawing paths between them. The catch? Paths cannot cross, and to complete a level, every cell on the grid must be filled by a path.

## Features

*   **Multiple Difficulty Levels**: Easy, Medium, and Hard puzzles to test your skills.
*   **Interactive Gameplay**: Click or drag to draw paths between matching colored dots.
*   **Win Condition**: Successfully connect all pairs and fill the entire grid to win.
*   **Hint System**: Get a little help if you're stuck (max 3 hints per puzzle).
*   **Progress Tracking**: Your completed levels are saved locally in your browser.
*   **Responsive Design**: Playable on desktop and mobile devices.
*   **Light/Dark Mode**: Choose your preferred visual theme.

## Technologies Used

*   **Frontend**:
    *   [Next.js](https://nextjs.org/) (App Router)
    *   [React](https://reactjs.org/)
    *   [TypeScript](https://www.typescriptlang.org/)
*   **UI Components**:
    *   [ShadCN UI](https://ui.shadcn.com/)
    *   [Lucide React](https://lucide.dev/) (for icons)
*   **Styling**:
    *   [Tailwind CSS](https://tailwindcss.com/)
*   **State Management**:
    *   React Hooks (`useState`, `useEffect`, `useRef`, `useCallback`)
    *   `next-themes` for theme switching
*   **AI (Planned/Included in Stack)**:
    *   [Genkit](https://firebase.google.com/docs/genkit) (Note: Currently not used for core game logic but part of the project's default stack)

## Getting Started

### Prerequisites

*   Node.js (version 18.x or later recommended)
*   npm (usually comes with Node.js)

### Running Locally

1.  **Clone the repository (if applicable) or ensure you have the project files.**

2.  **Install dependencies:**
    Open your terminal in the project's root directory and run:
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```
    This command usually starts the development server on `http://localhost:9002` (or the port specified in your `package.json`'s `dev` script). Open this URL in your browser to play the game.

    The app will automatically reload if you make changes to the code.

### Building for Production

To create an optimized production build of the application:

1.  **Run the build command:**
    ```bash
    npm run build
    ```
    This will generate a `.next` folder containing the production-ready files.

2.  **Start the production server (optional, for local testing of the build):**
    ```bash
    npm run start
    ```

## Project Structure

*   `src/app/`: Contains the main application pages and layouts (using Next.js App Router).
    *   `src/app/page.tsx`: Home page (difficulty selection).
    *   `src/app/levels/[difficulty]/page.tsx`: Level selection page for a specific difficulty.
    *   `src/app/play/[difficulty]/[levelId]/page.tsx`: The game board page for a specific puzzle.
*   `src/components/`: Reusable React components.
    *   `src/components/ui/`: ShadCN UI components.
    *   `src/components/game-board.tsx`: The core game board logic and rendering.
    *   `src/components/game-header.tsx`: The main application header.
    *   `src/components/win-modal.tsx`: Modal displayed upon level completion.
*   `src/lib/`: Contains utility functions, game logic, and puzzle data.
    *   `src/lib/game-logic.ts`: Core functions for game state initialization, move validation, and win condition checking.
    *   `src/lib/puzzles-data.ts`: Loads and manages puzzle definitions.
    *   `src/lib/pregenerated-puzzles.ts`: Contains the actual puzzle data (dot placements and solution paths).
    *   `src/lib/progress.ts`: Handles saving and retrieving player progress using `localStorage`.
*   `src/types/`: TypeScript type definitions for the application.
*   `public/`: Static assets.
*   `src/ai/`: Genkit related files (part of the default stack).

## How Puzzles Work

*   Puzzles are defined in `src/lib/pregenerated-puzzles.ts`.
*   Each puzzle specifies its size, dot locations, colors, and the **solution path** for each pair of dots. This solution path is used by the Hint system.
*   The win condition requires connecting all dot pairs **and** filling every cell on the grid with a path.

Let me know if you'd like to contribute or have any questions!
