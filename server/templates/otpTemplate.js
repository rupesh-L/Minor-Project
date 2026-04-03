export const otpTemplate = (type, otp, message, link, email) => {
  // 1. Logic to set theme based on your specific types
  let themeColor = "#4A90E2"; // Default Blue
  let typeTitle = "Verification Code";

  if (type === "signup") {
    themeColor = "#27ae60"; // Green for welcoming signup
    typeTitle = "Confirm Your Signup";
  } else if (type === "password-reset") {
    themeColor = "#e67e22"; // Orange for security/warning
    typeTitle = "Password Reset Request";
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9f9f9; margin: 0; padding: 0; }
        .wrapper { background-color: #f9f9f9; padding: 20px; }
        .container { max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
        .header { background-color: ${themeColor}; padding: 30px; text-align: center; color: white; }
        .content { padding: 30px; text-align: center; color: #333; }
        .otp-code { 
          background-color: #f1f1f1; 
          font-size: 36px; 
          font-weight: bold; 
          letter-spacing: 6px; 
          padding: 15px; 
          border-radius: 8px; 
          display: inline-block; 
          margin: 20px 0; 
          border: 1px solid #ddd;
          color: ${themeColor};
        }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #888; background-color: #fdfdfd; }
        .btn { 
          display: inline-block; 
          padding: 12px 25px; 
          background-color: ${themeColor}; 
          color: white !important; 
          text-decoration: none; 
          border-radius: 6px; 
          font-weight: bold; 
          margin-top: 15px;
        }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="header">
            <h1 style="margin:0; font-size: 24px;">${typeTitle}</h1>
          </div>
          <div class="content">
            <p style="font-size: 16px;">Hello,</p>
            <p style="font-size: 15px; line-height: 1.6;">
              ${message}
            </p>
            
            <div class="otp-code">${otp}</div>

            ${
              link
                ? `<br><a href="${link}" class="btn">Click here to proceed</a>`
                : ""
            }
            
            <p style="font-size: 13px; color: #666; margin-top: 25px;">
              This code is valid for 10 minutes. <br>
              Sent to: <strong>${email}</strong>
            </p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Book Store. All rights reserved.
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};
