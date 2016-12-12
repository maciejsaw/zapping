# This is a place for hosting [Zapping for YouTube](zappingforyoutube.com)

## About the author
Hi, I am Maciej Sawicki. I work as a User Experience designer. I experiment in Javascript. Learn more about me on my [website](maciejsawicki.com) or [LinkedIn profile](https://pl.linkedin.com/in/maciej-sawicki-00137185)

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

## Technical info
- YouTube players are based on [YouTube iFrame API](https://developers.google.com/youtube/iframe_api_reference?hl=pl)
- HTML & CSS is build and maintained with wonderful [Webflow](webflow.io)
- There's no server side. There's no database, the data for the videos is stored directly in DOM and parsed with jQuery
- Videos are chosen manually and need to be added manually into the list in HTML. I prepared a simple script to parse YouTube page that prepares the video data in the right format for me, so that I can just copy paste the list of videos

## Possible improvements in future
- Enable selecting a channel from menu
- We can use YouTube API and allow people to surf channels based on their input query.
- Add autohide for buttons bar, so that it is not visible when you're not using it
- Pull data for channel only when needed, no need to download large list upfront (but this data is anyway small comapred to the videos)

