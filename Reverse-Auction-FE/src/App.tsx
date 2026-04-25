import { BrowserRouter, Route, Routes } from "react-router";
import Home from "./components/pages/Home";
import MainLayout from "./components/layout/MainLayout";
import AdminLayout from "./components/layout/AdminLayout";
import AuthLayout from "./components/layout/AuthLayout";
import Login from "./components/pages/auth/Login";
import Register from "./components/pages/auth/Register";
import ForgotPassword from "./components/pages/auth/ForgotPassword";
import ChangePassword from "./components/pages/auth/ChangePassword";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Buyer / Public Routes */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          {/* Add more buyer routes here */}
        </Route>

        {/* Auth Routes */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="change-password" element={<ChangePassword />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout role="admin" />}>
          <Route index element={<div>Admin Dashboard (To be built)</div>} />
          {/* Add more admin routes here */}
        </Route>

        {/* Seller Routes */}
        <Route path="/seller" element={<AdminLayout role="seller" />}>
          <Route index element={<div>Seller Dashboard (To be built)</div>} />
          {/* Add more seller routes here */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
