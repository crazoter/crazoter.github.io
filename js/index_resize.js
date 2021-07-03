var topPaddingAmt = 0;
var jNavbardiv = $(document.getElementById('navbardiv'));
var jContentdiv = $(document.getElementById('content'));
function paddingResize(){//when it's too small, nav bar will squeeze, so i want to bring my text lower so the navbar won't block the text
	jContentdiv.removeAttr( 'style' );
	var height = jNavbardiv.height();
	if(jContentdiv.offset().top + topPaddingAmt < height)
	{
		jContentdiv.css("margin-top",(height + topPaddingAmt) + "px");
	}
}
$(window).resize(function() {
	paddingResize();
});
paddingResize();