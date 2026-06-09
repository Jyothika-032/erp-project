import { Navigate } from "react-router-dom";
import Layout from "../components/layout/Layout";

// Feature Imports
import { StudentList } from "../features/students/StudentList";
import { StudentForm } from "../features/students/StudentForm";
import StudentProfile from "../features/students/StudentPage";
import { ParentForm } from "../features/parents/ParentForm";
import { ParentList } from "../features/parents/ParentList";
import { AdmissionForm } from "../features/admission/AdmissionForm";
import { AdmissionList } from "../features/admission/AdmissionList";
import { CourseList } from "../features/courses/CourseList";
import { CourseForm } from "../features/courses/CourseForm";
import { BatchList } from "../features/batch/BatchList";
import { BatchForm } from "../features/batch/BatchForm";
import { PlacementList } from "../features/placement/PlacementList";
import { PlacementForm } from "../features/placement/PlacementForm";
import CommunicationLogsPage from "../features/communication/CommunicationLogsPage";

// Combined Team Features
import Dashboard from "../features/system-management/Dashboard";
import StudentAttendance from "../features/attendance/AttendancePage";
import AttendanceEntry from "../features/attendance/AttendanceForm";
import { StaffList } from "../features/staff/StaffList";
import { StaffForm } from "../features/staff/StaffForm";
import Payments from "../features/finance/Payments";
import FeeStructure from "../features/finance/FeeStructure";
import Certificates from "../features/finance/Certificates";
import TransferCertificate from "../features/finance/TransferCertificate";
import PaymentDetail from "../features/finance/PaymentDetail";
import PaymentForm from "../features/finance/PaymentForm";
import Reports from "../features/system-management/Reports";
import Institutions from "../features/system-management/Institutions";
import Users from "../features/system-management/Users";
import Roles from "../features/system-management/Roles";
import InstitutionMergeLog from "../features/system-management/InstitutionMergeLog";
import Settings from "../features/system-management/Settings";
import Login from "../features/system-management/Login";
import Signup from "../features/system-management/Signup";

export const routes = [
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "dashboard", element: <Dashboard /> },
      
      { path: "students", element: <StudentList /> },
      { path: "students/new", element: <StudentForm /> },
      { path: "students/edit/:id", element: <StudentForm /> },
      { path: "students/:id", element: <StudentProfile /> },
      
      { path: "parents", element: <ParentList /> },
      { path: "parents/new", element: <ParentForm /> },
      { path: "admission", element: <AdmissionForm /> },
      { path: "admissions", element: <AdmissionList /> },
      
      { path: "courses", element: <CourseList /> },
      { path: "courses/new", element: <CourseForm /> },
      
      { path: "batches", element: <BatchList /> },
      { path: "batches/new", element: <BatchForm /> },
      
      { path: "placements", element: <PlacementList /> },
      { path: "placements/new", element: <PlacementForm /> },
      { path: "placements/edit/:id", element: <PlacementForm /> },
      { path: "communications", element: <CommunicationLogsPage /> },

      {
        path: "attendance",
        children: [
          { path: "student", element: <StudentAttendance /> },
          { path: "entry", element: <AttendanceEntry /> }
        ]
      },

      { path: "staff", element: <StaffList /> },
      { path: "staff/new", element: <StaffForm /> },
      { path: "staff/edit/:id", element: <StaffForm /> },

      {
        path: "finance",
        children: [
          { path: "fees", element: <FeeStructure /> },
          { path: "payments", element: <Payments /> },
          { path: "payments/new", element: <PaymentForm /> },
          { path: "payments/edit/:id", element: <PaymentForm /> },
          { path: "payments/:id", element: <PaymentDetail /> },
          { path: "certificates", element: <Certificates /> },
          { path: "tc", element: <TransferCertificate /> }
        ]
      },

      { path: "reports", element: <Reports /> },

      {
        path: "settings",
        children: [
          { path: "institution", element: <Institutions /> },
          { path: "users", element: <Users /> },
          { path: "roles", element: <Roles /> },
          { path: "profile", element: <Settings /> }
        ]
      },

      { path: "advanced/merge-log", element: <InstitutionMergeLog /> }
    ]
  },
  { path: "*", element: <Navigate to="/" replace /> }
];
