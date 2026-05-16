import { useState, useEffect, useRef } from "react";
import axios from "axios";

const API_BASE = "http://127.0.0.1:8000";

export default function App() {

  // =========================
  // AUTH STATES
  // =========================

  const [username, setUsername] = useState("");

  const [password, setPassword] = useState("");

  const [isSignup, setIsSignup] = useState(false);

  const [token, setToken] = useState(
    localStorage.getItem("jwt_token") || ""
  );

  // =========================
  // CHAT STATES
  // =========================

  const [question, setQuestion] = useState("");

  const [messages, setMessages] = useState([]);

  const [loading, setLoading] = useState(false);

  // =========================
  // PDF STATES
  // =========================

  const [pdfFile, setPdfFile] = useState(null);

  const [documents, setDocuments] = useState([]);

  const [selectedDocument, setSelectedDocument] = useState(null);

  const chatEndRef = useRef(null);

  // =========================
  // AUTO SCROLL
  // =========================

  useEffect(() => {

    chatEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });

  }, [messages]);

  // =========================
  // LOAD DOCUMENTS
  // =========================

  const loadDocuments = async () => {

    try {

      const response = await axios.get(

        `${API_BASE}/documents`,

        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setDocuments(response.data.documents || []);

    } catch (error) {

      console.log(error);
    }
  };

  useEffect(() => {

    if (token) {

      loadDocuments();
    }

  }, [token]);

  // =========================
  // LOGIN
  // =========================

  const login = async () => {

    try {

      const response = await axios.post(

        `${API_BASE}/login`,

        null,

        {
          params: {
            username,
            password
          }
        }
      );

      const jwtToken = response.data.access_token;

      localStorage.setItem(
        "jwt_token",
        jwtToken
      );

      setToken(jwtToken);

      alert("Login successful");

    } catch (error) {

      console.log(error);

      alert("Login failed");
    }
  };

  // =========================
  // SIGNUP
  // =========================

  const signup = async () => {

    try {

      await axios.post(

        `${API_BASE}/signup`,

        null,

        {
          params: {
            username,
            password
          }
        }
      );

      alert("Signup successful");

      setIsSignup(false);

    } catch (error) {

      console.log(error);

      alert("Signup failed");
    }
  };

  // =========================
  // LOGOUT
  // =========================

  const logout = () => {

    localStorage.removeItem("jwt_token");

    setToken("");
  };

  // =========================
  // UPLOAD PDF
  // =========================

  const uploadPDF = async () => {

    if (!pdfFile) {

      alert("Select PDF");

      return;
    }

    try {

      const formData = new FormData();

      formData.append(
        "file",
        pdfFile
      );

      const response = await axios.post(

        `${API_BASE}/upload`,

        formData,

        {
          headers: {

            Authorization: `Bearer ${token}`,

            "Content-Type": "multipart/form-data"
          }
        }
      );

      alert("PDF uploaded successfully");

      loadDocuments();

    } catch (error) {

      console.log(error);

      alert("Upload failed");
    }
  };

  // =========================
  // SEND MESSAGE
  // =========================

  const sendMessage = async () => {

    if (!question.trim()) return;

    const userMessage = {

      role: "user",

      content: question
    };

    setMessages((prev) => [

      ...prev,

      userMessage
    ]);

    setLoading(true);

    try {

      const response = await axios.post(

        `${API_BASE}/chat`,

        {

          message: question,

          document_id:
            selectedDocument?.document_id || null,

          history: []
        },

        {
          headers: {

            Authorization: `Bearer ${token}`
          }
        }
      );

      const aiMessage = {

        role: "assistant",

        content: response.data.response
      };

      setMessages((prev) => [

        ...prev,

        aiMessage
      ]);

    } catch (error) {

      console.log(error);

      alert("Chat failed");
    }

    setQuestion("");

    setLoading(false);
  };

  // =========================
  // LOGIN SCREEN
  // =========================

  if (!token) {

    return (

      <div
        style={{
          height: "100vh",
          background: "#020617",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: "Arial"
        }}
      >

        <div
          style={{
            width: 400,
            background: "#111827",
            padding: 40,
            borderRadius: 20,
            border: "1px solid #1e293b",
            color: "white"
          }}
        >

          <h1
            style={{
              textAlign: "center",
              fontSize: 36,
              marginBottom: 30
            }}
          >
            AI RAG Assistant 🚀
          </h1>

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) =>
              setUsername(e.target.value)
            }
            style={{
              width: "100%",
              padding: 14,
              marginBottom: 15,
              borderRadius: 10,
              border: "1px solid #334155",
              background: "#1e293b",
              color: "white"
            }}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            style={{
              width: "100%",
              padding: 14,
              marginBottom: 20,
              borderRadius: 10,
              border: "1px solid #334155",
              background: "#1e293b",
              color: "white"
            }}
          />

          {
            isSignup ? (

              <button
                onClick={signup}
                style={{
                  width: "100%",
                  padding: 14,
                  borderRadius: 10,
                  background: "#16a34a",
                  border: "none",
                  color: "white",
                  fontSize: 16,
                  cursor: "pointer"
                }}
              >
                Signup
              </button>

            ) : (

              <button
                onClick={login}
                style={{
                  width: "100%",
                  padding: 14,
                  borderRadius: 10,
                  background: "#2563eb",
                  border: "none",
                  color: "white",
                  fontSize: 16,
                  cursor: "pointer"
                }}
              >
                Login
              </button>
            )
          }

          <p
            onClick={() =>
              setIsSignup(!isSignup)
            }
            style={{
              textAlign: "center",
              marginTop: 20,
              cursor: "pointer",
              color: "#94a3b8"
            }}
          >
            {
              isSignup
                ? "Already have account? Login"
                : "Don't have account? Signup"
            }
          </p>

        </div>

      </div>
    );
  }

  // =========================
  // MAIN UI
  // =========================

  return (

    <div
      style={{
        height: "100vh",
        background: "#020617",
        display: "flex",
        color: "white",
        fontFamily: "Arial"
      }}
    >

      {/* SIDEBAR */}

      <div
        style={{
          width: 320,
          background: "#0f172a",
          borderRight: "1px solid #1e293b",
          display: "flex",
          flexDirection: "column",
          padding: 20
        }}
      >

        <h2
          style={{
            fontSize: 28,
            marginBottom: 20
          }}
        >
          📄 DocuChat
        </h2>

        <input
          type="file"
          accept=".pdf"
          onChange={(e) =>
            setPdfFile(e.target.files[0])
          }
          style={{
            marginBottom: 10
          }}
        />

        <button
          onClick={uploadPDF}
          style={{
            padding: 12,
            borderRadius: 10,
            border: "none",
            background: "#2563eb",
            color: "white",
            cursor: "pointer",
            marginBottom: 20
          }}
        >
          Upload PDF
        </button>

        <div
          style={{
            flex: 1,
            overflowY: "auto"
          }}
        >

          <h3
            style={{
              marginBottom: 15
            }}
          >
            Documents
          </h3>

          {
            documents.map((doc, index) => (

              <div
                key={index}
                onClick={() =>
                  setSelectedDocument(doc)
                }
                style={{
                  padding: 12,
                  marginBottom: 10,
                  borderRadius: 10,
                  background:
                    selectedDocument?.document_id ===
                    doc.document_id
                      ? "#2563eb"
                      : "#1e293b",
                  cursor: "pointer"
                }}
              >
                {doc.filename}
              </div>
            ))
          }

        </div>

        <button
          onClick={logout}
          style={{
            padding: 12,
            borderRadius: 10,
            border: "none",
            background: "#dc2626",
            color: "white",
            cursor: "pointer"
          }}
        >
          Logout
        </button>

      </div>

      {/* CHAT AREA */}

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column"
        }}
      >

        {/* HEADER */}

        <div
          style={{
            padding: 20,
            borderBottom: "1px solid #1e293b",
            fontSize: 24
          }}
        >
          AI RAG Assistant 🚀
        </div>

        {/* CHAT */}

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: 20
          }}
        >

          {
            messages.map((msg, index) => (

              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent:
                    msg.role === "user"
                      ? "flex-end"
                      : "flex-start",
                  marginBottom: 20
                }}
              >

                <div
                  style={{
                    maxWidth: "70%",
                    padding: 15,
                    borderRadius: 15,
                    background:
                      msg.role === "user"
                        ? "#2563eb"
                        : "#1e293b",
                    lineHeight: 1.6
                  }}
                >
                  {msg.content}
                </div>

              </div>
            ))
          }

          {
            loading && (

              <div>
                AI is typing...
              </div>
            )
          }

          <div ref={chatEndRef}></div>

        </div>

        {/* INPUT */}

        <div
          style={{
            padding: 20,
            borderTop: "1px solid #1e293b",
            display: "flex",
            gap: 10
          }}
        >

          <input
            type="text"
            placeholder="Ask question about PDF..."
            value={question}
            onChange={(e) =>
              setQuestion(e.target.value)
            }
            onKeyDown={(e) => {

              if (e.key === "Enter") {

                sendMessage();
              }
            }}
            style={{
              flex: 1,
              padding: 14,
              borderRadius: 10,
              border: "1px solid #334155",
              background: "#0f172a",
              color: "white"
            }}
          />

          <button
            onClick={sendMessage}
            style={{
              padding: "14px 24px",
              borderRadius: 10,
              border: "none",
              background: "#2563eb",
              color: "white",
              cursor: "pointer"
            }}
          >
            Send
          </button>

        </div>

      </div>

    </div>
  );
}