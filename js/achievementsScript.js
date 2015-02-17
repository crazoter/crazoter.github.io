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
		commentOnThis($(this).data().speech,$(this).data().imgsrc);
		//commentOnThis(jQuery.data(this,"data-speech"
	});
	//setup
	textbox = document.getElementById("whatIwantToSay");
	avatar = document.getElementById("meExpression");
	if(textbox != null)
	{
		textbox.innerHTML = "";
		text = "Click an achievement to see what I have to say about it!";
		typerTimer = setInterval(function(){typingTime()},20);
	}
}
function commentOnThis (speech, imgsrc) {
	if(textbox != null)
	{
		if(text !== speech)
		{
			/*
			lazyNum = num;
			switch(num)
			{
				case 1:text = "A personal challenge. It was my first time with Java Swing before I understood OOP and it was tough.#Comprises of 50 stages, at least 20 items, dialogue and periodic bosses.";
					break;
				case 2:text = "A personal challenge.Terribly difficult to make but also terribly fun and terribly satisfying.#Includes 6 kinds of weapons and of course destructible terrain.";
					break;
				case 3:text = "It wasn't easy programming in foreign language-I have to admit getting 3rd place was a pleasant surprise.";
					break;
				case 4:text = "The director is elusive. Taking a photo together with her is like catching a rare Pokemon.##OF COURSE THIS WARRANTS AN ACHIEVEMENT";
					break;
				case 5:text = "Okay, I'll admit this is a stupid achievement, but since this is sort of a sample website... Why not?#Aha.Aha.Ahahaha.#NEXT";
					break;
				case 6:text = "Trust me, whatever that gas is, it's even worse than the 300 PSI haze.##Okay, maybe not, but smiling didn't help.";
					break;
				case 7:text = "Showing an IT lecturer how to use something IT related is definitely an achievement in my book.##Even if it's just a little gimmick.";
					break;
			}
			if(num === 6)
				avatar.src = "assets/mespeak2.png";
			else
				avatar.src = "assets/mespeak.png";
			*/
			text = speech;
			avatar.src = imgsrc;
			textbox.innerHTML = "";
			lazymanCounter = 0;
			clearInterval(typerTimer);
			typerTimer = setInterval(function(){typingTime()},20);
		}
		else
		{//Immediately stop animating if double click
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