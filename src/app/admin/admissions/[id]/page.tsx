"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Loader2, 
  Phone, 
  Mail, 
  Contact,
  MapPin,
  User, 
  ShieldCheck, 
  AlertTriangle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AdmissionDetails() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchStudent = useCallback(async () => {
    if (!id || id === "undefined") return;
    try {
      setLoading(true);
      setErrorMsg(null);
      const { data, error } = await supabase
        .from("admissions")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        setErrorMsg(error.message);
      } else {
        setStudent(data);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id && id !== "undefined") {
      fetchStudent();
    }
  }, [id, fetchStudent]);

  async function handleUpdateStatus(newStatus: string) {
  if (!student) return;
  setIsProcessing(true);

  try {
    const { error: supabaseError } = await supabase
      .from("admissions")
      .update({ status: newStatus }) 
      .eq("id", id);

    if (supabaseError) throw new Error(supabaseError.message);

    if (newStatus === "admitted") {
      const year = new Date().getFullYear();
      const { count } = await supabase.from("students").select("*", { count: 'exact', head: true });
      const officialID = `PHS/${year}/${String((count || 0) + 1).padStart(3, '0')}`;

      await supabase.from("students").insert([{
        full_name: `${student.first_name} ${student.surname}`,
        admission_number: officialID,
        current_class: student.class_applying_for,
        parent_fullname: student.sponsor_name,
        parent_email: student.sponsor_email,
        parent_address: student.sponsor_address,
        registration_status: "pending_registration" 
      }]);

      await fetch("/api/send-approval-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: student.sponsor_email,
          name: `${student.first_name} ${student.surname}`,
          class: student.class_applying_for,
          id: id, 
        }),
      });

      toast.success("Admission Approved! Letter is now viewable.");
    }
    fetchStudent();
  } catch (error: any) {
    toast.error(error.message);
  } finally {
    setIsProcessing(false);
  }
}

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-red-900 w-12 h-12 mb-4" />
        <p className="text-slate-500 font-bold animate-pulse uppercase text-xs tracking-widest">
          Loading Student Profile...
        </p>
      </div>
    );
  }

  if (errorMsg || !student) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-red-100 max-w-md w-full text-center">
          <AlertTriangle className="text-red-500 w-16 h-16 mx-auto mb-6" />
          <h2 className="text-2xl font-black text-slate-900 uppercase mb-2">Not Found</h2>
          <p className="text-slate-500 text-sm mb-6">{errorMsg || "Record not found."}</p>
          <Button onClick={() => router.push('/admin/admissions')} className="bg-red-900 text-white w-full rounded-xl font-bold h-12 uppercase text-xs">
            Back to List
          </Button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <Button onClick={() => router.back()} variant="ghost" className="mb-8 gap-2 font-black text-slate-500 hover:text-red-900 uppercase text-xs">
          <ArrowLeft size={18} /> Back to Admissions List
        </Button>

        <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
          <div className="bg-red-900 p-10 text-white relative">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
              <div className="flex items-center gap-6">
                {student.passport_url ? (
                  <img src={student.passport_url} className="w-28 h-28 rounded-[2rem] object-cover border-4 border-white/20 shadow-xl" alt="Passport" />
                ) : (
                  <div className="w-28 h-28 rounded-[2rem] bg-white/10 flex items-center justify-center border-4 border-white/10">
                    <User size={48} />
                  </div>
                )}
                <div>
                  <h1 className="text-4xl font-black uppercase tracking-tighter leading-none">
                    {student.first_name} {student.surname}
                  </h1>
                  <span className="bg-red-800 text-red-100 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-widest mt-2 inline-block">
                    Class: {student.class_applying_for}
                  </span>
                </div>
              </div>
              <div className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg ${student.status === 'admitted' ? 'bg-green-500' : 'bg-orange-500'} text-white`}>
                {student.status}
              </div>
            </div>
            <div className="absolute top-0 right-0 p-10 opacity-10"><ShieldCheck size={180} /></div>
          </div>

          <div className="p-10 md:p-14 grid md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <h3 className="text-[10px] font-black uppercase text-red-900 tracking-[0.3em] border-b pb-3 flex items-center gap-2">
                <User size={14} /> Student Profile
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <InfoItem label="Gender" value={student.gender} />
                <InfoItem label="Date of Birth" value={student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString() : "N/A"} />
              </div>
              <InfoItem label="Previous School" value={student.previous_school || "First-time Enrollment"} />
            </div>
            <div className="space-y-8">
              <h3 className="text-[10px] font-black uppercase text-red-900 tracking-[0.3em] border-b pb-3 flex items-center gap-2">
                <Phone size={14} /> Contact Information
              </h3>
              <div className="space-y-4">
                <ContactBox icon={<Contact size={18} />} label="Sponsor Name" value={student.sponsor_name} />
                <ContactBox icon={<Phone size={18} />} label="Sponsor Phone" value={student.sponsor_phone} />
                <ContactBox icon={<Mail size={18} />} label="Sponsor Email" value={student.sponsor_email} />
                <ContactBox icon={<MapPin size={18} />} label="Sponsor Address" value={student.sponsor_address} />
              </div>
            </div>
          </div>

          <div className="p-8 bg-slate-50/50 border-t flex flex-wrap justify-center gap-4">
            {student.status !== 'admitted' && (
              <Button 
                onClick={() => handleUpdateStatus('admitted')} 
                disabled={isProcessing} 
                className="bg-green-600 hover:bg-green-700 text-white px-10 rounded-2xl gap-3 h-16 font-black uppercase transition-all hover:scale-105"
              >
                {isProcessing ? <Loader2 className="animate-spin" /> : <CheckCircle size={22} />} Approve & Admit
              </Button>
            )}
            <Button 
              onClick={() => handleUpdateStatus('rejected')} 
              disabled={isProcessing} 
              variant="outline" 
              className="text-red-600 border-red-200 hover:bg-red-50 px-8 rounded-2xl gap-2 h-16 font-bold uppercase"
            >
              <XCircle size={20} /> Reject
            </Button>
            <Button 
              onClick={() => handleUpdateStatus('pending')} 
              disabled={isProcessing} 
              variant="ghost" 
              className="text-slate-400 hover:text-slate-600 px-8 rounded-2xl gap-2 h-16 font-bold uppercase"
            >
              <Clock size={20} /> Reset
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-slate-900 font-bold text-lg">{value}</p>
    </div>
  );
}

function ContactBox({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
      <div className="bg-white p-2 rounded-lg text-red-900 shadow-sm">{icon}</div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase">{label}</p>
        <p className="font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}