//TODO: async load first videos
//TODO: wrap everything in document ready

// This code loads the IFrame Player API code asynchronously.
var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

/*===========================================
=            Getting videos data            =
===========================================*/


//loading more videos from separate file and apending it to the list
//in future this can be more lazy loading, divided into several files for example
var additionalLoadedVideos = $('<div></div>');
additionalLoadedVideos.load('http://zappingforyoutube.com/channelsList.html', function() {
   additionalLoadedVideos.children().appendTo('#list-of-videos');
});

//we use DOM elements to get video IDs
//we set list of videos in webflow, so we want to keep it usable in webflow while not showin
//all the data for users

var $initialChannel = $('#list-of-videos').find('.channel-item.current');

//we hide uneeded links and data in DOM, so that we can keep edit them in Webflow but they won't be shown for users
//we do this with CSS so I commented the line below
//$('.video-item').addClass('hidden');

//we want to hide videos that are not current
//TODO: we currently only know what video is playing when we go this channel
//We could know this before and calculate current video on each channel to show it on the list
// $( "<style>.video-item { display:none }; .video-item.current {display:block} </style>" ).appendTo( "head" );

//global variable with videos data, used in all other functions
$AllChannelsData = $('[all-channels-data]');

/*=====  End of Getting videos data  ======*/


/*============================================================
=            Initial state for menus and overlays            =
============================================================*/

$('.intro-overlay').removeClass('hidden');
$('.menu-box').addClass('hidden');

/*=====  End of Initial state for menus and overlays  ======*/






// This function creates an <iframe> (and YouTube player)
// after the API code downloads.
var ytPlayers = {};
function onYouTubeIframeAPIReady() {
    ytPlayers.player1 = new YT.Player('player1', {
        height: '100%',
        width: '100%',
        playerVars: {
            autoplay: 0,
            loop: 0,
            controls: 1,
            showinfo: 0,
            autohide: 1,
            modestbranding: 1,
            playsinline: 1,
        },
        events: {
            'onReady': function(event) {
                playChannelXinPlayerY($initialChannel.prev(), event.target);
                event.target.mute();
            },
            'onStateChange': function(event) {
                if (event.data === 0) {
                    playAnotherVideoInPlayerX(event.target);
                }
            },
            'onError': function(event) {
                removeCurrentVideoFromPlaylistAndPlayAnother(event.target);
            }
        }
    });

    ytPlayers.player2 = new YT.Player('player2', {
        height: '100%',
        width: '100%',
        playerVars: {
            autoplay: 0,
            loop: 0,
            controls: 1,
            showinfo: 0,
            autohide: 1,
            modestbranding: 1,
            playsinline: 1,
        },
        events: {
            'onReady': function(event) {
                playChannelXinPlayerY($initialChannel, event.target);
                event.target.mute();
                hideIntroSpinner();
            },
            'onStateChange': function(event) {
                if (event.data === 0) {
                    playAnotherVideoInPlayerX(event.target);
                }
            },
            'onError': function(event) {
                removeCurrentVideoFromPlaylistAndPlayAnother(event.target);
            }
        }
    });

    ytPlayers.player3 = new YT.Player('player3', {
        height: '100%',
        width: '100%',
        playerVars: {
            autoplay: 0,
            loop: 0,
            controls: 1,
            showinfo: 0,
            autohide: 1,
            modestbranding: 1,
            playsinline: 1,
        },
        events: {
            'onReady': function(event) {
                playChannelXinPlayerY($initialChannel.next(), event.target);
                event.target.mute();
            },
            'onStateChange': function(event) {
                if (event.data === 0) {
                    playAnotherVideoInPlayerX(event.target);
                }
            },
            'onError': function(event) {
                removeCurrentVideoFromPlaylistAndPlayAnother(event.target);
            }
        }
    });

}

function playChannelXinPlayerY(channelData, playerObject) {
    var videoToLoad = calculateSeekToTime(channelData);
    playerObject.loadVideoById({
        'videoId': videoToLoad.videoId,
        'startSeconds': videoToLoad.seekToTime,
        'suggestedQuality': 'default'
    });

    var playerContainer = $(playerObject.a);
    var playerNumber = playerContainer.attr('id');

    //mark upcoming loaded video as current in UI
    channelData.find('.video-item.current').removeClass('current');
    videoToLoad.container.addClass('current');

    switchTagsAboutWhichPlayerPlaysTheVideo(playerNumber, videoToLoad.container);
}

function hideIntroSpinner() {
    $('.intro-loading-spinner-holder').addClass('hidden');
    $('.intro-button').removeClass('hidden');
}

