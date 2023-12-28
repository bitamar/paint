import { useRef, useState } from "react";
import { Layer, Stage, Line } from "react-konva";
import Konva from "konva";
import styles from "./canvas.module.css";
import { colors, createLine, Line as TLine, Tool } from "@/app/utils";

export default function Canvas({
  myLines,
  setMyLines,
  sharedLines,
}: {
  myLines: TLine[];
  setMyLines: (lines: TLine[]) => void;
  sharedLines: TLine[];
}) {
  const [tool, setTool] = useState<Tool>("pen");

  const [color, setColor] = useState(colors[0]);

  const layer = useRef<Konva.Layer>(null);

  // if (layer.current) {
  // const canvas = layer.current.canvas;
  // console.log(canvas.context.getImageData(0, 0, 100, 100));
  // }

  const currentUuid = useRef("");

  const mouseDown = (event: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = event.target.getStage();
    if (!stage) return;
    const point = stage.getPointerPosition();
    if (!point) return;
    const newLine = createLine(point, tool, color);
    currentUuid.current = newLine.uuid;
    setMyLines([...myLines, newLine]);
  };

  const mouseMove = (event: Konva.KonvaEventObject<MouseEvent>) => {
    // no drawing - skipping
    if (!currentUuid.current) return;
    const stage = event.target.getStage();
    if (!stage) return;
    const point = stage.getPointerPosition();
    if (!point) return;
    const currentLine = myLines.find(({ uuid }) => uuid == currentUuid.current);
    if (!currentLine) return;
    // add point
    currentLine.points = currentLine.points.concat([point.x, point.y]);

    // replace last
    myLines.splice(myLines.length - 1, 1, currentLine);

    setMyLines(myLines.concat());
  };

  const mouseUp = () => {
    if (!currentUuid.current) return;

    const currentLine = myLines.find(({ uuid }) => uuid == currentUuid.current);
    if (!currentLine) return;

    sendLine(currentLine);

    currentUuid.current = "";
  };

  const sendLine = async (line: TLine) => {
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
          onClick={() => setTool("shape")}
          className={`${styles.button} ${
            tool == "shape" ? styles.pressed : ""
          }`}
        >
          shape
        </button>
        <button
          onClick={() => setTool("eraser")}
          className={`${styles.button} ${
            tool == "eraser" ? styles.pressed : ""
          }`}
        >
          eraser
        </button>

        <div className={styles.settings}>
          {colors.map((_color) => (
            <button
              key={_color}
              className={`${styles.button} ${styles.colorButton} ${
                color == _color ? styles.pressed : ""
              }`}
              style={{ backgroundColor: _color }}
              onClick={() => setColor(_color)}
            ></button>
          ))}
        </div>
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
        <Layer ref={layer}>
          {[...sharedLines, ...myLines].map((line, i) => (
            <Line
              closed={line.closed}
              fill={line.color}
              key={i}
              points={line.points}
              stroke={line.color}
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
