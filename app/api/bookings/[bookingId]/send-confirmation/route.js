import { NextResponse } from 'next/server';
import { resend, fromAddress } from '@/lib/resend';
import { bookingConfirmationEmail } from '@/lib/email-templates';
import { getDatabase } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

// Send booking confirmation email
export async function POST(request, { params }) {
  try {
    const { bookingId } = params;
    
    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID required' }, { status: 400 });
    }

    // Fetch booking from database
    const db = await getDatabase();
    const booking = await db.collection('bookings').findOne({ bookingId });
    
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check if email already sent
    if (booking.confirmationEmailSentAt) {
      return NextResponse.json({ 
        message: 'Email already sent', 
        sentAt: booking.confirmationEmailSentAt 
      });
    }

    // Prepare email data
    const emailData = {
      guestName: booking.guestName,
      villaName: booking.villaName,
      bookingId: booking.bookingId,
      checkIn: new Date(booking.checkIn).toLocaleDateString('en-GB', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      }),
      checkOut: new Date(booking.checkOut).toLocaleDateString('en-GB', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      }),
      guests: booking.guests,
      nights: booking.nights || 1,
      total: `₹${booking.totalAmount?.toLocaleString() || '0'}`,
      amountPaid: `₹${booking.amountPaid?.toLocaleString() || '0'}`,
      paymentStatus: booking.paymentStatus === 'paid' ? 'Paid' : 'Pending',
      specialRequests: booking.specialRequests || ''
    };

    const email = bookingConfirmationEmail(emailData);

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: [booking.guestEmail],
      subject: email.subject,
      html: email.html,
      text: email.text,
      tags: [
        { name: 'type', value: 'booking_confirmation' },
        { name: 'booking_id', value: bookingId }
      ],
    }, { 
      idempotencyKey: `booking-confirmation/${bookingId}` 
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: 'Email delivery failed' }, { status: 502 });
    }

    // Update booking record
    await db.collection('bookings').updateOne(
      { bookingId },
      { 
        $set: { 
          confirmationEmailSentAt: new Date(),
          confirmationEmailId: data?.id 
        } 
      }
    );

    return NextResponse.json({ 
      success: true, 
      emailId: data?.id,
      message: 'Booking confirmation email sent successfully'
    });

  } catch (error) {
    console.error('Error sending booking confirmation:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
