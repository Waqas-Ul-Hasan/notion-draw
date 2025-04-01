import { FC, Fragment, useContext, useEffect, useState } from "react";
import styled from "@emotion/styled";
import { Action, Meta, Status, Theme } from "../types/app";
import { ReactComponent as TrashSvg } from "../icons/trash.svg";
import { ReactComponent as EraserSvg } from "../icons/eraser.svg";
import { ReactComponent as SquiggleSvg } from "../icons/squiggle.svg";
import { ReactComponent as LockSvg } from "../icons/lock.svg";
import { ReactComponent as LockOpenedSvg } from "../icons/lock-opened.svg";
import { app, SetTheme } from "../state/state";
import { Camera } from "../types/canvas";
import { Palette } from "../constants/color";
import { ActivityContext } from "../contexts/activity";
import { withTooltip } from "./helpers/Tooltips";

type ControlsProps = {
  status: Status;
  camera: Camera;
  meta: Meta;
  action: Action;
  theme: Theme;
  setTheme: SetTheme;
};

export const Controls: FC<ControlsProps> = ({
  status,
  camera,
  meta,
  action,
  theme,
  setTheme,
}) => {
  const { setStatus, setMeta, onResetCamera, onDeleteAllShapes } = app;
  const [showStyles, setShowStyles] = useState(false);
  const active = useContext(ActivityContext);

  const isLocked = meta.locked;
  const isDrawing = action === Action.DRAWING_FREEHAND;
  const hidden = !active || isDrawing;

  useEffect(() => {
    setShowStyles(false);
  }, [hidden]);

  const toggleDarkMode = () => setTheme({ isDarkMode: !theme.isDarkMode });
  const setSystemTheme = () => {
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme({ isDarkMode: systemDark });
  };

  return (
    <Container>
      <RightContainer hide={hidden}>
        <SidePanel style={{ width: 145 }} hide={isLocked}>
          <StyleSummary onClick={() => setShowStyles((s) => !s)}>
            <Group>
              <Text>Styles</Text>
              <SummaryStroke color={theme.penColor} />
            </Group>
            <Group>
              <Text>{Math.round(camera.z * 100)}%</Text>
            </Group>
          </StyleSummary>
        </SidePanel>
        {showStyles && (
          <TogglablePanel>
            <Section>
              <Label>
                <Text>Colors</Text>
              </Label>
              <Options>
                {Object.values(Palette).map((color) => (
                  <ColorOption
                    key={color}
                    color={color}
                    selected={color === theme.penColor}
                    onClick={() => {
                      setStatus(Status.FREEHAND);
                      setTheme({ penColor: color });
                      setShowStyles(false);
                    }}
                  />
                ))}
              </Options>
            </Section>
            <Section>
              <Label>
                <Text>Sizes</Text>
              </Label>
              <Options>
                <StrokeSize
                  size={2}
                  color={theme.penColor}
                  selected={theme.penSize === 2}
                  onClick={() => {
                    setStatus(Status.FREEHAND);
                    setTheme({ penSize: 2 });
                  }}
                />
                <StrokeSize
                  size={4}
                  color={theme.penColor}
                  selected={theme.penSize === 4}
                  onClick={() => {
                    setStatus(Status.FREEHAND);
                    setTheme({ penSize: 4 });
                  }}
                />
                <StrokeSize
                  size={8}
                  color={theme.penColor}
                  selected={theme.penSize === 8}
                  onClick={() => {
                    setStatus(Status.FREEHAND);
                    setTheme({ penSize: 8 });
                  }}
                />
              </Options>
            </Section>
            <Section>
              <Button onClick={() => onResetCamera()}>Reset zoom & center</Button>
              <Button onClick={setSystemTheme}>Use system theme</Button>
            </Section>
          </TogglablePanel>
        )}
      </RightContainer>

      <LeftContainer hide={hidden} style={{ width: meta.locked ? 46 : 114 }}>
        <SidePanel hide={isLocked}>
          <DrawingOption
            selected={status === Status.FREEHAND}
            onClick={() => setStatus(Status.FREEHAND)}
          />
          <ErasingOption
            selected={status === Status.ERASE}
            onClick={() => {
              setStatus(Status.ERASE);
              setShowStyles(false);
            }}
          />
        </SidePanel>
        <SidePanel>
          {meta.locked ? (
            <LockOption
              tooltip="Unlock this board and re-enable editing"
              tooltipOffsetX={94}
              tooltipOffsetY={-65}
              tooltipSpeed={200}
              onClick={() => setMeta({ locked: false })}
            />
          ) : (
            <Fragment>
              <UnlockOption
                tooltip="Lock this board and disable editing"
                tooltipOffsetX={82}
                tooltipOffsetY={-65}
                tooltipSpeed={200}
                onClick={() => setMeta({ locked: true })}
              />
              <DeleteOption
                tooltip="Clear everything from the board"
                tooltipOffsetX={40}
                tooltipOffsetY={-65}
                tooltipSpeed={200}
                onClick={() => onDeleteAllShapes()}
              />
              <DarkModeOption
                tooltip={theme.isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                tooltipOffsetX={40}
                tooltipOffsetY={-65}
                tooltipSpeed={200}
                onClick={toggleDarkMode}
              >
                {theme.isDarkMode ? (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#FFFFFF" // White sun in dark mode
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
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#37352F" // Dark moon in light mode
                    strokeWidth="2"
                  >
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                )}
              </DarkModeOption>
            </Fragment>
          )}
        </SidePanel>
      </LeftContainer>
    </Container>
  );
};

const TogglablePanel: FC = ({ children }) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const ts = setTimeout(() => setReady(true), 10);
    return () => clearTimeout(ts);
  }, []);

  return <AdjustableSidePanel hide={!ready}>{children}</AdjustableSidePanel>;
};

