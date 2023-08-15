import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import axios from "axios";

axios.defaults.baseURL = "https://name-task4-for.onrender.com/";
axios.defaults.headers.common["Authorization"] =
  "Bearer " + localStorage.getItem("token");
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
