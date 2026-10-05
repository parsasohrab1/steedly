# Email System Setup Guide

## 📧 SMTP settings

The email system is implemented with `nodemailer`. To enable email sending, you must set the following environment variables in the `.env` file.

### Required environment variables

```env
# Enable/disable the email system
EMAIL_ENABLED=true

# SMTP settings
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Frontend address (for email links)
FRONTEND_URL=http://localhost:3001
```

### Settings for different services

#### Gmail
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password  # You must use an App Password
```

**Note**: For Gmail you must use an [App Password](https://support.google.com/accounts/answer/185833), not your main password.

#### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

#### Yahoo
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password
```

#### Iranian services (such as Iran Mail)
```env
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@your-provider.com
SMTP_PASS=your-password
```

### Production settings

For the Production environment, it is recommended to use professional email services:

#### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

#### Mailgun
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-mailgun-username
SMTP_PASS=your-mailgun-password
```

#### Amazon SES
```env
SMTP_HOST=email-smtp.region.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-ses-username
SMTP_PASS=your-ses-password
```

## 📝 Types of emails sent

The email system supports the following templates:

### 1. Registration confirmation
- **When sent**: After successful registration
- **Email content**: Welcome and registration confirmation

### 2. Password recovery
- **When sent**: When password recovery is requested
- **Email content**: Password recovery link (valid for 1 hour)

### 3. Order confirmation
- **When sent**: After a successful order is placed
- **Email content**: Full order details including:
  - Order number
  - Product list
  - Total amount
  - Shipping address

### 4. Order status change
- **When sent**: When the order status changes
- **Email content**: Status change notification (processing, shipped, delivered, canceled)

### 5. Service booking reminder
- **When sent**: After a successful booking
- **Email content**: Booking details including:
  - Service type (veterinarian or horse transporter)
  - Service provider name
  - Booking date and time

## 🔧 Usage in code

### Sending the registration confirmation email
```typescript
import { sendRegistrationEmail } from '../services/emailService';

await sendRegistrationEmail(user.email, user.full_name);
```

### Sending the password recovery email
```typescript
import { sendPasswordResetEmail } from '../services/emailService';

const resetToken = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
await sendPasswordResetEmail(user.email, user.full_name, resetToken);
```

### Sending the order confirmation email
```typescript
import { sendOrderConfirmationEmail } from '../services/emailService';

await sendOrderConfirmationEmail(
  user.email,
  user.full_name,
  {
    orderNumber: 'ORD-123456',
    totalAmount: 500000,
    items: [
      { name: 'Product 1', quantity: 2, price: 250000 }
    ],
    shippingAddress: 'Tehran, ... Street',
  }
);
```

### Sending the order status change email
```typescript
import { sendOrderStatusUpdateEmail } from '../services/emailService';

await sendOrderStatusUpdateEmail(
  user.email,
  user.full_name,
  'ORD-123456',
  'shipped'
);
```

### Sending the booking reminder email
```typescript
import { sendBookingReminderEmail } from '../services/emailService';

await sendBookingReminderEmail(
  user.email,
  user.full_name,
  'veterinarian',
  'Dr. Ahmadi',
  '1403/12/20',
  '14:00'
);
```

## 🧪 Testing in the Development environment

In the Development environment, if `EMAIL_ENABLED=false`, the email system is disabled and only logs to the console:

```typescript
// In emailService.ts
if (process.env.EMAIL_ENABLED !== 'true') {
  console.log('Email service is disabled. Email would be sent to:', to);
  return true;
}
```

## ⚠️ Important Notes

1. **Security**: Never hardcode passwords or sensitive information in code. Always use environment variables.

2. **Rate Limiting**: To prevent abuse, it is recommended to apply Rate Limiting to email-related endpoints (such as password recovery).

3. **Error Handling**: The email system is designed so that if sending an email fails, the main operation (such as registration or placing an order) is not stopped.

4. **Logging**: All email-related errors are logged to the console. In Production, send these logs to a central logging system.

5. **Spam**: To avoid spam, use professional email services and configure SPF, DKIM and DMARC.

## 📚 More resources

- [Nodemailer Documentation](https://nodemailer.com/about/)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [Email Best Practices](https://www.campaignmonitor.com/dev-resources/guides/best-practices/)

---

**Update date**: 2025/03/06

