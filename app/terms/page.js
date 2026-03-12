'use client';

import { FileText, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-slate-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-600 mb-6">
            <FileText className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Terms & Conditions
          </h1>
          <p className="text-lg text-slate-300">Please read these terms carefully before making a booking</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Alert className="mb-8 bg-yellow-50 border-yellow-200">
          <AlertCircle className="h-4 w-4 text-yellow-700" />
          <AlertDescription className="text-yellow-800">
            Malle Stays is an online & offline platform providing temporary properties/accommodations under the brand "Malle Stays". 
            These Terms apply to all Guests booking via any channel (website, app, third party, offline, referrals, etc.). 
            Please read carefully before booking. We may revise these Terms at any time without notice. Continued use means you accept changes.
          </AlertDescription>
        </Alert>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4 text-slate-900">Cancellation Policy</h2>
            <ul className="space-y-2 text-slate-700">
              <li className="flex items-start">
                <span className="font-semibold mr-2">Full Refund:</span>
                <span>Cancel ≥ 15 days before check-in → full refund.</span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold mr-2">Partial Refund:</span>
                <span>Cancel 10–14 days before check-in → 50% refund.</span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold mr-2">No Refund:</span>
                <span>Cancel &lt; 10 days before check-in → no refund.</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-slate-900">Relocation Policy</h2>
            <p className="text-slate-700 leading-relaxed">
              No relocation (to another property) is permitted once booking confirmed.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-slate-900">Reschedule Policy</h2>
            <div className="space-y-3 text-slate-700">
              <p><span className="font-semibold">By Guest:</span> Request up to 15 days before check-in. If new dates cost more, pay difference + reschedule fee. Cannot reschedule during peak dates.</p>
              <p><span className="font-semibold">By Malle Stays:</span> We may cancel and offer (i) alternative comparable property, (ii) future credit valid for 3 months, or (iii) full refund.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-slate-900">Check-in / Check-out</h2>
            <ul className="list-disc pl-6 space-y-2 text-slate-700">
              <li>Standard check-in: 2 PM</li>
              <li>Standard check-out: 11 AM</li>
              <li>Early check-in to 1 PM subject to availability (complimentary)</li>
              <li>Additional fee may apply for early check-in or late check-out</li>
              <li>Please confirm one day prior</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-slate-900">Processing Refunds</h2>
            <ul className="list-disc pl-6 space-y-2 text-slate-700">
              <li>Refunds due will be processed within 7 working days</li>
              <li>A 5% cancellation processing fee may apply</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-slate-900">House Rules & Guest Conduct</h2>
            <ul className="list-disc pl-6 space-y-2 text-slate-700">
              <li>Guests must not disturb neighbors—no loud music after 10 PM</li>
              <li>Property only for staying – no parties or unlawful activities</li>
              <li>No possession/consumption of illegal items or substances</li>
              <li>No removal of furniture or structural changes allowed</li>
              <li>Guests exceeding property's max occupancy: additional fees or eviction possible</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-slate-900">Pet Policy</h2>
            <p className="text-slate-700 leading-relaxed">
              Pets may be allowed at discretion. Unauthorized pets are not permitted and may result in eviction. Pets are not allowed in pools. 
              Violation may incur ₹5,000 fine.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-slate-900">Liability</h2>
            <p className="text-slate-700 leading-relaxed">
              Malle Stays acts only as a platform; not liable for guest mishaps, property issues, misuse, negligence, or third-party acts. 
              We're not responsible for power cuts, structural defects, or emergencies. Guests responsible for valuables, parking, and safety. 
              No lifeguard provided—guests swim at their own risk.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-slate-900">Booking Confirmation</h2>
            <p className="text-slate-700 leading-relaxed">
              Booking becomes valid only after full payment. If payment is not received timely, booking may be canceled. 
              For third-party bookings, our terms prevail.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-slate-900">Advance / Security Deposit & Damages</h2>
            <ul className="list-disc pl-6 space-y-2 text-slate-700">
              <li>Advance payment required to confirm booking</li>
              <li>Guests must report damages within 90 minutes of check-in or incur liability</li>
              <li>Damage cost may exceed deposit; excess payable within 7 days</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-slate-900">Force Majeure</h2>
            <p className="text-slate-700 leading-relaxed">
              Events beyond control (natural disasters, strikes, govt orders, epidemics) relieve liability for affected performance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-slate-900">Grievances / Redressal</h2>
            <p className="text-slate-700 leading-relaxed">
              For grievances, contact <a href="mailto:connect@mallestays.com" className="text-yellow-700 font-semibold hover:underline">connect@mallestays.com</a>. We commit to timely resolution.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200">
          <p className="text-center text-slate-600">
            © 2026 Malle Stays. All rights reserved.<br />
            Contact: <a href="tel:+918446620191" className="text-yellow-700 font-semibold hover:underline">+91 84466 20191</a> | <a href="mailto:connect@mallestays.com" className="text-yellow-700 font-semibold hover:underline">connect@mallestays.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}
