
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');

var unirest = require('unirest');

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
    email: { type: String, required: true },
    name: { type: String, required: true},
    modified: { type: Date, default: Date.now }
});

User.methods.validPassword = function(pwd) {
    // EXAMPLE CODE!
    return (this.password === pwd);
};

var PlaceObject = new Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    lat: { type: Number }, //широта
    lon: { type: Number }, //долгота
    comments: { type: Array },
    address: { type: String },
    rating: {type: Number },
    explanations: {type: Array },
    description: { type: String, required: true },
    modified: { type: Date, default: Date.now }
});

var DocumentObject = new Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    description: { type: String, required: true },
    modified: { type: Date, default: Date.now }
});

///
var PlaceObjectModel = mongoose.model('PlaceObject', PlaceObject);
module.exports.PlaceObjectModel = PlaceObjectModel;
///
var UserModel = mongoose.model('User', User);
module.exports.UserModel = UserModel;
///
var DocumentObjectModel = mongoose.model('DocumentObject', DocumentObject);
module.exports.DocumentObjectModel = DocumentObjectModel;

var app = express();

var passport = require('passport'), LocalStrategy = require('passport-local').Strategy;

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());

app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.session({ secret: 'keyboard cat' }));
app.use(passport.initialize());
app.use(passport.session());

app.use(app.router);
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

passport.use(new LocalStrategy(
  function (username, password, done) {
    UserModel.findOne({ username: username }, function (err, user) {
        if (err) { return done(err); }
        if (!user) {
            return done(null, false, { message: 'Incorrect username.' });
        }
        if (!user.validPassword(password)) {
            return done(null, false, { message: 'Incorrect password.' });
        }
        return done(null, user);
    });
}
));

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    UserModel.findById(id, function (err, user) {
        done(err, user);
    });
});

app.get('/login', function (req, res) {
    res.render('login', { title: 'Вход', year: new Date().getFullYear() });
});

app.get('/register', function (req, res) {
    res.render('register', { title: 'Регистрация', year: new Date().getFullYear() });
});

app.get('/logout', function (req, res) {
    res.render('logout', { title: 'Выход', year: new Date().getFullYear() });
});

app.get('/profile/:id', function (req, res) {
    var id = req.params.id;
    UserModel.findById(id, function(err, user) {
        res.render('user', { title: 'Профиль', year: new Date().getFullYear(), profile: user, user: req.user });
    });
});

app.post('/login',
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    })
);

app.post('/register',
    passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/register',
    failureFlash: true
})
);

/*passport.use(new DigestStrategy({ qop: 'auth' },
  function (username, done) {
    User.findOne({ username: username }, function (err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false); }
        return done(null, user, user.password);
    });
},
  function (params, done) {
    // validate nonces as necessary
    done(null, true)
}
));*/

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/about', routes.about);
app.get('/contact', routes.contact);
app.get('/wp', routes.wp);
//get place list
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
        res.render('places', { title: 'Места', year: new Date().getFullYear(), places: places, user: req.user });
    });
});
app.get('/places/:id', function(req, res) {
    PlaceObjectModel.findById(req.params.id, function(err, place) {
        if (!place) {
            res.statusCode = 404;
            return res.send({ error: 'Not found' });
        }
        if (!err) {
            getCustomerData(place.title, function(result) {
                //return res.send({ status: 'OK', article: article });
                try {
                    console.log(result);
                    result = result.body;
                    result = JSON.parse(result);
                    result = result.customers.data[0];
                } catch(ex) {
                    result = {};
                }

                /*if (result.kpp !== null) {
                    getContractsByKpp(result.kpp, function(resultkpp) {
                        try {
                            contracts = resultkpp.body;
                            contracts = JSON.parse(contracts);
                            //contracts = contracts;
                        } catch (ex) {
                            contracts = {};
                        }
                        res.render('place', {
                            title: place.title, year: new Date().getFullYear(), place: place, 
                            result: result, contracts: contracts
                        }); 
                    })
                } else {*/
                    var contracts = {};
                    res.render('place', {
                        title: place.title, year: new Date().getFullYear(), place: place, 
                        result: result, contracts: contracts, user: req.user
                    }); 
                //}
            });
        } else {
            res.statusCode = 500;
            console.log('Internal error(%d): %s', res.statusCode, err.message);
            return res.send({ error: 'Server error' });
        }
    })
});

app.get('/documents', routes.documents);
app.get('/places_map', function (req, res) {
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
        res.render('places_map', { title: 'Карта мест', year: new Date().getFullYear(), places: places, user: req.user });
    });
});

app.get('/places_add', function (req, res) {
    res.render('places_add', { title: "Добавить место", year: new Date().getFullYear(), message: 'Добавление места', user: req.user });
});



var place_post_add = function (req, res) {
    var author = "Guest";
    var userId = null;
    if ((req.user !== null) && (req.user!==undefined)) {
        author = req.user.username;
        userId = req.user.id;
    }
    var place = new PlaceObjectModel({
        title: req.body.title,
        author: author,
        authorId: userId,
        lat: req.body.lat,
        lon: req.body.lon,
        address: req.body.address,
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

//add new explanation for place
var place_explanation_post_add = function (req, res) {
    var author = "Guest";
    var userId = null;
    var email = null;
    if ((req.user !== null) && (req.user !== undefined)) {
        author = req.user.username;
        userId = req.user.id;
        email = req.user.email;
    }
    var placeId = req.body.placeId;

    var item = {};
    item.author = author;
    item.authorId = userId;
    item.text = req.body.text;
    item.email = email;
    item.contract = req.body.contract;

    PlaceObjectModel.update({ _id: placeId }, { $push: { explanations: item } }, { upsert: true }, function (err) {
        if (err) {
            console.log(err);
            return res.error(err.message);
        } else {
            return res.send({ status: 'OK', explanation: item });
            console.log("Successfully added");
        }
    });
}

app.post('/places/add', place_post_add);
app.post('/places/explanations/add', place_explanation_post_add);

app.get('/api/places', function (req, res) {
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

app.get('/api/contracts/:kpp/:inn', function (req, res) {
    var kpp = req.params.kpp;
    var inn = req.params.inn;
    getContractsByKpp(kpp, inn, function(result) {
        res.send({ status: 'OK', contracts: result });
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





///clearspending functions
function getCustomerData(title, callback) {
    console.log("getCustomerData");
    unirest.get("https://clearspending.p.mashape.com/v1/customers/search/?namesearch="+title)
.header("X-Mashape-Key", "Wt2c6HvjbsmshIldTsNHkq6qLE0xp1FTOpTjsnMxKmKbHNZ3u9")
.end(function (result) {
        console.log(result.status, result.headers, result.body);
        callback(result);
    });
}

///
function getContractsByKpp(kpp, inn, callback) {
    unirest.get("https://clearspending.p.mashape.com/v1/contracts/select/?customerkpp="+kpp+"&customerinn="+inn)
.header("X-Mashape-Key", "Wt2c6HvjbsmshIldTsNHkq6qLE0xp1FTOpTjsnMxKmKbHNZ3u9")
.end(function (result) {
        try {
            console.log(result.status, result.headers, result.body);
            var contracts = result.body;
            contracts = JSON.parse(contracts);
            callback(contracts);
        } catch (ex) {
            callback({});
        }
    });
}
