module.exports = function(app, swig, gestorBD) {

    app.post('/usuario', function(req, res) {
        var registerInfo = {
            email: req.body.email,
            name: req.body.name,
            lastName: req.body.lastName,
            password1: req.body.password,
            password2: req.body.passwordConfirm
        }
        var criterio = {
            email : req.body.email
        }
        gestorBD.obtenerObjetos(criterio, 'usuarios', function(usuarios){
            if (usuarios != null && usuarios.length > 0) {
                res.redirect("/signup?mensaje=Ya existe un usuario con ese email" +
                    "&tipoMensaje=alert-danger ");
            } else if (registerInfo.name.length <= 1) {
                res.redirect("/signup?mensaje=Nombre demasiado corto" +
                    "&tipoMensaje=alert-danger ");
            } else if (registerInfo.lastName.length < 2) {
                res.redirect("/signup?mensaje=Apellido demasiado corto" +
                    "&tipoMensaje=alert-danger ");
            } else if (registerInfo.email.length < 5) {
                res.redirect("/signup?mensaje=Email demasiado corto" +
                    "&tipoMensaje=alert-danger ");
            } else if (registerInfo.password1.length < 4) {
                res.redirect("/signup?mensaje=Password demasiado corta" +
                    "&tipoMensaje=alert-danger ");
            } else if (registerInfo.password1 != registerInfo.password2) {
                res.redirect("/signup?mensaje=Las passwords no coinciden" +
                    "&tipoMensaje=alert-danger ");
            } else {
                var seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
                    .update(req.body.password).digest('hex');
                var usuario = {
                    email: req.body.email,
                    nombre: req.body.name,
                    apellido: req.body.lastName,
                    password: seguro
                }
                gestorBD.insertarObjeto(usuario, 'usuarios', function (id) {
                    if (id == null) {
                        res.redirect("/signup?mensaje=Error al registrar usuario");
                    } else {
                        res.redirect("/login?mensaje=Nuevo usuario registrado");
                    }
                });
            }
        });
    });

    app.get("/user/list", function (req, res) {
        var pg = (req.query.pg == null) ? 1 : parseInt(req.query.pg); //Es String!!
        var criterio = (req.query.busqueda == null) ? {} : {$or : [ // Coincidencia en nombre o email
            { "nombre" : {$regex : ".*"+req.query.busqueda+".*"}},
            { "email" : {$regex : ".*"+req.query.busqueda+".*"} }]
        };

        gestorBD.obtenerObjetosPg( criterio, pg, 'usuarios', function (usuarios, total) { //Obtengo todos los usuarios
            if (usuarios==null){
                res.send("Error al buscar los usuarios.")
            } else {
                var criterio2 = {
                    "usuario" : req.session.usuario
                }
                gestorBD.obtenerObjetos(criterio2, 'peticiones', function (peticiones) {
                    if (peticiones==null){
                        res.send("Error al buscar las peticiones");
                    } else {
                        var id = gestorBD.mongo.ObjectID(req.session.usuarioId);
                        var criterio3 = {$or : [ // Coincidencia en amistad 1 o 2
                                { "amigo1._id" : id},
                                { "amigo2._id" : id}]
                        };
                        gestorBD.obtenerObjetos(criterio3, 'amistades', function (amistades) {
                            if (amistades==null){
                                res.send("Error al buscar los amigos.")
                            } else {
                                var amigos = [];

                                for (i = 0; i<amistades.length; i++){
                                    if (amistades[i].amigo1._id.toString()== req.session.usuarioId){
                                        amigos.push(amistades[i].amigo2);
                                    } else if (amistades[i].amigo2._id.toString()==req.session.usuarioId) {
                                        amigos.push(amistades[i].amigo1);
                                    }
                                }
                                var seguirAmigos = true;
                                var seguirAmistades = true;

                                for (i=0; i<usuarios.length; i++){
                                    seguirAmigos = true;
                                    for (j=0; j<amigos.length; j++){
                                        if (seguirAmigos) {
                                            if (usuarios[i]._id.toString() == amigos[j]._id.toString()) {
                                                usuarios[i].esAmigo = true;
                                                seguirAmigos = false;
                                            } else {
                                                usuarios[i].esAmigo = false;
                                            }
                                        }
                                    }
                                    seguirAmistades = true;
                                    for (z=0; z<peticiones.length; z++){
                                        if (seguirAmistades) {
                                            if (usuarios[i]._id.toString() == peticiones[z].IdDestino.toString()) {
                                                usuarios[i].tienePeticion = true;
                                                seguirAmistades = false;
                                            } else {
                                                usuarios[i].tienePeticion = false;
                                            }
                                        }
                                    }
                                }

                                var pgUltima = total / 5;
                                if (total % 5 > 0) { // Sobran decimales
                                    pgUltima = pgUltima + 1;
                                }

                                var respuesta = swig.renderFile('views/bListUsers.html', {
                                    "usuarios": usuarios,
                                    pgActual: pg,
                                    pgUltima: pgUltima,
                                    "sesion": req.session.usuario
                                });
                                res.send(respuesta);
                            }
                        });
                    }
                });
            }
        });
    });

    app.get("/user/friendsList", function (req, res) {
        var pg = (req.query.pg == null) ? 1 : parseInt(req.query.pg); //Es String!!
        var userId = gestorBD.mongo.ObjectID(req.session.usuarioId);
        var criterio = {$or : [ // Coincidencia en amistad 1 o 2
                { "amigo1._id" : userId},
                { "amigo2._id" : userId}]
        };

        gestorBD.obtenerObjetosPg( criterio, pg, 'amistades',function (amistades, total) {
            if (amistades==null){
                res.send("Error al buscar las amistades.")
            } else {
                var pgUltima = total / 5;
                if (total % 5 > 0) { // Sobran decimales
                    pgUltima = pgUltima + 1;
                }
                var amigos = [];

                for (i = 0; i<amistades.length; i++){
                    if (amistades[i].amigo1._id.toString()== req.session.usuarioId){
                        amigos.push(amistades[i].amigo2);
                    } else if (amistades[i].amigo2._id.toString()==req.session.usuarioId) {
                        amigos.push(amistades[i].amigo1);
                    }
                }
                var respuesta = swig.renderFile('views/bListFriends.html', {
                    "amigos" : amigos,
                    pgActual: pg,
                    pgUltima: pgUltima,
                    "sesion": req.session.usuario
                });
                res.send(respuesta);
            }
        });
    });

    app.get("/signup", function(req, res) {
        var respuesta = swig.renderFile('views/bregistro.html', {
            "sesion": req.session.usuario
        });
        res.send(respuesta);
    });

    app.get("/login", function(req, res) {
        var respuesta = swig.renderFile('views/blogin.html', {
            "sesion": req.session.usuario
        });
        res.send(respuesta);
    });

    app.post("/login", function(req, res) {
        var seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');
        var criterio = {
            email : req.body.email,
            password : seguro
        }
        gestorBD.obtenerObjetos(criterio, 'usuarios', function(usuarios) {
            if (usuarios == null || usuarios.length == 0) {
                req.session.usuario = null;
                res.redirect("/login" +
                    "?mensaje=Email o password incorrecto"+
                    "&tipoMensaje=alert-danger ");
            } else {
                req.session.usuario = usuarios[0].email;
                req.session.usuarioId = usuarios[0]._id;
                res.redirect("/user/list");
            }
        });
    });

    app.get('/logout', function (req, res) {
        req.session.usuario = null;
        res.redirect("/login?mensaje=Sesión cerrada");
    });

    app.get('/borrarPruebas/:usuario', function (req, res) {
        var criterioUsuario = {
            email: req.params.usuario
        }
        var criterioAmistad = {$or : [ // Coincidencia en amistad 1 o 2
                { "amigo1.email" : req.params.usuario},
                { "amigo2.email" : req.params.usuario}]
        }

        gestorBD.borrarPruebas(criterioUsuario, criterioAmistad, function (resultado) {
            res.redirect("/login");
        });
    });
};