function startVideosInAllPlayers() {
    ytPlayers.player1.playVideo();
    ytPlayers.player1.mute();
    ytPlayers.player2.playVideo();
    ytPlayers.player2.unMute();
    ytPlayers.player3.playVideo();
    ytPlayers.player3.mute();
}

/* REFACTOR TODO: 
Store whitch video is next and previous on the list so that we can directly refer them
when calculating the upcoming video
*/

function switchToNextChannel() {
    console.log('switching channel to next...');

    var currentPlayerContainer = $('.yt-player-container.current-player');
    var currentPlayerNumber = currentPlayerContainer.attr('id');
    var nextPlayerContainer = $('.yt-player-container.next-player');
    var nextPlayerNumber = nextPlayerContainer.attr('id');
    var prevPlayerContainer = $('.yt-player-container.prev-player');
    var prevPlayerNumber = prevPlayerContainer.attr('id');

    //switch sound to next player
    ytPlayers[currentPlayerNumber].mute();
    ytPlayers[nextPlayerNumber].unMute();

    //check what's the next video to load and play it in prevPlayer but muted
    var currentChannelData = $AllChannelsData.find('.channel-item.current');
    var nextChannelData = currentChannelData.next(); 
    //if current video is last on the list then the second video on the list will be preloaded
    if (nextChannelData.length === 0) { nextChannelData = $AllChannelsData.find('.channel-item').first(); }
    var upcomingChannelData = nextChannelData.next(); 
    //if current video is second to last, then preload the first video on the list
    if (upcomingChannelData.length === 0) { upcomingChannelData = $AllChannelsData.find('.channel-item').first(); }

    console.log(upcomingChannelData);

    playChannelXinPlayerY(upcomingChannelData, ytPlayers[prevPlayerNumber]);

    //mark current playing channel on list
    currentChannelData.removeClass('current');
    nextChannelData.addClass('current');

    //swap which player is current, next and previous: 
    //current becomes previous, next becomes current, previous becomes next
    currentPlayerContainer.removeClass('current-player');
    currentPlayerContainer.addClass('prev-player');
    nextPlayerContainer.removeClass('next-player');
    nextPlayerContainer.addClass('current-player');
    prevPlayerContainer.removeClass('prev-player');
    prevPlayerContainer.addClass('next-player');

    showInfoBarBriefly(nextChannelData);
}

function switchToPrevChannel() {
    console.log('switching channel to preview...');

    var currentPlayerContainer = $('.yt-player-container.current-player');
    var currentPlayerNumber = currentPlayerContainer.attr('id');
    var nextPlayerContainer = $('.yt-player-container.next-player');
    var nextPlayerNumber = nextPlayerContainer.attr('id');
    var prevPlayerContainer = $('.yt-player-container.prev-player');
    var prevPlayerNumber = prevPlayerContainer.attr('id');

    //switch sound to prev player
    ytPlayers[currentPlayerNumber].mute();
    ytPlayers[prevPlayerNumber].unMute();

    //check what's the next video to load and play it in nextPlayer but muted
    var currentChannelData = $AllChannelsData.find('.channel-item.current');
    var prevChannelData = currentChannelData.prev(); 
    //if current video is first on the list then the second to last video on the list will be preloaded
    if (prevChannelData.length === 0) { prevChannelData = $AllChannelsData.find('.channel-item').last(); }
    var upcomingChannelData = prevChannelData.prev(); 
    //if current video is second to first, then preload the last video on the list
    if (upcomingChannelData.length === 0) { upcomingChannelData = $AllChannelsData.find('.channel-item').last(); }
    
    playChannelXinPlayerY(upcomingChannelData, ytPlayers[nextPlayerNumber]);

    //mark current playing video Id on list of links
    currentChannelData.removeClass('current');
    prevChannelData.addClass('current');

    //swap which player is current, next and previous: 
    //current becomes next, next becomes previous, previous becomes current
    currentPlayerContainer.removeClass('current-player');
    currentPlayerContainer.addClass('next-player');
    nextPlayerContainer.removeClass('next-player');
    nextPlayerContainer.addClass('prev-player');
    prevPlayerContainer.removeClass('prev-player');
    prevPlayerContainer.addClass('current-player');

    showInfoBarBriefly(prevChannelData);
}

