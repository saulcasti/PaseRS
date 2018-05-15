module.exports = function(app, swig, gestorBD) {

    app.get('/peticion/mandar/:id', function (req, res) {

        var usuarioIdDestino = gestorBD.mongo.ObjectID(req.params.id);
        var sessionId = gestorBD.mongo.ObjectID(req.session.usuarioId);

        gestorBD.obtenerObjetos({_id: sessionId}, 'usuarios', function (usuarios) {
            var peticion = {
                usuario : req.session.usuario,
                nombre: usuarios[0].nombre,
                apellido: usuarios[0].apellido,
                IdDestino : usuarioIdDestino
            }
            gestorBD.insertarObjeto(peticion, 'peticiones', function(idPeticion){
                if ( idPeticion == null ){
                    res.send(respuesta);
                } else {
                    res.redirect("/user/list?mensaje=Petición Mandada");
                }
            });
        });
    });

    app.get('/peticion/aceptar/:id', function (req, res) {
        var peticionId = gestorBD.mongo.ObjectID(req.params.id);
        var criterio = {
            _id : peticionId
        }
        gestorBD.obtenerObjetos(criterio, 'peticiones', function(peticion){
            if ( peticion == null || peticion.length == 0){
                res.send("/user/list" +
                    "?mensaje=Ha ocurrido un error");
            } else {
                var criterio = {$or : [
                        {"email" : peticion[0].usuario},
                        {"email" : req.session.usuario}
                ]}
                gestorBD.obtenerObjetos(criterio, 'usuarios', function (usuarios) {
                    if ( usuarios == null || usuarios.length != 2){
                        res.send("/user/list" +
                            "?mensaje=Ha ocurrido un error");
                    } else {
                        var amistad = {
                            amigo1: usuarios[0],
                            amigo2: usuarios[1]
                        }
                        gestorBD.crearAmistad(amistad, peticion, function(id){
                            if (id == null) {
                                res.redirect("/user/friendsList?mensaje=Error al haceros Amigos");
                            } else {
                                res.redirect("/user/friendsList?mensaje=Petición Aceptada");
                            }
                        });
                    }
                });
            }
        });
    });

    app.get("/peticion/list", function (req, res) {
        var pg = (req.query.pg == null) ? 1 : parseInt(req.query.pg); //Es String!!
        var criterio = {
            IdDestino: gestorBD.mongo.ObjectID(req.session.usuarioId)
        }
        gestorBD.obtenerObjetosPg(criterio, pg, 'peticiones', function (peticiones, total) {
            var pgUltima = total / 5;
            if (total % 5 > 0) { // Sobran decimales
                pgUltima = pgUltima + 1;
            }
            pgUltima = (pgUltima==0) ? 1 : pgUltima;
            if (peticiones == null) {
                res.send("Error al buscar las peticiones.")
            } else {
                var respuesta = swig.renderFile('views/bRequestList.html', {
                    "peticiones": peticiones,
                    pgActual: pg,
                    pgUltima: pgUltima,
                    "sesion": req.session.usuario
                });
                res.send(respuesta);
            }
        });
    });
}