"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  ArrowLeft, 
  Mail, 
  Trash2, 
  Copy, 
  Download,
  Search,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";

export default function NewsletterPage() {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  async function fetchSubscribers() {
    try {
      const { data, error } = await supabase
        .from("newsletter")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSubscribers(data || []);
    } catch (error: any) {
      toast.error("Could not load subscribers");
    } finally {
      setLoading(false);
    }
  }

  const copyEmails = () => {
    const emails = subscribers.map(s => s.email).join(", ");
    navigator.clipboard.writeText(emails);
    toast.success("All emails copied to clipboard!");
  };

  async function deleteSub(id: string) {
    if (!confirm("Remove this email from the list?")) return;
    const { error } = await supabase.from("newsletter").delete().eq("id", id);
    if (!error) {
      setSubscribers(subscribers.filter(s => s.id !== id));
      toast.success("Subscriber removed");
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard">
              <Button variant="outline" size="icon" className="rounded-full">
                <ArrowLeft size={18} />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-black text-slate-900 uppercase">Newsletter</h1>
              <p className="text-slate-500 font-medium">Manage your community mailing list.</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={copyEmails} className="bg-red-900 rounded-xl gap-2 font-bold">
              <Copy size={16} /> Copy All Emails
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
            <h3 className="font-black text-slate-900 flex items-center gap-2">
              <Users size={18} className="text-red-900" /> 
              ACTIVE SUBSCRIBERS ({subscribers.length})
            </h3>
          </div>

          <div className="divide-y divide-slate-50">
            {loading ? (
              <div className="p-20 text-center text-slate-400 italic">Loading list...</div>
            ) : subscribers.length === 0 ? (
              <div className="p-20 text-center text-slate-400">No subscribers yet.</div>
            ) : (
              subscribers.map((sub) => (
                <div key={sub.id} className="p-6 flex justify-between items-center hover:bg-slate-50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-red-50 text-red-900 rounded-full flex items-center justify-center">
                      <Mail size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{sub.email}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        Joined: {new Date(sub.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    onClick={() => deleteSub(sub.id)}
                    className="text-slate-300 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        <p className="text-center text-slate-400 text-xs mt-8">
          Tip: Use "Copy All Emails" to quickly add these to your newsletter software.
        </p>
      </div>
    </main>
  );
}