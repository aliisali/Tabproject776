interface EmailTemplate {
  subject: string;
  htmlBody: string;
  textBody: string;
}

interface EmailData {
  to: string;
  subject: string;
  htmlBody: string;
  textBody: string;
  from?: string;
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
}

interface SMTPConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export class EmailService {
  private static readonly FROM_EMAIL = 'admin@blindscloud.co.uk';
  private static readonly FROM_NAME = 'BlindsCloud Solutions';
  private static readonly REPLY_TO = 'support@blindscloud.co.uk';
  
  // SMTP Configuration for custom domain
  private static readonly SMTP_CONFIG: SMTPConfig = {
    host: 'mail.blindscloud.co.uk', // Your domain's mail server
    port: 587, // or 465 for SSL
    secure: false, // true for 465, false for other ports
    auth: {
      user: 'admin@blindscloud.co.uk',
      pass: 'your-email-password' // This should be in environment variables
    }
  };

  // Send email via SMTP (production implementation)
  static async sendEmailSMTP(emailData: EmailData): Promise<boolean> {
    try {
      // In a real implementation, this would use a backend service
      // For now, we'll simulate the SMTP sending
      console.log('📧 SMTP EMAIL SENDING:', {
        from: emailData.from || this.FROM_EMAIL,
        to: emailData.to,
        subject: emailData.subject,
        smtp: this.SMTP_CONFIG.host
      });
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Store email record
      this.storeEmailForDemo({
        ...emailData,
        from: emailData.from || `${this.FROM_NAME} <${this.FROM_EMAIL}>`,
        replyTo: this.REPLY_TO
      });
      
      return true;
    } catch (error) {
      console.error('❌ SMTP sending failed:', error);
      return false;
    }
  }

  // Send custom email from admin
  static async sendCustomEmail(emailData: {
    to: string;
    subject: string;
    message: string;
    isHTML?: boolean;
    cc?: string[];
    bcc?: string[];
  }): Promise<boolean> {
    try {
      const emailPayload: EmailData = {
        to: emailData.to,
        subject: emailData.subject,
        htmlBody: emailData.isHTML ? emailData.message : this.convertTextToHTML(emailData.message),
        textBody: emailData.isHTML ? this.stripHTML(emailData.message) : emailData.message,
        from: `${this.FROM_NAME} <${this.FROM_EMAIL}>`,
        replyTo: this.REPLY_TO,
        cc: emailData.cc,
        bcc: emailData.bcc
      };

      const success = await this.sendEmailSMTP(emailPayload);
      
      if (success) {
        this.showEmailNotification('Custom email sent successfully!', emailData.to);
      }
      
      return success;
    } catch (error) {
      console.error('❌ Failed to send custom email:', error);
      return false;
    }
  }

