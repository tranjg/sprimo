import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "./index.css";
import { router } from "./routes/routes.tsx";
import { Toaster } from "./components/ui/sonner.tsx";
import AuthProvider from "./providers/authProvider.tsx";
import { Provider } from "react-redux";
import { store } from "./reducers/store.ts";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Toaster position={"bottom-center"} richColors />
    <Provider store={store}> 
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </Provider>
  </StrictMode>,
);
