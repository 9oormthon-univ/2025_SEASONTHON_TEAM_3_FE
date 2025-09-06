import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";               // ★ 라우터
import { FavoritesProvider } from "./components/FavoritesContext.jsx"; // ★ 찜 컨텍스트
import App from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <FavoritesProvider>
        <App />
      </FavoritesProvider>
    </BrowserRouter>
  </StrictMode>
);
