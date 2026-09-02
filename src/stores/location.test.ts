import { beforeEach, describe, expect, it, vi } from "vitest";
import useLocation from "./location";

describe("useLocation store", () => {
  beforeEach(() => {
    useLocation.setState({ location: undefined, requested: false });
  });

  it("requests geolocation and stores coordinates when successful", () => {
    const mockGeolocation = {
      getCurrentPosition: vi.fn((success) => {
        success({
          coords: {
            latitude: 55.6761,
            longitude: 12.5683,
            accuracy: 10,
          },
        });
      }),
    };

    vi.stubGlobal("navigator", { geolocation: mockGeolocation });

    useLocation.getState().RequestLocation();

    expect(useLocation.getState().requested).toBe(true);
    expect(useLocation.getState().location).toEqual({
      latitude: 55.6761,
      longitude: 12.5683,
      accuracy: 10,
    });
  });

  it("does not re-request if already requested", () => {
    const getCurrentPosition = vi.fn();
    vi.stubGlobal("navigator", { geolocation: { getCurrentPosition } });

    useLocation.setState({ requested: true });
    useLocation.getState().RequestLocation();

    expect(getCurrentPosition).not.toHaveBeenCalled();
  });
});
