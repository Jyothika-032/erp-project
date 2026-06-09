import { BrowserRouter as Router, useRoutes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { routes } from "./routes";
import { AuthProvider } from "../context/AuthContext";
import { ToastProvider } from "../context/ToastContext";

function AppRoutes() {
  const element = useRoutes(routes);
  return element;
}

function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <Toaster position="top-right" />
          <AppRoutes />
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;
