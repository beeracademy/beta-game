import type { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers";
import "vitest";

declare module "vitest" {
  interface Assertion<E = any> extends TestingLibraryMatchers<E, R> {}
  interface AsymmetricMatchersContaining extends TestingLibraryMatchers {}
}
