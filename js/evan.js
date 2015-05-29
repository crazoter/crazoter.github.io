//#region variables
//DOM
var imgs,//List of img datas from imgur
	img_bg,//DOM element of bg img. If using fadeDisplay, is the most current img holder.
	img_data,//for debugging purposes;
	h5_title,//DOM element of title
	$preloader,
	preloader_text,
	$img_refresh,//Jquery element of the refresh / next image button
	img_volume;

//CONSTANTS
var SIZE_THRESHOLD = 500000,//Size limit of an image before we resort to pulling its thumbnail instead
	THUMBNAIL_ARR = [320,640,1024],//used to calculate best thumbnail size with regards to current screen size
	THUMBNAIL_MAP = {320: "m",640: "l",1024: "h"},
	YT_PLAYER_LOAD_PERCENT = 20,//total load percent of youtube videos
	SELECTED_NONE = -1,//placeholders for what is selected
	SELECTED_FREENEASY = 0,
	SELECTED_CONCERT = 1,
	SWAP_FAST = 100,
	SWAP_SLOW = 500,
	IMG_PRELOAD_INTERVAL = 20,
	DISPLAY_METHOD = slideDisplay;//Method used to display images

//READONLY - Set only once and then forgotten
var chosenThumbnailSize,//A thumbnail size (of background img) is chosen based on screen size
	swapSpeed = SWAP_SLOW,//image swap speed
	imagesPreloaded = 0,
	musicVol = 100,
	chosenMusicID;//youtube video id

//RUNTIME
var preloader_percent = 0,
	img_display_position = 0,
	screenWidth,
	yt_players_loaded = 0,
	yt_api_loaded = false,
	musicMuted = false,
	finishedPreloading = false,
	started = false,
	selected = SELECTED_NONE;//free & easy or concert

//CUSTOMIZABLES
var	SUBREDDITS = ["earthporn","villageporn"],//Pulling images from which subreddit(s)
	ALBUMS = [],
	yt_players = ['y6120QOlsfU'],//Put the video ID(s) into this array
	discoScale = true,
	discoLights = true,
	autoPlay = true;
//#endregion

