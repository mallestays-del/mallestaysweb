'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

const WELCOME_MESSAGE = `Hi 👋 Welcome to Malle Stays™!

🏡 Premium Villas in Badlapur, Igatpuri & Lonavala

How can I help you today?

1️⃣ Check Availability
2️⃣ Price & Packages
3️⃣ Villa Details
4️⃣ Photos & Videos
5️⃣ Location
6️⃣ Book Now
7️⃣ Talk to Owner`;

const BOT_RESPONSES = {
  '1': `📍 Please share your details:

📍 Location (Badlapur / Igatpuri / Lonavala)
📆 Check-in Date
📆 Check-out Date
👨‍👩‍👧 Guests Count

I will check and get back to you instantly 😊

Or call us directly:
📞 8446620191`,

  '2': `💰 Our Packages:

🏡 Badlapur Villas - Starting ₹5,000/night
🏡 Igatpuri Villas - Starting ₹6,000/night
🏡 Lonavala Villas - Starting ₹7,000/night

✅ Includes:
• Private Villa
• Swimming Pool
• Music System
• BBQ Setup
• Kitchen Access

📞 Call 8446620191 for best deals & group discounts!

Share your dates & guests count for exact pricing.`,

  '3': `✨ Our Villa Features:

🏊 Private Swimming Pool
🎵 Music System
🍖 BBQ Setup
👨‍🍳 Kitchen Available
🌿 Garden Area
🅿️ Free Parking

📍 Locations:
• Badlapur
• Igatpuri
• Lonavala

Which location are you interested in?`,

  '4': `Sure! 📸

Please check villa photos & details here:
👉 https://mallestays.com/villas

Or tell me the location, I will send specific villa photos.

📍 Badlapur
📍 Igatpuri
📍 Lonavala`,

  '5': `📍 Our Locations:

🏡 Badlapur
• 1.5 hrs from Mumbai
• Near Badlapur Station

🏡 Igatpuri
• 2.5 hrs from Mumbai
• Near Igatpuri Station

🏡 Lonavala
• 2 hrs from Mumbai/Pune
• Near Lonavala Station

Which location would you like to visit?`,

  '6': `✅ To confirm booking:

✔ Advance payment required
✔ ID proof mandatory
✔ Balance at check-in

💳 Payment via UPI / QR Code

Send your details to proceed:
📝 Name:
📆 Check-in Date:
📆 Check-out Date:
👥 Guests:
📍 Location:

Or contact us directly:
📞 8446620191
💬 WhatsApp for quick response`,

  '7': `You can directly contact us:

📞 8446620191

Or message on WhatsApp for quick response:
💬 https://wa.me/918446620191

Our team is available:
🕐 9:00 AM - 10:00 PM (All days)

We'll be happy to help! 😊`,
};

function getSmartResponse(message) {
  const msg = message.toLowerCase().trim();
  
  // Check for exact number matches
  if (BOT_RESPONSES[msg]) return BOT_RESPONSES[msg];
  
  // Check for keyword matches
  if (msg.includes('availability') || msg.includes('available') || msg.includes('check availability'))
    return BOT_RESPONSES['1'];
  if (msg.includes('price') || msg.includes('cost') || msg.includes('rate') || msg.includes('package') || msg.includes('tariff'))
    return BOT_RESPONSES['2'];
  if (msg.includes('villa') || msg.includes('detail') || msg.includes('feature') || msg.includes('amenit'))
    return BOT_RESPONSES['3'];
  if (msg.includes('photo') || msg.includes('video') || msg.includes('image') || msg.includes('gallery') || msg.includes('pic'))
    return BOT_RESPONSES['4'];
  if (msg.includes('location') || msg.includes('address') || msg.includes('where') || msg.includes('direction') || msg.includes('map'))
    return BOT_RESPONSES['5'];
  if (msg.includes('book') || msg.includes('reserve') || msg.includes('payment') || msg.includes('pay'))
    return BOT_RESPONSES['6'];
  if (msg.includes('owner') || msg.includes('contact') || msg.includes('call') || msg.includes('phone') || msg.includes('whatsapp') || msg.includes('talk'))
    return BOT_RESPONSES['7'];
  if (msg.includes('badlapur'))
    return `🏡 Badlapur Villas\n\nWe have premium villas in Badlapur, just 1.5 hrs from Mumbai!\n\n✨ Features: Pool, BBQ, Music System, Kitchen\n💰 Starting ₹5,000/night\n\n📞 Call 8446620191 for availability\n💬 WhatsApp: https://wa.me/918446620191`;
  if (msg.includes('igatpuri'))
    return `🏡 Igatpuri Villas\n\nBeautiful villas in Igatpuri, surrounded by nature!\n\n✨ Features: Pool, BBQ, Music System, Kitchen\n💰 Starting ₹6,000/night\n\n📞 Call 8446620191 for availability\n💬 WhatsApp: https://wa.me/918446620191`;
  if (msg.includes('lonavala'))
    return `🏡 Lonavala Villas\n\nLuxury villas in Lonavala, perfect weekend getaway!\n\n✨ Features: Pool, BBQ, Music System, Kitchen\n💰 Starting ₹7,000/night\n\n📞 Call 8446620191 for availability\n💬 WhatsApp: https://wa.me/918446620191`;
  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey'))
    return WELCOME_MESSAGE;
  if (msg.includes('thank') || msg.includes('thanks'))
    return `You're welcome! 😊\n\nFeel free to reach out anytime:\n📞 8446620191\n💬 WhatsApp: https://wa.me/918446620191\n\nHave a great day! 🌟`;
  if (msg.includes('menu') || msg.includes('help') || msg.includes('option'))
    return WELCOME_MESSAGE;
  
  // Default response
  return `Thank you for your message! 😊

For quick assistance, please choose an option:

1️⃣ Check Availability
2️⃣ Price & Packages
3️⃣ Villa Details
4️⃣ Photos & Videos
5️⃣ Location
6️⃣ Book Now
7️⃣ Talk to Owner

Or call us directly: 📞 8446620191`;
}

