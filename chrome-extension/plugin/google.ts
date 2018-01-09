import { Plugin, PluginBuilder } from './pluginbuilder.ts';

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
  console.log(index);
}

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
  console.log('i clicked j');
  let nextIndex = state.get('linkIndex') + 1;
  if (nextIndex >= page.getLinkCount()) {
    nextIndex--; // TODO: What to do if overflow?
  }
  state.set({ linkIndex: nextIndex });

  // Update which link is focused
  updateFocusedLink(state.get('linkIndex'));
});

pb.registerShortcut('Previous link', shortcuts.previousLink, (event, state) => {
  let prevIndex = state.get('linkIndex') - 1;
  if (prevIndex < 0) {
    prevIndex = 0; // TODO: What to do if overflow?
  }
  state.set({ linkIndex: prevIndex });

  // Update which link is focused
  updateFocusedLink(state.get('linkIndex'));
});

let plugin = pb.build();

export default plugin;
