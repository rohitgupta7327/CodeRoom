import { serve } from "inngest/node";
import { inngest, functions } from "../Backend/src/lib/inngest.js";

export default serve({
  client: inngest,
  functions,
});