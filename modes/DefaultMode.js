import { toLowerCaseAll } from "../utils.js";
import { elements } from "../domElements.js";

export function handleDefaultMode(foundWord) { 
    const { translateWord } = elements;
    
    if (Array.isArray(foundWord.translation)) {
        translateWord.textContent = toLowerCaseAll(foundWord.translation[Math.floor(Math.random() * foundWord.translation.length)]);
    } else {
        translateWord.textContent = toLowerCaseAll(foundWord.translation);
        console.log('TRANSLATE ELEMENT: ', translateWord.textContent);
    }
}