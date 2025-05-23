// src/App.js
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AccessGranted from "./pages/AccessGranted";
import AccessDenied from "./pages/AccessDenied";
import CreateFaceRecognition from "./pages/CreateFaceRecognition";
import ViewLogs from "./pages/ViewLogs";
import CreateHousehold from "./pages/CreateHousehold";
import ManageHousehold from "./pages/ManageHousehold";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import RegisterInvite from "./pages/RegisterInvite";
import AddMember from "./pages/AddMember";
import GainAccess from "./pages/GainAccess";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Role-based dashboards */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path="/register-invite/:token" element={<RegisterInvite />} />
        <Route path="/access-granted" element={<AccessGranted />} />
        <Route path="/access-denied" element={<AccessDenied />} />
        <Route path="/create-face-recognition" element={<CreateFaceRecognition />} />
        <Route path="/view-logs" element={<ViewLogs />} />
        <Route path="/create-household" element={<CreateHousehold />} />
        <Route path="/manage-household" element={<ManageHousehold />} />
        <Route path="/add-member" element={<AddMember />} />
        <Route path="/gain-access" element={<GainAccess />} />
        
        {/* Catch-all fallback */}
        <Route path="*" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
