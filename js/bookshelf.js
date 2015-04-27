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

	//Remove Article
	var selectedArticle = null;
	var selectedArticleSearchDom = null;

	//Search Article
	var txt_notfound = document.getElementById('txt_notfound');
	var ul_searches	= document.getElementById("ul_searches");
	function SearchDomJQ (li,ref_anchor,span_title,tagholder,p_descript,span_time,span_user,deleteBtn) {
		this.li = li;
		this.reference = ref_anchor;
		this.title = span_title;
		this.tags = tagholder;
		this.description = p_descript;
		this.timestamp = span_time;
		this.username = span_user;
		this.delete = deleteBtn;
	}
	var searchDoms = [];
	var SEARCH_MAX_LENGTH = 20;
	var DATEFORMAT  = 'dd/MM/yyyy HH:mm';
	var searchDomsInitialized = false;

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

	//Manipulation of Articles
	//http://stackoverflow.com/questions/596216/formula-to-determine-brightness-of-rgb-color
	//http://stackoverflow.com/questions/596216/formula-to-determine-brightness-of-rgb-color
	//http://codepen.io/WebSeed/pen/pvgqEq
	function addArticle () {
		var currentUser = Parse.User.current();
		if(currentUser !== null)
		{
			//access control
			var acl = new Parse.ACL();
			acl.setPublicReadAccess(true);
			acl.setWriteAccess(Parse.User.current().id, true);
			acl.setRoleWriteAccess("Admin", true);//should be enforced on cloud code

			//article itself
			var Article = Parse.Object.extend("Article");
			var article = new Article();
			article.set("title",txt_title.value);
			article.set("description",txtarea_description.value);
			article.set("reference",txt_ref.value);
			article.set("tags",txt_tags.value);
			article.set("uploadedBy",currentUser);
			article.setACL(acl);
			article.save(null, {
			  success: function(article) {
			    // Execute any logic that should take place after the object is saved.
			    Materialize.toast("Hooray! New article added!", 4000);
			    txt_title.value = "";
			    txtarea_description.value = "";
			    txt_tags.value = "";
			    txt_ref.value = "";
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
	function deleteArticle () {
		if(selectedArticle !== null)
		{
			selectedArticle.destroy({
			  success: function(myObject) {
			    // The object was deleted from the Parse Cloud.
			    Materialize.toast("Successfully removed article.", 4000);
			    selectedArticleSearchDom.hide(200);
			  },
			  error: function(myObject, error) {
			    // The delete failed.
			    // error is a Parse.Error with an error code and message.
			    Materialize.toast("Unsuccessfully removed article.", 4000);
			  }
			});
		}	
	}

	//Retrieval of Articles
	function initializeArticles () {
		buildArticleHolders();
		loadFillerText();
		
		clearArticleList();
		
		var Article = Parse.Object.extend("Article");
		var query = new Parse.Query(Article);
		query.descending("updatedAt");
		query.include("uploadedBy");
		query.limit(SEARCH_MAX_LENGTH);
		query.find({
		  success: function(results) {
		  	if(results.length === 0)
		  	{
		  		nothingToShowText();
		  	}
		  	else
		  	{
		  		finishedLoadingText();
		  		var i = 0,l = results.length;
			    for (; i < results.length; ++i) { 
			      var article = results[i];
			      refreshArticle(i,article);
			    }
			    colorTags();
			    $('ul.tabs').tabs();
			    cascadingDisplayArticles(0,l);
			}
		  },
		  error: function(error) {
		  	finishedLoadingText();
		    Materialize.toast("Error: " + error.code + " " + error.message,4000);
		  }
		});
	}
	function search (argument) {
		
	}

	//Fun filler text
	function loadFillerText () {
		txt_notfound.innerHTML = loadingBookshelfText();
		$(txt_notfound).show();
	}
	function finishedLoadingText () {
		$(txt_notfound).hide();
	}
	function nothingToShowText () {
		txt_notfound.innerHTML = "The Bookshelf is empty.";
	}
	function notFoundText () {
		txt_notfound.innerHTML = "We could not find anything in the Bookshelf that matches your search.";
	}
	function loadingBookshelfText () {
		switch(Math.floor(Math.random()*10))
		{
			case 0: return "Preparing the Bookshelf...";
			case 1: return "Flip flip flip...";
			case 2: return "Retrieving articles...";
			case 3: return "Preparing some tea...";
			case 4: return "Preparing...";
			case 5: return "Loading...";
			case 6: return "The Bookshelf prepares itself...";
			case 7: return "Please wait while our elves arrange the Bookshelf...";
			case 8: return "The Bookshelf is loading - please wait...";
			case 9: return "Patience, my dear Watson - the Bookshelf needs time to load.";
			default: return "COME FORTH, ARTICLES!";//lol this will never happen too bad guys
		}
	}

	function clearArticleList () {
		//var jq_ul_searches = $(ul_searches);
		//jq_ul_searches.hide();
		for(var i=0,l=searchDoms.length;i<l;++i)
		{
			searchDoms[i].li.hide();
		}

	}
	function buildArticleHolders () {
		/*
		<li>
             <div class="collapsible-header truncate"><a id="test_a" href="http://www.brocode.org/" target="_blank"><i class="mdi-action-open-in-new"></a></i><span id="test_b">The Bro Code</span>
              <span class="timeholder right"><span id="test_e" class="grey-text">somefuckingrandomtimestamp </span><span id="test_g" class="tag">Crazoter</span></span>
              <span id="test_c" class="tagholder right">
                <span class="tag">funny</span>
                <span class="tag">random</span>
                <span class="tag">can't tell</span>
                <span class="tag">hi aidil</span>
                <span class="tag">KIV</span>
              </span>
            </div>
            <div class="collapsible-body">
              <p id="test_d">"168: Bro's don’t touch each others hair."</p>
               <a class="waves-effect waves-teal modal-trigger deleteBtn" href="#modal_deleteArticle" onclick="delete('test_f-id');return true;"><i class="mdi-action-delete"></i>Remove Article</a>
            </div>
          </li>
		*/
		for(var i=0,l=SEARCH_MAX_LENGTH;i<l;++i)
		{
			var li = document.createElement('li');
			var inner = '<div class="collapsible-header truncate"><a id="search_ref'+i+'" href="'//insert reference
						+'" target="_blank"><i class="mdi-action-open-in-new"></a></i><span id="search_title'+i+'"></span>'//insert title
						+'<span id="search_tags'+i+'" class="tagholder right"></span></div>'//tags html
						+'<div class="collapsible-body">'
						+'<span class="timeholder right"><span id="search_time'+i+'" class="grey-text text-darken-1"></span>'//insert timestamp
						+' by <span id="search_user'+i+'"></span></span>'//username
						+'<p id="search_desc'+i+'"></p>'//descript
						+'<a id="search_delete'+i+'" class="waves-effect waves-teal modal-trigger deleteBtn" href="#modal_deleteArticle"><i class="mdi-action-delete"></i>Remove Article</a></div>';
			li.innerHTML = inner;
			li.style.display = "none";
			ul_searches.appendChild(li);
			searchDoms.push(new SearchDomJQ($(li),
				$("#search_ref"+i),
				$("#search_title"+i),
				$("#search_tags"+i),
				$("#search_desc"+i),
				$("#search_time"+i),
				$("#search_user"+i),
				$("#search_delete"+i)
				));
		}
	}
	function refreshArticle (index,article) {
		var searchDom = searchDoms[index];//document.createElement("li");
		searchDom.reference.attr("href",he.encode(article.get("reference")));
		searchDom.title.text(article.get("title"));
		var tags = article.get('tags').split(/\s+/g);
		var inner = "";
		for(var i=0,l=tags.length;i<l;++i)
		{
			inner += '<span class=\"tag\">';
			inner += he.encode(tags[i]);
			inner += '</span>';
		}
		if(inner !== "")
		{
			searchDom.tags.html(inner);
		}
		searchDom.description.html(he.encode(article.get("description")).replace(/\n/g,"<br/>"));
		searchDom.timestamp.text(jQuery.format.date(article.updatedAt,DATEFORMAT));
		searchDom.username.text(article.get("uploadedBy").attributes.username);
		var deleteBtn = $(searchDom.delete);
		deleteBtn.unbind('click');
		var currentUser = Parse.User.current();
		var acl = article.getACL();
		var valid = false;

		if(acl == null)
		{//no access control so well anything goes
			valid = true;
		}
		else if(currentUser !== null)
		{
			if(article.getACL().getWriteAccess(currentUser.id))
				valid = true;//i can edit it!
		}

		if(valid)
		{
			deleteBtn.show();
			deleteBtn.click(function(){ 
				selectedArticle = article;
				selectedArticleSearchDom = $(this).parent().parent();
				return true; 
						});
		}
		else
			deleteBtn.hide();
	}
	function cascadingDisplayArticles (index,length) {
		if(index<length)
		{
			$(searchDoms[index].li).show(200, function () {
				cascadingDisplayArticles(index+1,length);
			});
		}
		else
		{
			if(!searchDomsInitialized)
			{
				//Put here because the Modals couldn't init when the anchor tags were not in yet (I tried putting immediately after, didn't work)
				$('.collapsible').collapsible();//init collapsibles
				$('.modal-trigger').leanModal();//init Modals
				searchDomsInitialized = true;
			}
		}
	}
	//Coloring of Tags (do only after the articles are displayed)
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
	exports.initializeArticles = initializeArticles;
	exports.colorTags = colorTags;
	exports.deleteArticle = deleteArticle;

})(window)