//#region Initialization

	/**	
		Handle resizing of screen - change size of person as well as configure thumbnail size.
	*/
	function resize () {
		//set thumbnail size (background) based on screen size
	    screenWidth = $(document).width();
	    chosenThumbnailSize = THUMBNAIL_MAP[THUMBNAIL_ARR[THUMBNAIL_ARR.length-1]];//default as biggest
	    for(var i=0,l=THUMBNAIL_ARR.length;i<l;++i) {
	    	if(screenWidth<THUMBNAIL_ARR[i]) {
	    		chosenThumbnailSize = THUMBNAIL_MAP[THUMBNAIL_ARR[i]];
	    		break;
	    	}
	    }
	    //set evan size (person) based on screen size
	    $(".evan").css("max-width",screenWidth/5);
	}

	/**
		Preload images so that they don't slow down viewing tempo
		start: Integer, lower bound (inclusive)
		end: Integer, upper bound (exclusive)
	*/
	function preload_imgs (start,end) {
		console.log(start,end);
		var timestamp = (new Date()).getTime();
		var l = end-1;
		var $preloadContainer = $(document.createElement('span'));
		for(var i=start;i<=l;--l)
			$(document.createElement('img')) //fastest way to create elements in jQuery
			.attr("src", getImgURL(imgs[l]))
			.addClass("pseudoHidden t"+timestamp)
			//.css("display","none")
			.appendTo($preloadContainer);
		$preloadContainer.appendTo("body");//append 'em all at the same time for optimization's sake
		//if(!IS_FIREFOX)
		//{
		imagesPreloaded = 0;
		//var preloads = document.querySelectorAll('.pseudoHidden.t'+timestamp);
		//debugger;
		var imgLoad = imagesLoaded($preloadContainer.children());
		imgLoad.on('progress', function( instance, image ) {
			console.log("load over 1");
			++imagesPreloaded;
			updatePreloaderPercent();
			if(imagesPreloaded === IMG_PRELOAD_INTERVAL)
			{
				console.log("load over all");
				imagesPreloaded = 0;
				finishedPreloading = true;
				preload_imgs(end,imgs.length<end+IMG_PRELOAD_INTERVAL?imgs.length:end+IMG_PRELOAD_INTERVAL);//preload the rest of the images
				window.start();
			}
		});
		//}
	}

	/**
		Get data from Imgur
	*/
	function pullData () {
		//randomize subr / album
		var temp = [];
		for(var i=0,l=SUBREDDITS.length;i<l;++i){
			if(SUBREDDITS[i] !== "")
				temp.push({"id":SUBREDDITS[i],"subreddit":1});
		}
		for(var i=0,l=ALBUMS.length;i<l;++i){
			if(ALBUMS[i] !== "")
				temp.push({"id":ALBUMS[i],"album":1});
		}

	    $.ajax({ 
		    url: buildPullDataURL(temp[Math.random()*temp.length|0]),//nsfw guys
		    headers: {
		        'Authorization': 'Client-ID 3bc8b402e145392'
		    },
		    type: 'GET'})
		    .done(function(msg) {
		    	//usually returns 60
		    	imgs = msg.data;
		    	array_shuffle(imgs);
		    	preload_imgs(0,IMG_PRELOAD_INTERVAL);
		    	next_img();
			}).fail(function( jqXHR, textStatus ) {
				pullData();//:)
			});
	}
	function buildPullDataURL (obj) {
		if(obj.subreddit)
			return 'https://api.imgur.com/3/gallery/r/'+obj.id;
		else// if(obj.album)
			return 'https://api.imgur.com/3/album/'+obj.id+'/images';
	}

	/**
		Onload function
	*/
	$(function() {
		//Init main loot
	    img_bg = document.getElementById("img_bg");
	    h5_title = document.getElementById("h5_title");
	    $preloader = $(".preloader");
	    preloader_text = document.getElementById("preloader_text");
	    $img_refresh = $(document.getElementById("img_refresh"));
	    img_volume = document.getElementById("img_volume");
	    //show preloader if is not firefox
	    //if(!IS_FIREFOX)
	    $preloader.show();

	    //spin effect (css) of refresh button
	    $img_refresh.click(function() {
	    	$(this).addClass('spin');
	    	$(this).one("webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend",
		    function(event) {
		    	//when transition ends 
		    	$(this).removeClass('spin');
		 	});
	    });

	    //resize evan based on screensize, and size of backgrounds based on screensize too
	    $( window ).resize(function() {
	    	resize();
		});
		resize();
		//Init other stuff such as customizables
		//Get query strings
		var queryDict = {},items = location.search.substr(1).split("&"),l = items.length;
		while(l--) {
			var temp = items[l].split("=");
			queryDict[temp[0]] = temp[1];
		}
		if(queryDict.id) {
			var tempImg;
			var result;
			$.ajax({ 
		    url: 'https://api.imgur.com/3/image/'+decodeURIComponent(queryDict.id),
		    headers: {
		        'Authorization': 'Client-ID 3bc8b402e145392'
		    },
		    type: 'GET'})
		    .done(function(msg) {
		    	result = JSON.parse(msg.data.description);
		    	setupCustomization(result);//using the description of the image.... lol this is intriguing
		    	$('head').append( '<meta name="description" content="'+result.bg_title+'">' );
		    	//set custom stuff
		    	//usually returns 60
		    	if(result.personId) {
		    		//there's another img to load, we only loaded the bg image
		    		loadLoadingImg(msg.data.link);
		    		$.ajax({ 
				    url: 'https://api.imgur.com/3/image/'+result.personId,
				    headers: {
				        'Authorization': 'Client-ID 3bc8b402e145392'
				    },
				    type: 'GET'})
				    .done(function(msg) {
				    	loadPersonImg(msg.data.link);
				    	init();
				    }).fail(function( jqXHR, textStatus ) {
						var DAAAAMN_IIIT = 999999;
					});
		    	} else {
		    		//no loading image... REALLY?
		    		loadLoadingImg(null);
		    		loadPersonImg(msg.data.link);
		    		init();
		    	}
			}).fail(function( jqXHR, textStatus ) {
				var THIS_CANT_BE_HAAAPPENING_oh_wait_it_is_DAMN_IT = 999999;
			});
		} else {
			//values already initialized
			//$('meta[name=description]').remove();
    		$('head').append( '<meta name="description" content="Sightseeing with Evan">' );
			$('#user_title').text("EVAN IN ALL HIS GLORY");//AWWW
			document.title = "EVAN IN ALL HIS GLORY";
			$('#user_subtitle').text("DARUDE SAAAANDSTOOORM");//I know, it's tempting to put html and setup some nice xss
			loadLoadingImg("assets/joke/happy_evan.png");
			loadPersonImg("assets/joke/evan.png");
			init();
		}
		//Initialize these variables
		//Customizability:
		/*
			Preloader spinning color	(#preloader
											border-left:10px solid #29d;
											border-right:10px solid #29d;
										)
			title						(document.title & #user_title)
			subtitle					(#user_subtitle)
			preloader text is visible	(boolean, make sure the innerhtml is always "")
			loading screen bg-color		(#middle-piece-bg)
			loading screen bg-img		url
			preloader img				#preloader_text background-url, passed in as Url
			Foreground img				#user_foreground, passed in as Url
			SUBREDDITS					SUBREDDITS variable
			ALBUMS						ALBUMS variable
			YT_PLAYERS					Video IDs, yt_players variable
		*/
	});
	function loadPersonImg (imgUrl) {
		$("img.evan").load(function () {
			$("img.evan").show();
		});
		$("img.evan").attr('src',imgUrl);
	}
	function loadLoadingImg (imgUrl) {
		//when you do this remember never to put a semi-colon at the end
		$("div.selection.bg").css({
			"background-image":"url("+imgUrl+")",
			"background-repeat": "no-repeat",
			"background-size": "100% 100%"
		});
		$("#preloader_text.preloader").css({
			"background":"url("+imgUrl+")",
			"background-repeat": "no-repeat",
			"background-size": "60px 60px"
		});
	}
	function setupCustomization (result) {
		//Title
		//LOADING SCREEN
		$('#user_title').text(result.bg_title);//AWWW
		document.title = result.bg_title;
		$('#user_subtitle').text(result.bg_subtitle);//I know, it's tempting to put html and setup some nice xss
		$('#middle-piece-bg').css('background-color',result.bg_color);
		$('#preloader_after').css({
				"border-left":"10px solid "+result.bg_preloader_color,
				"border-right":"10px solid "+result.bg_preloader_color
			});
		//SUBREDDITS & ALBUMS
		SUBREDDITS = result.subreddits;
		ALBUMS = result.albums;
		//MISC
		yt_players = [];
		if(result.music_id !== "")
			yt_players.push(result.music_id);
		discoLights = result.discoLights;
		discoScale = result.discoScale;
		autoPlay = result.autoplay;
	}
	function init () {
		//Load stuff from Imgur API
		if(discoLights)
			document.getElementById('disco_lights').className = "glorious background discolights";//initialize discolights
		pullData();
		loadYoutubeAPI();
		chosenMusicID = 0;
		volumeBtnSetImage();
	}
