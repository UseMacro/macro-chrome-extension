import { Plugin, PluginBuilder } from './pluginbuilder.ts';
import * as styles from './youtube.css';

class YoutubePage {
  videos: HTMLElement[];

  constructor() {
  }

  getVideos() {
    let videos = document.querySelectorAll('ytd-video-renderer.ytd-item-section-renderer');
    if (videos) {
      return Array.prototype.slice.call(videos);
    }
    return null;
  }

  getVideo(index) {
    let videos = this.getVideos();
    return videos[index];
  }

  getVideoLink(index) {
    let video = this.getVideo(index);
    if (!video) return;

    return video.querySelector('a#thumbnail').href;
  }
}

let page = new YoutubePage();
let shortcuts = {
  nextVideo: 'j',
  previousVideo: 'k',
  viewVideo: 'space'
};

///////////////////////////////////////
let pb = new PluginBuilder();

pb.setPluginName('youtube');
pb.addDomainName('youtube.com');
pb.setInitialState({
  higlightedIndex: -1
});

function triggerMouseEvent(node, eventType) {
  let clickEvent = document.createEvent('MouseEvents');
  clickEvent.initEvent(eventType, true, true);
  node.dispatchEvent(clickEvent);
}

pb.registerShortcut('Next video', shortcuts.nextVideo, (event, state) => {
  console.log('1');
  state.set({higlightedIndex: state.higlightedIndex + 1});
  let elem = page.getVideo(state.highlightedIndex);
  event.preventDefault();
  event.stopPropagation();
});

pb.registerShortcut('Previous video', shortcuts.previousVideo, (event, state) => {
  state.set({higlightedIndex: state.higlightedIndex + 1});
  let elem = page.getVideo(state.highlightedIndex);
  event.preventDefault();
  event.stopPropagation();
});

pb.registerShortcut('View video', shortcuts.viewVideo, (event, state) => {
  let elem = page.getVideo(state.highlightedIndex);
  let href = page.getVideoLink(state.higlightedIndex);
  location.href = href;
  event.preventDefault();
  event.stopPropagation();
});

styles.test;

let plugin = pb.build();
export default plugin;
