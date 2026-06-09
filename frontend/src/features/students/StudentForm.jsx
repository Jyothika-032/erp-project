import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, User, MapPin, GraduationCap, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import studentApi from "../../api/studentApi";

export const StudentForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(isEdit);
  const [formData, setFormData] = useState({
    student_name: "",
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    date_of_birth: "",
    gender: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    course_id: "",
    batch_id: "",
    blood_group: "",
    graduation_status: "Pursuing",
    status: "active",
    institution_id: 1 // Default for now
  });

  const fetchStudentData = useCallback(async () => {
    if (!isEdit) return;
    setLoading(true);
    try {
      const res = await studentApi.getStudentById(id);
      if (res.success) {
        // Map the date to YYYY-MM-DD for the input type="date"
        const data = res.data;
        if (data.date_of_birth) {
          data.date_of_birth = new Date(data.date_of_birth).toISOString().split('T')[0];
        }
        setFormData(data);
      }
    } catch (err) {
      console.error("Failed to fetch student for edit:", err);
      toast.error("Failed to load student details");
    } finally {
      setLoading(false);
    }
  }, [id, isEdit]);

  useEffect(() => {
    fetchStudentData();
  }, [fetchStudentData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      // Keep student_name in sync with first/last name
      if (name === 'first_name' || name === 'last_name') {
        newData.student_name = `${newData.first_name} ${newData.last_name}`.trim();
      }
      return newData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await studentApi.updateStudent(id, formData);
        toast.success("Student updated successfully");
      } else {
        await studentApi.createStudent(formData);
        toast.success("Student registered successfully");
      }
      navigate("/students");
    } catch (err) {
      console.error("Submit failed:", err);
      toast.error(err.response?.data?.message || "Failed to save student record");
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
          onClick={() => navigate("/students")}
          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-blue-100"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            {isEdit ? "Update Student Profile" : "Register New Student"}
          </h1>
          <p className="text-gray-500 text-sm font-medium mt-1">
            {isEdit ? "Modify existing record details below." : "Fill in the comprehensive details to onboard a new student."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl">
        
        {/* Basic Information Section */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <User size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Basic Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Input label="First Name" name="first_name" value={formData.first_name} onChange={handleChange} placeholder="e.g. John" required />
            <Input label="Last Name" name="last_name" value={formData.last_name} onChange={handleChange} placeholder="e.g. Doe" required />
            <Input label="Date of Birth" name="date_of_birth" type="date" value={formData.date_of_birth} onChange={handleChange} required />
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 ml-1">Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className="block w-full rounded-xl border border-gray-200 bg-gray-50/50 shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 sm:text-sm p-3.5 transition-all outline-none" required>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <Input label="Email address" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="john.doe@example.com" required />
            <Input label="Phone Number" name="phone_number" type="tel" value={formData.phone_number} onChange={handleChange} placeholder="+91 98765 43210" required />
            <Input label="Blood Group" name="blood_group" value={formData.blood_group} onChange={handleChange} placeholder="e.g. O+" />
          </div>
        </div>

        {/* Academic Details Section */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <GraduationCap size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Academic & Status</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Input label="Course ID" name="course_id" type="number" value={formData.course_id} onChange={handleChange} placeholder="e.g. 1" required />
            <Input label="Batch ID" name="batch_id" type="number" value={formData.batch_id} onChange={handleChange} placeholder="e.g. 1" required />
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 ml-1">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="block w-full rounded-xl border border-gray-200 bg-gray-50/50 shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 sm:text-sm p-3.5 transition-all outline-none">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 ml-1">Graduation Status</label>
              <select name="graduation_status" value={formData.graduation_status} onChange={handleChange} className="block w-full rounded-xl border border-gray-200 bg-gray-50/50 shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 sm:text-sm p-3.5 transition-all outline-none">
                <option value="Pursuing">Pursuing</option>
                <option value="Completed">Completed</option>
                <option value="Dropped">Dropped</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contact & Address Section */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-6">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <MapPin size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Residential Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="md:col-span-2 lg:col-span-3">
              <Input label="Full Address" name="address" value={formData.address} onChange={handleChange} placeholder="House No, Street, Landmark" required />
            </div>
            <Input label="City" name="city" value={formData.city} onChange={handleChange} placeholder="e.g. Kochi" required />
            <Input label="State" name="state" value={formData.state} onChange={handleChange} placeholder="e.g. Kerala" required />
            <Input label="Pincode" name="pincode" type="number" value={formData.pincode} onChange={handleChange} placeholder="e.g. 682001" required />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 py-4">
          <Button variant="secondary" type="button" onClick={() => navigate("/students")}>
            Cancel
          </Button>
          <Button type="submit" className="px-10 py-4 shadow-xl shadow-blue-200/50 text-base font-bold bg-blue-600 hover:bg-blue-700">
            {isEdit ? "Save Changes" : "Register Student"}
          </Button>
        </div>

      </form>
    </div>
  );
};
