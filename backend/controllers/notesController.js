const Note = require("../models/Note");
const askHF = require("../services/aiService");
const { processFile } = require("../services/fileProcessor");
const fs = require('fs');

// Create a note (with optional file upload)
const createNote = async (req, res) => {
  try {
    let { subject, topic, instructions, noteType, content: directContent } = req.body;
    let fileContent = '';
    let uploadedFileUrl = null;
    
    // Check if user uploaded a file
    if (req.file) {
      uploadedFileUrl = req.file.path;
      // Process the uploaded file
      try {
        fileContent = await processFile(req.file.path, req.file.mimetype);
        console.log("Extracted file content length:", fileContent?.length);
      } catch (fileErr) {
        console.error("File processing error:", fileErr);
        fileContent = "";
      }
      
      // Delete local file after processing (if not using Cloudinary)
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    }
    
    // If user provided direct content/text
    const userContent = directContent || '';
    
    // ✅ CRITICAL FIX: Agar file/content nahi hai toh error do
    if (!fileContent && !userContent && !topic) {
      return res.status(400).json({ 
        message: "Please provide a file OR text content OR topic" 
      });
    }
    
    if (!subject || !topic) {
      return res.status(400).json({ message: "Subject and topic are required" });
    }
    
    // Determine source content
    let sourceContent = '';
    if (fileContent && fileContent.length > 50) {
      sourceContent = `Based STRICTLY on the uploaded document content:\n\n${fileContent}\n\n`;
    } else if (userContent) {
      sourceContent = `Based on the user's provided text:\n\n${userContent}\n\n`;
    } else {
      sourceContent = `Create study notes for topic: ${topic}\n`;
    }
    
    // ✅ STRONGER PROMPT - Force AI to use provided content
    const prompt = `You are an expert educator. Generate ${noteType === 'summary' ? 'CONCISE SUMMARY' : 'DETAILED STUDY NOTES'}.

${sourceContent}

${fileContent ? 'CRITICAL: Use ONLY the information from the document above. DO NOT make up any information.' : ''}

REQUIREMENTS FOR ${noteType === 'summary' ? 'SUMMARY' : 'DETAILED NOTES'}:

${noteType === 'summary' ? `
**SUMMARY REQUIREMENTS:**
- Maximum 500 words
- Only the MOST IMPORTANT points
- One paragraph for overview
- 5-7 bullet points for key concepts
- 1-2 sentence conclusion
- Use 📌 emoji for key takeaways
` : `
**DETAILED NOTES REQUIREMENTS:**
- Start with "# ${subject}" as main title
- Add "## Overview" section (3-4 sentences)
- Create 4-6 main sections with ## headings
- Use bullet points for key concepts
- Add examples where available
- End with "## Quick Summary"
`}

IMPORTANT: ${fileContent ? 'BASE YOUR NOTES ENTIRELY ON THE DOCUMENT CONTENT.' : 'Create informative notes based on the topic.'}

Format in clean Markdown.`;

    const aiContent = await askHF(prompt, req.user?._id, "notes");
    
    // ✅ FALLBACK: Agar AI empty response de toh
    const finalContent = aiContent && aiContent.length > 100 
      ? aiContent 
      : `# ${subject}\n\n## Overview\n\nNotes could not be generated. Please try again with more specific content.\n\n## Topic\n\n${topic}\n\nPlease ensure your file has readable text.`;
    
    const note = await Note.create({
      user: req.user._id,
      subject,
      topic,
      instructions: instructions || '',
      content: finalContent,
      sourceFile: uploadedFileUrl,
      noteType: noteType || 'detailed'
    });
    
    res.status(201).json(note);
  } catch (err) {
    console.error("Create Note Error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

// Get all notes for user
const getNotes = async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    console.error("Get Notes Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get a specific note by id
const getNoteById = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ message: "Note not found" });
    res.json(note);
  } catch (err) {
    console.error("Get Note Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update a note by id
const updateNote = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ message: "Note not found" });
    
    const { subject, topic, content, instructions } = req.body;
    
    if (subject) note.subject = subject;
    if (topic) note.topic = topic;
    if (content) note.content = content;
    if (instructions) note.instructions = instructions;
    
    await note.save();
    res.json(note);
  } catch (err) {
    console.error("Update Note Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a note
const deleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ message: "Note not found" });
    res.json({ message: "Note deleted successfully" });
  } catch (err) {
    console.error("Delete Note Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getStats = async (req, res, internal = false) => {
  const notes = await Note.find({ user: req.user._id }).sort({ createdAt: -1 });
  const lastNote = notes[0] || null;
  const statsObj = {
    totalStudyHours: 1200,
    completionRate: 75,
    notesCount: notes.length,
    lastNote: lastNote ? { title: lastNote.topic, updatedAt: lastNote.updatedAt } : null,
  };
  if (internal) return statsObj;
  res.json(statsObj);
};

module.exports = { createNote, getNotes, getNoteById, updateNote, deleteNote, getStats };