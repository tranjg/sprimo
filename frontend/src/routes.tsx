import { createBrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/home/index.tsx";
import Hero from "./pages/index.tsx";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Hero />,
  },
  {
    path: "/home",
    element: <Home />,
  }
]);
