import axios from "axios";
import http from "http";
import nodemailer from "nodemailer";
import SMTPConnection from "nodemailer/lib/smtp-connection";
import { Observable } from "rxjs";
import * as URL from "./urls";

const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

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

    generateString() {
        let result = ' ';
        const charactersLength = 8;
        for ( let i = 0; i < 8; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
    
        return result;
    }   
}

