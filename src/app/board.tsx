"use client";

import { useEffect, useState } from "react";
import Pusher from "pusher-js";

export default function Board() {
  const [title, setTitle] = useState("init");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });
    const channel = pusher.subscribe("test-channel");
    channel.bind("message", function ({ message }: { message: string }) {
      setTitle(message);
    });

    return () => {
      channel.unbind("message");
      pusher.unsubscribe("test-channel");
      pusher.disconnect();
    };
  }, []);

  const submit = async () => {
    console.log("submit", message);
    await fetch("/api/action", {
      body: JSON.stringify({ message }),
      method: "post",
    });
    setMessage("");
  };

  return (
    <div>
      <p>{title}</p>
      <input
        value={message}
        onChange={({ target }) => setMessage(target.value)}
        onKeyDown={({ code }) => code == "Enter" && submit()}
      />
    </div>
  );
}
