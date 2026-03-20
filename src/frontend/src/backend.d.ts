import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface Song {
    id: string;
    bpm: bigint;
    key: string;
    title: string;
    album: string;
    description: string;
    genre: string;
    thumbUrl: string;
    artist: string;
}
export interface Chord {
    romanNumeral: string;
    chordType: string;
    name: string;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface backendInterface {
    addFavorite(song: Song): Promise<void>;
    generateChordProgression(key: string, scaleType: string): Promise<Array<Chord>>;
    getArtistDetails(artistName: string): Promise<string>;
    getFavorites(): Promise<Array<Song>>;
    removeFavorite(songId: string): Promise<void>;
    searchSongs(searchTerm: string): Promise<string>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
}
