// trade-frontend/src/services/sarvam.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const translationCache = new Map();

export async function translateText(text, targetLangCode = 'hi-IN') {
  if (!text || targetLangCode === 'en-IN') return text;

  const cacheKey = `${targetLangCode}:${text}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }

  try {
    const response = await fetch(`${API_BASE_URL}/sarvam/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, targetLangCode })
    });
    const data = await response.json();
    const result = data.translatedText || text;
    
    translationCache.set(cacheKey, result);
    return result;
  } catch (err) {
    console.error('Translation Request Failed:', err);
    return text;
  }
}

export async function speakText(text, langCode = 'hi-IN') {
  if (!text) return;

  try {
    const response = await fetch(`${API_BASE_URL}/sarvam/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, targetLangCode: langCode })
    });
    const data = await response.json();

    if (data.audioBase64) {
      const audio = new Audio(`data:audio/wav;base64,${data.audioBase64}`);
      audio.play();
    }
  } catch (err) {
    console.error('TTS Request Failed:', err);
  }
}