var github = function(resource, callback){
  var github_url = 'https://api.github.com';
  var url = resource.slice(0, 4) == 'http' ? resource : github_url + resource;
  return $.getJSON(url, {access_token: token}, callback);
};

$(function(){
  github('/user/orgs', function(data){
    show_orgs(data);
  });
});

var templ = function(view){
  return $("#view-" + view).html();
};

var bind_templ = function(view, model){
  return Mustache.to_html(templ(view), model);
};

var show_orgs = function(data){
  var page_holder = $('#page-holder');
  var html = bind_templ("org-list", {orgs: data});
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
  var html = bind_templ("org", {
    org_name: org.name,
    repos: repos,
    teams: teams,
    members: members
  });
  page_holder.html(html);
};
