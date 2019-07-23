type BadgeDetails = chrome.browserAction.BadgeTextDetails;
type Sender = chrome.runtime.MessageSender;

interface Message {
    action: string;
    data?: MessageNavigateData;
};

interface MessageNavigateData {
    location: Location;
};

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
            result[origin][pathname] = { count: 0 };
        }
    } else {
        result[origin] = { [pathname]: { count: 0 }, count: 0 };
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

chrome.runtime.onMessage.addListener(async (msg: Message, sender: Sender) => {
    switch (msg.action) {
        case 'NAVIGATE':
            navigateHandler(msg.data, sender.tab.id);
            break;
        default:
            break;
    }
});