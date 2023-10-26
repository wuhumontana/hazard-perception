function newDeviceLoginEmail(username, date, device) {
  return `
        <!DOCTYPE html>
        <html>
        <head>
        <style>
            body {font-family: Arial, sans-serif;}
            .header {background-color: #213760; padding: 20px; text-align: center; color: #ffffff;}
            .content {padding: 20px; text-align: left;}
            .footer {background-color: #A7BAD1; padding: 20px; text-align: center; font-size: 12px; color: #000000;}
            .footer a {color: #213760;}
            .important {font-weight:bold;}
        </style>
        </head>
        <body>

        <div class="header">
            <h1>Hazard Perception</h1>
        </div>

        <div class="content">
            <h2>New Device Login Alert!</h2>
            <p>Dear ${username},</p>
            <p>We noticed a new login to your Hazard Perception account.</p>
            <p class="important">${device}</p>
            <p class="important">${date}</p>
            <p>If this was you, you can disregard this email. This notification is for your security and lets you know if there are any unauthorized actions happening on your account.</p>
            <p>If this wasn't you, please reset your password, and consider updating your security settings.</p>
            <p>Thank you for your attention to this matter.</p><br>
            <p>Best Regards,</p>
            <p>The Hazard Perception Team</p>
        </div>

        <div class="footer">
            <p>You're receiving this email because you signed up on our website or made a purchase from us.</p>
            <p>Our mailing address is: support@hazardperception.org</p>
            <p>©2023 Hazard Perception. All rights reserved.</p>
            <p><a href="--Privacy Policy Link--">Privacy Policy</a> | <a href="--Terms of Service Link--">Terms of Service</a></p>
        </div>

        </body>
        </html>
    `;
}

export default newDeviceLoginEmail;
