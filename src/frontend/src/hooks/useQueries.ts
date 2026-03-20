import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Chord, Song } from "../backend.d";
import { useActor } from "./useActor";

export function useSearchSongs(term: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Song[]>({
    queryKey: ["search", term],
    queryFn: async () => {
      if (!actor || !term.trim()) return [];
      const json = await actor.searchSongs(term);
      const parsed = JSON.parse(json) as { track?: any[] };
      const tracks = parsed.track ?? [];
      return tracks.map((t: any) => ({
        id: t.idTrack ?? t.idtrack ?? String(Math.random()),
        bpm: BigInt(Math.round(Number(t.intTempo ?? t.intbpm ?? 0))),
        key: t.strMusicKey ?? t.strmusickey ?? "",
        title: t.strTrack ?? t.strtrack ?? "Unknown",
        album: t.strAlbum ?? t.stralbum ?? "Unknown",
        description: t.strDescriptionEN ?? t.strdescriptionen ?? "",
        genre: t.strGenre ?? t.strgenre ?? "Unknown",
        thumbUrl: t.strTrackThumb ?? t.strtrackthumb ?? "",
        artist: t.strArtist ?? t.strartist ?? "Unknown",
      }));
    },
    enabled: !!actor && !isFetching && !!term.trim(),
  });
}

export function useArtistDetails(artistName: string) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["artist", artistName],
    queryFn: async () => {
      if (!actor || !artistName.trim()) return null;
      const json = await actor.getArtistDetails(artistName);
      const parsed = JSON.parse(json) as { artists?: any[] };
      const artist = parsed.artists?.[0];
      if (!artist) return null;
      return {
        name: artist.strArtist ?? artistName,
        genre: artist.strGenre ?? "",
        country: artist.strCountry ?? "",
        biography: artist.strBiographyEN ?? "",
        thumbUrl: artist.strArtistThumb ?? artist.strartistthumb ?? "",
        logo: artist.strArtistLogo ?? "",
        banner: artist.strArtistBanner ?? "",
      };
    },
    enabled: !!actor && !isFetching && !!artistName.trim(),
  });
}

export function useChordProgression(
  key: string,
  scaleType: string,
  enabled: boolean,
) {
  const { actor, isFetching } = useActor();
  return useQuery<Chord[]>({
    queryKey: ["chords", key, scaleType],
    queryFn: async () => {
      if (!actor || !key) return [];
      return actor.generateChordProgression(key, scaleType);
    },
    enabled: !!actor && !isFetching && enabled && !!key,
  });
}

export function useFavorites() {
  const { actor, isFetching } = useActor();
  return useQuery<Song[]>({
    queryKey: ["favorites"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFavorites();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddFavorite() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (song: Song) => {
      if (!actor) throw new Error("No actor");
      return actor.addFavorite(song);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["favorites"] }),
  });
}

export function useRemoveFavorite() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (songId: string) => {
      if (!actor) throw new Error("No actor");
      return actor.removeFavorite(songId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["favorites"] }),
  });
}
