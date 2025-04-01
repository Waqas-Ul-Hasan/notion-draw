import { useEffect, useState } from "react";
import { Editor } from "./components/Editor";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "./css/styles.css";
import { db } from "./firebase";
import { ref, get, set } from "firebase/database";
import { app } from "./state/state";

const getDrawingName = () => {
  const path = window.location.pathname;
  return path.startsWith("/") ? path.slice(1) || "default-drawing" : path || "default-drawing";
};

export default function Notion() {
  const [isDarkMode, setIsDarkMode] = useState(
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  useEffect(() => {
    const loadState = async () => {
      const drawingName = getDrawingName();
      const stateRef = ref(db, `drawings/${drawingName}`);
      try {
        const snapshot = await get(stateRef);
        if (snapshot.exists()) {
          const stateFromFirebase = snapshot.val();
          app.setFullState(stateFromFirebase);
          setIsDarkMode(stateFromFirebase.theme.isDarkMode); // Load saved theme
        }
      } catch (error) {
        console.error("Error loading state from Firebase:", error);
      }
    };
    loadState();
  }, []);

  useEffect(() => {
    const unsubscribe = app.subscribe((newState) => {
      const drawingName = getDrawingName();
      const stateRef = ref(db, `drawings/${drawingName}`);
      set(stateRef, newState).catch((error) => {
        console.error("Error saving state to Firebase:", error);
      });
    });
    return () => unsubscribe();
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    app.setTheme({ isDarkMode: newDarkMode });
  };

  return (
    <ErrorBoundary>
      <div style={{ position: "relative", height: "100vh" }}>
        <Editor
          svgStyle={{
            background: isDarkMode ? "#333" : "#fff",
          }}
          containerStyle={{
            height: "100vh",
            minHeight: "100vh",
            width: "100%",
            borderRadius: 0,
            margin: 0,
            background: isDarkMode ? "#1a1a1a" : "#fff",
          }}
          options={{
            hideBackgroundPattern: true,
            disablePanning: false,
          }}
          debug={false}
          showFPS={false}
        />
        <button
          onClick={toggleDarkMode}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            padding: "8px 16px",
            background: isDarkMode ? "#555" : "#ddd",
            color: isDarkMode ? "#fff" : "#000",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          {isDarkMode ? "Light Mode" : "Dark Mode"}
        </button>
      </div>
    </ErrorBoundary>
  );
}