# 🚀 AI RAG Resume Analyzer

A full-stack AI-powered Resume Analyzer and RAG (Retrieval-Augmented Generation) Assistant built using FastAPI, React, ChromaDB, MongoDB, JWT Authentication, and Groq LLM.

This application allows users to:
- Upload PDF resumes
- Chat with uploaded resumes using AI
- Analyze resumes for Data Analyst / AI Engineer / ML roles
- Perform semantic search using vector embeddings
- Use JWT authentication for secure login/signup
- Store chat history and resume embeddings

---

# 📸 Project Preview

## Features UI
- Modern React frontend
- Dark AI-style chat interface
- PDF upload system
- Resume semantic search
- AI chat assistant
- JWT authentication
- Multiple document support

---

# 🧠 AI Features

✅ Resume Analysis  
✅ RAG Pipeline  
✅ Semantic Search  
✅ PDF Question Answering  
✅ Job Suitability Analysis  
✅ ATS-style Resume Suggestions  
✅ Skill Gap Detection  
✅ AI Career Guidance  

---

# 🛠 Tech Stack

## Frontend
- React.js
- Axios
- CSS
- Vite

## Backend
- FastAPI
- Python
- JWT Authentication
- Groq API
- LangChain
- ChromaDB
- MongoDB

## AI / ML
- Sentence Transformers
- Embeddings
- Vector Database
- RAG Architecture
- Semantic Search

---

# ⚡ Architecture

```text
PDF Upload
   ↓
Text Extraction
   ↓
Chunking
   ↓
Embeddings
   ↓
ChromaDB Storage
   ↓
Semantic Search
   ↓
Groq LLM
   ↓
AI Response
```

---

# 🔐 Authentication

The project includes:

- User Signup
- User Login
- JWT Token Authentication
- Protected APIs
- Token-based Authorization

---

# 📂 Project Structure

```text
rag_project/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── uploads/
├── main.py
├── requirements.txt
├── .gitignore
└── README.md
```

---

# 🔥 API Endpoints

## Authentication

### Signup
```http
POST /signup
```

### Login
```http
POST /login
```

---

## PDF APIs

### Upload PDF
```http
POST /upload
```

### Get Documents
```http
GET /documents
```

### Delete Document
```http
DELETE /delete-document
```

---

## Chat APIs

### AI Resume Chat
```http
POST /chat
```

### Chat History
```http
GET /history
```

---

# 📦 Installation

## 1. Clone Repository

```bash
git clone https://github.com/vighneshmane07/ai-rag-career-assistant.git
```

---

## 2. Backend Setup

```bash
cd rag_project

python -m venv venv

venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run backend:

```bash
uvicorn main:app --reload
```

Backend runs on:

```text
http://127.0.0.1:8000
```

---

## 3. Frontend Setup

```bash
cd frontend
```

Install packages:

```bash
npm install
```

Run frontend:

```bash
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

---

# 🧪 Example Questions

```text
Is this resume suitable for Data Analyst role?
```

```text
What technical skills are missing?
```

```text
Can this candidate become an AI Engineer?
```

```text
Give ATS improvement suggestions.
```

```text
Summarize this resume.
```

---

# 🚀 Future Improvements

- Streaming AI responses
- Voice assistant integration
- OCR for scanned PDFs
- Resume vs Job Description matching
- ATS score calculation
- Multi-user dashboard
- AI memory system
- LangGraph agents
- Deployment with Docker
- Cloud hosting

---

# 🌐 Deployment Options

## Frontend
- Vercel
- Netlify

## Backend
- Render
- Railway

## Database
- MongoDB Atlas

---

# 👨‍💻 Author

## Vighnesh Mane

AI/ML Engineer | Data Analyst | AI Developer

GitHub:
https://github.com/vighneshmane07

---

# ⭐ If You Like This Project

Give this repository a star ⭐ on GitHub.

---

# 📜 License

This project is licensed under the MIT License.
