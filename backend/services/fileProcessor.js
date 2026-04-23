const fs = require('fs');
const path = require('path');
const axios = require('axios');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const officeparser = require('officeparser');
const Tesseract = require('tesseract.js');

// Extract text from PDF (from buffer or local file)
async function extractFromPDF(source) {
  try {
    let dataBuffer;
    if (typeof source === 'string') {
      // Local file path
      dataBuffer = fs.readFileSync(source);
    } else {
      // Buffer
      dataBuffer = source;
    }
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (error) {
    console.error("PDF extraction error:", error);
    return null;
  }
}

// Extract text from DOCX (from buffer or local file)
async function extractFromDOCX(source) {
  try {
    let result;
    if (typeof source === 'string') {
      result = await mammoth.extractRawText({ path: source });
    } else {
      result = await mammoth.extractRawText({ buffer: source });
    }
    return result.value;
  } catch (error) {
    console.error("DOCX extraction error:", error);
    return null;
  }
}

// Extract text from TXT (from buffer or local file)
async function extractFromTXT(source) {
  try {
    if (typeof source === 'string') {
      return fs.readFileSync(source, 'utf8');
    } else {
      return source.toString('utf8');
    }
  } catch (error) {
    console.error("TXT extraction error:", error);
    return null;
  }
}

// Extract text from PPT
async function extractFromPPT(source) {
  try {
    let result;
    if (typeof source === 'string') {
      result = await officeparser.parseOfficeAsync(source);
    } else {
      // For buffer, we need to save temporarily
      const tempPath = path.join(__dirname, '../uploads/temp_' + Date.now() + '.pptx');
      fs.writeFileSync(tempPath, source);
      result = await officeparser.parseOfficeAsync(tempPath);
      fs.unlinkSync(tempPath);
    }
    return result;
  } catch (error) {
    console.error("PPT extraction error:", error);
    return null;
  }
}

// Extract text from Image (OCR)
async function extractFromImage(source) {
  try {
    let imageBuffer;
    if (typeof source === 'string') {
      imageBuffer = fs.readFileSync(source);
    } else {
      imageBuffer = source;
    }
    const { data: { text } } = await Tesseract.recognize(imageBuffer, 'eng');
    return text;
  } catch (error) {
    console.error("Image OCR error:", error);
    return null;
  }
}

// Download file from URL
async function downloadFile(url) {
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    return Buffer.from(response.data);
  } catch (error) {
    console.error("Download error:", error.message);
    return null;
  }
}

// Main function to process any file
async function processFile(filePath, mimetype) {
  let extractedText = '';
  let fileBuffer = null;
  
  try {
    // Check if it's a URL (Cloudinary)
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      console.log("Downloading file from URL:", filePath);
      fileBuffer = await downloadFile(filePath);
      if (!fileBuffer) {
        return "Could not download file. Please try again.";
      }
    } else if (fs.existsSync(filePath)) {
      // Local file
      fileBuffer = fs.readFileSync(filePath);
    } else {
      return "File not found.";
    }
    
    // Extract text based on mimetype (use buffer)
    if (mimetype === 'application/pdf') {
      extractedText = await extractFromPDF(fileBuffer);
    } 
    else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      extractedText = await extractFromDOCX(fileBuffer);
    }
    else if (mimetype === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
      extractedText = await extractFromPPT(fileBuffer);
    }
    else if (mimetype === 'text/plain') {
      extractedText = await extractFromTXT(fileBuffer);
    }
    else if (mimetype && mimetype.startsWith('image/')) {
      extractedText = await extractFromImage(fileBuffer);
    }
    else {
      // Try to detect from file extension
      const ext = filePath.split('.').pop().toLowerCase();
      if (ext === 'pdf') {
        extractedText = await extractFromPDF(fileBuffer);
      } else if (ext === 'docx') {
        extractedText = await extractFromDOCX(fileBuffer);
      } else if (ext === 'txt') {
        extractedText = await extractFromTXT(fileBuffer);
      } else if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(ext)) {
        extractedText = await extractFromImage(fileBuffer);
      } else {
        throw new Error('Unsupported file type');
      }
    }
    
    // Clean and truncate text
    if (extractedText) {
      extractedText = extractedText.replace(/\s+/g, ' ').trim();
      if (extractedText.length > 10000) {
        extractedText = extractedText.substring(0, 10000);
      }
    }
    
    return extractedText || "No readable text extracted from file.";
    
  } catch (error) {
    console.error("Process file error:", error);
    return "Error processing file. Please try again with a different file.";
  }
}

module.exports = { processFile };