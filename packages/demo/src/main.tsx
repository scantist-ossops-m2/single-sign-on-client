import React from "react";
import ReactDOM from "react-dom/client";
import { SingleSignOn } from "@dcl/single-sign-on-react-client";
import App from "./App.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SingleSignOn iframeUrl="http://localhost:3001">
      <App />
    </SingleSignOn>
  </React.StrictMode>
);
