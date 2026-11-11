/** The `createServerFn` chain, reduced to what route tests need. */
export interface ServerFunctionBuilder {
  /** Hands the handler back, to be called as the server function. */
  readonly handler: <Handler>(handler: Handler) => Handler;

  /** Accepts a validator without running it, and continues the chain. */
  readonly validator: (validator: unknown) => ServerFunctionBuilder;
}
