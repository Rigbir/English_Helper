import { toLowerCaseAll } from "../utils/utils.js";
import { elements } from "../utils/domElements.js";
import { appState } from "../core/appState.js";

export function handleMixedMode(foundWord) {
    const { translateWord } = elements;

    if (!appState.handlerForMixedMode) {
        Array.isArray(foundWord.word)
            ? translateWord.textContent = toLowerCaseAll(foundWord.word[Math.floor(Math.random() * foundWord.translation.length)])
            : translateWord.textContent = toLowerCaseAll(foundWord.word)
    } else {
        Array.isArray(foundWord.translation)
            ? translateWord.textContent = toLowerCaseAll(foundWord.translation[Math.floor(Math.random() * foundWord.translation.length)])
            : translateWord.textContent = toLowerCaseAll(foundWord.translation)
    }
}

export function replaceWordMixedMode(randomWord) {
    const { activeWord } = elements;

    if (appState.handlerForMixedMode) {
        Array.isArray(randomWord.translation)
            ? activeWord.textContent = toLowerCaseAll(randomWord.translation[Math.floor(Math.random() * randomWord.translation.length)])
            : activeWord.textContent = toLowerCaseAll(randomWord.translation)
    } else {
        activeWord.textContent = toLowerCaseAll(randomWord.word);
    }

    appState.handlerForMixedMode = !appState.handlerForMixedMode;
}
