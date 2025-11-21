chrome.runtime.onInstalled.addListener(() => {
  console.log('corae-want extension installed (scaffold)');
});

chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => ({ title: document.title, url: location.href })
  }, (res) => {
    console.log('captured', res);
  });
});
