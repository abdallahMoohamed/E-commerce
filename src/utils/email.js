import nodemailer from "nodemailer";

async function sendEmail ( { to, cc, bcc, subject, html, text, attachments } = {} ) {
    let transporter = nodemailer.createTransport( {
        service: 'gmail',
        auth: {
            user: process.env.gmail, // generated ethereal user
            pass: process.env.gmailPass, // generated ethereal password
        },
    } );

    // send mail with defined transport object
    let info = await transporter.sendMail( {
        from: `"E-commerece" <${ process.env.gmail }>`, // sender address
        to,
        cc,
        bcc,
        subject,
        html,
        attachments,
        text
    } );


    return info.rejected.length ? false : true
}



export default sendEmail