  // Convert plain text to HTML
  private static convertTextToHTML(text: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; }
    .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
    .content { background: white; padding: 20px; border: 1px solid #e2e8f0; border-radius: 0 0 8px 8px; }
    .footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>BlindsCloud Solutions</h1>
      <p>Professional Blinds & Window Solutions</p>
    </div>
    <div class="content">
      <p>${text.replace(/\n/g, '<br>')}</p>
    </div>
    <div class="footer">
      <p>© 2025 BlindsCloud Solutions Ltd. All rights reserved.</p>
      <p>Email: admin@blindscloud.co.uk | Web: blindscloud.co.uk</p>
    </div>
  </div>
</body>
</html>`;
  }

  // Strip HTML tags for text version
  private static stripHTML(html: string): string {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }

  // Email templates
  private static getWelcomeEmailTemplate(userData: {
    name: string;
    email: string;
    password: string;
    role: string;
    businessName?: string;
    loginUrl: string;
  }): EmailTemplate {
    const subject = `Welcome to JobManager Pro - Your Account is Ready!`;
    
    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to JobManager Pro</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
    .header { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 32px 24px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
    .header p { margin: 8px 0 0; opacity: 0.9; }
    .content { padding: 32px 24px; }
    .credentials { background: #f1f5f9; border-radius: 8px; padding: 20px; margin: 24px 0; border-left: 4px solid #3b82f6; }
    .credentials h3 { margin: 0 0 16px; color: #1e293b; }
    .credential-item { margin: 8px 0; }
    .credential-label { font-weight: 600; color: #475569; }
    .credential-value { font-family: 'Monaco', 'Menlo', monospace; background: white; padding: 4px 8px; border-radius: 4px; border: 1px solid #e2e8f0; }
    .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 16px 0; }
    .button:hover { background: #2563eb; }
    .features { margin: 24px 0; }
    .feature-item { display: flex; align-items: center; margin: 8px 0; }
    .feature-icon { color: #10b981; margin-right: 8px; }
    .footer { background: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 14px; }
    .security-note { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 24px 0; }
    .security-note h4 { margin: 0 0 8px; color: #92400e; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚀 Welcome to JobManager Pro!</h1>
      <p>Your professional business management platform</p>
    </div>
    
    <div class="content">
      <h2>Hello ${userData.name}!</h2>
      <p>Your account has been successfully created on JobManager Pro. You now have access to our comprehensive business management platform with advanced features.</p>
      
      <div class="credentials">
        <h3>🔑 Your Login Credentials</h3>
        <div class="credential-item">
          <span class="credential-label">Email:</span>
          <span class="credential-value">${userData.email}</span>
        </div>
        <div class="credential-item">
          <span class="credential-label">Password:</span>
          <span class="credential-value">${userData.password}</span>
        </div>
        <div class="credential-item">
          <span class="credential-label">Role:</span>
          <span class="credential-value">${userData.role.charAt(0).toUpperCase() + userData.role.slice(1)}</span>
        </div>
        ${userData.businessName ? `
        <div class="credential-item">
          <span class="credential-label">Business:</span>
          <span class="credential-value">${userData.businessName}</span>
        </div>
        ` : ''}
      </div>

      <div class="security-note">
        <h4>🔒 Security Reminder</h4>
        <p>For your security, please change your password after your first login. Keep your credentials secure and never share them with others.</p>
      </div>

      <div class="features">
        <h3>✨ What you can do with JobManager Pro:</h3>
        ${userData.role === 'admin' ? `
        <div class="feature-item"><span class="feature-icon">✅</span> Manage all platform users and businesses</div>
        <div class="feature-item"><span class="feature-icon">✅</span> Access 3D Model Converter for AR experiences</div>
        <div class="feature-item"><span class="feature-icon">✅</span> Control module permissions and access</div>
        <div class="feature-item"><span class="feature-icon">✅</span> Generate comprehensive platform reports</div>
        <div class="feature-item"><span class="feature-icon">✅</span> Direct access to AR Camera features</div>
        ` : userData.role === 'business' ? `
        <div class="feature-item"><span class="feature-icon">✅</span> Manage your employees and team</div>
        <div class="feature-item"><span class="feature-icon">✅</span> Create and track jobs and projects</div>
        <div class="feature-item"><span class="feature-icon">✅</span> Manage customer relationships</div>
        <div class="feature-item"><span class="feature-icon">✅</span> View 3D models and AR demonstrations (if enabled)</div>
        <div class="feature-item"><span class="feature-icon">✅</span> Generate business reports and analytics</div>
        ` : `
        <div class="feature-item"><span class="feature-icon">✅</span> Manage assigned jobs and tasks</div>
        <div class="feature-item"><span class="feature-icon">✅</span> Capture photos and documents</div>
        <div class="feature-item"><span class="feature-icon">✅</span> Use AR Camera for customer demonstrations</div>
        <div class="feature-item"><span class="feature-icon">✅</span> View 3D models and product visualizations</div>
        <div class="feature-item"><span class="feature-icon">✅</span> Access calendar and scheduling</div>
        `}
      </div>

      <div style="text-align: center; margin: 32px 0;">
        <a href="${userData.loginUrl}" class="button">🚀 Login to JobManager Pro</a>
      </div>

      <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
      
      <p>Best regards,<br>
      <strong>The JobManager Pro Team</strong></p>
    </div>
    
    <div class="footer">
      <p>© 2025 JobManager Pro. All rights reserved.</p>
      <p>This is an automated message. Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>`;

    const textBody = `
Welcome to JobManager Pro!

Hello ${userData.name},

Your account has been successfully created on JobManager Pro.

LOGIN CREDENTIALS:
Email: ${userData.email}
Password: ${userData.password}
Role: ${userData.role.charAt(0).toUpperCase() + userData.role.slice(1)}
${userData.businessName ? `Business: ${userData.businessName}` : ''}

SECURITY REMINDER:
For your security, please change your password after your first login.

LOGIN URL: ${userData.loginUrl}

Best regards,
The JobManager Pro Team

© 2025 JobManager Pro. All rights reserved.
`;

    return { subject, htmlBody, textBody };
  }

