"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { 
  Loader2, UploadCloud, CheckCircle, User, 
  Calendar, Users, School, Phone, Mail, MapPin 
} from "lucide-react";
import { toast } from "sonner";

const modernInputClass = "w-full h-14 px-6 rounded-[1.25rem] border-2 border-slate-100 bg-slate-50 outline-none transition-all font-semibold text-slate-800 text-[0.95rem] focus:border-red-900 focus:bg-white focus:shadow-[0_10px_15px_-3px_rgba(127,29,29,0.1)] disabled:opacity-50 disabled:cursor-not-allowed";

const InputWrapper = ({ children, label, icon: Icon }: any) => (
  <div className="space-y-2">
    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
      {Icon && <Icon size={12} />} {label}
    </label>
    {children}
  </div>
);

export default function AdmissionPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    let passportUrl = "";

    try {
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      const dob = formData.get("dob");
      if (!dob) {
        toast.error("Date of birth is required");
        setLoading(false);
        return;
      }

      if (file) {
        const fileExt = file.name.split('.').pop();
        const studentName = (formData.get("first_name")?.toString() || "student").toLowerCase().replace(/\s+/g, '-');
        const fileName = `${studentName}-${Date.now()}.${fileExt}`;
        const filePath = `student-passports/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("passports")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from("passports").getPublicUrl(filePath);
        passportUrl = urlData.publicUrl;
      }

      const admissionData = {
        first_name: formData.get("first_name"),
        surname: formData.get("last_name"),
        dob: dob,
        gender: formData.get("gender"),
        class_applying_for: formData.get("class"),
        sponsor_name: formData.get("sponsor_name"),
        sponsor_phone: formData.get("sponsor_phone"),
        sponsor_email: formData.get("sponsor_email"),
        sponsor_address: formData.get("sponsor_address"),
        passport_url: passportUrl,
        status: "pending",
        created_at: new Date().toISOString(),
      };

      const { error: insertError, data } = await supabase
        .from("admissions")
        .insert([admissionData])
        .select();

      if (insertError) throw insertError;

      toast.success("Application submitted successfully!");
      setSubmitted(true);
    } catch (error: any) {
      console.error("Submission error:", error);
      toast.error("Submission failed: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  if (!mounted) return null;

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-slate-50">
        <div className="bg-white p-12 rounded-[3rem] shadow-2xl max-w-lg w-full border border-slate-100">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-green-600 w-12 h-12" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Application Received!</h1>
          <p className="text-slate-500 mt-4 font-medium leading-relaxed">
            Thank you for choosing Possible Height Schools. Your application has been logged into our portal for review.
          </p>
          <Button 
            onClick={() => window.location.href = "/"} 
            className="mt-10 w-full h-16 bg-red-900 hover:bg-red-800 rounded-2xl text-lg font-bold shadow-xl shadow-red-900/20"
          >
            Return to Homepage
          </Button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#fdfdfd] pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-4xl">
        
        <div className="text-center mb-12 space-y-3">
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic">Admissions Form</h1>
          <p className="text-slate-500 font-medium text-lg uppercase tracking-widest">Possible Height Schools Portal</p>
          <div className="h-1.5 w-24 bg-red-900 mx-auto rounded-full" />
        </div>

        <div className="bg-white rounded-[4rem] shadow-sm border border-slate-100 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 md:p-16 space-y-16">
            
            <section className="flex flex-col md:flex-row items-center gap-10">
              <div className="relative group">
                <div className="w-48 h-48 bg-slate-50 rounded-[2.5rem] border-4 border-white shadow-xl overflow-hidden flex items-center justify-center">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <User size={60} className="text-slate-200" />
                  )}
                </div>
                <label htmlFor="passport-upload" className="absolute -bottom-2 -right-2 bg-red-900 text-white p-4 rounded-2xl shadow-lg cursor-pointer hover:scale-110 transition-transform active:scale-95">
                  <UploadCloud size={20} />
                </label>
                <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="hidden" id="passport-upload" required />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-black text-slate-900 uppercase">Passport Photograph</h3>
                <p className="text-slate-400 font-medium max-w-sm">Please upload a clear studio-quality headshot. This will be used for your official student identity card.</p>
              </div>
            </section>

            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-red-50 text-red-900 rounded-xl flex items-center justify-center font-black">01</div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Applicant Information</h3>
              </div>
              
              <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
                <InputWrapper label="First Name" icon={User}>
                  <input name="first_name" placeholder="John" required className={modernInputClass} />
                </InputWrapper>
                <InputWrapper label="Surname" icon={User}>
                  <input name="last_name" placeholder="Doe" required className={modernInputClass} />
                </InputWrapper>
                <InputWrapper label="Date of Birth" icon={Calendar}>
                  <input 
                    name="dob" 
                    type="date" 
                    required 
                    className={modernInputClass}
                    max={new Date().toISOString().split('T')[0]} 
                  />
                </InputWrapper>
                <InputWrapper label="Gender" icon={Users}>
                  <select name="gender" className={modernInputClass} defaultValue="Male" required>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </InputWrapper>
                <div className="md:col-span-2">
                  <InputWrapper label="Class Applying For" icon={School}>
                    <select name="class" required className={modernInputClass} defaultValue="">
                      <option value="" disabled>Select Class</option>
                      {["Pre-School", "Grade 1", "Grade 2", "Grade 3", "Basic 1", "Basic 2", "Basic 3", 
                      "Basic 4", "Basic 5", "Basic 6", "JSS 1", "JSS 2", "JSS 3", "SSS 1", "SSS 2", "SSS 3"].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </InputWrapper>
                </div>
              </div>
            </div>

            <div className="space-y-8 pt-8 border-t border-slate-50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-red-50 text-red-900 rounded-xl flex items-center justify-center font-black">02</div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Sponsor / Parent Details</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="md:col-span-2">
                  <InputWrapper label="Full Name of Guardian" icon={User}>
                    <input name="sponsor_name" placeholder="Mr./Mrs. Doe" required className={modernInputClass} />
                  </InputWrapper>
                </div>
                <InputWrapper label="Phone Number" icon={Phone}>
                  <input name="sponsor_phone" placeholder="+234..." type="tel" required className={modernInputClass} />
                </InputWrapper>
                <InputWrapper label="Email Address" icon={Mail}>
                  <input name="sponsor_email" placeholder="example@mail.com" type="email" required className={modernInputClass} />
                </InputWrapper>
                <div className="md:col-span-2">
                  <InputWrapper label="Residential Address" icon={MapPin}>
                    <textarea name="sponsor_address" rows={3} required className={`${modernInputClass} py-4 h-auto`}></textarea>
                  </InputWrapper>
                </div>
              </div>
            </div>

            <Button 
              type="submit"
              disabled={loading}
              className="w-full h-20 bg-slate-900 hover:bg-black text-white font-black text-xl rounded-[2rem] shadow-2xl transition-all active:scale-[0.98]"
            >
              {loading ? <Loader2 className="animate-spin" /> : "FINALIZE APPLICATION"}
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}