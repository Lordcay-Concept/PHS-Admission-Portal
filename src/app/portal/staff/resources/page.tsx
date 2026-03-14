"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { 
  BookOpen, UploadCloud, Video, ChevronLeft, 
  X, Save, Trash2, ExternalLink, Calendar, Edit,
  FileText, Filter, Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function StaffResourcesPage() {
  const [showForm, setShowForm] = useState<"video" | "doc" | null>(null);
  const [loading, setLoading] = useState(false);
  const [resources, setResources] = useState<any[]>([]);
  const [editingResource, setEditingResource] = useState<any>(null);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [filterClass, setFilterClass] = useState<string>("");
  const [filterTerm, setFilterTerm] = useState<string>("");
  const [filterSession, setFilterSession] = useState<string>("");

  const [formData, setFormData] = useState({
    title: "",
    link: "", 
    targetClass: "",
    term: "First Term",
    session: "2024/2025",
  });

  useEffect(() => {
    fetchResources();
  }, []);

  useEffect(() => {
    if (editingResource) {
      setFormData({
        title: editingResource.title,
        link: editingResource.type === "video" ? editingResource.content_url : "",
        targetClass: editingResource.target_class,
        term: editingResource.term,
        session: editingResource.session,
      });
      setShowForm(editingResource.type);
    }
  }, [editingResource]);

  async function fetchResources() {
  let query = supabase
    .from("resource")
    .select("*")
    .order("created_at", { ascending: false });

  if (filterClass && filterClass !== "all") {
    query = query.eq("target_class", filterClass);
  }
  if (filterTerm && filterTerm !== "all") {
    query = query.eq("term", filterTerm);
  }
  if (filterSession && filterSession !== "all") {
    query = query.eq("session", filterSession);
  }

  const { data } = await query;
  setResources(data || []);
}

  async function handleDelete(id: string) {
    const confirmDelete = confirm("Are you sure you want to remove this resource?");
    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from("resource")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Resource deleted successfully");
      fetchResources();
    } catch (e: any) {
      toast.error("Error deleting resource: " + e.message);
    }
  }

  async function handleEdit(resource: any) {
    setEditingResource(resource);
  }

  function cancelEdit() {
    setEditingResource(null);
    setShowForm(null);
    setSelectedFile(null);
    setFormData({
      title: "",
      link: "",
      targetClass: "",
      term: "First Term",
      session: "2024/2025",
    });
  }

  async function handleUpload() {
    if (!formData.title || !formData.targetClass || !formData.session || !formData.term) {
      return toast.error("Please fill in all required fields");
    }
    
    setLoading(true);
    let finalUrl = formData.link;

    try {
      if (showForm === "doc") {
        if (!selectedFile && !editingResource) {
          setLoading(false);
          return toast.error("Please select a file to upload");
        }

        if (selectedFile) {
          const fileExt = selectedFile.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          const filePath = `resources/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from("resource")
            .upload(filePath, selectedFile);

          if (uploadError) {
            console.error("Upload error:", uploadError);
            throw new Error(`Upload failed: ${uploadError.message}`);
          }

          const { data: { publicUrl } } = supabase.storage
            .from("resource")
            .getPublicUrl(filePath);
          
          finalUrl = publicUrl;
        } else if (editingResource) {
          finalUrl = editingResource.content_url;
        }
      }

      if (editingResource) {
        const { error } = await supabase
          .from("resource")
          .update({
            title: formData.title,
            content_url: finalUrl,
            target_class: formData.targetClass,
            term: formData.term,
            session: formData.session,
            type: showForm === "video" ? "video" : "document"
          })
          .eq("id", editingResource.id);

        if (error) throw error;
        toast.success("Resource updated successfully!");
      } else {
        const { error } = await supabase.from("school_materials").insert([{
          title: formData.title,
          content_url: finalUrl, 
          target_class: formData.targetClass,
          term: formData.term,
          session: formData.session,
          type: showForm === "video" ? "video" : "document"
        }]);

        if (error) throw error;
        toast.success("Material live on Student Portal!");
      }
      
      cancelEdit();
      fetchResources(); 
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchResources();
  }, [filterClass, filterTerm, filterSession]);

  return (
    <div className="p-6 md:p-8 bg-white min-h-screen rounded-[2rem] border border-slate-100 shadow-sm">
      <Link href="/portal/staff" className="inline-flex items-center gap-2 text-slate-500 hover:text-red-900 font-bold text-xs uppercase tracking-widest mb-6 transition-colors group">
        <div className="p-2 rounded-full bg-slate-100 group-hover:bg-red-100 transition-colors">
          <ChevronLeft size={16} />
        </div>
        Back to Dashboard
      </Link>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6 pb-6 border-b">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Resource Manager</h1>
          <p className="text-slate-500 font-medium">Assign materials to specific classes & sessions.</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={() => { 
              setShowForm("video"); 
              setSelectedFile(null);
              setEditingResource(null);
              setFormData({
                title: "",
                link: "",
                targetClass: "",
                term: "First Term",
                session: "2024/2025",
              });
            }} 
            variant="outline" 
            className="rounded-xl border-red-200 text-red-900 hover:bg-red-50 gap-2 h-12"
          >
            <Video size={18} /> Video Link
          </Button>
          <Button 
            onClick={() => { 
              setShowForm("doc"); 
              setFormData({...formData, link: ""});
              setEditingResource(null);
              setSelectedFile(null);
            }} 
            className="bg-red-900 hover:bg-red-800 text-white rounded-xl h-12 gap-2 shadow-lg shadow-red-900/20"
          >
            <UploadCloud size={18} /> Upload PDF
          </Button>
        </div>
      </div>

<div className="mb-8 p-4 bg-slate-50 rounded-2xl border border-slate-200">
  <div className="flex items-center gap-2 mb-3">
    <Filter size={16} className="text-slate-400" />
    <h3 className="text-xs font-black uppercase text-slate-400">Filter Resources</h3>
  </div>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div>
      <label className="text-[8px] font-black uppercase text-slate-400 mb-1 block">Class</label>
      <Select value={filterClass} onValueChange={setFilterClass}>
        <SelectTrigger className="h-10 rounded-xl bg-white">
          <SelectValue placeholder="All Classes" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Classes</SelectItem> 
          <SelectItem value="JSS 1">JSS 1</SelectItem>
          <SelectItem value="JSS 2">JSS 2</SelectItem>
          <SelectItem value="JSS 3">JSS 3</SelectItem>
          <SelectItem value="SSS 1">SSS 1</SelectItem>
          <SelectItem value="SSS 2">SSS 2</SelectItem>
          <SelectItem value="SSS 3">SSS 3</SelectItem>
        </SelectContent>
      </Select>
    </div>
    
    <div>
      <label className="text-[8px] font-black uppercase text-slate-400 mb-1 block">Term</label>
      <Select value={filterTerm} onValueChange={setFilterTerm}>
        <SelectTrigger className="h-10 rounded-xl bg-white">
          <SelectValue placeholder="All Terms" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Terms</SelectItem> 
          <SelectItem value="First Term">First Term</SelectItem>
          <SelectItem value="Second Term">Second Term</SelectItem>
          <SelectItem value="Third Term">Third Term</SelectItem>
        </SelectContent>
      </Select>
    </div>
    
    <div>
      <label className="text-[8px] font-black uppercase text-slate-400 mb-1 block">Session</label>
      <Select value={filterSession} onValueChange={setFilterSession}>
        <SelectTrigger className="h-10 rounded-xl bg-white">
          <SelectValue placeholder="All Sessions" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Sessions</SelectItem> 
          <SelectItem value="2023/2024">2023/2024</SelectItem>
          <SelectItem value="2024/2025">2024/2025</SelectItem>
          <SelectItem value="2025/2026">2025/2026</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </div>
</div>

      {showForm && (
        <div className="mb-12 p-8 bg-slate-50 border border-slate-200 rounded-[2rem] animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black text-slate-900">
              {editingResource ? "Edit Resource" : "Add New Resource"}
            </h3>
            {editingResource && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Editing: {editingResource.title}
              </Badge>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400">Material Title</label>
              <Input 
                placeholder="e.g. Mathematics" 
                className="h-12 bg-white rounded-xl shadow-sm" 
                onChange={e => setFormData({...formData, title: e.target.value})} 
                value={formData.title}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400">Target Class</label>
              <select 
                className="w-full h-12 rounded-xl border border-input bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-red-200" 
                onChange={e => setFormData({...formData, targetClass: e.target.value})}
                value={formData.targetClass}
              >
                <option value="">Select Class</option>
                <option value="JSS 1">JSS 1</option>
                <option value="JSS 2">JSS 2</option>
                <option value="JSS 3">JSS 3</option>
                <option value="SSS 1">SSS 1</option>
                <option value="SSS 2">SSS 2</option>
                <option value="SSS 3">SSS 3</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1">
                <Calendar size={12} /> Term
              </label>
              <select 
                className="w-full h-12 rounded-xl border border-input bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-red-200" 
                onChange={e => setFormData({...formData, term: e.target.value})}
                value={formData.term}
              >
                <option value="First Term">First Term</option>
                <option value="Second Term">Second Term</option>
                <option value="Third Term">Third Term</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400">Session</label>
              <select 
                className="w-full h-12 rounded-xl border border-input bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-red-200" 
                onChange={e => setFormData({...formData, session: e.target.value})}
                value={formData.session}
              >
                <option value="2023/2024">2023/2024</option>
                <option value="2024/2025">2024/2025</option>
                <option value="2025/2026">2025/2026</option>
              </select>
            </div>

            {showForm === "video" ? (
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400">YouTube URL</label>
                <Input 
                  placeholder="https://youtube.com/..." 
                  className="h-12 bg-white rounded-xl shadow-sm" 
                  onChange={e => setFormData({...formData, link: e.target.value})}
                  value={formData.link}
                />
              </div>
            ) : (
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400">
                  {editingResource ? "Replace File (optional)" : "Select File (PDF/Docs)"}
                </label>
                <Input 
                  type="file" 
                  accept=".pdf,.doc,.docx" 
                  className="h-12 bg-white rounded-xl shadow-sm pt-2 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-900 hover:file:bg-red-100" 
                  onChange={e => setSelectedFile(e.target.files?.[0] || null)} 
                />
                {selectedFile && (
                  <p className="text-xs text-slate-500 mt-1">
                    Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                  </p>
                )}
                {editingResource && !selectedFile && (
                  <p className="text-xs text-blue-600 mt-1">
                    Current file will be kept if no new file selected
                  </p>
                )}
              </div>
            )}

            <div className="flex items-end gap-2">
              <Button 
                onClick={cancelEdit} 
                variant="outline" 
                className="h-12 w-20 rounded-xl"
                disabled={loading}
              >
                <X size={18} />
              </Button>
              <Button 
                onClick={handleUpload} 
                disabled={loading} 
                className="w-full h-12 bg-red-900 hover:bg-red-800 text-white font-bold rounded-xl gap-2 shadow-lg"
              >
                <Save size={18} /> {loading ? "Processing..." : editingResource ? "Update Resource" : "Save & Publish"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
          <BookOpen className="text-red-900" /> Resource History ({resources.length})
        </h2>
        
        {resources.length === 0 ? (
          <Card className="p-12 rounded-[2rem] text-center border-2 border-dashed border-slate-200">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-black text-slate-400">No Resources Found</h3>
            <p className="text-sm text-slate-400">Upload your first resource using the buttons above</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((item) => (
              <div key={item.id} className="border border-slate-100 rounded-[2rem] p-5 bg-slate-50 hover:border-red-200 transition-all group">
                <div className="aspect-video bg-slate-200 rounded-2xl mb-4 flex items-center justify-center relative overflow-hidden">
                  {item.type === "video" ? (
                    <Video size={40} className="text-slate-400" />
                  ) : (
                    <div className="flex flex-col items-center">
                      <UploadCloud size={40} className="text-slate-400" />
                      <span className="text-[8px] font-bold text-slate-400 mt-1">
                        {item.content_url?.split('.').pop()?.toUpperCase() || 'PDF'}
                      </span>
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full text-[8px] font-black uppercase shadow-sm">
                    {item.target_class}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-bold text-slate-800 uppercase text-sm line-clamp-1">{item.title}</h3>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="secondary" className="text-[8px] font-bold bg-slate-100">
                      {item.term}
                    </Badge>
                    <Badge variant="secondary" className="text-[8px] font-bold bg-slate-100">
                      {item.session}
                    </Badge>
                  </div>
                  <p className="text-[8px] text-slate-400">
                    Added: {new Date(item.created_at).toLocaleDateString()}
                  </p>
                  
                  <div className="pt-3 flex items-center justify-between border-t mt-2">
                    <a 
                      href={item.content_url} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-xs font-bold text-slate-500 hover:text-red-900 flex items-center gap-1"
                    >
                      <ExternalLink size={14} /> View
                    </a>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        onClick={() => handleEdit(item)}
                        className="text-slate-400 hover:text-blue-600 h-8 w-8 p-0"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        onClick={() => handleDelete(item.id)}
                        className="text-slate-300 hover:text-red-600 h-8 w-8 p-0"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}