import { useState, useEffect } from "react";
import { supabase } from "../../api/supabase";
import { Building2, MapPin, Mail, Phone, Code, ShieldCheck, Settings } from "lucide-react";
import toast from "react-hot-toast";

export const InstitutionSettings = () => {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInstitutions() {
      try {
        setLoading(true);
        // Fetching from the actual working table!
        const { data, error } = await supabase.from('institution').select('*').order('institution_id');
        if (error) throw error;
        setInstitutions(data || []);
      } catch (err) {
        console.error("Error fetching institutions:", err.message);
        toast.error("Failed to load institutions from Supabase");
      } finally {
        setLoading(false);
      }
    }
    fetchInstitutions();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
          Institution Centers <Building2 className="text-blue-600" size={32} />
        </h1>
        <p className="text-gray-500 font-medium mt-1">Manage and monitor all connected institution branches.</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {institutions.map((inst) => (
            <div key={inst.institution_id} className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  inst.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                }`}>
                  {inst.status}
                </span>
              </div>
              
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 font-black text-xl border border-blue-100 mb-6">
                <Building2 size={24} />
              </div>
              
              <h3 className="text-xl font-black text-gray-900 tracking-tight mb-4">{inst.institution_name}</h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3 text-sm text-gray-600 font-medium">
                  <MapPin size={16} className="text-gray-400 shrink-0 mt-0.5" />
                  <span>{inst.address}</span>
                </div>
                
                <div className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                  <Mail size={16} className="text-gray-400 shrink-0" />
                  <span>{inst.email}</span>
                </div>
                
                <div className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                  <Phone size={16} className="text-gray-400 shrink-0" />
                  <span>{inst.phone}</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-400">
                  <Code size={14} />
                  <span className="text-xs font-bold font-mono">{inst.code}</span>
                </div>
                <button className="text-blue-600 hover:text-blue-800 transition-colors p-2 rounded-lg hover:bg-blue-50">
                  <Settings size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
