import { StateManager, Command } from "rko";
import { initialCamera, initialContent, initialMeta, initialTheme } from "C:/Users/Waqas Ul Hasan/notion-draw/src/constants/state";
import { Action, App, Meta, StateSelector, Status, Theme } from "../types/app";
import { Point, PressuredPoint, Zoom } from "../types/canvas";
import { Freeform, ShapeType } from "../types/shape";
import { panCamera, resetZoom, updateCamera, zoomCameraTo } from "../utils/camera";
import { screenToCanvasPressured } from "../utils/canvas";
import { isValidShape, makeShapeId } from "../utils/shape";
import { endEditing } from "../utils/state";

export const initialAppState: App = {
  status: Status.FREEHAND,
  action: Action.IDLE,
  camera: initialCamera,
  content: initialContent,
  theme: initialTheme,
  meta: initialMeta,
};

export type SetStatus = (status: Status) => void;
export type Pan = (dx: number, dy: number) => void;
export type Pinch = (center: Point, dz: Zoom) => void;
export type SetTheme = (theme: Partial<Theme>) => void;
export type SetMeta = (meta: Partial<Meta>) => void;
export type ResetZoom = () => void;
export type ResetCamera = () => void;
export type DeleteAllShapes = () => void;
export type FreehandStart = (point: PressuredPoint) => void;
export type FreehandMove = (point: PressuredPoint) => void;
export type FreehandEnd = () => void;
export type EraseStart = (point: PressuredPoint) => void;
export type EraseMove = (point: PressuredPoint) => void;
export type EraseEnd = () => void;

export class AppState extends StateManager<App> {
  private listeners: ((state: App) => void)[] = [];

  subscribe(listener: (state: App) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  // Public method for full state updates (e.g., from Firebase)
  setFullState(newState: App, id?: string) {
    this.setState({ before: this.state, after: newState }, id); // Protected, callable here
    this.listeners.forEach((listener) => listener(this.state));
  }

  setStatus: SetStatus = (status) => {
    const validShapes = this.state.content.shapes.filter(isValidShape);
    const killedEditedShapes = validShapes.filter((shape) => !shape.editing);
    this.patchState({
      status,
      content: {
        ...this.state.content,
        shapes: killedEditedShapes,
      },
    });
    this.listeners.forEach((listener) => listener(this.state));
  };

  setTheme: SetTheme = (theme) => {
    this.patchState({
      theme: { ...this.state.theme, ...theme },
    });
    this.listeners.forEach((listener) => listener(this.state));
  };

  setMeta: SetMeta = (meta) => {
    this.patchState({
      meta: { ...this.state.meta, ...meta },
    });
    this.listeners.forEach((listener) => listener(this.state));
  };

  onPan: Pan = (dx, dy) => {
    this.patchState({
      camera: updateCamera(this.state.camera, (camera) => panCamera(camera, dx, dy)),
    });
    this.listeners.forEach((listener) => listener(this.state));
  };

  onPinch: Pinch = (center, dz) => {
    this.patchState({
      camera: updateCamera(this.state.camera, (camera) => zoomCameraTo(camera, center, dz)),
    });
    this.listeners.forEach((listener) => listener(this.state));
  };

  onResetZoom: ResetZoom = () => {
    this.patchState({
      camera: updateCamera(this.state.camera, (camera) => resetZoom(camera)),
    });
    this.listeners.forEach((listener) => listener(this.state));
  };

  onResetCamera: ResetCamera = () => {
    this.patchState({
      camera: updateCamera(this.state.camera, () => initialCamera),
    });
    this.listeners.forEach((listener) => listener(this.state));
  };

  onEraseStart: EraseStart = (point) => {
    this.setSnapshot();
    this.onEraseMove(point);
  };

  onEraseMove: EraseMove = (point) => {
    const pointOnCanvas = screenToCanvasPressured(point, this.state.camera);
    const pointOnSvg = (document.getElementById("render-scene-svg") as any)?.createSVGPoint();
    pointOnSvg.x = pointOnCanvas.x;
    pointOnSvg.y = pointOnCanvas.y;

    const updatedShapes = this.state.content.shapes.map((shape) => {
      if (!shape.deleting && shape.type === ShapeType.FREEFORM) {
        const path = shape as Freeform;
        const pathElement = document.getElementById(path.id) as SVGGeometryElement | null;
        const shouldElementBeDeleted =
          pathElement?.isPointInStroke(pointOnSvg) || pathElement?.isPointInFill(pointOnSvg);
        return {
          ...path,
          deleting: shouldElementBeDeleted,
        };
      }
      return shape;
    });
    this.patchState({
      action: Action.ERASING,
      content: {
        ...this.state.content,
        shapes: updatedShapes,
      },
    });
    this.listeners.forEach((listener) => listener(this.state));
  };

  onEraseEnd: EraseEnd = () => {
    const validShapes = this.state.content.shapes.filter(isValidShape);
    const updatedShapes = validShapes.map(endEditing);

    this.patchState({
      action: Action.IDLE,
      status: Status.ERASE,
      content: {
        ...this.state.content,
        selectedIds: [],
        shapes: updatedShapes,
      },
    });
    this.listeners.forEach((listener) => listener(this.state));
  };

  onFreehandStart: FreehandStart = (point) => {
    this.setSnapshot();
    const pointOnCanvas = screenToCanvasPressured(point, this.state.camera);
    const id = makeShapeId();
    const shape = {
      id,
      type: ShapeType.FREEFORM,
      editing: true,
      points: [pointOnCanvas],
      color: this.state.theme.penColor,
      size: this.state.theme.penSize,
    } as Freeform;

    this.patchState({
      action: Action.DRAWING_FREEHAND,
      content: {
        ...this.state.content,
        selectedIds: [shape.id],
        shapes: [...this.state.content.shapes, shape],
      },
    });
    this.listeners.forEach((listener) => listener(this.state));
  };

  onFreehandMove: FreehandMove = (point) => {
    const pointOnCanvas = screenToCanvasPressured(point, this.state.camera);
    const updatedShapes = this.state.content.shapes.map((shape) => {
      if (shape.editing && shape.type === ShapeType.FREEFORM) {
        const path = shape as Freeform;
        return {
          ...path,
          points: path.points.concat(pointOnCanvas),
        };
      }
      return shape;
    });
    this.patchState({
      action: Action.DRAWING_FREEHAND,
      content: {
        ...this.state.content,
        shapes: updatedShapes,
      },
    });
    this.listeners.forEach((listener) => listener(this.state));
  };

  onFreehandEnd: FreehandEnd = () => {
    const validShapes = this.state.content.shapes.filter(isValidShape);
    const updatedShapes = validShapes.map(endEditing);

    this.patchState({
      action: Action.IDLE,
      status: Status.FREEHAND,
      content: {
        ...this.state.content,
        selectedIds: [],
        shapes: updatedShapes,
      },
    });
    this.listeners.forEach((listener) => listener(this.state));
  };

  onDeleteAllShapes: DeleteAllShapes = () => {
    this.patchState({
      content: {
        ...this.state.content,
        selectedIds: [],
        shapes: [],
      },
    });
    this.listeners.forEach((listener) => listener(this.state));
  };
}

const url = window.location.href;
const isNewURL = url.includes("notion-draw.art");
const version = isNewURL ? 2 : 1;

export const app = new AppState(initialAppState, url, version);

export const useAppState = (selector?: StateSelector<App, any>) => {
  if (selector) {
    return app.useStore(selector);
  }
  return app.useStore();
};