// Módulos
var express = require('express');
var app = express();

var jwt = require('jsonwebtoken');
app.set('jwt',jwt);

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



// routerUsuarioToken
var routerUsuarioToken = express.Router();
routerUsuarioToken.use(function(req, res, next) {
    // obtener el token, puede ser un parámetro GET , POST o HEADER
    var token = req.body.token || req.query.token || req.headers['token'];
    if (token != null) {
        // verificar el token
        jwt.verify(token, 'secreto', function(err, infoToken) {
            if (err || (Date.now()/1000 - infoToken.tiempo) > 240 ){
                res.status(403); // Forbidden
                res.json({
                    acceso : false,
                    error: 'Token invalido o caducado'
                });
                // También podríamos comprobar que intoToken.usuario existe
                return;

            } else {
                // dejamos correr la petición
                res.usuario = infoToken.usuario;
                next();
            }
        });

    } else {
        res.status(403); // Forbidden
        res.json({
            acceso : false,
            mensaje: 'No hay Token'
        });
    }
});
// Aplicar routerUsuarioToken
// ????????  de momento no hay ninguno ????????



// routerUsuarioSession
var routerUsuarioSession = express.Router();
routerUsuarioSession.use(function(req, res, next) {
    console.log("routerUsuarioSession");
    if ( req.session.usuario ) {
        // dejamos correr la petición
        next();
    } else {
        res.redirect("/login");
    }
});
// Aplicar routerUsuarioSession
app.use("/user/list",routerUsuarioSession);
app.use("/user/friendsList",routerUsuarioSession);
app.use("/peticion/mandar/*",routerUsuarioSession);
app.use("/peticion/aceptar/*",routerUsuarioSession);
app.use("/request/list",routerUsuarioSession);



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
require("./routes/rpeticiones.js")(app, swig, gestorBD);
require("./routes/rapiusuarios.js")(app, gestorBD);



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