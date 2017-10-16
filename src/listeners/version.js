var pkgjson = nodeRequire('./package.json');

$(function(){
  $('#footer').html('v' + pkgjson.version);
});