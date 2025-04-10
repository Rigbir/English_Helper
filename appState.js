export const appState = {
    theme: 'dark',
    count: 0,
    countHelpButtonPressed: 0,
    countVoiceoverButtonPressed: true,
    mode: 'Default',
    generateRandomWordButtonClickHandler: null,
    changeModeButtonClickHandler: null,
    helpButtonClickHandler: null,
    inputFieldClickHandler: null,
    updateWordHandler: null,
    handlerForMixedMode: null,
    soundTimeChallenge: new Audio('sound/TimeChallenge.mp3'),
    originalWord: '',
    jsonThemes: ['All Words', 'Human', 'Food', 'House', 'Sport', 
                 'Profession', 'Money', 'Cinema', 'Nature', 'Traveling', 
                 'IT', 'Idioms', 'Correct'],
    themeArray: ['All Words', 'Human', 'Food', 'House', 'Sport', 
            'Profession', 'Money', 'Cinema', 'Nature', 'Traveling', 
            'IT', 'Idioms'],
    timeArray: ['10 minutes', '20 minutes', '30 minutes', '60 minutes', '180 minutes'],
};