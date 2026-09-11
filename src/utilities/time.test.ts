import { describe, expect, it } from "vitest";
import {
  formatCardRate,
  formatDurationCompact,
  formatRoundRate,
  formatUnitRate,
  millisecondsToMMSSsss,
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

  describe("millisecondsToMMSSsss", () => {
    it("should format minutes, seconds and milliseconds", () => {
      expect(millisecondsToMMSSsss(0)).toBe("00:00.000");
      expect(millisecondsToMMSSsss(199923)).toBe("03:19.923");
      expect(millisecondsToMMSSsss(65 * 60 * 1000 + 123)).toBe("65:00.123");
    });
  });

  describe("formatDurationCompact", () => {
    it("should format times under 60 seconds as seconds only", () => {
      expect(formatDurationCompact(0)).toBe("0s");
      expect(formatDurationCompact(5000)).toBe("5s");
      expect(formatDurationCompact(45000)).toBe("45s");
      expect(formatDurationCompact(59400)).toBe("59s");
    });

    it("should format times between 1 minute and 1 hour as minutes and seconds", () => {
      expect(formatDurationCompact(60000)).toBe("1m 00s");
      expect(formatDurationCompact(72000)).toBe("1m 12s");
      expect(formatDurationCompact(125000)).toBe("2m 05s");
      expect(formatDurationCompact(59 * 60 * 1000 + 59 * 1000)).toBe("59m 59s");
    });

    it("should format times of 1 hour or more as hours and minutes", () => {
      expect(formatDurationCompact(3600000)).toBe("1h 00m");
      expect(formatDurationCompact((3600 + 60) * 1000)).toBe("1h 01m");
      expect(formatDurationCompact((2 * 3600 + 15 * 60) * 1000)).toBe("2h 15m");
    });

    it("handles invalid or negative values gracefully", () => {
      expect(formatDurationCompact(-1000)).toBe("0s");
      expect(formatDurationCompact(NaN)).toBe("0s");
    });
  });

  describe("formatRoundRate", () => {
    it("returns '-' for 0 or negative values", () => {
      expect(formatRoundRate(0)).toBe("-");
      expect(formatRoundRate(-5000)).toBe("-");
      expect(formatRoundRate(NaN)).toBe("-");
    });

    it("formats durations under 60 seconds as 'x s / round'", () => {
      expect(formatRoundRate(5000)).toBe("5 s / round");
      expect(formatRoundRate(10000)).toBe("10 s / round");
      expect(formatRoundRate(30000)).toBe("30 s / round");
      expect(formatRoundRate(45000)).toBe("45 s / round");
    });

    it("formats durations between 1 minute and 1 hour as 'xm ys / round'", () => {
      expect(formatRoundRate(60000)).toBe("1m / round");
      expect(formatRoundRate(80000)).toBe("1m 20s / round");
      expect(formatRoundRate(90000)).toBe("1m 30s / round");
      expect(formatRoundRate(120000)).toBe("2m / round");
      expect(formatRoundRate(125000)).toBe("2m 5s / round");
    });

    it("formats durations of 1 hour or more", () => {
      expect(formatRoundRate(3600000)).toBe("1h / round");
      expect(formatRoundRate(3620000)).toBe("1h 20s / round");
      expect(formatRoundRate(3720000)).toBe("1h 2m / round");
      expect(formatRoundRate(3740000)).toBe("1h 2m 20s / round");
    });
  });

  describe("formatCardRate", () => {
    it("returns '-' for 0 or negative values", () => {
      expect(formatCardRate(0)).toBe("-");
      expect(formatCardRate(-5000)).toBe("-");
      expect(formatCardRate(NaN)).toBe("-");
    });

    it("formats card rates under 60 seconds as 'x s / card'", () => {
      expect(formatCardRate(5000)).toBe("5 s / card");
      expect(formatCardRate(12000)).toBe("12 s / card");
      expect(formatCardRate(30000)).toBe("30 s / card");
    });

    it("formats card rates over 1 minute as 'xm ys / card'", () => {
      expect(formatCardRate(60000)).toBe("1m / card");
      expect(formatCardRate(70000)).toBe("1m 10s / card");
    });
  });

  describe("formatUnitRate", () => {
    it("formats arbitrary units with spaced slash", () => {
      expect(formatUnitRate(15000, "turn")).toBe("15 s / turn");
      expect(formatUnitRate(75000, "drink")).toBe("1m 15s / drink");
    });
  });
});
