import { Shield, RotateCcw, Truck, Phone, Award } from "lucide-react";

const badges = [
  { icon: Truck,    title: "Free Delivery",    desc: "On orders above ৳1,500" },
  { icon: RotateCcw, title: "Easy Returns",   desc: "7-day hassle-free returns" },
  { icon: Shield,   title: "Secure Payment",  desc: "bKash, Nagad, Visa & more" },
  { icon: Award,    title: "100% Authentic",  desc: "Genuine handcrafted products" },
  { icon: Phone,    title: "24/7 Support",    desc: "Hotline: 16577" },
];

export default function TrustBadges() {
  return (
    <section className="bg-brand-900 py-10 px-4 mt-16">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-4">
        {badges.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-full bg-brand-700 flex items-center justify-center mb-3">
              <Icon size={18} className="text-brand-200" />
            </div>
            <span className="font-semibold text-xs text-white mb-0.5 tracking-wide">{title}</span>
            <span className="text-[11px] text-brand-400 leading-tight">{desc}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
