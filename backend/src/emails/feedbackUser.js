function feedbackUser(entrance, type, content) {
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
            <h2>Submitted successfully!</h2>
            <p>Your feedback has been received and is currently being reviewed by our support team. </p>
            <br>            
            <p>Here's a summary of your feedback:</p>
            <p><strong>Entrance</strong>：${entrance}</p>
            <p><strong>Type</strong>：${type}</p>
            <p><strong>Content</strong>：${content}</p>
            <br>            
            <p>Thank you for taking the time to contribute to our journey of improvement. We look forward to serving you better in the future.</p>
            <br>            
            <p>Best Regards,</p>
            <p>The Hazard Perception Team</p>
        </div>

        <div class="footer">
            <p>You're receiving this email because you are an admin on our website.</p>
            <p>Our mailing address is: support@hazardperception.org</p>
            <p>©2023 Hazard Perception. All rights reserved.</p>
            <p><a href="--Privacy Policy Link--">Privacy Policy</a> | <a href="--Terms of Service Link--">Terms of Service</a></p>
        </div>

        </body>
        </html>
    `;
}

export default feedbackUser;
