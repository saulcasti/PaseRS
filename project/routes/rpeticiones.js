module.exports = function(app, swig, gestorBD) {

    app.get('/peticion/mandar/:id', function (req, res) {
        var usuarioId = gestorBD.mongo.ObjectID(req.params.id);
        var peticion = {
            usuario : req.session.usuario,
            IdDestino : usuarioId
        }
        gestorBD.mandarPeticion(peticion ,function(idPeticion){
            if ( idPeticion == null ){
                res.send(respuesta);
            } else {
                res.redirect("/user/list?mensaje=Petición Mandada");
            }
        });
    });

    app.get("/request/list", function (req, res) {
        var pg = (req.query.pg == null) ? 1 : parseInt(req.query.pg); //Es String!!
        var criterio = {
            IdDestino: gestorBD.mongo.ObjectID(req.session.usuarioId)
        }
        gestorBD.obtenerUsuariosPg({"_id":criterio.IdDestino}, pg, function (usuarios) {
            if (usuarios == null || usuarios.length == 0) {
                res.redirect("/user/list" +
                    "?mensaje=Ha ocurrido un error");
            } else {
                gestorBD.obtenerPeticionesMandadas(criterio, function (peticiones, total) {
                    var pgUltima = total / 5;
                    if (total % 5 > 0) { // Sobran decimales
                        pgUltima = pgUltima + 1;
                    }
                    if (peticiones == null) {
                        res.send("Error al buscar los usuarios.")
                    } else {
                        var respuesta = swig.renderFile('views/bRequestList.html', {
                            "peticiones": peticiones,
                            "nombre": usuarios[0].nombre,
                            "apellidos": usuarios[0].apellido,
                            pgActual: pg,
                            pgUltima: pgUltima,
                            "sesion": req.session.usuario
                        });
                        res.send(respuesta);
                    }
                });
            }
        });
    });
}