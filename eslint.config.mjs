// @ts-check

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  // Global ignores - must be first
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "prisma/seed-pricing.ts",
      // OLD DEPRECATED FILES - Ignore from linting
      "src/controllers/freeLancerController/freeLancerController.ts",
      "src/controllers/freeLancerController/freeLancerControllerV2.ts",
      "src/controllers/freeLancerController/freelancerRegistrationController.ts",
      "src/controllers/projectBuilderController/projectBuilderController.ts",
      "src/controllers/projectRequestController/projectRequestController.ts",
      "src/controllers/projectController/projectController.ts",
      "src/controllers/projectController/getProjectController.ts",
      "src/controllers/projectController/updateProjectController.ts",
      "src/controllers/milestoneController/milestoneController.ts",
      "src/controllers/visitorsController/visitorsController.ts",
      "src/controllers/getQuoteController/getQuoteController.ts",
      "src/routers/getQuoteRouter/getQuoteRouter.ts",
      "src/routers/projectBuilderRouter/projectBuilderRouter.ts",
      "src/routers/projectRequestRouter/projectRequestRouter.ts",
      "src/routers/projectRouter/projectRouter.ts",
      "src/routers/mileStoneRouter/mileStoneRouter.ts",
      "src/routers/visitorsRouter/visitorsRouter.ts",
      "src/routers/freelancerRouter/freeLancerRouter.ts",
      "src/utils/findUniqueUtils.ts",
      "src/utils/updateProjectProgressUtils.ts",
    ],
  },
  // Main config
  {
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
      // Temporarily disable problematic rules
      "@typescript-eslint/await-thenable": "off",
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/no-misused-promises": "off",
    },
  },
);
