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
    app.get("/api/user/friendsList", function (req, res) {

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
                    } else if (amistades[i].email==emailUser) {
                        amigos.push(amistades[i].amigo1);
                    }
                }

                res.status(200);
                res.send(JSON.stringify(amigos));
            }
        });
    });

}