import React from "react";
import ReactDOM from "react-dom/client";
import { IframeLocalStorage } from "@dcl/single-sign-on-react-client";
import App from "./App.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <IframeLocalStorage iframeUrl="http://localhost:3001">
      <App />
    </IframeLocalStorage>
  </React.StrictMode>
);
