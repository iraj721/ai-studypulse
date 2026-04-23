// Simple in-memory cache for AI responses
const cache = new Map();

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

function getCacheKey(prompt) {
  return prompt.toLowerCase().trim().slice(0, 200); // Limit key length
}

function getCachedResponse(prompt) {
  const key = getCacheKey(prompt);
  const cached = cache.get(key);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log("✅ Cache hit for prompt");
    return cached.response;
  }
  
  return null;
}

function setCachedResponse(prompt, response) {
  const key = getCacheKey(prompt);
  cache.set(key, {
    response,
    timestamp: Date.now()
  });
  
  // Clean old cache entries periodically
  if (cache.size > 100) {
    for (const [k, v] of cache) {
      if (Date.now() - v.timestamp > CACHE_DURATION) {
        cache.delete(k);
      }
    }
  }
}

module.exports = { getCachedResponse, setCachedResponse };