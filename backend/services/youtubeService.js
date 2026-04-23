const axios = require("axios");
const { YoutubeTranscript } = require('youtube-transcript-api');

// Extract YouTube video ID from URL
const extractVideoId = (url) => {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

// Get video info using oEmbed
const getVideoInfo = async (videoId) => {
  try {
    const response = await axios.get(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
    return {
      title: response.data.title,
      author: response.data.author_name,
      thumbnail: response.data.thumbnail_url
    };
  } catch (err) {
    console.error("Error fetching video info:", err);
    return { title: "Unknown Video", author: "Unknown", thumbnail: null };
  }
};

// Get video transcript
const getTranscript = async (videoId) => {
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    return transcript.map(t => ({ text: t.text, duration: t.duration, offset: t.offset }));
  } catch (err) {
    console.error("Transcript fetch error:", err);
    return null;
  }
};

// Generate summary from transcript
const generateSummary = async (transcript, askHF) => {
  const fullText = transcript.map(t => t.text).join(' ').substring(0, 8000);
  
  const prompt = `Summarize this YouTube video transcript into comprehensive study notes:

TRANSCRIPT:
${fullText}

REQUIREMENTS:
1. Create a TITLE for the notes
2. Write a BRIEF OVERVIEW (2-3 sentences)
3. List 5-8 KEY POINTS with bullet points
4. Create TIMESTAMP-BASED BREAKDOWN with important moments
5. End with QUICK SUMMARY (1-2 sentences)

Format in Markdown with:
# Title
## Overview
## Key Points
## Timestamp Breakdown
## Summary

Keep it CLEAR and STUDENT-FRIENDLY.`;

  const summary = await askHF(prompt);
  return summary;
};

module.exports = { extractVideoId, getVideoInfo, getTranscript, generateSummary };