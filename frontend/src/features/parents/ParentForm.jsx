import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Phone, MapPin, Briefcase } from "lucide-react";
import toast from "react-hot-toast";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import { Select } from "../../components/common/Select";

import { useAuth } from "../../context/AuthContext";
import parentApi from "../../api/parentApi";
import studentApi from "../../api/studentApi";

export const ParentForm = () => {
  const navigate = useNavigate();
  const { currentInstitution } = useAuth();
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [formData, setFormData] = useState({
    fatherName: "", fatherPhone: "", fatherOccupation: "",
    motherName: "", motherPhone: "", motherOccupation: "",
    guardianName: "", guardianPhone: "", relationship: "",
    address: "", city: "", state: "", pincode: "",
    linkedStudentId: "",
    annualIncome: ""
  });

  useEffect(() => {
    const fetchStudents = async () => {
      if (!currentInstitution?.id) return;
      setStudentsLoading(true);
      try {
        const res = await studentApi.getStudents(currentInstitution.id);
        if (res.success && res.data) {
          setStudents(res.data);
        }
      } catch (err) {
        console.error("Failed to load students:", err);
      } finally {
        setStudentsLoading(false);
      }
    };
    fetchStudents();
  }, [currentInstitution]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        student_id: parseInt(formData.linkedStudentId, 10) || null,
        institution_id: currentInstitution?.id || 1,
        father_name: formData.fatherName || null,
        mother_name: formData.motherName || null,
        guardian_name: formData.guardianName || null,
        relation: formData.relationship || (formData.fatherName ? 'Father' : (formData.motherName ? 'Mother' : 'Guardian')),
        phone_number: formData.fatherPhone || formData.motherPhone || formData.guardianPhone || '',
        alternate_phone: formData.motherPhone || formData.guardianPhone || null,
        email: `parent-${Date.now()}@gmail.com`,
        address: `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`,
        occupation: formData.fatherOccupation || formData.motherOccupation || 'Service',
        annual_income: parseInt(formData.annualIncome, 10) || 0
      };

      const res = await parentApi.create(payload);
      if (res.success) {
        toast.success("Parent details registered successfully.");
        navigate("/parents");
      } else {
        toast.error(res.message || "Failed to register parent details.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "An error occurred while registering parent details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate("/parents")}
          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-blue-100"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Parent / Guardian Details</h1>
          <p className="text-gray-500 text-sm font-medium mt-1">Register parent details and link them to a student.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl">
        
        {/* Linked Student Section */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8">
          <Select
            label="Link to Student"
            value={formData.linkedStudentId}
            onChange={(e) => setFormData({ ...formData, linkedStudentId: e.target.value })}
            loading={studentsLoading}
            options={[
              { id: "", name: "Select Student (None / Unlinked)" },
              ...students.map(s => ({
                id: s.student_id,
                name: `${s.student_name} (${s.admission_number || `ID: ${s.student_id}`})`
              }))
            ]}
            placeholder="Select associated student"
          />
        </div>

        {/* Father's Details */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <User size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Father's Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Input label="Father's Name" name="fatherName" value={formData.fatherName} onChange={handleChange} placeholder="Full Name" required />
            <Input label="Phone Number" name="fatherPhone" value={formData.fatherPhone} onChange={handleChange} placeholder="+91 98765 43210" required />
            <Input label="Occupation" name="fatherOccupation" value={formData.fatherOccupation} onChange={handleChange} placeholder="e.g. Business" />
            <Input label="Annual Income (₹)" name="annualIncome" type="number" value={formData.annualIncome} onChange={handleChange} placeholder="e.g. 500000" />
          </div>
        </div>

        {/* Mother's Details */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-6">
            <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
              <User size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Mother's Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Input label="Mother's Name" name="motherName" value={formData.motherName} onChange={handleChange} placeholder="Full Name" required />
            <Input label="Phone Number" name="motherPhone" value={formData.motherPhone} onChange={handleChange} placeholder="+91 98765 43210" required />
            <Input label="Occupation" name="motherOccupation" value={formData.motherOccupation} onChange={handleChange} placeholder="e.g. Teacher" />
          </div>
        </div>

        {/* Guardian Details (Optional) */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-6">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Briefcase size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Local Guardian Details (Optional)</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Input label="Guardian's Name" name="guardianName" value={formData.guardianName} onChange={handleChange} placeholder="Full Name" />
            <Input label="Relationship" name="relationship" value={formData.relationship} onChange={handleChange} placeholder="e.g. Uncle" />
            <Input label="Phone Number" name="guardianPhone" value={formData.guardianPhone} onChange={handleChange} placeholder="+91 98765 43210" />
          </div>
        </div>

        {/* Primary Contact Address */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-6">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <MapPin size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Communications Address</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="md:col-span-2 lg:col-span-3">
              <Input label="Full Address" name="address" value={formData.address} onChange={handleChange} placeholder="House No, Street, Landmark" required />
            </div>
            <Input label="City" name="city" value={formData.city} onChange={handleChange} placeholder="e.g. Kochi" required />
            <Input label="State" name="state" value={formData.state} onChange={handleChange} placeholder="e.g. Kerala" required />
            <Input label="Pincode/ZIP" name="pincode" type="number" value={formData.pincode} onChange={handleChange} placeholder="e.g. 682001" required />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 py-4">
          <Button variant="secondary" type="button" onClick={() => navigate("/parents")}>
            Cancel Registration
          </Button>
          <Button type="submit" disabled={loading} className="px-10 py-4 shadow-xl shadow-blue-200/50 text-base font-bold bg-blue-600 hover:bg-blue-700">
            {loading ? "Submitting..." : "Submit Parent Record"}
          </Button>
        </div>

      </form>
    </div>
  );
};
