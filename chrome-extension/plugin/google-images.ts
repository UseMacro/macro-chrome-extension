import { Plugin, PluginBuilder } from './pluginbuilder.ts';
import * as styles from './google-images.css';

const HIGHLIGHTED_LINK_MARGIN = 100;
const BORDER_SIZE = 8;
const IMAGE_MARGIN = 12;

class GooglePage {
  links: HTMLElement[];
  imageGrid: any;
  tabsDict: object;

  constructor() {
    this.links = Array.prototype.slice.call(document.querySelectorAll('a[href*="/imgres?imgurl"]'));
    this.tabsDict = {
      images: document.querySelector('a[class="q qs"][href*="&tbm=isch"]'),
      videos: document.querySelector('a[class="q qs"][href*="&tbm=vid"]'),
      maps: document.querySelector('a[class="q qs"][href*="maps.google."]'),
      news: document.querySelector('a[class="q qs"][href*="&tbm=nws"]'),
      shopping: document.querySelector('a[class="q qs"][href*="&tbm=shop"]')
    };
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
}

//////////////////////
// Helper functions //
//////////////////////

function getSearchInput() {
  return document.getElementById('lst-ib');
}

function updateImageSearchLinks() {
  // This page has infinite scroll, so refresh links occasionally and compute the grid
  page.links = Array.prototype.slice.call(document.querySelectorAll('a[href*="/imgres?imgurl"]'));
  // Represents the layout of images on the page
  page.imageGrid = [];
  var imageRow = [];
  var rowSize = 0;
  for (let link of page.links) {
    let div = link.parentElement;
    if (rowSize + getWidth(div) > window.innerWidth) {
      page.imageGrid.push(imageRow);
      imageRow = [];
      rowSize = 0;
    }
    rowSize += getWidth(div) + IMAGE_MARGIN;
    imageRow.push(link);
  }
  page.imageGrid.push(imageRow);
}

function getLink(page, index) {
  return page.getLink(index);
}

function updateFocusedLinkAtIndex(index) {
  let link = getLink(page, index);
  updateFocusedLink(link);
}

function getWidth(el) {
 return Number(el.style.width.split('px')[0])
}

function getHeight(el) {
 return Number(el.style.height.split('px')[0])
}

function adjustSize(el, widthDiff, heightDiff) {
  let width =  getWidth(el) + widthDiff;
  let height = getHeight(el) + heightDiff;
  el.style.width = width + 'px';
  el.style.height = height + 'px';
}

function updateFocusedLink(link) {
  let div = link.parentElement;
  div.className += ' ' + styles.border;
  adjustSize(div, -BORDER_SIZE, -BORDER_SIZE);
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
    if (link.parentElement.classList.contains(styles.border)) {
      link.parentElement.classList.remove(styles.border);
      adjustSize(link.parentElement, BORDER_SIZE, BORDER_SIZE);
    }
  }
}

//////////////////////
// Application code //
//////////////////////
let page = new GooglePage();

let shortcuts = {
  down: 'j',
  up: 'k',
  right: 'l',
  left: 'h',
  openLink: 'enter',
  openLinkNewTab: 'command+enter',
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

pb.setPluginName('Google Images');
pb.setUrlRegex(/^https:\/\/www.google.[a-z]{2,3}\/search\?.*&tbm=isch/);

pb.setInitialState({
  linkIndex: 0
});

function incrementIndex(state, val) {
  let nextIndex = Math.max(Math.min(state.linkIndex + val, page.getLinkCount() - 1), 0);
  state.set({ linkIndex: nextIndex });
}

pb.registerShortcut('Down', shortcuts.down, (event, state) => {
  if (getSearchInput() === document.activeElement) return;

  updateImageSearchLinks();
  let link = getLink(page, state.linkIndex);

  for (let i = 0; i < page.imageGrid.length; i++) {
    let rowLength = page.imageGrid[i].length;
    let nextRowLength = page.imageGrid[i + 1].length;
    let colIndex = page.imageGrid[i].indexOf(link);

    if (colIndex === 0) {
      incrementIndex(state, rowLength);
      break;
    } else if (colIndex === rowLength - 1) {
      incrementIndex(state, nextRowLength);
      break;
    } else if (colIndex > -1) {
      rowLength > nextRowLength ? incrementIndex(state, rowLength) : incrementIndex(state, nextRowLength);
      break;
    }
  }
  clearHighlights(page);
  updateFocusedLinkAtIndex(state.linkIndex);
});

pb.registerShortcut('Up', shortcuts.up, (event, state) => {
  if (getSearchInput() === document.activeElement) return;

  updateImageSearchLinks();
  let link = getLink(page, state.linkIndex);

  for (let i = 0; i < page.imageGrid.length; i++) {
    let rowLength = page.imageGrid[i].length;
    let nextRowLength = i === 0 ? 0 : page.imageGrid[i - 1].length;
    let colIndex = page.imageGrid[i].indexOf(link);

    if (colIndex > -1 && i === 0) {
      // When we're at the top row do nothing
      return;
    }

    if (colIndex === 0) {
      incrementIndex(state, -nextRowLength);
      break;
    } else if (colIndex === rowLength - 1) {
      incrementIndex(state, -rowLength);
      break;
    } else if (colIndex > -1) {
      rowLength < nextRowLength ? incrementIndex(state, -rowLength) : incrementIndex(state, -nextRowLength);
      break;
    }
  }

  clearHighlights(page);
  updateFocusedLinkAtIndex(state.linkIndex);
});

pb.registerShortcut('Right', shortcuts.right, (event, state) => {
  if (getSearchInput() === document.activeElement) return;

    clearHighlights(page);
    updateImageSearchLinks();

    let link = getLink(page, state.linkIndex);
    for (let i = 0; i < page.imageGrid.length; i++) {
      let colIndex = page.imageGrid[i].indexOf(link);
      if (colIndex > -1) {
        if (colIndex < page.imageGrid[i].length - 1) {
          incrementIndex(state, 1);
        }
        break;
      }
    }
    updateFocusedLinkAtIndex(state.linkIndex);
});

pb.registerShortcut('Left', shortcuts.left, (event, state) => {
  if (getSearchInput() === document.activeElement) return;

    clearHighlights(page);
    updateImageSearchLinks();

  let link = getLink(page, state.linkIndex);
  for (let i = 0; i < page.imageGrid.length; i++) {
    let colIndex = page.imageGrid[i].indexOf(link);
    if (colIndex > -1) {
      if (colIndex > 0) {
        incrementIndex(state, -1);
      }
      break;
    }
  }
  updateFocusedLinkAtIndex(state.linkIndex);
});

function triggerMouseEvent(node, eventType) {
  let clickEvent = document.createEvent('MouseEvents');
  clickEvent.initEvent(eventType, true, true);
  node.dispatchEvent(clickEvent);
}

function navigate(link) {
  if (link) location.href = link.href;
}

pb.registerShortcut('Open link', shortcuts.openLink, (event, state) => {
  if (getSearchInput() === document.activeElement) return;
  triggerMouseEvent(getLink(page, state.linkIndex), 'click');
});

pb.registerShortcut('Open link in new tab', shortcuts.openLinkNewTab, (event, state) => {
  if (getSearchInput() === document.activeElement) return;

  let link = getLink(page, state.linkIndex);
  window.open(link.href, '_blank');
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
