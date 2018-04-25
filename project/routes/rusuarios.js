module.exports = function(app, swig, gestorBD) {

    app.post('/usuario', function(req, res) {
        var passwords = {
            password1: req.body.password,
            password2: req.body.passwordConfirm
        }
        var criterio = {
            email : req.body.email
        }
        gestorBD.obtenerUsuarios(criterio, function(usuarios){
            if (usuarios != null && usuarios.length > 0){
                res.redirect("/signup?mensaje=Ya existe un usuario con ese email");
            } else {
                if (passwords.password1 != passwords.password2) {
                    res.redirect("/signup?mensaje=Las passwords no coinciden");
                } else {
                    var seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
                        .update(req.body.password).digest('hex');
                    var usuario = {
                        email: req.body.email,
                        nombre: req.body.name,
                        apellido: req.body.lastName,
                        password: seguro
                    }
                    gestorBD.insertarUsuario(usuario, function (id) {
                        if (id == null) {
                            res.redirect("/signup?mensaje=Error al registrar usuario");
                        } else {
                            res.redirect("/login?mensaje=Nuevo usuario registrado");
                        }
                    });
                }
            }
        });
    });

    app.get("/user/list", function (req, res) {
        var pg = (req.query.pg == null) ? 1 : parseInt(req.query.pg); //Es String!!
        var criterio = (req.query.busqueda == null) ? {} : {$or : [ // Coincidencia en nombre o email
            { "nombre" : {$regex : ".*"+req.query.busqueda+".*"}},
            { "email" : {$regex : ".*"+req.query.busqueda+".*"} }]
        };

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
        gestorBD.obtenerUsuarios(criterio, function(usuarios) {
            if (usuarios == null || usuarios.length == 0) {
                req.session.usuario = null;
                res.redirect("/login" +
                    "?mensaje=Email o password incorrecto"+
                    "&tipoMensaje=alert-danger ");
            } else {
                req.session.usuario = usuarios[0].email;
                res.redirect("/user/list");
            }
        });
    });

    app.get('/logout', function (req, res) {
        req.session.usuario = null;
        res.redirect("/login?mensaje=Sesión cerrada");
    });
};