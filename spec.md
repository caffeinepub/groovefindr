# GrooveFindr - Music Key & Chord App

## Current State
New project, no existing application files.

## Requested Changes (Diff)

### Add
- Song search by title or artist name
- HTTP outcall to TheAudioDB free API to fetch song/artist metadata (singer, album, genre, BPM, musical key)
- Chord progression display derived from the song's musical key using music theory (I, II, III, IV, V, VI, VII diatonic chords)
- Guitar chord diagram cards for each chord in the progression
- Piano key highlight visualization for each chord
- Song detail panel with artist info, album art, key, BPM, genre
- Favorite/save songs locally

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Select `http-outcalls` component for backend API calls
2. Generate Motoko backend with:
   - searchSongs(query: Text) -> async Result with song list from TheAudioDB
   - getSongDetails(songId: Text) -> async Result with full song info
   - getChordProgression(key: Text, mode: Text) -> async chord list (computed locally)
3. Frontend:
   - Search page with input, results list
   - Song detail panel: artist photo, song info, key/BPM badges
   - Chord Progression section: large chord names, guitar diagrams, piano keyboard
   - Dark music-tech aesthetic matching design preview
