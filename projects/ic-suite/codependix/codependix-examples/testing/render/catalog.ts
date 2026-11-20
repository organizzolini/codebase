import { buildBootFailureDocuments } from "./boundaries/boundary-boot-failures";
import { buildChargeDocuments } from "./boundaries/boundary-charges";
import { buildBoundaryDocuments } from "./boundaries/boundary-rules";
import { buildAnchorDocuments } from "./exports/anchor-placement";
import { buildConfigurationDocuments } from "./exports/configuration";
import { buildDeliveryDocuments } from "./exports/export-delivery";
import { buildGraphLevelDocuments } from "./graphs/graph-levels";
import { buildNestjsDocuments } from "./graphs/nestjs-graphs";
import { buildNxDocuments } from "./graphs/nx-graphs";
import { buildPythonDocuments } from "./graphs/python-imports";
import { buildTypescriptDocuments } from "./graphs/typescript-imports";
import { buildPathQueriesDocuments } from "./path-queries";
import { EXAMPLE_ORDER } from "./reading-order";

import type { ExampleDocument } from "./types";

// 📇 Collecting

/** Collects every example document, in the order the guides read them. */
export async function collectDocuments(): Promise<ExampleDocument[]> {
  return orderDocuments([
    ...(await buildGraphLevelDocuments()),
    ...buildNxDocuments(),
    ...(await buildNestjsDocuments()),
    ...buildTypescriptDocuments(),
    ...buildPythonDocuments(),
    ...(await buildConfigurationDocuments()),
    ...(await buildDeliveryDocuments()),
    ...buildAnchorDocuments(),
    ...buildBoundaryDocuments(),
    ...(await buildChargeDocuments()),
    ...(await buildBootFailureDocuments()),
    ...(await buildPathQueriesDocuments()),
  ]);
}

/**
 * Puts documents into reading order, refusing any disagreement. A document missing from `EXAMPLE_ORDER` would otherwise vanish from the run silently.
 */
export function orderDocuments(
  documents: ExampleDocument[],
): ExampleDocument[] {
  const byId = new Map(documents.map((document) => [document.id, document]));
  const ordered = EXAMPLE_ORDER.map((id) => byId.get(id)).filter(
    (document) => document !== undefined,
  );

  if (ordered.length !== documents.length) {
    throw new Error("EXAMPLE_ORDER and the built documents disagree.");
  }

  return ordered;
}
