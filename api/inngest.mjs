import { serve } from "inngest/node";
import { inngest, functions } from "../Backend/src/lib/inngest.js";

const handler = serve({
  client: inngest,
  functions,
});

export default async function (req, res) {
  return handler(req, res);
}

