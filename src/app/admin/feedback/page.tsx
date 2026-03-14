"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  ArrowLeft, 
  Trash2, 
  Mail, 
  Calendar, 
  User, 
  MessageCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function FeedbackPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchMessages();
  }, []);

  async function fetchMessages() {
    try {
      const { data, error } = await supabase
        .from("feedback")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error: any) {
      toast.error("Error loading messages");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this message?")) return;

    try {
      const { error } = await supabase
        .from("feedback")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Message deleted");
      setMessages(messages.filter((msg) => msg.id !== id));
    } catch (error: any) {
      toast.error("Could not delete message");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard">
              <Button variant="outline" size="icon" className="rounded-full">
                <ArrowLeft size={18} />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-black text-slate-900">Parent Feedback</h1>
              <p className="text-slate-500">Inquiries, complaints, and suggestions.</p>
            </div>
          </div>
          <div className="bg-white px-4 py-2 rounded-full border shadow-sm text-sm font-bold text-slate-600">
            {messages.length} Messages
          </div>
        </div>

        <div className="grid gap-6">
          {loading ? (
             <div className="text-center py-20 text-slate-400">Loading messages...</div>
          ) : messages.length === 0 ? (
             <div className="text-center py-20 bg-white rounded-3xl border border-dashed">
                <MessageCircle className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No messages yet.</p>
             </div>
          ) : (
            messages.map((msg) => (
              <div 
                key={msg.id} 
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-900 font-bold shrink-0">
                      {msg.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{msg.subject}</h3>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                           <User size={12} /> {msg.name}
                        </span>
                        <span className="flex items-center gap-1">
                           <Mail size={12} /> {msg.email}
                        </span>
                        <span className="flex items-center gap-1">
                           <Calendar size={12} /> 
                           {new Date(msg.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDelete(msg.id)}
                    className="text-red-200 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
                
                <div className="bg-slate-50 p-4 rounded-xl text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                  {msg.message}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}