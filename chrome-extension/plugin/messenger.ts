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
    return document.querySelectorAll('li[aria-relevant="additions text"][aria-live="polite"]');
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
}

let page = new MessengerPage();
let shortcuts = {
  nextRow: 'option+j',
  previousRow: 'option+k',
  nextUnreadRow: 'option+shift+j',
  previousUnreadRow: 'option+shift+k'
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

styles.test;

let plugin = pb.build();
export default plugin;
