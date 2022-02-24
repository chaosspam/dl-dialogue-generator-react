import React from "react";
import ReactDOM from "react-dom";
import reportWebVitals from "./reportWebVitals";
import "./index.css";
import App from "./components/App";

declare global {
  interface Window {
    dataLayer: any;
  }
}

window.dataLayer = window.dataLayer || [];
function gtag(...arg: any) {
  window.dataLayer.push(arguments);
}
gtag("js", new Date());
gtag("config", "G-EW9CVRRCX4");

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);

// @ts-ignore
function sendToAnalytics({ id, name, value }) {
  gtag("send", "event", {
    eventCategory: "Web Vitals",
    eventAction: name,
    eventValue: Math.round(name === "CLS" ? value * 1000 : value), // values must be integers
    eventLabel: id, // id unique to current page load
    nonInteraction: true, // avoids affecting bounce rate
  });
}

// @ts-ignore
reportWebVitals(sendToAnalytics);
