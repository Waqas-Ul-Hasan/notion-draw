import { useEffect } from "react";
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
  useEffect(() => {
    const loadState = async () => {
      const drawingName = getDrawingName();
      const stateRef = ref(db, `drawings/${drawingName}`);
      try {
        const snapshot = await get(stateRef);
        if (snapshot.exists()) {
          const stateFromFirebase = snapshot.val();
          app.setFullState(stateFromFirebase);
        } else {
          // Default to system theme if no Firebase state
          const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
          app.setTheme({ isDarkMode: systemDark });
        }
      } catch (error) {
        console.error("Error loading state from Firebase:", error);
      }
    };
    loadState();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemChange = (e: MediaQueryListEvent) => {
      app.setTheme({ isDarkMode: e.matches });
    };
    mediaQuery.addEventListener("change", handleSystemChange);
    return () => mediaQuery.removeEventListener("change", handleSystemChange);
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

  return (
    <ErrorBoundary>
      <Editor
        svgStyle={{}}
        containerStyle={{
          height: "100vh",
          minHeight: "100vh",
          width: "100%",
          borderRadius: 0,
          margin: 0,
        }}
        options={{
          hideBackgroundPattern: true,
          disablePanning: false,
        }}
        debug={false}
        showFPS={false}
      />
    </ErrorBoundary>
  );
}