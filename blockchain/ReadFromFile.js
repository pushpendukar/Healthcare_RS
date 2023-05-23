var fs = require("fs");

fs.readFile("chaindata.txt", function (err, data) {
    if (!err) {
        console.log(data + "");
    } else {
        console.log(err);
    }

});