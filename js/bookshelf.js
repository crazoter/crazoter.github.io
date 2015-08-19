//DOM VARIABLES
(function(exports){

//VARIABLES & CLASSES
	//Login x Logout UI
		//var btn_login = document.getElementById("btn_login");
		var btn_login_mobile = document.getElementById("btn_login_mobile");
		var btn_add_article = document.getElementById("btn_add_article");
		//var btn_logout = document.getElementById("btn_logout");
		//var span_loggedInUser = document.getElementById("span_loggedInUser");
		var btn_logout_mobile = document.getElementById("btn_logout_mobile");
		var span_loggedInUser_mobile = document.getElementById("span_loggedInUser_mobile");
	//Login Modal Form
		var txt_user = document.getElementById("txt_username");
		var txt_pass = document.getElementById("txt_password");
		var progress_login = document.getElementById("progress_login");
	//Add Article Form
		//CONSTANTS
			var EDIT_KEY = "article";
		//RUNTIME
			var txt_title = document.getElementById("txt_title");
			var txtarea_description = document.getElementById("txtarea_description");
			var txt_ref = document.getElementById("txt_ref");
			var txt_tags = document.getElementById("txt_tags");
			var progress_add = document.getElementById("progress_add");
			var editingParseObject = null;
			var addingArticle = false;
	//Remove Article
		//CONSTANTS
			var DELETE_KEY = "delete";
		var selectedArticle = null;
		var selectedArticleSearchDom = null;
	//Search Article
		var txt_search = document.getElementById('txt_search');
		var txt_notfound = document.getElementById('txt_notfound');
		var ul_searches	= document.getElementById("ul_searches");
		var progress_search = document.getElementById("progress_search");
	//IFRAME
		var iframe_res = document.getElementById('iframe_res');
		//
	//Search, SearchDom & Pagination
		//CONSTANTS
			var SEARCH_MAX_LENGTH = 25;
			function SearchDomJQ (li,ref_anchor,span_title,tagholder,p_descript,span_time,span_user,deleteBtn,editBtn) {
				this.li = li;
				this.reference = ref_anchor;
				this.title = span_title;
				this.tags = tagholder;
				this.description = p_descript;
				this.timestamp = span_time;
				this.username = span_user;
				this.delete = deleteBtn;
				this.edit = editBtn;
				this.article = null;
			}
			var HARD_CODED_COMMANDS = {
				">all": function(){getArticlesOrderByDESC("updatedAt")},
				"": function(){getArticlesOrderByDESC("updatedAt")},
				">next": function(){
					if(!searching && search_currentCollection !== null) {
						if(pagination_hasNext()) {
							loadFillerText();
							search_currentCollection.query.skip(search_currentCollection.query._skip + SEARCH_MAX_LENGTH);
							fetchAndDisplayArticles();
						} else {
							Materialize.toast("There are no more articles to load.",TOAST_SHOWDURATION);
						}
					}
				},
				">back": function(){
					if(!searching && search_currentCollection !== null) {
						if(pagination_hasBack()) {
							loadFillerText();
							if(search_currentCollection.query._skip - SEARCH_MAX_LENGTH < 0) {
								search_currentCollection.query.skip(0);
							} else {
								search_currentCollection.query.skip(search_currentCollection.query._skip - SEARCH_MAX_LENGTH);
							}
							fetchAndDisplayArticles();
						} else {
							Materialize.toast("You're already on the first page.",TOAST_SHOWDURATION);
						}
					}
				}
			};
		//RUNTIME
			var $page_next = $("#page_next");
			var $page_back = $("#page_back");

			var searchDoms = [];
			var searchDomsInitialized = false;
			var search_currentPageIndex = 0;
			var search_currentCollection;
			var searching = false;
	//Animations
		var SHOWSPEED = 50;
		var TOAST_SHOWDURATION = 4000;
		//
	//Date
		var DATEFORMAT_ARTICLE = 'yyyy/MM/dd HH:mm';
		var DATEFORMAT_SEARCH = 'yyyy/MM/dd';
		var DATE_NOW = new Date();
		var DATE_MAP = {"now":0, "today":0, "yda":-1, "last":-7};
		var DAY_ARR = ["mon","tue","wed","thu","fri","sat","sun"];
		function FromToDate (formattedDate1,formattedDate2) {
			this.fromDate = new Date(formattedDate1);
			if(formattedDate2)
				this.fromDate = new Date(formattedDate2);
			else
			{//1 whole day
				this.toDate = new Date(this.fromDate);
				this.toDate.setDate(this.fromDate.getDate()+1);
			}
		}
	//Color (Tags)
		function Tag (string,color,isLight) {
			this.string = string;
			this.bgColor = color;
			this.bgIsLight = isLight;
		}
		var calculatedTags = {};//cache tags we have calculated so we don't have to recalculate
	//Responsive?
		var isComputer = true;

//LOGIN / LOGOUT
	//Display functions
	function showLogin () {
		//$(btn_login).show();
		$(btn_login_mobile).show();
	    //$(span_loggedInUser).hide();
	    $(span_loggedInUser_mobile).hide();
	    //$(btn_logout).hide();
	    $(btn_logout_mobile).hide();
	    $(btn_add_article).hide();
	}
	function showLogout (username) {
		//$(btn_login).hide();
		$(btn_login_mobile).hide();
	    //$(span_loggedInUser).show();
	    $(span_loggedInUser_mobile).show();
	    $(btn_add_article).show();
	    //$(btn_logout).show();
	    $(btn_logout_mobile).show();
	    var s = "Hi "+username+"!";
	    //span_loggedInUser.innerHTML = s;
	    span_loggedInUser_mobile.innerHTML = s;
	}
	//Logic functions
	function login () {
		//Maybe I should do some security stuff? I must make sure never to redisplay them though.
		$(progress_login).show();
		Parse.User.logIn(txt_user.value, txt_pass.value, {
		  success: function(user) {
		    // Do stuff after successful login.
		    txt_user.value = "";
		    txt_pass.value = "";
		    Materialize.toast("Logged in! Welcome, "+user.attributes.username+"!", TOAST_SHOWDURATION);
		    showLogout(user.attributes.username);//display the username :)
			$(progress_login).hide();
			$('#modal_login').closeModal();
			configAllArticleACL();
		  },
		  error: function(user, error) {
		    // The login failed. Check error to see why.
		    Materialize.toast("Wrong username / password!", TOAST_SHOWDURATION);
		    $(progress_login).hide();
		  }
		});
	}
	function logout () {
		var currentUser = Parse.User.current();
		if(currentUser !== null)
		{
			Materialize.toast("Logging out! Goodbye, "+currentUser.attributes.username+"!", TOAST_SHOWDURATION);
			Parse.User.logOut();
			configAllArticleACL();
		}
		showLogin();
	}

//Manipulation of Articles
	//http://stackoverflow.com/questions/596216/formula-to-determine-brightness-of-rgb-color
	//http://codepen.io/WebSeed/pen/pvgqEq
	function addArticle () {
		var currentUser = Parse.User.current();
		if(currentUser !== null)
		{
			if(!addingArticle) {
				addingArticle = true;
				$(progress_add).show();
				var article;
				if(editingParseObject == null) {
					//if creating new article
					var Article = Parse.Object.extend("Article");
					article = new Article();
				} else {
					//if editing article
					article = editingParseObject;
				}
				article.set("title",txt_title.value);
				article.set("description",txtarea_description.value);
				article.set("reference",txt_ref.value);
				article.set("tags",txt_tags.value.toUpperCase().split(/\s+/g));
				article.set("uploadedBy",currentUser);

				article.save(null, {
				  success: function(article) {
				    // Execute any logic that should take place after the object is saved.
				    clearAddArticleForm();
				    $('.lbl_add_article').removeClass("active");
				    if(editingParseObject !== null) {
					    Materialize.toast("New article added!", TOAST_SHOWDURATION);
					} else {
						Materialize.toast("Article updated.", TOAST_SHOWDURATION);
					}
				    postAddArticle();
				  },
				  error: function(article, error) {
				    // Execute any logic that should take place if the save fails.
				    // error is a Parse.Error with an error code and message.
				    //shit = error;
				    Materialize.toast("Failed to create new article. Perhaps you are not authorized to do so.", TOAST_SHOWDURATION);
				    postAddArticle();
				  }
				});
			}
		}
		else
			Materialize.toast("Failed to create new article. Perhaps you are not logged in?", TOAST_SHOWDURATION);
	}
	//Add article helper methods
		function clearAddArticleForm () {
			txt_title.value = "";
		    txtarea_description.value = "";
		    txt_tags.value = "";
		    txt_ref.value = "";
		}
		function postAddArticle () {
		    $(progress_add).hide();
		    addingArticle = false;
		}
	function deleteArticle (deleteBtn) {
		var selectedSearchDom = searchDoms[$(deleteBtn).data(DELETE_KEY)];
		if(selectedSearchDom.article !== null)
		{
			selectedSearchDom.article.destroy({
			  success: function(myObject) {
			    // The object was deleted from the Parse Cloud.
			    Materialize.toast("Successfully removed article.", TOAST_SHOWDURATION);
			    selectedSearchDom.li.hide(200);
			  },
			  error: function(myObject, error) {
			    // The delete failed.
			    // error is a Parse.Error with an error code and message.
			    Materialize.toast("Unsuccessfully removed article.", TOAST_SHOWDURATION);
			  }
			});
		}	
	}
	function editArticle (editBtn) {
		editingParseObject = searchDoms[$(editBtn).data(EDIT_KEY)].article;
		//populate modal data
		txt_title.value = editingParseObject.get("title");
		txtarea_description.value = editingParseObject.get("description");
		txt_ref.value = editingParseObject.get("reference");
		txt_tags.value = editingParseObject.get("tags").join(" ");
		//display modal
		$('.lbl_add_article').addClass("active");
		$('#modal_add').openModal();
	}

//Retrieval of Articles & Pagination
	function fetchAndDisplayArticles () {
		searching = true;
		search_currentCollection.fetch({
		  success: function(results) {
		  	displayArticles(results);
		  	searching = false;
		  },
		  error: function(error) {
		  	//finishedLoadingText();
		  	notFoundText();
		    Materialize.toast(error.message,TOAST_SHOWDURATION);
		    searching = false;
		  }
		});
	}
	//helper methods
		function pagination_hasNext () {
			return search_currentCollection.length >= SEARCH_MAX_LENGTH;
		}
		function pagination_hasBack () {
			return search_currentCollection.query._skip > 0;
		}
	function getArticlesOrderByDESC (column) {
		loadFillerText();
		var Article = Parse.Object.extend("Article");
		var query = new Parse.Query(Article);
		query.descending(column);
		query.include("uploadedBy");
		query.limit(SEARCH_MAX_LENGTH);
		search_currentCollection = query.collection();
		fetchAndDisplayArticles();
	}
	function search () {
		var searchStuff = txt_search.value;
		//Check hardcoded methods
		if(HARD_CODED_COMMANDS[searchStuff.toLowerCase()] != null) {
			HARD_CODED_COMMANDS[searchStuff.toLowerCase()]();
		} else {
			loadFillerText();
			//Replace date shortcuts (@)
			var shortcutRegex = /@(\S+?)\b|@(\S+?)$/g;
			var tempArr;
			while ((tempArr = shortcutRegex.exec(searchStuff)) !== null) {
				//first, get the shortcut value
				var shortcutValue;
				var offset = 0;
				if(tempArr[1] != null)//either in format 1
					shortcutValue = tempArr[1].toLowerCase();
				else if(tempArr[2] != null)//or format 2 (but both same value)
					shortcutValue = tempArr[2].toLowerCase();

				//calculate offset from today's day
				//if it is @last_mon @last_tue etc
				if(shortcutValue.indexOf("_") !== -1)
				{//last last whatever
					var values = shortcutValue.split("_");
					for(var i=0,l=values.length;i<l;++i)
						offset += DATE_MAP[values[i]];
				}
				else//@now, @today, @ytd or whatever
					offset += DATE_MAP[shortcutValue];

				//if offset is still valid
				if(!isNaN(offset))
				{
					var date = new Date();//set it
					date.setDate(DATE_NOW.getDate() + offset);
					searchStuff = searchStuff.replace(tempArr[0],"$"+jQuery.format.date(date,DATEFORMAT_SEARCH));//and format
				}
			}
			//replace date
			txt_search.value = searchStuff;

			//Tags (special characters accepted but must have # in front to signify it is a tagx)
			var wordsWithSpace = [];//group 1 - "(.+)"
			var tags = [];//group 2 and 3 - #(\S+?)\s OR #(\S+?)$
			var dates = [];//group 4, 5 and 6- \$(\d{4}\/\d{1,2}\/\d{1,2}) OR \$(\d{4}\/\d{1,2}\/\d{1,2})-(\d{4}\/\d{1,2}\/\d{1,2})
			var words = [];//group 7 and 8 - (\S+?)\s OR (\S+?)$
			var myRegex = /"(.+)"|#(\S+?)\s|#(\S+?)$|\$(\d{4}\/\d{1,2}\/\d{1,2})\-\$(\d{4}\/\d{1,2}\/\d{1,2})|\$(\d{4}\/\d{1,2}\/\d{1,2})|(\S+?)\s|(\S+?)$/g;//2 groups to handle one tht is in the middle (ends with space) or ends with EOL
			//var tempArr;
			while ((tempArr = myRegex.exec(searchStuff)) !== null) {
				if(tempArr[1] != null)
					wordsWithSpace.push(tempArr[1]);
				else if(tempArr[2] != null)
					tags.push(tempArr[2]);
				else if(tempArr[3] != null)
					tags.push(tempArr[3]);
				else if(tempArr[4] != null || tempArr[5] != null)
				{//dates that come as a pair
					dates.push(new FromToDate(tempArr[4],tempArr[5]));
				}
				else if(tempArr[6] != null)
				{//Single date
					dates.push(new FromToDate(tempArr[6]));
				}
				else if(tempArr[7] != null)
					words.push(tempArr[7]);
				else if(tempArr[8] != null)
					words.push(tempArr[8]);
			}
			var query_title = new Parse.Query("Article");
			var query_desc = new Parse.Query("Article");
			if(words.length > 0) {
				query_title.containsAll("title_keywords",words);
				query_desc.containsAll("description_keywords",words);
			}
			if(wordsWithSpace.length > 0) {
				query_title.contains("title",wordsWithSpace);
				query_desc.contains("description",wordsWithSpace);
			}
			var main_query = Parse.Query.or(query_title, query_desc);
			if(tags.length > 0)
				main_query.containsAll("tags",tags);
			console.log(dates);
			if(dates.length > 0) {//i will only take the 1st one lol lazy ftw
				main_query.lessThan("updatedAt",dates[0].toDate);
				main_query.greaterThanOrEqualTo("updatedAt",dates[0].fromDate);
			}
			//collection by query
			search_currentCollection = main_query.collection();
			var titleKeywordsMap = {};
			for(var i=words.length-1;i>=0;--i) {
				titleKeywordsMap[words[i]] = true;
			}
			//create comparator for sorting
			search_currentCollection.comparator = function(object) {
				var value = object.updatedAt.getTime() * -1;
				//Prioritize searches found in title and less in description
				if(words.length > 0) {
					var keywords = object.get("title_keywords");
					for(var i=keywords.length;i>=0;--i) {
						if(titleKeywordsMap[keywords[i]]) {
							value *= 2;
							break;
						}
					}
				}
				if(wordsWithSpace.length > 0) {
					var isInTitle;
					for(var i=0,l=wordsWithSpace.length;i<l;++i) {
						isInTitle = object.get("title").indexOf(wordsWithSpace[i]);
						if(isInTitle !== -1) {
							value *= 2;
							break;
						}
					}
				}
			  return value;
			};
			fetchAndDisplayArticles();
		}
	}

//Fun filler text
	function loadFillerText () {
		hideArticleList();
		txt_notfound.innerHTML = loadingBookshelfText();
		$(progress_search).show();
		$(txt_notfound).show();
	}
	function finishedLoadingText () {
		$(progress_search).hide();
		$(txt_notfound).hide();
		enablePageNext(pagination_hasNext());
		enablePageBack(pagination_hasBack());
	}
	function nothingToShowText () {
		$(progress_search).hide();
		txt_notfound.innerHTML = "The Bookshelf is empty.";
		enablePageNext(false);
		enablePageBack(false);
	}
	function notFoundText () {
		$(progress_search).hide();
		txt_notfound.innerHTML = "We could not find anything in the Bookshelf that matches your search.";
		enablePageNext(false);
		enablePageBack(false);
	}
	function loadingBookshelfText () {
		switch(Math.floor(Math.random()*11)) {
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
			default: return "COME FORTH, ARTICLES!";
		}
	}

//DOM Manipulation
	//Hide all article lists
	function hideArticleList () {
		for(var i=0,l=searchDoms.length;i<l;++i) {
			searchDoms[i].li.hide();
		}
	}
	//Build the dom for the articles
	function buildArticleHolders () {
		for(var i=0,l=SEARCH_MAX_LENGTH;i<l;++i) {
			var li = document.createElement('li');
			var inner = '<div class="collapsible-header truncate"><a id="search_ref'+i+'" href="'//insert reference
						+'" target="_blank"><i class="mdi-action-open-in-new"></a></i><span id="search_title'+i+'"></span>'//insert title
						+'<span id="search_tags'+i+'" class="tagholder right"></span></div>'//tags html
						+'<div class="collapsible-body">'
						+'<span class="timeholder right"><span id="search_time'+i+'" class="grey-text text-darken-1"></span>'//insert timestamp
						+' by <span id="search_user'+i+'"></span></span>'//username
						+'<p id="search_desc'+i+'"></p>'//descript
						+'<a id="search_delete'+i+'" class="waves-effect waves-teal modal-trigger deleteBtn" href="#modal_deleteArticle"><i class="mdi-action-delete"></i>Remove Article</a>'
						+'<a id="search_edit'+i+'" class="waves-effect waves-teal modal-trigger deleteBtn"><i class="mdi-content-create"></i>Edit Article</a>'
						+'</div>';
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
					$("#search_delete"+i),
					$("#search_edit"+i)
				));
		}
	}
	function refreshArticle (index,article) {
		var searchDom = searchDoms[index];//document.createElement("li");
		searchDom.reference.attr("href",he.encode(article.get("reference")));
		searchDom.title.text(article.get("title"));
		var tags = article.get('tags');
		if(tags != null) {
			var inner = "";
			for(var i=0,l=tags.length;i<l;++i) {
				inner += '<span class=\"tag\">';
				inner += he.encode(tags[i]);
				inner += '</span>';
			}
			if(inner !== "") {
				searchDom.tags.html(inner);
			}
		}
		searchDom.description.html(he.encode(article.get("description")).replace(/\n/g,"<br/>"));
		searchDom.timestamp.text(jQuery.format.date(article.updatedAt,DATEFORMAT_ARTICLE));
		searchDom.username.text(article.get("uploadedBy").attributes.username);
		searchDom.article = article;

		var deleteBtn = $(searchDom.delete);
		//deleteBtn.unbind('click');
		var editBtn = $(searchDom.edit);
		editBtn.click(function(){ 
			editArticle(this);
			return false; 
		});
		deleteBtn.click(function(){ 
			deleteArticle(this);
			return true; 
		});
		configArticleACL(index,searchDom);
	}
	function configArticleACL (index,searchDom) {
		var article = searchDom.article;
		var currentUser = Parse.User.current();
		var acl = article.getACL();//access control

		if(acl == null || //no access control so well anything goes
			(currentUser !== null && article.getACL().getWriteAccess(currentUser.id))) {//user can edit it
			searchDom.edit.data(EDIT_KEY,index);
			searchDom.delete.data(DELETE_KEY,index);
			searchDom.edit.show();
			searchDom.delete.show();
		} else {
			searchDom.edit.hide();
			searchDom.delete.hide();
		}
	}
	//configArticleACL helper methods
		function configAllArticleACL () {
			for(var i=0;i<searchDoms.length;++i) {
				configArticleACL(i,searchDoms[i]);
			}
		}
	function displayArticles (results) {
		if(results.length === 0) {
	  		nothingToShowText();
	  	} else {
	  		//search_currentPageIndex = 0;
	  		search_currentCollection = results;
	  		finishedLoadingText();
	  		var i = 0,l = SEARCH_MAX_LENGTH;
	  		if(results.length < l)
	  			l = results.length;
		    for (; i < l; ++i) { 
		      var article = results.at(i);
		      refreshArticle(i,article);
		    }
		    colorTags();
		    cascadingDisplayArticles(0,l);
	  	}
	}
	function enablePaging ($dom,enable) {
		if(enable) {
			$dom.removeClass("disabled").addClass("waves-effect");
		} else {
			$dom.addClass("disabled").removeClass("waves-effect");
		}
	}
	function enablePageNext (enable) {
		enablePaging($page_next,enable);
	}
	function enablePageBack (enable) {
		enablePaging($page_back,enable);
	}
	//Animate the cascading article effect
	function cascadingDisplayArticlesStart (length) {
		cascadingDisplayArticles(0,length);

	}
	function cascadingDisplayArticles (index,length) {
		if(index<length) {
			$(searchDoms[index].li).show(SHOWSPEED, function () {
				cascadingDisplayArticles(index+1,length);
			});
		} else {
			if(!searchDomsInitialized) {
				//Put here because the Modals couldn't init when the anchor tags were not in yet (I tried putting immediately after, didn't work)
				if(true || isComputer) {
					//tablet or computer, has the power
					$('.collapsible').collapsible();//init collapsibles
					$('.modal-trigger').leanModal();//init Modals
				}
				searchDomsInitialized = true;
			}
		}
	}

