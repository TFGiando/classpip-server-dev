import axios from "axios";
import http from "http";
import nodemailer from "nodemailer";
import SMTPConnection from "nodemailer/lib/smtp-connection";
import { identity, Observable } from "rxjs";
import * as URL from "./urls";
import jwt from 'jsonwebtoken';

const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const JWT_SECRET = "SECRETOCLASSPIP";

export class PeticionesAPIService {
    public DameAlumnosEquipo(equipoId: number): any {
        return axios.get(URL.APIUrlEquipos + "/" + equipoId + "/alumnos");
    }
    public DameAlumnosGrupo(grupoId: number): any {
        return axios.get(URL.APIUrlGrupos + "/" + grupoId + "/alumnos");
    }

    // Si pasa tiempo sin enviar emails entonces en la cuenta de gmail se desactiva la opcion
    // de permitir el acceso a aplicaciones no seguras.
    // En ese caso hay que hacer lo siguiente:
    //Loguearse en gmail con la cuenta de classpip
    // Conectarse a esta url:
    // https://support.google.com/mail/?p=BadCredentials
    // ir a:
    // permitir que apps menos seguras accedan a tu cuenta.
    // Si está desactivada la opción "Acceso de apps menos seguras"
    // 
    // 

    public EnviarEmail(alumno) {
        console.log ('Estoy dentro de EnviarEmail, creo transporter');

        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            tls: {
                rejectUnauthorized: false
              },
            auth: {
                user: "classpipupc@gmail.com", // Cambialo por tu email
                pass: "lqkijbrazrgqpkly" // Cambialo por tu password
            },
            service: "gmail",
        });

        console.log ('creo las opciones');
        let mailOptions = {
            from: `"Classpip", "classpipupc@gmail.com"`,
            to: alumno.email, // Cambia esta parte por el destinatario
            subject: "Recordatorio de contraseña en Classpip",
            html: "<h2> Hola " + alumno.username + "!</h2> <h3>Tu contraseña en Classpip es: " + alumno.password +
            "</h3><h4>Un saludo!</h4><p>Equipo de Classpip</p>",
        };
       
        // tslint:disable-next-line:only-arrow-functions
        console.log ('voy a enviar email');
        transporter.sendMail(mailOptions, function(err, info) {
            if (err) {
                console.log(err);
            } else {
                console.log(info);
            }
        });
    
    }

    public EnviarEmailRegistroAlumno(alumno) {

        console.log ('voy a enviar emial a ' + alumno.email);
    
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            tls: {
                rejectUnauthorized: false
              },
            auth: {
                user: "classpipupc@gmail.com", // Cambialo por tu email
                pass: "lqkijbrazrgqpkly" // Cambialo por tu password
            },
            service: "gmail",
        });
        
        let fecha = new Date();

        const mailOptions = {
            from: `"Classpip", "classpipupc@gmail.com"`,
            to: alumno.email,
            subject: "Bienvenid@ a Classpip!",
            html:   "<h2>Te damos la bienvenida a Classpip!</h2>" +
                    "<h4>Si estás recibiendo este correo, es porque has sido registrado en Classpip por tu profesor. <br>" +
                    "<br>Los datos de información de tu cuenta son: <br>" +
                    "Nombre: " + alumno.nombre + "<br>" +
                    "Primer apellido: " + alumno.primerApellido + "<br>" +
                    "Segundo apellido: " + alumno.segundoApellido + "<br>" +
                    "Nombre de usuario: " + alumno.username + "<br>" +
                    "Contraseña: " + alumno.password + "<br>" +
                    "Email: " + alumno.email + "<br>" +
                    "Fecha y hora de registro: " + fecha.toLocaleString() + "<br><br>" +
                    "Recuerda que puedes acceder a la app conectándote a: <br>" +
                    "classpip.upc.edu:8100</h4>" +
                    "<p>Att: Equipo de Classpip</p>",
        };
        // tslint:disable-next-line:only-arrow-functions
        console.log("voy a enviar email")
        transporter.sendMail(mailOptions, function(err, info) {
            if (err) {
                console.log(err);
            } else {
                console.log(info);
            }
        });
    }



    public EnviarEmailCambioPassw(alumno) {

        console.log ('voy a enviar emial a ' + alumno.email);
    
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            tls: {
                rejectUnauthorized: false
              },
            auth: {
                user: "classpipupc@gmail.com", // Cambialo por tu email
                pass: "lqkijbrazrgqpkly" // Cambialo por tu password
            },
            service: "gmail",
        });

        const secret = JWT_SECRET + alumno.contrasena
        const payload ={
            id: alumno.id,
            email: alumno.email
        }
        const token = jwt.sign(payload, secret, {expiresIn: '15m'}) 
        const link = "http://localhost:8100/cambiar-contrasena/" + alumno.id + "/" + token
        console.log(link)
        console.log(alumno.email)
        


        const mailOptions = {
            from: `"Classpip", "classpipupc@gmail.com"`,
            to: alumno.email,
            subject: "Cambio de contraseña para tu cuenta",
            html:   "<h3> Hola! <h4>" +
                    "<h4>Por lo visto, se está requiriendo cambiar la contraseña de su cuenta Classpip <h4>" +
                    "<h4>Para ello, en primer lugar recuerde su id: <h4>" +
                    alumno.id +
                    "le dejamos el link al que acceder a continuación: <h4>" +
                    link
                    +
                    "<p>Att: Equipo de Classpip</p>",
        };
        // tslint:disable-next-line:only-arrow-functions
        console.log("voy a enviar email")
        transporter.sendMail(mailOptions, function(err, info) {
            if (err) {
                console.log(err);
            } else {
                console.log(info);
            }
        });
    }
}

