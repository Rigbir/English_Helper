import { toLowerCaseAll } from "../utils.js";
import { elements } from "../domElements.js";

export function handlePhoneticMode(foundWord) {
    const { translateWord } = elements;

    Array.isArray(foundWord.translation) 
        ? translateWord.textContent = toLowerCaseAll(foundWord.translation[Math.floor(Math.random() * foundWord.translation.length)])
        : translateWord.textContent = toLowerCaseAll(foundWord.translation)
    console.log('TRANSLATE ELEMENT: ', translateWord.textContent);
}

export function replaceWordPhoneticMode(randomWord) {
    const { activeWord } = elements;

    activeWord.textContent = toLowerCaseAll(randomWord.word);
}