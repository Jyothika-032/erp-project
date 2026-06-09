import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, CreditCard, User, Calendar, Activity, Hash, DollarSign } from "lucide-react";
import * as paymentsApi from "../../api/paymentsApi";
import studentApi from "../../api/studentApi"; 
import { Button } from "../../components/common/Button";
import toast from "react-hot-toast";

const PaymentForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [formData, setFormData] = useState({
        student_id: "",
        amount: "",
        payment_method: "Cash",
        payment_date: new Date().toISOString().split('T')[0],
        transaction_id: "",
        status: "success",
        institution_id: 1
    });

    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Fetch students for the dropdown
        const fetchStudents = async () => {
            try {
                const res = await studentApi.getStudents();
                if (res.success) setStudents(res.data);
            } catch (err) { console.error(err); }
        };
        fetchStudents();

        if (isEdit) {
            const fetchPayment = async () => {
                try {
                    const res = await paymentsApi.getPaymentById(id);
                    if (res.success) {
                        const p = res.data;
                        setFormData({
                            student_id: p.student_id,
                            amount: p.amount,
                            payment_method: p.payment_method,
                            payment_date: p.payment_date,
                            transaction_id: p.transaction_id || "",
                            status: p.status,
                            institution_id: p.institution_id
                        });
                    }
                } catch (err) { toast.error("Failed to load payment data"); }
            };
            fetchPayment();
        }
    }, [id, isEdit]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isEdit) {
                await paymentsApi.updatePayment(id, formData);
                toast.success("Transaction updated successfully");
            } else {
                await paymentsApi.createPayment(formData);
                toast.success("Payment recorded successfully");
            }
            navigate("/finance/payments");
        } catch (err) {
            toast.error("Operation failed. Please check your data.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => navigate("/finance/payments")}
                    className="p-2.5 text-slate-500 hover:text-primary hover:bg-white rounded-2xl transition-all shadow-sm border border-transparent hover:border-slate-100"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-1">
                        {isEdit ? "Edit Transaction" : "Record New Payment"}
                    </h1>
                    <p className="text-slate-500 text-sm font-medium">
                        {isEdit ? "Modify existing database record" : "Add a new financial transaction to the ledger"}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100 space-y-8 md:col-span-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Student Selection */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <User size={14} /> Student Name
                            </label>
                            <select 
                                required
                                disabled={isEdit}
                                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 ring-primary/20 transition-all disabled:opacity-50"
                                value={formData.student_id}
                                onChange={(e) => setFormData({...formData, student_id: e.target.value})}
                            >
                                <option value="">Select Student</option>
                                {students.map(s => (
                                    <option key={s.student_id} value={s.student_id}>
                                        {s.student_name} (STU-{String(s.student_id).padStart(3, '0')})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Amount */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <DollarSign size={14} /> Amount (INR)
                            </label>
                            <input 
                                type="number" 
                                required
                                placeholder="0.00"
                                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 ring-primary/20 transition-all"
                                value={formData.amount}
                                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                            />
                        </div>

                        {/* Payment Method */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <CreditCard size={14} /> Payment Method
                            </label>
                            <select 
                                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 ring-primary/20 transition-all"
                                value={formData.payment_method}
                                onChange={(e) => setFormData({...formData, payment_method: e.target.value})}
                            >
                                <option value="Cash">Cash</option>
                                <option value="UPI">UPI / QR</option>
                                <option value="Bank">Bank Transfer</option>
                                <option value="Card">Credit/Debit Card</option>
                                <option value="Cheque">Cheque</option>
                            </select>
                        </div>

                        {/* Transaction ID */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Hash size={14} /> Transaction ID / Ref
                            </label>
                            <input 
                                type="text" 
                                placeholder="e.g. TXN123456789"
                                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 ring-primary/20 transition-all"
                                value={formData.transaction_id}
                                onChange={(e) => setFormData({...formData, transaction_id: e.target.value})}
                            />
                        </div>

                        {/* Date */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Calendar size={14} /> Payment Date
                            </label>
                            <input 
                                type="date" 
                                required
                                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 ring-primary/20 transition-all"
                                value={formData.payment_date}
                                onChange={(e) => setFormData({...formData, payment_date: e.target.value})}
                            />
                        </div>

                        {/* Status */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Activity size={14} /> Status
                            </label>
                            <select 
                                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 ring-primary/20 transition-all"
                                value={formData.status}
                                onChange={(e) => setFormData({...formData, status: e.target.value})}
                            >
                                <option value="success">Success / Paid</option>
                                <option value="pending">Pending / Processing</option>
                                <option value="failed">Failed / Refunded</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-50 flex justify-end gap-3">
                        <Button variant="secondary" type="button" onClick={() => navigate("/finance/payments")}>Cancel</Button>
                        <Button type="submit" loading={loading} icon={Save}>
                            {isEdit ? "Update Database Record" : "Confirm & Save Payment"}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default PaymentForm;
