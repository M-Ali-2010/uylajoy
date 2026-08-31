import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { processClickPrepare, processClickComplete } from "@/lib/server/payments";

// Click merchant callback endpoint
export const APIRoute = createAPIFileRoute("/api/payments/click")({
  POST: async ({ request }) => {
    try {
      const body = await request.json();
      const action = body.action as number;

      let result;

      // Action 0 = Prepare, Action 1 = Complete
      if (action === 0) {
        result = await processClickPrepare(body);
      } else if (action === 1) {
        result = await processClickComplete(body);
      } else {
        return json({
          error: -3,
          error_note: "Invalid action",
        });
      }

      return json(result);
    } catch (error) {
      console.error("Click callback error:", error);
      return json({
        error: -9,
        error_note: "Internal server error",
      });
    }
  },
});
