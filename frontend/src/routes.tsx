import { createBrowserRouter, Route, Routes } from "react-router-dom";
import Hero from "./pages/index.tsx";
import Dashboard from "./pages/dashboard/index.tsx";
import Signup from "./pages/signup/index.tsx";
import Login from "./pages/login/index.tsx";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Hero />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
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
