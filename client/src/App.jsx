import { Routes, Route,Navigate } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import Home from "./pages/Home";
import Search from "./pages/Search";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/NavBar";
import Profile from "./pages/Profile";

import MediaDetail from "./pages/MediaDetail";
export default function App() {
  return (
    <>
    <Navbar/>
    <Routes>
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />
      <Route path="/" element={<Home />} />
      <Route path="/media/:type/:id" element={<MediaDetail />} />
      <Route path="/search" element={<Search />} />
<Route path="/profile/:tab?" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
<Route path="/list" element={<Navigate to="/profile/list" replace />} />    </Routes>
    </>
  );
}