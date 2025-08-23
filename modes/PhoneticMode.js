import { toLowerCaseAll } from "../utils/utils.js";
import { elements } from "../utils/domElements.js";

export function handlePhoneticMode(foundWord) {
    const { translateWord, phoneticVoiceButton, activeWord } = elements;

    if (Array.isArray(foundWord.translation)) {
        activeWord.textContent = toLowerCaseAll(foundWord.translation[Math.floor(Math.random() * foundWord.translation.length)]);
    } else {
        activeWord.textContent = toLowerCaseAll(foundWord.translation);
    }

    phoneticVoiceButton.style.display = 'none';
    activeWord.style.display = 'block';

    if (Array.isArray(foundWord.word)) {
        translateWord.textContent = toLowerCaseAll(foundWord.word[Math.floor(Math.random() * foundWord.word.length)]);
    } else {
        translateWord.textContent = toLowerCaseAll(foundWord.word);
    }

    console.log('ACTIVE WORD: ', activeWord.textContent);
    console.log('TRANSLATE ELEMENT: ', translateWord.textContent);
}

export function replaceWordPhoneticMode(randomWord) {
    const { activeWord } = elements;
    Array.isArray(randomWord.translation)
        ? activeWord.textContent = toLowerCaseAll(randomWord.translation[Math.floor(Math.random() * randomWord.translation.length)])
        : activeWord.textContent = toLowerCaseAll(randomWord.translation)
}