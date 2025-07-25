# Flourish.ai

This is a web application that allows users to record their daily notes and goals, and then uses a local AI to analyze their personal development, productivity, and progress. The application is built with React for the frontend and Python with FastAPI for the backend.

## Features

- **Daily Notes:** A dedicated space for users to write about their day.
- **Goal Tracking:** A section to list and manage daily goals.
- **AI Analysis:** An AI-powered analysis of the user's notes and goals, providing insights into their personal growth and suggestions for optimization.
- **Local First:** All data and AI models run locally on your machine, ensuring privacy and offline access.

## Tech Stack

- **Frontend:** React, Vite
- **Backend:** Python, FastAPI
- **AI:** Ollama (with the `phi3:mini` model by default)

## Prerequisites

- [Node.js](https://nodejs.org/) (v20.11.0 or later recommended, use `nvm` with the provided `.nvmrc` file)
- [Python](https://www.python.org/) (3.8 or later)
- [Ollama](https://ollama.ai/)
- [nvm](https://github.com/nvm-sh/nvm) (Node Version Manager)

## Setup and Installation

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
          cd flourish-ai
    ```

2.  **Set up the Backend:**

    - Navigate to the `backend` directory:
      ```bash
      cd backend
      ```
    - Create and activate a virtual environment:
      ```bash
      python3 -m venv venv
      source venv/bin/activate
      ```
    - Install the required Python packages:
      ```bash
      pip install -r requirements.txt
      ```

3.  **Set up the Frontend:**

    - Navigate to the `frontend` directory:
      ```bash
      cd ../frontend
      ```
    - Use `nvm` to switch to the correct Node.js version:
      ```bash
      nvm use
      ```
    - Install the required npm packages:
      ```bash
      npm install
      ```

4.  **Set up Ollama:**
    - Install Ollama from [ollama.ai](https://ollama.ai/).
    - Pull the default model:
      ```bash
      ollama pull phi3:mini
      ```

## Running the Application

1.  **Start the Backend Server:**

    - In a terminal, navigate to the `backend` directory and ensure your virtual environment is activated.
    - Run the server:
      ```bash
      uvicorn main:app --reload
      ```
    - The backend will be available at `http://localhost:8000`.

2.  **Start the Frontend Server:**

    - In a **new** terminal, navigate to the `frontend` directory.
    - Run the server:
      ```bash
      npm run dev
      ```
    - The frontend will be available at `http://localhost:5173`.

3.  **Open the Application:**
    - Navigate to `http://localhost:5173` in your web browser.

---

## Choosing a Different AI Model

You can easily switch to a different model. For an M2 MacBook Air with 8GB of RAM, here are some excellent options:

| Model        | Size | RAM Usage (Approx.) | Notes                                                 |
| ------------ | ---- | ------------------- | ----------------------------------------------------- |
| `phi3:mini`  | 3.8B | ~2.2GB              | **(Default)** Excellent balance of speed and quality. |
| `qwen:4b`    | 4B   | ~2.4GB              | A strong alternative to `phi3:mini`.                  |
| `mistral:7b` | 7B   | ~4.1GB              | Top-tier analysis, but uses more memory.              |
| `gemma:2b`   | 2B   | ~1.4GB              | A fast and lightweight option.                        |
| `qwen:1.8b`  | 1.8B | ~1.1GB              | The fastest and most responsive option.               |

**To change the model:**

1.  **Open `backend/main.py`**.
2.  **Find this line:**
    ```python
    response = ollama.chat(model='phi3:mini', messages=[
    ```
3.  **Change `'phi3:mini'`** to your desired model (e.g., `'mistral:7b'`).
4.  **Pull the new model** with Ollama:
    ```bash
    ollama pull <model_name>
    ```
5.  **Restart the backend server.**
