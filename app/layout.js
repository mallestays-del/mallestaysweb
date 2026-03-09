import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ChatBot from '@/components/ChatBot';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Malle Stays - Luxury Villa Rentals',
  description: 'Curated luxury villas and bungalows for your perfect staycation. Find your dream villa in Lonavala, Alibaug, Karjat, and more.',
  keywords: 'luxury villas, vacation rentals, staycation, Lonavala, Alibaug, Karjat, private pool villas',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <main className="min-h-screen pt-16">
          {children}
        </main>
        <Footer />
        <ChatBot />
        <Toaster />
      </body>
    </html>
  );
}
