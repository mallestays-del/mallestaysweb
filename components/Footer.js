'use client';

import Link from 'next/link';
import { Building2, Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white" data-testid="footer">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Building2 className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">Malle Stays</span>
            </div>
            <p className="text-slate-400 mb-4">
              Curated luxury villas and bungalows for your perfect staycation.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-slate-400 hover:text-white" data-testid="social-facebook">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-white" data-testid="social-instagram">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-white" data-testid="social-twitter">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/villas" className="text-slate-400 hover:text-white" data-testid="footer-villas">Browse Villas</Link></li>
              <li><Link href="/gallery" className="text-slate-400 hover:text-white" data-testid="footer-gallery">Gallery</Link></li>
              <li><Link href="/reviews" className="text-slate-400 hover:text-white" data-testid="footer-reviews">Reviews</Link></li>
              <li><Link href="/partner" className="text-slate-400 hover:text-white" data-testid="footer-partner">Partner With Us</Link></li>
            </ul>
          </div>

          {/* Locations */}
          <div>
            <h3 className="font-semibold mb-4">Popular Locations</h3>
            <ul className="space-y-2">
              <li><Link href="/villas?location=Lonavala" className="text-slate-400 hover:text-white">Lonavala</Link></li>
              <li><Link href="/villas?location=Alibaug" className="text-slate-400 hover:text-white">Alibaug</Link></li>
              <li><Link href="/villas?location=Karjat" className="text-slate-400 hover:text-white">Karjat</Link></li>
              <li><Link href="/villas?location=Igatpuri" className="text-slate-400 hover:text-white">Igatpuri</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2 text-slate-400">
                <Phone className="h-4 w-4" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center space-x-2 text-slate-400">
                <Mail className="h-4 w-4" />
                <span>info@mallestays.com</span>
              </li>
              <li className="flex items-start space-x-2 text-slate-400">
                <MapPin className="h-4 w-4 mt-1" />
                <span>Mumbai, Maharashtra, India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
          <p>&copy; {new Date().getFullYear()} Malle Stays. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}