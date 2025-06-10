import { Route, Routes } from "react-router-dom";
import Home from "./pages/home/index.tsx";

const RoutesList = () => {
  return (
    <Routes>
      <Route index element={<Home />} />
    </Routes>
  );
};

export default RoutesList;
