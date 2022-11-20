// Para hacer este server he usado lo que explican aqui
// ttps://www.digitalocean.com/community/tutorials/setting-up-a-node-project-with-typescript
// Me interesaba hacerlo en Typescript
// No obstante, el server que explican en ese tutorial no usa sockets.
// He usado tambien la info que hay aqui:

// https://codingblast.com/chat-application-angular-socket-io/

// para incorporar la comunicación via sockets. Es la que use para el tutorial sobre el
// chat que esta en los videos de las herramientas de classpip

import axios from "axios";
import express from "express";
import http from "http";
import { PeticionesAPIService } from "./peticionesAPI";

// tslint:disable-next-line:ordered-imports
import { connectableObservableDescriptor } from "rxjs/internal/observable/ConnectableObservable";
import socketIO from "socket.io";

// const configMensaje = require('./);
const cors = require("cors");
const bodyParser = require("body-parser");
// const configMensaje = require('./configMensaje');

const app = express();

app.use(bodyParser.json());
app.use(cors());

const server = new http.Server(app);
const io = socketIO(server);
const peticionesAPI = new PeticionesAPIService();

const port = 8200;
// const port = 8200;

let dashSocket;

let alumnosConectados: any[] = [];

let registroNotificacionesJuegos: any[] = [];
let socketsDashboards: any[] = [];
let nicksUsados: any[] = [];


//Lista de Notificaciones Pendientes (guardadas en memoria del Servidor)
const notificacionesPendientes: any[] = []; //{ alumnoID, mensaje }

// try {
//     axios.get().then ((respuesta) => {
//       console.log (respuesta.data);
//     });
// } catch {
//     console.log ("Error");
// }





const conectados: any[] = [];


