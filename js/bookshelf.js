//VARIABLES
var btn_login = document.getElementById("btn_login");
var btn_login_mobile = document.getElementById("btn_login_mobile");
var btn_logout = document.getElementById("btn_logout");
var span_loggedInUser = document.getElementById("span_loggedInUser");
var btn_logout_mobile = document.getElementById("btn_logout_mobile");
var span_loggedInUser_mobile = document.getElementById("span_loggedInUser_mobile");

var txt_user = document.getElementById("txt_username");
var txt_pass = document.getElementById("txt_password");
var progress_login = document.getElementById("progress_login");

//LOGIN / LOGOUT
function showLogin () {
	$(btn_login).show();
	$(btn_login_mobile).show();
    $(span_loggedInUser).hide();
    $(span_loggedInUser_mobile).hide();
    $(btn_logout).hide();
    $(btn_logout_mobile).hide();
}
function showLogout (username) {
	$(btn_login).hide();
	$(btn_login_mobile).hide();
    $(span_loggedInUser).show();
    $(span_loggedInUser_mobile).show();
    $(btn_logout).show();
    $(btn_logout_mobile).show();
    var s = "Hi "+username+"!";
    span_loggedInUser.innerHTML = s;
    span_loggedInUser_mobile.innerHTML = s;
}

function login () {
	//Maybe I should do some security stuff? I must make sure never to redisplay them though.
	$(progress_login).show();
	Parse.User.logIn(txt_user.value, txt_pass.value, {
	  success: function(user) {
	    // Do stuff after successful login.
	    debugger;
	    txt_user.value = "";
	    txt_pass.value = "";
	    Materialize.toast("Logged in! Welcome, "+user.attributes.username+"!", 4000);
	    showLogout(user.attributes.username);//display the username :)
		$(progress_login).hide();
		$('#modal_login').closeModal();
	  },
	  error: function(user, error) {
	    // The login failed. Check error to see why.
	    txt_pass.value = "";
	    Materialize.toast("Wrong username / password!", 4000);
	    $(progress_login).hide();
	  }
	});
}

function logout () {
	var currentUser = Parse.User.current();
	if(currentUser !== null)
	{
		Materialize.toast("Logging out! Goodbye, "+currentUser.attributes.username+"!", 4000);
		Parse.User.logOut();
	}
	showLogin();
}

//TAG COLORING
//http://stackoverflow.com/questions/3426404/create-a-hexadecimal-colour-based-on-a-string-with-javascript
function stringToColor (str) {
    // str to hash
    for (var i = 0, hash = 0; i < str.length; hash = str.charCodeAt(i++) + ((hash << 5) - hash));
    // int/hash to hex
    for (var i = 0, colour = "#"; i < 3; colour += ("00" + ((hash >> i++ * 8) & 0xFF).toString(16)).slice(-2));

    return colour;
}

//http://www.javascripter.net/faq/hextorgb.htm
function hexToR(h) {return parseInt((cutHex(h)).substring(0,2),16)}
function hexToG(h) {return parseInt((cutHex(h)).substring(2,4),16)}
function hexToB(h) {return parseInt((cutHex(h)).substring(4,6),16)}
function cutHex(h) {return (h.charAt(0)=="#") ? h.substring(1,7):h}

function colourIsLight (r, g, b) {
  
  // Counting the perceptive luminance
  // human eye favors green color... 
  var a = 1 - (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  console.log(a);
  return (a < 0.5);
}
//http://stackoverflow.com/questions/596216/formula-to-determine-brightness-of-rgb-color
//http://stackoverflow.com/questions/596216/formula-to-determine-brightness-of-rgb-color
//http://codepen.io/WebSeed/pen/pvgqEq