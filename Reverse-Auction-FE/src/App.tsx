import { BrowserRouter, Route, Routes } from "react-router";
import { Toaster } from "react-hot-toast";
import Home from "./components/pages/Home";
import CreateAuction from "./components/pages/auctions/CreateAuction";
import MyAuctions from "./components/pages/auctions/AuctionDetail/MyAuction/MyAuctions.tsx";
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
import VerifyEmail from "./components/pages/auth/VerifyEmail";
import SellerSearch from "./components/pages/seller/SellerSearch/SellerSearch";
import OrderManagement from "./components/pages/seller/SellerOrders/SellerOrders";
import OrderDetail from "./components/pages/seller/SellerOrders/SellerOrderDetail";
import SellerProduct from "./components/pages/seller/SellerProduct/SellerProduct";
import SellerAuctionDetail from "./components/pages/seller/SellerAuctionDetail/SellerAuctionDetail";
import ExternalChatPage from "./components/pages/chat/ExternalChatPage";
import GlobalChatWidget from "./components/chat/GlobalChatWidget";
import BuyerOrder from "./components/pages/buyer/BuyerOrder/BuyerOrder";
import BuyerOrderDetail from "./components/pages/buyer/BuyerOrderDetail";
import BuyerReview from "./components/pages/buyer/BuyerReview";
import PaymentResult from "./components/pages/PaymentResult";
import {
  RequireAuth,
  RequireRole,
  GuestOnly,
} from "./components/Auth/ProtectedRoute";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "./hooks/redux.ts";
import { fetchCurrentUser } from "./components/Auth/authSlice.ts";
import { NotificationProvider } from "./context/NotificationContext.tsx";
import { ConfirmProvider } from "./context/ConfirmContext.tsx";

import UserManagement from "./components/pages/admin/UserManagement";
import CategoryManagement from "./components/pages/admin/CategoryManagement";
import AuctionManagement from "./components/pages/admin/AuctionManagement";
import PolicyManagement from "./components/pages/admin/PolicyManagement";
import AdminOrders from "./components/pages/admin/AdminOrders";
import AdminDashboard from "./components/pages/admin/AdminDashboard";
import AdminComplaints from "./components/pages/admin/AdminComplaints";
import AdminRevenue from "./components/pages/admin/AdminRevenue";
import SellerComplaints from "./components/pages/seller/SellerComplaints";
import SellerDashboard from "./components/pages/seller/SellerDashboard";
import SellerAuctions from "./components/pages/seller/SellerAuctions";
import Demo from "./components/pages/Demo.tsx";
import ShopPage from "@/components/pages/shopPage";
import SearchPage from "./components/pages/SearchPage";
import CartPage from "./components/pages/buyer/buyerCart/CartPage";
import {CheckoutPage} from "./components/pages/buyer/buyerCheckout/Checkout.tsx";
import SellerInfo from "./components/pages/seller//SellerInfo.tsx";

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
    <NotificationProvider>
      <ConfirmProvider>
        <BrowserRouter>
          <Toaster position="top-right" />

        <Routes>
          {/* Public home route */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="search" element={<SearchPage />} />
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
            <Route path="buyer/orders" element={<BuyerOrder />} />
            <Route path="buyer/orders/:id" element={<BuyerOrderDetail />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
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
            <Route path="review/order/:id" element={<BuyerReview />} />
            <Route path="shopPage/:id" element={<ShopPage />} />
          </Route>

          {/* Guest-only auth routes */}
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
          </Route>

          {/* Public auth routes (accessible by guests & logged in users) */}
          <Route
            path="/auth"
            element={
              <AuthLayout />
            }
          >
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password" element={<ResetPassword />} />
            <Route path="verify-email" element={<VerifyEmail />} />
          </Route>

          {/* Authenticated-only auth routes */}
          <Route
            path="/auth"
            element={
              <RequireAuth>
                <AuthLayout />
              </RequireAuth>
            }
          >
            <Route path="change-password" element={<ChangePassword />} />
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
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="categories" element={<CategoryManagement />} />
            <Route path="auctions" element={<AuctionManagement />} />
            <Route path="policies" element={<PolicyManagement />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="complaints" element={<AdminComplaints />} />
            <Route path="revenue" element={<AdminRevenue />} />
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
            <Route index element={<SellerAuctions />} />
            <Route path="stats" element={<SellerDashboard />} />
            <Route path="search" element={<SellerSearch />} />
            <Route path="chat" element={<ExternalChatPage />} />
            <Route path="auctions/:id" element={<SellerAuctionDetail />} />
            <Route path="orders" element={<OrderManagement />} />
            <Route path="products" element={<SellerProduct />} />
            <Route path="orders-detail/:id" element={<OrderDetail />} />
            <Route path="complaints" element={<SellerComplaints />} />
            <Route path="sellerInfo" element={<SellerInfo />} />
          </Route>
          <Route path="/demo" element={<Demo />} />
          <Route path="/payment/result" element={<PaymentResult />} />
        </Routes>
        <GlobalChatWidget />
      </BrowserRouter>
      </ConfirmProvider>
    </NotificationProvider>
  );
}

export default App;
