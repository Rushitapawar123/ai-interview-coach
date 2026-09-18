import React, { useState } from 'react';
import axios from 'axios';
import { Mic, MicOff, Send, Loader2, Award } from 'lucide-react';

function QuestionCard({ q }) {
  const [userAnswer, setUserAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [isListening, setIsListening] = useState(false);

  // Speech-to-Text Handler (Voice Input Fix)
  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert("Aapka browser Voice Input support nahi karta. Kripya Chrome Browser use karein.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US'; // Hindi ke liye 'hi-IN' kar sakte hain

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onerror = (event) => {
      console.error("Speech Recognition Error:", event.error);
      setIsListening(false);
      alert("Microphone Error: " + event.error);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      let currentText = '';
      for (let i = 0; i < event.results.length; i++) {
        currentText += event.results[i][0].transcript;
      }
      setUserAnswer(currentText);
    };

    recognition.start();
  };

  // Submit Answer to AI
  const handleEvaluate = async () => {
    if (!userAnswer.trim()) return alert("Pehle answer likhein ya bolein!");

    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/evaluate-answer', {
        question: q.question,
        userAnswer: userAnswer
      });

      if (res.data.success) {
        setFeedback(res.data.data);
      }
    } catch (err) {
      console.error(err);
      alert("Error evaluating answer. Check backend server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: '#f8f9fa',
      borderLeft: '5px solid #764ba2',
      padding: '15px',
      borderRadius: '8px',
      marginBottom: '15px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
    }}>
      <span style={{
        background: q.type === 'Technical' ? '#e3f2fd' : '#e8f5e9',
        color: q.type === 'Technical' ? '#1976d2' : '#388e3c',
        padding: '3px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: 'bold'
      }}>
        {q.type}
      </span>

      <p style={{ margin: '8px 0', fontSize: '15px', fontWeight: '600' }}>
        {q.question}
      </p>

      {/* Answer Input Box */}
      <div style={{ marginTop: '10px' }}>
        <textarea
          rows="3"
          placeholder="Type your answer here or click Speak Answer..."
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            fontSize: '14px',
            resize: 'vertical'
          }}
        />

        <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
          <button
            type="button"
            onClick={handleVoiceInput}
            style={{
              background: isListening ? '#dc3545' : '#6c757d',
              color: '#fff',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '13px'
            }}
          >
            {isListening ? <MicOff size={16} /> : <Mic size={16} />}
            {isListening ? 'Stop Listening...' : 'Speak Answer'}
          </button>

          <button
            type="button"
            onClick={handleEvaluate}
            disabled={loading}
            style={{
              background: '#764ba2',
              color: '#fff',
              border: 'none',
              padding: '8px 15px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '13px'
            }}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            Get Instant Feedback
          </button>
        </div>
      </div>

      {/* AI Feedback Box */}
      {feedback && (
        <div style={{
          marginTop: '15px',
          background: '#eef2ff',
          border: '1px solid #c7d2fe',
          borderRadius: '6px',
          padding: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4338ca', fontWeight: 'bold' }}>
            <Award size={18} /> Score: {feedback.score} / 10
          </div>
          <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: '#374151' }}>
            <strong>AI Feedback:</strong> {feedback.feedback}
          </p>
        </div>
      )}
    </div>
  );
}

export default QuestionCard;