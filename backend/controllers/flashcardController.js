const Flashcard = require("../models/Flashcard");
const Note = require("../models/Note");
const askHF = require("../services/aiService");

// Generate flashcards from note
const generateFlashcards = async (req, res) => {
  try {
    const { noteId, numCards = 10 } = req.body;
    const note = await Note.findOne({ _id: noteId, user: req.user._id });
    
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    
    const prompt = `Generate ${numCards} high-quality flashcards from this study material:
    
${note.content.substring(0, 5000)}

Each flashcard should have:
- Front: A clear question about a key concept
- Back: Concise, accurate answer

Return EXACT JSON format:
{
  "flashcards": [
    {"front": "What is X?", "back": "X is defined as..."}
  ]
}`;

    const aiResponse = await askHF(prompt);
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    let flashcards = [];
    
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      flashcards = parsed.flashcards || [];
    }
    
    // Save flashcards
    const savedFlashcards = await Flashcard.insertMany(
      flashcards.map(card => ({
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
    console.error(err);
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