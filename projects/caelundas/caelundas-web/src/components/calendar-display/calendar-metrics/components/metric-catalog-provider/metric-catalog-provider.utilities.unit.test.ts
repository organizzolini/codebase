import { describe, expect, it } from "vitest";

import {
  readServedApi,
  serveCalendarApi,
} from "../../../../../../testing/calendar-api";
import { CATALOG } from "../../../../../../testing/metrics/metric-catalog";
import { METRIC_CATALOG_FIXTURE } from "../../../../../../testing/metrics/metric-catalog-fixture";

import {
  buildMetricCatalog,
  forgetMetricCatalog,
  readMetricCatalog,
  toCatalogStatus,
} from "./metric-catalog-provider.utilities";

describe("metric-catalog-provider utilities", () => {
  describe(buildMetricCatalog, () => {
    it("keeps the metrics in the order the API gave them", () => {
      const reversed = METRIC_CATALOG_FIXTURE.metrics.toReversed();
      const catalog = buildMetricCatalog({
        ...METRIC_CATALOG_FIXTURE,
        metrics: reversed,
      });

      expect(catalog.metrics).toStrictEqual(reversed);
      expect(catalog.metrics[0]?.slug).toBe("last-start");
      expect(catalog.measures).toBe(METRIC_CATALOG_FIXTURE.measures);
    });

    it("finds each metric by its slug", () => {
      expect(CATALOG.bySlug.size).toBe(18);
      expect(CATALOG.bySlug.get("duration")?.unit).toBe("DURATION");
      expect(CATALOG.bySlug.get("covered-percent")?.unit).toBe("NONE");
      expect(CATALOG.bySlug.get("first-start")?.unit).toBe("INSTANT");
      expect(CATALOG.bySlug.get("nope")).toBeUndefined();
    });

    it("takes each layout's defaults from the web's lists, in their order", () => {
      expect(CATALOG.defaults.charts).toStrictEqual([
        "events",
        "unique-names",
        "duration",
      ]);
      expect(CATALOG.defaults.totals).toStrictEqual([
        "events",
        "unique-names",
        "unique-tags",
        "days-with-events",
        "duration",
        "average-duration",
        "longest-duration",
      ]);
    });
  });

  describe("defaults", () => {
    it("leaves out a default metric the catalog lacks", () => {
      const catalog = buildMetricCatalog({
        ...METRIC_CATALOG_FIXTURE,
        metrics: METRIC_CATALOG_FIXTURE.metrics.filter(
          (metric) => metric.slug !== "unique-names",
        ),
      });

      expect(catalog.defaults.charts).toStrictEqual(["events", "duration"]);
      expect(catalog.defaults.totals).not.toContain("unique-names");
    });
  });

  describe(toCatalogStatus, () => {
    it("is ready with the catalog, an error with only a cause, else loading", () => {
      expect(toCatalogStatus({ catalog: CATALOG, error: undefined })).toBe(
        "ready",
      );
      expect(
        toCatalogStatus({ catalog: undefined, error: new Error("down") }),
      ).toBe("error");
      expect(toCatalogStatus({ catalog: undefined, error: undefined })).toBe(
        "loading",
      );
    });
  });

  describe(readMetricCatalog, () => {
    it("asks the API once, then answers from memory", async () => {
      serveCalendarApi();

      const first = await readMetricCatalog();
      const second = await readMetricCatalog();

      expect(second).toStrictEqual(first);
      expect(first.metrics).toHaveLength(18);
      expect(readServedApi().requests.catalog).toBe(1);
    });

    it("asks again after it was forgotten, and after a failed read", async () => {
      const api = serveCalendarApi({ catalogError: "The catalog is down" });

      await expect(readMetricCatalog()).rejects.toThrow("The catalog is down");
      await expect(readMetricCatalog()).rejects.toThrow("The catalog is down");

      expect(api.requests.catalog).toBe(2);

      serveCalendarApi();
      await readMetricCatalog();
      forgetMetricCatalog();
      await readMetricCatalog();

      expect(readServedApi().requests.catalog).toBe(2);
    });
  });
});