function MessageText({ text }) {
  // Convert URLs to clickable links and preserve line breaks
  const parts = text.split('\n');
  return (
    <div className="whitespace-pre-wrap text-sm leading-relaxed">
      {parts.map((line, i) => {
        // Convert URLs to links
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const segments = line.split(urlRegex);
        return (
          <div key={i}>
            {segments.map((segment, j) => {
              if (segment.match(urlRegex)) {
                return (
                  <a 
                    key={j} 
                    href={segment} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-yellow-600 underline hover:text-yellow-700"
                  >
                    {segment}
                  </a>
                );
              }
              return <span key={j}>{segment}</span>;
            })}
          </div>
        );
      })}
    </div>
  );
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', text: WELCOME_MESSAGE }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMessage = input;
    setMessages(prev => [...prev, { type: 'user', text: userMessage }]);
    setInput('');

    // Get response with small delay for natural feel
    setTimeout(() => {
      const response = getSmartResponse(userMessage);
      setMessages(prev => [...prev, { type: 'bot', text: response }]);
    }, 500);
  };

  const handleQuickOption = (option) => {
    setMessages(prev => [...prev, { type: 'user', text: option }]);
    setTimeout(() => {
      const response = BOT_RESPONSES[option] || getSmartResponse(option);
      setMessages(prev => [...prev, { type: 'bot', text: response }]);
    }, 500);
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-yellow-600 hover:bg-yellow-700 text-white rounded-full p-4 elegant-shadow transition-all duration-300 hover:scale-110 z-50"
          data-testid="chat-button"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[550px] bg-white rounded-lg elegant-shadow flex flex-col z-50 border border-slate-200" data-testid="chat-window">
          {/* Header */}
          <div className="bg-slate-900 text-white p-4 rounded-t-lg flex justify-between items-center border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5 text-yellow-600" />
              <div>
                <span className="font-semibold block text-sm">Malle Stays™ Support</span>
                <span className="text-xs text-green-400">● Online</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} data-testid="chat-close-button" className="hover:text-yellow-600 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" data-testid="chat-messages">
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  data-testid={`chat-message-${msg.type}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-lg ${
                      msg.type === 'user'
                        ? 'bg-yellow-600 text-white rounded-br-none'
                        : 'bg-slate-100 text-slate-900 border border-slate-200 rounded-bl-none'
                    }`}
                  >
                    <MessageText text={msg.text} />
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Quick Options */}
          <div className="px-3 py-2 border-t flex gap-1 flex-wrap">
            {['1', '2', '3', '4', '5', '6', '7'].map((opt) => (
              <button
                key={opt}
                onClick={() => handleQuickOption(opt)}
                className="text-xs bg-slate-100 hover:bg-yellow-100 hover:text-yellow-700 border border-slate-200 rounded-full px-2.5 py-1 transition-colors"
              >
                {opt === '1' && '📅 Availability'}
                {opt === '2' && '💰 Prices'}
                {opt === '3' && '🏡 Villas'}
                {opt === '4' && '📸 Photos'}
                {opt === '5' && '📍 Location'}
                {opt === '6' && '✅ Book'}
                {opt === '7' && '📞 Contact'}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="p-3 border-t">
            <div className="flex space-x-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message or choose option..."
                className="text-sm"
                data-testid="chat-input"
              />
              <Button onClick={sendMessage} size="icon" className="bg-yellow-600 hover:bg-yellow-700" data-testid="chat-send-button">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
