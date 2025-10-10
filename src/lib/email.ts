import { Resend } from 'resend';

// Initialize Resend with API key from environment variables
const resendApiKey = import.meta.env.VITE_RESEND_API_KEY;

let resend: Resend | null = null;

// Only initialize if API key is available
if (resendApiKey) {
  resend = new Resend(resendApiKey);
} else {
  console.warn('Resend API key not found. Email notifications will be disabled.');
}

/**
 * Send notification email when a new user signs up
 */
export const sendNewUserNotification = async (userEmail: string, userName: string): Promise<void> => {
  // Skip if Resend is not configured
  if (!resend) {
    console.warn('Resend not configured. Skipping email notification.');
    return;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'Leo Voice Agent <onboarding@resend.dev>', // Default Resend sender
      to: ['leovoiceagent@gmail.com'],
      subject: '🎉 New User Registration - Leo Voice Agent',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #38BDF8 0%, #0EA5E9 100%);
                color: white;
                padding: 30px;
                border-radius: 10px 10px 0 0;
                text-align: center;
              }
              .content {
                background: #f8f9fa;
                padding: 30px;
                border-radius: 0 0 10px 10px;
              }
              .info-box {
                background: white;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                border-left: 4px solid #38BDF8;
              }
              .info-row {
                margin: 10px 0;
              }
              .label {
                font-weight: bold;
                color: #64748B;
              }
              .value {
                color: #1E293B;
              }
              .footer {
                text-align: center;
                color: #64748B;
                font-size: 12px;
                margin-top: 20px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 New User Registration!</h1>
              </div>
              <div class="content">
                <p>Great news! A new user has just signed up for Leo Voice Agent.</p>
                
                <div class="info-box">
                  <div class="info-row">
                    <span class="label">Name:</span>
                    <span class="value">${userName}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">Email:</span>
                    <span class="value">${userEmail}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">Registration Time:</span>
                    <span class="value">${new Date().toLocaleString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      timeZoneName: 'short'
                    })}</span>
                  </div>
                </div>
                
                <p style="margin-top: 20px;">
                  This user has been added to your system and will need to be assigned to an organization 
                  to access the dashboard features.
                </p>
                
                <div class="footer">
                  <p>This is an automated notification from Leo Voice Agent</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Error sending new user notification email:', error);
    } else {
      console.log('New user notification email sent successfully:', data);
    }
  } catch (error) {
    console.error('Unexpected error sending notification email:', error);
  }
};

/**
 * Send welcome email to the new user
 * Optional - can be used to welcome users directly
 */
export const sendWelcomeEmail = async (userEmail: string, userName: string): Promise<void> => {
  if (!resend) {
    console.warn('Resend not configured. Skipping welcome email.');
    return;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'Leo Voice Agent <onboarding@resend.dev>',
      to: [userEmail],
      subject: 'Welcome to Leo Voice Agent! 🎉',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #38BDF8 0%, #0EA5E9 100%);
                color: white;
                padding: 30px;
                border-radius: 10px 10px 0 0;
                text-align: center;
              }
              .content {
                background: #f8f9fa;
                padding: 30px;
                border-radius: 0 0 10px 10px;
              }
              .button {
                display: inline-block;
                background: #38BDF8;
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 8px;
                margin: 20px 0;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welcome to Leo Voice Agent!</h1>
              </div>
              <div class="content">
                <p>Hi ${userName},</p>
                
                <p>Thanks for signing up! We're excited to have you on board.</p>
                
                <p>Leo Voice Agent helps you manage your properties and track voice interactions with potential tenants.</p>
                
                <p style="margin-top: 30px;">
                  <a href="${window.location.origin}/app" class="button">Get Started</a>
                </p>
                
                <p style="margin-top: 30px; color: #64748B; font-size: 14px;">
                  If you have any questions, feel free to reach out to our support team.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Error sending welcome email:', error);
    } else {
      console.log('Welcome email sent successfully:', data);
    }
  } catch (error) {
    console.error('Unexpected error sending welcome email:', error);
  }
};

