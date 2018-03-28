var express = require('express')
var app = express()

app.set('view engine', 'ejs')
app.use(express.static('views'));

app.get('/',function(req,res){
  res.render('index')
})
app.listen(8080, function(){
  console.log("on");
})
