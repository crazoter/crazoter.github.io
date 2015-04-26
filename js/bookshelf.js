//DOM VARIABLES
(function(exports){
	//Login x Logout UI
	var btn_login = document.getElementById("btn_login");
	var btn_login_mobile = document.getElementById("btn_login_mobile");
	var btn_logout = document.getElementById("btn_logout");
	var span_loggedInUser = document.getElementById("span_loggedInUser");
	var btn_logout_mobile = document.getElementById("btn_logout_mobile");
	var span_loggedInUser_mobile = document.getElementById("span_loggedInUser_mobile");

	//Login Modal Form
	var txt_user = document.getElementById("txt_username");
	var txt_pass = document.getElementById("txt_password");
	var progress_login = document.getElementById("progress_login");

	//Add Article Form
	var txt_title = document.getElementById("txt_title");
	var txtarea_description = document.getElementById("txtarea_description");
	var txt_ref = document.getElementById("txt_ref");
	var txt_tags = document.getElementById("txt_tags");

	//var Color Tags
	function Tag (string,color,isLight) {
		this.string = string;
		this.bgColor = color;
		this.bgIsLight = isLight;
	}
	var calculatedTags = {};


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

	//Adding of Articles
	//http://stackoverflow.com/questions/596216/formula-to-determine-brightness-of-rgb-color
	//http://stackoverflow.com/questions/596216/formula-to-determine-brightness-of-rgb-color
	//http://codepen.io/WebSeed/pen/pvgqEq
	function addArticle () {
		var currentUser = Parse.User.current();
		debugger;
		if(currentUser !== null)
		{
			if(currentUser)
			var Article = Parse.Object.extend("Article");
			var article = new Article();
			article.set("title",txt_title.value);
			article.set("description",txtarea_description.value);
			article.set("reference",txt_ref.value);
			article.set("tags",txt_tags.value);
			article.set("uploadedBy",currentUser);
			article.save(null, {
			  success: function(article) {
			    // Execute any logic that should take place after the object is saved.
			    Materialize.toast("Hooray! New article added!", 4000);
			  },
			  error: function(article, error) {
			    // Execute any logic that should take place if the save fails.
			    // error is a Parse.Error with an error code and message.
			    Materialize.toast("Failed to create new article. Perhaps you are not authorized to do so.", 4000);
			  }
			});
		}
		else
			Materialize.toast("Failed to create new article. Perhaps you are not logged in?", 4000);
	}

	//Retrieval of Articles
	function initializeArticles () {
		var Article = Parse.Object.extend("Article");
		var query = new Parse.Query(Article);
		query.descending("updatedAt");
		query.limit(20);
		query.find({
		  success: function(results) {
		    for (var i = 0,l = results.length; i < results.length; ++i) { 
		      var object = results[i];
		      alert(object.id + ' - ' + object.get('playerName'));
		    }
		  },
		  error: function(error) {
		    Materialize.toast("Error: " + error.code + " " + error.message,4000);
		  }
		});
	}
	function search (argument) {
		
	}

	//Displaying of Articles
	//TAG COLORING
	//http://stackoverflow.com/questions/3426404/create-a-hexadecimal-colour-based-on-a-string-with-javascript
	function colorTags () {
		$("span.tag").each(function(){
			var tag = calculatedTags[this.innerHTML];
			if(tag == undefined)
			{//calculate if undefined
				var bgColor = stringToColor(this.innerHTML);
				var snippedColor = cutHex(bgColor);
				var isLight = colourIsLight(hexToR(snippedColor),hexToG(snippedColor),hexToB(snippedColor));
				tag = new Tag(
					this.innerHTML,
					bgColor,
					isLight
					);
				calculatedTags[this.innerHTML] = tag;
			}//else use the "cache"
			this.style.color = tag.bgIsLight?"#000":"#FFF";//set the color of the text
			this.style.backgroundColor = tag.bgColor;
		});
	}
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
	  return (a < 0.5);
	}

	exports.showLogin = showLogin;
	exports.showLogout = showLogout;
	exports.login = login;
	exports.logout = logout;
	exports.addArticle = addArticle;
	exports.colorTags = colorTags;

})(window)