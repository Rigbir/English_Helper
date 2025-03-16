export const elements = {
    //Header Button/Toggle
    themeToggleState: document.getElementById('theme-toggle'),
    themeToggleBackground: document.querySelector('.toggle_label'),

    infoButton: document.querySelector('.information-btn'),
    infoPopup: document.getElementById("info-popup"),
    infoOverlay: document.getElementById("overlay"),
    infoCloseOverlayButton: document.getElementById("close-popup"),

    onOffToggleState: document.getElementById('on-off-toggle'),
    onOffToggleBackground: document.querySelector('.on-off_label'),

    //Main Buttons/Word place 
    wordContainer: document.querySelector('.word-container'),
    activeWord: document.querySelector('.word'),
    translateWord: document.querySelector('.translate'),
    inputField: document.getElementById('translateField'),
    mainHorizontalLines: document.querySelectorAll('.horizontal-line'),

    iconButtons: document.querySelectorAll('.icon-btn'),
    helpButton: document.getElementById('help-btn'),
    randomButton: document.getElementById('replace-btn'),
    changeModeButton: document.getElementById('change-mode'),
    voiceButton: document.getElementById('sound-btn'),
    addToListButton: document.getElementById('plus-btn'),

    //Theme and Times Buttons
    arrowButtons: document.querySelectorAll('.arrow-btn'),
    previousThemeButton: document.getElementById('prev-btn-theme'),
    nextThemeButton: document.getElementById('next-btn-theme'),
    textFieldTheme : document.getElementById('text-field-theme'),
    selectedTheme : document.getElementById('text-field-theme').value,

    previousTimeButton: document.getElementById('prev-btn-time'),
    nextTimeButton: document.getElementById('next-btn-time'),
    textFieldTime : document.getElementById('text-field-time'),

    //Footer Button
    listHorizontalLines: document.querySelectorAll('.list-line'),
    listHeadWord: document.querySelector('.head-word'),
    listHeadTranslate: document.querySelector('.head-translate')
};