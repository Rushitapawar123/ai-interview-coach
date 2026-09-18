import React, { useState } from "react";
import axios from "axios";
import {
  Upload,
  Sparkles,
  Award,
  AlertTriangle,
  HelpCircle,
  Loader2,
} from "lucide-react";
import confetti from "canvas-confetti";
import QuestionCard from "./QuestionCard";
import VoiceInterview from "./VoiceInterview";

function ResumeUploader() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // States declared to fix "targetRole is not defined"
  const [targetRole, setTargetRole] = useState("MERN Stack Developer");
  const [experienceLevel, setExperienceLevel] = useState("Fresher");

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a PDF file!");

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("targetRole", targetRole);
    formData.append("experienceLevel", experienceLevel);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/generate-questions",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      if (res.data.success) {
        setResult(res.data.data);
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }
    } catch (err) {
      console.error(err);
      alert("Error generating questions. Check backend server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "40px 20px",
        fontFamily: "'Poppins', sans-serif",
        color: "#333",
      }}
    >
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          background: "#ffffff",
          borderRadius: "20px",
          padding: "30px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h1
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              fontSize: "28px",
              color: "#4A0E4E",
            }}
          >
            <Sparkles color="#667eea" size={32} /> AI Interview Coach 🚀
          </h1>
          <p style={{ color: "#666", fontSize: "15px" }}>
            "Upload your resume and get an instant ATS score along with targeted interview questions!"
          </p>
        </div>

        {/* Dynamic Inputs */}
        <div
          style={{
            display: "flex",
            gap: "15px",
            marginBottom: "20px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: "1 1 200px" }}>
            <label
              style={{
                display: "block",
                fontWeight: "bold",
                marginBottom: "5px",
              }}
            >
              Target Role
            </label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. MERN Developer, Data Analyst"
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #ccc",
              }}
            />
          </div>
          <div style={{ flex: "1 1 150px" }}>
            <label
              style={{
                display: "block",
                fontWeight: "bold",
                marginBottom: "5px",
              }}
            >
              Experience
            </label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #ccc",
              }}
            >
              <option value="Fresher">Fresher</option>
              <option value="1-3 Years">1-3 Years</option>
              <option value="3-5 Years">3-5 Years</option>
              <option value="Senior">Senior</option>
            </select>
          </div>
        </div>

        {/* Upload Form */}
        <form
          onSubmit={handleSubmit}
          style={{
            border: "2px dashed #667eea",
            borderRadius: "15px",
            padding: "30px",
            textAlign: "center",
            backgroundColor: "#f8f9ff",
          }}
        >
          <Upload size={48} color="#667eea" style={{ marginBottom: "10px" }} />
          <br />
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            id="file-input"
            style={{ display: "none" }}
          />
          <label
            htmlFor="file-input"
            style={{
              background: "#667eea",
              color: "#fff",
              padding: "10px 20px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
              display: "inline-block",
              marginBottom: "10px",
            }}
          >
            {file ? file.name : "📁 Choose PDF Resume"}
          </label>

          <br />

          <button
            type="submit"
            disabled={loading || !file}
            style={{
              marginTop: "15px",
              background: loading ? "#ccc" : "#764ba2",
              color: "#fff",
              border: "none",
              padding: "12px 30px",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: loading ? "not-allowed" : "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} /> Analyzing
                Resume...
              </>
            ) : (
              "✨ Generate Questions"
            )}
          </button>
        </form>

        {/* Result Output */}
        {result && (
          <div style={{ marginTop: "30px" }}>
            {/* ATS Score Card */}
            <div
              style={{
                background: "linear-gradient(90deg, #11998e, #38ef7d)",
                color: "#fff",
                padding: "20px",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "20px",
              }}
            >
              <div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: "20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <Award size={24} /> ATS Match Score
                </h3>
                <p style={{ margin: "5px 0 0 0", opacity: 0.9 }}>
                  Target Role: {targetRole}
                </p>
              </div>
              <div style={{ fontSize: "36px", fontWeight: "bold" }}>
                {result.atsScore}%
              </div>
            </div>

            {/* Missing Keywords */}
            <div
              style={{
                background: "#fff3cd",
                padding: "15px",
                borderRadius: "12px",
                marginBottom: "20px",
                border: "1px solid #ffeeba",
              }}
            >
              <h4
                style={{
                  color: "#856404",
                  margin: "0 0 10px 0",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <AlertTriangle size={20} /> Missing Keywords to Improve:
              </h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {result.missingKeywords?.map((kw, idx) => (
                  <span
                    key={idx}
                    style={{
                      background: "#e0a800",
                      color: "#fff",
                      padding: "4px 12px",
                      borderRadius: "20px",
                      fontSize: "13px",
                      fontWeight: "bold",
                    }}
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            {/* Questions List */}
            <div>
              <h3
                style={{
                  color: "#4A0E4E",
                  marginBottom: "15px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <HelpCircle color="#764ba2" /> Custom Interview Questions
              </h3>
              {result.questions?.map((q) => (
                <div
                  key={q.id}
                  style={{
                    background: "#f8f9fa",
                    borderLeft: "5px solid #764ba2",
                    padding: "15px",
                    borderRadius: "8px",
                    marginBottom: "12px",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                  }}
                >
                  {/* Questions List */}
                  <div>
                    <h3
                      style={{
                        color: "#4A0E4E",
                        marginBottom: "15px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <HelpCircle color="#764ba2" /> Custom Interview Questions
                    </h3>
                    {result.questions?.map((q) => (
                      <QuestionCard key={q.id} q={q} />
                    ))}

                    {/* Voice Interactive Interview Section */}
                    {result && result.questions && (
                      <VoiceInterview questions={result.questions} />
                    )}
                  </div>
                  <span
                    style={{
                      background:
                        q.type === "Technical" ? "#e3f2fd" : "#e8f5e9",
                      color: q.type === "Technical" ? "#1976d2" : "#388e3c",
                      padding: "3px 8px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    {q.type}
                  </span>
                  <p
                    style={{
                      margin: "8px 0 0 0",
                      fontSize: "15px",
                      fontWeight: "500",
                    }}
                  >
                    {q.question}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResumeUploader;
