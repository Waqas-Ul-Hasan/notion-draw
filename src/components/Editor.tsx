import { FC } from "react";
import styled from "@emotion/styled";
import { app, useAppState } from "../state/state";
import { Renderer } from "./Renderer";
import { Controls } from "./Controls";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { getBox, getViewport } from "../utils/canvas";
import { DebugWindow } from "./DebugWindow";
import { AnimationProvider } from "../contexts/animation";
import { CursorPreviewProvider } from "../contexts/preview";
import { MouseProvider } from "../contexts/mouse";
import FPSStats from "./helpers/FPS";
import { defaultEditorOptions, EditorOptions } from "../types/app";
import { ActivityProvider } from "../contexts/activity";

const Container = styled.div`
  position: relative;
  height: 80vh;
  min-height: 560px;
  width: 90%;
  margin: 24px auto 0;
  box-sizing: border-box;
  box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
  border-radius: 4px;
  overflow: hidden;
`;

type EditorProps = {
  debug?: boolean;
  showFPS?: boolean;
  containerStyle?: React.CSSProperties;
  svgStyle?: React.CSSProperties;
  options?: EditorOptions;
};

export const Editor: FC<EditorProps> = ({
  debug = false,
  showFPS = false,
  containerStyle = {},
  svgStyle = {},
  options = defaultEditorOptions,
}) => {
  const {
    onPan,
    onPinch,
    onFreehandStart,
    onFreehandMove,
    onFreehandEnd,
    onEraseStart,
    onEraseMove,
    onEraseEnd,
    setTheme,
  } = app;

  const { status, action, content, camera, theme, meta } = useAppState();
  const box = getBox();
  const viewport = getViewport(camera, box);

  useKeyboardShortcuts();

  return (
    <Container
      id="canvas"
      style={{
        ...containerStyle,
        background: theme.isDarkMode ? "#191919" : "#FFFFFF",
      }}
    >
      <ActivityProvider>
        <MouseProvider>
          <AnimationProvider>
            <CursorPreviewProvider>
              <Renderer
                status={status}
                action={action}
                meta={meta}
                camera={camera}
                theme={theme}
                content={content}
                onPan={onPan}
                onPinch={onPinch}
                onFreehandStart={onFreehandStart}
                onFreehandMove={onFreehandMove}
                onFreehandEnd={onFreehandEnd}
                onEraseStart={onEraseStart}
                onEraseMove={onEraseMove}
                onEraseEnd={onEraseEnd}
                debug={debug}
                options={options}
                svgStyle={{
                  ...svgStyle,
                  background: theme.isDarkMode ? "#191919" : "#FFFFFF",
                }}
              />
              <Controls
                status={status}
                camera={camera}
                action={action}
                meta={meta}
                theme={theme}
                setTheme={setTheme}
              />
              {showFPS && <FPSStats />}
              {debug && (
                <DebugWindow
                  onReset={app.reset}
                  onUndo={app.undo}
                  onRedo={app.redo}
                  status={status}
                  action={action}
                  camera={camera}
                  viewport={viewport}
                />
              )}
            </CursorPreviewProvider>
          </AnimationProvider>
        </MouseProvider>
      </ActivityProvider>
    </Container>
  );
};