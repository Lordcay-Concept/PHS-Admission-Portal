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
        .select("first_name, last_name, class_applying_for, created_at, status")
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
    <div className="h-[60vh] flex items-center justify-center">
      <Loader2 className="animate-spin text-red-900" size={40} />
    </div>
  );

  if (!student) return (
    <div className="h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <AlertCircle className="text-red-500 mb-4" size={48} />
      <h1 className="text-2xl font-bold">Letter Not Available</h1>
    </div>
  );

  return (
    <div className="bg-slate-50 p-4 md:p-8 flex justify-center">
      <AdmissionLetter 
        studentName={`${student.first_name} ${student.last_name}`}
        className={student.class_applying_for}
        admissionDate={new Date(student.created_at).toLocaleDateString('en-GB', {
          day: 'numeric', month: 'long', year: 'numeric'
        })}
      />
    </div>
  );
}