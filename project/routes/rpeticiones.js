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
        var peticion = {
            usuario : req.session.usuario,
            IdDestino : usuarioId
        }

        gestorBD.obtenerUsuariosPg( criterio, pg, function (usuarios, total) {
            if (usuarios==null){
                res.send("Error al buscar los usuarios.")
            } else {
                var criterio2 = {
                    "usuario" : req.session.usuario
                }
                gestorBD.obtenerPeticionesMandadas(criterio2, function (peticiones) {
                    var pgUltima = total / 5;
                    if (total % 4 > 0) { // Sobran decimales
                        pgUltima = pgUltima + 1;
                    }
                    var respuesta = swig.renderFile('views/bListUsers.html', {
                        "usuarios": usuarios,
                        "peticiones" : peticiones,
                        "petiSize" : peticiones.length,
                        "encontrado" : false,
                        pgActual: pg,
                        pgUltima: pgUltima,
                        "sesion": req.session.usuario
                    });
                    res.send(respuesta);
                });
            }
        });
    });
}