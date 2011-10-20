var github = function(resource, callback){
  var github_url = 'https://api.github.com';
  var url = resource.slice(0, 4) == 'http' ? resource : github_url + resource;
  return $.getJSON(url, {access_token: token}, callback);
};

var org_list = '<h3>Organizations</h3><ul>{{#orgs}}<li><a href="{{url}}"><img src="{{avatar_url}}">{{login}}</a></li>{{/orgs}}</ul>';
var org_display = '<h3>{{org_name}}</h3>' +
  '<ul>{{#repos}}<li>{{name}}</li>{{/repos}}</ul>' +
  '<ul>{{#teams}}<li>{{name}}</li>{{/teams}}</ul>' +
  '<ul>{{#members}}<li>{{login}}</li>{{/members}}</ul>';

$(function(){
  github('/user/orgs', function(data){
    show_orgs(data);
  });
});

var show_orgs = function(data){
  var page_holder = $('#page-holder');
  var html = Mustache.to_html(org_list, {orgs: data});
  page_holder.html(html);
  $("a", page_holder).click(function(e){
    e.preventDefault();
    var orgUrl = $(this).attr('href');
    var orgName = $(this).text();
    select_org({name: orgName, url: orgUrl});
  });
};

var select_org = function(org){
  $.when( github(org.url + '/repos'),
          github(org.url + '/teams'),
          github(org.url + '/members')
        ).done(function(repoArgs, teamArgs, memberArgs){
          show_org_details(org, repoArgs[0], teamArgs[0], memberArgs[0]);
        });
};

var show_org_details = function(org, repos, teams, members){
  var page_holder = $('#page-holder');
  var html = Mustache.to_html(org_display, {
    org_name: org.name,
    repos: repos,
    teams: teams,
    members: members
  });
  page_holder.html(html);
};
