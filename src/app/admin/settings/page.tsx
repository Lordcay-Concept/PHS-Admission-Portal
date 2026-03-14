"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Save, Plus, Trash2, Loader2, ArrowUpCircle, RefreshCcw, ArrowLeft, RotateCcw, AlertTriangle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import Link from "next/link";

export default function SystemSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isPromoting, setIsPromoting] = useState(false);
  const [isDemoting, setIsDemoting] = useState(false); 
  
  const [settings, setSettings] = useState({
    current_session: "2025/2026",
    current_term: "First",
    sessions_list: [] as string[]
  });
  const [newSessionYear, setNewSessionYear] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('system_settings').select('*').single();
      if (error) throw error;
      if (data) setSettings(data);
    } catch (error) {
      toast.error("Failed to fetch system defaults");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    const { error } = await supabase
      .from('system_settings')
      .update({
        current_session: settings.current_session,
        current_term: settings.current_term,
        sessions_list: settings.sessions_list
      })
      .eq('id', 1);

    if (error) toast.error("Failed to update settings");
    else toast.success("System updated successfully!");
    setSaving(false);
  }

  async function handleBatchPromotion() {
    const confirmAction = confirm("⚠️ PROMOTION: Move ALL students forward? This should only be done at end of session.");
    if (!confirmAction) return;

    setIsPromoting(true);
    try {
      const { error } = await supabase.rpc('promote_all_students');
      if (error) throw error;
      toast.success("Promotion Complete!");
    } catch (err: any) {
      toast.error("Promotion failed: " + err.message);
    } finally {
      setIsPromoting(false);
    }
  }

  async function handleUndoPromotion() {
    const confirmAction = confirm("🚨 UNDO: This will move all students BACK one class (e.g., JSS 2 -> JSS 1). Use this only to fix a mistake. Proceed?");
    if (!confirmAction) return;

    setIsDemoting(true);
    try {
      const { error } = await supabase.rpc('demote_all_students');
      if (error) throw error;
      toast.success("Action Reverted! Students moved back.");
    } catch (err: any) {
      toast.error("Undo failed: " + err.message);
    } finally {
      setIsDemoting(false);
    }
  }

  const addSession = () => {
    if (!newSessionYear) return;
    if (settings.sessions_list?.includes(newSessionYear)) {
      toast.error("Session already exists");
      return;
    }
    setSettings({ ...settings, sessions_list: [...(settings.sessions_list || []), newSessionYear] });
    setNewSessionYear("");
  };

  const removeSession = (year: string) => {
    setSettings({ ...settings, sessions_list: settings.sessions_list.filter(s => s !== year) });
  };

  if (loading) return <div className="flex h-[80vh] items-center justify-center"><Loader2 className="animate-spin text-red-900" size={48} /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-10 p-6 md:p-12 pb-20 animate-in fade-in duration-700">
      
      <header className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <Link href="/admin/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-slate-600 font-bold text-xs uppercase transition-colors mb-2">
            <ArrowLeft size={14}/> Back to Dashboard
          </Link>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase flex items-center gap-3">
            <Settings className="text-red-900" size={32} /> System Control
          </h1>
          <p className="text-slate-500 font-medium italic">Current Brain: {settings.current_session} Session</p>
        </div>
        <Button onClick={fetchSettings} variant="ghost" className="rounded-xl border border-slate-200 h-12 px-6 font-bold">
          <RefreshCcw size={16} className="mr-2" /> Sync Database
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Timeline Control */}
        <Card className="lg:col-span-2 p-10 rounded-[3rem] border-none shadow-sm bg-white space-y-8">
          <h3 className="font-black text-xl uppercase tracking-tight text-slate-900">Timeline State</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Active Session</label>
              <Select value={settings.current_session} onValueChange={(val) => setSettings({...settings, current_session: val})}>
                <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none font-bold">
                  <SelectValue placeholder="Select Session" />
                </SelectTrigger>
                <SelectContent>
                  {(settings.sessions_list || []).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Active Term</label>
              <Select value={settings.current_term} onValueChange={(val) => setSettings({...settings, current_term: val})}>
                <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none font-bold">
                  <SelectValue placeholder="Select Term" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="First">First Term</SelectItem>
                  <SelectItem value="Second">Second Term</SelectItem>
                  <SelectItem value="Third">Third Term</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving} className="w-full h-16 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black shadow-xl">
            {saving ? <Loader2 className="animate-spin mr-2" /> : <Save size={18} className="mr-2" />} Save Changes
          </Button>
        </Card>

        {/* Session Manager */}
        <Card className="p-8 rounded-[3rem] border-none shadow-sm bg-red-900 text-white space-y-6">
          <h3 className="font-black text-sm uppercase tracking-widest text-red-200">Session List</h3>
          <div className="flex gap-2">
            <Input 
              placeholder="e.g. 2026/2027" 
              value={newSessionYear}
              onChange={(e) => setNewSessionYear(e.target.value)}
              className="h-12 rounded-xl bg-white/10 border-none text-white font-bold"
            />
            <Button onClick={addSession} className="h-12 w-12 rounded-xl bg-white text-red-900 hover:bg-slate-100 shrink-0"><Plus size={20}/></Button>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
            {(settings.sessions_list || []).map((year) => (
              <div key={year} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="font-bold text-sm">{year}</span>
                <button onClick={() => removeSession(year)} className="text-red-300 hover:text-white transition-colors"><Trash2 size={16}/></button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* DANGER ZONE: PROMOTION & REVERT */}
      <Card className="p-10 rounded-[3rem] bg-orange-50 border border-orange-100 space-y-8">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="bg-orange-600 text-white p-6 rounded-[2rem] shadow-lg shadow-orange-200">
            <ArrowUpCircle size={40} />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h4 className="font-black text-orange-900 uppercase text-lg">Batch Actions</h4>
            <p className="text-orange-700/70 text-sm font-medium">Manage student movement across academic sessions.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            {/* REVERT BUTTON */}
            <Button 
              variant="outline"
              onClick={handleUndoPromotion}
              disabled={isDemoting}
              className="border-orange-200 text-orange-800 hover:bg-orange-100 rounded-2xl font-black h-16 px-8 flex gap-2"
            >
              {isDemoting ? <Loader2 className="animate-spin" /> : <RotateCcw size={18} />} 
              UNDO PROMOTION
            </Button>

            {/* PROMOTE BUTTON */}
            <Button 
              onClick={handleBatchPromotion}
              disabled={isPromoting}
              className="bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-black h-16 px-8 shadow-lg shadow-orange-200 flex gap-2"
            >
              {isPromoting ? <Loader2 className="animate-spin" /> : <ArrowUpCircle size={18} />} 
              PROMOTE ALL
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}