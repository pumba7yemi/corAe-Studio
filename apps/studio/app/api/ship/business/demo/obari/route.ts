import { withDemoGuard } from "../../../../_demo";
import { sampleObari } from "../../../../../../lib/demo/obari";
export const runtime = "nodejs";

export const GET = withDemoGuard(async () => {
  return Response.json({ data: sampleObari(), demo: true });
});
