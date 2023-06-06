interface Command {
  name: string;
  description?: string;
  execute: (args: string[], buffer: Buffer) => void;
}

interface File {
  name: string;
  size?: string;
}

interface Buffer {
  write: (text: string) => void;
  clear: () => void;
}

export type { Buffer, Command, File };
