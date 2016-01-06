var glagol=require("..")
var fs=require("fs")
var path=require("path")

describe("loader", function() {
  it("glagol(pathToSomeFile) returns a File instance populated with the contents of that file. The instance's parent property defaults to null.",
    function(done) {
      var g = glagol("./spec/sample/n1");
      expect(glagol.File.is(g)).toBe(true);
      expect(g.parent).toBe(null);
      fs.readFile("./spec/sample/n1", "utf8", function (err, data) {
        if (err) throw err;
        expect(g.source).toEqual(data);
        done();
      });
    });
  it("glagol(pathToSomeDirectory) returns a Directory instance recursively populated with File and Directory instances that correspond to the full contents of that directory.",
    function(done) {
      var g=glagol("./spec/sample");
      expect(glagol.Directory.is(g)).toBe(true);
      expect(g.parent).toBe(null);
      fs.readdir("./spec/sample", function (err, data) {
        if (err) throw err;
        console.log(data);
        expect(Object.keys(g.nodes)).toEqual(data);
        var i=0;
        data.forEach(function(asd){
          console.log(asd);
          var status = fs.statSync(path.join("./spec/sample", asd));
          console.log(status.__proto__ === fs.Stats.prototype);
          if (status.isFile()) {
            expect(glagol.File.is(g.nodes[asd])).toBe(true);
          } else if (status.isDirectory()) {
            expect(glagol.Directory.is(g.nodes[asd])).toBe(true);
          } else {
            throw Error(asd + " is not a file or directory.");
          }
        })
        done();
      });
    });
});
