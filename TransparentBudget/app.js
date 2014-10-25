
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');

var mongoose = require('mongoose');
mongoose.connect('mongodb://transparentbudget2:poldyXAXA2@ds027748.mongolab.com:27748/Transparentbudget');

var db = mongoose.connection;

db.on('error', function (err) {
    log.error('connection error:', err.message);
});
db.once('open', function callback() {
    log.info("Connected to DB!");
});

var Schema = mongoose.Schema;

// Schemas
var User = new Schema({
    /*kind: {
        type: String,
        enum: ['thumbnail', 'detail'],
        required: true
    },
    url: { type: String, required: true }*/
    username: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true }
});

var PlaceObject = new Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    description: { type: String, required: true },
    modified: { type: Date, default: Date.now }
});

// validation
PlaceObject.path('title').validate(function (v) {
    return v.length > 5 && v.length < 70;
});

var PlaceObjectModel = mongoose.model('PlaceObject', PlaceObject);

module.exports.PlaceObjectModel = PlaceObjectModel;



var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/about', routes.about);
app.get('/contact', routes.contact);
app.get('/places', routes.places);
app.get('/documents', routes.documents);
app.get('/places_map', routes.places_map);

app.get('places/add', routes.places_add);

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
