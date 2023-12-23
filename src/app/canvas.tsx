import { useRef, useState } from "react";
import { Layer, Line, Stage } from "react-konva";
import Konva from "konva";

export type Line = { points: number[]; tool: string };

export default function Canvas({
  lines,
  setLines,
}: {
  lines: Line[];
  setLines: (lines: Line[]) => void;
}) {
  const [tool, setTool] = useState("pen");

  const isDrawing = useRef(false);

  const mouseDown = (event: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = event.target.getStage();
    if (!stage) return;
    const point = stage.getPointerPosition();
    if (!point) return;
    isDrawing.current = true;
    setLines([...lines, { tool, points: [point.x, point.y] }]);
  };

  const mouseMove = (event: Konva.KonvaEventObject<MouseEvent>) => {
    // no drawing - skipping
    if (!isDrawing.current) return;
    const stage = event.target.getStage();
    if (!stage) return;
    const point = stage.getPointerPosition();
    if (!point) return;
    const lastLine = lines[lines.length - 1];
    // add point
    lastLine.points = lastLine.points.concat([point.x, point.y]);

    // replace last
    lines.splice(lines.length - 1, 1, lastLine);
    console.log("here", { l: lines, con: lines.concat() });
    setLines(lines.concat());
  };

  const mouseUp = () => {
    if (!isDrawing.current) return;

    isDrawing.current = false;

    const lastLine = lines[lines.length - 1];
    sendLine(lastLine);
  };

  const sendLine = async (line: Line) => {
    await fetch("/api/line", {
      body: JSON.stringify({ line }),
      method: "post",
    });
  };

  return (
    <Stage
      width={window.innerWidth}
      height={window.innerHeight}
      onMouseDown={mouseDown}
      onMousemove={mouseMove}
      onMouseup={mouseUp}
      onMouseLeave={mouseUp}
    >
      <Layer>
        {lines.map((line, i) => (
          <Line
            key={i}
            points={line.points}
            stroke="#df4b26"
            strokeWidth={5}
            tension={0.5}
            lineCap="round"
            lineJoin="round"
            globalCompositeOperation={
              line.tool === "eraser" ? "destination-out" : "source-over"
            }
          />
        ))}
      </Layer>
    </Stage>
  );
}
