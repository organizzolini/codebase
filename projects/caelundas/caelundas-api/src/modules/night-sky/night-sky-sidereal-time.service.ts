import { Injectable } from "@nestjs/common";
import { SiderealTime } from "astronomy-engine";

import {
  DEGREES_PER_HOUR,
  J2000_JULIAN_DAY,
  MILLISECONDS_PER_DAY,
  UNIX_EPOCH_JULIAN_DAY,
} from "./night-sky.constants";

/**
 * Tells where the sky stands for a place and moment, as sidereal time.
 */
@Injectable()
export class NightSkySiderealTimeService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /**
   * Greenwich mean sidereal time in hours. Use it only when astronomy-engine's
   * `SiderealTime` is unavailable; the two agree to within a few seconds.
   */
  public greenwichMeanHours(date: Date): number {
    const days =
      date.getTime() / MILLISECONDS_PER_DAY +
      UNIX_EPOCH_JULIAN_DAY -
      J2000_JULIAN_DAY;
    const degrees = (280.460_618_37 + 360.985_647_366_29 * days) % 360;

    return ((degrees + 360) % 360) / DEGREES_PER_HOUR;
  }

  /**
   * Local sidereal time in degrees, from 0 up to 360. Pass astronomy-engine's
   * `SiderealTime(date)` as `greenwichHours` when it is available.
   */
  public localDegrees(
    date: Date,
    longitudeDegrees: number,
    greenwichHours?: number,
  ): number {
    const hours = greenwichHours ?? this.greenwichMeanHours(date);

    return (((hours * DEGREES_PER_HOUR + longitudeDegrees) % 360) + 360) % 360;
  }

  /**
   * The angle the sky starts at for a place and moment, from
   * astronomy-engine's apparent sidereal time. The hand-rolled mean sidereal
   * time above is only the fallback when that is unavailable.
   */
  public startingDegrees(date: Date, longitudeDegrees: number): number {
    return this.localDegrees(date, longitudeDegrees, SiderealTime(date));
  }
}
