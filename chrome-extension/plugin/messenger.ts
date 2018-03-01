import { Plugin, PluginBuilder } from './pluginbuilder.ts';

let shortcuts = {
  nextRow: 'option+j',
  previousRow: 'option+k',
  nextUnreadRow: 'option+shift+j,option+shift+down',
  previousUnreadRow: 'option+shift+k,option+shift+up',
  sendEmoji: 'command+enter',
  toggleInfo: 'option+\\',
  searchMessenger: 'option+\/',
  messageInput: 'escape',
  composeMessage: 'option+c',
  searchConversation: 'option+f',

  // Xth chat
  firstChat: 'option+1',
  secondChat: 'option+2',
  thirdChat: 'option+3',
  fourthChat: 'option+4',
  fifthChat: 'option+5',
  sixthChat: 'option+6',
  seventhChat: 'option+7',
  eighthChat: 'option+8',
  ninthChat: 'option+9',
};

///////////////////////////////////////
let pb = new PluginBuilder();

pb.setPluginName('messenger');
pb.setUrlRegex(/^https:\/\/www.messenger.com/);
pb.setInitialState({});

class MessengerPage {

  constructor() {}

  getRows() {
    return document.querySelectorAll('li[role=row]');
  }

  getRow(i) {
    return Array.prototype.slice.call(this.getRows())[i].querySelector('a[role=link]');
  }

  getActiveRow() {
    return document.querySelector('li[aria-relevant="additions text"]:not([aria-live="polite"])');
  }

  getNextRowLink() : HTMLAnchorElement {
    let nextSibling = this.getActiveRow().nextSibling as HTMLElement;
    if (!nextSibling) { return null; }
    return nextSibling.querySelector('a[role=link]');
  }

  getPreviousRowLink() : HTMLAnchorElement {
    let prevSibling = this.getActiveRow().previousSibling as HTMLElement;
    if (!prevSibling) { return null; }
    return prevSibling.querySelector('a[role=link]');
  }

  getUnreadLinks() : HTMLAnchorElement[] {
    return Array.prototype.slice.call(document.querySelectorAll('li[aria-relevant="additions text"][aria-live="polite"]'));
  }

  getNextUnreadLink() : HTMLAnchorElement {
    let activeRowIndex = this.getActiveRowIndex();
    let unreadLinks = this.getUnreadLinks();
    let rows = this.getRows();
    for (let i in unreadLinks) {
      let rowIndex = Array.prototype.indexOf.call(rows, unreadLinks[i]);
      if (rowIndex > activeRowIndex) {
        return unreadLinks[i].querySelector('a[role=link]');
      }
    }
  }

  getPreviousUnreadLink() : HTMLAnchorElement {
    let activeRowIndex = this.getActiveRowIndex();
    let unreadLinks = this.getUnreadLinks();
    let rows = this.getRows();
    for (let i = unreadLinks.length - 1; i >= 0; i--) {
      let rowIndex = Array.prototype.indexOf.call(rows, unreadLinks[i]);
      if (rowIndex < activeRowIndex) {
        return unreadLinks[i].querySelector('a[role=link]');
      }
    }
  }

  getActiveRowIndex() {
    return Array.prototype.indexOf.call(this.getRows(), this.getActiveRow());
  }

  getEmojiElement() {
    return document.querySelector('a[aria-label="Send a Like"]');
  }

  getConversationInfo() {
    return document.querySelector('a[aria-label="Conversation Information"]');
  }

  getSearchMessengerElement() {
    return document.querySelector('div[role=banner] ~ div label input');
  }

  getMessageInputElement() {
    return document.querySelector('div[contenteditable="true"][role="combobox"]');
  }

  getComposeMessageElement() {
    return document.querySelector('a[aria-label="New Message"]');
  }

  getSearchConversationElement() {
    return document.querySelector('._3szn._3szo ._5odt');
  }

  getSearchConversationDoneElement() {
    let buttons = Array.prototype.slice.call(document.querySelectorAll('button[role="button"]'));
    for (let i = 0; i < buttons.length; i++) {
      if (buttons[i].innerHTML == 'Done') {
        return buttons[i];
      }
    }
    return null;
  }
}

/////////////////////////////////////////////

