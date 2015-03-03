var disableVirtualMatt = false;
function commentatorResize(){//when it's too small, i want to be able to see all the text
	if($( window ).width() < 600)
	{
		$('#whatIwantToSay').removeClass("free").addClass("locked");
	} else {
		$('#whatIwantToSay').removeClass("locked").addClass("free");
	}
}
function mobileSupport(){//if the screen is too small / cannot really support speech guy, switch to tooltips - tooltips should have accessibility in already
	if($( window ).width() < 600)
	{
		disableVirtualMatt = true;
		$('.mobile').show();
		$('.not-mobile').hide();
		//add tool-tip and also add title
		$('.interactable').addClass('has-tip').attr('data-tooltip','').attr('aria-haspopup','true').each(function(index) 
		{
			//set the title to what is said
			var jThisData = $(this.children[0].children[0]).data();
			var cleanedSpeech = jThisData.speech.replace('^','').replace('$','');//for the ^$ functionality
			$(this).attr('title',cleanedSpeech);
		});
		//disable clearing
		$('.clearing-thumbs').removeAttr('data-clearing');
		$('.th').removeAttr('href');

		//change header a little because of clipping and all that
		 $('div.header').addClass('mobile').addClass('blackbg');
	}
}
$(window).resize(function() {
	commentatorResize();
});
commentatorResize();
mobileSupport();

//details div
$(document.body).on("opened.fndtn.clearing", function(event) {
	if(!disableVirtualMatt)
	{
		$(document.getElementById('detailscontainer')).show(300);
	}
	else
	{//prevent the big clearing container from opening lol i can't really do much else
		/*
		console.log('handled');
		$('.carousel').removeClass('carousel');
		//1.$('.clearing-assembled.clearing-blackout') remove clearing-blackout class
		$('.clearing-assembled.clearing-blackout').removeClass('clearing-blackout');
		//2.$('.visible-img') style change to display: none;
		$('.visible-img').css('display','none');
		//3.remove body style
		$('body').attr('style','');
		//4.remove $('.clearing-thumbs') style
		$('.clearing-thumbs').attr('style','');*/
	}
});
$(document.body).on("closed.fndtn.clearing", function(event) {
	if(!disableVirtualMatt)
	{
		$(document.getElementById('detailscontainer')).hide(300);
		commentOnThis("Click an image to see what I have to say about it!","assets/mespeak2.png");
		commentOnThis("Click an image to see what I have to say about it!","assets/mespeak2.png");//twice to cancel anim
	}
});

//quick (and terrible) fixes for the inability to escape quotation marks in html
//TIL http://stackoverflow.com/questions/1593800/how-to-have-quotation-marks-in-html-input-values, yet to implement fix
function anand()
{
	window.open('http://tinyurl.com/adventuresofmranand');
}
function splashwars()
{
	window.open('http://www.windowsphone.com/en-SG/apps/24b4c0a0-1f2a-45d8-9c5c-09330fcd7603');
}
//pre-loading of big images
var preLoadArr = [];
$.each($('a.th'),function( index, value ){
	var img = new Image();
	img.src = value.href;
	preLoadArr.push(img);
});