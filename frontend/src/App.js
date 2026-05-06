import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";
import ReportsList from "./ReportsList";
import ReportForm from "./ReportForm";
import RapportDetail from "./RapportDetail";
import SuperviseurValidation from './SuperviseurValidation';


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
      </Routes>
    </BrowserRouter>
  );
}

export default App;