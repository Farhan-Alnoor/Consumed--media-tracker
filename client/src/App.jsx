import { Routes, Route } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import Home from "./pages/Home";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />
      <Route path="/" element={<Home />} />
    </Routes>
  );
}