// Módulos
var express = require('express');
var app = express();


//Motor de plantillas
var swig = require('swig');

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


//Nunca meter las vistas en public, causa problemas de seguridad
app.use(express.static('public'));

//Variables
app.set('port', 8081);

// lanzar el servidor
app.listen(app.get('port'), function() {
    console.log("Servidor activo");
});