export const elements = {
    mainWindow : document.getElementById('main-window'),
    listWindow : document.getElementById('list-window'),

    //Header Button/Toggle
    themeToggleState : document.getElementById('theme-toggle'),
    themeToggleBackground : document.querySelector('.toggle_label'),

    languagesButton : document.querySelector('.languages-btn'),
    languagesOverlay : document.getElementById('overlay'),
    languagesPopup : document.getElementById('languages-popup'),
    languagesCloseOverlayButton : document.getElementById('languages-close-popup'),

    infoButton : document.querySelector('.information-btn'),
    infoPopup : document.getElementById('info-popup'),
    infoOverlay : document.getElementById('overlay'),
    infoCloseOverlayButton : document.getElementById('close-popup'),

    baseThemeButton : document.querySelector('.baseTheme-btn'),
    baseThemeOverlay : document.getElementById('overlay'),
    baseThemePopup : document.getElementById('baseTheme-popup'),
    baseThemeCloseOverlayButton : document.getElementById('baseTheme-close-popup'),
    baseThemeColorBoxes : document.querySelectorAll('.baseColor'),

    onOffToggleState : document.getElementById('on-off-toggle'),
    onOffToggleBackground : document.querySelector('.on-off_label'),

    //Main Buttons/Word place 
    wordContainer : document.querySelector('.word-container'),
    activeWord : document.querySelector('.word'),
    translateWord : document.querySelector('.translate'),
    inputField : document.getElementById('translateField'),
    mainHorizontalLines : document.querySelectorAll('.horizontal-line'),

    iconButtons : document.querySelectorAll('.icon-btn'),
    helpButton : document.getElementById('help-btn'),
    randomButton : document.getElementById('replace-btn'),

    changeModeButton : document.getElementById('change-mode'),
    changeModePopup : document.getElementById('mode-popup'),
    changeModeOverlay : document.getElementById('overlay'),
    changeModeCloseButtonOverlay : document.getElementById('close-mode-popup'),
    allModeSelections : document.querySelectorAll('.popup .mode'),

    voiceButton : document.getElementById('sound-btn'),

    achievementButton : document.getElementById('achievement-btn'),
    achievementPopup : document.getElementById('achievement-popup'),
    achievementOverlay : document.getElementById('overlay'),
    achievementCloseButtonOverlay : document.getElementById('close-achievement-popup'),

    allImagesForThemesOverlay : document.getElementById('overlay'),
    allImagesForThemesPopup : document.getElementById('allImagesForThemes-popup'),
    allImagesForThemesPopupCloseButton : document.getElementById('close-allImagesForThemes-popup'),

    addToListButton : document.getElementById('plus-btn'),

    //Theme Buttons
    arrowButtons : document.querySelectorAll('.arrow-btn'),
    previousThemeButton : document.getElementById('prev-btn-theme'),
    nextThemeButton : document.getElementById('next-btn-theme'),
    textFieldTheme : document.getElementById('text-field-theme'),

    themeField : document.querySelector('.theme-input'),
    themePopup : document.getElementById('theme-popup'),
    themeOverlay : document.getElementById('overlay'),
    themeCloseOverlayButton : document.getElementById('close-theme-popup'),
    allThemeSelections : document.querySelectorAll('.popup .theme'),

    selectedTheme : document.getElementById('text-field-theme').value,

    //Time Buttons
    previousTimeButton : document.getElementById('prev-btn-time'),
    nextTimeButton : document.getElementById('next-btn-time'),
    textFieldTime : document.getElementById('text-field-time'),

    timeField : document.querySelector('.time-input'),
    timePopup : document.getElementById('time-popup'),
    timeOverlay : document.getElementById('overlay'),
    timeCloseOverlayButton : document.getElementById('close-time-popup'),
    allTimeSelections : document.querySelectorAll('.popup .time'),

    //Footer Button
    footerButtons : document.querySelectorAll('.footer-btn'),

    uploadButton : document.querySelector('.upload-btn'),
    uploadWindow : document.querySelector('.upload-file-window'),
    uploadOverlay : document.getElementById('overlay'),
    uploadPopup : document.getElementById('upload-popup'),
    uploadCloseOverlayButton : document.getElementById('close-upload-popup'),

    dragAndDropZone : document.getElementById('drop-zone'),
    dragAndDropPopup : document.getElementById('drag-and-drop-popup'),
    dragAndDropOverlay : document.getElementById('overlay'),
    dragAndDropUploadFileButton : document.getElementById('upload-file-button'),
    dragAndDropCloseOverlayButton : document.getElementById('close-drag-and-drop-popup'),

    //PalettePopup
    paletteButton : document.getElementById('palette-btn'),
    paletteOverlay : document.getElementById('overlay'),
    firstPaletteOverlay : document.getElementById('first-overlay'),
    palettePopup : document.getElementById('palette-popup'),
    paletteOverlayCloseButton : document.getElementById('close-palette-popup'),

    preview : document.getElementById('color-previews'),
    hueBar: document.getElementById('hue'),
    saturationBar: document.getElementById('saturation'),
    lightnessBar: document.getElementById('lightness'),
    inputHue : document.getElementById('input-hue'),
    inputSaturation : document.getElementById('input-saturation'),
    inputLightness : document.getElementById('input-lightness'),

    resetColorButton : document.getElementById('reset-color'),
    agreeResetColorOverlay : document.getElementById('agreeOverlay'),
    agreeResetColorPopup : document.getElementById('agree-reset-color-popup'),
    yesButton : document.getElementById('yes-reset-color-popup'),
    noButton : document.getElementById('no-reset-color-popup'),

    historyColorButton : document.getElementById('history-color'),
    historyColorOverlay : document.getElementById('historyOverlay'),
    historyColorPopup : document.getElementById('history-color-popup'),
    historyButtons : document.querySelector('.historyPopupButtons'),
    historyClearPopupButton : document.getElementById('clear-historyColor-popup'),
    historyColorCloseButton : document.getElementById('close-historyColor-popup'),
    applyButton : document.getElementById('apply-btn'),    

    //ListPopup
    listButton : document.querySelector('.list-check-btn'),
    returnFromList : document.querySelector('.return-btn'),
    listHorizontalLines : document.querySelectorAll('.list-line'),
    listHeadWord : document.querySelector('.head-word'),
    listHeadTranslate : document.querySelector('.head-translate'),
    listWordsContainer : document.querySelector('.all-words'),

    //Group Element
    allIconImage : document.querySelectorAll('.image'),
    allArrowImage : document.querySelectorAll('.image-arrow'),
    footerText : document.querySelectorAll('.clickable-text'),
    allPopupButton : document.querySelectorAll('.close-popup-button'),
};