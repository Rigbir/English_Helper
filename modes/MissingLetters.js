import { toLowerCaseAll } from "../utils.js";
import { elements } from "../domElements.js";
import { hideLetters } from "../database/mainDatabase.js";
import { appState } from "../appState.js";

export function handleMissingLettersMode(foundWord) {
    const { translateWord } = elements;

    Array.isArray(foundWord.word) 
        ? translateWord.textContent = toLowerCaseAll(foundWord.word[Math.floor(Math.random() * foundWord.translation.length)])
        : translateWord.textContent = toLowerCaseAll(foundWord.word)
    console.log('TRANSLATE ELEMENT: ', translateWord.textContent);
}

export function replaceWordMissingLettersMode(randomWord) {
    const { activeWord, translateWord } = elements;

    if (randomWord.word.trim().toLowerCase() === appState.originalWord?.trim().toLowerCase()) {
        console.warn("Random word matches the original word. Skipping...");
        return; 
    }

    let originalWord = Array.isArray(randomWord.word)
        ? toLowerCaseAll(randomWord.word[Math.floor(Math.random() * randomWord.translation.length)])
        : toLowerCaseAll(randomWord.word)

    console.log('ORIGINAL WORD: ', originalWord);
    
    appState.originalWord = originalWord;
    activeWord.textContent = hideLetters(originalWord);
    translateWord.textContent = originalWord;
}