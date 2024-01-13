import Konva from "konva";

export const colors = [
  "#d93807",
  "#3f2424",
  "#775237",
  "#dfb726",
  "#f6cec9",
  "#eea38c",
  "#a66d5b",
  "#fd6f0c",
  "#9b9999",
  "#f4f4f4",
  "#0eef0e",
  "#274923",
  "#04abc2",
  "#023756",
  "#440773",
  "#ae0ff1",
];

export type Line = {
  uuid: string;
  points: number[];
  tool: Tool;
  width: number;
  color: string;
  closed: boolean;
};

export type Tool = "pen" | "shape" | "eraser";

const toolWidth: { [t in Tool]: number } = {
  pen: 5,
  shape: 2,
  eraser: 12,
};

export function createLine(point: Konva.Vector2d, tool: Tool, color: string) {
  return {
    uuid: crypto.randomUUID(),
    tool,
    points: [point.x, point.y],
    width: toolWidth[tool],
    color,
    closed: tool == "shape",
  };
}
