import { useRef, useState } from "react";
import { Layer, Line, Stage } from "react-konva";
import Konva from "konva";
import styles from "./canvas.module.css";

export type Line = { points: number[]; tool: string; width: number };

export default function Canvas({
  myLines,
  setMyLines,
  sharedLines,
}: {
  myLines: Line[];
  setMyLines: (lines: Line[]) => void;
  sharedLines: Line[];
}) {
  const [tool, setTool] = useState("pen");

  const isDrawing = useRef(false);

  const mouseDown = (event: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = event.target.getStage();
    if (!stage) return;
    const point = stage.getPointerPosition();
    if (!point) return;
    isDrawing.current = true;
    setMyLines([
      ...myLines,
      { tool, points: [point.x, point.y], width: tool == "pen" ? 5 : 10 },
    ]);
  };

  const mouseMove = (event: Konva.KonvaEventObject<MouseEvent>) => {
    // no drawing - skipping
    if (!isDrawing.current) return;
    const stage = event.target.getStage();
    if (!stage) return;
    const point = stage.getPointerPosition();
    if (!point) return;
    const lastLine = myLines[myLines.length - 1];
    // add point
    lastLine.points = lastLine.points.concat([point.x, point.y]);

    // replace last
    myLines.splice(myLines.length - 1, 1, lastLine);

    setMyLines(myLines.concat());
  };

  const mouseUp = () => {
    if (!isDrawing.current) return;

    isDrawing.current = false;

    const lastLine = myLines[myLines.length - 1];
    sendLine(lastLine);
  };

  const sendLine = async (line: Line) => {
    await fetch("/api/line", {
      body: JSON.stringify({ line }),
      method: "post",
    });
  };

  return (
    <div>
      <div className={styles.buttons}>
        <button
          onClick={() => setTool("pen")}
          className={`${styles.button} ${tool == "pen" ? styles.pressed : ""}`}
        >
          pen
        </button>
        <button
          onClick={() => setTool("eraser")}
          className={`${styles.button} ${
            tool == "eraser" ? styles.pressed : ""
          }`}
        >
          eraser
        </button>
      </div>
      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={mouseDown}
        onMousemove={mouseMove}
        onMouseup={mouseUp}
        onMouseLeave={mouseUp}
        style={{ cursor: "crosshair" }}
      >
        <Layer>
          {[...sharedLines, ...myLines].map((line, i) => (
            <Line
              key={i}
              points={line.points}
              stroke="#df4b26"
              strokeWidth={line.width}
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
    </div>
  );
}