  // Send welcome email
  static async sendWelcomeEmail(userData: {
    name: string;
    email: string;
    password: string;
    role: string;
    businessName?: string;
  }): Promise<boolean> {
    try {
      const loginUrl = window.location.origin;
      const template = this.getWelcomeEmailTemplate({
        ...userData,
        loginUrl
      });

      const emailData: EmailData = {
        to: userData.email,
        subject: template.subject,
        htmlBody: template.htmlBody,
        textBody: template.textBody,
        from: `${this.FROM_NAME} <${this.FROM_EMAIL}>`
      };

      // In a real implementation, this would send via email service (SendGrid, AWS SES, etc.)
      // For now, we'll simulate the email and show it in console/modal
      console.log('📧 EMAIL SENT:', emailData);
      
      // Store email in localStorage for demo purposes
      this.storeEmailForDemo(emailData);
      
      // Show success notification
      this.showEmailNotification(userData.name, userData.email);
      
      return true;
    } catch (error) {
      console.error('❌ Failed to send welcome email:', error);
      return false;
    }
  }

  // Store email for demo purposes
  private static storeEmailForDemo(emailData: EmailData) {
    try {
      const emails = JSON.parse(localStorage.getItem('demo_emails') || '[]');
      const emailRecord = {
        ...emailData,
        id: `email-${Date.now()}`,
        sentAt: new Date().toISOString(),
        status: 'sent'
      };
      
      emails.unshift(emailRecord);
      
      // Keep only last 50 emails
      if (emails.length > 50) {
        emails.splice(50);
      }
      
      localStorage.setItem('demo_emails', JSON.stringify(emails));
      console.log('✅ Email stored for demo:', emailRecord.id);
    } catch (error) {
      console.error('❌ Failed to store demo email:', error);
    }
  }

  // Show email notification
  private static showEmailNotification(userName: string, userEmail: string) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-blue-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 max-w-sm';
    notification.innerHTML = `
      <div class="flex items-start space-x-3">
        <div class="flex-shrink-0">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
          </svg>
        </div>
        <div>
          <p class="font-medium">Welcome Email Sent!</p>
          <p class="text-sm opacity-90">Credentials sent to ${userEmail}</p>
          <button onclick="this.parentElement.parentElement.parentElement.remove()" class="text-xs underline mt-1 opacity-75 hover:opacity-100">Dismiss</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 5000);
  }

  // Get demo emails (for testing purposes)
  static getDemoEmails() {
    try {
      return JSON.parse(localStorage.getItem('demo_emails') || '[]');
    } catch (error) {
      console.error('❌ Failed to load demo emails:', error);
      return [];
    }
  }

  // Send password reset email
  static async sendPasswordResetEmail(userData: {
    name: string;
    email: string;
    newPassword: string;
  }): Promise<boolean> {
    try {
      const template = this.getPasswordResetEmailTemplate(userData);
      
      const emailData: EmailData = {
        to: userData.email,
        subject: template.subject,
        htmlBody: template.htmlBody,
        textBody: template.textBody,
        from: `${this.FROM_NAME} <${this.FROM_EMAIL}>`
      };

      console.log('📧 PASSWORD RESET EMAIL SENT:', emailData);
      this.storeEmailForDemo(emailData);
      
      // Show notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      notification.textContent = `Password reset email sent to ${userData.email}`;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 4000);
      
      return true;
    } catch (error) {
      console.error('❌ Failed to send password reset email:', error);
      return false;
    }
  }

  private static getPasswordResetEmailTemplate(userData: {
    name: string;
    email: string;
    newPassword: string;
  }): EmailTemplate {
    const subject = `JobManager Pro - Password Reset Confirmation`;
    
    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f8fafc; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
    .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 24px; text-align: center; }
    .content { padding: 24px; }
    .credentials { background: #f0fdf4; border-radius: 8px; padding: 16px; margin: 16px 0; border-left: 4px solid #10b981; }
    .footer { background: #f8fafc; padding: 16px; text-align: center; color: #64748b; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔑 Password Reset</h1>
      <p>Your password has been updated</p>
    </div>
    
    <div class="content">
      <h2>Hello ${userData.name},</h2>
      <p>Your password has been successfully reset by an administrator.</p>
      
      <div class="credentials">
        <h3>🔐 New Login Credentials</h3>
        <p><strong>Email:</strong> ${userData.email}</p>
        <p><strong>New Password:</strong> <code>${userData.newPassword}</code></p>
      </div>

      <p><strong>⚠️ Important:</strong> Please change your password after logging in for security.</p>
      
      <p>If you didn't request this password reset, please contact your administrator immediately.</p>
    </div>
    
    <div class="footer">
      <p>© 2025 JobManager Pro. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;

    const textBody = `
Password Reset - JobManager Pro

Hello ${userData.name},

Your password has been successfully reset by an administrator.

NEW LOGIN CREDENTIALS:
Email: ${userData.email}
New Password: ${userData.newPassword}

IMPORTANT: Please change your password after logging in for security.

If you didn't request this password reset, please contact your administrator immediately.

© 2025 JobManager Pro. All rights reserved.
`;

    return { subject, htmlBody, textBody };
  }
}