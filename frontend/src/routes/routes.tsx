import { createBrowserRouter, Route, Routes } from "react-router-dom";
import Hero from "../pages/index.tsx";
import Dashboard from "../pages/dashboard/index.tsx";
import Signup from "../pages/signup/index.tsx";
import Login from "../pages/login/index.tsx";
import ProtectedRoute from "./ProtectedRoute.tsx";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        path: "/dashboard",
        element: <Dashboard />
      }
    ]
  },
  {
    path: "/home",
    element: <Hero />,
  },
  {
    path: "/register",
    element: <Signup />
  },
  {
    path: "/login",
    element: <Login />
  }
]);
