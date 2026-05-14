'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Building2, Facebook, Instagram, Twitter, Mail, Phone, MapPin, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white border-t border-slate-800" data-testid="footer">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center space-x-3 mb-6">
              <Image 
                src="https://customer-assets.emergentagent.com/job_villa-retreat-app/artifacts/5po3y6s4_image.png" 
                alt="Malle Stays Logo" 
                width={150}
                height={50}
                className="h-12 w-auto"
                quality={100}
              />
            </Link>
            <p className="text-slate-400 mb-6 leading-relaxed">
              Curated luxury villas and estates for discerning travelers seeking exceptional experiences.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/profile.php?id=61580271326579" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-yellow-600 transition-colors duration-300" data-testid="social-facebook">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://www.instagram.com/mallestays?igsh=MTJ0Zm4xeHRicDV3Zg==&utm_source=ig_contact_invite" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-yellow-600 transition-colors duration-300" data-testid="social-instagram">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://x.com/MalleStays" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-yellow-600 transition-colors duration-300" data-testid="social-twitter">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://www.linkedin.com/in/mallestays" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-yellow-600 transition-colors duration-300" data-testid="social-linkedin">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-6 text-lg">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link href="/villas" className="text-slate-400 hover:text-yellow-600 transition-colors duration-300" data-testid="footer-villas">Browse Properties</Link></li>
              <li><Link href="/about" className="text-slate-400 hover:text-yellow-600 transition-colors duration-300" data-testid="footer-about">About Us</Link></li>
              <li><Link href="/gallery" className="text-slate-400 hover:text-yellow-600 transition-colors duration-300" data-testid="footer-gallery">Gallery</Link></li>
              <li><Link href="/reviews" className="text-slate-400 hover:text-yellow-600 transition-colors duration-300" data-testid="footer-reviews">Reviews</Link></li>
              <li><Link href="/partner" className="text-slate-400 hover:text-yellow-600 transition-colors duration-300" data-testid="footer-partner">Partner With Us</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-6 text-lg">Legal</h3>
            <ul className="space-y-3">
              <li><Link href="/privacy" className="text-slate-400 hover:text-yellow-600 transition-colors duration-300">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-slate-400 hover:text-yellow-600 transition-colors duration-300">Terms & Conditions</Link></li>
            </ul>
          </div>

          {/* Locations */}
          <div>
            <h3 className="font-semibold mb-6 text-lg">Destinations</h3>
            <ul className="space-y-3">
              <li><Link href="/villas?location=Lonavala" className="text-slate-400 hover:text-yellow-600 transition-colors duration-300">Lonavala</Link></li>
              <li><Link href="/villas?location=Alibaug" className="text-slate-400 hover:text-yellow-600 transition-colors duration-300">Alibaug</Link></li>
              <li><Link href="/villas?location=Karjat" className="text-slate-400 hover:text-yellow-600 transition-colors duration-300">Karjat</Link></li>
              <li><Link href="/villas?location=Igatpuri" className="text-slate-400 hover:text-yellow-600 transition-colors duration-300">Igatpuri</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-6 text-lg">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3 text-slate-400">
                <Phone className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                <a href="tel:+918446620191" className="hover:text-yellow-600 transition-colors">+91 8446620191</a>
              </li>
              <li className="flex items-center space-x-3 text-slate-400">
                <Mail className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                <a href="mailto:connect@mallestays.com" className="hover:text-yellow-600 transition-colors">connect@mallestays.com</a>
              </li>
              <li className="flex items-start space-x-3 text-slate-400">
                <MapPin className="h-4 w-4 mt-1 text-yellow-600 flex-shrink-0" />
                <span>01 Panvelkar Estate, Badlapur East, Mumbai, Maharashtra 421503</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Certifications */}
        <div className="border-t border-slate-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-6">
            <a
              href="/about#certifications"
              className="group flex items-center gap-4 bg-slate-800/60 hover:bg-slate-800 border border-yellow-600/30 hover:border-yellow-600/60 rounded-xl px-5 py-3 transition-all duration-300"
              data-testid="iso-badge-footer"
              aria-label="ISO 9001:2015 Certified - Quality Management System"
            >
              <Image
                src="https://customer-assets.emergentagent.com/job_b1d835aa-4c65-43d7-a984-604f09f9b89e/artifacts/mj1huj7p_ISO.jpeg"
                alt="ISO 9001:2015 Certified"
                width={56}
                height={56}
                className="h-14 w-14 object-contain rounded-md"
              />
              <div className="text-left">
                <p className="text-sm font-semibold text-yellow-500 leading-tight">ISO 9001:2015 Certified</p>
                <p className="text-xs text-slate-400 leading-tight">Quality Management System</p>
                <p className="text-[11px] text-slate-500 leading-tight">Travel & Accommodation Services</p>
              </div>
            </a>
          </div>
          <div className="text-center">
            <p className="text-slate-500">&copy; {new Date().getFullYear()} Malle Stays. All rights reserved. Crafted with excellence.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}