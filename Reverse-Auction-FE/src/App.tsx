import { BrowserRouter, Route, Routes } from "react-router";
import Home from "./components/pages/Home";
import MainLayout from "./components/layout/MainLayout";
import AdminLayout from "./components/layout/AdminLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Buyer / Public Routes */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          {/* Add more buyer routes here */}
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