//#endregion

//#region Selection (Choosing between f&e or concert)
	/**
		Onclick function for the selection portion.
		isConcert: boolean, literally means "isConcert?". Left side returns false, right side true.
	*/

	function start () {
		if(finishedPreloading && yt_api_loaded && !started) {
			started = true;
			$preloader.fadeOut();
			$('.middle-piece').slideUp(500);
			if(autoPlay) {
				window.setInterval(function(){
					next_img();
				},5000);
			}
			if(yt_players.length > 0)
				yt_players[chosenMusicID].playVideo();
		}
	}
//#endregion

//#region Misc
	/**
		get random integer from 0 to x (exclusive of x)
		x: Integer
	*/
	function randInt (x) {
		return Math.random() * x | 0;
	}
	/**
		Shuffle array
		arr: Array, array to be shuffled
	*/
	function array_shuffle (arr) {
		for(var i=arr.length-1,j,temp;i>=0;--i) {
			j = randInt(i);
			temp = arr[i];
			arr[i] = arr[j];
			arr[j] = temp;
		}
	}
	/**
		Less efficient to recalculate, but easier to understand
	*/
	function updatePreloaderPercent () {
		//Account for both images percent and youtube videos
		var s = imagesPreloaded/IMG_PRELOAD_INTERVAL*(100-YT_PLAYER_LOAD_PERCENT);
		if(yt_players.length > 0) {
			s += yt_players_loaded/yt_players.length * YT_PLAYER_LOAD_PERCENT;
		}
		s = s | 0;
		preloader_text.innerHTML = s + "%";
	}
