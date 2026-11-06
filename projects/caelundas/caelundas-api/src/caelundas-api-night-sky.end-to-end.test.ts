import { Test } from "@nestjs/testing";
import { SiderealTime } from "astronomy-engine";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { z } from "zod";

import { CaelundasApiModule } from "./caelundas-api.module";

import type { INestApplication } from "@nestjs/common";
import type { Server } from "node:http";

const nightSkyResponseSchema = z.object({
  data: z.object({ nightSky: z.object({ svg: z.string() }) }),
});

const measurementsResponseSchema = z.object({
  data: z.object({
    nightSky: z.object({
      measurements: z.object({
        fieldOfViewClamped: z.boolean(),
        periodSeconds: z.number(),
        starsDrawn: z.number(),
        starsInCatalog: z.number(),
        svgLength: z.number(),
      }),
    }),
  }),
});

const errorResponseSchema = z.object({
  errors: z.array(z.object({ message: z.string() })).min(1),
});

/**
 * The angle a still sky starts at for a moment and longitude: apparent
 * sidereal time at Greenwich plus the longitude, from the engine directly.
 */
function expectedStartDegrees(time: Date, longitudeDegrees: number): number {
  return (((SiderealTime(time) * 15 + longitudeDegrees) % 360) + 360) % 360;
}

/**
 * Reads the starting angle out of a still sky's SVG.
 */
function startDegreesOf(svg: string): number {
  const match = /<g transform="rotate\((-?[\d.]+)\)">/u.exec(svg);

  return -Number(match?.[1]);
}