io.on("connection", (socket) => {

    socket.on("forceDisconnect", () => {
        console.log("Se ha desconectado alguien");
        // Quitamos el socket de las listas de sockets de profes y de alumnos
        socketsDashboards = socketsDashboards.filter  ((elem) => elem.s !== socket);
        alumnosConectados = alumnosConectados.filter ((elem) => elem.soc !== socket);
        socket.disconnect();
    });
    socket.on("disconnect", () => {
        console.log("Se ha desconectado alguien");
        // Quitamos el socket de las listas de sockets de profes y de alumnos
        socketsDashboards = socketsDashboards.filter  ((elem) => elem.s !== socket);
        alumnosConectados = alumnosConectados.filter ((elem) => elem.soc !== socket);
        socket.disconnect();
    });

    // Conexion/desconexión Dashboard
    socket.on("conectarDash", (profesorId) => {
        console.log("Se ha conectado el dashboard");
        socketsDashboards.push ({
            s: socket,
            // tslint:disable-next-line:object-literal-sort-keys
            pId: profesorId,
        });
    });
    // socket.on("desconectarDash", (profesorId) => {
    //     console.log("Se ha desconectado un dashboard");
    //     const profesor = socketsDashboards.filter ((elem) => elem.s === socket)[0];
    //     if (profesor) {
    //         const s = profesor.s;
    //         s.disconnect();
    //         socketsDashboards = socketsDashboards.filter ((elem) => elem.s !== s);
    //     }
    // });
    socket.on("desconectarDash", (profesorId) => {
        socketsDashboards = socketsDashboards.filter ((elem) => elem.s !== socket);
        socket.disconnect();
    });

    // Conexion/desconexión alumno

    socket.on("alumnoConectado", (alumno) => {
        console.log ("se conecta un alumno");
        console.log (alumno);

        if(!alumnosConectados.includes({id: alumno.id, soc: socket})){ //Para evitar conexiones repetidas (Reconexión por caída de red en dispositivos móviles)
            alumnosConectados.push ({id: alumno.id, soc: socket});
            
            //Comprobar si tiene notificaciones pendientes
            for (let i: number = 0; i < notificacionesPendientes.length; i++){
                if(notificacionesPendientes[i].alumnoID === alumno.id){
                    console.log("envio notificación al alumno " + notificacionesPendientes[i].alumnoID);
                    socket.emit("notificacion", notificacionesPendientes[i].mensaje);

                    //Eliminar la notificacion para que no le salga al Alumno cada vez que se conecta
                    notificacionesPendientes.splice(i, 1);
                }
            }
        }
    });

    // socket.on("alumnoDesconectado", (alumno) => {
    //     console.log ("se desconecta un alumno");
    //     console.log (alumno);
    //     const al = alumnosConectados.filter ((con) => con.soc === socket)[0];
    //     if (al) {
    //         const s = al.soc;
    //         s.disconnect();
    //         alumnosConectados = alumnosConectados.filter ((con) => con.soc !== s);
    //     }
    // });
    socket.on("alumnoDesconectado", (alumno) => {
        alumnosConectados = alumnosConectados.filter ((con) => con.soc !== socket);
        socket.disconnect();
    });

        // Juegos ràpidos
    socket.on("nickNameJuegoRapido", (datos) => {
            console.log("recibo nick");
            console.log(datos);
            console.log ('nicks usados', nicksUsados);
            // en datos tengo nick (en info) y profesorId
            if (nicksUsados.some ((elem) => elem.info === datos.info)) {
                // El nick está en uso
                socket.emit ("confirmacion nick", "nick usado");
            } else {
                socket.emit ("confirmacion nick", "nick admitido");
                nicksUsados.push (datos);
                const dash = socketsDashboards.filter((elem) => elem.pId === datos.profesorId);
                if (dash) {
                    console.log("envio notificacion");
                    // tslint:disable-next-line:max-line-length
                    dash.forEach((elem) => elem.s.emit("nickNameJuegoRapido", datos.info));
                }
            }
    });

    // Cuando en el juego rapido los alumnos reciben notificaciones se llama a esta función para que se registre el alumno
    socket.on("nickNameJuegoRapidoYRegistro", (datos) => {
            console.log("recibo nick");
            console.log(datos);
            if (nicksUsados.some ((elem) => elem.info === datos.info)) {
                // El nick está en uso
                socket.emit ("confirmacion nick", "nick usado");
            } else {
                socket.emit ("confirmacion nick", "nick admitido");
                nicksUsados.push (datos);
                // guardo el socket y la clave del juego
                registroNotificacionesJuegos.push({ soc: socket, c: datos.c });
                const dash = socketsDashboards.filter((elem) => elem.pId === datos.profesorId);
                if (dash) {
                    // tslint:disable-next-line:max-line-length
                    dash.forEach((elem) => elem.s.emit("nickNameJuegoRapido", datos.info));
                }
            }
    });

    // Cuando acabe el juego rapido el dash enviará este mensaje con profesorId para que limpiemos la lista de nicks de ese profe
    socket.on("finJuegoRapido", (profesorId) => {
        nicksUsados = nicksUsados.filter ((elem) => elem.profesorId !== profesorId);
    });


    socket.on("respuestaEncuestaRapida", (datos) => {

            const dash = socketsDashboards.filter((elem) => elem.pId === datos.profesorId);
            if (dash) {
                // tslint:disable-next-line:max-line-length
                dash.forEach((elem) => elem.s.emit("respuestaEncuestaRapida", datos.info));
            }
    });

    socket.on("desconectarJuegoCogerTurno", (clave) => {
            registroNotificacionesJuegos = registroNotificacionesJuegos.filter((elem) => elem.clave !== clave);
    });

    socket.on("recordarPassword", (email: string) => {
            peticionesAPI.EnviarEmail(email);
    });

    socket.on("enviarInfoRegistroAlumno", (datos) => {
            console.log("recibo peticion enviar info alumno ");
            peticionesAPI.EnviarEmailRegistroAlumno(datos.p, datos.a);
    });

    socket.on("respuestaJuegoDeCuestionario", (datos) => {
            console.log("recibo respuesta juengo cuestionario");
            console.log(datos);
            const dash = socketsDashboards.filter((elem) => elem.pId === datos.profesorId);
            console.log("voy a emitir respuesta");
            console.log(dash);
            if (dash) {
                // tslint:disable-next-line:max-line-length
                dash.forEach((elem) => elem.s.emit("respuestaJuegoDeCuestionario", datos.info));
            }
    });
        
    socket.on("respuestaEquipoJuegoDeCuestionario", (datos) => {
        console.log("recibo respuesta de equipo juego cuestionario");
        console.log(datos);
        const dash = socketsDashboards.filter((elem) => elem.pId === datos.profesorId);
        console.log("voy a emitir respuesta");
        console.log(dash);
        if (dash) {
            // tslint:disable-next-line:max-line-length
            dash.forEach((elem) => elem.s.emit("respuestaEquipoJuegoDeCuestionario", datos.info));
        }
    });

    socket.on("respuestaJuegoDeCuestionarioDeSatisfaccion", (datos) => {
            const dash = socketsDashboards.filter((elem) => elem.pId === datos.profesorId);

            if (dash) {
                // tslint:disable-next-line:max-line-length
                dash.forEach((elem) => elem.s.emit("respuestaJuegoDeCuestionarioDeSatisfaccion", datos.info));
            }
    });

    socket.on("modificacionAvatar", (datos) => {
            const dash = socketsDashboards.filter((elem) => elem.pId === datos.profesorId);
            if (dash) {
                // tslint:disable-next-line:max-line-length
                dash.forEach((elem) => elem.s.emit("modificacionAvatar", datos.info));
            }
    });

    socket.on("notificarVotacion", (datos) => {
            const dash = socketsDashboards.filter((elem) => elem.pId === datos.profesorId);
            if (dash) {
                // tslint:disable-next-line:max-line-length
                dash.forEach((elem) => elem.s.emit("notificarVotacion", datos.info));
            }
    });
    socket.on("notificarVotaciones", (datos) => {
            const dash = socketsDashboards.filter((elem) => elem.pId === datos.profesorId);
            if (dash) {
                // tslint:disable-next-line:max-line-length
                dash.forEach((elem) => elem.s.emit("notificarVotaciones", datos.info));
            }
    });

    socket.on("respuestaVotacionRapida", (datos) => {
            const dash = socketsDashboards.filter((elem) => elem.pId === datos.profesorId);
            if (dash) {
                // tslint:disable-next-line:max-line-length
                dash.forEach((elem) => elem.s.emit("respuestaVotacionRapida", datos.info));
            }
    });
    socket.on("respuestaVotacionAOpciones", (datos) => {
        const dash = socketsDashboards.filter((elem) => elem.pId === datos.profesorId);
        if (dash) {
            // tslint:disable-next-line:max-line-length
            dash.forEach((elem) => elem.s.emit("respuestaVotacionAOpciones", datos.info));
        }
    });

    socket.on("respuestaCuestionarioRapido", (datos) => {
            console.log("recibo respuesta cuestionario rapido");
            const dash = socketsDashboards.filter((elem) => elem.pId === datos.profesorId);
            if (dash) {
                // tslint:disable-next-line:max-line-length
                dash.forEach((elem) => elem.s.emit("respuestaCuestionarioRapido", datos.info));
            }

    });

    socket.on("turnoElegido", (datos) => {
            console.log("recibo turno elegido");
            const dash = socketsDashboards.filter((elem) => elem.pId === datos.profesorId);
            if (dash) {
                console.log("emito a " + dash.length);
                // tslint:disable-next-line:max-line-length
                dash.forEach((elem) => elem.s.emit("turnoElegido", datos.info));
            }

    });

    socket.on("'disconnect'", (res) => {
            console.log("Se desconecta el cliente ");

    });

        // Notificaciones para los alumnos

        // Notificación para alumnos de un juego rápido
    socket.on("notificacionTurnoCogido", (info) => {
            console.log("Recibo notificacion de turno cogido ", info.clave);
            // Saco los elementos de la lista correspondientes a los jugadores conectados a ese juego rápido
            const conectadosJuegoRapido = registroNotificacionesJuegos.filter((elem) => elem.c === info.clave);
            console.log("envio notificacion de turno cogido a " + conectadosJuegoRapido.length);
            conectadosJuegoRapido.forEach((conectado) => {
                console.log("envio notificacion de turno cogido a ");
                conectado.soc.emit("turnoCogido", info.turno);
            });
    });

        // Notificación para alumnos de un juego rápido
    socket.on("notificacionTurnoNuevo", (info) => {
            console.log("Recibo notificacion para juego rapido ", info.clave);
            // Saco los elementos de la lista correspondientes a los jugadores conectados a ese juego rápido
            const conectadosJuegoRapido = registroNotificacionesJuegos.filter((elem) => elem.c === info.clave);
            conectadosJuegoRapido.forEach((conectado) => {
                conectado.soc.emit("turnoNuevo", info.turno);
            });
    });

        // Notificación para un alumno
    socket.on("notificacionIndividual", (info) => {
        console.log("Recibo notificacion para alumno ", info);
        const conectado = alumnosConectados.filter ((con) => con.id === info.alumnoId)[0];
        if (conectado !== undefined) {
            console.log ("envio notificación al alumno " + info.alumnoId);
            conectado.soc.emit ("notificacion", info.mensaje);
        }
        else {
            //Guardar la notificación pendiente, para mostrarla cuando se vuelva a conectar
            notificacionesPendientes.push({ alumnoID: info.alumnoId, mensaje: info.mensaje });
            //console.log(info.mensaje, "\nNo llega al Alumno esta notificación porque está desconectado");
        }
    });

    // Notificaciones para los alumnos de un equipo
    socket.on("notificacionEquipo", (info) => {
        console.log("Recibo notificacion para equipo ", info);
        peticionesAPI.DameAlumnosEquipo (info.equipoId)
        .then ((res) => {
                const alumnos = res.data;
                console.log ("Alumnos del equipo");
                console.log (alumnos);
                alumnos.forEach((alumno) => {
                    const conectado = alumnosConectados.filter ((con) => con.id === alumno.id)[0];
                    if (conectado !== undefined) {
                        console.log ("envio notificación al alumno " + alumno.id);
                        conectado.soc.emit ("notificacion", info.mensaje);
                    }
                    else {
                        //Guardar la notificación pendiente, para mostrarla cuando se vuelva a conectar
                        notificacionesPendientes.push({ alumnoID: alumno.id, mensaje: info.mensaje });
                        //console.log(info.mensaje, "\nNo llega al Alumno esta notificación porque está desconectado");
                    }
                });
        });
    });

        // Notificaciones para los alumnos de un grupo
    socket.on("notificacionGrupo", (info) => {

        console.log("Recibo notificacion para el grupo ", info);
        peticionesAPI.DameAlumnosGrupo (info.grupoId)
        .then ((res) => {
                const alumnos = res.data;
                console.log ("Alumnos del grupo");
                console.log (alumnos);
                alumnos.forEach((alumno) => {
                    const conectado = alumnosConectados.filter ((con) => con.id === alumno.id)[0];
                    if (conectado !== undefined) {
                        console.log ("envio notificación al alumno " + alumno.id);
                        conectado.soc.emit ("notificacion", info.mensaje);
                    }
                    else {
                        //Guardar la notificación pendiente, para mostrarla cuando se vuelva a conectar
                        notificacionesPendientes.push({ alumnoID: alumno.id, mensaje: info.mensaje });
                        //console.log(info.mensaje, "\nNo llega al Alumno esta notificación porque está desconectado");
                    }
                });
        }).catch ((error) => {
            console.log ("error");
            console.log (error);

         });
     });

        // Para avanzar pregunta
    socket.on("avanzarPregunta", (info) => {
            console.log("Avanzar pregunta");
            console.log("Recibo notificacion para el grupo ", info);
            peticionesAPI.DameAlumnosGrupo(info.grupoId)
                .then((res) => {
                    const alumnos = res.data;
                    console.log("Alumnos del grupo");
                    console.log(alumnos);
                    alumnos.forEach((alumno) => {
                        const conectado = alumnosConectados.filter((con) => con.id === alumno.id)[0];
                        console.log("MIRAMOS LA CONEXIÓN");
                        console.log(conectado);
                        if (conectado !== undefined) {
                            console.log("envio notificación al alumno " + alumno.id);
                            conectado.soc.emit("avanzarPregunta", " info.mensaje");
                        }
                    });
                }).catch((error) => {
                    console.log("error");
                    console.log(error);
                });
    });

        // Para enviar la respuesta del alumno en Modalidad Kahoot al Dashboard
    socket.on("respuestaAlumnoKahoot", (datos) => {
            console.log("Respuesta pasando por servidor", datos);
            const listaSocket = socketsDashboards.filter((elem) => elem.pId === datos.profesorId);
            listaSocket.forEach((socket) => {
                console.log("Envio Respuesta al profesor:", socket.pId);
                console.log("Envio Respuesta al profesor:", datos);
                socket.s.emit("respuestaAlumnoKahoot", datos);
            });
    });

        // Para enviar la conexión del alumno al juego en Modalidad Kahoot al Dashboard
    socket.on("conexionAlumnoKahoot", (datos) => {
            console.log("Conexión de alumno al juego pasando por servidor");
            console.log(datos);
            const listaSocket = socketsDashboards.filter((elem) => elem.pId === datos.profesorId);
            listaSocket.forEach((socket) => {
                console.log("Envio Respuesta al profesor:", socket.pId);
                socket.s.emit("conexionAlumnoKahoot", datos.alumnoId);
            });
    });

    socket.on("confirmacionPreparadoParaKahoot", (datos) => {
        console.log("Confirma preparado para kahoot", datos);
        const listaSocket = socketsDashboards.filter ((elem) => elem.pId === datos.profesorId);
        listaSocket.forEach((socket) => {
            socket.s.emit("confirmacionPreparadoParaKahoot", datos.info);
        });
    });
     // Notificación para alumnos de un juego kahoot rápido
    socket.on("lanzarSiguientePregunta", (info) => {
        // Saco los elementos de la lista correspondientes a los jugadores conectados a ese juego rápido
        const conectadosJuegoRapido = registroNotificacionesJuegos.filter ((elem) => elem.c === info.clave);
        console.log ('Notifico lanzar a ', conectadosJuegoRapido.length);
        conectadosJuegoRapido.forEach ((conectado) => {
            console.log ('notifico');
            conectado.soc.emit ("lanzarSiguientePregunta", info.opcionesDesordenadas);
        });
    });

    // Notificación para alumnos de un juego Kahoot de grupo: lanzar siguiente pregunta
    socket.on("lanzarSiguientePreguntaGrupo", (info) => {
        // Saco los elementos de la lista correspondientes a los jugadores conectados a ese grupo

        peticionesAPI.DameAlumnosGrupo(info.grupoId)
            .then((res) => {
                const alumnos = res.data;
                alumnos.forEach((alumno) => {
                    const conectado = alumnosConectados.filter((con) => con.id === alumno.id)[0];
                    if (conectado !== undefined) {
                        console.log("envio notificación al alumno " + alumno.id);
                        conectado.soc.emit ("lanzarSiguientePregunta", info.opcionesDesordenadas);
                    }
                });
            }).catch((error) => {
                console.log("error");
                console.log(error);
            });
    });
    // Notificación para alumnos de un juego Kahoot de grupo: panel abierto
    socket.on("panelAbierto", (grupoId) => {
        // Saco los elementos de la lista correspondientes a los jugadores conectados a ese grupo

        peticionesAPI.DameAlumnosGrupo(grupoId)
            .then((res) => {
                const alumnos = res.data;
                alumnos.forEach((alumno) => {
                    const conectado = alumnosConectados.filter((con) => con.id === alumno.id)[0];
                    if (conectado !== undefined) {
                        console.log("envio notificación al alumno " + alumno.id);
                        conectado.soc.emit ("panelAbierto");
                    }
                });
            }).catch((error) => {
                console.log("error");
                console.log(error);
            });
    });

    // Para enviar la respuesta del alumno en Modalidad Kahoot Rapido al Dashboard
    socket.on("respuestaAlumnoKahootRapido", (datos) => {
        console.log ("trasmito a dash respuesta a kahoot de " + datos.nick);
        const listaSocket = socketsDashboards.filter ((elem) => elem.pId === datos.profesorId);
        listaSocket.forEach((socket) => {
            socket.s.emit("respuestaAlumnoKahootRapido", datos);
        });
    });

    // Para enviar la respuesta del alumno en Modalidad grupo Rapido al Dashboard
    socket.on("respuestaAlumnoKahootGrupo", (datos) => {

        const listaSocket = socketsDashboards.filter ((elem) => elem.pId === datos.profesorId);
        listaSocket.forEach((socket) => {
            socket.s.emit("respuestaAlumnoKahootGrupo", datos);
        });
    });

      // Notificación para alumnos de un juego rápido
    socket.on("resultadoFinalKahoot", (info) => {
        // Saco los elementos de la lista correspondientes a los jugadores conectados a ese juego rápido
        const conectadosJuegoRapido = registroNotificacionesJuegos.filter ((elem) => elem.c === info.clave);
        conectadosJuegoRapido.forEach ((conectado) => {
            conectado.soc.emit ("resultadoFinalKahoot", info.resultado);
        });
    });

    // Notificación para alumnos de un juego kahoot de grupo
    socket.on("resultadoFinalKahootGrupo", (info) => {

        peticionesAPI.DameAlumnosGrupo(info.grupoId)
        .then((res) => {
            const alumnos = res.data;
            alumnos.forEach((alumno) => {
                const conectado = alumnosConectados.filter((con) => con.id === alumno.id)[0];
                if (conectado !== undefined) {
                    console.log("envio notificación al alumno " + alumno.id);
                    conectado.soc.emit ("resultadoFinalKahoot", info.resultado);
                }
            });
        }).catch((error) => {
            console.log("error");
            console.log(error);
        });

    });

    socket.on("respuestaEvaluacion", (data: {alumnoId, profesorId, juegoId, evaluadoId, respuesta}) => {
        console.log("respuestaEvaluacion", data);
        const socketProfesor = socketsDashboards.find((item) => item.pId === data.profesorId);
        if (socketProfesor) {
            socketProfesor.s.emit("respuestaEvaluacion", data);
        }
    });

});

    server.listen(port, () => {
        console.log(`started on port: ${port}`);

    });

