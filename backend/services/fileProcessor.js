const axios = require("axios");
const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const officeparser = require('officeparser');
const Tesseract = require('tesseract.js');

// Extract text from PDF
async function extractFromPDF(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (error) {
    console.error("PDF extraction error:", error);
    return null;
  }
}

// Extract text from DOCX
async function extractFromDOCX(filePath) {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } catch (error) {
    console.error("DOCX extraction error:", error);
    return null;
  }
}

// Extract text from PPT/PPTX
async function extractFromPPT(filePath) {
  try {
    const result = await officeparser.parseOfficeAsync(filePath);
    return result;
  } catch (error) {
    console.error("PPT extraction error:", error);
    return null;
  }
}

// Extract text from TXT
async function extractFromTXT(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error("TXT extraction error:", error);
    return null;
  }
}

// Extract text from Image (OCR)
async function extractFromImage(filePath) {
  try {
    const { data: { text } } = await Tesseract.recognize(filePath, 'eng');
    return text;
  } catch (error) {
    console.error("Image OCR error:", error);
    return null;
  }
}

// Main function to process any file
// Main function to process any file
async function processFile(filePath, mimetype) {
  let extractedText = '';
  
  // ✅ Check if it's a Cloudinary URL
  if (filePath.startsWith('http')) {
    // For Cloudinary URLs, we need to download the file first
    const response = await axios.get(filePath, { responseType: 'arraybuffer' });
    const tempPath = path.join(__dirname, '../uploads/temp_' + Date.now());
    fs.writeFileSync(tempPath, Buffer.from(response.data));
    
    // Process the downloaded file
    extractedText = await extractFromFile(tempPath, mimetype);
    
    // Clean up temp file
    fs.unlinkSync(tempPath);
    
    return extractedText;
  }
  
  // Local file processing
  extractedText = await extractFromFile(filePath, mimetype);
  return extractedText;
}

async function extractFromFile(filePath, mimetype) {
  let extractedText = '';
  
  if (mimetype === 'application/pdf') {
    extractedText = await extractFromPDF(filePath);
  } 
  else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    extractedText = await extractFromDOCX(filePath);
  }
  else if (mimetype === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
    extractedText = await extractFromPPT(filePath);
  }
  else if (mimetype === 'text/plain') {
    extractedText = await extractFromTXT(filePath);
  }
  else if (mimetype.startsWith('image/')) {
    extractedText = await extractFromImage(filePath);
  }
  else {
    throw new Error('Unsupported file type');
  }
  
  // Clean and truncate text
  if (extractedText) {
    extractedText = extractedText.replace(/\s+/g, ' ').trim();
    if (extractedText.length > 10000) {
      extractedText = extractedText.substring(0, 10000);
    }
  }
  
  return extractedText || "No readable text extracted from file.";
}

module.exports = { processFile };