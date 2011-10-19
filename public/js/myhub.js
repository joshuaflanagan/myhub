var github = function(resource, callback){
  $.getJSON(github_url + resource, {access_token: token}, callback);
};

var org_list = '{{#orgs}}<li><a href="{{url}}"><img src="{{avatar_url}}">{{login}}</a></li>{{/orgs}}';

$(function(){
  var orgs = $('#organizations');
  github('/user/orgs', function(data){
    var html = Mustache.to_html(org_list, {orgs: data});
    orgs.append(html);
    $("a", orgs).click(function(e){
      e.preventDefault();
      var orgUrl = $(this).attr('href');
      console.log('clicked ' + this); });
  });
});
