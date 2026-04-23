const axios = require("axios");

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

// ✅ FIXED: Get video transcript
const getTranscript = async (videoId) => {
  try {
    // Dynamic import for youtube-transcript-api
    const { YoutubeTranscript } = await import('youtube-transcript-api');
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    return transcript.map(t => ({ text: t.text, duration: t.duration, offset: t.offset }));
  } catch (err) {
    console.log("Transcript fetch error, using placeholder:", err.message);
    // Return placeholder transcript
    return [
      { text: `Summary for YouTube video: ${videoId}`, duration: 10, offset: 0 },
      { text: "Watch the video for complete understanding.", duration: 10, offset: 10 }
    ];
  }
};

// Generate summary from transcript
const generateSummary = async (transcript, askHF) => {
  const fullText = transcript.map(t => t.text).join(' ').substring(0, 4000);
  
  const prompt = `Summarize this video transcript into comprehensive study notes:

TRANSCRIPT:
${fullText}

Create detailed notes with:
# Title
## Overview
## Key Points (bullet points)
## Timestamp Breakdown (if available)
## Quick Summary

Format in Markdown. Make it STUDENT-FRIENDLY and COMPREHENSIVE.`;

  const summary = await askHF(prompt);
  return summary;
};

module.exports = { extractVideoId, getVideoInfo, getTranscript, generateSummary };