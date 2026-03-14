"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, Heart, ShieldAlert, Save, Loader2, ArrowLeft, Users, MapPin, CheckCircle2, ChevronDown, Calendar } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface StudentData {
  [key: string]: any;
}

export default function StudentProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<StudentData>({});
  const [initialData, setInitialData] = useState<StudentData>({});

  useEffect(() => {
    const fetchProfile = async () => {
      const id = localStorage.getItem("student_id");
      console.log("Searching for ID:", id); 
      if (!id) {
        toast.error("Authentication session not found.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("admission_number", id)
        .single();
      if (error) console.error("Supabase Error:", error.message);
      if (data) {
        console.log("Data Found:", data);
        setFormData(data);
        setInitialData(data); 
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const isLocked = (field: string) => {
    return initialData[field] !== null && initialData[field] !== "" && initialData[field] !== undefined;
  };

  const requiredFields = [
    "middle_name", "gender", "dob", "religion", 
    "state_of_origin", "lga", "home_town", 
    "permanent_address", "contact_address",
    "blood_group", "genotype",
    "sponsor_name", "sponsor_relationship", "sponsor_phone", "sponsor_email", "sponsor_address",
    "nok_name", "nok_relationship", "nok_phone", "nok_email"
  ];

  const isFormComplete = requiredFields.every(field => 
    formData[field] && formData[field].toString().trim() !== ""
  );

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormComplete) {
      toast.error("Please fill all required fields before saving.");
      return;
    }

    setSaving(true);
    const id = localStorage.getItem("student_id");
    const { error } = await supabase.from("students").update(formData).eq("admission_number", id);

    if (error) {
      toast.error("Update failed");
    } else {
      toast.success("Dossier updated and secured!");
      setInitialData(formData); 
    }
    setSaving(false);
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-red-900" size={40} /></div>;

  return (
    <div className="max-w-7xl mx-auto p-6 pb-24 space-y-10 animate-in fade-in duration-500">
      <Link href="/portal/student/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-red-900 font-black text-[10px] uppercase tracking-[0.2em] transition-all w-fit">
        <ArrowLeft size={14} /> Back to Dashboard
      </Link>

      <div className="border-b-8 border-red-900 pb-6">
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Student Dossier</h1>
        <p className="text-slate-500 text-lg font-bold uppercase tracking-tight">Permanent Academic Profile & Records</p>
      </div>

      <form onSubmit={handleUpdate} className="space-y-12">
        
        <div className="flex flex-col items-center justify-center space-y-6">
             <div className="w-56 aspect-square bg-slate-100 rounded-[3rem] overflow-hidden border-[12px] border-white shadow-2xl relative">
                {formData.passport_url ? (
                  <img src={formData.passport_url} alt="Passport" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300"><User size={80} /></div>
                )}
             </div>
             <div className="bg-red-900 px-10 py-4 rounded-[2rem] text-center shadow-xl">
                <p className="text-red-300 text-[10px] font-black uppercase tracking-widest">Admission Number</p>
                <p className="text-white font-black text-2xl tracking-tighter">{formData.admission_number}</p>
             </div>
        </div>

        <Card className="p-10 rounded-[3rem] border-none shadow-sm bg-white space-y-10 w-full">
            <SectionHeader icon={<User size={20}/>} title="Student Personal Information" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-black">
                <Field label="Surname" value={formData.surname} readOnly={isLocked('surname')} tall />
                <Field label="First Name" value={formData.first_name} readOnly={isLocked('first_name')} tall />
                <Field label="Middle Name" value={formData.middle_name} readOnly={isLocked('middle_name')} onChange={(v: string) => setFormData({...formData, middle_name: v})} tall />
                <Field 
                    label="Gender" 
                    type="select" 
                    options={["Male", "Female"]}
                    value={formData.gender} 
                    readOnly={isLocked('gender')}
                    onChange={(v: string) => setFormData({...formData, gender: v})} 
                    tall
                />
                <Field 
                    label="Date of Birth" 
                    type="date" 
                    value={formData.dob} 
                    readOnly={isLocked('dob')}
                    onChange={(v: string) => setFormData({...formData, dob: v})} 
                    tall
                />
                <Field label="Religion" value={formData.religion} readOnly={isLocked('religion')} onChange={(v: string) => setFormData({...formData, religion: v})} tall />
            </div>
        </Card>

        <Card className="p-10 rounded-[3rem] border-none shadow-sm bg-white space-y-8 w-full">
          <SectionHeader icon={<MapPin size={20}/>} title="Origin & Residential Details" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-black">
            <Field label="State of Origin" value={formData.state_of_origin} readOnly={isLocked('state_of_origin')} onChange={(v: string) => setFormData({...formData, state_of_origin: v})} />
            <Field label="LGA of Origin" value={formData.lga} readOnly={isLocked('lga')} onChange={(v: string) => setFormData({...formData, lga: v})} />
            <Field label="Home Town" value={formData.home_town} readOnly={isLocked('home_town')} onChange={(v: string) => setFormData({...formData, home_town: v})} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Permanent Home Address" value={formData.permanent_address} readOnly={isLocked('permanent_address')} onChange={(v: string) => setFormData({...formData, permanent_address: v})} />
            <Field label="Contact Address" value={formData.contact_address} readOnly={isLocked('contact_address')} onChange={(v: string) => setFormData({...formData, contact_address: v})} />
          </div>
        </Card>

        <Card className="p-10 rounded-[3rem] border-none shadow-sm bg-white space-y-8 w-full">
           <SectionHeader icon={<Heart size={20}/>} title="Medical Records" />
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <Field label="Blood Group" value={formData.blood_group} readOnly={isLocked('blood_group')} onChange={(v: string) => setFormData({...formData, blood_group: v})} />
             <Field label="Genotype" value={formData.genotype} readOnly={isLocked('genotype')} onChange={(v: string) => setFormData({...formData, genotype: v})} />
           </div>
        </Card>

        <Card className="p-10 rounded-[3rem] border-none shadow-sm bg-white space-y-8 w-full">
           <SectionHeader icon={<Users size={20}/>} title="Sponsor / Parent Information" />
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <Field label="Sponsor Full Name" value={formData.sponsor_name} readOnly={isLocked('sponsor_name')} onChange={(v: string) => setFormData({...formData, sponsor_name: v})} />
             <Field label="SponsorRelationship" value={formData.sponsor_relationship} readOnly={isLocked('sponsor_relationship')} onChange={(v: string) => setFormData({...formData, sponsor_relationship: v})} />
             <Field label="Sponsor Mobile Number" value={formData.sponsor_phone} readOnly={isLocked('sponsor_phone')} onChange={(v: string) => setFormData({...formData, sponsor_phone: v})} />
             <Field label="Sponsor Email Address" value={formData.sponsor_email} readOnly={isLocked('sponsor_email')} onChange={(v: string) => setFormData({...formData, sponsor_email: v})} />
             <Field label="Sponsor Residential Address" className="md:col-span-2" value={formData.sponsor_address} readOnly={isLocked('sponsor_address')} onChange={(v: string) => setFormData({...formData, sponsor_address: v})} />
           </div>
        </Card>

        <Card className="p-10 rounded-[3rem] border-none shadow-sm bg-white space-y-8 w-full">
          <SectionHeader icon={<ShieldAlert size={20}/>} title="Emergency Contact (Next of Kin)" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Next of Kin Full Name" value={formData.nok_name} readOnly={isLocked('nok_name')} onChange={(v: string) => setFormData({...formData, nok_name: v})} />
            <Field label="Next of Kin Relationship" value={formData.nok_relationship} readOnly={isLocked('nok_relationship')} onChange={(v: string) => setFormData({...formData, nok_relationship: v})} />
            <Field label="Next of Kin Mobile Number" value={formData.nok_phone} readOnly={isLocked('nok_phone')} onChange={(v: string) => setFormData({...formData, nok_phone: v})} />
            <Field label="Next of Kin Email Address" value={formData.nok_email} readOnly={isLocked('nok_email')} onChange={(v: string) => setFormData({...formData, nok_email: v})} />
          </div>
        </Card>

        <div className="space-y-6">
          <div className="p-10 bg-green-50 rounded-[3rem] border-4 border-dashed border-green-200 flex gap-6 items-center">
             <CheckCircle2 className="text-green-600 shrink-0" size={32} />
             <p className="text-green-900 text-sm font-black leading-relaxed italic">
                I hereby certify that all information provided in this Dossier is accurate and complete. I understand that any falsification of academic or personal records may result in immediate disciplinary action by the institution.
             </p>
          </div>

          <div className="flex flex-col items-center gap-4">
            {!isFormComplete && (
              <p className="text-red-500 text-[10px] font-black uppercase tracking-widest animate-pulse">
                * Please fill all fields to enable saving
              </p>
            )}
            <Button 
              type="submit" 
              disabled={saving || !isFormComplete} 
              className={`group px-20 h-20 rounded-[2.5rem] font-black text-xl shadow-2xl transition-all duration-300 active:scale-95 flex gap-4 ${
                !isFormComplete ? "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none" : "bg-red-900 text-white hover:bg-black"
              }`}
            >
              {saving ? <Loader2 className="animate-spin" size={24} /> : <> <Save size={24} className="group-hover:rotate-12 transition-transform" /> Submit & Save </>}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}


function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className={`flex items-center gap-4 border-b-2 border-slate-100 pb-5 mb-2`}>
      <span className={`text-red-900 bg-red-50 p-3 rounded-2xl`}>{icon}</span>
      <h3 className={`font-black uppercase text-lg tracking-tighter text-slate-800`}>{title}</h3>
    </div>
  );
}

function Field({ label, value, onChange, readOnly, type = "text", options = [], tall = false, className = "" }: any) {
  const baseInputStyles = `w-full rounded-2xl border-none px-6 font-bold shadow-inner transition-all outline-none appearance-none ${tall ? 'h-20 text-lg' : 'h-14 text-base'}`;
  const themeStyles = readOnly 
    ? 'bg-slate-100 cursor-not-allowed text-slate-400 opacity-70' 
    : 'bg-slate-50 text-slate-800 focus:bg-white focus:ring-4 ring-red-50';

  return (
    <div className={`space-y-2 ${className}`}>
      <label className={`text-[11px] font-black uppercase ml-5 tracking-widest text-slate-400`}>{label}</label>
      <div className="relative group">
        {type === "select" ? (
          <>
            <select
              value={value || ""}
              disabled={readOnly}
              onChange={(e) => onChange?.(e.target.value)}
              className={`${baseInputStyles} ${themeStyles} cursor-pointer`}
            >
              <option value="" disabled>Select {label}</option>
              {options.map((opt: string) => (
                <option key={opt} value={opt} className="text-slate-900">{opt}</option>
              ))}
            </select>
            {!readOnly && <ChevronDown size={20} className={`absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400`} />}
          </>
        ) : type === "date" ? (
          <>
            <input 
              type="date"
              value={value || ""} 
              readOnly={readOnly}
              onChange={(e) => onChange?.(e.target.value)}
              className={`${baseInputStyles} ${themeStyles}`}
            />
            {!readOnly && <Calendar size={18} className={`absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400`} />}
          </>
        ) : (
          <Input 
            type={type}
            value={value || ""} 
            readOnly={readOnly}
            onChange={(e) => onChange?.(e.target.value)}
            className={`${baseInputStyles} ${themeStyles}`} 
          />
        )}
      </div>
    </div>
  );
}