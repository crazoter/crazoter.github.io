///lol
var pageURL = document.URL;
pageURL = pageURL.substr(pageURL.lastIndexOf('/')+1);
document.getElementById('trollQuestion').innerHTML = "Were you looking for "+pageURL+"?";

var answer = "You've found it!";
if(pageURL !== "404.html")
{
	var randomNum = Math.floor((Math.random() * 10));
	switch(randomNum)
	{
		case 1:
			answer = "It doesn't exist.";
		break;
		case 2:
			answer = "Nope, not here.";
		break;
		case 3:
			answer = "Wait, it's not here?! Thanks, Obama.";
		break;
		case 4:
			answer = "You do not have enough mana to summon that page.";
		break;
		case 5:
			answer = "It's probably in here. Somewhere.";
		break;
		case 6:
			answer = "PAGE IS UNDEFINED";
		break;
		case 7:
			answer = "Me too. Tell me when you find it.";
		break;
		case 8:
			answer = "...I don't have that page.";
		break;
		default:
			answer = "I can't find it.";
		break;
	}
}
document.getElementById('trollAnswer').innerHTML = answer;