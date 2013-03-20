var express = require('express');
var app = express();
var accountservice = require('./services/accountservice.js');
app.get('/getaccounts', accountservice.getaccounts);
app.get('/getservicesbyaccount', accountservice.getservicesbyaccount);
app.listen(8080);
