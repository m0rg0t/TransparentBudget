
/*
 * GET home page.
 */

exports.index = function (req, res) {
    res.render('index', { title: 'Прозрачный бюджет', year: new Date().getFullYear(), user: req.user });
};

exports.about = function (req, res) {
    res.render('about', { title: 'О проекте', year: new Date().getFullYear(), message: 'Your application description page.' });
};

exports.contact = function (req, res) {
    res.render('contact', { title: 'Контакты', year: new Date().getFullYear(), message: 'Your contact page.', user: req.user });
};

exports.places = function (req, res) {
    res.render('places', { title: 'Места', year: new Date().getFullYear(), message: 'Your places page.', user: req.user });
};

exports.documents = function (req, res) {
    res.render('documents', { title: 'Документы', year: new Date().getFullYear(), message: 'Your documents page.', user: req.user });
};

/*exports.places_map = function (req, res) {
    res.render('places_map', { title: 'Карта мест', year: new Date().getFullYear(), message: 'Карта мест' });
};*/

exports.places_add = function(req, res) {
    res.render('places_add', { title: "Добавить место", year: new Date().getFullYear(), message: 'Добавление места', user: req.user});
}

