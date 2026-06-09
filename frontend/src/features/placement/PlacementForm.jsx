import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Award, Briefcase, MapPin, Loader2, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import placementApi from "../../api/placementApi";
import studentApi from "../../api/studentApi";

export const PlacementForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();           // present only on edit route
  const isEdit = Boolean(id);

  const [submitting, setSubmitting]       = useState(false);
  const [loadingData, setLoadingData]     = useState(isEdit); // loading existing record
  const [students, setStudents]           = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(true);

  const [formData, setFormData] = useState({
    student_id:         "",
    company_name:       "",
    job_role:           "",
    salary_package:     "",
    placement_location: "",
    placement_date:     "",
    status:             "Placed",
  });

  /* ── Fetch students dropdown ── */
  useEffect(() => {
    const fetchStudents = async () => {
      setLoadingStudents(true);
      try {
        const res = await studentApi.getStudents();
        if (res.success) setStudents(res.data || []);
      } catch (err) {
        console.error("Failed to fetch students:", err);
      } finally {
        setLoadingStudents(false);
      }
    };
    fetchStudents();
  }, []);

  /* ── In edit mode, pre-fill form with existing record ── */
  useEffect(() => {
    if (!isEdit) return;
    const fetchRecord = async () => {
      setLoadingData(true);
      try {
        const res = await placementApi.getById(id);
        if (res.success && res.data) {
          const r = res.data;
          setFormData({
            student_id:         r.student_id         || "",
            company_name:       r.company_name       || "",
            job_role:           r.job_role           || "",
            salary_package:     r.salary_package     || "",
            placement_location: r.placement_location || "",
            placement_date:     r.placement_date
              ? r.placement_date.split("T")[0]  // keep YYYY-MM-DD
              : "",
            status: r.status || "Placed",
          });
        } else {
          toast.error("Record not found.");
          navigate("/placements");
        }
      } catch (err) {
        toast.error("Could not load record.");
        navigate("/placements");
      } finally {
        setLoadingData(false);
      }
    };
    fetchRecord();
  }, [id, isEdit, navigate]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.student_id) {
      toast.error("Please select a student.");
      return;
    }
    setSubmitting(true);
    try {
      const res = isEdit
        ? await placementApi.update(id, formData)
        : await placementApi.create(formData);

      if (res.success) {
        toast.success(isEdit ? "Record updated successfully!" : "Placement record saved!");
        navigate("/placements");
      } else {
        toast.error(res.message || "Operation failed.");
      }
    } catch (err) {
      toast.error(err.message || "An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Loading skeleton while fetching edit data ── */
  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={36} className="animate-spin text-blue-500" />
        <span className="ml-3 text-gray-500 font-medium">Loading record…</span>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/placements")}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-blue-100"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              {isEdit ? "Edit Placement Record" : "New Placement Record"}{" "}
              <Award className="text-amber-500" size={32} />
            </h1>
            <p className="text-gray-500 text-sm font-medium mt-1">
              {isEdit
                ? "Update the details of this placement record."
                : "Register a corporate milestone for a student."}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl">
        {/* Section 1: Student & Company */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Award size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Student & Target</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Student Dropdown */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">
                Student <span className="text-red-500">*</span>
              </label>
              <select
                name="student_id"
                value={formData.student_id}
                onChange={handleChange}
                required
                disabled={loadingStudents}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-60"
              >
                <option value="">
                  {loadingStudents ? "Loading students…" : "— Select a student —"}
                </option>
                {students.map((s) => (
                  <option key={s.student_id} value={s.student_id}>
                    {s.student_name}{s.admission_number ? ` (${s.admission_number})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Hiring Company"
              name="company_name"
              value={formData.company_name}
              onChange={handleChange}
              placeholder="e.g. Google, Amazon"
              required
            />
          </div>
        </div>

        {/* Section 2: Offer Details */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Briefcase size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Offer Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Input
                label="Designation / Role"
                name="job_role"
                value={formData.job_role}
                onChange={handleChange}
                placeholder="e.g. Frontend Associate"
                required
              />
            </div>
            <Input
              label="Package (Annual)"
              name="salary_package"
              value={formData.salary_package}
              onChange={handleChange}
              placeholder="e.g. 12 LPA"
            />
          </div>

          {/* Status toggle */}
          <div className="mt-6">
            <label className="text-sm font-semibold text-gray-700">Placement Status</label>
            <div className="flex flex-wrap gap-3 mt-2">
              {["Placed", "Internship", "Higher Studies", "Not Placed"].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFormData({ ...formData, status: s })}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
                    formData.status === s
                      ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200"
                      : "bg-white border-gray-200 text-gray-600 hover:border-blue-300"
                  }`}
                >
                  {formData.status === s && <CheckCircle2 className="inline mr-1.5" size={14} />}
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 3: Logistics */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-6">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <MapPin size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Logistics</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Location / City"
              name="placement_location"
              value={formData.placement_location}
              onChange={handleChange}
              placeholder="e.g. Bangalore"
            />
            <Input
              label="Placement Date"
              name="placement_date"
              type="date"
              value={formData.placement_date}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 py-4">
          <Button variant="secondary" type="button" onClick={() => navigate("/placements")}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            className="px-10 py-4 shadow-xl shadow-blue-200/50 text-base font-bold bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
          >
            {submitting ? (
              <><Loader2 size={18} className="animate-spin" /> Saving…</>
            ) : isEdit ? (
              "Update Record"
            ) : (
              "Save Placement Record"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
