import { useState } from "react";
import "./assets/css/app.css";
import { Outlet } from "react-router";
function App() {
  return (
    <div>
      <Outlet />
    </div>
  );
}

export default App;