describe("caelundas api night sky end-to-end suite", () => {
  let application: INestApplication<Server>;
  let url: string;

  /**
   * Sends one nightSky query with the given input literal and returns the
   * parsed JSON body.
   */
  async function query(input: string, selection = "svg"): Promise<unknown> {
    const response = await fetch(url, {
      body: JSON.stringify({
        query: `{ nightSky(input: { ${input} }) { ${selection} } }`,
      }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });

    return response.json();
  }

  /**
   * Asks for the sky and returns its SVG.
   */
  async function skyOf(input: string): Promise<string> {
    return nightSkyResponseSchema.parse(await query(input)).data.nightSky.svg;
  }

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [CaelundasApiModule],
    }).compile();

    application = module.createNestApplication<INestApplication<Server>>();
    await application.listen(0);
    url = `${await application.getUrl()}/graphql`;
  });

  afterAll(async () => {
    await application.close();
  });

  it("draws a night sky for a place and a window size", async () => {
    expect.hasAssertions();

    const svg = await skyOf(
      "latitudeDegrees: 40.7, longitudeDegrees: -74, width: 1100, height: 700",
    );

    expect(svg).toContain('aria-label="Slowly rotating night sky"');
    expect(svg).toContain('viewBox="0 0 1152 704"');
    expect(svg).toContain("<animateTransform");
  });

  it("draws one sky for a window size within the same bucket", async () => {
    expect.hasAssertions();

    await expect(skyOf("width: 1090, height: 690")).resolves.toBe(
      await skyOf("width: 1100, height: 700"),
    );
    await expect(skyOf("width: 1153, height: 700")).resolves.not.toBe(
      await skyOf("width: 1152, height: 700"),
    );
  });

  it("draws one sky for any moment within the same minute", async () => {
    expect.hasAssertions();

    const early = await skyOf(
      'width: 800, height: 600, time: "2026-03-20T04:30:01Z"',
    );
    const late = await skyOf(
      'width: 800, height: 600, time: "2026-03-20T04:30:58Z"',
    );
    const next = await skyOf(
      'width: 800, height: 600, time: "2026-03-20T04:31:01Z"',
    );

    expect(late).toBe(early);
    expect(next).not.toBe(early);
  });

  it("draws the sky with its defaults when only the size is given", async () => {
    expect.hasAssertions();

    await expect(skyOf("width: 800, height: 600")).resolves.toContain(
      'viewBox="0 0 832 640"',
    );
  });

  it("draws a still sky when asked", async () => {
    expect.hasAssertions();

    await expect(
      skyOf("width: 800, height: 600, still: true"),
    ).resolves.not.toContain("<animateTransform");
  });

  it("draws the zoomed-out tuning view in debug", async () => {
    expect.hasAssertions();

    await expect(
      skyOf("width: 800, height: 600, debug: true"),
    ).resolves.toContain(">pole</text>");
  });

  it("paints both background colors", async () => {
    expect.hasAssertions();

    const svg = await skyOf(
      'width: 800, height: 600, backgroundTopColor: "#123456", backgroundBottomColor: "abc"',
    );

    expect(svg).toContain('stop-color="#123456"');
    expect(svg).toContain('stop-color="#aabbcc"');
  });

  it("draws fewer stars at a brighter magnitude limit and a smaller scale", async () => {
    expect.hasAssertions();

    const all = await skyOf("width: 800, height: 600");
    const bright = await skyOf("width: 800, height: 600, faintestMagnitude: 2");
    const small = await skyOf("width: 800, height: 600, starScale: 0.5");

    expect(bright.length).toBeLessThan(all.length);
    expect(small).not.toBe(all);
  });

  it("draws the figures it is asked for and the ecliptic on request", async () => {
    expect.hasAssertions();

    const none = await skyOf(
      'width: 800, height: 600, ecliptic: false, constellations: ["none"]',
    );
    const all = await skyOf(
      'width: 800, height: 600, ecliptic: false, constellations: ["all"], lineColor: "#ff0000", lineOpacity: 0.5, lineWidth: 2',
    );
    const ecliptic = await skyOf(
      'width: 800, height: 600, constellations: ["none"], eclipticColor: "#00ff00", eclipticOpacity: 0.4, eclipticWidth: 2',
    );

    expect(none).not.toContain("stroke-linecap");
    expect(all).toContain('stroke="#ff0000"');
    expect(ecliptic).toContain("stroke-dasharray");
    expect(ecliptic).toContain('stroke="#00ff00"');
  });

  it("changes the view with the field of view, bottom altitude and speed", async () => {
    expect.hasAssertions();

    const base = await skyOf("latitudeDegrees: 60, width: 800, height: 600");
    const framed = await skyOf(
      "latitudeDegrees: 60, width: 800, height: 600, verticalFieldOfViewDegrees: 30, bottomAltitudeDegrees: 5, pixelsPerSecond: 30",
    );

    expect(framed).not.toBe(base);
  });

  it("rejects a size and a latitude it cannot draw", async () => {
    expect.hasAssertions();

    const tooSmall = errorResponseSchema.parse(
      await query("width: 0, height: 600"),
    );
    const southern = errorResponseSchema.parse(
      await query("width: 800, height: 600, latitudeDegrees: -10"),
    );

    expect(tooSmall.errors[0]?.message).toContain("width");
    expect(southern.errors[0]?.message).toContain("latitudeDegrees");
  });

  it("starts the sky at the sidereal angle of the time and longitude asked", async () => {
    expect.hasAssertions();

    const time = new Date("2026-03-20T04:30:00Z");
    const west = await skyOf(
      `width: 800, height: 600, still: true, time: "${time.toISOString()}", longitudeDegrees: -74`,
    );
    const east = await skyOf(
      `width: 800, height: 600, still: true, time: "${time.toISOString()}", longitudeDegrees: 16`,
    );

    expect(startDegreesOf(west)).toBeCloseTo(
      expectedStartDegrees(time, -74),
      3,
    );
    expect(startDegreesOf(east)).toBeCloseTo(expectedStartDegrees(time, 16), 3);
  });

  it("starts the sky at the sidereal angle of now when no time is given", async () => {
    expect.hasAssertions();

    const before = Date.now();
    const svg = await skyOf("width: 800, height: 600, still: true");
    const expected = expectedStartDegrees(new Date(before), -74);
    const difference = Math.abs(startDegreesOf(svg) - expected);

    expect(Math.min(difference, 360 - difference)).toBeLessThan(0.5);
  });

  it("returns the measurements only when they are asked for", async () => {
    expect.hasAssertions();

    const plain = await query("width: 800, height: 600");
    const measured = measurementsResponseSchema.parse(
      await query(
        "width: 800, height: 600",
        "svg measurements { fieldOfViewClamped periodSeconds starsDrawn starsInCatalog svgLength }",
      ),
    );
    const { svg } = nightSkyResponseSchema.parse(plain).data.nightSky;

    expect(JSON.stringify(plain)).not.toContain("measurements");
    expect(measured.data.nightSky.measurements.svgLength).toBe(svg.length);
    expect(measured.data.nightSky.measurements.starsDrawn).toBeGreaterThan(0);
  });

  it("compresses a response to a client that accepts it", async () => {
    expect.hasAssertions();

    const response = await fetch(url, {
      body: JSON.stringify({
        query: "{ nightSky(input: { width: 800, height: 600 }) { svg } }",
      }),
      headers: {
        "accept-encoding": "gzip",
        "content-type": "application/json",
      },
      method: "POST",
    });
    const body = nightSkyResponseSchema.parse(await response.json());

    expect(response.headers.get("content-encoding")).toBe("gzip");
    expect(body.data.nightSky.svg).toContain("<svg");
  });
});
