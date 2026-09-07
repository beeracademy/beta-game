// Emoji dataset shared with the website's chat, loaded lazily from
// /emojiData.json (generated from unicode-emoji-json and emojilib).

interface EmojiItem {
  e: string; // emoji char
  n: string; // name
  c: string; // category id
  k: string; // keywords for search
}

interface EmojiCategory {
  id: string;
  name: string;
  icon: string;
  emojis: EmojiItem[];
}

interface EmojiData {
  categories: EmojiCategory[];
  all: EmojiItem[];
}

let cached: Promise<EmojiData> | null = null;

const loadEmojiData = (): Promise<EmojiData> => {
  if (!cached) {
    cached = fetch("/emojiData.json").then((res) => {
      if (!res.ok) {
        throw new Error(`Failed to load emoji data: ${res.status}`);
      }
      return res.json() as Promise<EmojiData>;
    });
  }
  return cached;
};

export { loadEmojiData };
export type { EmojiCategory, EmojiData, EmojiItem };
