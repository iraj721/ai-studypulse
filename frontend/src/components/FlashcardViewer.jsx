import React, { useState, useEffect } from "react";
import api from "../services/api";
import { FaSync, FaList } from "react-icons/fa";

export default function FlashcardViewer() {
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState("");
  const [generating, setGenerating] = useState(false);
  const [showAll, setShowAll] = useState(false);
  
  useEffect(() => {
    fetchFlashcards();
    fetchNotes();
  }, []);
  
  const fetchFlashcards = async () => {
    try {
      const res = await api.get("/student/flashcards");
      setFlashcards(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchNotes = async () => {
    try {
      const res = await api.get("/notes");
      setNotes(res.data);
    } catch (err) {
      console.error(err);
    }
  };
  
  const generateFromNote = async () => {
    if (!selectedNoteId) return;
    setGenerating(true);
    try {
      await api.post("/student/flashcards/generate", { noteId: selectedNoteId, numCards: 10 });
      await fetchFlashcards();
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };
  
  const reviewCard = async (quality) => {
    if (flashcards.length === 0) return;
    const card = flashcards[currentIndex];
    try {
      await api.put(`/student/flashcards/${card._id}/review`, { quality });
      await fetchFlashcards();
      setCurrentIndex(prev => prev + 1 >= flashcards.length ? 0 : prev + 1);
      setIsFlipped(false);
    } catch (err) {
      console.error(err);
    }
  };
  
  const currentCard = flashcards[currentIndex];
  
  if (loading) return <div style={{ fontSize: '12px', textAlign: 'center' }}>Loading...</div>;
  
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h6 style={{ fontSize: '14px', margin: 0 }}>📇 Flashcards</h6>
        <button onClick={() => setShowAll(!showAll)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#4f46e5' }}>
          <FaList /> {showAll ? 'Hide' : 'View All'}
        </button>
      </div>
      
      {showAll ? (
        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
          {flashcards.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280', fontSize: '12px' }}>No flashcards yet</div>
          ) : (
            flashcards.map((card, idx) => (
              <div key={idx} style={{ padding: '8px', borderBottom: '1px solid #eee', fontSize: '11px' }}>
                <strong>Q:</strong> {card.front.substring(0, 50)}...
              </div>
            ))
          )}
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <select 
              value={selectedNoteId} 
              onChange={(e) => setSelectedNoteId(e.target.value)}
              style={{ flex: 1, padding: '6px', borderRadius: '8px', fontSize: '12px' }}
            >
              <option value="">Select note...</option>
              {notes.map(n => <option key={n._id} value={n._id}>{n.subject} - {n.topic}</option>)}
            </select>
            <button 
              onClick={generateFromNote} 
              disabled={generating || !selectedNoteId}
              style={{ padding: '6px 12px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}
            >
              <FaSync /> Generate
            </button>
          </div>
          
          {flashcards.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280', fontSize: '12px' }}>No flashcards yet</div>
          ) : (
            <>
              <div 
                onClick={() => setIsFlipped(!isFlipped)} 
                style={{ 
                  height: '160px', background: 'white', borderRadius: '12px', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  textAlign: 'center', padding: '15px', cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)', marginBottom: '10px',
                  transition: 'all 0.3s'
                }}
              >
                <p style={{ margin: 0, fontSize: '13px' }}>{isFlipped ? currentCard?.back : currentCard?.front}</p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '10px' }}>
                <button onClick={() => reviewCard(1)} style={{ padding: '4px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '20px', fontSize: '11px', cursor: 'pointer' }}>Hard</button>
                <button onClick={() => reviewCard(3)} style={{ padding: '4px 12px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '20px', fontSize: '11px', cursor: 'pointer' }}>Medium</button>
                <button onClick={() => reviewCard(5)} style={{ padding: '4px 12px', background: '#22c55e', color: 'white', border: 'none', borderRadius: '20px', fontSize: '11px', cursor: 'pointer' }}>Easy</button>
              </div>
              <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '11px', color: '#6b7280' }}>{currentIndex + 1} / {flashcards.length}</div>
            </>
          )}
        </>
      )}
    </div>
  );
}