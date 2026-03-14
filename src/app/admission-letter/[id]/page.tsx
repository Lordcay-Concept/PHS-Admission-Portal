"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AdmissionLetter from "@/components/AdmissionLetter";
import { Loader2, AlertCircle } from "lucide-react";

export default function PublicAdmissionLetter() {
  const params = useParams();
  const id = params?.id as string;

  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLetterData() {
      if (!id) return;
      
      const { data } = await supabase
        .from("admissions")
        .select("first_name, surname, class_applying_for, created_at, status, passport_url")
        .eq("id", id)
        .single();

      if (data && data.status === 'admitted') {
        setStudent(data);
      }
      setLoading(false);
    }

    fetchLetterData();
  }, [id]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-red-900" size={40} />
    </div>
  );

  if (!student) return (
    <div className="h-screen flex flex-col items-center justify-center p-6 text-center">
      <AlertCircle className="text-red-500 mb-4" size={48} />
      <h1 className="text-2xl font-bold">Admission Letter Not Found</h1>
      <p className="text-slate-500 max-w-md">
        We couldn't find an approved admission letter for this record. 
        If you just received your email, please wait a moment and refresh.
      </p>
    </div>
  );

  return (
    <div className="bg-slate-100 min-h-screen p-4 md:p-8 flex justify-center">
      <AdmissionLetter 
        studentName={`${student.first_name} ${student.surname}`}
        className={student.class_applying_for}
        passportUrl={student.passport_url}
        admissionDate={new Date(student.created_at).toLocaleDateString('en-GB', {
          day: 'numeric', month: 'long', year: 'numeric'
        })}
      />
    </div>
  );
}