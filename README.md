# Bug Management System

A fullstack web application for reporting, tracking, and managing software bugs. Built with Laravel (backend API) and React (frontend) using Vite and Tailwind CSS.

## Features
- User authentication (admin, developer, tester roles)
- Report, edit, and delete bugs
- Assign bugs to developers
- Track bug status and priority
- Comment on bugs
- Responsive dashboard for testers, developers, and admins

## Tech Stack
- **Backend:** Laravel 12 (API only), PHP 8.2, MySQL
- **Frontend:** React 19, Vite, Tailwind CSS, Axios, React Router
- **Other:** Laravel Sanctum (API auth), Eloquent ORM

## Project Structure
- `app/Http/Controllers/` — Laravel API controllers
- `app/Models/` — Eloquent models
- `routes/api.php` — API routes
- `frontend/` — React app (Vite + Tailwind)
- `frontend/src/pages/` — React pages (Dashboard, Bug Details, etc.)

## Getting Started

### Backend (Laravel API)
1. **Install dependencies:**
   ```bash
   composer install
   ```
2. **Copy and configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env for your DB and mail settings
   ```
3. **Generate app key:**
   ```bash
   php artisan key:generate
   ```
4. **Run migrations:**
   ```bash
   php artisan migrate
   ```
5. **Start the server:**
   ```bash
   php artisan serve
   ```

### Frontend (React)
1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```
2. **Start the dev server:**
   ```bash
   npm run dev
   ```

## .gitignore
The project uses two `.gitignore` files to properly handle both backend and frontend ignores:

### Root `.gitignore` (Laravel Backend)
- Laravel specific files (`/vendor`, `.env`, `/storage`)
- Backend build files
- PHP related files (`.phpunit.cache`, etc.)

### Frontend `.gitignore` (React)
- Node.js specific files (`node_modules`, `dist`, `dist-ssr`)
- Frontend build outputs
- Frontend specific logs

This dual setup ensures that:
- Backend and frontend dependencies are properly ignored
- Build artifacts are not committed
- Sensitive files (like `.env`) are excluded
- IDE/editor files are ignored
- Log files are excluded

## Contribution
1. Fork the repo and create a feature branch.
2. Commit your changes with clear messages.
3. Open a pull request describing your changes.

## License
MIT


