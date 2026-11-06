import { Test } from "@nestjs/testing";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { z } from "zod";

import { CaelundasApiModule } from "./caelundas-api.module";

import type { INestApplication } from "@nestjs/common";
import type { Server } from "node:http";

const nightSkyResponseSchema = z.object({
  data: z.object({ nightSky: z.object({ svg: z.string() }) }),
});

const errorResponseSchema = z.object({
  errors: z.array(z.object({ message: z.string() })).min(1),
});

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
    expect(svg).toContain('viewBox="0 0 1100 700"');
    expect(svg).toContain("<animateTransform");
  });

  it("draws the sky with its defaults when only the size is given", async () => {
    expect.hasAssertions();

    await expect(skyOf("width: 800, height: 600")).resolves.toContain(
      'viewBox="0 0 800 600"',
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
});
