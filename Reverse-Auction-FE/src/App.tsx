import { BrowserRouter, Route, Routes } from "react-router";
import { Toaster } from "react-hot-toast";
import Home from "./components/pages/Home";
import CreateAuction from "./components/pages/auctions/CreateAuction";
import MyAuctions from "./components/pages/auctions/MyAuctions";
import AuctionDetail from "./components/pages/auctions/AuctionDetail/AuctionDetail";
import Profile from "./components/pages/Profile.tsx";
import MainLayout from "./components/layout/MainLayout";
import AdminLayout from "./components/layout/AdminLayout";
import AuthLayout from "./components/layout/AuthLayout";
import Login from "./components/pages/auth/Login";
import Register from "./components/pages/auth/Register";
import ForgotPassword from "./components/pages/auth/ForgotPassword";
import ChangePassword from "./components/pages/auth/ChangePassword";
import ResetPassword from "./components/pages/auth/ResetPassword";
import SellerSearch from "./components/pages/seller/SellerSearch/SellerSearch";
import OrderManagement from "./components/pages/seller/SellerOrders/SellerOrders.tsx";
import SellerAuctionDetail from "./components/pages/seller/SellerAuctionDetail/SellerAuctionDetail.tsx";

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="create-auction" element={<CreateAuction />} />
          <Route path="my-auctions" element={<MyAuctions />} />
          <Route path="auctions/:id" element={<AuctionDetail />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Auth Routes */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="change-password" element={<ChangePassword />} />
          <Route path="reset-password" element={<ResetPassword />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout role="admin" />}>
          <Route index element={<div>Admin Dashboard (To be built)</div>} />
        </Route>

        {/* Seller Routes */}
        <Route path="/seller" element={<AdminLayout role="seller" />}>
          <Route index element={<div>Seller Dashboard (To be built)</div>} />
          <Route path="search" element={<SellerSearch />} />
          <Route path="auctions/:id" element={<SellerAuctionDetail />} />
          <Route path="orders" element={<OrderManagement />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
