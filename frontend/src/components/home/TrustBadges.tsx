import { Shield, RotateCcw, Truck, Phone, Award } from "lucide-react";

const badges = [
  { icon: Truck, title: "Free Delivery", desc: "On orders above ৳1,500" },
  { icon: RotateCcw, title: "Easy Returns", desc: "7-day hassle-free returns" },
  { icon: Shield, title: "Secure Payment", desc: "bKash, Nagad, Cards" },
  { icon: Award, title: "100% Authentic", desc: "Genuine handcrafted products" },
  { icon: Phone, title: "24/7 Support", desc: "Hotline: 16577" },
];

export default function TrustBadges() {
  return (
    <section className="bg-brand-50 border-y border-brand-100 py-8 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-6">
        {badges.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex flex-col items-center text-center">
            <div className="w-11 h-11 rounded-full bg-brand-100 flex items-center justify-center mb-3">
              <Icon size={20} className="text-brand-700" />
            </div>
            <span className="font-semibold text-sm text-brand-900 mb-0.5">{title}</span>
            <span className="text-xs text-brand-500">{desc}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
