from fastapi import FastAPI, UploadFile, File, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from pydantic import BaseModel

from pymongo import MongoClient

from jose import jwt

from passlib.context import CryptContext

from datetime import datetime, timedelta

from sentence_transformers import SentenceTransformer

from langchain_text_splitters import RecursiveCharacterTextSplitter

from pypdf import PdfReader

from groq import Groq

import chromadb

import shutil

import uuid

from fastapi.middleware.cors import CORSMiddleware

from dotenv import load_dotenv
import os
load_dotenv()

# FastAPI App
app = FastAPI()
app.add_middleware(

    CORSMiddleware,

    allow_origins=["*"],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)

# =========================
# JWT CONFIG
# =========================

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))
# =========================
# PASSWORD HASHING
# =========================

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

# =========================
# JWT SECURITY
# =========================

security = HTTPBearer()

# =========================
# GROQ CLIENT
# =========================

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)
# =========================
# MONGODB
# =========================

mongo_client = MongoClient(
    os.getenv("MONGO_URI")
)

db = mongo_client["rag_database"]

users_collection = db["users"]

chat_collection = db["chat_history"]

# =========================
# EMBEDDING MODEL
# =========================

embedding_model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)

# =========================
# CHROMADB
# =========================

chroma_client = chromadb.Client()

collection = chroma_client.get_or_create_collection(
    name="rag_collection"
)

# =========================
# REQUEST MODEL
# =========================

class ChatRequest(BaseModel):

    message: str

    document_id: str | None = None

    history: list = []

# =========================
# VERIFY TOKEN
# =========================

def verify_token(

    credentials: HTTPAuthorizationCredentials = Depends(security)
):

    try:

        token = credentials.credentials

        payload = jwt.decode(

            token,

            SECRET_KEY,

            algorithms=[ALGORITHM]
        )

        username = payload.get("sub")

        if username is None:

            raise HTTPException(

                status_code=401,

                detail="Invalid token"
            )

        return username

    except Exception:

        raise HTTPException(

            status_code=401,

            detail="Invalid or expired token"
        )

# =========================
# HOME API
# =========================

@app.get("/")
def home():

    return {
        "message": "AI RAG Assistant Running"
    }

# =========================
# SIGNUP API
# =========================

@app.post("/signup")
async def signup(

    username: str,

    password: str
):

    existing_user = users_collection.find_one({

        "username": username
    })

    if existing_user:

        return {
            "message": "User already exists"
        }

    hashed_password = pwd_context.hash(password[:72])

    users_collection.insert_one({

        "username": username,

        "password": hashed_password
    })

    return {
        "message": "User created successfully"
    }

# =========================
# LOGIN API
# =========================

@app.post("/login")
async def login(

    username: str,

    password: str
):

    user = users_collection.find_one({

        "username": username
    })

    if not user:

        return {
            "message": "User not found"
        }

    valid_password = pwd_context.verify(

        password,

        user["password"]
    )

    if not valid_password:

        return {
            "message": "Invalid password"
        }

    expire = datetime.utcnow() + timedelta(

        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload = {

        "sub": username,

        "exp": expire
    }

    token = jwt.encode(

        payload,

        SECRET_KEY,

        algorithm=ALGORITHM
    )

    return {

        "access_token": token,

        "token_type": "bearer"
    }

# =========================
# UPLOAD PDF API
# =========================

@app.post("/upload")
async def upload_pdf(

    file: UploadFile = File(...),

    username: str = Depends(verify_token)
):

    try:

        # Create uploads folder if needed
        import os

        os.makedirs("uploads", exist_ok=True)

        # Save file
        file_path = f"uploads/{file.filename}"

        with open(file_path, "wb") as buffer:

            shutil.copyfileobj(
                file.file,
                buffer
            )

        # Read PDF
        reader = PdfReader(file_path)

        text = ""

        for page in reader.pages:

            extracted = page.extract_text()

            if extracted:

                text += extracted

        # Split text
        text_splitter = RecursiveCharacterTextSplitter(

            chunk_size=500,

            chunk_overlap=50
        )

        chunks = text_splitter.split_text(text)

        # Create document ID
        document_id = f"doc_{int(datetime.utcnow().timestamp() * 1000)}"

        # Embeddings
        embeddings = embedding_model.encode(chunks)

        # Store in ChromaDB
        for i, chunk in enumerate(chunks):

            collection.add(

                documents=[chunk],

                embeddings=[
                    embeddings[i].tolist()
                ],

                ids=[f"{document_id}_chunk_{i}"],

                metadatas=[

                    {
                        "username": username,

                        "filename": file.filename,

                        "document_id": document_id
                    }
                ]
            )

        return {

            "message": "PDF processed successfully",

            "document_id": document_id,

            "total_chunks": len(chunks)
        }

    except Exception as e:

        return {
            "error": str(e)
        }

# =========================
# GET DOCUMENTS
# =========================

@app.get("/documents")
async def get_documents(

    username: str = Depends(verify_token)
):

    try:

        results = collection.get(

            where={
                "username": username
            }
        )

        metadatas = results["metadatas"]

        documents = []

        seen_docs = set()

        for metadata in metadatas:

            doc_id = metadata["document_id"]

            if doc_id not in seen_docs:

                seen_docs.add(doc_id)

                documents.append({

                    "document_id": doc_id,

                    "filename": metadata["filename"]
                })

        return {

            "documents": documents
        }

    except Exception as e:

        return {
            "error": str(e)
        }

# =========================
# CHAT API
# =========================

@app.post("/chat")
async def chat(

    data: ChatRequest,

    username: str = Depends(verify_token)
):

    try:

        question = data.message

        document_id = data.document_id
        print("QUESTION:", question)

        print("DOCUMENT ID:", document_id)

        # RAG Logic
        if document_id:

            question_embedding = embedding_model.encode(question)

            results = collection.query(

                query_embeddings=[
                    question_embedding.tolist()
                ],

                n_results=3,

                where={
                    "$and": [
                        {
                            "username": username
                        },
                        {
                            "document_id": document_id
                        }
                    ]
                }
            )

            retrieved_chunks = results["documents"][0]
            print("RESULTS:", results)
            print("RETRIEVED CHUNKS:", retrieved_chunks)

            context = "\n".join(retrieved_chunks)

            prompt = f"""

Answer only using the context below.

Context:
{context}

Question:
{question}

"""

        else:

            prompt = question

        # AI Response
        response = client.chat.completions.create(

            model="llama-3.1-8b-instant",

            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],

            max_tokens=300,

            temperature=0.3
        )

        answer = response.choices[0].message.content

        # Save Chat
        chat_collection.insert_one({

            "username": username,

            "question": question,

            "answer": answer
        })

        return {

            "response": answer
        }

    except Exception as e:

        return {
            "error": str(e)
        }