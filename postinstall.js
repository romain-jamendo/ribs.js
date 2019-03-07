try {
    var copy = require('copy');
    copy('./typings/backbone/index.d.ts', '../@types/backbone', { flatten: true }, function (err, files) {
        if (err) {
            throw err;
        }
    });
} catch (e) { }
