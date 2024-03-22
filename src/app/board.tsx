"use client";

import { useEffect, useState } from "react";
import Pusher from "pusher-js";

import dynamic from "next/dynamic";
import { Line } from "@/app/utils";

const Canvas = dynamic(() => import("./canvas"), { ssr: false });

export default function Board() {
  const [sharedLines, setSharedLines] = useState<Line[]>([]);
  const [myLines, setMyLines] = useState<Line[]>([]);

  useEffect(() => {
    const addLine = ({ line }: { line: Line }) => {
      setSharedLines((lines) => {
        const updatedSharedLines = [...lines, line];

        // Removing lines from myLine in case they are either the new line or already added; When adding many lines quickly
        // some lines can get stuck in myLines when only the new line is filtered here.
        setMyLines((_myLines) =>
          _myLines.filter(
            ({ uuid }) =>
              !updatedSharedLines.find((sharedLine) => uuid == sharedLine.uuid),
          ),
        );

        return updatedSharedLines;
      });
    };

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });
    const channel = pusher.subscribe("test-channel");

    channel.bind("add-line", addLine);

    return () => {
      channel.unbind("add-line");
      pusher.unsubscribe("test-channel");
      pusher.disconnect();
    };
  }, []);

  return (
    <div>
      <Canvas
        sharedLines={sharedLines}
        myLines={myLines}
        setMyLines={setMyLines}
      />
    </div>
  );
}
