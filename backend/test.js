const { askAI } = require('./services/openAIService');

(async () => {
  const response = await askAI("Explain photosynthesis simply and give 2 tips to remember it.");
  console.log(response);
})();
