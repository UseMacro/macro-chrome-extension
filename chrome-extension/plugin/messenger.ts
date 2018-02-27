import { Plugin, PluginBuilder } from './pluginbuilder.ts';
import * as styles from './messenger.css';

class MessengerPage {

  constructor() {}

  getRows() {
    return document.querySelectorAll('li[role=row]');
  }

  getActiveRow() {
    return document.querySelector('li[aria-relevant="additions text"]:not([aria-live="polite"])');
  }

  getNextRowLink() : HTMLAnchorElement {
    return (this.getActiveRow().nextSibling as HTMLElement).querySelector('a[role=link]');
  }

  getPreviousRowLink() : HTMLAnchorElement {
    return (this.getActiveRow().previousSibling as HTMLElement).querySelector('a[role=link]');
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
      console.log(rowIndex);
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
    return document.querySelector('div[role=banner] ~ div label');
  }

  getMessageInputElement() {
    return document.querySelector('div[aria-label="Type a message..."]');
  }
}

let page = new MessengerPage();
let shortcuts = {
  nextRow: 'option+j',
  previousRow: 'option+k',
  nextUnreadRow: 'option+shift+j',
  previousUnreadRow: 'option+shift+k',
  sendEmoji: 'command+enter',
  toggleInfo: 'command+\\',
  searchMessenger: 'command+\/',
  messageInput: 'command+.',
};

///////////////////////////////////////
let pb = new PluginBuilder();

pb.setDomainName('messenger.com');
pb.setInitialState({});

pb.registerShortcut('Next chat', shortcuts.nextRow, (event, state) => {
  page.getNextRowLink().click();
  event.preventDefault();
  event.stopPropagation();
});

pb.registerShortcut('Previous chat', shortcuts.previousRow, (event, state) => {
  page.getPreviousRowLink().click();
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

function triggerMouseEvent(node, eventType) {
  let clickEvent = document.createEvent('MouseEvents');
  clickEvent.initEvent(eventType, true, true);
  node.dispatchEvent(clickEvent);
}

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
  triggerMouseEvent(page.getSearchMessengerElement(), 'click');
  event.preventDefault();
  event.stopPropagation();
});

pb.registerShortcut('Focus on message input', shortcuts.messageInput, (event, state) => {
  triggerMouseEvent(page.getMessageInputElement(), 'click');
  event.preventDefault();
  event.stopPropagation();
});

styles.test;

let plugin = pb.build();
export default plugin;
