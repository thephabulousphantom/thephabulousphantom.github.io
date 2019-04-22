var express = require("express");
var https = require("https");
var http = require("http");
var fs = require("fs");

function main() {

    var options = {
        key: null,
        cert: null
    };

    console.log("Creating Express service...");
    var app = express();
    app.use("/", express.static("./"));

    try {

        console.log("Starting HTTP server...");
        http.createServer(app).listen(8088);
    }
    catch (ex) {

        console.warn("Couldn't start HTTP server: " + ex.toString());
    }

    try
    {
        console.log("Loading HTTPS key...");
        options.key = fs.readFileSync("./server/keys/client-key.pem");

        console.log("Loading HTTPS certificate...");    
        options.cert = fs.readFileSync("./server/keys/CA.crt");

        console.log("Starting HTTPS server...");
        https.createServer(options, app).listen(443);
    }
    catch (ex) {

        console.warn("Couldn't start HTTPS server: " + ex.toString());
    }
}

main();