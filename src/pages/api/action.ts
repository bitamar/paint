import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const body = JSON.parse(req.body);

    const Pusher = require("pusher");

    const pusher = new Pusher({
      appId: process.env.PUSHER_APP_ID,
      key: process.env.NEXT_PUBLIC_PUSHER_KEY,
      secret: process.env.PUSHER_SECRET,
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
      useTLS: true,
    });

    pusher
      .trigger("test-channel", "message", {
        message: body.message,
      })
      .then(() => {
        res.status(200).json({ status: "ok" });
      })
      .catch(() => {
        res.status(500).json({ status: "error" });
      });
  }
}
