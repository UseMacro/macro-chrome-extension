import { Plugin, PluginBuilder } from '../plugin-lib/pluginbuilder.ts';

class GooglePage {

  constructor(links: HTMLElement[], nextPage: HTMLElement, prevPage: HTMLElement) {
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

let page = new GooglePage();

let shortcuts = {
  nextLink: 'j',
  previousLink: 'k'
  nextPage: 'l',
  previousPage: 'h',
  focusSearchInput: '/'
};

let pb = new PluginBuilder();

pb.setDomainName('google.com');
pb.setInitialState({
  linkIndex: 0
});

pb.registerShortcut('Next link', shortcuts.nextLink, (event, state) => {
  let nextIndex = state.getState('linkIndex') + 1;
  if (nextIndex >= page.getLinkCount()) {
    nextIndex--; // TODO: What to do if overflow?
  }
  state.set({ linkIndex: nextIndex });

  // Update which link is focused
  updateFocusedLink(state.get('linkIndex'));
});

pb.registerShortcut('Previous link', shortcuts.previous, (event, state) => {
  let prevIndex = state.getState('linkIndex') - 1;
  if (prevIndex < 0) {
    prevIndex = 0; // TODO: What to do if overflow?
  }
  state.set({ linkIndex: prevIndex });

  // Update which link is focused
  updateFocusedLink(state.get('linkIndex'));
});

//////////////////////
// Helper functions //
//////////////////////
function updateFocusedLink(index) {
  console.log(index);
}
