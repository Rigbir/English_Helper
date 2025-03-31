import { toLowerCaseAll } from "../utils.js";
import { elements } from "../domElements.js";

export function handleDefaultMode(foundWord) { 
    const { translateWord } = elements;
    
    Array.isArray(foundWord.translation)
        ? translateWord.textContent = toLowerCaseAll(foundWord.translation[Math.floor(Math.random() * foundWord.translation.length)])
        : translateWord.textContent = toLowerCaseAll(foundWord.translation)
    console.log('TRANSLATE ELEMENT: ', translateWord.textContent);
}

export function replaceWordDefaultMode(randomWord) {
    const { activeWord } = elements;

    activeWord.textContent = toLowerCaseAll(randomWord.word);
}
