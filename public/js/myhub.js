(function($){

// This is the main application logic
//  authenticatedUser: Should have a token property with
//                     a valid GitHub OAuth access token.
//  page: css selector for the DOM element used to render the app
//
var myHub = function(authenticatedUser, page){
  var self = this;
  page = $(page);
  this.el = page;
  this.org = null;
  this.managedUser = null;

  var templ = function(view){
    return $('#view-' + view).html();
  };

  var bind_templ = function(view, model){
    return Mustache.to_html(templ(view), model);
  };

  var github = function(resource, callback){
    var github_url = 'https://api.github.com';
    var url = resource.slice(0, 4) == 'http' ? resource : github_url + resource;
    var headers = {
      'Authorization' : 'token ' + authenticatedUser.token
    };
    return $.ajax({
      url: url,
      dataType: 'json',
      success: callback,
      headers: headers
    });
  };

  this.manageOrgs = function(){
    github('/user/orgs', function(data){
      self.show_orgs(data);
    });
  };

  page.bind('org-selected', function(evt, orgLogin, orgUrl){
    self.org = {login: orgLogin, url: orgUrl};
    var loading_org = self.load_org(self.org);
    loading_org.done(function(){
      self.show_user_selection();
    });
  });

  page.bind('user-selected', function(evt, userLogin, userUrl){
    self.managedUser = {login: userLogin, url: userUrl};
    var loading_user = self.load_user(self.managedUser);
    loading_user.done(function(){
      self.show_manage_user();
    });
  });

  this.show_orgs = function(data){
    var html = bind_templ('org-list', {orgs: data});
    page.html(html);
    $('a', page).click(function(e){
      e.preventDefault();
      var orgUrl = $(this).attr('href');
      var orgLogin = $(this).text();
      page.trigger('org-selected', [orgLogin, orgUrl]);
    });
  };

  this.load_org = function(org){
    return $.when( github(org.url + '/repos'),
           github(org.url + '/teams'),
           github(org.url + '/members')
          ).done(function(repoArgs, teamArgs, memberArgs){
            org.repos = repoArgs[0];
            org.teams = teamArgs[0];
            org.members = memberArgs[0];
          });
  };

  this.load_user = function(user){
    return $.when(user);
  };

  this.show_user_selection = function(){
    var html = bind_templ('user-selection', self.org);
    page.html(html);
    $('a', page).click(function(e){
      e.preventDefault();
      var userUrl = $(this).attr('href');
      var userLogin = $(this).text();
      page.trigger('user-selected', [userLogin, userUrl]);
    });
  };

  this.show_manage_user = function(){
    var page_data = {
      user_login: self.managedUser.login,
      org_login: self.org.login,
      org_repos: self.org.repos
    };
    var html = bind_templ('manage-user', page_data);
    page.html(html);
  };

};

window.MyHub = myHub;

})(jQuery);
