# SXMNOVIA Member Gallery

A Node.js + Express + SQLite web application for displaying member profiles with a built-in chatbot receptionist that schedules meetings and hands off to WhatsApp.

## Features

- Public member gallery (cards with profile images)
- Profile modal with Previous/Next navigation
- AI-like receptionist bot (step‑by‑step, buttons only)
- Age verification (session‑based)
- Meeting scheduling (ASAP or date picker)
- Alternative member suggestions if a member is unavailable
- WhatsApp handoff with pre‑filled message
- Admin panel (password protected) – CRUD for members + properties
- Image upload & automatic 400×400 resizing (Sharp)

## Tech Stack

- Backend: Node.js, Express
- Database: SQLite (sqlite3)
- Frontend: Bootstrap 5, EJS, vanilla JS
- Image processing: Multer + Sharp
- Session: express-session

## Installation

1. Clone the repository
2. Copy `.env.example` to `.env` and adjust values
3. Install dependencies:
   ```bash
   npm install