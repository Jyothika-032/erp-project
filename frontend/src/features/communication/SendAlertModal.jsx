import React, { useState, useEffect } from "react";
import { Mail, MessageSquare, Send, User, Phone, CheckCircle2, AlertTriangle, ExternalLink } from "lucide-react";
import { Modal } from "../../components/common/Modal";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Select } from "../../components/common/Select";
import parentApi from "../../api/parentApi";
import commsApi from "../../api/commsApi";
import { useToast } from "../../context/ToastContext";

const templates = {
  fee: {
    label: 'Fee Payment Reminder',
    subject: (studentName) => `Fee Payment Reminder — ${studentName}`,
    body: (recipientName, studentName, instName) => `Dear ${recipientName},\n\nThis is a reminder that the academic fee payment for ${studentName} is currently outstanding. Please arrange to clear the dues at your earliest convenience to avoid any disruption.\n\nBest regards,\n${instName}`
  },
  attendance: {
    label: 'Attendance Alert (Absenteeism)',
    subject: (studentName) => `Attendance Alert — ${studentName}`,
    body: (recipientName, studentName, instName) => `Dear ${recipientName},\n\nThis is to notify you that ${studentName} was marked ABSENT for classes today without prior approval. Please verify and contact the school administration if you have questions.\n\nBest regards,\n${instName}`
  },
  exam: {
    label: 'Exam Schedule & Reminder',
    subject: (studentName) => `Upcoming Exam Schedule Notification — ${studentName}`,
    body: (recipientName, studentName, instName) => `Dear ${recipientName},\n\nThis is to inform you that the official exam schedules for ${studentName} have been published. Please ensure they review the schedule and prepare diligently.\n\nBest regards,\n${instName}`
  },
  custom: {
    label: 'Custom Message (Compose)',
    subject: () => '',
    body: () => ''
  }
};

