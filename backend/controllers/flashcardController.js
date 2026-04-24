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
    
    // Delete old flashcards for this note
    await Flashcard.deleteMany({ user: req.user._id, noteId });
    
    // Generate new flashcards
    const prompt = `Generate ${Math.min(numCards, 15)} flashcards from this study note:

NOTE CONTENT:
${note.content.substring(0, 6000)}

Return EXACT JSON format:
{
  "flashcards": [
    {"front": "Question?", "back": "Answer"}
  ]
}`;

    const aiResponse = await askHF(prompt, req.user?._id);
    let flashcards = [];
    
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        flashcards = parsed.flashcards || [];
      }
    } catch (err) {
      console.error("Parse error:", err);
    }
    
    // Fallback
    if (flashcards.length === 0) {
      flashcards = [{
        front: `What is the main topic of "${note.topic}"?`,
        back: `The note covers ${note.subject} - ${note.topic}. Review the content for details.`
      }];
    }
    
    const savedFlashcards = await Flashcard.insertMany(
      flashcards.slice(0, numCards).map(card => ({
        user: req.user._id,
        noteId: note._id,
        noteTopic: note.topic,
        noteSubject: note.subject,
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

// Get all flashcards grouped by note
const getFlashcardGroups = async (req, res) => {
  try {
    const flashcards = await Flashcard.find({ user: req.user._id }).sort({ createdAt: -1 });
    
    // Group by noteId
    const groups = {};
    flashcards.forEach(card => {
      const key = card.noteId || card._id;
      if (!groups[key]) {
        groups[key] = {
          noteId: card.noteId,
          noteTopic: card.noteTopic,
          noteSubject: card.noteSubject,
          flashcards: [],
          count: 0
        };
      }
      groups[key].flashcards.push(card);
      groups[key].count++;
    });
    
    res.json(Object.values(groups));
  } catch (err) {
    console.error("Get flashcard groups error:", err);
    res.json([]);
  }
};

// Get single flashcard group by noteId
const getFlashcardGroup = async (req, res) => {
  try {
    const { noteId } = req.params;
    const flashcards = await Flashcard.find({ user: req.user._id, noteId });
    res.json(flashcards);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete all flashcards for a note
const deleteFlashcardGroup = async (req, res) => {
  try {
    const { noteId } = req.params;
    await Flashcard.deleteMany({ user: req.user._id, noteId });
    res.json({ message: "Flashcards deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete single flashcard
const deleteFlashcard = async (req, res) => {
  try {
    await Flashcard.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ message: "Flashcard deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update flashcard after review
const reviewFlashcard = async (req, res) => {
  try {
    const { quality } = req.body;
    const flashcard = await Flashcard.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!flashcard) {
      return res.status(404).json({ message: "Flashcard not found" });
    }
    
    let { interval, easeFactor } = flashcard;
    
    if (quality >= 3) {
      if (interval === 1) interval = 6;
      else if (interval === 6) interval = 14;
      else interval = Math.round(interval * easeFactor);
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

module.exports = { 
  generateFlashcards, 
  getFlashcardGroups, 
  getFlashcardGroup,
  deleteFlashcardGroup,
  deleteFlashcard,
  reviewFlashcard 
};