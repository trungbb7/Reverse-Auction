import { BrowserRouter, Route, Routes } from "react-router";
import { Toaster } from "react-hot-toast";
import Home from "./components/pages/Home";
import CreateAuction from "./components/pages/auctions/CreateAuction";
import MyAuctions from "./components/pages/auctions/MyAuctions";
import AuctionDetail from "./components/pages/auctions/AuctionDetail/AuctionDetail";
import Profile from "./components/pages/Profile.tsx";
import Unauthorized from "./components/pages/Unauthorized.tsx";
import MainLayout from "./components/layout/MainLayout";
import AdminLayout from "./components/layout/AdminLayout";
import AuthLayout from "./components/layout/AuthLayout";
import Login from "./components/pages/auth/Login";
import Register from "./components/pages/auth/Register";
import ForgotPassword from "./components/pages/auth/ForgotPassword";
import ChangePassword from "./components/pages/auth/ChangePassword";
import ResetPassword from "./components/pages/auth/ResetPassword";
import SellerSearch from "./components/pages/seller/SellerSearch/SellerSearch";
import OrderManagement from "./components/pages/seller/SellerOrders/SellerOrders";
import OrderDetail from "./components/pages/seller/SellerOrders/SellerOrderDetail";
import SellerAuctionDetail from "./components/pages/seller/SellerAuctionDetail/SellerAuctionDetail.tsx";
import BuyerOrder from "./components/pages/buyer/BuyerOrder";
import {
  RequireAuth,
  RequireRole,
  GuestOnly,
} from "./components/Auth/ProtectedRoute";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "./hooks/redux.ts";
import { fetchCurrentUser } from "./components/Auth/authSlice.ts";

function App() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  if (!user && localStorage.getItem("accessToken")) {
    return <div>Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        {/* Public home route */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
        </Route>

        {/* Buyer-only routes */}
        <Route
          path="/"
          element={
            <RequireRole roles={["ROLE_BUYER"]}>
              <MainLayout />
            </RequireRole>
          }
        >
          <Route path="create-auction" element={<CreateAuction />} />
          <Route path="my-auctions" element={<MyAuctions />} />
          <Route path="auctions/:id" element={<AuctionDetail />} />
        </Route>

        {/* Any authenticated user routes */}
        <Route
          path="/"
          element={
            <RequireAuth>
              <MainLayout />
            </RequireAuth>
          }
        >
          <Route path="profile" element={<Profile />} />
          <Route path="orderHistory" element={<BuyerOrder />} />
        </Route>

        {/* Auth routes */}
        <Route
          path="/auth"
          element={
            <GuestOnly>
              <AuthLayout />
            </GuestOnly>
          }
        >
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="change-password" element={<ChangePassword />} />
          <Route path="reset-password" element={<ResetPassword />} />
        </Route>

        {/* Unauthorized page */}
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <RequireRole roles={["ROLE_ADMIN"]}>
              <AdminLayout role="admin" />
            </RequireRole>
          }
        >
          <Route index element={<div>Admin Dashboard (To be built)</div>} />
        </Route>

        {/* Seller routes */}
        <Route
          path="/seller"
          element={
            <RequireRole roles={["ROLE_SELLER"]}>
              <AdminLayout role="seller" />
            </RequireRole>
          }
        >
          <Route index element={<div>Seller Dashboard (To be built)</div>} />
          <Route path="search" element={<SellerSearch />} />
          <Route path="auctions/:id" element={<SellerAuctionDetail />} />
          <Route path="orders" element={<OrderManagement />} />
          <Route path="orders-detail/:id" element={<OrderDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