const Container = styled.div``;

const HidableContainer = styled.div<{ hide?: boolean }>`
  transition: opacity 250ms ease, transform 250ms ease;
  pointer-events: ${(props) => (props.hide ? "none" : "all")};
  opacity: ${(props) => (props.hide ? 0 : 1)};
  transform: scale(${(props) => (props.hide ? 0.975 : 1)});
  cursor: ${(props) => (props.hide ? "default !important" : null)};
  * {
    cursor: ${(props) => (props.hide ? "default !important" : null)};
  }
`;

const LeftContainer = styled(HidableContainer)`
  position: absolute;
  background: transparent;
  min-height: 100px;
  width: 80px;
  top: 12px;
  left: 12px;
  bottom: 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  pointer-events: none;
  user-select: none;
`;

const RightContainer = styled(HidableContainer)`
  position: absolute;
  background: transparent;
  min-height: 100px;
  width: 215px;
  top: 32px;
  right: 12px;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: flex-start;
  pointer-events: none;
  user-select: none;
`;

const SidePanel = styled(HidableContainer)`
  margin: 0 0 8px;
  background: ${props => props.theme?.isDarkMode ? "#333" : "#fefefe"};
  min-height: 30px;
  padding: 4px;
  box-shadow: rgba(0, 0, 0, 0.05) 0px 0px 16px -1px, rgba(0, 0, 0, 0.05) 0px 0px 16px -8px,
    rgba(0, 0, 0, 0.12) 0px 0px 16px -12px, rgba(0, 0, 0, 0.08) 0px 0px 2px 0px;
  box-sizing: border-box;
  border-radius: 6px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  width: 100%;
  pointer-events: all;
`;

const AdjustableSidePanel = styled(SidePanel)`
  padding: 8px 12px 0;
  justify-content: flex-start;
  @media (max-height: 240px) {
    width: 350px;
  }
`;

const StyleSummary = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 4px 8px;
  height: 30px;
  width: 100%;
  border-radius: 6px;
  cursor: pointer;
  transition: all 100ms ease;
  &:hover {
    background: #eee;
  }
  &:active {
    background: #ccc;
  }
`;

const DrawingOption = styled(SquiggleSvg)<{ selected: boolean }>`
  position: relative;
  display: inline-block;
  margin: 2px;
  padding: 4px;
  height: 30px;
  width: 30px;
  border-radius: 100%;
  background: ${(props) => (props.selected ? "#ddd" : "transparent")};
  cursor: pointer;
  transition: all 100ms ease;
  &:hover {
    background: ${(props) => (props.selected ? "#ddd" : "#eee")};
  }
  &:active {
    background: #ccc;
  }
