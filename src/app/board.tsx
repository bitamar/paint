"use client";

import { useEffect, useState } from "react";
import Pusher from "pusher-js";

import dynamic from "next/dynamic";
import { Line } from "@/app/canvas";

const Canvas = dynamic(() => import("./canvas"), {
  ssr: false,
});

export default function Board() {
  const [sharedLines, setSharedLines] = useState<Line[]>([]);
  const [myLines, setMyLines] = useState<Line[]>([]);

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });
    const channel = pusher.subscribe("test-channel");

    channel.bind("add-line", function ({ line }: { line: Line }) {
      setSharedLines((_lines) => [..._lines, line]);
    });

    return () => {
      channel.unbind("message");
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
