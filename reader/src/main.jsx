import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomeView from "./views/HomeView.jsx";
import PostView from "./views/PostView.jsx";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeView />} />
        <Route path="/posts/:id" element={<PostView />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
