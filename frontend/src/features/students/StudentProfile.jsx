import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, User, Mail, Phone, MapPin, Calendar, 
  GraduationCap, ClipboardCheck, CreditCard, Award 
} from "lucide-react";
import { Button } from "../../components/common/Button";

export const StudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  // Mock Student Data
  const student = {
    id: id,
    firstName: "Amal",
    lastName: "Nath",
    email: "amal@gmail.com",
    phone: "+91 98765 43210",
    dob: "12 May 2002",
    gender: "Male",
    address: "Kochi, Kerala",
    course: "BCA",
    batch: "BCA 2023-26",
    status: "Active",
    admissionDate: "01 Aug 2023",
    attendance: "92%",
    feesPaid: "₹50,000",
    feesTotal: "₹1,50,000"
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: User },
    { id: "academic", label: "Academic Records", icon: GraduationCap },
    { id: "attendance", label: "Attendance", icon: ClipboardCheck },
    { id: "finance", label: "Fee Details", icon: CreditCard },
  ];

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate("/students")}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-blue-100"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Student Profile</h1>
            <p className="text-gray-500 text-sm font-medium mt-1">Detailed view of academic and personal records.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => navigate(`/students/new`)}>Edit Profile</Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700">Download ID Card</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Quick Info Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-black text-3xl mb-4">
              {student.firstName[0]}
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{student.firstName} {student.lastName}</h2>
            <p className="text-blue-600 font-semibold mb-6">{student.course} • {student.batch}</p>
            
            <div className="w-full space-y-4 text-left">
              <div className="flex items-center gap-3 text-gray-600">
                <Mail size={18} className="text-gray-400" />
                <span className="text-sm font-medium">{student.email}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Phone size={18} className="text-gray-400" />
                <span className="text-sm font-medium">{student.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <MapPin size={18} className="text-gray-400" />
                <span className="text-sm font-medium">{student.address}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Calendar size={18} className="text-gray-400" />
                <span className="text-sm font-medium">DOB: {student.dob}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Tabbed Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex gap-2 bg-gray-100/50 p-1.5 rounded-2xl overflow-x-auto no-scrollbar">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                  activeTab === tab.id 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                }`}
              >
                <tab.icon size={18} /> {tab.label}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm min-h-[400px]">
            {activeTab === "overview" && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4">Academic Overview</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="p-4 bg-gray-50 rounded-2xl">
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Status</p>
                    <p className="text-lg font-black text-green-600">{student.status}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl">
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Admission Date</p>
                    <p className="text-lg font-black text-gray-900">{student.admissionDate}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl">
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Attendance</p>
                    <p className="text-lg font-black text-blue-600">{student.attendance}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl">
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Fee Cleared</p>
                    <p className="text-lg font-black text-purple-600">{student.feesPaid}</p>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab !== "overview" && (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 animate-in fade-in duration-300 pt-20">
                <Award size={48} className="mb-4 opacity-50" />
                <p className="font-semibold text-lg">Detailed view under development.</p>
                <p className="text-sm">This section will contain detailed {tab.label.toLowerCase()} records.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
