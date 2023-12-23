"use client";

import { useEffect, useState } from "react";
import Pusher from "pusher-js";

import dynamic from "next/dynamic";
import { Line } from "@/app/canvas";

const Canvas = dynamic(() => import("./canvas"), {
  ssr: false,
});

export default function Board() {
  const [lines, setLines] = useState<Line[]>([]);

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });
    const channel = pusher.subscribe("test-channel");

    channel.bind("add-line", function ({ line }: { line: Line }) {
      setLines((_lines) => [..._lines, line]);
    });

    return () => {
      channel.unbind("message");
      pusher.unsubscribe("test-channel");
      pusher.disconnect();
    };
  }, []);

  return (
    <div>
      <Canvas lines={lines} setLines={setLines} />
    </div>
  );
}
