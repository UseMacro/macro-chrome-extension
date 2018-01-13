import { Plugin, PluginBuilder } from './pluginbuilder.ts';
import * as styles from './google.css';

class GooglePage {
  links: HTMLElement[];
  nextPage: HTMLElement;
  prevPage: HTMLElement;
  searchInput: HTMLElement;


  constructor() {
    this.links = Array.prototype.slice.call(document.querySelectorAll('h3.r a'));
    this.nextPage = document.querySelector('#pnnext');
    this.prevPage = document.querySelector('#pnprev');
    this.searchInput = document.getElementById('lst-ib');
  }

  getLink(index: number) {
    return this.links[index];
  }

  getLinkCount() : number {
    return this.links.length;
  }

  getNextPage() : HTMLElement {
    return this.nextPage;
  }

  getPreviousPage() : HTMLElement {
    return this.prevPage;
  }
}

//////////////////////
// Helper functions //
//////////////////////
function updateFocusedLink(index) {
  page.getLink(index).className += ' ' + styles.test;
}

function clearHighlight(page, index) {
  page.getLink(index).classList.remove(styles.test);
}

//////////////////////
// Application code //
//////////////////////
let page = new GooglePage();

let shortcuts = {
  nextLink: 'j',
  previousLink: 'k',
  nextPage: 'l',
  previousPage: 'h',
  focusSearchInput: '/'
};

///////////////////////

let pb = new PluginBuilder();

pb.setDomainName('google.com');
pb.setInitialState({
  linkIndex: 0
});

pb.registerShortcut('Next link', shortcuts.nextLink, (event, state) => {
  // Clear existing classes
  clearHighlight(page, state.linkIndex);

  let nextIndex = Math.min(state.linkIndex + 1, page.getLinkCount() - 1);
  state.set({ linkIndex: nextIndex });

  // Update which link is focused
  updateFocusedLink(state.linkIndex);
});

pb.registerShortcut('Previous link', shortcuts.previousLink, (event, state) => {
  // Clear existing classes
  clearHighlight(page, state.linkIndex);

  let prevIndex = Math.max(state.linkIndex - 1, 0);
  state.set({ linkIndex: prevIndex });

  // Update which link is focused
  updateFocusedLink(state.linkIndex);
});

let plugin = pb.build();

export default plugin;
