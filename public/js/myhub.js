(function($){

// This is the main application logic
//  authenticatedUser: Should have a token property with
//                     a valid GitHub OAuth access token.
//  page: css selector for the DOM element used to render the app
//
var myHub = function(authenticatedUser, page){
  var self = this;
  page = $(page);

  var templ = function(view){
    return $("#view-" + view).html();
  };

  var bind_templ = function(view, model){
    return Mustache.to_html(templ(view), model);
  };

  var github = function(resource, callback){
    var github_url = 'https://api.github.com';
    var url = resource.slice(0, 4) == 'http' ? resource : github_url + resource;
    var headers = {
      "Authorization" : "token " + authenticatedUser.token
    };
    return $.ajax({
      url: url,
      dataType: "json",
      success: callback,
      headers: headers
    });
  };

  this.manageOrgs = function(){
    github('/user/orgs', function(data){
      self.show_orgs(data);
    });
  };

  this.show_orgs = function(data){
    var html = bind_templ("org-list", {orgs: data});
    page.html(html);
    $("a", page).click(function(e){
      e.preventDefault();
      var orgUrl = $(this).attr('href');
      var orgName = $(this).text();
      self.select_org({name: orgName, url: orgUrl});
    });
  };

  this.select_org = function(org){
    $.when( github(org.url + '/repos'),
           github(org.url + '/teams'),
           github(org.url + '/members')
          ).done(function(repoArgs, teamArgs, memberArgs){
            self.show_org_details(org, repoArgs[0], teamArgs[0], memberArgs[0]);
          });
  };

  this.show_org_details = function(org, repos, teams, members){
    var html = bind_templ("org", {
      org_name: org.name,
      repos: repos,
      teams: teams,
      members: members
    });
    page.html(html);
  };

};

window.MyHub = myHub;

})(jQuery);
