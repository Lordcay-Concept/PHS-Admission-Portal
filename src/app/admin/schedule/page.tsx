"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Plus, Trash2, Send, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function AdminScheduleManager() {
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: "", date: "", description: "" });

  useEffect(() => { fetchSchedule(); }, []);

  async function fetchSchedule() {
    const { data } = await supabase.from("school_schedule").select("*").order("date", { ascending: true });
    setEvents(data || []);
  }

  async function handleAddEvent() {
    if (!newEvent.title || !newEvent.date) return toast.error("Fill in the basics!");
    setLoading(true);
    const { error } = await supabase.from("school_schedule").insert([newEvent]);
    if (!error) {
      toast.success("Schedule Updated");
      setNewEvent({ title: "", date: "", description: "" });
      fetchSchedule();
    }
    setLoading(false);
  }

  async function deleteEvent(id: string) {
    await supabase.from("school_schedule").delete().eq("id", id);
    fetchSchedule();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-8 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <Button onClick={() => router.back()} variant="ghost" className="gap-2 font-bold text-slate-500 hover:text-red-900">
          <ArrowLeft size={18} /> Back to Dashboard
        </Button>

        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Termly Schedule</h1>
            <p className="text-slate-500">Manage school activities and staff deadlines.</p>
          </div>
          <div className="bg-red-900 text-white p-4 rounded-2xl flex items-center gap-3">
             <Calendar size={24} />
             <span className="font-bold">{events.length} Events Listed</span>
          </div>
        </div>

        <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden">
          <CardHeader className="bg-slate-900 text-white">
            <CardTitle className="text-sm font-black uppercase tracking-widest">Post New Activity</CardTitle>
          </CardHeader>
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase">Event Title</label>
              <Input value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} placeholder="e.g. Mid-Term Break" className="rounded-xl" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase">Target Date</label>
              <Input type="date" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} className="rounded-xl" />
            </div>
            <Button onClick={handleAddEvent} disabled={loading} className="bg-red-900 text-white h-10 rounded-xl font-bold uppercase text-xs gap-2">
              {loading ? <Loader2 className="animate-spin" /> : <Plus size={16} />} Update Staff
            </Button>
          </CardContent>
        </Card>

        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-black uppercase text-[10px]">Date</TableHead>
                <TableHead className="font-black uppercase text-[10px]">Activity</TableHead>
                <TableHead className="text-right font-black uppercase text-[10px]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-bold text-red-900">{new Date(event.date).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium text-slate-700">{event.title}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" onClick={() => deleteEvent(event.id)} className="text-slate-300 hover:text-red-600 transition-colors">
                      <Trash2 size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </main>
  );
}