var infoBarTimer;
function showInfoBarBriefly(channelData) {
    
    //paste data to the bar
    $('.info-bar-container').find('.info-bar-channel-name').text(channelData.find('.channel-name').text());
    $('.info-bar-container').find('.info-bar-title').text(channelData.find('.video-item.current').first().find('.video-item-title').text());
    $('.info-bar-container').find('.info-bar-channel-index').text(channelData.index());

    //gray out info icon when bar is shown
    $('[toggle-info-bar]').addClass('grayed-out');

    //show info bar briefly
    $('.info-bar-container').removeClass('hidden');
    clearTimeout(infoBarTimer);
    infoBarTimer = setTimeout(function() {
        $('.info-bar-container').addClass('hidden');
        $('[toggle-info-bar]').removeClass('grayed-out');
    }, 4000);
}

function showInfoBarBrieflyForCurrentChannel() {
    var currentChannelData = $AllChannelsData.find('.channel-item.current');
    showInfoBarBriefly(currentChannelData);
}

//calculating video time when changing channel based on your current date and time
function calculateSeekToTime(channelData) {
    var currentDate = new Date();
    //24 hour cycle + part of the day, because we don't want the same videos to play at the same hour 
    var t = currentDate.getHours()*3600 + currentDate.getMinutes()*60 + currentDate.getSeconds()*1 + 28800;
    //prepare videos from which we start to iterate
    var videoDataArray = channelData.find('.video-item');
    var videoData = videoDataArray.first();
    var videoDuration = getVideoDuration(videoData);
    //now iterate over the channel videos and see when we should play it
    while (t >= 0) {
        // console.log(videoData);
        // console.log("input cycle time is "+t);
        // console.log("input video duration is "+videoDuration);
        t = t - videoDuration;
        
        //if input video is out of time cycle, iterate over to next video
        if (t >=0) {
            videoData = videoData.next();
            if (videoData.length === 0) { videoData = channelData.find('.video-item').first(); }
            videoDuration = getVideoDuration(videoData);
        }

        //if input video is in current cycle, stay on this video
    }

    var toReturn = {
        container: videoData,
        videoId: videoData.find('.video-item-url').text().trim().split('?')[1].split('=')[1], //parse the link into video ID and load the upcoming video into right player
        seekToTime: videoDuration + t
    };
    console.log(toReturn);

    return toReturn;
}

function getVideoDuration(videoData) {
    var hoursMinutesSeconds = videoData.find('.video-duration').text();
    var splitted = hoursMinutesSeconds.split(':');

    //TODO: trim
    
    if (splitted.length === 2) {
        return splitted[0]*60 + splitted[1]*1;
    } else if (splitted.length === 3) {
        return splitted[0]*3600 + splitted[1]*60 + splitted[2]*1;
    }
}

function getChannelDataForPlayer(playerNumber) {
    return $AllChannelsData.find('.'+playerNumber).closest('.channel-item');
}

function switchTagsAboutWhichPlayerPlaysTheVideo(playerNumber, videoContainer) {
    $AllChannelsData.find('.'+playerNumber).first().removeClass(playerNumber);
    videoContainer.addClass(playerNumber);
}

function playAnotherVideoInPlayerX(playerObject) {
    console.log('video ended, laoading next video...');

    console.log(playerObject);
    console.log(playerObject.a);

    var playerContainer = $(playerObject.a);

    var playerNumber = playerContainer.attr('id');
    var channelData = getChannelDataForPlayer(playerNumber);
    
    /*
    we're not loading the next video, we're rechecking what should be played according to schedule
    user won't be able to skip the video, because otherwise if he fast forwards to the end and switches the channel
    while going back to this channel, we would still load the video according to schedule
    */

    //unmark the ended video so that its not current
    channelData.find('.video-item.current').removeClass('current');

    playChannelXinPlayerY(channelData, ytPlayers[playerNumber]);
    
    //TODO: of channel is current, show info bar briefly
}

//removing videos on error form playlist
var errorTimeout;
function removeCurrentVideoFromPlaylistAndPlayAnother(playerObject) {
    //debouncing error just in case
    clearTimeout(errorTimeout);

    errorTimeout = setTimeout(function(){ 
        console.log('error, removing video from playlist...');

        var playerContainer = $(playerObject.a);

        var playerNumber = playerContainer.attr('id');
        var channelData = getChannelDataForPlayer(playerNumber);

        //unmark the ended video so that its not current
        channelData.find('.video-item.current').removeClass('current').remove();

        playChannelXinPlayerY(channelData, ytPlayers[playerNumber]);
    }, 2000);
}

function toggleTransformHamburgerIconToCloseIcon() {
    $('.menu-icon-with-css').toggleClass('transformed-to-x');
    $('.menu-icon-with-css').find('.menu-icon-line').toggleClass('transformed-to-x');
}

/*==============================
=            Events            =
==============================*/

$(document).on('click', '.channel-button.next', function() {
    switchToNextChannel();
});

