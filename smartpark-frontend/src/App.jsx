import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SpaceDetail from "./pages/SpaceDetail";
import OwnerDashboard from "./pages/OwnerDashboard";
import MyBookings from "./pages/MyBookings";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/space/:id" element={<SpaceDetail />} />
        <Route
          path="/owner"
          element={
            <ProtectedRoute role="owner">
              <OwnerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-bookings"
          element={
            <ProtectedRoute role="customer">
              <MyBookings />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
