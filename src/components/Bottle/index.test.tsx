import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Bottle from "./index";

describe("Bottle component", () => {
  it("renders SVG bottle with custom color and default size", () => {
    const { container } = render(<Bottle color="#ff0000" />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("height", "30px");
    const group = container.querySelector("g");
    expect(group).toHaveAttribute("fill", "#ff0000");
  });

  it("renders SVG bottle with custom size", () => {
    const { container } = render(<Bottle color="#00ff00" size={50} />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("height", "50");
  });
});
