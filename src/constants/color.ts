export const CurveTool = {
  Primary: "#cf00ff",
  Secondary: "#ffffff",
};

export const SelectionBox = {
  Primary: "#27A2F8",
  Secondary: "#ffffff",
};

export const HoverState = {
  Primary: "#27A2F8",
  Secondary: "#ffffff",
  Empty: "none",
};

export const Shape = {
  Primary: "#10293c",
  Secondary: "none",
};

export const Debug = {
  Primary: "#EE3F46",
  Secondary: "#ffffff",
};

export const Burst = {
  Primary: "#27A2F8",
};

export const PenPreview = {
  Primary: "#27A2F8",
  Secondary: "#FFFFFF",
};

export enum Palette {
  Black = "#000000",
  White = "#FFFFFF", // Added white
  Gray = "#808080",
  Red = "#FF4040",
  Orange = "#FF8000",
  Yellow = "#FFFF00",
  Green = "#00FF00",
  Blue = "#4040FF",
  Purple = "#C000C0",
}

export const Color = {
  Palette,
  Shape,
  CurveTool,
  SelectionBox,
  HoverState,
  Debug,
  Burst,
  PenPreview,
};

export function withOpacity(color: string) {
  return `${color}05`;
}
