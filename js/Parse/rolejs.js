var Role = Parse.Object.extend("_Role");
var query = new Parse.Query(Role);
query.equalTo("name", "Admin");
query.find({
  success: function(results) {
    alert("Successfully retrieved " + results.length);
    // Do something with the returned Parse.Object values
    for (var i = 0; i < results.length; i++) { 
      var object = results[i];
      //alert(object.id + ' - ' + object.get('playerName'));
      object.getUsers().add(Parse.User.current());
      object.save();
      alert('saved!');
    }
  },
  error: function(error) {
    alert("Error: " + error.code + " " + error.message);
  }
});