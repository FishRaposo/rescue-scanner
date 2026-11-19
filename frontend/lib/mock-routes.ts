import { err, type MockRoute } from "@shared/api";
import { findingFor, report } from "./report";

/**
 * Demo routes — the report data is the committed fixture scan, served
 * through the same envelope the (nonexistent-for-this-piece) live API would
 * use. This repo has no backend: the scanner is a CLI and the report is
 * static, so both local mode and the Pages demo read the same data.
 */
export const mockRoutes: MockRoute[] = [
  { method: "GET", path: "/api/scan", respond: () => report },
  {
    method: "GET",
    path: "/api/scan/findings/:slug",
    respond: ({ params }) =>
      findingFor(params.slug!) ?? err("not_found", `No finding for slug ${params.slug}`),
  },
];
