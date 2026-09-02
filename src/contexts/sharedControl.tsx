import { createContext, type FunctionComponent, type ReactNode, useContext } from "react";

export interface SharedControlContextValue {
  /** True when this app instance is connected as a shared-control client (not the host). */
  isRemote: boolean;
  /** Send a message through the shared-control WebSocket. No-op when not connected as a client. */
  send: (data: { event: string; payload?: unknown }) => void;
}

const SharedControlContext = createContext<SharedControlContextValue>({
  isRemote: false,
  send: () => {},
});

export interface SharedControlProviderProps {
  children: ReactNode;
  send: (data: { event: string; payload?: unknown }) => void;
}

const SharedControlProvider: FunctionComponent<SharedControlProviderProps> = ({
  children,
  send,
}) => {
  return (
    <SharedControlContext.Provider value={{ isRemote: true, send }}>
      {children}
    </SharedControlContext.Provider>
  );
};

const useSharedControl = () => useContext(SharedControlContext);

export { SharedControlContext, SharedControlProvider, useSharedControl };
