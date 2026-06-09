import { useState, useEffect, useCallback } from "react";
import { Table } from "../../components/common/Table";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import {
  Award, Briefcase, DollarSign, Edit2, Trash2, LayoutGrid,
  List, Search, Plus, MapPin, Calendar, RefreshCw, Eye, X,
  CheckCircle2, Clock, GraduationCap, XCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import placementApi from "../../api/placementApi";

const STATUS_STYLES = {
  Placed:          "bg-emerald-100 text-emerald-700 border-emerald-200",
  Internship:      "bg-blue-100 text-blue-700 border-blue-200",
  "Higher Studies":"bg-purple-100 text-purple-700 border-purple-200",
  "Not Placed":    "bg-red-100 text-red-700 border-red-200",
};

const StatusBadge = ({ status }) => (
  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${STATUS_STYLES[status] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
    {status || "—"}
  </span>
);

/* ── Detail View Modal ── */
const DetailModal = ({ record, onClose }) => {
  if (!record) return null;
  const fields = [
    { label: "Student",   value: record.student_name },
    { label: "Company",   value: record.company_name },
    { label: "Role",      value: record.job_role },
    { label: "Package",   value: record.salary_package ? `₹${record.salary_package}` : "—" },
    { label: "Location",  value: record.placement_location },
    { label: "Date",      value: record.placement_date ? new Date(record.placement_date).toLocaleDateString() : "—" },
    { label: "Status",    value: record.status },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 p-8 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 font-black text-xl border border-amber-100">
              {(record.student_name || "S")[0]}
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900">{record.student_name}</h2>
              <p className="text-sm text-gray-500 font-medium">{record.company_name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-3">
          {fields.map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center py-2.5 border-b border-gray-50 last:border-0">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</span>
              {label === "Status"
                ? <StatusBadge status={value} />
                : <span className="text-sm font-semibold text-gray-800">{value || "—"}</span>
              }
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full py-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold text-sm transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

/* ── Delete Confirmation Modal ── */
const DeleteModal = ({ record, onConfirm, onClose, deleting }) => {
  if (!record) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm mx-4 p-8 animate-in fade-in zoom-in duration-200">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 border border-red-100">
            <Trash2 size={28} />
          </div>
          <h2 className="text-xl font-black text-gray-900">Delete Record?</h2>
          <p className="text-gray-500 text-sm">
            This will permanently remove the placement record for{" "}
            <strong className="text-gray-800">{record.student_name}</strong> at{" "}
            <strong className="text-gray-800">{record.company_name}</strong>.
          </p>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold text-sm transition-colors">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-colors disabled:opacity-60"
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Main Component ── */
export const PlacementList = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery]   = useState("");
  const [viewMode, setViewMode]         = useState("gallery");
  const [placements, setPlacements]     = useState([]);
  const [loading, setLoading]           = useState(true);
  const [viewRecord, setViewRecord]     = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]         = useState(false);

  const fetchPlacements = useCallback(async () => {
    setLoading(true);
    try {
      const res = await placementApi.getAll();
      if (res.success) setPlacements(res.data || []);
    } catch (err) {
      console.error("Failed to fetch placements:", err);
      toast.error("Failed to load placement records");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPlacements(); }, [fetchPlacements]);

  const filteredPlacements = placements.filter((p) =>
    (p.student_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.company_name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  /* ── Delete Handler ── */
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await placementApi.delete(deleteTarget.placement_id || deleteTarget.id);
      toast.success("Placement record deleted.");
      setDeleteTarget(null);
      fetchPlacements();
    } catch (err) {
      toast.error(err.message || "Failed to delete record.");
    } finally {
      setDeleting(false);
    }
  };

  /* ── Table Columns ── */
  const columns = [
    {
      header: "Student", accessor: "student_name",
      render: (p) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
            {(p.student_name || "S")[0]}
          </div>
          <span className="font-semibold text-gray-900">{p.student_name}</span>
        </div>
      ),
    },
    {
      header: "Company", accessor: "company_name",
      render: (p) => (
        <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs font-bold uppercase tracking-wider border border-gray-200">
          {p.company_name}
        </span>
      ),
    },
    { header: "Role",     accessor: "job_role",      render: (p) => <span className="text-gray-600 font-medium">{p.job_role}</span> },
    { header: "Package",  accessor: "salary_package", render: (p) => <span className="text-emerald-600 font-black">₹{p.salary_package}</span> },
    {
      header: "Location", accessor: "placement_location",
      render: (p) => (
        <div className="flex items-center gap-1 text-gray-400">
          <MapPin size={12} />
          <span className="text-xs">{p.placement_location}</span>
        </div>
      ),
    },
    { header: "Status", accessor: "status", render: (p) => <StatusBadge status={p.status} /> },
  ];

  const tableActions = (row) => (
    <div className="flex gap-1">
      <button
        title="View details"
        onClick={() => setViewRecord(row)}
        className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
      >
        <Eye size={16} />
      </button>
      <button
        title="Edit record"
        onClick={() => navigate(`/placements/edit/${row.placement_id || row.id}`)}
        className="p-2 text-amber-500 hover:bg-amber-50 rounded-xl transition-colors"
      >
        <Edit2 size={16} />
      </button>
      <button
        title="Delete record"
        onClick={() => setDeleteTarget(row)}
        className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Modals */}
      <DetailModal record={viewRecord} onClose={() => setViewRecord(null)} />
      <DeleteModal
        record={deleteTarget}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
        deleting={deleting}
      />

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            Placement Records <Award className="text-amber-500" size={32} />
          </h1>
          <p className="text-gray-500 font-medium mt-1">Celebrating our students' professional milestones.</p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={fetchPlacements} icon={RefreshCw} className={loading ? "animate-spin" : ""}>
            Sync
          </Button>
          <Button onClick={() => navigate("/placements/new")} icon={Plus}>
            Add Record
          </Button>
          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
            <button
              onClick={() => setViewMode("gallery")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-bold text-sm ${
                viewMode === "gallery" ? "bg-primary text-white shadow-lg shadow-blue-200" : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <LayoutGrid size={16} /> Gallery
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-bold text-sm ${
                viewMode === "table" ? "bg-primary text-white shadow-lg shadow-blue-200" : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <List size={16} /> Table
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar (Gallery mode) */}
      {viewMode === "gallery" && (
        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search student or company…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      )}

      {/* Content */}
      {viewMode === "gallery" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl border border-gray-100 p-6 h-48 animate-pulse" />
            ))
          ) : filteredPlacements.length === 0 ? (
            <div className="col-span-3 flex flex-col items-center justify-center py-20 text-gray-400">
              <Award size={48} className="mb-4 text-gray-200" />
              <p className="font-bold text-lg">No placement records found</p>
              <p className="text-sm mt-1">Click "Add Record" to create the first one.</p>
            </div>
          ) : (
            filteredPlacements.map((p, i) => (
              <div key={i} className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 font-black text-xl border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    {(p.student_name || "S")[0]}
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{p.company_name}</p>
                    <p className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg mt-1 inline-block">₹{p.salary_package}</p>
                  </div>
                </div>

                <h3 className="text-xl font-black text-gray-900 tracking-tight">{p.student_name}</h3>
                <p className="text-gray-500 font-bold text-sm mt-1 flex items-center gap-1.5 uppercase tracking-wide">
                  <Briefcase size={14} className="text-blue-500" /> {p.job_role}
                </p>

                <div className="mt-4 flex items-center gap-2">
                  <StatusBadge status={p.status} />
                </div>

                <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-gray-400">
                    <span className="flex items-center gap-1 text-xs font-bold"><MapPin size={12} />{p.placement_location}</span>
                    <span className="flex items-center gap-1 text-xs font-bold"><Calendar size={12} />{p.placement_date ? new Date(p.placement_date).getFullYear() : "—"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      title="View details"
                      onClick={() => setViewRecord(p)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      title="Edit record"
                      onClick={() => navigate(`/placements/edit/${p.placement_id || p.id}`)}
                      className="p-2 text-amber-500 hover:bg-amber-50 rounded-xl transition-colors"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      title="Delete record"
                      onClick={() => setDeleteTarget(p)}
                      className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <Table
          columns={columns}
          data={filteredPlacements}
          renderActions={tableActions}
        />
      )}
    </div>
  );
};
