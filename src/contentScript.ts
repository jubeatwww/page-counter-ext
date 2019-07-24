let time = 0;
let timeInterval = 0;

document.addEventListener('DOMContentLoaded', () => {
    chrome.runtime.sendMessage({ action: 'NAVIGATE', data: { location } });
    timeInterval = window.setInterval(() => {
        time += 1;
    }, 1000);

    window.onfocus = () => {
        chrome.runtime.sendMessage({ action: 'FOCUS', data: { location } });
        timeInterval = window.setInterval(() => {
            time += 1;
        }, 1000);
    };

    window.onblur = () => {
        chrome.runtime.sendMessage({ action: 'BLUR', data: { location, time } });
        clearInterval(timeInterval);
        time = 0;
    };

});

window.onbeforeunload = () => {
    chrome.runtime.sendMessage({ action: 'LEAVE', data: { location, time } });
    clearInterval(timeInterval);
    time = 0;

    return null;
};
