require('/jquery.min.js');
require('/underscore-min.js');

require('/myhub.js');

describe("Organization", function(){

  it("should have a login property populated via constructor", function(){
    var org = new Organization('login');
    expect( org.login ).toBe('login');
  });

  it("should have a url property populated via constructor", function(){
    var org = new Organization(null, 'url');
    expect( org.url ).toBe('url');
  });
});

describe("Organization#user_teams", function(){
  var org;
  var user;

  beforeEach(function(){
    org = new Organization();
    org.teams = [{id:1, name:'Team1'}, {id:2, name:'Team2'}, {id:3, name:'Team3'}];
    org.team_details = {
      1: {id:1, name:'Team1', permission:"push", members:[{login:'a'},{login:'b'},{login:'c'}]},
      2: {id:2, name:'Team2', permission:"admin", members:[{login:'a'}]},
      3: {id:3, name:'Team3', permission:"pull", members:[{login:'b'},{login:'c'}]},
    };

    user = {login: 'b'};
  });

  it("should return the IDs of teams the user belongs to", function(){
    var teams = org.user_teams(user);
    expect( teams.length ).toBe(2);
    expect( teams ).toContain(1);
    expect( teams ).toContain(3);
    expect( teams ).toNotContain(2);
  });
});
