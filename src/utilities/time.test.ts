import { describe, expect, it } from "vitest";
import {
  milisecondsToMMSSsss,
  secondsToHHMMSS,
  secondsToHHMMSSsss,
} from "./time";

describe("time utilities", () => {
  describe("secondsToHHMMSS", () => {
    it("should format standard elapsed times under 24 hours", () => {
      expect(secondsToHHMMSS(0)).toBe("00:00:00");
      expect(secondsToHHMMSS(1000)).toBe("00:00:01");
      // 2 minutes, 33 seconds
      expect(secondsToHHMMSS((2 * 60 + 33) * 1000)).toBe("00:02:33");
      // 23 hours, 59 minutes, 59 seconds
      expect(secondsToHHMMSS((23 * 3600 + 59 * 60 + 59) * 1000)).toBe(
        "23:59:59",
      );
    });

    it("should format times past 24 hours without resetting to 0", () => {
      // Exactly 24 hours
      expect(secondsToHHMMSS(24 * 3600 * 1000)).toBe("24:00:00");
      // 25 hours, 2 minutes, 33 seconds
      expect(secondsToHHMMSS((25 * 3600 + 2 * 60 + 33) * 1000)).toBe(
        "25:02:33",
      );
      // 100 hours
      expect(secondsToHHMMSS(100 * 3600 * 1000)).toBe("100:00:00");
      // 1234 hours, 56 minutes, 7 seconds
      expect(secondsToHHMMSS((1234 * 3600 + 56 * 60 + 7) * 1000)).toBe(
        "1234:56:07",
      );
    });

    it("handles negative or invalid values gracefully", () => {
      expect(secondsToHHMMSS(-5000)).toBe("00:00:00");
      expect(secondsToHHMMSS(NaN)).toBe("00:00:00");
    });
  });

  describe("secondsToHHMMSSsss", () => {
    it("should format standard elapsed times under 24 hours with milliseconds", () => {
      expect(secondsToHHMMSSsss(0)).toBe("00:00:00.000");
      // 2 minutes, 33 seconds, 510 milliseconds
      expect(secondsToHHMMSSsss((2 * 60 + 33) * 1000 + 510)).toBe(
        "00:02:33.510",
      );
      // 23 hours, 59 minutes, 59 seconds, 999 ms
      expect(secondsToHHMMSSsss((23 * 3600 + 59 * 60 + 59) * 1000 + 999)).toBe(
        "23:59:59.999",
      );
    });

    it("should format times past 24 hours with milliseconds without resetting to 0", () => {
      // Exactly 24 hours
      expect(secondsToHHMMSSsss(24 * 3600 * 1000)).toBe("24:00:00.000");
      // 25 hours, 2 minutes, 33 seconds, 510 ms
      expect(secondsToHHMMSSsss((25 * 3600 + 2 * 60 + 33) * 1000 + 510)).toBe(
        "25:02:33.510",
      );
      // 100 hours, 0 minutes, 1 second, 23 ms
      expect(secondsToHHMMSSsss(100 * 3600 * 1000 + 1023)).toBe(
        "100:00:01.023",
      );
    });

    it("handles negative or invalid values gracefully", () => {
      expect(secondsToHHMMSSsss(-5000)).toBe("00:00:00.000");
      expect(secondsToHHMMSSsss(NaN)).toBe("00:00:00.000");
    });
  });

  describe("milisecondsToMMSSsss", () => {
    it("should format minutes, seconds and milliseconds", () => {
      expect(milisecondsToMMSSsss(0)).toBe("00:00.000");
      expect(milisecondsToMMSSsss(199923)).toBe("03:19.923");
      expect(milisecondsToMMSSsss(65 * 60 * 1000 + 123)).toBe("65:00.123");
    });
  });
});
