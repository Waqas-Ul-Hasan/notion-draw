import { useEffect } from "react";
import { Disabled } from "./components/Disabled";
import { Editor } from "./components/Editor";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { isMobile } from "./constants/app";
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
          app.setFullState(stateFromFirebase); // Use setFullState instead of setState
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

  return (
    <ErrorBoundary>
      {isMobile ? (
        <Disabled />
      ) : (
        <Editor
          svgStyle={{
            background: "#fff",
          }}
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
      )}
    </ErrorBoundary>
  );
}