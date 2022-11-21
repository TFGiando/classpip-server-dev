"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer = __importStar(require("nodemailer"));
class EnviarEmailService {
    EnviarEmail(email) {
        const transporter = nodemailer.createTransport({
            auth: {
                user: 'classpipupc@gmail.com',
                pass: 'mimara00.' // Cambialo por tu password
            },
            service: "gmail",
        });
        const mailOptions = {
            from: "classpip",
            to: email,
            subject: "Tu contraseña",
            html: "Tu contraseña en classpip es esta XXXX",
        };
        // tslint:disable-next-line:only-arrow-functions
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
exports.EnviarEmailService = EnviarEmailService;
//# sourceMappingURL=enviarEmail.js.map