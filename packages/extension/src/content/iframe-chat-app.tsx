import React from "react";
import ReactDOM from "react-dom/client";
import { InlineChatApp } from "./components/InlineChatApp";
import "../sidepanel/styles.css"; // Import Tailwind styles

// Wait for initial data from parent
window.addEventListener("message", (event) => {
  if (event.data?.type === "sireno-init") {
    const { fieldLabel, fieldId, skills, isDarkMode, draft, selection } = event.data;

    // Mount React app
    const root = ReactDOM.createRoot(document.getElementById("root")!);
    root.render(
      <React.StrictMode>
        <InlineChatApp
          fieldLabel={fieldLabel}
          fieldId={fieldId}
          skills={skills}
          isDarkMode={isDarkMode}
          draft={draft}
          selection={selection}
        />
      </React.StrictMode>,
    );
  }
});

// Signal ready to parent
window.parent.postMessage({ type: "sireno-iframe-ready" }, "*");
