(function($){


window.Organization = function(login, url){
  var self = this;
  this.login = login;
  this.url = url;

  var PERMISSIONS = {
    'pull' : 1,
    'push' : 2,
    'admin': 3
  };

  var maxPerm = function(x, y){
    return PERMISSIONS[x] > PERMISSIONS[y] ? x : y;
  };

  this.user_teams = function(user){
    var filtered = _.filter(self.team_details, function(t) {
      return _.any(t.members, function(m){ return m.login === user.login;});
    });
    return _.map(filtered, function(t){ return t.id; });
  };

  this.user_repos = function(user, teams){
    var userRepos = {};
    _.each(teams, function(teamId){
      var perm = self.team_details[teamId].permission;
      _.each(self.team_details[teamId].repos, function(r){
        userRepos[r.id] = maxPerm(userRepos[r.id], perm);
      });
    });
    return userRepos;
  };

  this.user_view = function(user){
    var uTeams = self.user_teams(user);
    var uRepos = self.user_repos(user, uTeams);
    var repos = _.map(self.repos, function(repo){
      return {
        id: repo.id,
        name: repo.name,
        permission: uRepos[repo.id] || null
      };
    });

    return {
      repos: repos
    };
  };
};

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

  // main entry point
  this.manageOrgs = function(){
    github('/user/orgs', function(data){
      self.show_orgs(data);
    });
  };

  page.bind('org-selected', function(evt, orgLogin, orgUrl){
    self.org = new Organization(orgLogin, orgUrl);
    var loading_org = self.load_org(self.org);
    loading_org.done(function(){
      self.load_org_teams(self.org);
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
    //TODO: filter down to just the orgs the auth user is an owner
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

  this.load_org_teams = function(org){
    org.team_details = {};
    var teamLoaders = _.map(org.teams, function(team){
      return $.when(
        github('/teams/' + team.id),
        github('/teams/' + team.id + '/repos'),
        github('/teams/' + team.id + '/members')
      ).done(function(t, r, m){
        var team = t[0];
        team.repos = r[0];
        team.members = m[0];
        org.team_details[team.id] = team;
      });
    });
    org.loading = $.when.apply($, teamLoaders).done(function(){
      console.log("loaded all the team data");
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
    var orgForUser = self.org.user_view(self.managedUser);
    var page_data = {
      user_login: self.managedUser.login,
      org_login: self.org.login,
      user_repos: orgForUser.repos
    };
    var html = bind_templ('manage-user', page_data);
    page.html(html);
  };

};

window.MyHub = myHub;

})(jQuery);
