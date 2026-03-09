'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Home, Building2, Image, Star, Phone, Handshake } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/villas', label: 'Villas', icon: Building2 },
    { href: '/gallery', label: 'Gallery', icon: Image },
    { href: '/reviews', label: 'Reviews', icon: Star },
    { href: '/contact', label: 'Contact', icon: Phone },
    { href: '/partner', label: 'Partner With Us', icon: Handshake },
  ];

  return (
    <nav className="fixed top-0 w-full bg-slate-900 backdrop-blur-md z-50 border-b border-slate-800" data-testid="navbar">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3" data-testid="logo-link">
            <Building2 className="h-8 w-8 text-yellow-600" />
            <span className="text-2xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Malle Stays</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Button variant="ghost" className="flex items-center space-x-2 text-slate-300 hover:text-white hover:bg-slate-800 font-medium" data-testid={`nav-${link.label.toLowerCase().replace(/\s/g, '-')}`}>
                  <link.icon className="h-4 w-4" />
                  <span>{link.label}</span>
                </Button>
              </Link>
            ))}
            <Link href="/admin/login">
              <Button className="ml-4 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold" data-testid="admin-login-btn">Admin Login</Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white"
            data-testid="mobile-menu-button"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-2" data-testid="mobile-menu">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setIsOpen(false)}>
                <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/20" data-testid={`mobile-nav-${link.label.toLowerCase().replace(/\s/g, '-')}`}>
                  <link.icon className="h-4 w-4 mr-2" />
                  {link.label}
                </Button>
              </Link>
            ))}
            <Link href="/admin/login" onClick={() => setIsOpen(false)}>
              <Button className="w-full bg-white text-purple-600 hover:bg-gray-100" data-testid="mobile-admin-login-btn">Admin Login</Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}