`;

const ErasingOption = styled(EraserSvg)<{ selected: boolean }>`
  position: relative;
  display: inline-block;
  margin: 2px;
  padding: 4px;
  height: 30px;
  width: 30px;
  border-radius: 100%;
  background: ${(props) => (props.selected ? "#ddd" : "transparent")};
  cursor: pointer;
  transition: all 100ms ease;
  &:hover {
    background: ${(props) => (props.selected ? "#ddd" : "#eee")};
  }
  &:active {
    background: #ccc;
  }
`;

const DeleteOption = withTooltip(styled(TrashSvg)`
  position: relative;
  display: inline-block;
  margin: 2px;
  padding: 6px;
  height: 30px;
  width: 30px;
  border-radius: 100%;
  background: transparent;
  cursor: pointer;
  transition: all 100ms ease;
  &:hover {
    background: #eee;
  }
  &:active {
    background: #ccc;
  }
`);

const LockOption = withTooltip(styled(LockSvg)`
  position: relative;
  display: inline-block;
  margin: 2px;
  padding: 6px;
  height: 30px;
  width: 30px;
  border-radius: 100%;
  background: transparent;
  cursor: pointer;
  transition: all 100ms ease;
  &:hover {
    background: #eee;
  }
  &:active {
    background: #ccc;
  }
  path {
    stroke-width: 2px;
  }
`);

const UnlockOption = withTooltip(styled(LockOpenedSvg)`
  position: relative;
  display: inline-block;
  margin: 2px;
  padding: 6px;
  height: 30px;
  width: 30px;
  border-radius: 100%;
  background: transparent;
  cursor: pointer;
  transition: all 100ms ease;
  &:hover {
    background: #eee;
  }
  &:active {
    background: #ccc;
  }
  path {
    stroke-width: 2px;
  }
`);

const DarkModeOption = withTooltip(styled.button`
  position: relative;
  display: inline-block;
  margin: 2px;
  padding: 6px;
  height: 30px;
  width: 30px;
  border-radius: 100%;
  background: transparent;
  cursor: pointer;
  transition: all 100ms ease;
  border: none;
  &:hover {
    background: #eee;
  }
  &:active {
    background: #ccc;
  }
`);

const SummaryStroke = styled(SquiggleSvg)<{ color: string; size?: number }>`
  position: relative;
  display: inline-block;
  margin: 2px;
  padding: 4px;
  height: 30px;
  width: 30px;
  border-radius: 100%;
  color: ${(props) => props.color};
  background: transparent;
  cursor: pointer;
  transition: all 100ms ease;
  path {
    fill: ${(props) => props.color}3b;
  }
`;

const ColorOption = styled(SquiggleSvg)<{ color: string; selected: boolean }>`
  position: relative;
  display: inline-block;
  margin: 2px;
  padding: 4px;
  height: 30px;
  width: 30px;
  border-radius: 100%;
  color: ${(props) => props.color};
  background: ${(props) => (props.selected ? "#ddd" : "transparent")};
  cursor: pointer;
  transition: all 100ms ease;
  &:hover {
    background: ${(props) => (props.selected ? "#ddd" : "#eee")};
  }
  &:active {
    background: #ccc;
  }
  path {
    fill: ${(props) => props.color}3b;
  }
`;

const Text = styled.span`
  display: block;
  font-size: 13px;
  font-weight: 500;
  line-height: 14px;
`;

const Button = styled(Text)`
  padding: 4px 8px;
  height: 30px;
  width: 100%;
  border-radius: 6px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 100ms ease;
  &:hover {
    background: #eee;
  }
  &:active {
    background: #ccc;
  }
`;

const Group = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Section = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: center;
  margin-bottom: 8px;
`;

const Label = styled.div`
  width: 42px;
  span {
    margin-top: 10px;
  }
`;

const Options = styled.div`
  flex: 3;
  width: 100%;
  padding-left: 12px;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: center;
`;

const StrokeSize = styled.div<{ color: string; selected: boolean; size: number }>`
  position: relative;
  margin: 2px;
  padding: 4px;
  height: 30px;
  width: 40px;
  border-radius: 6px;
  background: ${(props) => (props.selected ? "#ddd" : "transparent")};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 100ms ease;
  &:hover {
    background: ${(props) => (props.selected ? "#ddd" : "#eee")};
  }
  &:active {
    background: #ccc;
  }
  &:after {
    content: "";
    width: 90%;
    height: ${(props) => props.size}px;
    background: ${(props) => props.color};
    border-radius: 4px;
  }
`;