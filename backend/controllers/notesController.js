const Note = require('../models/Note');
const askHF = require('../services/aiService'); // your existing HF service

// Create a note (generate with AI on server)
const createNote = async (req, res) => {
  try {
    const { subject, topic, instructions } = req.body;
    if (!subject || !topic) return res.status(400).json({ message: 'subject and topic are required' });

    // Build a prompt for the AI to generate structured notes
    const prompt = `
Generate detailed study notes. Output clear headings and bullet points (or short paragraphs) suitable for studying.
Subject: ${subject}
Topic: ${topic}
User instructions: ${instructions || 'Please write concise, organized study notes with examples and quick memory tips.'}
Please include:
- an overview,
- 3–6 key points,
- short examples or formulas (if applicable),
- a short summary at the end.
Format the output in Markdown.
    `.trim();

    const aiContent = await askHF(prompt); // returns text

    const note = await Note.create({
      user: req.user._id,
      subject,
      topic,
      instructions: instructions || '',
      content: aiContent || 'No content generated.'
    });

    res.status(201).json(note);
  } catch (err) {
    console.error('Create Note Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all notes for user
const getNotes = async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    console.error('Get Notes Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a specific note by id
const getNoteById = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json(note);
  } catch (err) {
    console.error('Get Note Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a note by id
const updateNote = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ message: 'Note not found' });

    const { subject, topic, content, instructions } = req.body;

    if (subject) note.subject = subject;
    if (topic) note.topic = topic;
    if (content) note.content = content;
    if (instructions) note.instructions = instructions;

    await note.save();
    res.json(note);
  } catch (err) {
    console.error('Update Note Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a note
const deleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json({ message: 'Note deleted successfully' });
  } catch (err) {
    console.error('Delete Note Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getStats = async (req, res, internal = false) => {
  const notes = await Note.find({ user: req.user._id }).sort({ createdAt: -1 });
  const lastNote = notes[0] || null;
  const statsObj = {
    totalStudyHours: 1200,
    completionRate: 75,
    notesCount: notes.length,
    lastNote: lastNote
      ? { title: lastNote.topic, updatedAt: lastNote.updatedAt }
      : null,
  };

  if (internal) return statsObj; // for internal calls
  res.json(statsObj); // for external API
};


module.exports = { createNote, getNotes, getNoteById, updateNote, deleteNote, getStats };
