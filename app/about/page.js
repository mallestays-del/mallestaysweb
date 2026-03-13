'use client';

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

      {/* Our Mission & Values Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              Our Mission & Values
            </h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              At Malle Stays, we are guided by principles that ensure every guest receives exceptional service and unforgettable experiences.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Value 1 */}
            <Card className="text-center hover:shadow-xl transition-shadow duration-300 border-0 bg-slate-50">
              <CardContent className="pt-8 pb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-100 mb-6">
                  <Heart className="h-10 w-10 text-yellow-700" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-slate-900">Hospitality First</h3>
                <p className="text-slate-600 leading-relaxed">
                  We create warm, personalized, and memorable stays for every guest. Your comfort and satisfaction are our top priorities.
                </p>
              </CardContent>
            </Card>

            {/* Value 2 */}
            <Card className="text-center hover:shadow-xl transition-shadow duration-300 border-0 bg-slate-50">
              <CardContent className="pt-8 pb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-100 mb-6">
                  <Diamond className="h-10 w-10 text-yellow-700" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-slate-900">Luxury & Comfort</h3>
                <p className="text-slate-600 leading-relaxed">
                  Every villa is chosen to provide elegance with modern convenience. Experience the perfect blend of sophistication and relaxation.
                </p>
              </CardContent>
            </Card>

            {/* Value 3 */}
            <Card className="text-center hover:shadow-xl transition-shadow duration-300 border-0 bg-slate-50">
              <CardContent className="pt-8 pb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-100 mb-6">
                  <Globe className="h-10 w-10 text-yellow-700" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-slate-900">Authentic Experiences</h3>
                <p className="text-slate-600 leading-relaxed">
                  We embrace local culture, ensuring every stay feels unique and special. Discover the true essence of each destination.
                </p>
              </CardContent>
            </Card>
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
