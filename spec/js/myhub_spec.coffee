require '/jquery.min.js'
require '/underscore-min.js'
require '/myhub.js'

describe "Organization", ->
  it "should have a login property populated via constructor", ->
    org = new Organization 'login'
    expect( org.login ).toBe 'login'

  it "should have a url property populated via constructor", ->
    org = new Organization null, 'url'
    expect( org.url ).toBe 'url'

describe "Organization#user_view", ->
  org = null
  user = null

  beforeEach ->
    org = new Organization()
    org.teams = [{id:1, name:'Team1'}, {id:2, name:'Team2'}, {id:3, name:'Team3'}]
    org.team_details =
      1: {id:1, name:'Team1', permission:"push", members:[{login:'a'},{login:'b'},{login:'c'}], repos: [{id:11},{id:12}]}
      2: {id:2, name:'Team2', permission:"admin", members:[{login:'a'}], repos:[{id:12},{id:13},{id:14}]}
      3: {id:3, name:'Team3', permission:"pull", members:[{login:'b'},{login:'c'}], repos:[{id:11},{id:15}]}
    user = login: 'b'

  it "user_teams should return the IDs of teams the user belongs to", ->
    teams = org.user_teams(user)
    expect( teams.length ).toBe(2)
    expect( teams ).toContain(1)
    expect( teams ).toContain(3)
    expect( teams ).toNotContain(2)

  it "user_repos should return the IDs of repos the user belongs to", ->
    org.user_teams = -> [1,3]
    repos = org.user_repos(user)
    expect( repos.length ).toBe(3)
    expect( repos ).toContain(11)
    expect( repos ).toContain(12)
    expect( repos ).toContain(15)
