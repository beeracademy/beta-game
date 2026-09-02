import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Crown, Jester } from "./index";

describe("Hats component", () => {
  it("renders Crown image with alt text", () => {
    render(<Crown className="crown-test" />);
    const img = screen.getByAltText("Crown");
    expect(img).toBeInTheDocument();
    expect(img).toHaveClass("crown-test");
  });

  it("renders Jester image with alt text", () => {
    render(<Jester className="jester-test" />);
    const img = screen.getByAltText("Jester");
    expect(img).toBeInTheDocument();
    expect(img).toHaveClass("jester-test");
  });
});
