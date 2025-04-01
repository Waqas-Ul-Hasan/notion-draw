import { Content, Meta, Theme } from "../types/app";
import { Camera } from "../types/canvas";
import { Palette } from "./color";

export const initialCamera: Camera = { x: -1150, y: -650, z: 1 };
export const initialContent: Content = { shapes: [], selectedIds: [], hoveredIds: [] };
export const initialMeta: Meta = { locked: false };

export const initialTheme: Theme = {
  penColor: Palette.White, // Default to white
  penSize: 4,
  eraserSize: 8,
  isDarkMode: false,
};

export const INITIAL_STATE = [];