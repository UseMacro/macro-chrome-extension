import { Plugin, PluginBuilder } from './pluginbuilder.ts';
import * as styles from './google.css';

let HIGHLIGHTED_LINK_MARGIN = 100;

class GooglePage {
  links: HTMLElement[];
  nextPage: HTMLAnchorElement;
  prevPage: HTMLAnchorElement;
  tabsDict: object;

  constructor() {
    this.links = Array.prototype.slice.call(document.querySelectorAll('h3.r a'));
    this.tabsDict = {
      images: document.querySelector('a[class="q qs"][href*="&tbm=isch"]'),
      videos: document.querySelector('a[class="q qs"][href*="&tbm=vid"]'),
      maps: document.querySelector('a[class="q qs"][href*="maps.google."]'),
      news: document.querySelector('a[class="q qs"][href*="&tbm=nws"]'),
      shopping: document.querySelector('a[class="q qs"][href*="&tbm=shop"]')
    };
    this.nextPage = document.querySelector('#pnnext');
    this.prevPage = document.querySelector('#pnprev');
    if (this.links.length > 0) {
      updateFocusedLink(this.links[0]);
    }
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

function getSearchInput() {
  return document.getElementById('lst-ib');
}

function getLink(page, index) {
  return page.getLink(index);
}

function updateFocusedLinkAtIndex(index) {
  let link = getLink(page, index);
  updateFocusedLink(link);
}

function updateFocusedLink(link) {
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

function clearHighlights(page) {
  for (let i = 0; i < page.getLinkCount(); i++) {
    let link = getLink(page, i);
    link.classList.remove(styles.test);
  }
}

//////////////////////
// Application code //
//////////////////////
let page = new GooglePage();

let shortcuts = {
  nextLink: 'j',
  previousLink: 'k',
  openLink: 'enter',
  openLinkNewTab: 'command+enter',
  nextPage: 'l',
  previousPage: 'h',
  focusSearchInput: '/',
  highlightSearchInput: 'command+/',
  navigateAllTab: 'a',
  navigateImagesTab: 'i',
  navigateVideosTab: 'v',
  navigateMapsTab: 'm',
  navigateNewsTab: 'n',
  navigateShoppingTab: 's',
};

///////////////////////

let pb = new PluginBuilder();

pb.setPluginName('google');
pb.setUrlRegex(/^https:\/\/www.google.[a-z]{2,3}\/search\?/);

pb.setInitialState({
  linkIndex: 0
});

pb.registerShortcut('Next link', shortcuts.nextLink, (event, state) => {
  if (getSearchInput() === document.activeElement) return;

  // Clear existing classes
  clearHighlights(page);

  let nextIndex = Math.min(state.linkIndex + 1, page.getLinkCount() - 1);
  state.set({ linkIndex: nextIndex });

  // Update which link is focused
  updateFocusedLinkAtIndex(state.linkIndex);
});

pb.registerShortcut('Previous link', shortcuts.previousLink, (event, state) => {
  if (getSearchInput() === document.activeElement) return;

  // Clear existing classes
  clearHighlights(page);

  let prevIndex = Math.max(state.linkIndex - 1, 0);
  state.set({ linkIndex: prevIndex });

  // Update which link is focused
  updateFocusedLinkAtIndex(state.linkIndex);
});

function triggerMouseEvent(node, eventType) {
  let clickEvent = document.createEvent('MouseEvents');
  clickEvent.initEvent(eventType, true, true);
  node.dispatchEvent(clickEvent);
}

function navigate(link) {
  if (link) {
    location.href = link.href;
  }
}

pb.registerShortcut('Open link', shortcuts.openLink, (event, state) => {
  if (getSearchInput() === document.activeElement) return;

  navigate(getLink(page, state.linkIndex));
});

pb.registerShortcut('Open link in new tab', shortcuts.openLinkNewTab, (event, state) => {
  if (getSearchInput() === document.activeElement) return;

  let link = getLink(page, state.linkIndex);
  window.open(link.href, '_blank');
});

pb.registerShortcut('Next page', shortcuts.nextPage, (event, state) => {
  if (getSearchInput() === document.activeElement) return;

  navigate(page.getNextPage());
});

pb.registerShortcut('Previous page', shortcuts.previousPage, (event, state) => {
  if (getSearchInput() === document.activeElement) return;

  navigate(page.getPreviousPage());
});

pb.registerShortcut('Focus on Search Input', shortcuts.focusSearchInput, (event, state) => {
  if (getSearchInput() === document.activeElement) return;

  let searchInput = getSearchInput();
  searchInput.focus();
  event.preventDefault();
  event.stopPropagation();

  // Always move cursor to the back
  // @ts-ignore
  let val = searchInput.value;
  // @ts-ignore
  searchInput.value = '';
  // @ts-ignore
  searchInput.value = val;
});

pb.registerShortcut('Highlight Search Input', shortcuts.highlightSearchInput, (event, state) => {
  if (getSearchInput() === document.activeElement) return;

  let searchInput = getSearchInput();
  searchInput.focus();
  event.preventDefault();
  event.stopPropagation();

  // @ts-ignore
  searchInput.setSelectionRange(0, searchInput.value.length);
});

pb.registerShortcut('Navigate to all tab', shortcuts.navigateAllTab, (event, state) => {
  if (getSearchInput() === document.activeElement) return;

  location.href = location.href.split('&')[0];
});

pb.registerShortcut('Navigate to images tab', shortcuts.navigateImagesTab, (event, state) => {
  if (getSearchInput() === document.activeElement) return;
  // @ts-ignore
  navigate(page.tabsDict.images);
});

pb.registerShortcut('Navigate to videos tab', shortcuts.navigateVideosTab, (event, state) => {
  if (getSearchInput() === document.activeElement) return;
  // @ts-ignore
  navigate(page.tabsDict.videos);
});

pb.registerShortcut('Navigate to maps tab', shortcuts.navigateMapsTab, (event, state) => {
  if (getSearchInput() === document.activeElement) return;
  // @ts-ignore
  navigate(page.tabsDict.maps);
});

pb.registerShortcut('Navigate to news tab', shortcuts.navigateNewsTab, (event, state) => {
  if (getSearchInput() === document.activeElement) return;
  // @ts-ignore
  navigate(page.tabsDict.news);
});

pb.registerShortcut('Navigate to shopping tab', shortcuts.navigateShoppingTab, (event, state) => {
  if (getSearchInput() === document.activeElement) return;
  // @ts-ignore
  navigate(page.tabsDict.shopping);
});

let plugin = pb.build();

export default plugin;
