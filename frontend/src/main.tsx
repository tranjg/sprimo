import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "./index.css";
import { router } from "./routes/routes.tsx";
import { Toaster } from "./components/ui/sonner.tsx";
import AuthProvider from "./providers/authProvider.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Toaster />
    <AuthProvider>
    <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
);
