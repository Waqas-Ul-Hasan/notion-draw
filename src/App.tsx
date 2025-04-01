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
          setIsDarkMode(stateFromFirebase.theme.isDarkMode);
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

  const toggleLock = () => {
    app.setMeta({ locked: !app.state.meta.locked });
  };

  const deleteAll = () => {
    app.onDeleteAllShapes();
  };

  return (
    <ErrorBoundary>
      <div style={{ position: "relative", height: "100vh" }}>
        <Editor
          svgStyle={{
            background: isDarkMode ? "#2F3437" : "#FFFFFF",
          }}
          containerStyle={{
            height: "100vh",
            minHeight: "100vh",
            width: "100%",
            borderRadius: 0,
            margin: 0,
            background: isDarkMode ? "#2F3437" : "#FFFFFF",
          }}
          options={{
            hideBackgroundPattern: true,
            disablePanning: false,
          }}
          debug={false}
          showFPS={false}
        />
        <div
          style={{
            position: "absolute",
            bottom: "10px",
            left: "10px",
            display: "flex",
            gap: "8px",
          }}
        >
          <button
            onClick={toggleLock}
            style={{
              padding: "8px",
              background: app.state.meta.locked ? "#E0E0E0" : "#4A4A4A",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke={isDarkMode ? "#FFFFFF" : "#37352F"}
              strokeWidth="2"
            >
              {app.state.meta.locked ? (
                <path d="M7 11V7a5 5 0 0 1 10 0v4m-2 0h-6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z" />
              ) : (
                <path d="M7 11V7a5 5 0 0 1 9-3m-2 7h-6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z" />
              )}
            </svg>
          </button>
          <button
            onClick={deleteAll}
            style={{
              padding: "8px",
              background: "#4A4A4A",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke={isDarkMode ? "#FFFFFF" : "#37352F"}
              strokeWidth="2"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          </button>
          <button
            onClick={toggleDarkMode}
            style={{
              padding: "8px",
              background: isDarkMode ? "#E0E0E0" : "#4A4A4A",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {isDarkMode ? (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#37352F"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="2"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </ErrorBoundary>
  );
}