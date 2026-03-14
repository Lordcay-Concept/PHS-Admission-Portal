"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Search, ArrowLeft, Loader2, Eye, Trash2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";

export default function AdmissionsListPage() {
  const [admissions, setAdmissions] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchAdmissions();
  }, []);

  async function fetchAdmissions() {
    const { data } = await supabase
      .from("admissions")
      .select("*")
      .order("created_at", { ascending: false });
    
    console.log("Fetched admissions:", data);
    setAdmissions(data || []);
    setLoading(false);
  }

  async function handleDeleteAdmission(id: string) {
    if (!confirm("Are you sure you want to delete this application?")) return;
    
    const { error } = await supabase
      .from("admissions")
      .delete()
      .eq("id", id);
    
    if (error) {
      toast.error("Could not delete application: " + error.message);
    } else {
      toast.success("Application deleted successfully");
      setAdmissions(prev => prev.filter(student => student.id !== id));
    }
  }

  const generateAdmissionNumber = async () => {
  try {
    const { data: lastStudent, error } = await supabase
      .from("students")
      .select("admission_number")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(); 

    if (error) throw error;

    let nextNumber = 1;
    
    if (lastStudent?.admission_number) {
      const match = lastStudent.admission_number.match(/\/(\d+)$/);
      if (match) {
        const lastNum = parseInt(match[1], 10);
        nextNumber = lastNum + 1;
      }
    }
    
    const year = new Date().getFullYear();
    const formattedNumber = nextNumber.toString().padStart(3, '0');
    return `PHS/${year}/${formattedNumber}`;
    
  } catch (error) {
    console.error("Error generating admission number:", error);
    const year = new Date().getFullYear();
    const timestamp = Date.now().toString().slice(-3);
    return `PHS/${year}/${timestamp}`;
  }
};

 const handleQuickApprove = async (application: any) => {
  setProcessing(application.id);
  try {
    const admissionNumber = await generateAdmissionNumber();
    
    const { error: updateError } = await supabase
      .from("admissions")
      .update({ 
        status: "approved"
      })
      .eq("id", application.id);

    if (updateError) throw updateError;

    const studentData = {
      admission_number: admissionNumber,
      first_name: application.first_name,
      surname: application.surname,
      dob: application.dob,
      gender: application.gender,
      current_class: application.class_applying_for,
      
      passport_url: application.passport_url,
      
      sponsor_name: application.sponsor_name,
      sponsor_phone: application.sponsor_phone,
      sponsor_email: application.sponsor_email,
      sponsor_address: application.sponsor_address,
      
      nok_name: application.nok_name || null,
      nok_relationship: application.nok_relationship || null,
      nok_phone: application.nok_phone || null,
      nok_email: application.nok_email || null,
      
      state_of_origin: application.state_of_origin || null,
      lga: application.lga || null,
      home_town: application.home_town || null,
      permanent_address: application.permanent_address || null,
      contact_address: application.contact_address || null,
      blood_group: application.blood_group || null,
      genotype: application.genotype || null,
      religion: application.religion || null,
      
      registration_status: "active",
      created_at: new Date().toISOString()
    };


    const { error: insertError, data } = await supabase
      .from("students")
      .insert([studentData])
      .select(); 

    if (insertError) {
      console.error("Insert error:", insertError);
      throw insertError;
    }

    console.log("Inserted student:", data);
    toast.success(`Application approved! Admission Number: ${admissionNumber}`);
    fetchAdmissions();
  } catch (error: any) {
    console.error("Approval error:", error);
    toast.error("Approval failed: " + error.message);
  } finally {
    setProcessing(null);
  }
};

  const handleQuickReject = async (id: string) => {
    setProcessing(id);
    try {
      const { error } = await supabase
        .from("admissions")
        .update({ status: "rejected" })
        .eq("id", id);

      if (error) throw error;
      toast.success("Application rejected");
      fetchAdmissions();
    } catch (error: any) {
      toast.error("Rejection failed");
    } finally {
      setProcessing(null);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not provided";
    
    if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateString.split('-');
      return `${day}/${month}/${year}`; 
    }
    
    return dateString;
  };

  const filteredAdmissions = admissions.filter(s => 
    `${s.first_name} ${s.surname}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'approved':
        return <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-green-100 text-green-700">Approved</span>;
      case 'rejected':
        return <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-red-100 text-red-700">Rejected</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-700">Pending</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <Link 
              href="/admin/dashboard" 
              className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2 mb-2 hover:text-red-900 transition-colors"
            >
              <ArrowLeft size={14} /> Dashboard
            </Link>
            <h1 className="text-3xl font-black text-slate-900 uppercase">Admission Applications</h1>
            <p className="text-slate-500 text-sm mt-1">Review and process student applications</p>
          </div>
          
          <div className="bg-white border px-4 py-2 rounded-2xl flex items-center gap-3 shadow-sm">
            <Search size={18} className="text-slate-400" />
            <input 
              placeholder="Search student..." 
              className="outline-none text-sm font-bold w-48 bg-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        <div className="grid gap-4">
          {loading ? (
            <div className="py-20 text-center">
              <Loader2 className="animate-spin mx-auto text-red-900 w-8 h-8" />
            </div>
          ) : filteredAdmissions.length === 0 ? (
            <div className="bg-white p-16 rounded-[2rem] text-center border-2 border-dashed border-slate-200">
              <p className="text-slate-400 font-bold">No applications found</p>
            </div>
          ) : (
            filteredAdmissions.map(application => (
              <div 
                key={application.id} 
                className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center text-red-900 font-black text-xl">
                      {application.first_name?.[0]}{application.surname?.[0]}
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-lg">
                        {application.first_name} {application.surname}
                      </h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {application.class_applying_for}
                        </p>
                        {application.application_number && (
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-l border-slate-200 pl-2">
                            {application.application_number}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3">
                    {getStatusBadge(application.status)}
                    
                    {(!application.status || application.status === 'pending') && (
                      <>
                        <Button 
                          onClick={() => handleQuickApprove(application)}
                          disabled={processing === application.id}
                          className="bg-green-600 hover:bg-green-700 text-white rounded-xl h-10 px-4 font-bold text-xs gap-2"
                        >
                          {processing === application.id ? (
                            <Loader2 className="animate-spin" size={14} />
                          ) : (
                            <CheckCircle size={14} />
                          )}
                          Approve
                        </Button>
                        <Button 
                          onClick={() => handleQuickReject(application.id)}
                          disabled={processing === application.id}
                          variant="outline" 
                          className="rounded-xl h-10 px-4 font-bold text-xs gap-2 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                        >
                          <XCircle size={14} /> Reject
                        </Button>
                      </>
                    )}
                    
                    <Button 
                      onClick={() => router.push(`/admin/admissions/${application.id}`)} 
                      variant="outline" 
                      className="rounded-xl h-10 px-4 font-bold text-xs gap-2"
                    >
                      <Eye size={14} /> View Details
                    </Button>
                    
                    <Button 
                      onClick={() => handleDeleteAdmission(application.id)} 
                      variant="outline" 
                      className="rounded-xl h-10 px-4 font-bold text-xs gap-2 text-red-500 hover:bg-red-50 hover:text-red-700 border-red-100"
                    >
                      <Trash2 size={14} /> Delete
                    </Button>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase">Date of Birth</p>
                    <p className="font-medium">{formatDate(application.dob)}</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase">Gender</p>
                    <p className="font-medium">{application.gender || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase">Contact</p>
                    <p className="font-medium">{application.sponsor_phone}</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase">Submitted</p>
                    <p className="font-medium">
                      {new Date(application.submitted_at || application.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}