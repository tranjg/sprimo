import { createBrowserRouter, Route, Routes } from "react-router-dom";
import Hero from "../pages/index.tsx";
import Dashboard from "../pages/dashboard/index.tsx";
import Signup from "../pages/signup/index.tsx";
import Login from "../pages/login/index.tsx";
import ProtectedRoute from "./ProtectedRoute.tsx";
import Teams from "@/pages/dashboard/teams/index.tsx";
import Layout from "@/pages/dashboard/layout.tsx";
import Insights from "@/pages/dashboard/insights/index.tsx";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Hero />,
  },
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        path: "dashboard",
        element: <Layout />,
        children: [
          {index: true, element: <Dashboard />},
          {path: "teams", element: <Teams />},
          {path: "insights", element: <Insights />}
        ]
      }
    ]
  },
  // {
  //   path: '/dashboard',
  //   element: <ProtectedRoute />,
  //   children: [
  //     {
  //       path: "/dashboard/teams",
  //       element: <Teams />
  //     },
  //     {
  //       path: "/dashboard/insights",
  //       element: <Insights />
  //     }
  //   ]
  // },
  {
    path: "/register",
    element: <Signup />
  },
  {
    path: "/login",
    element: <Login />
  }
]);
