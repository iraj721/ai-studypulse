const Flashcard = require("../models/Flashcard");
const Note = require("../models/Note");
const askHF = require("../services/aiService");

// Generate flashcards from note
const generateFlashcards = async (req, res) => {
  try {
    const { noteId, numCards = 10 } = req.body;
    
    if (!noteId) {
      return res.status(400).json({ message: "Note ID is required" });
    }
    
    const note = await Note.findOne({ _id: noteId, user: req.user._id });
    
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    
    // ✅ FIX: Check if note has content
    if (!note.content || note.content.length < 50) {
      return res.status(400).json({ 
        message: "Note content is too short. Please add more content to generate flashcards." 
      });
    }
    
    // ✅ STRONGER PROMPT for flashcards
    const prompt = `Generate ${Math.min(numCards, 15)} high-quality flashcards from this study note:

NOTE CONTENT:
${note.content.substring(0, 6000)}

Each flashcard should have:
- Front: A clear, specific question about a key concept from the note
- Back: A concise, accurate answer based ONLY on the note

Return EXACT JSON format:
{
  "flashcards": [
    {"front": "What is X?", "back": "X is defined as..."}
  ]
}

IMPORTANT: Base ALL flashcards on the note content above. DO NOT create generic questions.`;

    const aiResponse = await askHF(prompt);
    console.log("AI Response for flashcards:", aiResponse?.substring(0, 200));
    
    let flashcards = [];
    
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        flashcards = parsed.flashcards || [];
      }
    } catch (parseErr) {
      console.error("JSON Parse error:", parseErr);
    }
    
    // ✅ FALLBACK: Create basic flashcards from note
    if (flashcards.length === 0) {
      // Extract key sentences from note
      const sentences = note.content.split(/[.!?]+/).filter(s => s.trim().length > 30);
      for (let i = 0; i < Math.min(numCards, sentences.length); i++) {
        flashcards.push({
          front: `What is explained in: "${sentences[i].substring(0, 60)}..."?`,
          back: sentences[i].trim()
        });
      }
    }
    
    if (flashcards.length === 0) {
      flashcards.push({
        front: `What is the main topic of "${note.topic}"?`,
        back: `The note covers ${note.subject} - ${note.topic}. Please review the note content.`
      });
    }
    
    // Delete existing flashcards
    await Flashcard.deleteMany({ user: req.user._id, noteId });
    
    // Save new flashcards
    const savedFlashcards = await Flashcard.insertMany(
      flashcards.slice(0, numCards).map(card => ({
        user: req.user._id,
        noteId: note._id,
        front: card.front,
        back: card.back,
        interval: 1,
        easeFactor: 2.5,
        nextReview: new Date()
      }))
    );
    
    res.status(201).json(savedFlashcards);
  } catch (err) {
    console.error("Generate flashcards error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get user's flashcards
const getUserFlashcards = async (req, res) => {
  try {
    const flashcards = await Flashcard.find({ user: req.user._id })
      .sort({ nextReview: 1 });
    res.json(flashcards);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update flashcard after review (spaced repetition)
const reviewFlashcard = async (req, res) => {
  try {
    const { quality } = req.body; // 0-5 rating
    const flashcard = await Flashcard.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!flashcard) {
      return res.status(404).json({ message: "Flashcard not found" });
    }
    
    // SM-2 algorithm
    let { interval, easeFactor } = flashcard;
    
    if (quality >= 3) {
      if (interval === 1) {
        interval = 6;
      } else if (interval === 6) {
        interval = 14;
      } else {
        interval = Math.round(interval * easeFactor);
      }
      easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    } else {
      interval = 1;
    }
    
    if (easeFactor < 1.3) easeFactor = 1.3;
    
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + interval);
    
    flashcard.interval = interval;
    flashcard.easeFactor = easeFactor;
    flashcard.nextReview = nextReview;
    flashcard.lastReviewed = new Date();
    await flashcard.save();
    
    res.json(flashcard);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { generateFlashcards, getUserFlashcards, reviewFlashcard };