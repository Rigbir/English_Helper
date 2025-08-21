import { toLowerCaseAll } from "../utils/utils.js";
import { elements } from "../utils/domElements.js";
import { appState } from "../core/appState.js";

export function handleDefaultMode(foundWord) { 
    const { translateWord } = elements;
    
    Array.isArray(foundWord.translation)
        ? translateWord.textContent = toLowerCaseAll(foundWord.translation[Math.floor(Math.random() * foundWord.translation.length)])
        : translateWord.textContent = toLowerCaseAll(foundWord.translation)
    console.log('TRANSLATE ELEMENT: ', translateWord.textContent);
}

export function replaceWordDefaultMode(randomWord) {
    const { activeWord } = elements;

    if (randomWord.word.trim().toLowerCase() === appState.originalWord?.trim().toLowerCase()) {
        console.warn("Random word matches the original word. Skipping...");
        return; 
    }

    activeWord.textContent = toLowerCaseAll(randomWord.word);
}