//#endregion

//#region Image Manipulation
	/**
		Determine the url to get the img from based on its data. Caches the url in the imgURL variable in the data itself.
		img_data: Object, image data from Imgur (Image class)
	*/
	function getImgURL (img_data) {
		if(!img_data.imgURL)
		{
			if(img_data.size >= SIZE_THRESHOLD)
				img_data.imgURL = "http://i.imgur.com/"+img_data.id+chosenThumbnailSize+img_data.link.substring(img_data.link.lastIndexOf('.'));
			else img_data.imgURL = img_data.link;
		}
		return img_data.imgURL;
	}

	/**
		Recreate the img element so that it will appear to be loading (if the image is not preloaded)
		img_data: Object, image data from Imgur (Image class)
	*/
	function recreatedDisplay (img_data) {
		if(img_bg)
		{
			$(img_bg).remove();
		}
		h5_title.innerHTML = img_data.title;
		img_bg = document.createElement('IMG');
		img_bg.src = getImgURL(img_data);
		img_bg.className = "glorious background";
		if(discoScale)
			img_bg.className += " discotime";
		document.body.appendChild(img_bg);
	}

	/**
		Just replace the src, create only if not created. Direction is not used for this simple change.
		img_data: Object, image data from Imgur (Image class)
		direction: Integer, -1 means backward, 1 means forward
	*/
	function simpleDisplay (img_data,direction) {
		h5_title.innerHTML = img_data.title;
		if(img_bg)
		{
			img_bg.src = getImgURL(img_data);
		} else {
			img_bg = document.createElement('IMG');
			img_bg.src = getImgURL(img_data);
			img_bg.className = "glorious background";
			if(discoScale)
				img_bg.className += " discotime";
			document.body.appendChild(img_bg);
		}
	}

	/**
		Fade & replace src. Direction is not used for this fade change.
		img_data: Object, image data from Imgur (Image class).
		direction: Integer, -1 means backward, 1 means forward
	*/
	function fadeDisplay (img_data,direction) {
		if(swapSpeed >= SWAP_SLOW)
		{
			h5_title.innerHTML = img_data.title;
			if(img_bg)
			{
				img_bg.style.zIndex = 7;
				$(img_bg).fadeOut(swapSpeed,"swing", function () {
					$(this).remove();
				});
			}
			img_bg = document.createElement('IMG');
			img_bg.src = getImgURL(img_data);
			img_bg.className = "glorious background";
			if(discoScale)
				img_bg.className += " discotime";
			document.body.appendChild(img_bg);
		}
		else
			simpleDisplay(img_data,direction);//it's so fast we don't need to do animation
	}

	/**
		Slide & replace src. Direction is not used for this simple change.
		img_data: Object, image data from Imgur (Image class)
		direction: Integer, -1 means backward, 1 means forward
	*/
	function slideDisplay (img_data,direction) {
		h5_title.innerHTML = img_data.title;
		var width = $(img_bg).width();
		if(img_bg)
		{
			img_bg.style.zIndex = 7;
			if(direction < 0) {
				$(img_bg).animate({left: -width}, swapSpeed, function(){$(this).remove();});
			}
			else {
				$(img_bg).animate({left: width}, swapSpeed, function(){$(this).remove();});
			}
		}
		img_bg = document.createElement('IMG');
		img_bg.src = getImgURL(img_data);
		img_bg.className = "glorious background";
		if(discoScale)
			img_bg.className += " discotime";
		document.body.appendChild(img_bg);
		if(direction < 0)
			$(img_bg).style.left = width+"px";
		else
			img_bg.style.left = -width+"px";
		$(img_bg).animate({left: "0px"}, swapSpeed);
	}

	/**
		Methods used to pick an image from the imgs array
	*/
	function random_img () {
		if(imgs){
			img_data = imgs[randInt(imgs.length)];
			DISPLAY_METHOD(img_data,1);
		}
	}
	function next_img () {
		if(imgs){
			if(img_display_position >= imgs.length)
				img_display_position = 0;
			img_data = imgs[img_display_position++];
			DISPLAY_METHOD(img_data,1);
		}
	}
	function prev_img () {
		if(imgs){
			if(img_display_position < 0)
				img_display_position = imgs.length-1;
			img_data = imgs[img_display_position--];
			DISPLAY_METHOD(img_data,-1);
		}
	}
