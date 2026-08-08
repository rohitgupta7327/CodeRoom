import { serve } from "inngest/express";
import { inngest, functions } from "../Backend/src/lib/inngest.js";

export default serve({
  client: inngest,
  functions,
});