import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import router from "./routes.js";
import App from "./App.jsx";
import { RouterProvider } from "react-router";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
    <App />
  </StrictMode>
);
