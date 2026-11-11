import { Injectable } from "@nestjs/common";

/** A sink with more implementations than the cap allows. */
export interface LineSink {
  emit: (line: string) => string;
}

/**
 * Shows what the implementation-candidate cap guards against.
 *
 * Nine classes here satisfy `LineSink` structurally, past the cap of eight. In a real workspace, a common member name like `emit` matches dozens of unrelated classes, and expanding them invents stacks no run takes.
 */
@Injectable()
export class ImplementationFanOutService {
  // 🌎 Public Methods

  /** Emits one line through whichever sink was handed in. */
  public write(sink: LineSink, line: string): string {
    return sink.emit(line);
  }
}
