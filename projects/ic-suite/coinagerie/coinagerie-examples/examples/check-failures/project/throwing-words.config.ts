export default {
  exclude: {
    words: () => {
      throw new Error("the parent glossary is unreadable");
    },
  },
  include: ["src/**"],
  outputs: [{ path: "glossaries/missing.md", type: "markdown" }],
};