//#endregion
//#region Youtube
	function loadYoutubeAPI () {
		//This code loads the IFrame Player API code asynchronously.
		if(yt_players.length > 0) {
		    var tag = document.createElement('script');
		    tag.src = "https://www.youtube.com/iframe_api";

		    var firstScriptTag = document.getElementsByTagName('script')[0];
		    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
		} else {
			yt_api_loaded = true;
		}
	}
	function onYouTubeIframeAPIReady() {
		//dynamically add players
		for(var i=0,l=yt_players.length;i<l;++i)
		{
			var musicID = yt_players[i];
			var div = document.createElement('div');
			div.id = 'player_'+i;
			document.body.appendChild(div);
			yt_players[i] = new YT.Player(div.id, {
		        height: '186',//lol
		        width: '105',
		        videoId: musicID,
		        events: {
		        	'onReady': onPlayerReady,
		          	'onStateChange': onStateChange
		        }
		    });
		}
    }
    function onPlayerReady(event) {
    	//yt_player.stopVideo();
    	console.log('1 youtube video ready');
    	event.target.pauseVideo();
    	if(++yt_players_loaded >= yt_players.length)
    		yt_api_loaded = true;
    	//start();
    	updatePreloaderPercent();
    	//toggle_mute();//lol
    }
    function onStateChange(event) {
    	if(yt_players.length > 0){
	    	if(event.data === YT.PlayerState.PLAYING) {//unstarted
	    		yt_players[chosenMusicID].unMute();
				yt_players[chosenMusicID].setVolume(musicVol);
	    	}
	      	if(event.data === YT.PlayerState.ENDED){
	      		yt_players[chosenMusicID].seekTo(0);
	      		yt_players[chosenMusicID].playVideo();
	      		//yt_players[chosenMusicID].loadVideoById(musicID);
	      	}
	    }
  	}
  	function volumeBtnSetImage () {
  		if(yt_players.length > 0) {
	  		if(musicMuted) {
	  			img_volume.src = "data:image/png;base64,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";
	  		} else {
	  			img_volume.src = "data:image/png;base64,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";
	  		}
	  	} else {
	  		console.log("i tried");
	  		$(img_volume).hide();
	  	}
  	}
  	function toggle_mute () {
  		if(yt_players.length > 0) {
	  		musicMuted = !musicMuted;
	  		if(musicMuted) {
	  			yt_players[chosenMusicID].pauseVideo();
	  			//yt_players[chosenMusicID].mute();
	  		} else {
	  			yt_players[chosenMusicID].seekTo(0);
	      		yt_players[chosenMusicID].playVideo();
	  		}
	  		volumeBtnSetImage();
	  	}
  	}
//#endregion