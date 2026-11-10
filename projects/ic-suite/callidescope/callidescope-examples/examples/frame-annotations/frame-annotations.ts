import { Injectable } from "@nestjs/common";

/** The object a destructured parameter is written against. */
interface DescribeArguments {
  count: number;
  name: string;
}

/**
 * One frame per annotation shape a comment-trivia reader gets wrong.
 *
 * `trace` heads a stack seven deep, since annotations are read only for printed
 * frames. `legacyRender` heads its own root, because calling a `@deprecated`
 * member is an ESLint error in this repository.
 */
@Injectable()
export class FrameAnnotationsService {
  // 🔑 Public Fields

  /** Collapses a rendered value to something a description can quote. */
  public readonly summarize = (rendered: string): string =>
    this.describe({ count: rendered.length, name: rendered });

  // 🔏 Private Methods

  /** Joins the parts a description was built from. */
  private compose(description: string): string {
    return this.collapseThisSignatureBecauseItRunsLong(description, "", "wide");
  }

  /**
   * Finishes the chain and returns what the layers above it built, in one long sentence the printed frame shortens and the JSON keeps whole.
   */
  private finish(description: string): string {
    return description.trim();
  }

  // 🌎 Public Methods

  /**
   * Takes three parameters whose rendered signature runs past eighty
   * characters, so the printed frame collapses it to `(…): ReturnType`.
   */
  public collapseThisSignatureBecauseItRunsLong(
    firstDocumentIdentifier: string,
    secondDocumentIdentifier: string,
    requestedPresentationMode: string,
  ): string {
    return this.finish(
      `${firstDocumentIdentifier}${secondDocumentIdentifier}${requestedPresentationMode}`,
    );
  }

  /** Describes a value from a parameter with no name at all in the syntax. */
  public describe({ count, name }: DescribeArguments): string {
    return this.compose(`${name}:${String(count)}`);
  }

  /**
   * Renders a value the old way.
   *
   * @deprecated Superseded by `render`.
   */
  public legacyRender(value: string): string {
    return this.compose(value);
  }

  /**
   * Renders one value for display. The overloads differ in return type, so the docs live on the signature.
   */
  public render(value: string): string;
  public render(value: number): string[];
  public render(value: number | string): string | string[] {
    return typeof value === "string"
      ? this.summarize(value)
      : [this.summarize(String(value))];
  }

  /** Traces one value through every annotation shape below. */
  public trace(value: string): string {
    return this.render(value);
  }
}
