import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Download, 
  Printer, 
  User, 
  Calendar, 
  CreditCard, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Hash, 
  Activity, 
  Building,
  ShieldCheck
} from "lucide-react";
import * as paymentsApi from "../../api/paymentsApi";
import { Button } from "../../components/common/Button";
import toast from "react-hot-toast";

const PaymentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPaymentDetails = useCallback(async () => {
    setLoading(true);
    try {
      const res = await paymentsApi.getPaymentById(id);
      if (res.success) {
        setPayment(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch payment details:", error);
      toast.error("Failed to load payment records");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPaymentDetails();
  }, [fetchPaymentDetails]);

  const handlePrint = () => {
    window.print();
  };

  const handleExcelDownload = () => {
    if (!payment) return;
    const headers = ["Receipt No", "Date", "Student", "Amount", "Method", "Ref ID", "Status", "Processed By"];
    const row = [
        `PAY-${payment.payment_id}`,
        payment.payment_date,
        payment.student_name || 'N/A',
        payment.amount,
        payment.payment_method,
        payment.transaction_id || 'N/A',
        payment.status,
        payment.received_by_name || `Staff #${payment.received_by}`
    ];
    const csvContent = "\uFEFF" + [headers, row].map(e => e.map(cell => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Receipt_PAY${payment.payment_id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Receipt Excel file downloaded");
  };

  const handleDownload = () => {
    if (!payment) return;
    const content = `
--------------------------------------------------
           OFFICIAL PAYMENT RECEIPT
--------------------------------------------------
Receipt No: #PAY-${String(payment.payment_id).padStart(4, '0')}
Date: ${new Date(payment.payment_date).toLocaleDateString()}
Status: ${payment.status.toUpperCase()}

PAYER DETAILS
Name: ${payment.student_name || 'N/A'}
ID: STU-${String(payment.student_id).padStart(4, '0')}

TRANSACTION DETAILS
Amount: ₹${Number(payment.amount).toLocaleString('en-IN')}
Method: ${payment.payment_method}
Reference: ${payment.transaction_id || 'N/A'}
Collected By: ${payment.received_by_name || `Staff #${payment.received_by}`}

--------------------------------------------------
          Thank you for your payment
--------------------------------------------------
Generated on: ${new Date().toLocaleString()}
    `;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Receipt_PAY${payment.payment_id}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Receipt text file downloaded");
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this payment record? This will permanently remove it from the database.")) {
      try {
        const res = await paymentsApi.deletePayment(id);
        if (res.success) {
          toast.success("Payment record deleted from database");
          navigate("/finance/payments");
        }
      } catch (err) {
        toast.error("Failed to delete record");
      }
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );

  if (!payment) return (
    <div className="text-center py-20">
      <h2 className="text-2xl font-bold text-slate-800">Payment Record Not Found</h2>
      <Button className="mt-4" onClick={() => navigate("/finance/payments")}>Back to Log</Button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate("/finance/payments")}
            className="p-2.5 text-slate-500 hover:text-primary hover:bg-white rounded-2xl transition-all shadow-sm border border-transparent hover:border-slate-100 no-print"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-1">Receipt Detail</h1>
            <p className="text-slate-500 text-sm font-medium">Viewing full database record for Receipt <span className="text-primary font-bold">#PAY-{String(payment.payment_id).padStart(4, '0')}</span></p>
          </div>
        </div>
        <div className="flex items-center gap-3 no-print">
          <Button variant="secondary" onClick={handleDelete}>Delete</Button>
          <Button variant="secondary" onClick={handleDownload}>Text</Button>
          <Button variant="secondary" onClick={handleExcelDownload}>Download Excel</Button>
          <Button onClick={handlePrint}>Print Receipt (PDF)</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 no-print">
        {/* Left Column: Summary Card */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5">
              <CreditCard size={120} />
            </div>
            
            <div className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">Total Amount</div>
            <div className="text-5xl font-black text-slate-900 tracking-tighter mb-1">
              ₹{Number(payment.amount).toLocaleString('en-IN')}
            </div>
            <div className="text-sm font-bold text-slate-500 mb-6 text-center">Paid by: <span className="text-slate-800">{payment.student_name || 'N/A'}</span></div>
            
            <div className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-sm ${
              payment.status === 'success' ? 'bg-emerald-50 text-emerald-600 shadow-emerald-100' : 
              payment.status === 'pending' ? 'bg-amber-50 text-amber-600 shadow-amber-100' : 'bg-rose-50 text-rose-600 shadow-rose-100'
            }`}>
              {payment.status === 'success' ? <CheckCircle2 size={16} /> : payment.status === 'pending' ? <Clock size={16} /> : <XCircle size={16} />}
              {payment.status}
            </div>

            <div className="mt-10 pt-8 border-t border-slate-50 space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Method</span>
                    <span className="text-xs font-bold text-slate-700 bg-slate-50 px-3 py-1 rounded-lg uppercase">{payment.payment_method}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</span>
                    <span className="text-xs font-bold text-slate-700">{new Date(payment.payment_date).toLocaleDateString()}</span>
                </div>
            </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-xl relative overflow-hidden group">
             <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                <Building size={160} />
             </div>
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Internal Reference</h3>
             <div className="space-y-6 relative z-10">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-slate-300"><Hash size={18} /></div>
                  <div>
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Transaction ID</p>
                    <p className="font-bold text-sm tracking-tight">{payment.transaction_id || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-slate-300"><User size={18} /></div>
                  <div>
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Collector ID</p>
                    <p className="font-bold text-sm">STAFF-#{String(payment.received_by).padStart(3, '0')}</p>
                  </div>
                </div>
             </div>
          </div>
        </div>

        {/* Right Column: Full DB Fields */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100">
            <h3 className="text-lg font-black text-slate-900 mb-8 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><Activity size={16} /></span>
              Complete Database Fields
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-12">
              <DetailField label="Payment ID" value={`#${payment.payment_id}`} icon={<Hash size={14}/>} />
              <DetailField label="Payer (Student)" value={payment.student_name || 'N/A'} icon={<User size={14}/>} />
              <DetailField label="Student ID" value={`STU-${String(payment.student_id).padStart(4, '0')}`} icon={<User size={14}/>} />
              <DetailField label="Institution ID" value={`#${payment.institution_id}`} icon={<Building size={14}/>} />
              <DetailField label="Amount (Raw)" value={payment.amount} icon={<CreditCard size={14}/>} />
              <DetailField label="Payment Method" value={payment.payment_method} icon={<Activity size={14}/>} />
              <DetailField label="Processed By" value={payment.received_by_name || `Staff #${payment.received_by}`} icon={<User size={14}/>} />
              <DetailField label="Transaction Reference" value={payment.transaction_id || 'None'} icon={<Hash size={14}/>} />
              <DetailField label="Payment Date" value={payment.payment_date} icon={<Calendar size={14}/>} />
              <DetailField label="Status" value={payment.status} icon={<ShieldCheck size={14}/>} />
              <DetailField label="Recorded At" value={new Date(payment.created_at).toLocaleString()} icon={<Clock size={14}/>} />
            </div>
          </div>
        </div>
      </div>

      {/* --- PROFESSIONAL PRINT TEMPLATE (Hidden on screen) --- */}
      <div className="hidden print:block p-12 bg-white text-slate-900 font-sans min-h-[1000px] border-[12px] border-slate-50 relative">
        <div className="flex justify-between items-start mb-16">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-slate-900 mb-2 uppercase">Official Receipt</h1>
            <p className="text-slate-500 font-bold tracking-widest text-xs uppercase">Transaction Proof • Internal Revenue Service</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-black text-primary uppercase tracking-tighter">EduERP</h2>
            <p className="text-slate-500 text-[10px] font-bold">Generated: {new Date().toLocaleString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-12 mb-16">
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Billed To (Student)</h3>
            <div>
              <p className="text-xl font-black text-slate-900">{payment.student_name || 'N/A'}</p>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-tight">Student ID: STU-{String(payment.student_id).padStart(4, '0')}</p>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Payment Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[8px] font-black text-slate-400 uppercase">Receipt No</p>
                <p className="text-xs font-bold text-slate-800">#PAY-{payment.payment_id}</p>
              </div>
              <div>
                <p className="text-[8px] font-black text-slate-400 uppercase">Date</p>
                <p className="text-xs font-bold text-slate-800">{new Date(payment.payment_date).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 rounded-3xl p-10 mb-16">
          <div className="flex justify-between items-center mb-8">
            <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Total Amount Received</span>
            <span className="text-4xl font-black text-slate-900 tracking-tighter">₹{Number(payment.amount).toLocaleString('en-IN')}</span>
          </div>
          <div className="grid grid-cols-3 gap-8 pt-8 border-t border-slate-200/50">
            <div>
              <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Payment Method</p>
              <p className="text-sm font-black text-slate-800 uppercase">{payment.payment_method}</p>
            </div>
            <div>
              <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Status</p>
              <p className="text-sm font-black text-emerald-600 uppercase tracking-widest">{payment.status}</p>
            </div>
            <div>
              <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Reference No</p>
              <p className="text-sm font-bold text-slate-800">{payment.transaction_id || 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-12 mb-20">
          <div>
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Official Verification</h3>
             <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-tight mb-1">Processed By</p>
                <p className="text-sm font-bold text-slate-800">{payment.received_by_name || `Staff #${payment.received_by}`}</p>
             </div>
          </div>
          <div className="flex flex-col justify-end items-center">
            <div className="w-64 h-px bg-slate-300 mb-2"></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Authorized Signature</p>
          </div>
        </div>

        <div className="absolute bottom-12 left-12 right-12 text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest">
            This is a computer generated document. No signature required for digital validation.
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          /* Hide layout elements globally */
          nav, aside, header, footer, .sidebar, .navbar, .no-print { 
            display: none !important; 
          }
          
          /* Reset container margins for full-page print */
          main, .main-content, .print-container { 
            margin: 0 !important; 
            padding: 0 !important;
            width: 100% !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
          }

          body { 
            background: white !important; 
            margin: 0 !important; 
            padding: 0 !important; 
          }

          @page { 
            margin: 0; 
            size: auto; 
          }
        }
      `}} />
    </div>
  );
};

const DetailField = ({ label, value, icon }) => (
  <div className="flex items-start gap-4 group">
    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300">
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-sm font-bold text-slate-700 tracking-tight">{value}</p>
    </div>
  </div>
);

export default PaymentDetail;
