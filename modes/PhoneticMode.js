import { toLowerCaseAll } from "../utils/utils.js";
import { elements } from "../utils/domElements.js";

export function handlePhoneticMode(foundWord) {
    const { translateWord, phoneticVoiceButton } = elements;

    Array.isArray(foundWord.translation) 
        ? translateWord.textContent = toLowerCaseAll(foundWord.translation[Math.floor(Math.random() * foundWord.translation.length)])
        : translateWord.textContent = toLowerCaseAll(foundWord.translation)
    console.log('TRANSLATE ELEMENT: ', translateWord.textContent);

    phoneticVoiceButton.classList.add('pulse-animation');
    setTimeout(() => {
        phoneticVoiceButton.classList.remove('pulse-animation');
    }, 1000);
}

export function replaceWordPhoneticMode(randomWord) {
    const { activeWord } = elements;
    activeWord.textContent = toLowerCaseAll(randomWord.word);
}