import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, Layers, Clock, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";

import { useAuth } from "../../context/AuthContext";
import apiClient from "../../api/apiClient";

export const CourseForm = () => {
  const navigate = useNavigate();
  const { currentInstitution } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    courseName: "", courseCode: "", department: "",
    duration: "", durationUnit: "Years",
    description: "", maxCapacity: "", fees: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let durationInMonths = parseInt(formData.duration, 10) || 0;
    if (formData.durationUnit === "Years") {
      durationInMonths *= 12;
    } else if (formData.durationUnit === "Semesters") {
      durationInMonths *= 6;
    }

    try {
      const payload = {
        institution_id: currentInstitution?.id || 1,
        course_name: formData.courseName,
        course_code: formData.courseCode,
        duration_in_months: durationInMonths,
        total_fees: parseFloat(formData.fees) || 0,
        description: formData.description,
        status: "active"
      };

      const res = await apiClient.post("/courses", payload);
      if (res.success) {
        toast.success("Course successfully created in the system.");
        navigate("/courses");
      } else {
        toast.error(res.message || "Failed to create course.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "An error occurred while creating the course.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate("/courses")}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-blue-100"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Create New Course</h1>
            <p className="text-gray-500 text-sm font-medium mt-1">Configure an academic course offering.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <BookOpen size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Course Fundamentals</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Input label="Course Name" name="courseName" value={formData.courseName} onChange={handleChange} placeholder="e.g. Master of Computer Applications" required />
            </div>
            <Input label="Course Code" name="courseCode" value={formData.courseCode} onChange={handleChange} placeholder="e.g. MCA-01" required />
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 ml-1">Department</label>
              <select name="department" value={formData.department} onChange={handleChange} className="block w-full rounded-xl border border-gray-200 bg-gray-50/50 shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 sm:text-sm p-3.5 transition-all outline-none" required>
                <option value="">Select Department...</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Commerce">Commerce</option>
                <option value="Design">Design</option>
              </select>
            </div>

            <div className="col-span-1 md:col-span-2 flex gap-4">
               <div className="flex-1">
                 <Input label="Duration Length" name="duration" type="number" value={formData.duration} onChange={handleChange} placeholder="e.g. 3" required />
               </div>
               <div className="flex-1 space-y-2">
                 <label className="block text-sm font-semibold text-gray-700 ml-1">Unit</label>
                 <select name="durationUnit" value={formData.durationUnit} onChange={handleChange} className="block w-full rounded-xl border border-gray-200 bg-gray-50/50 shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 sm:text-sm p-3.5 transition-all outline-none">
                   <option value="Years">Years</option>
                   <option value="Semesters">Semesters</option>
                   <option value="Months">Months</option>
                 </select>
               </div>
            </div>
          </div>
          
          <div className="mt-6">
            <label className="block text-sm font-semibold text-gray-700 ml-1 mb-2">Description / Syllabus Overview</label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleChange}
              rows={4} 
              className="block w-full rounded-xl border border-gray-200 bg-gray-50/50 shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 sm:text-sm p-3.5 transition-all outline-none" 
              placeholder="Provide a brief description of the course parameters..."
            />
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-6">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <Layers size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Operational Constraints</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Input label="Maximum Batch Capacity" name="maxCapacity" type="number" value={formData.maxCapacity} onChange={handleChange} placeholder="e.g. 60" required />
            <Input label="Base Fees (Annual)" name="fees" type="text" value={formData.fees} onChange={handleChange} placeholder="e.g. 50000" />
          </div>
          
          <div className="mt-6 flex items-start gap-3 p-4 bg-amber-50 text-amber-700 rounded-xl border border-amber-100">
            <AlertCircle size={20} className="mt-0.5" />
            <p className="text-sm">Note: Modifying core course metrics may impact existing student batches and fee generation algorithms.</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 py-4">
          <Button variant="secondary" type="button" onClick={() => navigate("/courses")}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="px-10 py-4 shadow-xl shadow-blue-200/50 text-base font-bold bg-blue-600 hover:bg-blue-700">
            {loading ? "Creating..." : "Create Course"}
          </Button>
        </div>
      </form>
    </div>
  );
};
