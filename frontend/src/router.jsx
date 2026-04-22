import React from "react";
import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import AIChat from "./pages/AIChat.jsx";
import NotFound from "./pages/NotFound.jsx";

export const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/dashboard", element: <Dashboard /> },
  { path: "/chat", element: <AIChat /> },
  { path: "*", element: <NotFound /> }, // catch-all 404
]);
