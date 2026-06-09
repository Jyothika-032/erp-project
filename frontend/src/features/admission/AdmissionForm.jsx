import { useState, useEffect } from "react";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import { CheckCircle2, UserCheck, ShieldCheck, Mail, BookOpen, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import apiClient from "../../api/apiClient";
import admissionApi from "../../api/admissionApi";

/**
 * Admission Flow View
 * Features a multi-step wizard for processing new student registrations.
 */
export const AdmissionForm = () => {
  const { currentInstitution } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);

  const [formData, setFormData] = useState({
    student_name: "",
    dob: "",
    gender: "Male",
    nationality: "Indian",
    email: "",
    phone_number: "",
    address: "",
    course_id: "",
    batch_id: "",
    admission_number: "",
    admission_status: "Confirmed",
    documents_submitted: ""
  });

  useEffect(() => {
    const fetchData = async () => {
        try {
            const [cRes, bRes] = await Promise.all([
                apiClient.get('/courses'),
                apiClient.get('/batches')
            ]);
            setCourses(cRes.data || []);
            setBatches(bRes.data || []);
        } catch (error) {
            console.error("Failed to fetch form metadata:", error);
        }
    };
    fetchData();
  }, []);

  const steps = [
    { id: 1, name: "Personal Information", icon: ShieldCheck },
    { id: 2, name: "Contact Details", icon: Mail },
    { id: 3, name: "Academic Pathway", icon: BookOpen },
  ];

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, steps.length));
  const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        // 1. Create Student
        const studentRes = await apiClient.post('/students', {
            ...formData,
            institution_id: currentInstitution?.id
        });

        if (studentRes.success) {
            const studentId = studentRes.data.student_id;
            
            // 2. Create Admission
            await admissionApi.create({
                student_id: studentId,
                institution_id: currentInstitution?.id,
                course_id: formData.course_id,
                batch_id: formData.batch_id,
                admission_number: formData.admission_number,
                admission_status: formData.admission_status,
                admission_date: new Date().toISOString().split('T')[0],
                documents_submitted: formData.documents_submitted
            });

            setIsSubmitted(true);
            toast.success("Admission application submitted successfully!");
        }
    } catch (error) {
        console.error("Admission failed:", error);
        toast.error(error.response?.data?.message || "Failed to process admission");
    } finally {
        setLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto mt-20 text-center space-y-6 animate-in slide-in-from-bottom-4 duration-500">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-green-50">
          <CheckCircle2 size={40} />
        </div>
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Registration Complete</h2>
        <p className="text-gray-500 font-medium">The student record has been created and admission process initiated. A confirmation has been sent to the registered email.</p>
        <div className="pt-8">
          <Button onClick={() => { setIsSubmitted(false); setCurrentStep(1); setFormData({
              student_name: "", dob: "", gender: "Male", nationality: "Indian", email: "", phone_number: "", address: "", course_id: "", batch_id: "", admission_number: "", admission_status: "Confirmed", documents_submitted: ""
          }); }}>Start New Admission</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">New Admission</h1>
          <p className="text-gray-500 mt-1 font-medium italic">Step {currentStep} of {steps.length}: {steps[currentStep-1].name}</p>
        </div>
      </div>

      {/* Progress Tracker */}
      <div className="relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 z-0 hidden md:block"></div>
        <div className="relative z-10 flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          {steps.map((step, i) => (
            <div key={step.id} className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 font-bold ${
                currentStep === step.id 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-200 scale-110" 
                : currentStep > step.id 
                ? "bg-emerald-500 text-white" 
                : "bg-gray-50 text-gray-400"
              }`}>
                {currentStep > step.id ? <CheckCircle2 size={20} /> : step.id}
              </div>
              <div className="hidden sm:block">
                <p className={`text-xs font-bold uppercase tracking-wider ${currentStep === step.id ? "text-blue-600" : "text-gray-400"}`}>
                  {step.name}
                </p>
              </div>
              {i < steps.length - 1 && (
                <div className="mx-2 text-gray-200 hidden md:block">
                  <ArrowRight size={16} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        <form onSubmit={handleRegister} className="p-8 md:p-10">
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Full Name" name="student_name" value={formData.student_name} onChange={handleChange} placeholder="Student's full name" required />
                <Input label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleChange} required />
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 ml-1">Gender</label>
                    <select name="gender" value={formData.gender} onChange={handleChange} className="block w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3.5 outline-none focus:ring-2 ring-primary/10">
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <Input label="Nationality" name="nationality" value={formData.nationality} onChange={handleChange} />
              </div>
            </div>
          )}

          {/* Step 2: Contact Info */}
          {currentStep === 2 && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Student Email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="student@example.com" required />
                <Input label="Primary Phone" name="phone_number" type="tel" value={formData.phone_number} onChange={handleChange} placeholder="+91" required />
                <div className="md:col-span-2">
                  <Input label="Permanent Address" name="address" value={formData.address} onChange={handleChange} placeholder="Street, City, State, Pin Code" />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Academic Info */}
          {currentStep === 3 && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Admission Number" name="admission_number" type="number" value={formData.admission_number} onChange={handleChange} placeholder="Internal ID / Registration #" required />
                
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 ml-1">Course</label>
                    <select name="course_id" value={formData.course_id} onChange={handleChange} className="block w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3.5 outline-none focus:ring-2 ring-primary/10" required>
                        <option value="">Select Course</option>
                        {courses.map(c => <option key={c.course_id} value={c.course_id}>{c.course_name}</option>)}
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 ml-1">Batch</label>
                    <select name="batch_id" value={formData.batch_id} onChange={handleChange} className="block w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3.5 outline-none focus:ring-2 ring-primary/10" required>
                        <option value="">Select Batch</option>
                        {batches.map(b => <option key={b.batch_id} value={b.batch_id}>{b.batch_name}</option>)}
                    </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 ml-1">Admission Status</label>
                  <select name="admission_status" value={formData.admission_status} onChange={handleChange} className="block w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3.5 outline-none focus:ring-2 ring-primary/10">
                    <option value="Confirmed">Confirmed</option>
                    <option value="Pending Verification">Pending Verification</option>
                    <option value="Provisional">Provisional</option>
                  </select>
                </div>

                <div className="md:col-span-2 space-y-4 pt-4">
                  <label className="block text-sm font-semibold text-gray-700 ml-1">Documents (Comma separated)</label>
                  <Input name="documents_submitted" value={formData.documents_submitted} onChange={handleChange} placeholder="e.g. 10th Marksheet, Aadhar Proof" />
                </div>
              </div>
            </div>
          )}

          <footer className="mt-12 pt-8 border-t border-gray-100 flex items-center justify-between">
            <Button 
              variant="secondary" 
              type="button" 
              onClick={handleBack} 
              disabled={currentStep === 1 || loading}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={18} /> Previous
            </Button>
            
            {currentStep < steps.length ? (
              <Button 
                type="button" 
                onClick={handleNext}
                className="flex items-center gap-2"
                disabled={loading}
              >
                Next <ArrowRight size={18} />
              </Button>
            ) : (
              <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-500/30 min-w-[200px]">
                {loading ? <Loader2 className="animate-spin" /> : "Complete Admission"}
              </Button>
            )}
          </footer>
        </form>
      </div>
    </div>
  );
};
