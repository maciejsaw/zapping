# This is a place for hosting [Zapping for YouTube](http://zappingforyoutube.com)

## About the author
Hi, I am Maciej Sawicki. I work as a User Experience designer. I experiment in Javascript. Learn more about me on my [website](http://maciejsawicki.com) or [LinkedIn profile](https://pl.linkedin.com/in/maciej-sawicki-00137185)

## Project background
Zapping is a User Experience experiment. 

**Hyphotesis:** 
choosing what to watch from millions of videos is difficult. The critical user path is too long today. We forgot how easy it is to just turn on a TV and watch immediately. 

**How does it solve this problem?:** 
Zapping was inspired by a classic TV experience
- You just turn it on and watch
- You can switch channel instantly
- You start watching in the middle of a program, you skip boring intro screens-
- You don't need to decide for a specific video

## Hosted on GitHub Pages
- The "production" code is placed in [gh-pages](https://github.com/maciejsaw/zapping/tree/gh-pages) branch

## Technical info
- YouTube players are based on [YouTube iFrame API](https://developers.google.com/youtube/iframe_api_reference?hl=pl)
- HTML & CSS is build and maintained with wonderful [Webflow](http://webflow.io)
- The core JS code is less then 500 lines and is heavily based on jQuery
- There's no server side. There's no database, the data for the videos is stored directly in DOM and parsed with jQuery
- Videos are chosen manually and need to be added manually into the list in HTML. I prepared a simple script to parse YouTube page that prepares the video data in the right format for me, so that I can just copy paste the list of videos

## Tricks & Quirks
- The goal is to make channels switch immediately. This is achieved by "prefetching" videos, so playing 3 videos in the same time and playing sound only for one of them
- To hide background videos, I used CSS transform, because z-index is slow, and display:none can stop videos from rendering in some browsers. Also not the overflow:hidden wrapper to prevent the transformed videos to be visible when outside of their container
- When switching channel, even if upcoming video is not ready, we immediately show info about this video. This provides immediate feedback needed for fast channel surfing.
- Mobile browsers prevent videos to be autoplayed without user interaction. That's why there is a "Start zapping" button, so that we can start videos after user concent
- We immitate the TV experience, so we want the videos to continue in the background, as if they were not stopped. This is achieved by calculating number of seconds in the cycle and starting a video at the calculated "seek to" time each time it's prefetched

## Possible improvements in future
- Enable selecting a channel from menu
- We can use YouTube API and allow people to surf channels based on their input query.
- Add autohide for buttons bar, so that it is not visible when you're not using it
- Find a better way to prefetch videos, instead of just playing them in the background
- Pull data for channel only when needed, no need to download large list upfront (but this data is anyway small comapred to the videos)
