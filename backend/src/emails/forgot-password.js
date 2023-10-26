function forgotPasswordEmail(username, link) {
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
        </style>
        </head>
        <body>
        
        <div class="header">
            <h1>Hazard Perception</h1>
        </div>
        
        <div class="content">
            <h2>Password Reset Request</h2>
            <p>Dear ${username},</p>
            <p>We received a request to reset your password for your Hazard Perception account. </p>
            <p>Please click following link to reset your password. This link will expire in 10 minutes. </p>
            <a href="${link}">${link}</a>
            <p>Thank you for using Hazard Perception.</p><br>
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

export default forgotPasswordEmail;
