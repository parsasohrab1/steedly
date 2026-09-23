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
    subject: 'خوش آمدید به استیدلی - تایید ثبت‌نام',
    html: `
      <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #F3F8F7;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 12px;"><img src="${LOGO_URL}" width="64" height="64" alt="استیدلی" style="border-radius: 14px;" /></div>
          <h1 style="color: #0F766E; text-align: center; margin-bottom: 30px;">خوش آمدید به استیدلی</h1>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            سلام <strong>${data.name}</strong>،
          </p>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            ثبت‌نام شما با موفقیت انجام شد. اکنون می‌توانید از تمامی خدمات پلتفرم استیدلی استفاده کنید.
          </p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p style="color: #666; font-size: 14px; margin: 5px 0;"><strong>ایمیل شما:</strong> ${data.email}</p>
          </div>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin-top: 30px;">
            در صورت وجود هرگونه سوال، با ما در تماس باشید.
          </p>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px; text-align: center; border-top: 1px solid #eee; padding-top: 20px;">
            با تشکر،<br>
            <strong>تیم استیدلی</strong>
          </p>
        </div>
      </div>
    `,
  }),

  // Password reset
  passwordReset: (data: { name: string; resetLink: string }) => ({
    subject: 'بازیابی رمز عبور - استیدلی',
    html: `
      <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #F3F8F7;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 12px;"><img src="${LOGO_URL}" width="64" height="64" alt="استیدلی" style="border-radius: 14px;" /></div>
          <h1 style="color: #0F766E; text-align: center; margin-bottom: 30px;">بازیابی رمز عبور</h1>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            سلام <strong>${data.name}</strong>،
          </p>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            درخواست بازیابی رمز عبور برای حساب کاربری شما ثبت شده است. برای تنظیم رمز عبور جدید، روی لینک زیر کلیک کنید:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.resetLink}" style="display: inline-block; background-color: #0F766E; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold;">
              بازیابی رمز عبور
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; line-height: 1.6; margin-top: 20px;">
            <strong>توجه:</strong> این لینک فقط برای 1 ساعت معتبر است. در صورت عدم درخواست شما، این ایمیل را نادیده بگیرید.
          </p>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px; text-align: center; border-top: 1px solid #eee; padding-top: 20px;">
            با تشکر،<br>
            <strong>تیم استیدلی</strong>
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
    subject: `تایید سفارش ${data.orderNumber} - استیدلی`,
    html: `
      <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #F3F8F7;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 12px;"><img src="${LOGO_URL}" width="64" height="64" alt="استیدلی" style="border-radius: 14px;" /></div>
          <h1 style="color: #0F766E; text-align: center; margin-bottom: 30px;">سفارش شما ثبت شد</h1>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            سلام <strong>${data.name}</strong>،
          </p>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            سفارش شما با موفقیت ثبت شد. جزئیات سفارش در زیر آمده است:
          </p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p style="color: #666; font-size: 14px; margin: 5px 0;"><strong>شماره سفارش:</strong> ${data.orderNumber}</p>
            <p style="color: #666; font-size: 14px; margin: 5px 0;"><strong>مبلغ کل:</strong> ${data.totalAmount.toLocaleString('fa-IR')} تومان</p>
            <p style="color: #666; font-size: 14px; margin: 5px 0;"><strong>آدرس ارسال:</strong> ${data.shippingAddress}</p>
          </div>
          
          <h2 style="color: #0F766E; font-size: 18px; margin-top: 30px; margin-bottom: 15px;">محصولات سفارش:</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background-color: #f8f9fa;">
                <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">محصول</th>
                <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">تعداد</th>
                <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">قیمت</th>
              </tr>
            </thead>
            <tbody>
              ${data.items.map(item => `
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd;">${item.name}</td>
                  <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${item.quantity}</td>
                  <td style="padding: 10px; text-align: left; border: 1px solid #ddd;">${item.price.toLocaleString('fa-IR')} تومان</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin-top: 30px;">
            شما می‌توانید وضعیت سفارش خود را از پنل کاربری پیگیری کنید.
          </p>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px; text-align: center; border-top: 1px solid #eee; padding-top: 20px;">
            با تشکر،<br>
            <strong>تیم استیدلی</strong>
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
    subject: `به‌روزرسانی وضعیت سفارش ${data.orderNumber} - استیدلی`,
    html: `
      <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #F3F8F7;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 12px;"><img src="${LOGO_URL}" width="64" height="64" alt="استیدلی" style="border-radius: 14px;" /></div>
          <h1 style="color: #0F766E; text-align: center; margin-bottom: 30px;">به‌روزرسانی سفارش</h1>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            سلام <strong>${data.name}</strong>،
          </p>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            وضعیت سفارش شما با شماره <strong>${data.orderNumber}</strong> تغییر کرده است.
          </p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center;">
            <p style="color: #0F766E; font-size: 18px; font-weight: bold; margin: 0;">
              ${data.statusText}
            </p>
          </div>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin-top: 30px;">
            شما می‌توانید جزئیات بیشتر را از پنل کاربری مشاهده کنید.
          </p>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px; text-align: center; border-top: 1px solid #eee; padding-top: 20px;">
            با تشکر،<br>
            <strong>تیم استیدلی</strong>
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
    subject: `یادآوری رزرو ${data.serviceName} - استیدلی`,
    html: `
      <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #F3F8F7;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 12px;"><img src="${LOGO_URL}" width="64" height="64" alt="استیدلی" style="border-radius: 14px;" /></div>
          <h1 style="color: #0F766E; text-align: center; margin-bottom: 30px;">یادآوری رزرو</h1>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            سلام <strong>${data.name}</strong>،
          </p>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            این ایمیل به عنوان یادآوری رزرو شما برای ${data.serviceName} ارسال شده است.
          </p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p style="color: #666; font-size: 14px; margin: 5px 0;"><strong>نوع خدمات:</strong> ${data.serviceName}</p>
            <p style="color: #666; font-size: 14px; margin: 5px 0;"><strong>تاریخ:</strong> ${data.bookingDate}</p>
            <p style="color: #666; font-size: 14px; margin: 5px 0;"><strong>ساعت:</strong> ${data.bookingTime}</p>
          </div>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin-top: 30px;">
            لطفاً در زمان مقرر حاضر باشید.
          </p>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px; text-align: center; border-top: 1px solid #eee; padding-top: 20px;">
            با تشکر،<br>
            <strong>تیم استیدلی</strong>
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
      from: `"استیدلی" <${process.env.SMTP_USER}>`,
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
    pending: 'در انتظار پرداخت',
    processing: 'در حال پردازش',
    shipped: 'ارسال شده',
    delivered: 'تحویل داده شده',
    cancelled: 'لغو شده',
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

