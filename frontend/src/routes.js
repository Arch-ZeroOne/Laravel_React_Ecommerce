import { createBrowserRouter } from "react-router";
import Products from "./views/Products";
import Login from "./views/Login";
import Register from "./views/Register";
const router = createBrowserRouter([
  { path: "/", Component: Login },

  {
    path: "/products",
    Component: Products,
  },
  { path: "/register", Component: Register },
]);

export default router;
