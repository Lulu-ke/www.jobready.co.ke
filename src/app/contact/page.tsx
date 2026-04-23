'use client';

import { useState } from 'react';
import { Mail, Phone, MessageCircle, MapPin, Clock } from 'lucide-react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import WhatsAppFloat from '@/components/whatsapp-float';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: '',
  });

  const subjectOptions = [
    'General Inquiry',
    'Job Listing Issue',
    'CV Writing Services',
    'Account Problem',
    'Partnership/Business',
    'Feedback & Suggestions',
    'Report a Bug',
    'Other',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Thank you for your message! We will get back to you within 24 hours.');
    setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-br from-[#1a56db] to-[#1e3a8a] py-16 text-white text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl lg:text-4xl font-bold mb-4">Get in Touch</h1>
            <p className="text-lg lg:text-xl text-blue-100 max-w-2xl mx-auto">
              Have a question, feedback, or need help? Our team is ready to assist you.
            </p>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-[1.5fr_1fr] gap-12">
              {/* Left — Contact Form */}
              <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Send Us a Message</h2>
                <p className="text-gray-500 mb-8">
                  Fill out the form below and we&apos;ll get back to you within 24 hours.
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Full Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Full Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a56db] focus:border-transparent text-gray-700 placeholder-gray-400"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@example.com"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a56db] focus:border-transparent text-gray-700 placeholder-gray-400"
                    />
                  </div>

                  {/* Subject */}
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Subject
                    </label>
                    <select
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a56db] focus:border-transparent text-gray-700 bg-white"
                    >
                      {subjectOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Message
                    </label>
                    <textarea
                      id="message"
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us how we can help you..."
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a56db] focus:border-transparent text-gray-700 placeholder-gray-400 resize-none"
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    className="w-full bg-[#1a56db] hover:bg-[#1649b8] text-white font-semibold text-sm px-6 py-3 rounded-lg transition-colors"
                  >
                    Send Message
                  </button>
                </form>
              </div>

              {/* Right — Contact Info Cards */}
              <div className="space-y-4">
                {/* Email */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-50 text-[#1a56db] rounded-lg flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 text-sm">Email</h3>
                    <p className="text-gray-600 text-sm mt-0.5">support@jobready.co.ke</p>
                    <p className="text-gray-400 text-xs mt-1">We reply within 24 hours</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-start gap-4">
                  <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-lg flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 text-sm">Phone</h3>
                    <p className="text-gray-600 text-sm mt-0.5">+254 786 090 635</p>
                    <p className="text-gray-400 text-xs mt-1">Mon-Fri, 8am - 6pm EAT</p>
                  </div>
                </div>

                {/* WhatsApp */}
                <a
                  href="https://wa.me/254786090635"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-white rounded-xl border border-green-200 shadow-sm p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center shrink-0">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 text-sm">WhatsApp</h3>
                      <p className="text-gray-600 text-sm mt-0.5">Chat with us instantly</p>
                      <p className="text-green-600 text-xs mt-1 font-medium">Open WhatsApp →</p>
                    </div>
                  </div>
                </a>

                {/* Office */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-start gap-4">
                  <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 text-sm">Office</h3>
                    <p className="text-gray-600 text-sm mt-0.5">Nairobi, Kenya</p>
                    <p className="text-gray-400 text-xs mt-1">Westlands area</p>
                  </div>
                </div>

                {/* Office Hours */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-start gap-4">
                  <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-lg flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 text-sm">Office Hours</h3>
                    <p className="text-gray-600 text-sm mt-0.5">Mon-Fri: 8am - 6pm</p>
                    <p className="text-gray-600 text-sm">Sat: 9am - 1pm</p>
                    <p className="text-gray-400 text-xs mt-1">Sun: Closed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
