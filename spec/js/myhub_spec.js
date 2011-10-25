require('/jquery.min.js');
require('/underscore-min.js');

require('/myhub.js');

describe("Organization", function(){

  it("should have a login property populated via constructor", function(){
    var org = new Organization('login');
    expect( org.login ).toEqual('login');
  });

  it("should have a url property populated via constructor", function(){
    var org = new Organization(null, 'url');
    expect( org.url ).toEqual('url');
  });
});
