var express = require("express")
var app = express()
var Peer = require('peer').Peer;

app.set("view engine","ejs")

app.get("/1", function(req, res){
    res.render("home.ejs")

})
app.get("/2", function(req, res){
    res.render("2.ejs")
})
//set peerjs server
var PeerServer = require('peer').PeerServer;
var server = PeerServer({port: 9000, path: '/myapp'});

app.listen(8080,'localhost', function(){
    console.log("Server Started")
})
