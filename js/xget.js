//http://stackoverflow.com/questions/16682482/cross-domain-javascript-pull-meta-tags
//http://jsfiddle.net/KLdsG/3/
jQuery.ajax=function(e){function o(e){return!r.test(e)&&/:\/\//.test(e)}var t=location.protocol,n=location.hostname,r=RegExp(t+"//"+n),i="http"+(/^https/.test(t)?"s":"")+"://query.yahooapis.com/v1/public/yql?callback=?",s='select * from html where url="{URL}" and xpath="*"';return function(t){var n=t.url;if(/get/i.test(t.type)&&!/json/i.test(t.dataType)&&o(n)){t.url=i;t.dataType="json";t.data={q:s.replace("{URL}",n+(t.data?(/\?/.test(n)?"&":"?")+jQuery.param(t.data):"")),format:"xml"};if(!t.success&&t.complete){t.success=t.complete;delete t.complete}t.success=function(e){return function(t){if(e){e.call(this,{responseText:(t.results[0]||"").replace(/<script[^>]+?\/>|<script(.|\s)*?\/script>/gi,"")},"success")}}}(t.success)}return e.apply(this,arguments)}}(jQuery.ajax);
/**
*	url: url
*	callbacks: {done: function(), fail: function()}
*/
function xget (url,callbacks) {
	$.ajax({
	    url: url,
	    type: "GET",
	    async: true
	}).done(function (response) {
	    var div = document.createElement("div"),
	        responseText = response.results[0],
	        title, metas, meta, name, description, keywords, i;
	    div.innerHTML = responseText;
	    title = div.getElementsByTagName("title");
	    title = title.length ? title[0].innerHTML : undefined;
	    metas = div.getElementsByTagName("meta");
	    var metasCleared = "00";//keywords & description
	    for (i = 0; i < metas.length; i++) {
	        name = metas[i].getAttribute("name");
	        if(name === "keywords") {
	        	keywords = metas[i].getAttribute("content").replace(" ", "_").replace(",", " ");
	        	metasCleared = metasCleared|"10";
	        } else if (name.indexOf("description") !== -1) {//most likely a description
	            description = metas[i].getAttribute("content");
	            metasCleared = metasCleared|"01";
	        }
	        if(metasCleared=="11")
	        	break;
	    }
	    if(callbacks["done"])
	    	callbacks["done"](title,description,keywords);
	    //console.log("Title:", title);
	    //console.log("Description:", description);
	}).fail(function (jqXHR, textStatus, errorThrown) {
		if(callbacks["fail"])
			callbacks["fail"](textStatus,errorThrown);
	    //console.log("AJAX ERROR:", textStatus, errorThrown);
	});
}