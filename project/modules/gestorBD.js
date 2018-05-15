module.exports = {
    mongo: null,
    app: null,
    init: function (app, mongo) {
        this.mongo = mongo;
        this.app = app;
    },

    obtenerObjetos : function(criterio, coleccion, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection(coleccion);
                collection.find(criterio).toArray(function (err, resultado) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(resultado);
                    }
                    db.close();
                });
            }
        });
    },
    obtenerObjetosPg : function(criterio, pg, coleccion, funcionCallback){
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection(coleccion);
                collection.count(function(err, count){
                    collection.find(criterio).skip( (pg-1)*5 ).limit( 5 )
                        .toArray(function(err, resultado) {
                            if (err) {
                                funcionCallback(null);
                            } else {
                                funcionCallback(resultado, count);
                            }
                            db.close();
                        });
                });
            }
        });
    },
    /**
     * Creado para API
     * @param criterio
     * @param funcionCallback
     */
    obtenerObjetosYContar : function(criterio, coleccion, funcionCallback){
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection(coleccion);
                collection.count(function(err, count){
                    collection.find(criterio)
                        .toArray(function(err, resultado) {
                            if (err) {
                                funcionCallback(null);
                            } else {
                                funcionCallback(resultado, count);
                            }
                            db.close();
                        });
                });
            }
        });
    },
    crearAmistad : function(amistad, peticion,funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('amistades');
                collection.insert(amistad, function (err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        var result = result.ops[0]._id;
                        collection = db.collection("peticiones");
                        collection.remove({"_id" : peticion[0]._id}, function (err, db) {
                            if (err) {
                                funcionCallback(null);
                            } else {
                                funcionCallback(result);
                            }
                        })
                    }
                    db.close();
                });
            }
        });
    },
    modificarMensaje: function (criterio, mensaje, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('mensajes');
                collection.update(criterio, {$set: mensaje}, function (err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result);
                    }
                    db.close();
                });
            }
        });
    },
    borrarPruebas: function (criterioUsuario, criterioAmistad, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection("usuarios");
                collection.remove(criterioUsuario, function (err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        collection = db.collection("amistades");
                        collection.remove(criterioAmistad, function (err, result) {
                            if (err) {
                                funcionCallback(null);
                            } else {
                                funcionCallback("correcto");
                            }
                        });
                    }
                });
            }
        });
    },
    insertarObjeto : function(usuario, coleccion, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection(coleccion);
                collection.insert(usuario, function (err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result.ops[0]._id);
                    }
                    db.close();
                });
            }
        });
    }
};

