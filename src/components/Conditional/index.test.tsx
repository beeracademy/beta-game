import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Conditional from "./index";

describe("Conditional component", () => {
  it("renders children when value is true", () => {
    render(
      <Conditional value={true}>
        <span>Visible text</span>
      </Conditional>,
    );
    expect(screen.getByText("Visible text")).toBeInTheDocument();
  });

  it("does not render children when value is false", () => {
    render(
      <Conditional value={false}>
        <span>Hidden text</span>
      </Conditional>,
    );
    expect(screen.queryByText("Hidden text")).not.toBeInTheDocument();
  });
});
