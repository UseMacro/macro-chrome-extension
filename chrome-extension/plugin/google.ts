import { Plugin, PluginBuilder } from './pluginbuilder.ts';
import * as styles from './google.css';

let HIGHLIGHTED_LINK_MARGIN = 100;

class GooglePage {
  links: HTMLElement[];
  nextPage: HTMLAnchorElement;
  prevPage: HTMLAnchorElement;
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

  getNextPage() : HTMLAnchorElement {
    return this.nextPage;
  }

  getPreviousPage() : HTMLAnchorElement {
    return this.prevPage;
  }
}

//////////////////////
// Helper functions //
//////////////////////
function getLink(page, index) {
  return page.getLink(index);
}

function updateFocusedLink(index) {
  let link = getLink(page, index);
  link.className += ' ' + styles.test;
  let linkPos = link.getBoundingClientRect().top;

  if (linkPos < HIGHLIGHTED_LINK_MARGIN) {
    // If the link is at the top of the screen
    window.scrollTo(window.pageXOffset, window.pageYOffset + linkPos - HIGHLIGHTED_LINK_MARGIN);
  } else if (linkPos > window.innerHeight - HIGHLIGHTED_LINK_MARGIN) {
    // If the link is below the screen
    window.scrollTo(window.pageXOffset, window.pageYOffset + (linkPos - window.innerHeight + HIGHLIGHTED_LINK_MARGIN + link.clientHeight));
  }
}

function clearHighlight(page, index) {
  let link = getLink(page, index);
  link.classList.remove(styles.test);
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

pb.registerShortcut('Next page', shortcuts.nextPage, (event, state) => {
  let nextPage = page.getNextPage();
  if (!nextPage) {
    return;
  }

  location.href = nextPage.href;
});

pb.registerShortcut('Previous page', shortcuts.previousPage, (event, state) => {
  let prevPage = page.getPreviousPage();
  if (!prevPage) {
    return;
  }

  location.href = prevPage.href;
});

let plugin = pb.build();

export default plugin;
