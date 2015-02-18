/*
List of my Work:
	Notable Work
		Blackboard Learn MeL Vulnerability
		TRAVEL
		The King's Hand
		Little Strike
		GRPG
		Splash Wars
		XGorm
		Photoshop Album - Lecturer Anand
	Lost Work
		Projects lost due to hardware failure
			Java - Crappy RPG
			Java - Tanks Clone
			C# Windows 8 - Thunder Shadow / Adventure Beyond
	Other Work
		Projects purely for personal use
		Speak Me Not
		Form Doers

*/

var textbox;
var avatar;
var text;
var lazymanCounter=0;
var typerTimer;

//Using CSS should work also
var image1 = new Image();
image1.src = "assets/mespeak.png";
var image2 = new Image();
image2.src = "assets/mespeak2.png";

window.onload = function () 
{
	$('img[data-speech]').click(function() {//whenever something is clicked comment, foundation 5 will handle the rest
		var jThisData = $(this).data();
		commentOnThis(jThisData.speech,jThisData.imgsrc);
		//setup details
		document.getElementById("details_name").innerHTML = jThisData.caption;
		document.getElementById("details_manpower").innerHTML = jThisData.manpower + " man team";
		document.getElementById("details_time").innerHTML = jThisData.time;
		document.getElementById("details_tools").innerHTML = jThisData.tools;
		//commentOnThis(jQuery.data(this,"data-speech"
	});
	//setup
	textbox = document.getElementById("whatIwantToSay");
	avatar = document.getElementById("meExpression");
	if(textbox != null)
	{
		textbox.innerHTML = "";
		text = "Click an image to see what I have to say about it!";
		typerTimer = setInterval(function(){typingTime()},20);
	}
}
function commentOnThis (speech, imgsrc) {
	if(textbox != null)
	{
		if(text !== speech)
		{
			text = speech;
			avatar.src = imgsrc;
			textbox.innerHTML = "";
			lazymanCounter = 0;
			clearInterval(typerTimer);
			typerTimer = setInterval(function(){typingTime()},20);
		}
		else
		{//Immediately stop animating if double click and set text
			clearInterval(typerTimer);
			textbox.innerHTML = text;
		}
	}
}

function typingTime()
{
	if(textbox != null)
	{
		switch(text.charAt(lazymanCounter))
		{
			case '#':textbox.innerHTML += "<br/>";
				break;
			default:textbox.innerHTML += text.charAt(lazymanCounter);
				break;
		}
		lazymanCounter++;
		if(lazymanCounter >= text.length)
			clearInterval(typerTimer);
	}
	else
	{
		clearInterval(typerTimer);
	}
}