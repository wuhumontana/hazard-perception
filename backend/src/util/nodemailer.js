import nodemailer from "nodemailer";

async function sendEmail(to, subject, text, html, attachments) {
  if (process.env.PRODUCTION_MODE === "true") {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_ACCOUNT,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_ACCOUNT,
      to: to,
      subject: subject,
      text: text,
      html: html,
    };

    if (attachments) {
      mailOptions.attachments = attachments;
    }

    const info = await transporter.sendMail(mailOptions);
  }
}

export default sendEmail;
