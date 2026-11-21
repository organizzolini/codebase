import { Get, Injectable } from "@nestjs/common";

/**
 * Two entry-point kinds, in the shapes a framework really calls.
 *
 * Neither method has a caller here. One carries a configured decorator, the other
 * is a NestJS lifecycle hook, and each calls one helper so it has a stack.
 */
@Injectable()
export class EntryPointsService {
  // 🔏 Private Methods

  /** Builds the body a decorated request handler answers with. */
  private buildReport(): string {
    return "report";
  }

  /** Does the work a lifecycle hook is called to do. */
  private prepareCache(): string {
    return "prepared";
  }

  // 🌎 Public Methods

  /** A lifecycle hook a framework calls — the `lifecycle` kind. */
  public onModuleInit(): string {
    return this.prepareCache();
  }

  /** A decorated method — the `decorated-method` kind. */
  @Get()
  public readReport(): string {
    return this.buildReport();
  }
}

/**
 * The safety net: a callable nothing calls, promoted to an `orphan-root`.
 */
export function summarizeOrphanedWork(entries: readonly string[]): number {
  return entries.length;
}
