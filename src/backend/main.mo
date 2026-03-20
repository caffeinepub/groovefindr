import Text "mo:core/Text";
import List "mo:core/List";
import Map "mo:core/Map";
import Blob "mo:core/Blob";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Array "mo:core/Array";
import OutCall "http-outcalls/outcall";

actor {
  // Data Types
  type Song = {
    id : Text;
    title : Text;
    artist : Text;
    album : Text;
    genre : Text;
    bpm : Nat;
    key : Text;
    thumbUrl : Text;
    description : Text;
  };

  type Artist = {
    name : Text;
    photoUrl : Text;
    biography : Text;
    genre : Text;
    country : Text;
  };

  type Chord = {
    name : Text;
    chordType : Text;
    romanNumeral : Text;
  };

  // Song module with compare functions
  module Song {
    public func compare(song1 : Song, song2 : Song) : Order.Order {
      switch (Text.compare(song1.title, song2.title)) {
        case (#equal) { Text.compare(song1.artist, song2.artist) };
        case (order) { order };
      };
    };

    public func compareByArtist(song1 : Song, song2 : Song) : Order.Order {
      Text.compare(song1.artist, song2.artist);
    };
  };

  // Favorites Storage
  let favorites = Map.empty<Principal, List.List<Song>>();

  // Search Songs - Just tunnel JSON to frontend for parsing
  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  func getJsonResponseFromApi(apiUrl : Text) : async Text {
    await OutCall.httpGetRequest(apiUrl, [], transform);
  };

  public shared ({ caller }) func searchSongs(searchTerm : Text) : async Text {
    let apiUrl = "https://www.theaudiodb.com/api/v1/json/2/searchtrack.php?s=" #searchTerm # "&t=" #searchTerm;
    await getJsonResponseFromApi(apiUrl);
  };

  public shared ({ caller }) func getArtistDetails(artistName : Text) : async Text {
    let apiUrl = "https://www.theaudiodb.com/api/v1/json/2/search.php?s=" #artistName;
    await getJsonResponseFromApi(apiUrl);
  };

  // Chord Progressions (local calculation)
  public shared ({ caller }) func generateChordProgression(key : Text, scaleType : Text) : async [Chord] {
    let majorChordTypes : [Text] = ["major", "minor", "minor", "major", "major", "minor", "diminished"];
    let minorChordTypes : [Text] = ["minor", "diminished", "major", "minor", "minor", "major", "major"];

    let chordNames = ["C", "D", "E", "F", "G", "A", "B"];
    let romanNumerals = ["I", "II", "III", "IV", "V", "VI", "VII"];

    let keyIndex = chordNames.findIndex(func(name) { name == key });

    switch (keyIndex) {
      case (null) { Runtime.trap("Invalid key") };
      case (?index) {
        let chordTypes = switch (scaleType) {
          case ("major") { majorChordTypes };
          case ("minor") { minorChordTypes };
          case (_) { Runtime.trap("Invalid scale type") };
        };

        let chords = List.empty<Chord>();

        for (chordIndex in chordNames.keys()) {
          let mappedIndex = (index + chordIndex) % 7;
          chords.add({
            name = chordNames[mappedIndex];
            chordType = chordTypes[chordIndex];
            romanNumeral = romanNumerals[chordIndex];
          });
        };

        chords.toArray();
      };
    };
  };

  // Favorites Management
  public shared ({ caller }) func addFavorite(song : Song) : async () {
    let favs = switch (favorites.get(caller)) {
      case (null) { List.empty<Song>() };
      case (?list) { list };
    };
    if (favs.values().any(func(fav) { fav.id == song.id })) {
      Runtime.trap("Song is already in favorites.");
    };
    favs.add(song);
    favorites.add(caller, favs);
  };

  public shared ({ caller }) func removeFavorite(songId : Text) : async () {
    let favs = switch (favorites.get(caller)) {
      case (null) { Runtime.trap("No favorites found.") };
      case (?list) { list };
    };
    let filteredFavs = favs.filter(func(fav) { fav.id != songId });
    if (filteredFavs.size() == favs.size()) { Runtime.trap("Song not found in favorites.") };
    favorites.add(caller, filteredFavs);
  };

  public query ({ caller }) func getFavorites() : async [Song] {
    switch (favorites.get(caller)) {
      case (null) { [] };
      case (?list) { list.toArray().sort() };
    };
  };
};
