chrome.webNavigation.onCompleted.addListener(details => {
    if (details.frameId === 0 ) {
        console.log(details.url);
    }
});