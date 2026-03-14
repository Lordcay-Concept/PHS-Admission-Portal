"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Calendar, Loader2, ChevronLeft } from "lucide-react";
import Link from "next/link"; 

export default function StaffSchedulePage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSchedule() {
      const { data } = await supabase
        .from("school_schedule")
        .select("*")
        .order("date", { ascending: true });
      if (data) setEvents(data);
      setLoading(false);

      localStorage.setItem("last_viewed_schedule", new Date().toISOString());
    }
    fetchSchedule();
  }, []);

  return (
    <div className="p-6 md:p-8 bg-white min-h-[80vh] rounded-[2rem] border border-slate-100 shadow-sm">
      <Link 
        href="/portal/staff" 
        className="inline-flex items-center gap-2 text-slate-500 hover:text-red-900 font-bold text-xs uppercase tracking-widest mb-6 transition-colors group"
      >
        <div className="p-2 rounded-full bg-slate-100 group-hover:bg-red-100 transition-colors">
          <ChevronLeft size={16} />
        </div>
        Back to Dashboard
      </Link>

      <div className="mb-8 border-b border-slate-100 pb-6">
        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
          <Calendar className="text-red-900" size={32} /> Academic Calendar
        </h1>
        <p className="text-slate-500 font-medium mt-2">Official term schedule for staff members.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-red-900" size={32} />
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 text-slate-400 font-medium bg-slate-50 rounded-3xl border border-dashed border-slate-200">
          No events have been scheduled for this term yet.
        </div>
      ) : (
        <div className="grid gap-4">
          {events.map((event) => (
            <div 
              key={event.id} 
              className="flex items-start gap-6 p-6 rounded-3xl bg-slate-50 border border-slate-100 hover:border-red-200 hover:bg-white hover:shadow-lg transition-all duration-300 group"
            >
              <div className="bg-white text-slate-900 w-20 h-20 rounded-2xl flex flex-col items-center justify-center shadow-sm border border-slate-200 flex-shrink-0 group-hover:bg-red-900 group-hover:text-white transition-colors duration-300">
                <span className="text-[10px] font-black uppercase tracking-widest text-red-900 group-hover:text-red-100">
                  {new Date(event.date).toLocaleDateString('en-GB', { month: 'short' })}
                </span>
                <span className="text-2xl font-black">
                  {new Date(event.date).toLocaleDateString('en-GB', { day: '2-digit' })}
                </span>
              </div>
              <div className="pt-2">
                <h3 className="font-black text-slate-900 text-xl mb-1 group-hover:text-red-900 transition-colors">
                  {event.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed max-w-2xl">
                  {event.description || "Official school activity. All staff are expected to be present unless otherwise communicated."}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}