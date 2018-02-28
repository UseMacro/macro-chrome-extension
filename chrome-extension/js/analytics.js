(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-114902154-1', 'auto');
ga('set', 'checkProtocolTask', function(){});
ga('require', 'displayfeatures');

export default {
  sendEvent: (eventCategory, eventAction, eventLabel) => {
    if (arguments.length === 2) {
      ga('send', 'event', eventCategory, eventAction);
    } else if (arguments.length === 3) {
      ga('send', 'event', eventCategory, eventAction, eventLabel);
    } else {
      throw 'Incorrect number of arguments';
    }
  },
  sendPageView: (page) => {
    ga('send', 'pageview', page);
  }
}

