import { Injectable } from "@nestjs/common";

/** A dependency of the class under test, which a test replaces with a mock. */
@Injectable()
export class SampleClockService {
  /** The time of day, as the real clock reads it. */
  public now(): string {
    return new Date().toISOString();
  }
}
