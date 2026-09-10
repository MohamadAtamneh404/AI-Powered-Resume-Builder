const js = require("@eslint/js");
const prettierRecommended = require("eslint-plugin-prettier/recommended");

module.exports = [
  { ignores: ["node_modules/", "data/"] },
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: {
        process: "readonly",
        console: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        require: "readonly",
        module: "readonly",
      },
    },
    rules: {
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "no-undef": "off", // some globals might not be listed
    },
  },
  prettierRecommended,
];
