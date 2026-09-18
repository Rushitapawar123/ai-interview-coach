
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const { GoogleGenAI } = require('@google/genai');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Initialize Google Gemini AI
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Multer Storage Configuration
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// 1. Generate Questions Route
app.post('/api/generate-questions', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a PDF resume file.' });
    }

    const targetRole = req.body.targetRole || 'Software Engineer';
    const experienceLevel = req.body.experienceLevel || 'Fresher';

    const pdfData = await pdfParse(req.file.buffer);
    const resumeText = pdfData.text;

    if (!resumeText || resumeText.trim().length === 0) {
      return res.status(400).json({ error: 'Could not extract text from the PDF.' });
    }

    const prompt = `
      You are an expert HR Manager and Technical Interviewer.
      Analyze the following candidate resume for the target role "${targetRole}" at experience level "${experienceLevel}".

      Resume Text:
      "${resumeText}"

      Tasks:
      1. Calculate an ATS Match Score percentage (0 to 100) based on skills in the resume vs "${targetRole}".
      2. List top 3-5 missing key technologies/keywords needed for "${targetRole}".
      3. Generate 5 customized interview questions (Technical & Behavioral) tailored specifically to the candidate's projects/experience.

      STRICT REQUIREMENT: Output strictly RAW JSON format without any markdown code blocks or additional text.
      Format:
      {
        "atsScore": 75,
        "missingKeywords": ["Docker", "Redis", "TypeScript"],
        "questions": [
          { "id": 1, "type": "Technical", "question": "Question text here..." },
          { "id": 2, "type": "Behavioral", "question": "Question text here..." }
        ]
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
    });

    let rawText = response.text || '';
    rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

    const parsedData = JSON.parse(rawText);

    res.status(200).json({
      success: true,
      data: parsedData,
    });

  } catch (error) {
    console.error('Server Catch Error:', error);
    res.status(500).json({
      error: 'Failed to process request',
      details: error.message,
    });
  }
});

// 2. Evaluate Answer Route
app.post('/api/evaluate-answer', async (req, res) => {
  try {
    const { question, userAnswer } = req.body;

    if (!userAnswer || !userAnswer.trim()) {
      return res.status(400).json({ error: 'Please provide a valid answer.' });
    }

    const prompt = `
      You are an expert technical interviewer.
      Question: "${question}"
      Candidate Answer: "${userAnswer}"

      Tasks:
      1. Evaluate the candidate's answer on a scale of 1 to 10.
      2. Provide 2-3 concise sentences of feedback highlighting strengths and key improvements.

      STRICT REQUIREMENT: Output strictly RAW JSON format without any markdown wrapping.
      Format:
      {
        "score": 8,
        "feedback": "Great explanation of concepts. You could improve by mentioning performance optimization."
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
    });

    let rawText = response.text || '';
    rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

    const resultData = JSON.parse(rawText);

    res.status(200).json({
      success: true,
      data: resultData,
    });

  } catch (error) {
    console.error('Answer Evaluation Error:', error);
    res.status(500).json({
      error: 'Failed to evaluate answer',
      details: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});