$(document).on('click', '.channel-button.prev', function() {
    switchToPrevChannel();
});

$(document).on('click', '.show-list-button-container', function() {
    $AllChannelsData.toggleClass('hidden');
});

$(document).on('click', '[start-zapping]', function() {
    startVideosInAllPlayers();
    $('.intro-overlay').addClass('hidden');
    showInfoBarBrieflyForCurrentChannel();
});

$(document).on('click', '[open-hamburger-menu]', function() {
    $('.menu-box').toggleClass('hidden');
    toggleTransformHamburgerIconToCloseIcon();
});

$(document).on('click', '[toggle-info-bar]', function() {
    showInfoBarBrieflyForCurrentChannel();
});

//allow faster hide of info bar when clicking grayed out info icon
$(document).on('click', '[toggle-info-bar].grayed-out', function() {
   $('.info-bar-container').addClass('hidden');
   $('[toggle-info-bar]').removeClass('grayed-out');
});

//switching channels with left and right arrows on keyboard
//we bind it after channels are prepared, after user clicks start zapping
$(document).on('click', '[start-zapping]', function() {
    $(document).on('keydown', function(e){
        if (e.keyCode === 37) { 
            switchToPrevChannel();
            enterFullscreenMode();
        } else if (e.keyCode === 39) {
            switchToNextChannel();
            enterFullscreenMode();
        }
    });
});



/*=====  End of Events  ======*/



/*=============================================
=            Browser specific bugs            =
=============================================*/

var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
if (iOS === true) {
    $(document).on('click', '[start-zapping]', function() {
        window.alert('Oh snap... You are using iOS device. Zapping will not work perfectly. This is still in beta version. Sorry!');
    });
}

/*=====  End of Browser specific bugs  ======*/

/*==========================================
=            Hiding buttons bar            =
==========================================*/

function enterFullscreenMode() {
    $(".bottom-controls-wrapper").addClass('is-fullscreen'); 
    $('.main-video-big-area').addClass('is-fullscreen');
}

function exitFullscreenMode() {
    $('.bottom-controls-wrapper').removeClass('is-fullscreen'); 
    $('.main-video-big-area').removeClass('is-fullscreen');
}

var mouseMovementHideTimer;

//should appear only if mouse movement was large enough, that's why we need counter
var mouseMovementCounter = 0;
var mouseMovementShowTimer = 0;

$('body').on('mousemove', '.bottom-bar-holder, .overlay-that-detects-mousemovement, .menu-box', function(event) {

    clearTimeout(mouseMovementHideTimer);
    clearTimeout(mouseMovementShowTimer);

    mouseMovementCounter = mouseMovementCounter + 1;

    if (mouseMovementCounter > 10) {
        exitFullscreenMode();

        mouseMovementHideTimer = setTimeout(function(){ 
            enterFullscreenMode();
            mouseMovementCounter = 0;
        }, 9000);
    }

    mouseMovementShowTimer = setTimeout(function(){ 
        mouseMovementCounter = 0;
    }, 9000);

});

//also show bar on clicks
$(document).on('click touchstart', '.bottom-bar-holder, .overlay-that-detects-mousemovement, .menu-box', function() {
    clearTimeout(mouseMovementHideTimer);
    clearTimeout(mouseMovementShowTimer);

    exitFullscreenMode();

    mouseMovementHideTimer = setTimeout(function(){ 
        enterFullscreenMode();
    }, 9000);
});

/*=====  End of Hiding buttons bar  ======*/


/*=============================
=            Notes            =
=============================*/

/*
Click on next channel button:
- hide currentPlayer 
- mute currentPlayer
- show nextPlayer
- unmute nextPlayer
- in future also change players quality when in the background
- before unloading the previosPlayer, check it's current time. 
  Store unloadedTime value with in it's ID object. Also store timestamp when left. Also store video time.
  When going back to this video, we will calculate timestamp difference and seek to right time
  (this will be a sum of unloadedTime and timestamp difference)
  If the difference is higher than the amount of seconds left in the video, we need to load next video (in future calculate seek difference)
//swap which player is current, next and previous: 
//current becomes previous, next becomes current, previous becomes next
- check what's the next video to load and play it in nextPlayer but muted

List of videos to load:
Option 1: There will be an overlay on Webflow than will contain list of IDs in dome. We will iterate over DOM elements and get video IDs.
In future this can be a configuration page for users, so that they can choose and uncheck channels.
Second option: have a list of divs with video ids in Webflow and create and destroy a player each time you iterate. May be slowee.
*/

/*=====  End of Notes  ======*/


