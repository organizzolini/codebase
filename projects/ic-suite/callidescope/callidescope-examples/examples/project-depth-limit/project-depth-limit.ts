import { Injectable } from "@nestjs/common";

/**
 * Six frames: a finding under five, none under the run's default of six.
 *
 * This package's own `callidescope.config.ts` declares five, so the chain is a
 * finding. Only the file the number was written in changed.
 */
@Injectable()
export class ProjectDepthLimitService {
  // 🔏 Private Methods

  /** Applies the limit the resolved project turned out to declare. */
  private applyLimit(project: string): string {
    return this.reportVerdict(`${project}:limit`);
  }

  /** Reads the file the number the verdict used was written in. */
  private readDeclaringFile(project: string): string {
    return `${project}:declared-in`;
  }

  /** Reads the limit whichever configuration file the project settled on. */
  private readLimit(project: string): string {
    return this.applyLimit(project);
  }

  /** States the verdict, and where the number behind it came from. */
  private reportVerdict(verdict: string): string {
    return this.readDeclaringFile(verdict);
  }

  /** Names the configuration file the project is judged by. */
  private resolveConfiguration(project: string): string {
    return this.readLimit(project);
  }

  // 🌎 Public Methods

  /** Judges one project, through every stage a resolved limit passes. */
  public judge(project: string): string {
    return this.resolveConfiguration(project);
  }
}
