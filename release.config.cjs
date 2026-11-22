/**
 * semantic-release 26 finds its configuration only here, so this file hands over the
 * real one in `configuration/repository/`. `release.extends` in `package.json` no
 * longer works there: v26 lets its default plugins override a shareable config.
 */
module.exports = require("./configuration/repository/release.config.cjs");
