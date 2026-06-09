import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, User, Briefcase, RefreshCw } from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import staffApi from "../../api/staffApi";

export const StaffForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { addToast } = useToast();

  const [loading, setLoading] = useState(isEdit);
  const [formData, setFormData] = useState({
    staff_name: "",
    email: "",
    gender: "",
    date_of_birth: "",
    designation: "",
    contract_end_date: "",
    experience_years: "",
    qualification: "",
    status: "active",
    institution_id: 1 // Default for now
  });

  const fetchStaffData = useCallback(async () => {
    if (!isEdit) return;
    setLoading(true);
    try {
      const res = await staffApi.getById(id);
      if (res.success) {
        const data = { ...res.data };
        // Map dates to YYYY-MM-DD for the input type="date"
        if (data.date_of_birth) {
          data.date_of_birth = new Date(data.date_of_birth).toISOString().split('T')[0];
        }
        if (data.contract_end_date) {
          data.contract_end_date = new Date(data.contract_end_date).toISOString().split('T')[0];
        }
        setFormData(data);
      }
    } catch (err) {
      console.error("Failed to fetch staff for edit:", err);
      addToast("Failed to load staff details", "error");
    } finally {
      setLoading(false);
    }
  }, [id, isEdit, addToast]);

  useEffect(() => {
    fetchStaffData();
  }, [fetchStaffData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await staffApi.update(id, formData);
        addToast("Staff member updated successfully", "success");
      } else {
        await staffApi.create(formData);
        addToast("Staff member registered successfully", "success");
      }
      navigate("/staff");
    } catch (err) {
      console.error("Submit failed:", err);
      addToast(err.response?.data?.message || "Failed to save staff record", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate("/staff")}
          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-blue-100"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            {isEdit ? "Update Staff Profile" : "Register New Staff Member"}
          </h1>
          <p className="text-gray-500 text-sm font-medium mt-1">
            {isEdit ? "Modify existing record details below." : "Fill in the comprehensive details to onboard a new staff member."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl">
        
        {/* Basic Personal Information Section */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <User size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Personal Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Input 
              label="Full Name" 
              name="staff_name" 
              value={formData.staff_name} 
              onChange={handleChange} 
              placeholder="e.g. Ramesh Kumar" 
              required 
            />
            
            <Input 
              label="Email Address" 
              name="email" 
              type="email" 
              value={formData.email} 
              onChange={handleChange} 
              placeholder="e.g. ramesh.kumar@example.com" 
              required 
            />

            <Input 
              label="Date of Birth" 
              name="date_of_birth" 
              type="date" 
              value={formData.date_of_birth} 
              onChange={handleChange} 
              required 
            />
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 ml-1">Gender</label>
              <select 
                name="gender" 
                value={formData.gender} 
                onChange={handleChange} 
                className="block w-full rounded-xl border border-gray-200 bg-gray-50/50 shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 sm:text-sm p-3.5 transition-all outline-none" 
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Professional Details Section */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Briefcase size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Professional Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Input 
              label="Designation" 
              name="designation" 
              value={formData.designation} 
              onChange={handleChange} 
              placeholder="e.g. Trainer" 
              required 
            />
            
            <Input 
              label="Qualification" 
              name="qualification" 
              value={formData.qualification} 
              onChange={handleChange} 
              placeholder="e.g. B.Tech" 
              required 
            />

            <Input 
              label="Experience (in Years)" 
              name="experience_years" 
              type="number" 
              value={formData.experience_years} 
              onChange={handleChange} 
              placeholder="e.g. 5" 
              required 
            />

            <Input 
              label="Contract End Date" 
              name="contract_end_date" 
              type="date" 
              value={formData.contract_end_date} 
              onChange={handleChange} 
              required 
            />
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 ml-1">Status</label>
              <select 
                name="status" 
                value={formData.status} 
                onChange={handleChange} 
                className="block w-full rounded-xl border border-gray-200 bg-gray-50/50 shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 sm:text-sm p-3.5 transition-all outline-none"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 py-4">
          <Button variant="secondary" type="button" onClick={() => navigate("/staff")}>
            Cancel
          </Button>
          <Button type="submit" className="px-10 py-4 shadow-xl shadow-blue-200/50 text-base font-bold bg-blue-600 hover:bg-blue-700">
            {isEdit ? "Save Changes" : "Register Staff"}
          </Button>
        </div>

      </form>
    </div>
  );
};
