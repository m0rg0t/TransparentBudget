
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
    console.log('connection error:', err.message);
});
db.once('open', function callback() {
    console.log("Connected to DB!");
});

var Schema = mongoose.Schema;

// Schemas
var User = new Schema({
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
/*PlaceObject.path('title').validate(function (v) {
    return v.length > 5 && v.length < 70;
});*/

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
app.get('/places', function (req, res) {
    PlaceObjectModel.find(function (err, places) {
        if (!err) {
            //return res.send(places);
        } else {
            //res.statusCode = 500;
            //console.log('Internal error(%d): %s', res.statusCode, err.message);
            //return res.send({ error: 'Server error' });
        }
        if (places === undefined) {
            places = [];
        }
        if (places === null) {
            places = [];
        }
        res.render('places', { title: 'Места', year: new Date().getFullYear(), places: places });
    });
});
app.get('/documents', routes.documents);
app.get('/places_map', routes.places_map);

app.get('/places/add', routes.places_add);

var place_post_add = function (req, res) {
    
    var place = new PlaceObjectModel({
        title: req.body.title,
        author: "author",
        description: req.body.description
    });
    place.save(function (err) {
        if (!err) {
            console.log("article created");
            return res.send({ status: 'OK', place: place });
        } else {
            console.log(err);
            if (err.name == 'ValidationError') {
                res.statusCode = 400;
                res.send({ error: 'Validation error' });
            } else {
                res.statusCode = 500;
                res.send({ error: 'Server error' });
            }
            console.log('Internal error(%d): %s', res.statusCode, err.message);
        }
    });
}

app.post('/places/add', place_post_add);

app.get('/api/articles', function (req, res) {
    return PlaceObjectModel.find(function (err, places) {
        if (!err) {
            return res.send(places);
        } else {
            res.statusCode = 500;
            console.log('Internal error(%d): %s', res.statusCode, err.message);
            return res.send({ error: 'Server error' });
        }
    });
});

app.post('/api/articles', function (req, res) {
    var article = new PlaceObjectModel({
        title: req.body.title,
        author: req.body.author,
        description: req.body.description
    });
    
    article.save(function (err) {
        if (!err) {
            console.log("article created");
            return res.send({ status: 'OK', article: article });
        } else {
            console.log(err);
            if (err.name == 'ValidationError') {
                res.statusCode = 400;
                res.send({ error: 'Validation error' });
            } else {
                res.statusCode = 500;
                res.send({ error: 'Server error' });
            }
            console.log('Internal error(%d): %s', res.statusCode, err.message);
        }
    });
});

app.get('/api/places/:id', function (req, res) {
    return PlaceObjectModel.findById(req.params.id, function (err, place) {
        if (!place) {
            res.statusCode = 404;
            return res.send({ error: 'Not found' });
        }
        if (!err) {
            return res.send({ status: 'OK', article: article });
        } else {
            res.statusCode = 500;
            console.log('Internal error(%d): %s', res.statusCode, err.message);
            return res.send({ error: 'Server error' });
        }
    });
});

app.put('/api/places/:id', function (req, res) {
    return PlaceObjectModel.findById(req.params.id, function (err, place) {
        if (!place) {
            res.statusCode = 404;
            return res.send({ error: 'Not found' });
        }
        
        place.title = req.body.title;
        place.description = req.body.description;
        place.author = req.body.author;

        return place.save(function (err) {
            if (!err) {
                console.log("place updated");
                return res.send({ status: 'OK', article: article });
            } else {
                if (err.name == 'ValidationError') {
                    res.statusCode = 400;
                    res.send({ error: 'Validation error' });
                } else {
                    res.statusCode = 500;
                    res.send({ error: 'Server error' });
                }
                console.log('Internal error(%d): %s', res.statusCode, err.message);
            }
        });
    });
});

app.delete('/api/places/:id', function (req, res) {
    return PlaceObjectModel.findById(req.params.id, function (err, place) {
        if (!place) {
            res.statusCode = 404;
            return res.send({ error: 'Not found' });
        }
        return place.remove(function (err) {
            if (!err) {
                console.log("article removed");
                return res.send({ status: 'OK' });
            } else {
                res.statusCode = 500;
                console.log('Internal error(%d): %s', res.statusCode, err.message);
                return res.send({ error: 'Server error' });
            }
        });
    });
});


http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
