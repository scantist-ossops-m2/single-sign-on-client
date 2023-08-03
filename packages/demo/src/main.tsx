import React from "react";
import ReactDOM from "react-dom/client";
import * as SingleSignOn from "@dcl/single-sign-on-client";
import App from "./App.tsx";

// SingleSignOn.init("https://id.decentraland.org");
SingleSignOn.init("http://localhost:3001");

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
