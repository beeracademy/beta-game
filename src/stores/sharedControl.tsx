import { createContext, FunctionComponent, useContext } from "react";

interface SharedControlContextValue {
  /** True when this app instance is connected as a shared-control client (not the host). */
  isRemote: boolean;
  /** Send a message through the shared-control WebSocket. No-op when not connected as a client. */
  send: (data: { event: string; payload?: unknown }) => void;
}

const SharedControlContext = createContext<SharedControlContextValue>({
  isRemote: false,
  send: () => {},
});

interface SharedControlProviderProps {
  children: React.ReactNode;
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

export { SharedControlProvider, useSharedControl };
