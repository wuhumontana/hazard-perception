import { useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { BannerContext } from "../Utils";
import Banner from "../components/Banner";
import Dashboard from "../pages/Dashboard";
import Home from "../pages/Home";
import PageNotFound from "../pages/PageNotFound";
import ResetPassword from "../pages/ResetPassword";
import Scenario from "../pages/Scenario";
import Testing from "../pages/Testing";
import Training from "../pages/Training";
import Unauthorized from "../pages/Unauthorized";
import ProtectedRoute from "./ProtectedRoute";

function Container() {
  const bannerState = useState({ icon: null, text: "" });
  // font to be used
  document.body.classList.add("font-rubik");

  return (
    <BannerContext.Provider value={bannerState}>
      <Banner />
      <Routes>
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/home" element={<Home />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/scenario"
          element={
            <ProtectedRoute>
              <Scenario />
            </ProtectedRoute>
          }
        />
        <Route
          path="/testing"
          element={
            <ProtectedRoute>
              <Testing />
            </ProtectedRoute>
          }
        />
        <Route
          path="/training"
          element={
            <ProtectedRoute>
              <Training />
            </ProtectedRoute>
          }
        />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </BannerContext.Provider>
  );
}

export default Container;