export const SendAlertModal = ({ isOpen, onClose, student, onSent }) => {
  const { addToast } = useToast();
  const [parent, setParent] = useState(null);
  const [loadingParent, setLoadingParent] = useState(false);
  const [sending, setSending] = useState(false);
  const [successData, setSuccessData] = useState(null);

  // Form State
  const [channel, setChannel] = useState("email"); // 'email' or 'sms'
  const [recipientType, setRecipientType] = useState("student"); // 'student' or 'parent'
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [template, setTemplate] = useState("custom");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  // Reset state on open/close or student change
  useEffect(() => {
    if (isOpen) {
      setSuccessData(null);
      setChannel("email");
      setRecipientType("student");
      setTemplate("custom");
      setSubject("");
      setMessage("");
      setParent(null);

      if (student?.student_id) {
        setLoadingParent(true);
        parentApi.getByStudentId(student.student_id)
          .then(res => {
            if (res.success && res.data && res.data.length > 0) {
              setParent(res.data[0]);
            }
          })
          .catch(err => {
            console.error("Failed to load parent info:", err);
          })
          .finally(() => {
            setLoadingParent(false);
          });
      }
    }
  }, [isOpen, student]);

  // Sync recipient info when selection, parent or student changes
  useEffect(() => {
    if (!isOpen) return;

    if (recipientType === "student" && student) {
      setRecipientName(student.student_name || "");
      setRecipientEmail(student.email || "");
      setRecipientPhone(student.phone_number || "");
    } else if (recipientType === "parent") {
      if (parent) {
        const parentName = parent.father_name || parent.mother_name || parent.guardian_name || "Parent";
        setRecipientName(parentName);
        setRecipientEmail(parent.email || "");
        setRecipientPhone(parent.phone_number || "");
      } else {
        setRecipientName("");
        setRecipientEmail("");
        setRecipientPhone("");
      }
    }
  }, [recipientType, student, parent, isOpen]);

  // Apply templates automatically
  useEffect(() => {
    if (!isOpen || template === "custom") return;

    const selectedTemplate = templates[template];
    if (selectedTemplate) {
      const studentName = student?.student_name || "Student";
      const instName = student?.institution_name || "EduERP Institution";
      
      let nameToUse = recipientName || (recipientType === "parent" ? "Parent" : studentName);
      
      setSubject(selectedTemplate.subject(studentName));
      setMessage(selectedTemplate.body(nameToUse, studentName, instName));
    }
  }, [template, recipientType, recipientName, student, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      addToast("Message body cannot be empty", "warning");
      return;
    }
    if (channel === "email" && !recipientEmail.trim()) {
      addToast("Recipient email is required for Email channel", "warning");
      return;
    }
    if (channel === "sms" && !recipientPhone.trim()) {
      addToast("Recipient phone number is required for SMS channel", "warning");
      return;
    }

    setSending(true);
    try {
      const payload = {
        student_id: student?.student_id,
        parent_id: recipientType === "parent" ? parent?.parent_id : null,
        institution_id: student?.institution_id || 1,
        type: channel,
        subject: channel === "email" ? subject : null,
        message,
        recipient_name: recipientName,
        recipient_email: channel === "email" ? recipientEmail : null,
        recipient_phone: channel === "sms" ? recipientPhone : null,
        sent_by: "Admin (Manual)"
      };

      const res = await commsApi.sendAlert(payload);
      if (res.success) {
        setSuccessData(res);
        addToast(
          res.previewUrl ? (
            <span>
              Alert sent successfully!{" "}
              <a 
                href={res.previewUrl} 
                target="_blank" 
                rel="noreferrer" 
                className="underline font-bold text-blue-600 hover:text-blue-800 pointer-events-auto"
              >
                Open Inbox
              </a>
            </span>
          ) : (
            "Alert sent successfully!"
          ),
          "success",
          6000
        );
        if (onSent) onSent();
      } else {
        addToast(res.message || "Failed to send alert", "error");
      }
    } catch (err) {
      console.error("Error sending alert:", err);
      addToast("An error occurred while sending the alert", "error");
    } finally {
      setSending(false);
    }
  };

  const templateOptions = Object.keys(templates).map(key => ({
    value: key,
    label: templates[key].label
  }));

  if (!student) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Send Alert: ${student.student_name}`}
    >
      {successData ? (
        // Premium Success View
        <div className="flex flex-col items-center text-center py-6 px-4 animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mb-4 shadow-inner">
            <CheckCircle2 size={36} strokeWidth={2.5} />
          </div>
          <h4 className="text-xl font-black text-slate-800 tracking-tight mb-2">Message Dispatched!</h4>
          <p className="text-sm text-slate-500 max-w-md mb-6">
            The {channel === "email" ? "email" : "SMS"} notification has been logged and sent to <span className="font-bold text-slate-700">{recipientName}</span>.
          </p>

          <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 mb-8 text-left space-y-3">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-slate-400 uppercase tracking-widest">Channel:</span>
              <span className="font-bold text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                {channel === "email" ? <Mail size={12} className="text-amber-500" /> : <MessageSquare size={12} className="text-blue-500" />}
                {channel}
              </span>
            </div>
            {channel === "email" && subject && (
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-400 uppercase tracking-widest">Subject:</span>
                <span className="font-bold text-slate-800 truncate max-w-xs">{subject}</span>
              </div>
            )}
            <div className="flex justify-between text-xs">
              <span className="font-bold text-slate-400 uppercase tracking-widest">Status:</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-bold uppercase tracking-wider text-[10px]">
                {successData.status}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
            {successData.previewUrl && (
              <a
                href={successData.previewUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-white hover:bg-amber-600 font-bold text-sm shadow-md transition-all active:scale-95"
              >
                <ExternalLink size={16} />
                View Test Email
              </a>
            )}
            <Button variant="secondary" onClick={onClose} className="px-8">
              Dismiss
            </Button>
          </div>
        </div>
      ) : (
        // Composing Form View
        <form onSubmit={handleSend} className="space-y-6">
          {/* Channel Selector */}
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 block mb-2">
              Communication Channel
            </label>
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
              <button
                type="button"
                onClick={() => setChannel("email")}
                className={`py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                  channel === "email"
                    ? "bg-white text-primary shadow-sm"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/50"
                }`}
              >
                <Mail size={16} strokeWidth={channel === "email" ? 2.5 : 2} />
                Email Alert
              </button>
              <button
                type="button"
                onClick={() => setChannel("sms")}
                className={`py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                  channel === "sms"
                    ? "bg-white text-primary shadow-sm"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/50"
                }`}
              >
                <MessageSquare size={16} strokeWidth={channel === "sms" ? 2.5 : 2} />
                SMS Alert
              </button>
            </div>
          </div>

          {/* Recipient Role Selector */}
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 block mb-2">
              Send Alert To
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer bg-white px-4 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all flex-1">
                <input
                  type="radio"
                  name="recipientType"
                  value="student"
                  checked={recipientType === "student"}
                  onChange={() => setRecipientType("student")}
                  className="w-4 h-4 text-primary focus:ring-primary/20"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-700">Student</span>
                  <span className="text-[10px] text-slate-400 font-medium truncate max-w-[180px]">
                    {student.email || student.phone_number || "No Contact"}
                  </span>
                </div>
              </label>

              <label className={`flex items-center gap-2 cursor-pointer bg-white px-4 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all flex-1 ${loadingParent ? 'opacity-60' : ''}`}>
                <input
                  type="radio"
                  name="recipientType"
                  value="parent"
                  checked={recipientType === "parent"}
                  onChange={() => setRecipientType("parent")}
                  disabled={!parent && !loadingParent}
                  className="w-4 h-4 text-primary focus:ring-primary/20 disabled:opacity-50"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-700">Parent</span>
                  <span className="text-[10px] text-slate-400 font-medium truncate max-w-[180px]">
                    {loadingParent ? "Loading..." : parent ? (parent.father_name || parent.mother_name || "Details Found") : "Not Available"}
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Recipient Details (Editable fields) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
            <Input
              label="Recipient Display Name"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              icon={User}
              placeholder="e.g. John Doe"
              required
            />
            {channel === "email" ? (
              <Input
                label="Recipient Email Address"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                icon={Mail}
                type="email"
                placeholder="email@example.com"
                required
              />
            ) : (
              <Input
                label="Recipient Phone Number"
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
                icon={Phone}
                type="tel"
                placeholder="+1234567890"
                required
              />
            )}
          </div>

          {/* Template Selector */}
          <Select
            label="Notification Template"
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            options={templateOptions}
            placeholder="Choose Template"
          />

          {/* Message Composition */}
          <div className="space-y-4">
            {channel === "email" && (
              <Input
                label="Email Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter email subject line"
                required={channel === "email"}
              />
            )}
            
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 leading-none">
                Message Content
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                required
                placeholder="Compose message here..."
                className="w-full border-2 border-slate-100 rounded-2xl py-3.5 px-4 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
              />
            </div>
          </div>

          {/* Alert Warning for Ethereal fallbacks */}
          {channel === "email" && (
            <div className="flex items-start gap-3 p-3 bg-amber-50 text-amber-800 rounded-xl border border-amber-100 text-xs">
              <AlertTriangle size={16} className="shrink-0 text-amber-500 mt-0.5" />
              <div>
                <span className="font-bold">Simulation Notice:</span> If SMTP credentials are not configured in the backend, email will be sent via Ethereal test mail. You'll receive a preview link in the success screen.
              </div>
            </div>
          )}

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={onClose} disabled={sending}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={sending} icon={Send}>
              {sending ? "Sending Alert..." : "Send Alert Now"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default SendAlertModal;
