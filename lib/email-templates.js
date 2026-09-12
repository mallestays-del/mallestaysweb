const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const shell = (title, body) => `
<!doctype html><html><body style="margin:0;background:#f7f4ef;font-family:Arial,sans-serif;color:#28231f">
  <div style="max-width:620px;margin:32px auto;background:#fff;box-shadow:0 4px 20px #00000012">
    <header style="background:#1d2925;padding:28px;text-align:center;color:#d8b77b">
      <div style="font-size:25px;letter-spacing:4px;font-weight:700">MALLE STAYS™</div>
      <div style="font-size:11px;letter-spacing:2px;margin-top:8px;color:#fff">PRIVATE VILLAS · TIMELESS ESCAPES</div>
    </header>
    <main style="padding:34px 30px"><h1 style="font-family:Georgia,serif;font-weight:400;color:#1d2925">${title}</h1>${body}</main>
    <footer style="padding:22px 30px;background:#f0ece5;color:#756e65;font-size:12px;text-align:center">
      <strong>Malle Stays™</strong> · Luxury villa experiences<br>
      Questions? Reply to this email or WhatsApp us.<br>
      <a href="https://mallestays.com" style="color:#b28a52;text-decoration:none">mallestays.com</a>
    </footer>
  </div>
</body></html>`;

const row = (label, value) =>
  `<tr><td style="padding:9px 0;color:#756e65;width:40%">${label}</td><td style="padding:9px 0;font-weight:600">${escapeHtml(value)}</td></tr>`;

export function bookingConfirmationEmail(booking) {
  const safeId = escapeHtml(booking.bookingId);
  return {
    subject: `Booking Confirmed · ${booking.villaName}`,
    html: shell("Your Stay is Confirmed!", `<p>Dear ${escapeHtml(booking.guestName)},</p>
      <p>We are delighted to confirm your private villa escape at <strong>${escapeHtml(booking.villaName)}</strong>.</p>
      <table style="width:100%;border-collapse:collapse;margin:24px 0;border-top:2px solid #d8b77b;border-bottom:2px solid #d8b77b">
        ${row("Villa", booking.villaName)}
        ${row("Booking Reference", safeId)}
        ${row("Check-in", booking.checkIn)}
        ${row("Check-out", booking.checkOut)}
        ${row("Guests", booking.guests)}
        ${row("Nights", booking.nights || 1)}
        ${row("Total Amount", booking.total)}
        ${row("Amount Paid", booking.amountPaid)}
        ${row("Payment Status", booking.paymentStatus)}
      </table>
      <div style="background:#f0ece5;padding:20px;border-radius:8px;margin:24px 0">
        <h3 style="margin:0 0 12px 0;color:#1d2925;font-size:16px">Important Information</h3>
        <ul style="margin:0;padding-left:20px;color:#756e65;font-size:14px">
          <li>Check-in time: 2:00 PM onwards</li>
          <li>Check-out time: 11:00 AM</li>
          <li>Please carry a valid ID proof</li>
          <li>Our concierge team will contact you 24 hours before check-in</li>
        </ul>
      </div>
      ${booking.specialRequests ? `<p style="color:#756e65"><strong>Your Special Requests:</strong><br>${escapeHtml(booking.specialRequests)}</p>` : ''}
      <p style="color:#756e65">Keep this email for your records. Our concierge team is here to assist you with anything you need.</p>
      <p style="text-align:center;margin-top:30px">
        <a href="https://mallestays.com/villas" style="background:#b28a52;color:#fff;padding:14px 28px;text-decoration:none;border-radius:4px;display:inline-block">View Your Villa</a>
      </p>`),
    text: `Your Malle Stays™ booking is confirmed!\n\nVilla: ${booking.villaName}\nBooking Reference: ${booking.bookingId}\nCheck-in: ${booking.checkIn}\nCheck-out: ${booking.checkOut}\nGuests: ${booking.guests}\nNights: ${booking.nights || 1}\nTotal: ${booking.total}\nAmount Paid: ${booking.amountPaid}\nPayment Status: ${booking.paymentStatus}\n\nCheck-in: 2:00 PM | Check-out: 11:00 AM\n\nOur team will contact you 24 hours before check-in.\n\nQuestions? Reply to this email.\n\nMalle Stays™ - mallestays.com`,
  };
}

export function passwordResetEmail(name, resetUrl) {
  return {
    subject: "Reset Your Malle Stays™ Password",
    html: shell("Reset Your Password", `<p>Hello ${escapeHtml(name)},</p>
      <p>We received a request to reset your password for your Malle Stays™ admin account.</p>
      <p>Use the button below to choose a new password. This link expires in 15 minutes and can be used only once.</p>
      <p style="text-align:center;margin:30px 0">
        <a href="${escapeHtml(resetUrl)}" style="background:#b28a52;color:#fff;padding:14px 28px;text-decoration:none;border-radius:4px;display:inline-block;font-weight:600">RESET PASSWORD</a>
      </p>
      <div style="background:#fff5e6;padding:16px;border-left:4px solid #f59e0b;margin:24px 0">
        <p style="margin:0;font-size:14px;color:#92400e"><strong>Security Notice:</strong> If you did not request this password reset, please ignore this email. Do not forward this link to anyone.</p>
      </div>
      <p style="font-size:12px;color:#756e65">This link will expire in 15 minutes for your security.</p>`),
    text: `Reset your Malle Stays™ password\n\nHello ${name},\n\nUse this link to reset your password: ${resetUrl}\n\nThis link expires in 15 minutes and can be used only once.\n\nIf you did not request this, ignore this email and do not forward the link.\n\nMalle Stays™ - mallestays.com`,
  };
}

export function adminWelcomeEmail(name, email, tempPassword) {
  return {
    subject: "Welcome to Malle Stays™ Admin Portal",
    html: shell("Welcome to Malle Stays™", `<p>Hello ${escapeHtml(name)},</p>
      <p>Your admin account has been created successfully! You can now manage villas, bookings, pricing, and offers.</p>
      <table style="width:100%;border-collapse:collapse;margin:24px 0;background:#f0ece5;padding:20px;border-radius:8px">
        ${row("Email", email)}
        ${row("Temporary Password", tempPassword)}
      </table>
      <div style="background:#fff5e6;padding:16px;border-left:4px solid #f59e0b;margin:24px 0">
        <p style="margin:0;font-size:14px;color:#92400e"><strong>Important:</strong> Please change your password immediately after first login.</p>
      </div>
      <p style="text-align:center;margin-top:30px">
        <a href="https://mallestays.com/admin/login" style="background:#b28a52;color:#fff;padding:14px 28px;text-decoration:none;border-radius:4px;display:inline-block">LOGIN TO ADMIN PORTAL</a>
      </p>`),
    text: `Welcome to Malle Stays™ Admin Portal\n\nHello ${name},\n\nYour admin account is ready!\n\nEmail: ${email}\nTemporary Password: ${tempPassword}\n\nImportant: Change your password after first login.\n\nLogin at: https://mallestays.com/admin/login\n\nMalle Stays™ - mallestays.com`,
  };
}
