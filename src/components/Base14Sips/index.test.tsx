import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Base14Sips from "./index";

describe("Base14Sips component", () => {
  it("renders base 14 converted value with 14 subscript", () => {
    const { container } = render(<Base14Sips value={14} />);
    expect(container).toHaveTextContent("1014");
    expect(screen.getByText("14").tagName).toBe("SUB");
  });

  it("applies custom opacity to subscript denotation", () => {
    render(<Base14Sips value={27} denotationOpacity={0.5} />);
    const sub = screen.getByText("14");
    expect(sub).toHaveStyle({ opacity: "0.5" });
  });

  it("applies custom font size to subscript denotation", () => {
    render(<Base14Sips value={27} denotationFontSize="0.4em" />);
    const sub = screen.getByText("14");
    expect(sub.style.fontSize).toBe("0.4em");
  });
});
