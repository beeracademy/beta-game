import { Box, keyframes, Typography, useTheme } from "@mui/material";
import {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { GiBeerBottle } from "react-icons/gi";
import { useSearchParam } from "react-use";
import useWebSocket from "../../api/websocket";
import useGame from "../../stores/game";
import { SharedControlProvider } from "../../stores/sharedControl";
import GameView from "../Game";

// ─── animations ────────────────────────────────────────────────────────────────

const pulse = keyframes`
  0%, 100% { transform: scale(1);   opacity: 1;   }
  50%       { transform: scale(1.08); opacity: 0.75; }
`;

const ripple = keyframes`
  0%   { transform: scale(0.85); opacity: 0.6; }
  100% { transform: scale(2.2);  opacity: 0;   }
`;

const dotBounce = keyframes`
  0%, 80%, 100% { transform: translateY(0);   }
  40%           { transform: translateY(-6px); }
`;

// ─── sub-components ────────────────────────────────────────────────────────────

interface SplashProps {
  title: string;
  subtitle?: string;
  iconColor?: string;
  showRipple?: boolean;
  showDots?: boolean;
}

const Splash: FunctionComponent<SplashProps> = ({
  title,
  subtitle,
  iconColor,
  showRipple = false,
  showDots = false,
}) => {
  const theme = useTheme();
  const color = iconColor ?? theme.palette.primary.main;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 3,
        width: "100%",
        flex: 1,
      }}
    >
      {/* Icon circle with optional ripple */}
      <Box
        sx={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {showRipple && (
          <>
            <Box
              sx={{
                position: "absolute",
                width: 96,
                height: 96,
                borderRadius: "50%",
                border: `2px solid ${color}`,
                animation: `${ripple} 1.8s ease-out infinite`,
              }}
            />
            <Box
              sx={{
                position: "absolute",
                width: 96,
                height: 96,
                borderRadius: "50%",
                border: `2px solid ${color}`,
                animation: `${ripple} 1.8s ease-out 0.6s infinite`,
              }}
            />
            <Box
              sx={{
                position: "absolute",
                width: 96,
                height: 96,
                borderRadius: "50%",
                border: `2px solid ${color}`,
                animation: `${ripple} 1.8s ease-out 1.2s infinite`,
              }}
            />
          </>
        )}

        <Box
          sx={{
            width: 96,
            height: 96,
            borderRadius: "50%",
            backgroundColor: `${color}18`,
            border: `2px solid ${color}40`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: showRipple ? `${pulse} 2s ease-in-out infinite` : "none",
          }}
        >
          <GiBeerBottle size={44} color={color} />
        </Box>
      </Box>

      {/* Text */}
      <Box
        sx={{
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 0.75,
        }}
      >
        <Typography
          variant="h6"
          sx={{ fontWeight: 600, color: "text.primary" }}
        >
          {title}
        </Typography>

        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}

        {showDots && (
          <Box sx={{ display: "flex", gap: 0.75, mt: 0.5 }}>
            {[0, 1, 2].map((i) => (
              <Box
                key={i}
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  backgroundColor: "text.disabled",
                  animation: `${dotBounce} 1.2s ease-in-out ${i * 0.2}s infinite`,
                }}
              />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

// ─── constants ─────────────────────────────────────────────────────────────────

/** How often to send a ping (connecting, live, and reconnecting phases) */
const PING_INTERVAL_MS = 2_000;
/** How long without a GAME_STATE response before switching to "reconnecting" */
const PING_TIMEOUT_MS = 10_000;
/** How long to wait before attempting a WebSocket reconnect after a disconnect */
const RECONNECT_DELAY_MS = 2_000;

// ─── main component ────────────────────────────────────────────────────────────

interface SharedControlViewProps {}

const SharedControlView: FunctionComponent<SharedControlViewProps> = () => {
  const [phase, setPhase] = useState<
    "connecting" | "live" | "reconnecting" | "unavailable"
  >("connecting");

  const theme = useTheme();

  const token = useSearchParam("token");
  const ws = useWebSocket();

  // Ref so ping-related callbacks always see the current ws without re-wiring effects
  const wsRef = useRef(ws);
  wsRef.current = ws;

  // Track phase in a ref too, so the ws.ready effect can read it without being
  // added as a dependency (avoids tearing down/re-creating the socket on every phase change)
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  // Ping timeout handle — cleared whenever GAME_STATE arrives
  const pingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Periodic ping interval handle
  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Reconnect delay handle
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // True once we have received at least one GAME_STATE message and were actually live.
  // Prevents showing "reconnecting" if the game was never connected in the first place.
  const hasEverBeenLiveRef = useRef(false);

  const clearPingTimeout = useCallback(() => {
    if (pingTimeoutRef.current !== null) {
      clearTimeout(pingTimeoutRef.current);
      pingTimeoutRef.current = null;
    }
  }, []);

  const clearPingInterval = useCallback(() => {
    if (pingIntervalRef.current !== null) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
  }, []);

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimerRef.current !== null) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  /**
   * Arms (or re-arms) the silence timeout. Fires if no GAME_STATE arrives
   * within PING_TIMEOUT_MS — meaning the server is reachable (socket open)
   * but not responding. Only switches to "reconnecting" if we have actually
   * been live previously; otherwise stays in "connecting".
   */
  const armPingTimeout = useCallback(() => {
    clearPingTimeout();
    pingTimeoutRef.current = setTimeout(() => {
      if (hasEverBeenLiveRef.current) {
        setPhase("reconnecting");
      }
    }, PING_TIMEOUT_MS);
  }, [clearPingTimeout]);

  // ── initial connect ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (!token) return;
    ws.connect(`wss://academy.beer/ws/remote/${token}/`);
    return () => {
      ws.close();
    };
  }, [token]);

  // ── socket closed → reconnect ────────────────────────────────────────────────
  //
  // When ws.ready goes false (socket closed by server or network drop), schedule
  // a new connection attempt. Only show "reconnecting" if we were previously live.

  useEffect(() => {
    if (ws.ready) {
      clearReconnectTimer();
      return;
    }

    // If the host deliberately ended the session, don't reconnect.
    if (phaseRef.current === "unavailable") return;

    if (hasEverBeenLiveRef.current) {
      setPhase("reconnecting");
    }

    reconnectTimerRef.current = setTimeout(() => {
      if (!token) return;
      wsRef.current.connect(`wss://academy.beer/ws/remote/${token}/`);
    }, RECONNECT_DELAY_MS);

    return () => {
      clearReconnectTimer();
    };
  }, [ws.ready]);

  // ── message handling + pings (while socket is open) ──────────────────────────

  useEffect(() => {
    if (!ws.ready) return;

    ws.receive((data) => {
      if (data.event === "GAME_STATE") {
        // Got a response — re-arm the silence window from NOW.
        // This is the only place we reset the timeout: proof the server is alive.
        // The interval just fires pings without touching the timer, so if responses
        // stop arriving the 10s clock will actually reach zero and fire.
        hasEverBeenLiveRef.current = true;
        armPingTimeout();
        setPhase("live");
        useGame.setState(data.payload);
      }

      if (data.event === "CHUG_START_TIME") {
        const payload = data.payload as {
          gameStartTimestamp?: number;
          chugStartStartDeltaMs?: number;
        };
        if (payload?.chugStartStartDeltaMs !== undefined) {
          const currentState = useGame.getState();
          const draws = [...currentState.draws];
          const lastIndex = draws.length - 1;
          if (lastIndex >= 0 && draws[lastIndex].value === 14) {
            draws[lastIndex] = {
              ...draws[lastIndex],
              chug_start_start_delta_ms: payload.chugStartStartDeltaMs,
            };
            useGame.setState({
              gameStartTimestamp:
                payload.gameStartTimestamp ?? currentState.gameStartTimestamp,
              draws,
            });
          }
        }
      }

      if (data.event === "REMOTES_DISCONNECT") {
        // Host explicitly closed shared control — stop reconnecting
        clearPingTimeout();
        clearPingInterval();
        setPhase("unavailable");
      }
    });

    // Arm the initial silence timeout and send the first ping.
    // The interval ONLY sends pings — it does NOT reset the timeout.
    // That way, if responses stop coming the 10s window will actually expire.
    armPingTimeout();
    ws.send({ event: "GET_GAME_STATE" });

    pingIntervalRef.current = setInterval(() => {
      wsRef.current.send({ event: "GET_GAME_STATE" });
    }, PING_INTERVAL_MS);

    return () => {
      clearPingTimeout();
      clearPingInterval();
    };
  }, [ws.ready]);

  // ── hard-sync on tab focus ───────────────────────────────────────────────────

  useEffect(() => {
    if (!ws.ready) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        armPingTimeout();
        ws.send({ event: "GET_GAME_STATE" });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [ws.ready]);

  // ── render ───────────────────────────────────────────────────────────────────

  if (phase === "unavailable") {
    return (
      <Box
        sx={{
          display: "flex",
          flex: 1,
          minHeight: 0,
        }}
      >
        <Splash
          title="Shared Control Unavailable"
          subtitle="The host closed the shared control connection."
          iconColor={theme.palette.error.main}
        />
      </Box>
    );
  }

  if (phase === "connecting" || phase === "reconnecting") {
    return (
      <Box
        sx={{
          display: "flex",
          flex: 1,
          minHeight: 0,
        }}
      >
        <Splash
          title={
            phase === "connecting" ? "Connecting to game" : "Reconnecting…"
          }
          subtitle={
            phase === "reconnecting"
              ? "Waiting for the host to respond"
              : undefined
          }
          showRipple
          showDots
        />
      </Box>
    );
  }

  return (
    <SharedControlProvider send={ws.send}>
      <GameView />
    </SharedControlProvider>
  );
};

export default SharedControlView;
