declare module "svg-path-bounds" {
  export default function getBounds(path: string): number[];
  export type Operation = any; // Temporary fix, refine later
}
