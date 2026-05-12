'use client';

import Image from 'next/image';
import { Heart, Diamond, Globe, Users, Award, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* About Us Section */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text */}
            <div>
              <h1 className="text-5xl font-bold mb-6 text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                About Us
              </h1>
              <div className="space-y-4 text-lg text-slate-700">
                <p className="leading-relaxed">
                  <span className="font-semibold text-yellow-700">Malle Stays</span> is a staycation brand dedicated to providing comfortable and memorable villa and farmhouse experiences near Mumbai. Our goal is to help travelers escape the busy city life and enjoy peaceful stays surrounded by nature.
                </p>
                <p className="leading-relaxed">
                  We offer carefully selected villas and farmhouses that are perfect for couples, families and group stays. Whether you are planning a weekend getaway, birthday celebration, family gathering or corporate outing, Malle Stays provides the ideal stay option with modern amenities and beautiful locations.
                </p>
                <p className="leading-relaxed">
                  Our properties are located in some of the most popular staycation destinations such as <strong>Karjat</strong>, <strong>Badlapur</strong>, <strong>Neral</strong> and <strong>Igatpuri</strong>, offering guests a perfect blend of relaxation and entertainment. Many of our villas feature private swimming pools, nature views, indoor and outdoor games and in-house food options.
                </p>
                <p className="leading-relaxed">
                  At Malle Stays, we focus on providing a smooth and hassle-free booking experience along with reliable customer support. Our mission is to make every stay special so that guests can create unforgettable memories with their friends and family.
                </p>
              </div>
            </div>

            {/* Right Column - Image */}
            <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800"
                alt="Luxury Villa"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Vision Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              Our Vision
            </h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Our vision is to become one of the most trusted staycation brands for villa and farmhouse bookings near Mumbai by offering quality properties, great hospitality and memorable experiences.
            </p>
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              Meet Our Founder
            </h2>
          </div>
          
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
              {/* Founder Image */}
              <div className="lg:col-span-2">
                <div className="relative">
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                    <img
                      src="https://customer-assets.emergentagent.com/job_a4c1098d-f670-4e85-91f6-3f257cd66a10/artifacts/qx0fcb78_IMG-20260313-WA0008.jpg"
                      alt="Priya Singh - Founder, Malle Stays"
                      className="w-full h-auto object-cover"
                    />
                  </div>
                  {/* Decorative Element */}
                  <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-yellow-600 rounded-full opacity-20 -z-10"></div>
                </div>
              </div>

              {/* Founder Info */}
              <div className="lg:col-span-3">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-3xl font-bold text-slate-900 mb-2">Priya Singh</h3>
                    <p className="text-xl text-yellow-700 font-semibold mb-6">Founder, Malle Stays</p>
                  </div>
                  
                  <div className="space-y-4 text-lg text-slate-700">
                    <p className="leading-relaxed">
                      Priya Singh founded Malle Stays with a vision to make staycations more accessible and enjoyable for travelers looking for relaxing getaways near Mumbai. With a passion for hospitality and travel, she focuses on creating comfortable villa experiences where guests can relax, celebrate and spend quality time with loved ones.
                    </p>
                    <p className="leading-relaxed">
                      Under her leadership, Malle Stays continues to grow by connecting guests with beautiful villas and farmhouses that offer privacy, comfort and nature-filled surroundings.
                    </p>
                  </div>

                  {/* Quote or Highlight */}
                  <div className="border-l-4 border-yellow-600 pl-6 py-4 bg-yellow-50 rounded-r-lg">
                    <p className="text-lg italic text-slate-700">
                      "Creating memorable stays and unforgettable experiences is at the heart of everything we do at Malle Stays."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              Why Choose Malle Stays?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6">
              <div className="w-16 h-16 rounded-full bg-yellow-600 flex items-center justify-center mb-4">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">Handpicked Properties</h3>
              <p className="text-slate-600">
                Every villa is carefully selected to meet our high standards of quality, luxury, and comfort.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6">
              <div className="w-16 h-16 rounded-full bg-yellow-600 flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">Dedicated Support</h3>
              <p className="text-slate-600">
                Our team is available to assist you before, during, and after your stay. We're just a message away on WhatsApp.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6">
              <div className="w-16 h-16 rounded-full bg-yellow-600 flex items-center justify-center mb-4">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">Best Locations</h3>
              <p className="text-slate-600">
                From beachside escapes to mountain retreats, we offer villas in India's most sought-after destinations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Certifications Section */}
      <section id="certifications" className="py-20 bg-white" data-testid="about-certifications-section">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-yellow-50 text-yellow-700 border border-yellow-200 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-4">
              <Award className="h-3.5 w-3.5" />
              Our Certifications
            </div>
            <h2 className="text-4xl font-bold mb-4 text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              Internationally Recognized Quality
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              We're proud to be officially certified for delivering excellence in every stay.
            </p>
          </div>

          <div className="max-w-3xl mx-auto bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 md:p-12 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="flex justify-center">
                <Image
                  src="https://customer-assets.emergentagent.com/job_b1d835aa-4c65-43d7-a984-604f09f9b89e/artifacts/bp6ln6rx_ISO.jpeg"
                  alt="ISO 9001:2015 Certified - Quality Management System for Travel & Accommodation Services"
                  width={260}
                  height={260}
                  className="h-52 w-52 md:h-60 md:w-60 object-contain"
                />
              </div>
              <div className="text-white">
                <p className="text-xs font-bold tracking-[0.2em] text-yellow-500 uppercase mb-2">Certificate</p>
                <h3 className="text-2xl md:text-3xl font-bold mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                  ISO 9001:2015
                </h3>
                <p className="text-slate-300 mb-5 leading-relaxed">
                  Quality Management System certification for Travel & Accommodation Services — independently verified to international standards.
                </p>
                <div className="space-y-2 text-sm text-slate-300">
                  <p className="flex items-center gap-2"><span className="text-yellow-500">✓</span> Globally recognized quality standard</p>
                  <p className="flex items-center gap-2"><span className="text-yellow-500">✓</span> Audited & verified compliance</p>
                  <p className="flex items-center gap-2"><span className="text-yellow-500">✓</span> Continuous improvement framework</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 bg-gradient-to-r from-yellow-600 to-yellow-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
            Ready to Experience Luxury?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Discover our handpicked collection of luxury villas and start planning your perfect getaway today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/villas"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-yellow-700 font-bold rounded-lg hover:bg-slate-100 transition-colors"
            >
              Explore Our Villas
            </a>
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-lg hover:bg-white hover:text-yellow-700 transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
