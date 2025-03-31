import { toLowerCaseAll } from "../utils.js";
import { elements } from "../domElements.js";

export function handleReverseMode(foundWord) { 
    const { translateWord } = elements;

    Array.isArray(foundWord.word)
        ? translateWord.textContent = toLowerCaseAll(foundWord.word[Math.floor(Math.random() * foundWord.translation.length)])
        : translateWord.textContent = toLowerCaseAll(foundWord.word)
    console.log('TRANSLATE ELEMENT: ', translateWord.textContent);
}

export function replaceWordReverseMode(randomWord) {
    const { activeWord } = elements;

    Array.isArray(randomWord.translation)
        ? activeWord.textContent = toLowerCaseAll(randomWord.translation[Math.floor(Math.random() * randomWord.translation.length)])
        : activeWord.textContent = toLowerCaseAll(randomWord.translation)
}
