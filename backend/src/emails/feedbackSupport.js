function feedbackSupport(entrance, participantId, email, type, content) {
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
              <h2>New Feedback!</h2>
              <p>Dear admin,</p>
              <p>The following is the problem content of user feedback, please deal with it in time.</p>
              <br>
              <p><strong>Entrance</strong>：${entrance}</p>
              <p><strong>Participant ID</strong>：${participantId}</p>
              <p><strong>Email</strong>：${email}</p>
              <p><strong>Type</strong>：${type}</p>
              <p><strong>Content</strong>：${content}</p>
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

export default feedbackSupport;
