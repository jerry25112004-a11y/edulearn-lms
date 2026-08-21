import { Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "./contact-form";

export const metadata = { title: "Contact Us" };

const CONTACT_INFO = [
  { icon: Mail, label: "Email", value: "support@edulearn.example" },
  { icon: Phone, label: "Phone", value: "+92 3456784321" },
  { icon: MapPin, label: "Address", value: "Blue Area, Islamabad, Pakistan" },
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900">Get in Touch</h1>
        <p className="mx-auto mt-2 max-w-xl text-slate-500">
          Questions about a course, enrollment, or partnership? Send us a message and our team
          will follow up shortly.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          {CONTACT_INFO.map((item) => (
            <div key={item.label} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">{item.label}</p>
                <p className="text-sm text-slate-500">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
