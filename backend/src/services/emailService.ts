import nodemailer from 'nodemailer';

// Email configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Brand mark shown at the top of every email (PNG: SVG is not supported by most mail clients)
const LOGO_URL = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/icon-192x192.png`;

// Email templates
const emailTemplates = {
  // Registration confirmation
  registration: (data: { name: string; email: string }) => ({
    subject: 'Welcome to Steedly - Registration confirmation',
    html: `
      <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #F3F8F7;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 12px;"><img src="${LOGO_URL}" width="64" height="64" alt="Steedly" style="border-radius: 14px;" /></div>
          <h1 style="color: #0F766E; text-align: center; margin-bottom: 30px;">Welcome to Steedly</h1>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Hello <strong>${data.name}</strong>,
          </p>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Your registration was completed successfully. You can now use all the services of the Steedly platform.
          </p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p style="color: #666; font-size: 14px; margin: 5px 0;"><strong>Your email:</strong> ${data.email}</p>
          </div>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin-top: 30px;">
            If you have any questions, get in touch with us.
          </p>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px; text-align: center; border-top: 1px solid #eee; padding-top: 20px;">
            Best regards,<br>
            <strong>The Steedly team</strong>
          </p>
        </div>
      </div>
    `,
  }),

  // Password reset
  passwordReset: (data: { name: string; resetLink: string }) => ({
    subject: 'Password recovery - Steedly',
    html: `
      <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #F3F8F7;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 12px;"><img src="${LOGO_URL}" width="64" height="64" alt="Steedly" style="border-radius: 14px;" /></div>
          <h1 style="color: #0F766E; text-align: center; margin-bottom: 30px;">Password recovery</h1>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Hello <strong>${data.name}</strong>,
          </p>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            A password recovery request has been made for your account. To set a new password, click the link below:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.resetLink}" style="display: inline-block; background-color: #0F766E; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold;">
              Password recovery
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; line-height: 1.6; margin-top: 20px;">
            <strong>Note:</strong> This link is valid for only 1 hour. If you did not make this request, please ignore this email.
          </p>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px; text-align: center; border-top: 1px solid #eee; padding-top: 20px;">
            Best regards,<br>
            <strong>The Steedly team</strong>
          </p>
        </div>
      </div>
    `,
  }),

  // Order confirmation
  orderConfirmation: (data: {
    name: string;
    orderNumber: string;
    totalAmount: number;
    items: Array<{ name: string; quantity: number; price: number }>;
    shippingAddress: string;
  }) => ({
    subject: `Order ${data.orderNumber} confirmation - Steedly`,
    html: `
      <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #F3F8F7;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 12px;"><img src="${LOGO_URL}" width="64" height="64" alt="Steedly" style="border-radius: 14px;" /></div>
          <h1 style="color: #0F766E; text-align: center; margin-bottom: 30px;">Your order has been placed</h1>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Hello <strong>${data.name}</strong>,
          </p>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Your order was placed successfully. The order details are below:
          </p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p style="color: #666; font-size: 14px; margin: 5px 0;"><strong>Order number:</strong> ${data.orderNumber}</p>
            <p style="color: #666; font-size: 14px; margin: 5px 0;"><strong>Total amount:</strong> ${data.totalAmount.toLocaleString('en-US')} Toman</p>
            <p style="color: #666; font-size: 14px; margin: 5px 0;"><strong>Shipping address:</strong> ${data.shippingAddress}</p>
          </div>
          
          <h2 style="color: #0F766E; font-size: 18px; margin-top: 30px; margin-bottom: 15px;">Order items:</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background-color: #f8f9fa;">
                <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Product</th>
                <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Quantity</th>
                <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${data.items.map(item => `
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd;">${item.name}</td>
                  <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${item.quantity}</td>
                  <td style="padding: 10px; text-align: left; border: 1px solid #ddd;">${item.price.toLocaleString('en-US')} Toman</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin-top: 30px;">
            You can track your order status from your user panel.
          </p>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px; text-align: center; border-top: 1px solid #eee; padding-top: 20px;">
            Best regards,<br>
            <strong>The Steedly team</strong>
          </p>
        </div>
      </div>
    `,
  }),

  // Order status update
  orderStatusUpdate: (data: {
    name: string;
    orderNumber: string;
    status: string;
    statusText: string;
  }) => ({
    subject: `Order ${data.orderNumber} status update - Steedly`,
    html: `
      <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #F3F8F7;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 12px;"><img src="${LOGO_URL}" width="64" height="64" alt="Steedly" style="border-radius: 14px;" /></div>
          <h1 style="color: #0F766E; text-align: center; margin-bottom: 30px;">Order update</h1>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Hello <strong>${data.name}</strong>,
          </p>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            The status of your order number <strong>${data.orderNumber}</strong> has changed.
          </p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center;">
            <p style="color: #0F766E; font-size: 18px; font-weight: bold; margin: 0;">
              ${data.statusText}
            </p>
          </div>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin-top: 30px;">
            You can view more details in your user panel.
          </p>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px; text-align: center; border-top: 1px solid #eee; padding-top: 20px;">
            Best regards,<br>
            <strong>The Steedly team</strong>
          </p>
        </div>
      </div>
    `,
  }),

  // Booking reminder
  bookingReminder: (data: {
    name: string;
    serviceType: string;
    serviceName: string;
    bookingDate: string;
    bookingTime: string;
  }) => ({
    subject: `Booking reminder for ${data.serviceName} - Steedly`,
    html: `
      <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #F3F8F7;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 12px;"><img src="${LOGO_URL}" width="64" height="64" alt="Steedly" style="border-radius: 14px;" /></div>
          <h1 style="color: #0F766E; text-align: center; margin-bottom: 30px;">Booking reminder</h1>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Hello <strong>${data.name}</strong>,
          </p>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            This email is a reminder of your booking for ${data.serviceName}.
          </p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p style="color: #666; font-size: 14px; margin: 5px 0;"><strong>Service type:</strong> ${data.serviceName}</p>
            <p style="color: #666; font-size: 14px; margin: 5px 0;"><strong>Date:</strong> ${data.bookingDate}</p>
            <p style="color: #666; font-size: 14px; margin: 5px 0;"><strong>Time:</strong> ${data.bookingTime}</p>
          </div>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin-top: 30px;">
            Please be present at the scheduled time.
          </p>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px; text-align: center; border-top: 1px solid #eee; padding-top: 20px;">
            Best regards,<br>
            <strong>The Steedly team</strong>
          </p>
        </div>
      </div>
    `,
  }),
};

