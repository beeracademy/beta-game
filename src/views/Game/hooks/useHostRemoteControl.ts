import { useEffect } from "react";
import useWebSocket from "../../../api/websocket";
import useGame from "../../../stores/game";
import useSettings from "../../../stores/settings";

interface UseHostRemoteControlOptions {
  isRemote: boolean;
  drawCard: () => void;
}

export const useHostRemoteControl = ({
  isRemote,
  drawCard,
}: UseHostRemoteControlOptions) => {
  const ws = useWebSocket();
  const remoteControl = useSettings((state) => state.remoteControl);
  const remoteToken = useSettings((state) => state.remoteToken);

  // Connect WebSocket when remote control is enabled on host
  useEffect(() => {
    if (isRemote || !remoteControl || !remoteToken) {
      return;
    }

    ws.connect(`wss://academy.beer/ws/remote/${remoteToken}/`);

    return () => {
      ws.close();
    };
  }, [isRemote, remoteControl, remoteToken, ws]);

  // Handle incoming remote commands and broadcast host game state changes
  useEffect(() => {
    if (isRemote || !ws.ready) {
      return;
    }

    ws.receive((data) => {
      if (data.event === "GET_GAME_STATE") {
        ws.send({
          event: "GAME_STATE",
          payload: useGame.getState(),
        });
      }

      if (data.event === "GET_CHUG_TIME") {
        const state = useGame.getState();
        const lastCard = state.draws[state.draws.length - 1];
        if (
          lastCard &&
          lastCard.value === 14 &&
          lastCard.chug_start_start_delta_ms !== undefined &&
          lastCard.chug_end_start_delta_ms === undefined
        ) {
          ws.send({
            event: "CHUG_START_TIME",
            payload: {
              gameStartTimestamp: state.gameStartTimestamp,
              chugStartStartDeltaMs: lastCard.chug_start_start_delta_ms,
              chugStartTime:
                state.gameStartTimestamp + lastCard.chug_start_start_delta_ms,
            },
          });
        }
      }

      if (data.event === "GET_DNF_STATE" || data.event === "GET_DNF") {
        const state = useGame.getState();
        ws.send({
          event: "DNF_STATE",
          payload: {
            dnf_player_indexes: state.dnf_player_indexes,
            dnf_player_ids: state.dnf_player_indexes
              .filter((idx) => state.players[idx]?.id !== undefined)
              .map((idx) => state.players[idx].id as number),
          },
        });
      }

      if (data.event === "SET_PLAYER_DNF" || data.event === "SET_DNF") {
        const payload = data.payload as {
          playerIndex?: number;
          index?: number;
          playerId?: number;
          dnf?: boolean;
        };
        const state = useGame.getState();
        let targetIndex = payload?.playerIndex ?? payload?.index;
        if (targetIndex === undefined && payload?.playerId !== undefined) {
          const found = state.players.findIndex(
            (p) => p.id === payload.playerId,
          );
          if (found !== -1) {
            targetIndex = found;
          }
        }
        if (
          targetIndex !== undefined &&
          targetIndex >= 0 &&
          targetIndex < state.players.length &&
          typeof payload?.dnf === "boolean"
        ) {
          try {
            useGame.getState().SetPlayerDNF(targetIndex, payload.dnf);
          } catch (error) {
            console.error("[Remote]", "SET_PLAYER_DNF failed", error);
          }
        }
      }

      if (data.event === "TOGGLE_PLAYER_DNF" || data.event === "TOGGLE_DNF") {
        const payload = data.payload as {
          playerIndex?: number;
          index?: number;
          playerId?: number;
        };
        const state = useGame.getState();
        let targetIndex = payload?.playerIndex ?? payload?.index;
        if (targetIndex === undefined && payload?.playerId !== undefined) {
          const found = state.players.findIndex(
            (p) => p.id === payload.playerId,
          );
          if (found !== -1) {
            targetIndex = found;
          }
        }
        if (
          targetIndex !== undefined &&
          targetIndex >= 0 &&
          targetIndex < state.players.length
        ) {
          try {
            const isCurrentlyDNF =
              state.dnf_player_indexes.includes(targetIndex);
            useGame.getState().SetPlayerDNF(targetIndex, !isCurrentlyDNF);
          } catch (error) {
            console.error("[Remote]", "TOGGLE_PLAYER_DNF failed", error);
          }
        }
      }

      if (data.event === "DRAW_CARD") {
        drawCard();
      }

      if (data.event === "START_CHUG") {
        try {
          useGame.getState().StartChug();
        } catch (error) {
          console.error("[Remote]", "START_CHUG failed", error);
        }
      }

      if (data.event === "STOP_CHUG") {
        try {
          useGame.getState().StopChug();
        } catch (error) {
          console.error("[Remote]", "STOP_CHUG failed", error);
        }
      }
    });

    const unsubscribe = useGame.subscribe((state, prevState) => {
      ws.send({
        event: "GAME_STATE",
        payload: state,
      });

      // If DNF state changed, emit DNF_STATE immediately
      const prevDnfs = prevState.dnf_player_indexes;
      const currentDnfs = state.dnf_player_indexes;
      const dnfChanged =
        !prevDnfs ||
        prevDnfs.length !== currentDnfs.length ||
        prevDnfs.some((val, idx) => val !== currentDnfs[idx]);

      if (dnfChanged) {
        ws.send({
          event: "DNF_STATE",
          payload: {
            dnf_player_indexes: currentDnfs,
            dnf_player_ids: currentDnfs
              .filter((idx) => state.players[idx]?.id !== undefined)
              .map((idx) => state.players[idx].id as number),
          },
        });
      }

      // If chug was started locally on host, emit CHUG_START_TIME immediately
      const lastCard = state.draws[state.draws.length - 1];
      const prevLastCard = prevState.draws[prevState.draws.length - 1];
      if (
        lastCard &&
        lastCard.value === 14 &&
        lastCard.chug_start_start_delta_ms !== undefined &&
        lastCard.chug_end_start_delta_ms === undefined &&
        prevLastCard?.chug_start_start_delta_ms === undefined
      ) {
        ws.send({
          event: "CHUG_START_TIME",
          payload: {
            gameStartTimestamp: state.gameStartTimestamp,
            chugStartStartDeltaMs: lastCard.chug_start_start_delta_ms,
            chugStartTime:
              state.gameStartTimestamp + lastCard.chug_start_start_delta_ms,
          },
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [isRemote, ws, drawCard]);

  // Gracefully notify remotes when host disables remote control
  useEffect(() => {
    if (isRemote || !ws.ready) {
      return;
    }

    if (!remoteControl) {
      ws.send({
        event: "REMOTES_DISCONNECT",
      });
      ws.close();
    }
  }, [isRemote, remoteControl, ws]);

  return ws;
};
