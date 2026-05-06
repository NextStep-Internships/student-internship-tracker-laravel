import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";
import ReportsList from "./ReportsList";
import ReportForm from "./ReportForm";
import RapportDetail from "./RapportDetail";
import SuperviseurValidation from './SuperviseurValidation';
import AdminUserManagement from "./AdminUserManagement";
import SupervisionRequest from "./SupervisionRequest";
import SupervisionRequests from "./SupervisionRequests";

function AdminRoute({ children }) {
  const token = localStorage.getItem("token");
  const userData = localStorage.getItem("user");

  if (!token || !userData) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userData);
    if (user.role !== "ADMIN") {
      return <Navigate to="/dashboard" replace />;
    }
  } catch {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/reports" element={<ReportsList />} />
        <Route path="/reports/new" element={<ReportForm />} />
        <Route path="/reports/edit/:id" element={<ReportForm />} />
        <Route path="/reports/:id" element={<RapportDetail />} />
        <Route path="/validation" element={<SuperviseurValidation />} />
        <Route path="/supervision-request" element={<SupervisionRequest />} />
        <Route path="/supervision-requests" element={<SupervisionRequests />} />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <AdminUserManagement />
            </AdminRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;