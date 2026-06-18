import Link from "next/link";
import { Phone, Mail, MapPin, Share2, Video, Globe } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-brand-900 text-brand-200">
      {/* Newsletter */}
      <div className="border-b border-brand-800 py-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h3 className="font-serif text-2xl text-white mb-2">Stay Connected</h3>
          <p className="text-brand-300 text-sm mb-6">Subscribe for exclusive offers, new arrivals & artisan stories</p>
          <div className="flex max-w-md mx-auto gap-2">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 px-4 py-2.5 rounded-lg bg-brand-800 border border-brand-700 text-white placeholder:text-brand-400 focus:outline-none focus:border-brand-500 text-sm"
            />
            <button className="px-5 py-2.5 bg-brand-500 hover:bg-brand-400 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="col-span-2 md:col-span-1">
          <div className="mb-4">
            <span className="font-serif text-2xl font-bold text-white">Shopora</span>
            <span className="block text-[10px] tracking-widest text-brand-400 uppercase">Bangladesh</span>
          </div>
          <p className="text-brand-300 text-sm leading-relaxed mb-5">
            Celebrating the rich heritage of Bangladeshi craftsmanship. Every product tells a story.
          </p>
          <div className="flex gap-3">
            {[Share2, Video, Globe].map((Icon, i) => (
              <a key={i} href="#" className="w-8 h-8 rounded-full bg-brand-800 flex items-center justify-center hover:bg-brand-600 transition-colors">
                <Icon size={15} className="text-brand-300" />
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Shop</h4>
          <ul className="space-y-2.5">
            {["Women", "Men", "Kids", "Home & Living", "Jewellery", "Accessories", "Sale"].map((item) => (
              <li key={item}>
                <Link href={`/category/${item.toLowerCase().replace(/ & /g, "-")}`}
                  className="text-brand-300 hover:text-white text-sm transition-colors">
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Help */}
        <div>
          <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Help</h4>
          <ul className="space-y-2.5">
            {["Track Order", "Returns & Exchange", "Size Guide", "Store Locator", "FAQs", "Contact Us"].map((item) => (
              <li key={item}>
                <Link href="#" className="text-brand-300 hover:text-white text-sm transition-colors">{item}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Contact</h4>
          <ul className="space-y-3">
            <li className="flex items-start gap-2.5">
              <Phone size={14} className="text-brand-400 mt-0.5 shrink-0" />
              <span className="text-brand-300 text-sm">16577 (Hotline)<br />10AM - 10PM</span>
            </li>
            <li className="flex items-start gap-2.5">
              <Mail size={14} className="text-brand-400 mt-0.5 shrink-0" />
              <span className="text-brand-300 text-sm">support@shopora.com.bd</span>
            </li>
            <li className="flex items-start gap-2.5">
              <MapPin size={14} className="text-brand-400 mt-0.5 shrink-0" />
              <span className="text-brand-300 text-sm">346 Tejgaon I/A,<br />Dhaka 1208</span>
            </li>
          </ul>
          <div className="mt-5">
            <p className="text-brand-400 text-xs mb-2.5">We Accept</p>
            <div className="flex flex-wrap gap-1.5">
              {["bKash", "Nagad", "Rocket", "VISA", "MC"].map((p) => (
                <span key={p} className="px-2 py-1 bg-brand-800 rounded text-brand-200 text-[10px] font-medium border border-brand-700">
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-brand-800 py-5 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-brand-400">
          <span>© 2024 Shopora Bangladesh. All rights reserved.</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
