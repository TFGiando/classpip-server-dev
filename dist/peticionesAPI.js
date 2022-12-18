"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const URL = __importStar(require("./urls"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const JWT_SECRET = "SECRETOCLASSPIP";
class PeticionesAPIService {
    DameAlumnosEquipo(equipoId) {
        return axios_1.default.get(URL.APIUrlEquipos + "/" + equipoId + "/alumnos");
    }
    DameAlumnosGrupo(grupoId) {
        return axios_1.default.get(URL.APIUrlGrupos + "/" + grupoId + "/alumnos");
    }
    EnviarEmailContrasena(alumno) {
        console.log('Estoy dentro de EnviarEmail, creo transporter');
        let transporter = nodemailer_1.default.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            tls: {
                rejectUnauthorized: false
            },
            auth: {
                user: "classpipupc@gmail.com",
                pass: "lqkijbrazrgqpkly"
            },
            service: "gmail",
        });
        let mailOptions = {
            from: `"Classpip", "classpipupc@gmail.com"`,
            to: alumno.email,
            subject: "Recordatorio de contraseña en Classpip",
            html: "<h2> Hola " + alumno.username + "!</h2> <h3>Tu contraseña en Classpip es: " + alumno.password +
                "</h3><h4>Un saludo!</h4><p>Equipo de Classpip</p>",
        };
        transporter.sendMail(mailOptions, function (err, info) {
            if (err) {
                console.log(err);
            }
            else {
                console.log(info);
            }
        });
    }
    EnviarEmailRegistroAlumno(alumno) {
        console.log('voy a enviar emial a ' + alumno.email);
        let transporter = nodemailer_1.default.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            tls: {
                rejectUnauthorized: false
            },
            auth: {
                user: "classpipupc@gmail.com",
                pass: "lqkijbrazrgqpkly"
            },
            service: "gmail",
        });
        let fecha = new Date();
        const mailOptions = {
            from: `"Classpip", "classpipupc@gmail.com"`,
            to: alumno.email,
            subject: "Bienvenid@ a Classpip!",
            html: "<h2>Te damos la bienvenida a Classpip!</h2>" +
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
        transporter.sendMail(mailOptions, function (err, info) {
            if (err) {
                console.log(err);
            }
            else {
                console.log(info);
            }
        });
    }
    EnviarEmailCambioPassw(alumno) {
        console.log('voy a enviar emial a ' + alumno.email);
        let transporter = nodemailer_1.default.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            tls: {
                rejectUnauthorized: false
            },
            auth: {
                user: "classpipupc@gmail.com",
                pass: "lqkijbrazrgqpkly"
            },
            service: "gmail",
        });
        const secret = JWT_SECRET + alumno.contrasena;
        const payload = {
            id: alumno.id
        };
        const token = jsonwebtoken_1.default.sign(payload, secret, { expiresIn: '15m' });
        const link = "http://localhost:8100/cambiar-contrasena/" + alumno.id + "/" + token;
        console.log(link);
        const mailOptions = {
            from: `"Classpip", "classpipupc@gmail.com"`,
            to: alumno.email,
            subject: "Cambio de contraseña para tu cuenta",
            html: "<h3> Hola! <h4>" +
                "<h4>Por lo visto, se está requiriendo cambiar la contraseña de su cuenta Classpip <h4>" +
                "<h4> Para ello, haga click en el link que aparece a continuación para proceder a ello: <h4>" +
                link
                +
                    "<p>Att: Equipo de Classpip</p>",
        };
        transporter.sendMail(mailOptions, function (err, info) {
            if (err) {
                console.log(err);
            }
            else {
                console.log(info);
            }
        });
    }
}
exports.PeticionesAPIService = PeticionesAPIService;
//# sourceMappingURL=peticionesAPI.js.map