//COLOR
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
	//HEX TO RGB
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

//IFRAME
	// function iframe_back () {
	// 	iframe_res.contentWindow.history.back();
	// }

//CLICK EVENTS
	function submit_login () {
		login();
		return false;
	}
	function submit_addArticle () {
		addArticle();
		return false;
	}
	function btn_add_onclick () {
		if(editingParseObject !== null) {
			editingParseObject = null;
			clearAddArticleForm();
		}
		$("#modal_add").openModal();
		return false;
	}
	function btn_delete_onclick () {
		deleteArticle();
		return false;
	}
	function btn_logout_onclick () {
		logout();
		return false;
	}

//EXPORTS
	exports.colorTags = colorTags;
	exports.search = search;
	exports.submit_login = submit_login;
	exports.submit_addArticle = submit_addArticle;
	exports.btn_add_onclick = btn_add_onclick;
	exports.btn_delete_onclick = btn_delete_onclick;
	exports.btn_logout_onclick = btn_logout_onclick;

//Initialization
	function initDateMap () {
		//DATE_MAP.yda.setDate(DATE_MAP.now.getDate() - 1);
		var baseline = DATE_NOW.getDay();//for days
		if(baseline == 0)
			baseline = 7;
		for(var i=0,l=DAY_ARR.length;i<l;)//keep the number of days needed to add / deduct
			DATE_MAP[DAY_ARR[i]] = ++i - baseline;//wow so optimize
	}
	function initializeArticles () {
		buildArticleHolders();
		hideArticleList();
		//Get initial set of articles
		getArticlesOrderByDESC("updatedAt");
	}
	function initPagination () {
		$page_next.click(function(){
			if(pagination_hasNext())
				HARD_CODED_COMMANDS[">next"]();
		});
		$page_back.click(function(){
			if(pagination_hasBack())
				HARD_CODED_COMMANDS[">back"]();
		});
	}

	initDateMap();

	Parse.initialize("WfzcQHZPt7egsWB3xae2wNlS2HxzcBI1of5aDnAX", "9hkM1JPqeCoJhYKtxsVnTKI7QWmqgYm3t4sSclBR");
	$(document).ready(function(){
		isComputer = $(document).width() >= 640;
		//Initialize Modals
		$('.modal-trigger').leanModal();
		//Initialize Mobile Collapse Nav
		$(".button-collapse").sideNav();
		//Initialize Tabs
		$('ul.tabs').tabs();
		//Display login/logout
		if(Parse.User.current() === null){
		  showLogin();
		} else {
		  showLogout(Parse.User.current().attributes.username);
		}
		initializeArticles();
		initPagination();
		//colorTags();
	});
	$(".fat").height($(document).height()-140);

})(window)