import { toLowerCaseAll } from "../utils/utils.js";
import { elements } from "../utils/domElements.js";

export function handlePhoneticMode(foundWord) {
    const { translateWord, phoneticVoiceButton } = elements;

    Array.isArray(foundWord.word) 
        ? translateWord.textContent = toLowerCaseAll(foundWord.word[Math.floor(Math.random() * foundWord.word.length)])
        : translateWord.textContent = toLowerCaseAll(foundWord.word)
    console.log('TRANSLATE ELEMENT: ', translateWord.textContent);

    phoneticVoiceButton.classList.add('pulse-animation');
    setTimeout(() => {
        phoneticVoiceButton.classList.remove('pulse-animation');
    }, 1000);
}

export function replaceWordPhoneticMode(randomWord) {
    const { activeWord } = elements;
    Array.isArray(randomWord.translation)
        ? activeWord.textContent = toLowerCaseAll(randomWord.translation[Math.floor(Math.random() * randomWord.translation.length)])
        : activeWord.textContent = toLowerCaseAll(randomWord.translation)
}