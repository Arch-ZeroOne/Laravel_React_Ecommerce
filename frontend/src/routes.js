import { createBrowserRouter } from "react-router";
import Products from "./views/Products";

const router = createBrowserRouter([
  {
    path: "/",
    Component: Products,
  },
  {},
]);

export default router;
