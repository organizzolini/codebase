export default {
  exclude: {
    // Applied after folding, so excluding `service` also covers `services`.
    words: async () => ["service"],
  },
  // Merges a derivational family the tool leaves apart on its own.
  fold: (word: string) => (word === "configuration" ? "configure" : word),
  include: ["src/**"],
};
