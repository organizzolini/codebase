/**
 * The chain `createServerFn` builds, reduced to what a route test needs: the
 * handler comes back as is, so calling the server function calls it directly.
 */
export interface ServerFunctionBuilder {
  /** Hands the handler back, to be called as the server function. */
  readonly handler: <Handler>(handler: Handler) => Handler;

  /** Accepts a validator without running it, and continues the chain. */
  readonly validator: (validator: unknown) => ServerFunctionBuilder;
}
