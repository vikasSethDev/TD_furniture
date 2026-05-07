const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host:   process.env.EMAIL_HOST   || 'smtp.gmail.com',
    port:   parseInt(process.env.EMAIL_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: { rejectUnauthorized: false }
  });
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

const buildOrderEmailHTML = (order) => {
  const itemsHTML = order.items.map(item => `
    <tr>
      <td style="padding:12px 8px;border-bottom:1px solid #f0ece6;font-family:'Georgia',serif;color:#1a1a1a">${item.name}</td>
      <td style="padding:12px 8px;border-bottom:1px solid #f0ece6;text-align:center;color:#7a7067">${item.quantity}</td>
      <td style="padding:12px 8px;border-bottom:1px solid #f0ece6;text-align:right;color:#3e2c23;font-weight:600">${formatCurrency(item.price)}</td>
      <td style="padding:12px 8px;border-bottom:1px solid #f0ece6;text-align:right;color:#3e2c23;font-weight:600">${formatCurrency(item.price * item.quantity)}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><title>Order Confirmation</title></head>
    <body style="margin:0;padding:0;background:#f8f6f2;font-family:'Helvetica Neue',sans-serif">
      <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(62,44,35,0.10)">

        <!-- Header -->
        <div style="background:#3e2c23;padding:36px 40px;text-align:center">
          <div style="width:40px;height:40px;background:#c8a96a;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-family:Georgia,serif;color:#3e2c23;font-size:18px;font-style:italic;font-weight:700;margin-bottom:12px">M</div>
          <h1 style="margin:0;color:#f8f6f2;font-family:Georgia,serif;font-size:22px;font-weight:400;letter-spacing:2px">MAISON LUXE</h1>
          <p style="margin:8px 0 0;color:#c8a96a;font-size:11px;letter-spacing:3px;text-transform:uppercase">Order Confirmation</p>
        </div>

        <!-- Body -->
        <div style="padding:40px">
          <p style="color:#1a1a1a;font-size:16px;margin:0 0 8px">Dear <strong>${order.customerName}</strong>,</p>
          <p style="color:#7a7067;font-size:14px;line-height:1.7;margin:0 0 28px">
            Thank you for your order. We've received it and our team will process it shortly.
            Your order number is <strong style="color:#3e2c23">ML-${order._id.toString().slice(-6).toUpperCase()}</strong>.
          </p>

          <!-- Order Items -->
          <h3 style="color:#3e2c23;font-family:Georgia,serif;font-weight:500;font-size:16px;margin:0 0 16px;padding-bottom:8px;border-bottom:2px solid #c8a96a">Order Summary</h3>
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
            <thead>
              <tr style="background:#f8f6f2">
                <th style="padding:10px 8px;text-align:left;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#7a7067;font-weight:600">Item</th>
                <th style="padding:10px 8px;text-align:center;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#7a7067;font-weight:600">Qty</th>
                <th style="padding:10px 8px;text-align:right;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#7a7067;font-weight:600">Price</th>
                <th style="padding:10px 8px;text-align:right;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#7a7067;font-weight:600">Total</th>
              </tr>
            </thead>
            <tbody>${itemsHTML}</tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="padding:16px 8px 4px;text-align:right;font-size:13px;color:#7a7067">Subtotal</td>
                <td style="padding:16px 8px 4px;text-align:right;color:#1a1a1a;font-weight:500">${formatCurrency(order.subtotal)}</td>
              </tr>
              <tr>
                <td colspan="3" style="padding:4px 8px;text-align:right;font-size:13px;color:#7a7067">Shipping</td>
                <td style="padding:4px 8px;text-align:right;color:#1a1a1a">${order.shippingCost === 0 ? 'FREE' : formatCurrency(order.shippingCost)}</td>
              </tr>
              <tr style="background:#f8f6f2">
                <td colspan="3" style="padding:12px 8px;text-align:right;font-family:Georgia,serif;font-size:15px;color:#3e2c23;font-weight:600">Total</td>
                <td style="padding:12px 8px;text-align:right;font-family:Georgia,serif;font-size:18px;color:#3e2c23;font-weight:700">${formatCurrency(order.totalAmount)}</td>
              </tr>
            </tfoot>
          </table>

          <!-- Customer Details -->
          <h3 style="color:#3e2c23;font-family:Georgia,serif;font-weight:500;font-size:16px;margin:28px 0 16px;padding-bottom:8px;border-bottom:2px solid #c8a96a">Delivery Address</h3>
          <div style="background:#f8f6f2;border-radius:8px;padding:20px">
            <p style="margin:0 0 6px;color:#1a1a1a;font-weight:600">${order.customerName}</p>
            <p style="margin:0 0 4px;color:#7a7067;font-size:14px">${order.address.street}</p>
            <p style="margin:0 0 4px;color:#7a7067;font-size:14px">${order.address.city}, ${order.address.state} - ${order.address.pincode}</p>
            <p style="margin:0 0 4px;color:#7a7067;font-size:14px">${order.address.country}</p>
            <p style="margin:8px 0 0;color:#7a7067;font-size:14px">📞 ${order.phone}</p>
          </div>

          <div style="margin-top:32px;padding:20px;background:#3e2c23;border-radius:8px;text-align:center">
            <p style="margin:0;color:#c8a96a;font-family:Georgia,serif;font-size:13px;font-style:italic">
              "We take great care in crafting and delivering each piece to your door."
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background:#f8f6f2;padding:24px 40px;text-align:center;border-top:1px solid #e8e0d5">
          <p style="margin:0;color:#7a7067;font-size:11px;letter-spacing:1px">© 2025 MAISON LUXE · BESPOKE INTERIORS</p>
          <p style="margin:6px 0 0;color:#7a7067;font-size:11px">hello@maisonluxe.com · +91 98765 43210</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const sendOrderConfirmation = async (order) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('⚠️  Email credentials not configured — skipping email send');
    return;
  }
  try {
    const transporter = createTransporter();
    const html = buildOrderEmailHTML(order);

    // Email to customer
    await transporter.sendMail({
      from: `"Maison Luxe" <${process.env.EMAIL_USER}>`,
      to:   order.email,
      subject: `Order Confirmation — ML-${order._id.toString().slice(-6).toUpperCase()}`,
      html
    });

    // Email to admin
    if (process.env.ADMIN_EMAIL) {
      await transporter.sendMail({
        from:    `"Maison Luxe Store" <${process.env.EMAIL_USER}>`,
        to:      process.env.ADMIN_EMAIL,
        subject: `🛍️ New Order ML-${order._id.toString().slice(-6).toUpperCase()} — ${order.customerName}`,
        html
      });
    }

    console.log(`✅ Order confirmation emails sent for ${order.email}`);
  } catch (err) {
    console.error('❌ Email send failed:', err.message);
    // Don't throw — email failure shouldn't break the order
  }
};

module.exports = { sendOrderConfirmation };
