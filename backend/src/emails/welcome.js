function welcomeEmail(username) {
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
          <h2>Welcome!</h2>
          <p>Dear ${username},</p>
          <p>We're excited to have you on board. Thank you for subscribing to our services!</p>
          <p>With Hazard Perception, you're now a part of a community dedicated to understanding and mitigating potential hazards. In the coming days, you'll receive updates, tips, and insights right into your inbox.</p>
          <p>If you have any questions, feel free to reply to this email. We're here to help!</p><br>
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

export default welcomeEmail;
