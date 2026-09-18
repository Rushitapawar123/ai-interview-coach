import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Mic, MicOff, Volume2, Sparkles, Send, Award, RotateCcw, Loader2 } from 'lucide-react';

function VoiceInterview({ questions = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const currentQuestion = questions[currentIndex] || null;

  // AI Voice Output (Text-to-Speech)
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.95;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  // Auto-speak question when question changes
  useEffect(() => {
    if (currentQuestion) {
      setFeedback(null);
      setUserAnswer('');
      speakText(`Question number ${currentIndex + 1}: ${currentQuestion.question}`);
    }
  }, [currentIndex, currentQuestion]);

  // Speech-to-Text (User Voice Input)
  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Aapka browser Speech Recognition support nahi karta. Chrome Browser use karein.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event) => {
      let fullTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        fullTranscript += event.results[i][0].transcript;
      }
      setUserAnswer(fullTranscript);
    };

    recognition.start();
  };

  // Submit Answer to AI
  const handleEvaluate = async () => {
    if (!userAnswer.trim()) return alert("Pehle bolkar ya likhkar apna answer dein!");

    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/evaluate-answer', {
        question: currentQuestion.question,
        userAnswer: userAnswer
      });

      if (res.data.success) {
        const evalData = res.data.data;
        setFeedback(evalData);
        // AI Bolkar feedback batayega
        speakText(`Your score is ${evalData.score} out of 10. ${evalData.feedback}`);
      }
    } catch (err) {
      console.error(err);
      alert("Evaluation me error aaya. Backend verify karein.");
    } finally {
      setLoading(false);
    }
  };

  if (!questions || questions.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '30px', color: '#666' }}>
        <p>Pehle Resume upload karke questions generate karein!</p>
      </div>
    );
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1e1e2f 0%, #0f0c20 100%)',
      borderRadius: '24px',
      padding: '30px',
      color: '#fff',
      boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
      marginTop: '30px',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <span style={{
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '6px 16px',
          borderRadius: '20px',
          fontSize: '14px',
          fontWeight: 'bold',
          letterSpacing: '1px'
        }}>
          🎙️ MOCK VOICE INTERVIEW ({currentIndex + 1}/{questions.length})
        </span>

        <button
          onClick={() => speakText(currentQuestion.question)}
          style={{
            background: isSpeaking ? '#ff4757' : '#3742fa',
            border: 'none',
            color: '#fff',
            padding: '8px 16px',
            borderRadius: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: '600'
          }}
        >
          <Volume2 size={18} /> {isSpeaking ? 'AI Speaking...' : 'Repeat Question'}
        </button>
      </div>

      {/* AI Avatar / Animation Card */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '18px',
        padding: '25px',
        textAlign: 'center',
        border: '1px solid rgba(255,255,255,0.08)',
        marginBottom: '20px'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          margin: '0 auto 15px auto',
          borderRadius: '50%',
          background: isSpeaking ? 'linear-gradient(45deg, #ff007f, #7928ca)' : 'linear-gradient(45deg, #0070f3, #00dfd8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: isSpeaking ? '0 0 30px #ff007f' : '0 0 20px #0070f3',
          transition: 'all 0.3s ease'
        }}>
          <Sparkles size={40} color="#fff" />
        </div>

        <h3 style={{ fontSize: '20px', fontWeight: '500', lineHeight: '1.5', margin: '0 0 10px 0' }}>
          "{currentQuestion.question}"
        </h3>
        <span style={{ fontSize: '12px', color: '#a0a0b0', background: 'rgba(0,0,0,0.3)', padding: '4px 10px', borderRadius: '6px' }}>
          Type: {currentQuestion.type}
        </span>
      </div>

      {/* User Voice Controls */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <button
          type="button"
          onClick={toggleListening}
          style={{
            width: '90px',
            height: '90px',
            borderRadius: '50%',
            background: isListening ? '#ff4757' : 'linear-gradient(135deg, #2ed573, #1e90ff)',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            boxShadow: isListening ? '0 0 35px #ff4757' : '0 10px 25px rgba(46, 213, 115, 0.4)',
            transition: 'transform 0.2s ease',
            margin: '0 auto'
          }}
        >
          {isListening ? <MicOff size={36} /> : <Mic size={36} />}
        </button>
        <p style={{ marginTop: '10px', fontSize: '14px', color: isListening ? '#ff4757' : '#2ed573', fontWeight: 'bold' }}>
          {isListening ? '🔴 Recording... Speak now' : '🟢 Click Mic to Answer'}
        </p>
      </div>

      {/* Answer Preview Box */}
      <textarea
        rows="3"
        value={userAnswer}
        onChange={(e) => setUserAnswer(e.target.value)}
        placeholder="Your recorded voice text will appear here..."
        style={{
          width: '100%',
          background: 'rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '12px',
          padding: '12px',
          color: '#fff',
          fontSize: '14px',
          outline: 'none',
          marginBottom: '15px'
        }}
      />

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button
          onClick={handleEvaluate}
          disabled={loading}
          style={{
            background: '#7928ca',
            color: '#fff',
            border: 'none',
            padding: '12px 25px',
            borderRadius: '12px',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '15px'
          }}
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
          Get AI Voice Feedback
        </button>

        {currentIndex < questions.length - 1 && (
          <button
            onClick={() => setCurrentIndex((prev) => prev + 1)}
            style={{
              background: 'rgba(255,255,255,0.1)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.2)',
              padding: '12px 20px',
              borderRadius: '12px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Next Question ➡️
          </button>
        )}
      </div>

      {/* Feedback Card */}
      {feedback && (
        <div style={{
          marginTop: '25px',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.03))',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid #7928ca'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', color: '#00dfd8' }}>
              <Award size={22} /> AI Score
            </span>
            <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#2ed573' }}>
              {feedback.score} / 10
            </span>
          </div>
          <p style={{ color: '#d0d0e0', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
            <strong>Feedback:</strong> {feedback.feedback}
          </p>
        </div>
      )}
    </div>
  );
}

export default VoiceInterview;