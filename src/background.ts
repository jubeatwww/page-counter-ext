type BadgeDetails = chrome.browserAction.BadgeTextDetails;
type Sender = chrome.runtime.MessageSender;

interface Message {
    action: string;
    data?: MessageNavigateData | MessageTimeData;
};

interface MessageNavigateData {
    location: Location;
};

interface MessageTimeData {
    location: Location;
    time: number;
}

const getSyncStorage = keys => new Promise(resolv => {
    chrome.storage.sync.get(keys, (result) => {
        resolv(result);
    });
});
const setSyncStorage = items => new Promise(resolv => {
    chrome.storage.sync.set(items, () => {
        resolv();
    });
});

const navigateHandler = async (data: MessageNavigateData, tabId: number) => {
    const { origin, pathname } = data.location;
    const result = await getSyncStorage(origin);
    console.log(result);

    if (result[origin]) {
        result[origin].count += 1;
        if (result[origin][pathname]) {
            result[origin][pathname].count += 1;
        } else {
            result[origin][pathname] = { count: 0, time: 0 };
        }
    } else {
        result[origin] = { [pathname]: { count: 0, time: 0 }, count: 0, time: 0 };
    }
    const count = result[origin][pathname].count;

    await setSyncStorage({ [origin]: result[origin] });
    if (count > 0) {
        const badgeDetails: BadgeDetails = {
            text: count.toString(),
            tabId,
        };

        chrome.browserAction.setBadgeText(badgeDetails);
    }
}

const accumulateTime = async (data: MessageTimeData) => {
    const { time, location: { origin, pathname } } = data;
    const result = await getSyncStorage(origin);

    result[origin].time += time;
    result[origin][pathname].time += time;
    await setSyncStorage({ [origin]: result[origin] });
}

chrome.runtime.onMessage.addListener((msg: Message, sender: Sender) => {
    switch (msg.action) {
        case 'NAVIGATE':
            navigateHandler(<MessageNavigateData>msg.data, sender.tab.id);
            break;
        case 'FOCUS':
            console.log('focus', msg);
            break;
        case 'BLUR':
            console.log('blur', msg);
            accumulateTime(<MessageTimeData>msg.data);
            break;
        case 'LEAVE':
            console.log('leave', msg);
            accumulateTime(<MessageTimeData>msg.data);
            break;
        default:
            break;
    }
});
