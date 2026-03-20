import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toaster } from "@/components/ui/sonner";
import {
  ChevronDown,
  Compass,
  Heart,
  Library,
  Loader2,
  Music2,
  Search,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { Chord, Song } from "./backend.d";
import { GuitarChord } from "./components/GuitarChord";
import { PianoChord } from "./components/PianoChord";
import {
  useAddFavorite,
  useArtistDetails,
  useChordProgression,
  useFavorites,
  useRemoveFavorite,
  useSearchSongs,
} from "./hooks/useQueries";

type Page = "discover" | "library" | "favorites";

const KEYS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const SCALE_TYPES = ["major", "minor"];

// Sample songs for initial display
const SAMPLE_SONGS: Song[] = [
  {
    id: "sample-1",
    bpm: BigInt(120),
    key: "C",
    title: "Bohemian Rhapsody",
    album: "A Night at the Opera",
    description: "A classic rock masterpiece",
    genre: "Rock",
    thumbUrl: "",
    artist: "Queen",
  },
  {
    id: "sample-2",
    bpm: BigInt(95),
    key: "Am",
    title: "Hotel California",
    album: "Hotel California",
    description: "Iconic Eagles track",
    genre: "Rock",
    thumbUrl: "",
    artist: "Eagles",
  },
  {
    id: "sample-3",
    bpm: BigInt(108),
    key: "G",
    title: "Stairway to Heaven",
    album: "Led Zeppelin IV",
    description: "Epic progressive rock journey",
    genre: "Rock",
    thumbUrl: "",
    artist: "Led Zeppelin",
  },
  {
    id: "sample-4",
    bpm: BigInt(75),
    key: "F#m",
    title: "Smells Like Teen Spirit",
    album: "Nevermind",
    description: "Grunge generation anthem",
    genre: "Grunge",
    thumbUrl: "",
    artist: "Nirvana",
  },
];

function SongListItem({
  song,
  isSelected,
  onClick,
  index,
}: {
  song: Song;
  isSelected: boolean;
  onClick: () => void;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      data-ocid={`song.item.${index + 1}`}
      onClick={onClick}
      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all group ${
        isSelected
          ? "bg-primary/20 border border-primary/30"
          : "hover:bg-secondary/50 border border-transparent"
      }`}
    >
      {/* Thumb */}
      <div className="w-12 h-12 rounded-md flex-shrink-0 overflow-hidden bg-secondary">
        {song.thumbUrl ? (
          <img
            src={song.thumbUrl}
            alt={song.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Music2 className="w-5 h-5 text-muted-foreground" />
          </div>
        )}
      </div>
      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate text-foreground">
          {song.title}
        </p>
        <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
        <div className="flex items-center gap-2 mt-1">
          {song.key && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-primary/20 text-purple font-mono">
              {song.key}
            </span>
          )}
          {Number(song.bpm) > 0 && (
            <span className="text-xs text-muted-foreground">
              {String(song.bpm)} BPM
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function ArtistSection({ artistName }: { artistName: string }) {
  const { data: artist, isLoading } = useArtistDetails(artistName);

  if (isLoading)
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-sm py-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading artist...
      </div>
    );
  if (!artist) return null;

  return (
    <div className="flex items-center gap-4 mb-4">
      {artist.thumbUrl && (
        <img
          src={artist.thumbUrl}
          alt={artist.name}
          className="w-16 h-16 rounded-full object-cover border-2 border-primary/30"
        />
      )}
      <div>
        <h3 className="font-display font-semibold text-lg text-foreground">
          {artist.name}
        </h3>
        <div className="flex items-center gap-2 flex-wrap">
          {artist.genre && (
            <Badge variant="secondary" className="text-xs">
              {artist.genre}
            </Badge>
          )}
          {artist.country && (
            <span className="text-xs text-muted-foreground">
              {artist.country}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function ChordCard({ chord, index }: { chord: Chord; index: number }) {
  const numeral = chord.romanNumeral;
  const name = chord.name;
  const type = chord.chordType;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.06 }}
      className="bg-card border border-border rounded-xl p-4 flex flex-col items-center gap-3"
    >
      {/* Roman numeral with gradient */}
      <div
        className="text-3xl font-display font-bold"
        style={{
          background:
            "linear-gradient(135deg, oklch(var(--primary)), oklch(var(--accent)))",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        {numeral}
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-foreground">{name}</p>
        <p className="text-xs text-muted-foreground">{type}</p>
      </div>
      {/* Guitar diagram */}
      <GuitarChord chord={chord} />
      {/* Piano */}
      <PianoChord chord={chord} />
    </motion.div>
  );
}

function ChordProgressionSection({
  songKey,
}: {
  songKey: string;
}) {
  const [selectedKey, setSelectedKey] = useState(songKey || "");
  const [scaleType, setScaleType] = useState<string>("major");
  const [shouldFetch, setShouldFetch] = useState(!!songKey);

  useEffect(() => {
    if (songKey) {
      // Parse key like "Am" -> key=A, scale=minor; "C" -> C major
      const minorMatch = songKey.match(/^([A-G][#b]?)m$/);
      if (minorMatch) {
        setSelectedKey(minorMatch[1]);
        setScaleType("minor");
      } else {
        setSelectedKey(songKey.replace(/maj$/i, ""));
        setScaleType("major");
      }
      setShouldFetch(true);
    }
  }, [songKey]);

  const {
    data: chords,
    isLoading,
    error,
  } = useChordProgression(selectedKey, scaleType, shouldFetch);

  return (
    <div>
      <h3 className="font-display font-semibold text-lg mb-3 text-foreground">
        Chord Progression
      </h3>
      {/* Key selector */}
      {!songKey && (
        <div className="flex items-center gap-3 mb-4">
          <Select value={selectedKey} onValueChange={setSelectedKey}>
            <SelectTrigger data-ocid="chord.select" className="w-28">
              <SelectValue placeholder="Key" />
            </SelectTrigger>
            <SelectContent>
              {KEYS.map((k) => (
                <SelectItem key={k} value={k}>
                  {k}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={scaleType} onValueChange={setScaleType}>
            <SelectTrigger data-ocid="scale.select" className="w-28">
              <SelectValue placeholder="Scale" />
            </SelectTrigger>
            <SelectContent>
              {SCALE_TYPES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            data-ocid="chord.generate_button"
            onClick={() => setShouldFetch(true)}
            disabled={!selectedKey}
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Generate
          </Button>
        </div>
      )}
      {songKey && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-muted-foreground">Key detected:</span>
          <Badge className="bg-primary/20 text-purple border-primary/30">
            {songKey}
          </Badge>
          <div className="flex gap-2 ml-auto">
            <Select
              value={selectedKey}
              onValueChange={(v) => {
                setSelectedKey(v);
                setShouldFetch(true);
              }}
            >
              <SelectTrigger
                data-ocid="chord.override_select"
                className="w-24 h-7 text-xs"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {KEYS.map((k) => (
                  <SelectItem key={k} value={k}>
                    {k}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={scaleType}
              onValueChange={(v) => {
                setScaleType(v);
                setShouldFetch(true);
              }}
            >
              <SelectTrigger
                data-ocid="scale.override_select"
                className="w-24 h-7 text-xs"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SCALE_TYPES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {isLoading && (
        <div
          data-ocid="chord.loading_state"
          className="flex items-center gap-2 text-muted-foreground py-4"
        >
          <Loader2 className="w-4 h-4 animate-spin" />
          Generating chords...
        </div>
      )}
      {error && (
        <div
          data-ocid="chord.error_state"
          className="text-destructive text-sm py-2"
        >
          Failed to generate chord progression.
        </div>
      )}
      {chords && chords.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {chords.map((chord, i) => (
            <ChordCard key={`${chord.name}-${i}`} chord={chord} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

function SongDetailPanel({
  song,
  onClose,
}: {
  song: Song;
  onClose: () => void;
}) {
  const { data: favorites } = useFavorites();
  const addFav = useAddFavorite();
  const removeFav = useRemoveFavorite();

  const isFav = favorites?.some((f) => f.id === song.id) ?? false;

  const toggleFav = useCallback(() => {
    if (isFav) {
      removeFav.mutate(song.id, {
        onSuccess: () => toast.success("Removed from favorites"),
        onError: () => toast.error("Failed to remove"),
      });
    } else {
      addFav.mutate(song, {
        onSuccess: () => toast.success("Added to favorites!"),
        onError: () => toast.error("Failed to add"),
      });
    }
  }, [isFav, song, addFav, removeFav]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="h-full flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-xl text-foreground">
          Song Details
        </h2>
        <Button
          data-ocid="song_detail.close_button"
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="w-8 h-8"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-5 pr-2">
          {/* Artist info */}
          <ArtistSection artistName={song.artist} />

          {/* Song info card */}
          <div className="bg-secondary/50 rounded-xl p-4 space-y-3">
            {song.thumbUrl && (
              <img
                src={song.thumbUrl}
                alt={song.title}
                className="w-full h-40 object-cover rounded-lg"
              />
            )}
            <div>
              <h3 className="font-display font-bold text-xl text-foreground">
                {song.title}
              </h3>
              <p className="text-muted-foreground text-sm">{song.album}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {song.key && (
                <Badge className="bg-primary/20 text-purple border border-primary/30 font-mono">
                  Key: {song.key}
                </Badge>
              )}
              {Number(song.bpm) > 0 && (
                <Badge variant="secondary">{String(song.bpm)} BPM</Badge>
              )}
              {song.genre && (
                <Badge
                  className="bg-accent/10 border border-accent/30"
                  style={{ color: "oklch(var(--accent))" }}
                >
                  {song.genre}
                </Badge>
              )}
            </div>
            {song.description && (
              <p className="text-sm text-muted-foreground line-clamp-3">
                {song.description}
              </p>
            )}
          </div>

          {/* Favorite button */}
          <Button
            data-ocid="song_detail.toggle_favorite_button"
            onClick={toggleFav}
            disabled={addFav.isPending || removeFav.isPending}
            className={`w-full gap-2 ${
              isFav
                ? "bg-destructive/20 text-destructive border border-destructive/30 hover:bg-destructive/30"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            {addFav.isPending || removeFav.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Heart className={`w-4 h-4 ${isFav ? "fill-current" : ""}`} />
            )}
            {isFav ? "Remove from Favorites" : "Add to Favorites"}
          </Button>

          {/* Chord Progression */}
          <div className="border-t border-border pt-4">
            <ChordProgressionSection songKey={song.key} />
          </div>
        </div>
      </ScrollArea>
    </motion.div>
  );
}

function FavoritesPage({
  onSelectSong,
}: {
  onSelectSong: (song: Song) => void;
}) {
  const { data: favorites, isLoading } = useFavorites();
  const removeFav = useRemoveFavorite();

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h1 className="font-display font-bold text-3xl text-foreground">
          Favorites
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Your saved songs collection
        </p>
      </div>

      {isLoading && (
        <div
          data-ocid="favorites.loading_state"
          className="flex items-center gap-2 text-muted-foreground"
        >
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading favorites...
        </div>
      )}

      {!isLoading && (!favorites || favorites.length === 0) && (
        <div
          data-ocid="favorites.empty_state"
          className="flex-1 flex flex-col items-center justify-center text-center gap-4"
        >
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
            <Heart className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <p className="text-foreground font-semibold">No favorites yet</p>
            <p className="text-muted-foreground text-sm">
              Search for songs and heart them to save here
            </p>
          </div>
        </div>
      )}

      {favorites && favorites.length > 0 && (
        <ScrollArea className="flex-1">
          <div className="space-y-2 pr-2">
            {favorites.map((song, i) => (
              <div
                key={song.id}
                data-ocid={`favorites.item.${i + 1}`}
                className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border hover:border-primary/30 transition-all group"
              >
                <button
                  type="button"
                  className="flex-1 flex items-center gap-3 cursor-pointer"
                  onClick={() => onSelectSong(song)}
                  onKeyDown={(e) => e.key === "Enter" && onSelectSong(song)}
                >
                  <div className="w-12 h-12 rounded-md bg-secondary flex-shrink-0 overflow-hidden">
                    {song.thumbUrl ? (
                      <img
                        src={song.thumbUrl}
                        alt={song.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music2 className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-foreground truncate">
                      {song.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {song.artist}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {song.key && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-primary/20 text-purple font-mono">
                          {song.key}
                        </span>
                      )}
                      {Number(song.bpm) > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {String(song.bpm)} BPM
                        </span>
                      )}
                    </div>
                  </div>
                </button>
                <Button
                  data-ocid={`favorites.delete_button.${i + 1}`}
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    removeFav.mutate(song.id, {
                      onSuccess: () => toast.success("Removed"),
                    })
                  }
                  className="w-8 h-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

function DiscoverPage({
  selectedSong,
  onSelectSong,
}: {
  selectedSong: Song | null;
  onSelectSong: (song: Song | null) => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedTerm(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: results, isLoading: isSearching } =
    useSearchSongs(debouncedTerm);

  const displaySongs = debouncedTerm && results ? results : SAMPLE_SONGS;
  const isShowingSamples = !debouncedTerm;

  return (
    <div className="h-full flex gap-4">
      {/* Left: Search + Results */}
      <div
        className={`flex flex-col ${selectedSong ? "w-80 flex-shrink-0" : "flex-1"}  transition-all`}
      >
        <div className="mb-4">
          {!selectedSong && (
            <>
              <h1 className="font-display font-bold text-3xl text-foreground">
                Discover Music
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Search songs, identify keys & chords
              </p>
            </>
          )}
        </div>

        {/* Search bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            data-ocid="search.input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search songs, artists..."
            className="pl-10 bg-secondary border-border focus:border-primary/50"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setDebouncedTerm("");
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Results */}
        {isSearching && (
          <div
            data-ocid="search.loading_state"
            className="flex items-center gap-2 text-muted-foreground text-sm py-2"
          >
            <Loader2 className="w-4 h-4 animate-spin" />
            Searching...
          </div>
        )}

        {isShowingSamples && (
          <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider font-semibold">
            Popular tracks
          </p>
        )}

        <ScrollArea className="flex-1">
          <div className="space-y-1 pr-2">
            {displaySongs.map((song, i) => (
              <SongListItem
                key={song.id}
                song={song}
                index={i}
                isSelected={selectedSong?.id === song.id}
                onClick={() =>
                  onSelectSong(selectedSong?.id === song.id ? null : song)
                }
              />
            ))}
            {debouncedTerm && !isSearching && results?.length === 0 && (
              <div
                data-ocid="search.empty_state"
                className="text-center py-8 text-muted-foreground"
              >
                <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No songs found for "{debouncedTerm}"</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Right: Song Detail */}
      <AnimatePresence>
        {selectedSong && (
          <motion.div
            key="detail"
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            className="flex-1 bg-card border border-border rounded-xl p-5 overflow-hidden"
          >
            <SongDetailPanel
              song={selectedSong}
              onClose={() => onSelectSong(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LibraryPage() {
  const [selectedKey, setSelectedKey] = useState("C");
  const [scaleType, setScaleType] = useState("major");
  const [shouldFetch, setShouldFetch] = useState(false);
  const { data: chords, isLoading } = useChordProgression(
    selectedKey,
    scaleType,
    shouldFetch,
  );

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h1 className="font-display font-bold text-3xl text-foreground">
          Chord Library
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Explore chord progressions by key and scale
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl p-5 mb-5">
        <h3 className="font-display font-semibold mb-3">
          Generate Chord Progression
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={selectedKey} onValueChange={setSelectedKey}>
            <SelectTrigger data-ocid="library.key_select" className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {KEYS.map((k) => (
                <SelectItem key={k} value={k}>
                  {k}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={scaleType} onValueChange={setScaleType}>
            <SelectTrigger data-ocid="library.scale_select" className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SCALE_TYPES.map((s) => (
                <SelectItem key={s} value={s} className="capitalize">
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            data-ocid="library.generate_button"
            onClick={() => {
              setShouldFetch(false);
              setTimeout(() => setShouldFetch(true), 0);
            }}
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
          >
            <ChevronDown className="w-4 h-4" />
            Generate
          </Button>
        </div>
      </div>

      {isLoading && (
        <div
          data-ocid="library.loading_state"
          className="flex items-center gap-2 text-muted-foreground"
        >
          <Loader2 className="w-5 h-5 animate-spin" />
          Generating progression...
        </div>
      )}

      {chords && chords.length > 0 && (
        <ScrollArea className="flex-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 pr-2">
            {chords.map((chord, i) => (
              <ChordCard key={`${chord.name}-${i}`} chord={chord} index={i} />
            ))}
          </div>
        </ScrollArea>
      )}

      {!isLoading && !chords && (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, oklch(var(--primary) / 0.2), oklch(var(--accent) / 0.2))",
            }}
          >
            <Library
              className="w-10 h-10"
              style={{ color: "oklch(var(--primary))" }}
            />
          </div>
          <div>
            <p className="font-semibold text-foreground">
              Select a key and generate
            </p>
            <p className="text-muted-foreground text-sm">
              Explore chord progressions for any key
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState<Page>("discover");
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);

  const handleSelectSong = useCallback((song: Song | null) => {
    setSelectedSong(song);
    if (song) setPage("discover");
  }, []);

  const navItems: { id: Page; label: string; icon: React.ReactNode }[] = [
    {
      id: "discover",
      label: "Discover",
      icon: <Compass className="w-4 h-4" />,
    },
    { id: "library", label: "Library", icon: <Library className="w-4 h-4" /> },
    {
      id: "favorites",
      label: "Favorites",
      icon: <Heart className="w-4 h-4" />,
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <header className="h-14 border-b border-border bg-card/50 backdrop-blur-sm flex items-center px-6 gap-6 flex-shrink-0 sticky top-0 z-50">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, oklch(var(--primary)), oklch(var(--accent)))",
            }}
          >
            <Music2 className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-lg text-foreground">
            GrooveFindr
          </span>
        </div>

        {/* Nav */}
        <nav className="flex items-center gap-1 ml-4">
          {navItems.map((item) => (
            <button
              type="button"
              key={item.id}
              data-ocid={`nav.${item.id}_link`}
              onClick={() => setPage(item.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                page === item.id
                  ? "bg-primary/20 text-purple"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      {/* Main */}
      <main className="flex-1 flex overflow-hidden">
        <div className="flex-1 p-6 overflow-hidden">
          <AnimatePresence mode="wait">
            {page === "discover" && (
              <motion.div
                key="discover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full"
              >
                <DiscoverPage
                  selectedSong={selectedSong}
                  onSelectSong={handleSelectSong}
                />
              </motion.div>
            )}
            {page === "library" && (
              <motion.div
                key="library"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full"
              >
                <LibraryPage />
              </motion.div>
            )}
            {page === "favorites" && (
              <motion.div
                key="favorites"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full"
              >
                <FavoritesPage onSelectSong={handleSelectSong} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-3 px-6 text-center flex-shrink-0">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()}. Built with{" "}
          <span className="text-primary">♥</span> using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </footer>

      <Toaster />
    </div>
  );
}
