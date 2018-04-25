// Módulos
var express = require('express');
var app = express();


var expressSession = require('express-session');

app.use(expressSession({
    secret: 'abcdefg',
    resave: true,
    saveUninitialized: true
}));

var crypto = require('crypto');

var fileUpload = require('express-fileupload');
app.use(fileUpload());
var mongo = require('mongodb');

//Motor de plantillas
var swig = require('swig');

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var gestorBD = require("./modules/gestorBD.js");
gestorBD.init(app,mongo);


//Nunca meter las vistas en public, causa problemas de seguridad
app.use(express.static('public'));

//Variables
app.set('port', 8081);
//app.set('db', 'mongodb://admin:sdi@ds253959.mlab.com:53959/paseapp');
app.set('db', 'mongodb://admin:sdi@ds155699.mlab.com:55699/pasedb');
app.set('clave','abcdefg');
app.set('crypto',crypto);

//Rutas/controladores por lógica
require("./routes/rusuarios.js")(app, swig, gestorBD);

app.get('/', function (req, res) {
    var respuesta = swig.renderFile('views/base.html', {
        "sesion": req.session.usuario
    });
    res.send(respuesta);
});

app.use( function (err, req, res, next ) {
    console.log("Error producido: " + err); //we log the error in our db
    if (! res.headersSent) {
        res.status(400);
    }
    res.send("Recurso no disponible");
});
// lanzar el servidor
app.listen(app.get('port'), function() {
    console.log("Servidor activo");
});