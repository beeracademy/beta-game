import {
  Box,
  Dialog,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { FunctionComponent, useEffect, useRef, useState } from "react";
import { customCommands } from "./commands";
import { files } from "./files";
import { Buffer, Command } from "./models";

interface TerminalProps {
  open: boolean;
  onClose: () => void;
}

const Terminal: FunctionComponent<TerminalProps> = (props) => {
  const theme = useTheme();

  const containerRef = useRef<HTMLDivElement>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState<string>("");

  const [buffer, setBuffer] = useState<string[]>([
    "Welcome to the terminal!",
    "type 'help' to get started",
  ]);

  const [showInput, setShowInput] = useState<boolean>(true);

  const write = (text: string) => {
    setBuffer((b) => [...b, text]);

    setTimeout(scrollToBottom, 0);
  };

  const clear = () => {
    setBuffer([]);

    setTimeout(scrollToBottom, 0);
  };

  const execute = (command: string) => {
    setShowInput(false);

    if (command === "") {
      setShowInput(true);
      return;
    }

    write("$ " + command);

    const args = command.split(" ");
    const cmd = args.shift();

    if (cmd === undefined) {
      setShowInput(true);
      return;
    }

    const commandObj = [...builtInCommands, ...customCommands].find(
      (c) => c.name === cmd
    );

    if (commandObj === undefined) {
      write(`unknown command: ${cmd}`);
      setShowInput(true);
      return;
    }

    commandObj.execute(args, { write, clear });

    setShowInput(true);
  };

  const builtInCommands: Command[] = [
    {
      name: "help",
      description: "show this help",
      execute: (args: string[], buffer: Buffer) => {
        buffer.write("Available commands:");

        [...builtInCommands, customCommands[0], customCommands[1]].forEach(
          (c) => {
            buffer.write(`  ${rightPad(c.name, 10)} ${c.description || ""}`);
          }
        );

        buffer.write("  and maybe more...");
      },
    },
    {
      name: "clear",
      description: "clear the terminal",
      execute: (args: string[], buffer: Buffer) => {
        buffer.clear();
      },
    },
    {
      name: "cat",
      description: "show the content of a file",
      execute: (args: string[], buffer: Buffer) => {
        buffer.write("access denied");
      },
    },
    {
      name: "cd",
      description: "change the current directory",
      execute: (args: string[], buffer: Buffer) => {
        buffer.write("access denied");
      },
    },
    {
      name: "ls",
      description: "list the files in the current directory",
      execute: (args: string[], buffer: Buffer) => {
        files.forEach((f) => {
          let perm = f.name.endsWith("/") ? "drwxr-xr-x" : "-rw-r--r--";
          buffer.write(
            `${perm} root root ${rightPad(f.size || "", 5)}  ${f.name}`
          );
        });
      },
    },
    {
      name: "whoami",
      description: "print the user name associated with the current effective user ID.",
      execute: (args: string[], buffer: Buffer) => {
        buffer.write("an idiot");
      },
    },
    {
      name: "exit",
      description: "close the terminal",
      execute: (args: string[], buffer: Buffer) => {
        props.onClose();
      },
    },
  ];

  const scrollToBottom = () => {
    containerRef.current?.scrollTo({
      top: containerRef.current.scrollHeight,
    });
  };

  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    });
  }, [props.open]);

  return (
    <Dialog
      open={props.open}
      maxWidth="xl"
      onClose={() => {
        inputRef.current?.focus();
      }}
      onKeyDownCapture={(e) => {
        if (e.code === "Escape") {
          e.preventDefault();
          props.onClose();
        }

        if (e.ctrlKey && e.code === "KeyL") {
          e.preventDefault();
          clear();
        }

        if (e.ctrlKey && e.code === "KeyU") {
          e.preventDefault();
          setInputValue("");
        }
      }}
      sx={{
        overflow: "hidden",
      }}
    >
      <Stack
        ref={containerRef}
        sx={{
          width: 700,
          height: 400,
          color: theme.palette.secondary.contrastText,
          backgroundColor: theme.palette.secondary.main,
          cursor: "text",
          fontSize: 14,
          padding: 2,
          overflow: "hidden",
        }}
        spacing={0.25}
        onClick={() => {
          inputRef.current?.focus();
        }}
      >
        {buffer.map((line, i) => (
          <Box key={i}>
            <Typography
              variant="body1"
              fontFamily="monospace"
              sx={{
                margin: 0,
                padding: 0,
                whiteSpace: "pre-wrap",
                opacity: 0.8,
              }}
            >
              <span dangerouslySetInnerHTML={{ __html: line }} />
            </Typography>
          </Box>
        ))}

        <TextField
          focused
          multiline
          inputRef={inputRef}
          sx={{
            display: showInput ? "block" : "none",
            fontFamily: "monospace",
            "& .MuiInputBase-root": {
              color: "inherit",
              backgroundColor: "inherit",
              padding: 0,
              margin: 0,
              alignItems: "flex-start",
              width: "100%",

              "& fieldset": {
                border: "none !important",
                outline: "none !important",
              },

              "&::before": {
                content: "'$ '",
                color: theme.palette.primary.main,
                backgroundColor: theme.palette.secondary.main,
                marginRight: 1,
              },
            },

            "& .MuiInputBase-input": {
              color: "inherit",
              backgroundColor: "inherit",
            },
          }}
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.currentTarget.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              execute(inputValue);
              setInputValue("");
              e.preventDefault();
            }

            e.stopPropagation();
          }}
        />
      </Stack>
    </Dialog>
  );
};

const rightPad = (str: string, length: number) => {
  return str + " ".repeat(Math.max(0, length - str.length));
};

export default Terminal;
