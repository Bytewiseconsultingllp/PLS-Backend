// @ts-check

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config({
  languageOptions: {
    parserOptions: {
      project: true,
      tsconfigRootDir: import.meta.dirname,
    },
  },
  files: ["**/*.ts"],
  extends: [
    eslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
  ],
  rules: {
    //    "no-console": "error",
    quotes: ["error", "double", { allowTemplateLiterals: true }],
    eqeqeq: "off",
    "no-unused-vars": "error",
    "@typescript-eslint/consistent-type-imports": [
      "error",
      {
        prefer: "type-imports",
        disallowTypeAnnotations: false,
      },
    ],
    "prefer-const": ["error", { ignoreReadBeforeAssign: true }],
    "@typescript-eslint/only-throw-error": "off",
    "prefer-arrow-callback": ["error"],
    camelcase: ["error", { properties: "always" }],
    "@typescript-eslint/no-unsafe-assignment": "warn",
    "@typescript-eslint/no-unsafe-member-access": "warn",
    "@typescript-eslint/no-unsafe-call": "warn",
    "@typescript-eslint/no-unsafe-return": "warn",
    "@typescript-eslint/no-unsafe-argument": "warn",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-redundant-type-constituents": "warn",
    "@typescript-eslint/await-thenable": "off",
  },
});
