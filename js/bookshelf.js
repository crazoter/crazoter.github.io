function showLogin () {
	$(btn_login).show();
    $(span_loggedInUser).hide();
    $(btn_logout).hide();
}
function showLogout (username) {
	$(btn_login).hide();
    $(span_loggedInUser).show();
    $(btn_logout).show();
    span_loggedInUser.innerHTML = "Hi "+username+"!";
}

function login () {
	//Maybe I should do some security stuff? I must make sure never to redisplay them though.
	Parse.User.logIn(txt_user.value, txt_pass.value, {
	  success: function(user) {
	    // Do stuff after successful login.
	    debugger;
	    txt_user.value = "";
	    txt_pass.value = "";
	    Materialize.toast("Logged in! Welcome, "+user.attributes.username+"!", 4000);
	    showLogout(user.attributes.username);//display the username :)
		$('#modal_login').closeModal();
	  },
	  error: function(user, error) {
	    // The login failed. Check error to see why.
	    txt_pass.value = "";
	    Materialize.toast("Wrong username / password!", 4000);
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