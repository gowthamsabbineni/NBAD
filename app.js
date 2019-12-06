var express = require('express');
var app = express();
app.set('view engine', 'ejs');
app.use('/assets', express.static('assets'));
var session=require('express-session');
app.use(session({secret:"Assam",resave: false,saveUninitialized: true}));
var validator=require('express-validator');
app.use(validator());

var profileController=require('./routes/profileController.js');
app.use('/',profileController);

app.listen(8080,function(){
    console.log('server is listening to port 8080')
});
