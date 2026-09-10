# Running Verbo locally

This project has two processes that must run at the same time:

- a FastAPI backend at `http://127.0.0.1:8000`
- a Vite/React frontend (normally `http://localhost:8080` or the URL Vite prints)

## Prerequisites

Install these first:

- Node.js 18 or newer
- Python 3.10 or newer
- [Ollama](https://ollama.com/), with the `llama3.2` model installed

The backend directory is named `backend `, including a trailing space. Keep the quotation marks in the commands below.

## First-time setup

Open a terminal in the project root, then install the frontend packages:

```sh
cd frontend
npm install
cd ..
```

Create a Python virtual environment and install backend packages:

```sh
cd "backend "
python3 -m venv venv
source venv/bin/activate
pip install -r requirments.txt
cd ..
```

Start Ollama and download the model once:

```sh
ollama serve
```

In a separate terminal:

```sh
ollama pull llama3.2
```

## Start the application

Use three terminals.

**Terminal 1 — Ollama**

```sh
ollama serve
```

**Terminal 2 — backend**

```sh
cd "backend "
source venv/bin/activate
python main.py
```

The API should be available at `http://127.0.0.1:8000`. Its interactive API documentation is at `http://127.0.0.1:8000/docs`.

**Terminal 3 — frontend**

```sh
cd frontend
npm run dev
```

Open the localhost URL printed by Vite in the browser. The frontend is configured to call the backend at `http://127.0.0.1:8000`.

## Useful checks

```sh
# Frontend quality checks
cd frontend
npm run lint
npm test
npm run build
```

Press `Ctrl+C` in each terminal to stop its server.

## Git ignore notes

The root `.gitignore` excludes dependencies, Python environments, generated build files, local secrets, caches, and macOS/editor files. It intentionally keeps source code, `package-lock.json`, `bun.lockb`, and `requirments.txt` tracked so another developer can reproduce the install.

`.gitignore` only affects untracked files. This repository already tracks `backend /venv` and `.DS_Store`; after reviewing the staged removal, use the following once to stop tracking them while leaving the local files in place:

```sh
git rm -r --cached "backend /venv" .DS_Store
git add .gitignore RUNNING.md
git status
```
