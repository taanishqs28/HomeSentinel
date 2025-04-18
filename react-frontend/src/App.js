import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AccessGranted from "./pages/AccessGranted";
import AccessDenied from "./pages/AccessDenied";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/access-granted" element={<AccessGranted />} />
        <Route path="/access-denied" element={<AccessDenied />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