function triggerMouseEvent(node, eventType) {
  if (node.fireEvent) {
    node.fireEvent('on' + event);
  } else {
    let clickEvent = document.createEvent('MouseEvents');
    clickEvent.initEvent(eventType, true, true);
    node.dispatchEvent(clickEvent);
  }
}

let page = new MessengerPage();

pb.registerShortcut('Next chat', shortcuts.nextRow, (event, state) => {
  let nextRomElem = page.getNextRowLink();
  if (nextRomElem) {
    nextRomElem.click();
  }
  event.preventDefault();
  event.stopPropagation();
});

pb.registerShortcut('Previous chat', shortcuts.previousRow, (event, state) => {
  let prevRowElem = page.getPreviousRowLink();
  if (prevRowElem) {
    prevRowElem.click();
  }
  event.preventDefault();
  event.stopPropagation();
});

pb.registerShortcut('Next unread chat', shortcuts.nextUnreadRow, (event, state) => {
  page.getNextUnreadLink().click();
  event.preventDefault();
  event.stopPropagation();
});

pb.registerShortcut('Previous unread chat', shortcuts.previousUnreadRow, (event, state) => {
  page.getPreviousUnreadLink().click();
  event.preventDefault();
  event.stopPropagation();
});

pb.registerShortcut('Send emoji', shortcuts.sendEmoji, (event, state) => {
  triggerMouseEvent(page.getEmojiElement(), 'click');
  event.preventDefault();
  event.stopPropagation();
});

pb.registerShortcut('Toggle Conversation Information', shortcuts.toggleInfo, (event, state) => {
  triggerMouseEvent(page.getConversationInfo(), 'click');
  event.preventDefault();
  event.stopPropagation();
});

pb.registerShortcut('Search Messenger', shortcuts.searchMessenger, (event, state) => {

  let searchElem = page.getSearchMessengerElement()
  if (searchElem === document.activeElement) {
    triggerMouseEvent(page.getMessageInputElement(), 'click');
  } else {
    (searchElem as HTMLInputElement).focus();
  }
  event.preventDefault();
  event.stopPropagation();
});

pb.registerShortcut('Search Conversation', shortcuts.searchConversation, (event, state) => {
  let done = page.getSearchConversationDoneElement();
  if (done) {
    triggerMouseEvent(done, 'click');
  } else {
    triggerMouseEvent(page.getSearchConversationElement(), 'click');
  }
  event.preventDefault();
  event.stopPropagation();
});

pb.registerShortcut('Focus on message input', shortcuts.messageInput, (event, state) => {
  triggerMouseEvent(page.getMessageInputElement(), 'click');
  event.preventDefault();
  event.stopPropagation();
});

pb.registerShortcut('Compose new message', shortcuts.composeMessage, (event, state) => {
  triggerMouseEvent(page.getComposeMessageElement(), 'click');
  event.preventDefault();
  event.stopPropagation();
});

pb.registerShortcut('Compose new message', shortcuts.composeMessage, (event, state) => {
  triggerMouseEvent(page.getComposeMessageElement(), 'click');
  event.preventDefault();
  event.stopPropagation();
});

function viewChat(i, event, state) {
  triggerMouseEvent(page.getRow(i), 'click');
  event.preventDefault();
  event.stopPropagation();
}

pb.registerShortcut('View first chat', shortcuts.firstChat, viewChat.bind(this, 0));
pb.registerShortcut('View second chat', shortcuts.secondChat, viewChat.bind(this, 1));
pb.registerShortcut('View third chat', shortcuts.thirdChat, viewChat.bind(this, 2));
pb.registerShortcut('View fourth chat', shortcuts.fourthChat, viewChat.bind(this, 3));
pb.registerShortcut('View fifth chat', shortcuts.fifthChat, viewChat.bind(this, 4));
pb.registerShortcut('View sixth chat', shortcuts.sixthChat, viewChat.bind(this, 5));
pb.registerShortcut('View seventh chat', shortcuts.seventhChat, viewChat.bind(this, 6));
pb.registerShortcut('View eighth chat', shortcuts.eighthChat, viewChat.bind(this, 7));
pb.registerShortcut('View ninth chat', shortcuts.ninthChat, viewChat.bind(this, 8));



let plugin = pb.build();
export default plugin;
