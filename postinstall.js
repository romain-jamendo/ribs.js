try {
    var ncp = require("ncp");
    ncp('./typings/backbone/index.d.ts', '../@types/backbone/index.d.ts', function(err) {
        if (err) throw err;
      });
} catch (e) { }
