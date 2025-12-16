import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import router from "./routes.js";
import { RouterProvider } from "react-router";
import FormContext from "./context/FormContext.jsx";
import App from "./App.jsx";
import "./assets/css/index.css";
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <FormContext>
      <RouterProvider router={router} />
    </FormContext>
  </StrictMode>
);