// Send email function
export const sendEmail = async (
  to: string,
  template: keyof typeof emailTemplates,
  data: any
): Promise<boolean> => {
  try {
    // Check if email is enabled
    if (process.env.EMAIL_ENABLED !== 'true') {
      console.log('Email service is disabled. Email would be sent to:', to);
      return true; // Return true in development mode
    }

    // Validate SMTP configuration
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error('SMTP configuration is missing');
      return false;
    }

    const transporter = createTransporter();
    const templateData = emailTemplates[template](data);

    const mailOptions = {
      from: `"Steedly" <${process.env.SMTP_USER}>`,
      to,
      subject: templateData.subject,
      html: templateData.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

// Helper functions for specific email types
export const sendRegistrationEmail = async (email: string, name: string) => {
  return sendEmail(email, 'registration', { name, email });
};

export const sendPasswordResetEmail = async (
  email: string,
  name: string,
  resetToken: string
) => {
  const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/auth/reset-password?token=${resetToken}`;
  return sendEmail(email, 'passwordReset', { name, resetLink });
};

export const sendOrderConfirmationEmail = async (
  email: string,
  name: string,
  orderData: {
    orderNumber: string;
    totalAmount: number;
    items: Array<{ name: string; quantity: number; price: number }>;
    shippingAddress: string;
  }
) => {
  return sendEmail(email, 'orderConfirmation', {
    name,
    ...orderData,
  });
};

export const sendOrderStatusUpdateEmail = async (
  email: string,
  name: string,
  orderNumber: string,
  status: string
) => {
  const statusTexts: Record<string, string> = {
    pending: 'Awaiting payment',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  };

  return sendEmail(email, 'orderStatusUpdate', {
    name,
    orderNumber,
    status,
    statusText: statusTexts[status] || status,
  });
};

export const sendBookingReminderEmail = async (
  email: string,
  name: string,
  serviceType: string,
  serviceName: string,
  bookingDate: string,
  bookingTime: string
) => {
  return sendEmail(email, 'bookingReminder', {
    name,
    serviceType,
    serviceName,
    bookingDate,
    bookingTime,
  });
};

