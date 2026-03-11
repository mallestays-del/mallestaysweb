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
              <img 
                src="https://customer-assets.emergentagent.com/job_villa-retreat-app/artifacts/5po3y6s4_image.png" 
                alt="Malle Stays Logo" 
                className="h-10 w-auto"
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
              <li><Link href="/gallery" className="text-slate-400 hover:text-yellow-600 transition-colors duration-300" data-testid="footer-gallery">Gallery</Link></li>
              <li><Link href="/reviews" className="text-slate-400 hover:text-yellow-600 transition-colors duration-300" data-testid="footer-reviews">Reviews</Link></li>
              <li><Link href="/partner" className="text-slate-400 hover:text-yellow-600 transition-colors duration-300" data-testid="footer-partner">Partner With Us</Link></li>
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

        <div className="border-t border-slate-800 mt-12 pt-8 text-center">
          <p className="text-slate-500">&copy; {new Date().getFullYear()} Malle Stays. All rights reserved. Crafted with excellence.</p>
        </div>
      </div>
    </footer>
  );
}