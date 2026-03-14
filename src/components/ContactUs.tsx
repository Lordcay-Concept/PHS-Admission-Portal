"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Send, Loader2, Mail, Phone, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ContactUs() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      subject: formData.get("subject"),
      message: formData.get("message"),
    };

    const { error } = await supabase.from("feedback").insert([data]);

    setLoading(false);

    if (error) {
      toast.error("Error sending feedback: " + error.message);
    } else {
      toast.success("Feedback sent successfully! We will get back to you.");
      (e.target as HTMLFormElement).reset();
    }
  };

  return (
    <section id="contact" className="relative bg-[#FFFBF5] py-24 overflow-hidden scroll-mt-20">
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
                Get in <span className="text-red-900">Touch</span>
              </h2>
              <p className="text-slate-600 text-lg font-medium">
                Have questions about admissions or our curriculum? Our team is ready to assist you.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <ContactCard 
                icon={<MapPin className="text-red-900" />} 
                title="Our Campus" 
                detail="12 School Road, Utako, Abuja, Nigeria"
              />
              <ContactCard 
                icon={<Phone className="text-red-900" />} 
                title="Phone Number" 
                detail="+234 (0) 123 456 7890" 
              />
              <ContactCard 
                icon={<Mail className="text-red-900" />} 
                title="Email Address" 
                detail="info@possibleheightschools.com" 
              />
              <ContactCard 
                icon={<Clock className="text-red-900" />} 
                title="Office Hours" 
                detail="Mon - Fri: 7:00 AM - 5:00 PM" 
              />
            </div>
          </div>

          <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl border border-red-50">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Send us a Feedback</h3>
              <p className="text-gray-500 text-sm font-medium">Your feedback helps us serve our students better.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <input 
                  name="name" 
                  type="text" 
                  required 
                  placeholder="Your Name" 
                  className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-red-900 outline-none text-sm font-medium" 
                />
                <input 
                  name="email" 
                  type="email" 
                  required 
                  placeholder="Email Address" 
                  className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-red-900 outline-none text-sm font-medium" 
                />
              </div>
              <input 
                name="subject" 
                type="text" 
                placeholder="Subject" 
                className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-red-900 outline-none text-sm font-medium" 
              />
              <textarea 
                name="message" 
                required 
                placeholder="Your Message" 
                rows={4} 
                className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-red-900 outline-none text-sm font-medium"
              ></textarea>
              <Button 
                disabled={loading} 
                className="w-full py-8 bg-red-900 hover:bg-red-800 text-white font-bold rounded-2xl text-lg gap-3 shadow-lg shadow-red-100 transition-transform active:scale-95"
              >
                {loading ? (
                  <><Loader2 className="animate-spin" /> Processing...</>
                ) : (
                  <>Submit Feedback <Send size={18} /></>
                )}
              </Button>
            </form>
          </div>

        </div>
      </div>
    </section>
  );
}

function ContactCard({ icon, title, detail }: { icon: React.ReactNode, title: string, detail: string }) {
  return (
    <div className="flex gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
      <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider">{title}</h4>
        <p className="text-slate-500 text-sm leading-relaxed">{detail}</p>
      </div>
    </div>
  );
}