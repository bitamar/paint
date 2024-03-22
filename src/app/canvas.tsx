import { useRef, useState } from "react";
import { Layer, Stage, Line } from "react-konva";
import Konva from "konva";
import styles from "./canvas.module.css";
import { colors, createLine, Line as TLine, Tool } from "@/app/utils";

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(
        result[3],
        16,
      )}`
    : null;
}

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

  const [opacity, setOpacity] = useState(1);

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
    const newLine = createLine(point, tool, color, opacity);
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
          {(tool == "pen" || tool == "shape") && (
            <div>
              <div>
                {colors.map((_color) => (
                  <button
                    key={_color}
                    className={`${styles.button} ${styles.colorButton} ${
                      color == _color ? styles.pressed : ""
                    }`}
                    style={{
                      backgroundColor: `rgba(${hexToRgb(_color)}, ${opacity})`,
                    }}
                    onClick={() => setColor(_color)}
                  ></button>
                ))}
              </div>

              <input
                type="range"
                min={0}
                max={1}
                value={opacity}
                step={0.01}
                onChange={({ target }) => setOpacity(parseFloat(target.value))}
              />
            </div>
          )}
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
              opacity={line.opacity}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
}
