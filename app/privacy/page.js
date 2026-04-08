'use client';

import { Shield } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-slate-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-600 mb-6">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Privacy Policy
          </h1>
          <p className="text-lg text-slate-300">Your privacy and data security are our top priorities</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="prose prose-lg max-w-none">
          <p className="text-slate-600 leading-relaxed mb-8">
            As a Malle Stays user, you entrust us with sensitive information, including your phone details, address, and bank account numbers. 
            This Privacy Policy outlines our practices regarding the collection and utilization of your personal information. By accessing or 
            using this website, you explicitly consent to the use and disclosure of your personal information as described herein. Please review 
            this policy regularly as it may be updated without prior notice.
          </p>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4 text-slate-900">Personal Information</h2>
              <ul className="list-disc pl-6 space-y-2 text-slate-700">
                <li>Name and Gender</li>
                <li>Phone Number</li>
                <li>Email Address</li>
                <li>Contact Address</li>
                <li>Password</li>
                <li>Financial Information (Bank Account, Credit/Debit Card, etc.)</li>
                <li>Health Conditions</li>
                <li>Other Details (Biometric, Medical Records, etc.)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-slate-900">Information Collection & Uses</h2>
              <p className="text-slate-700 leading-relaxed">
                While visiting our website, you may not be required to share personal details. However, for bookings, information such as name, 
                phone number, email, billing, and payment details are necessary. We also collect data to improve services, personalize your experience, 
                and ensure security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-slate-900">Cookies</h2>
              <p className="text-slate-700 leading-relaxed">
                Cookies are small files stored on your device that help us analyze site usage and enhance user experience. Most are session-based 
                and automatically deleted when your session ends. You may disable cookies in your browser, though some features may be limited.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-slate-900">Use of Information</h2>
              <p className="text-slate-700 leading-relaxed">
                Your information may be used for processing reservations, improving services, marketing, fraud detection, and communications regarding 
                bookings and offers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-slate-900">Sharing with Third Parties</h2>
              <p className="text-slate-700 leading-relaxed">
                Your data may be shared with trusted service providers, authorities, or in compliance with legal requirements. In cases of restructuring 
                or transfer, your data rights may also be transferred.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-slate-900">Security</h2>
              <p className="text-slate-700 leading-relaxed">
                We employ administrative, technological, and physical safeguards to protect your information. However, absolute security cannot be 
                guaranteed due to potential risks of unauthorized access.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-slate-900">Modifications</h2>
              <p className="text-slate-700 leading-relaxed">
                We reserve the right to update this Privacy Policy periodically. Please review this page to stay informed.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-slate-900">Grievance Procedure</h2>
              <p className="text-slate-700 leading-relaxed">
                For complaints or concerns, please contact us at: <a href="mailto:connect@mallestays.com" className="text-yellow-700 font-semibold hover:underline">connect@mallestays.com</a>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-slate-900">Consent</h2>
              <p className="text-slate-700 leading-relaxed">
                By using this website, you consent to the collection and use of your personal information in accordance with this Privacy Policy.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-200">
            <p className="text-center text-slate-600">
              © 2026 Malle Stays™. All rights reserved.<br />
              Contact: <a href="tel:+918446620191" className="text-yellow-700 font-semibold hover:underline">+91 84466 20191</a> | <a href="mailto:connect@mallestays.com" className="text-yellow-700 font-semibold hover:underline">connect@mallestays.com</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
