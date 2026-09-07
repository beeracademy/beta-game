import {
  type FunctionComponent,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  FaBeer,
  FaGamepad,
  FaLightbulb,
  FaPaw,
  FaPlane,
  FaRegFlag,
  FaRegHeart,
  FaRegSmile,
  FaRegUser,
  FaSearch,
  FaThLarge,
  FaTimes,
} from "react-icons/fa";
import {
  type EmojiCategory,
  type EmojiItem,
  loadEmojiData,
} from "../../utilities/emojiData";

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

// The website renders category tab icons via Font Awesome CSS classes
// (e.g. "far fa-smile"), which isn't loaded in the game. Map each category
// to the equivalent react-icons component instead.
const categoryIcons: Record<string, FunctionComponent> = {
  smileys: FaRegSmile,
  people: FaRegUser,
  animals: FaPaw,
  food: FaBeer,
  travel: FaPlane,
  activities: FaGamepad,
  objects: FaLightbulb,
  symbols: FaRegHeart,
  flags: FaRegFlag,
};


const EmojiPicker: FunctionComponent<EmojiPickerProps> = ({
  onSelect,
  onClose,
}) => {
  const [categories, setCategories] = useState<EmojiCategory[]>([]);
  const [allEmojis, setAllEmojis] = useState<EmojiItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState("smileys");
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredEmoji, setHoveredEmoji] = useState<EmojiItem | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const deferredQuery = useDeferredValue(searchQuery);

  useEffect(() => {
    let cancelled = false;
    loadEmojiData().then((data) => {
      if (cancelled) return;
      setCategories(data.categories);
      setAllEmojis(data.all);
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const t = setTimeout(() => searchInputRef.current?.focus(), 60);
    return () => clearTimeout(t);
  }, []);

  const searchResults = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    if (!q) return [];
    const tokens = q.split(/\s+/);
    const matches: EmojiItem[] = [];
    for (const item of allEmojis) {
      if (tokens.every((t) => item.k.includes(t))) {
        matches.push(item);
        if (matches.length >= 140) break;
      }
    }
    return matches;
  }, [deferredQuery, allEmojis]);

  const displayCategories = useMemo(() => {
    if (selectedCategory === "all") return categories;
    const found = categories.find((c) => c.id === selectedCategory);
    return found ? [found] : categories.length ? [categories[0]] : [];
  }, [selectedCategory, categories]);

  const isSearching = !!searchQuery.trim();

  return (
    <div className="chat-emoji-picker-container">
      <div className="chat-emoji-picker-top">
        <div className="chat-emoji-search-bar">
          <FaSearch />
          <input
            type="text"
            ref={searchInputRef}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search emojis..."
            className="chat-emoji-search-input"
          />
          {searchQuery && (
            <button
              type="button"
              className="chat-emoji-search-clear"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
            >
              <FaTimes />
            </button>
          )}
        </div>
        <button
          type="button"
          className="chat-emoji-close-btn"
          onClick={onClose}
          aria-label="Close emoji picker"
        >
          <FaTimes />
        </button>
      </div>

      {!isSearching && (
        <div className="chat-emoji-cat-nav">
          <button
            type="button"
            className={`chat-emoji-cat-tab${selectedCategory === "all" ? " active" : ""}`}
            onClick={() => setSelectedCategory("all")}
            title="All Emojis"
            aria-label="All Emojis"
          >
            <FaThLarge />
          </button>
          {categories.map((cat) => {
            const Icon = categoryIcons[cat.id];
            return (
              <button
                key={cat.id}
                type="button"
                className={`chat-emoji-cat-tab${selectedCategory === cat.id ? " active" : ""}`}
                onClick={() => setSelectedCategory(cat.id)}
                title={cat.name}
                aria-label={cat.name}
              >
                {Icon && <Icon />}
              </button>
            );
          })}
        </div>
      )}

      <div className="chat-emoji-picker-body">
        {!loaded && <div className="chat-emoji-cat-title">Loading emojis...</div>}

        {loaded && isSearching && (
          <>
            <div className="chat-emoji-cat-title">
              {searchResults.length > 0
                ? `Found ${searchResults.length}${searchResults.length >= 140 ? "+" : ""} emojis`
                : `No emojis matching "${searchQuery}"`}
            </div>
            <div className="chat-emoji-grid">
              {searchResults.map((item) => (
                <button
                  key={item.e}
                  type="button"
                  className="chat-emoji-btn"
                  onClick={() => onSelect(item.e)}
                  onMouseEnter={() => setHoveredEmoji(item)}
                  onMouseLeave={() => setHoveredEmoji(null)}
                  title={item.n}
                >
                  {item.e}
                </button>
              ))}
            </div>
          </>
        )}

        {loaded &&
          !isSearching &&
          displayCategories.map((cat) => (
            <div key={cat.id}>
              <div className="chat-emoji-cat-title">
                {cat.name}{" "}
                <span className="chat-emoji-cat-count">
                  ({cat.emojis.length})
                </span>
              </div>
              <div className="chat-emoji-grid">
                {cat.emojis.map((item) => (
                  <button
                    key={item.e}
                    type="button"
                    className="chat-emoji-btn"
                    onClick={() => onSelect(item.e)}
                    onMouseEnter={() => setHoveredEmoji(item)}
                    onMouseLeave={() => setHoveredEmoji(null)}
                    title={item.n}
                  >
                    {item.e}
                  </button>
                ))}
              </div>
            </div>
          ))}
      </div>

      <div className="chat-emoji-picker-preview">
        {hoveredEmoji ? (
          <>
            <span className="chat-preview-emoji">{hoveredEmoji.e}</span>
            <span className="chat-preview-name">{hoveredEmoji.n}</span>
          </>
        ) : (
          <span className="chat-preview-tip">
            Click to insert • Search by keyword
          </span>
        )}
      </div>
    </div>
  );
};

export default EmojiPicker;
