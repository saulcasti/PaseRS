module.exports = function(app, gestorBD) {


    /**
	 * Servicio Web - S.1. Identificarse con usuario - token
     *
     *  (( Ha sido necesario instalar el módulo jsonwebtoken ))
     */
	app.post("/api/login", function(req, res) {
		 var seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
		    .update(req.body.password).digest('hex');
		 var criterio = {
             email : req.body.email,
             password : seguro
		 }

		 gestorBD.obtenerUsuarios(criterio, function(usuarios) {
		 if (usuarios == null || usuarios.length == 0) {
             res.status(401); // Unauthorized
             res.json({
             autenticado : false
             })
		 } else {
			 var token = app.get('jwt').sign(
					 {
                         usuario: criterio.email ,
                         tiempo: Date.now()/1000
                     },
                 "secreto");
             res.status(200);
             res.json({
                 autenticado: true,
                 token : token
             });
		 }

		 });
	});


    /**
     * Servicio Web - S.2 Usuario identificado: listar todos los amigos
     *
     *  (( Ha sido necesario añadir un nuevo route, de nombre routerUsuarioToken, en la app.js ))
     */
    app.get("/api/friendsList", function (req, res) {

        //var userMail = res.usuario;
        var emailUser = res.usuario;
        var criterio = {$or : [ // Coincidencia en amistad 1 o 2
                { "amigo1.email" : emailUser},
                { "amigo2.email" : emailUser}]
        };

        gestorBD.obtenerAmistades( criterio, function (amistades, total) {
            if (amistades==null){
                res.status(500);
                res.json({error: "Se ha producido un error"})
            } else {
                var amigos = [];

                for (i = 0; i<amistades.length; i++){
                    if (amistades[i].amigo1.email== emailUser){
                        amigos.push(amistades[i].amigo2);
                    } else if (amistades[i].amigo2.email==emailUser) {
                        amigos.push(amistades[i].amigo1);
                    }
                }

                res.status(200);
                res.send(JSON.stringify(amigos));
            }
        });
    });

    app.post("/api/mensaje", function (req, res) {
        var mensaje = {
            emisor: res.usuario,
            leido: false
        }
        if (req.body.destino != null)
            mensaje.destino = req.body.destino;
        if (req.body.text != null)
            mensaje.text = req.body.text;

        var criterio = {
            $or: [
                {
                    $and: [{"amigo1.email": mensaje.destino},
                        {"amigo2.email": mensaje.emisor}]
                },
                {
                    $and: [{"amigo1.email": mensaje.emisor},
                        {"amigo2.email": mensaje.destino}]
                }]
        };

        gestorBD.obtenerAmistades( criterio, function (amistades, total) {
            if (amistades==null){
                res.status(500);
                res.json({error: "No sois amigos"})
            } else {
                gestorBD.crearMensaje(mensaje, function(id){
                    if (id==null) {
                        res.status(500);
                        res.json({error: "Se ha producido un error"})
                    } else {
                        res.status(201);
                        res.send(JSON.stringify(mensaje));
                    }
                });
            }
        });
    });

    app.get("/api/mensaje/:idEmisor/:idReceptor", function (req, res){
        var idEmisor = gestorBD.mongo.ObjectID(req.params.idEmisor);
        var idReceptor = gestorBD.mongo.ObjectID(req.params.idReceptor);

        var criterio = {$or : [ // Coincidencia en amistad 1 o 2
                { "_id" : idEmisor},
                { "_id" : idReceptor}]
        };

        gestorBD.obtenerUsuarios(criterio, function(usuarios){
            if (usuarios==null || usuarios.length==0){
                res.status(500);
                res.json({error: "No se han encontrado los usuarios"});
            } else {
                criterio = {
                    $or: [
                        {
                            $and: [{"emisor":usuarios[0].email},
                                {"destino": usuarios[1].email}]
                        },
                        {
                            $and: [{"emisor":usuarios[1].email},
                                {"destino": usuarios[0].email}]
                        }]
                };
                gestorBD.obtenerMensajes(criterio, function (mensajes) {
                   if (mensajes==null){
                       res.status(500);
                       res.json({error: "No se han encontrado mensajes"});
                   } else {
                       res.status(200);
                       res.send(JSON.stringify(mensajes));
                   }
                });
            }
        });
    });

    app.put("/api/mensaje/:id", function (req, res){
        var criterio = { "_id": gestorBD.mongo.ObjectID(req.params.id)}

        var mensaje = {leido : true}
        
        gestorBD.modificarMensaje(criterio, mensaje, function (result) {
            if (result==null){
                res.status(500);
                res.json({error: "No se ha encontrado el mensaje"});
            } else {
                res.status(200);
                res.json({
                    mensaje : "mensaje modificado",
                    _id : req.params.id
                });
            }
        });
    });
}