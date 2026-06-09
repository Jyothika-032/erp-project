import React, { useState } from "react";
import AttendancePage from "./features/attendance/AttendancePage";
import TeacherPage from "./features/teachers/TeacherPage";
import CommunicationLogsPage from "./features/communication/CommunicationLogsPage";


function App() {
  const [view, setView] = useState("attendance");

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="logo">ATTENDANCE REPORT</div>
        <div className="nav-links">
          <button onClick={() => setView("attendance")} className={view === "attendance" ? "active" : ""}>Attendance</button>
          <button onClick={() => setView("staff-management")} className={view === "staff-management" ? "active" : ""}>Staff Management</button>
          <button onClick={() => setView("communication-logs")} className={view === "communication-logs" ? "active" : ""}>Communication Logs</button>
        </div>
      </nav>
      <main className="app-main">
        {view === "attendance" && <AttendancePage />}
        {view === "staff-management" && <TeacherPage />}
        {view === "communication-logs" && <CommunicationLogsPage />}
      </main>
    </div>
  );
}


export default App;
