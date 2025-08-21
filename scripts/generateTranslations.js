// Node 18+ required (fetch available globally)
// Usage:
//   YANDEX_API_KEY=xxxx YANDEX_FOLDER_ID=yyyy node scripts/generateTranslations.js [de it fr es da]
// Generates words_<lang>.json files by translating all English words in words.json per theme

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, '..');
const WORDS_PATH = path.join(ROOT, 'words.json');

const API_ENDPOINT = 'https://translate.api.cloud.yandex.net/translate/v2/translate';
const API_KEY = process.env.YANDEX_API_KEY;
const FOLDER_ID = process.env.YANDEX_FOLDER_ID;

if (!API_KEY) {
  console.error('Missing env YANDEX_API_KEY');
  process.exit(1);
}
if (!FOLDER_ID) {
  console.error('Missing env YANDEX_FOLDER_ID');
  process.exit(1);
}

const DEFAULT_LANGS = ['de', 'it', 'fr', 'es', 'da'];
const targetLangs = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT_LANGS;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function translateBatch(texts, targetLanguageCode) {
  const res = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Api-Key ${API_KEY}`,
      'X-Folder-Id': FOLDER_ID,
    },
    body: JSON.stringify({
      sourceLanguageCode: 'en',
      targetLanguageCode,
      texts,
      format: 'PLAIN_TEXT',
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Translate API error ${res.status}: ${text}`);
  }
  const data = await res.json();
  if (!data.translations) return texts.map(() => '');
  return data.translations.map(t => (t.text || '').toLowerCase());
}

async function translateAll(uniqueWords, targetLanguageCode) {
  const CHUNK_SIZE = 80; 
  const result = new Map();
  const words = Array.from(uniqueWords);
  for (let i = 0; i < words.length; i += CHUNK_SIZE) {
    const chunk = words.slice(i, i + CHUNK_SIZE);
    const translated = await translateBatch(chunk, targetLanguageCode);
    chunk.forEach((src, idx) => {
      result.set(src, translated[idx] || '');
    });
    await sleep(200);
  }
  return result;
}

async function main() {
  const raw = fs.readFileSync(WORDS_PATH, 'utf-8');
  const source = JSON.parse(raw);

  const unique = new Set();
  const themes = Object.keys(source);
  for (const theme of themes) {
    const items = source[theme] || [];
    for (const it of items) {
      if (it && typeof it.word === 'string' && it.word.trim()) {
        unique.add(it.word.trim().toLowerCase());
      }
    }
  }

  for (const lang of targetLangs) {
    console.log(`Translating ${unique.size} words to ${lang} ...`);
    const map = await translateAll(unique, lang);

    const out = {};
    for (const theme of themes) {
      const items = source[theme] || [];
      out[theme] = items.map(it => ({
        word: String(it.word || '').toLowerCase(),
        translation: map.get(String(it.word || '').toLowerCase()) || '',
      }));
    }

    const outPath = path.join(ROOT, `words_${lang}.json`);
    fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf-8');
    console.log(`Saved: ${outPath}`);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});


