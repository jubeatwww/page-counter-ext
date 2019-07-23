document.addEventListener('DOMContentLoaded', () => {
    chrome.runtime.sendMessage({ action: 'NAVIGATE', data: { location } });
});