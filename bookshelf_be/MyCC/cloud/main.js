var _ = require("underscore");
Parse.Cloud.beforeSave("Article", function(request, response) {
	var article = request.object;

    //ACL
	var acl = new Parse.ACL();
	acl.setPublicReadAccess(true);
	if(request.user != null)
		acl.setWriteAccess(request.user.id, true);
	acl.setRoleWriteAccess("Admin", true);//should be enforced on cloud code
	article.setACL(acl);

	var toLowerCase = function(w) { return w.toLowerCase(); };
	var filterTrash = function(w) { return w.match(/^\w+$/) && ! _.contains(stopWords, w); };
	var stopWords = ["the", "in", "and", "or"];

    var title_keywords = article.get("title").split(/\b/);
    title_keywords = _.map(title_keywords, toLowerCase);
    title_keywords = _.filter(title_keywords, filterTrash);

    var descript_keywords = article.get("description").split(/\b/);
    descript_keywords = _.map(descript_keywords, toLowerCase);
    descript_keywords = _.filter(descript_keywords, filterTrash);

    article.set("title_keywords", title_keywords);
    article.set("description_keywords", descript_keywords);
    response.success();
});