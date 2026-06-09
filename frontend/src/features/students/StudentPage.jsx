import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  GraduationCap, 
  Calendar, 
  Droplet,
  ShieldCheck,
  Building,
  CheckCircle2,
  Clock,
  Send
} from "lucide-react";
import studentApi from "../../api/studentApi";
import { Button } from "../../components/common/Button";
import toast from "react-hot-toast";
import { SendAlertModal } from "../communication/SendAlertModal";

const StudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);

  const fetchStudentDetails = useCallback(async () => {
    setLoading(true);
    try {
      const res = await studentApi.getStudentById(id);
      if (res.success) {
        setStudent(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch student details:", err);
      toast.error("Could not load student profile");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchStudentDetails();
  }, [fetchStudentDetails]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-800">Student Not Found</h2>
        <Button onClick={() => navigate("/students")} className="mt-4">Back to Directory</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate("/students")}
            className="p-2.5 text-gray-500 hover:text-blue-600 hover:bg-white rounded-2xl transition-all shadow-sm border border-transparent hover:border-blue-100"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Student Profile</h1>
            <p className="text-gray-500 text-sm font-medium">Viewing full record for ID: <span className="text-blue-600">#{student.student_id}</span></p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={fetchStudentDetails}>Refresh</Button>
          <Button variant="secondary" onClick={() => setShowAlert(true)} icon={Send}>Send Alert</Button>
          <Button onClick={() => navigate(`/students/edit/${id}`)}>Edit Profile</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Essential Info & Status */}
        <div className="space-y-8">
          {/* Identity Card */}
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5">
              <User size={120} />
            </div>
            <div className="w-24 h-24 rounded-[32px] bg-gradient-to-br from-blue-500 to-indigo-600 mx-auto flex items-center justify-center text-white text-4xl font-black shadow-xl shadow-blue-200 mb-6">
              {(student.student_name || "S")[0]}
            </div>
            <h2 className="text-2xl font-black text-gray-900 leading-tight">{student.student_name}</h2>
            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">{student.email}</p>
            
            <div className="mt-8 pt-8 border-t border-gray-50 flex items-center justify-center gap-4">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest ${
                student.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
              }`}>
                {student.status === 'active' ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                {student.status}
              </div>
            </div>
          </div>

          {/* Academic Placement */}
          <div className="bg-gradient-to-br from-gray-900 to-blue-900 p-8 rounded-[40px] text-white shadow-2xl shadow-blue-900/20 relative overflow-hidden group">
             <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                <GraduationCap size={160} />
             </div>
             <h3 className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-6">Academic Assignment</h3>
             <div className="space-y-6 relative z-10">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center"><Building size={18} /></div>
                  <div>
                    <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Institution</p>
                    <p className="font-bold text-sm">{student.institution_name || 'Main Campus'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center"><GraduationCap size={18} /></div>
                  <div>
                    <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Course Program</p>
                    <p className="font-bold text-sm">{student.course_name || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center"><ShieldCheck size={18} /></div>
                  <div>
                    <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Batch Group</p>
                    <p className="font-bold text-sm">{student.batch_name || 'N/A'}</p>
                  </div>
                </div>
             </div>
          </div>
        </div>

        {/* Right Column: Comprehensive Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Detailed Info Grid */}
          <div className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100">
            <h3 className="text-lg font-black text-gray-900 mb-8 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"><User size={16} /></span>
              Personal & Contact Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-12">
              <DetailItem label="Full Name" value={`${student.first_name} ${student.last_name}`} icon={<User size={14}/>} />
              <DetailItem label="Gender" value={student.gender} icon={<User size={14}/>} />
              <DetailItem label="Date of Birth" value={student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString() : 'N/A'} icon={<Calendar size={14}/>} />
              <DetailItem label="Blood Group" value={student.blood_group} icon={<Droplet size={14}/>} color="text-rose-600" />
              <DetailItem label="Email Address" value={student.email} icon={<Mail size={14}/>} />
              <DetailItem label="Phone Number" value={student.phone_number} icon={<Phone size={14}/>} />
              <DetailItem label="Graduation Status" value={student.graduation_status} icon={<GraduationCap size={14}/>} />
              <DetailItem label="Created At" value={new Date(student.created_at).toLocaleDateString()} icon={<Clock size={14}/>} />
            </div>

            <div className="mt-12 pt-10 border-t border-gray-50">
              <h3 className="text-sm font-black text-gray-900 mb-6 uppercase tracking-widest flex items-center gap-3">
                 <MapPin size={14} className="text-blue-600" />
                 Residential Address
              </h3>
              <div className="bg-gray-50 p-6 rounded-3xl">
                <p className="text-sm font-bold text-gray-700 leading-relaxed">
                  {student.address}<br />
                  {student.city}, {student.state} - {student.pincode}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SendAlertModal 
        isOpen={showAlert} 
        onClose={() => setShowAlert(false)} 
        student={student} 
        onSent={fetchStudentDetails} 
      />
    </div>
  );
};

const DetailItem = ({ label, value, icon, color = "text-gray-900" }) => (
  <div className="space-y-1.5">
    <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
      {icon}
      {label}
    </div>
    <div className={`text-sm font-bold ${color}`}>
      {value || 'Not Specified'}
    </div>
  </div>
);

export default StudentProfile;