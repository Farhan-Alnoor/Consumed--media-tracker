import { Routes, Route } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import Home from "./pages/Home";
import Search from "./pages/Search";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import List from "./pages/List";
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
      <Route path="/list" element={<ProtectedRoute><List /></ProtectedRoute>} />
    </Routes>
    </>
  );
}