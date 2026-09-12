'use client';

import { Heart, Diamond, Globe, Users, Award, TrendingUp, MapPin, Shield, Phone } from 'lucide-react';
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
                  <span className="font-semibold text-yellow-700">Malle Stays™</span> is a growing premium staycation brand in India, offering handpicked villas and farmhouse experiences across the country. With a vision to redefine short getaways, we aim to provide travelers with luxurious, comfortable, and memorable stays in the most beautiful destinations.
                </p>
                <p className="leading-relaxed">
                  From the scenic hills of <strong>Lonavala</strong> and <strong>Igatpuri</strong> to upcoming destinations across India, Malle Stays is expanding rapidly to bring high-quality staycation options to every major travel hub.
                </p>
                <p className="leading-relaxed">
                  We specialize in curated villas that are perfect for <em>families, couples, and group stays</em>. Whether it's a weekend getaway, birthday celebration, private party, or a relaxing vacation, our properties are designed to offer the perfect blend of <strong>luxury, privacy, and comfort</strong>.
                </p>
                <p className="leading-relaxed">
                  Each villa listed with Malle Stays is carefully selected and verified to meet our quality standards. Our stays often feature <em>private swimming pools, scenic views, modern interiors, and premium amenities</em>, ensuring a consistent and elevated experience for every guest.
                </p>
                <p className="leading-relaxed">
                  At Malle Stays, we are committed to providing a <em>seamless and hassle-free booking experience</em>. With dedicated customer support and a focus on trust and transparency, we make sure your journey from booking to checkout is smooth and enjoyable.
                </p>
                <p className="leading-relaxed">
                  As we continue our <em>Pan India expansion</em>, our mission remains the same — to create unforgettable stay experiences and become one of India's most trusted villa stay brands.
                </p>
                <p className="leading-relaxed font-semibold text-slate-900 text-xl mt-6">
                  Stay anywhere in India. Stay with Malle Stays™.
                </p>
              </div>
            </div>

            {/* Right Column - ISO Certification */}
            <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl bg-slate-900 flex items-center justify-center p-8">
              <div className="text-center">
                <a 
                  href="https://www.iafcertsearch.org/certification/D4IXym52G4fIJNhoUlZOLWkW" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block group"
                >
                  <img
                    src="https://customer-assets-m6fa6gv7.emergentagent.net/job_635c75da-4d51-46de-b07f-a30b74c9f7e0/artifacts/1q7c82gc_WhatsApp%20Image%202026-09-12%20at%2011.50.03%20PM.jpeg"
                    alt="ISO 9001:2015 Certified"
                    className="w-80 h-auto mx-auto drop-shadow-2xl group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                  />
                  <div className="mt-6 text-white">
                    <h3 className="text-2xl font-bold mb-2 group-hover:text-yellow-400 transition-colors">Quality Certified</h3>
                    <p className="text-slate-300 mb-3">ISO 9001:2015 Certified Organization</p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm group-hover:bg-white/20 transition-all">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Click to Verify on IAF</span>
                    </div>
                  </div>
                </a>
              </div>
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
              To become one of India's most trusted and loved premium staycation brands — offering quality properties, exceptional hospitality, and unforgettable experiences across every major destination in the country.
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
                  <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-yellow-600 rounded-full opacity-20 -z-10"></div>
                </div>
              </div>

              {/* Founder Info */}
              <div className="lg:col-span-3">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-3xl font-bold text-slate-900 mb-2">Priya Singh</h3>
                    <p className="text-xl text-yellow-700 font-semibold mb-6">Founder, Malle Stays™</p>
                  </div>
                  
                  <div className="space-y-4 text-lg text-slate-700">
                    <p className="leading-relaxed">
                      Priya Singh founded Malle Stays with a vision to make staycations more accessible and enjoyable for travelers looking for relaxing getaways across India. With a passion for hospitality and travel, she focuses on creating comfortable villa experiences where guests can relax, celebrate and spend quality time with loved ones.
                    </p>
                    <p className="leading-relaxed">
                      Under her leadership, Malle Stays continues to grow by connecting guests with beautiful villas and farmhouses that offer privacy, comfort and nature-filled surroundings.
                    </p>
                  </div>

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
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              Why Choose Malle Stays™?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6">
              <div className="w-16 h-16 rounded-full bg-yellow-600 flex items-center justify-center mb-4">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">Handpicked Properties</h3>
              <p className="text-slate-600">
                Every villa is carefully selected and verified to meet our high standards of quality, luxury, and comfort.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6">
              <div className="w-16 h-16 rounded-full bg-yellow-600 flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">Trust & Transparency</h3>
              <p className="text-slate-600">
                Seamless and hassle-free booking experience with dedicated customer support from booking to checkout.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6">
              <div className="w-16 h-16 rounded-full bg-yellow-600 flex items-center justify-center mb-4">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">Pan India Presence</h3>
              <p className="text-slate-600">
                From Lonavala and Igatpuri to destinations across India — premium staycation options in every travel hub.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6">
              <div className="w-16 h-16 rounded-full bg-yellow-600 flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">Perfect for Everyone</h3>
              <p className="text-slate-600">
                Ideal for families, couples, and groups — weekend getaways, birthdays, parties, or relaxing vacations.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6">
              <div className="w-16 h-16 rounded-full bg-yellow-600 flex items-center justify-center mb-4">
                <Diamond className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">Premium Amenities</h3>
              <p className="text-slate-600">
                Private swimming pools, scenic views, modern interiors, BBQ setups, and more at every property.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6">
              <div className="w-16 h-16 rounded-full bg-yellow-600 flex items-center justify-center mb-4">
                <Phone className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">Dedicated Support</h3>
              <p className="text-slate-600">
                Our team is available to assist you before, during, and after your stay. We're just a call or message away.
              </p>
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
