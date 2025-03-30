import { toLowerCaseAll } from "../utils.js";
import { elements } from "../domElements.js";

export function handleReverseMode(foundWord) { 
    const { translateWord } = elements;

    if (Array.isArray(foundWord.word)) {
        translateWord.textContent = toLowerCaseAll(foundWord.word[Math.floor(Math.random() * foundWord.translation.length)]);
    } else {
        translateWord.textContent = toLowerCaseAll(foundWord.word);
        console.log('TRANSLATE ELEMENT: ', translateWord.textContent);
    }
}

export function returnItemReverse(item, wordText) {
    if (Array.isArray(item.translation)) {
        return item.translation.some(translation => toLowerCaseAll(translation) === toLowerCaseAll(wordText));
    } else {
        return toLowerCaseAll(item.translation) === toLowerCaseAll(wordText);
    }  
}