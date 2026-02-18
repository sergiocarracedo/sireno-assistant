import React from "react";
import ReactDOM from "react-dom/client";
import { InlineChatApp } from "./components/InlineChatApp";
import "../sidepanel/styles.css"; // Import Tailwind styles

// Wait for initial data from parent
window.addEventListener("message", (event) => {
  if (event.data?.type === "sireno-init") {
    const { fieldLabel, skills, isDarkMode, draft } = event.data;

    // Mount React app
    const root = ReactDOM.createRoot(document.getElementById("root")!);
    root.render(
      <React.StrictMode>
        <InlineChatApp
          fieldLabel={fieldLabel}
          skills={skills}
          isDarkMode={isDarkMode}
          draft={draft}
        />
      </React.StrictMode>,
    );
  }
});

// Signal ready to parent
window.parent.postMessage({ type: "sireno-iframe-ready" }, "*");
