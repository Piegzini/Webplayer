const mutations = {
  setPlayList(state, songs) {
    state.playList = songs;
    console.log(state.playList);
  },
  setIsPlaying(state, isPlaying) {
    state.isPlaying = isPlaying;
  },
  setCurrentPlayingSong(state, currentPLayingSong) {
    state.currentPlayingSong = currentPLayingSong;
  },
  setAudioStatus(state, audioStatus) {
    state.audioStatus = audioStatus;
  },
  updateFavorites(state, favorites) {
    console.log(favorites);
    state.favorites = favorites;
  },
  setNewFavoriteSong(state, song) {
    state.favorites.push(song);
  },
  removeFromFavoriteSongs(state, indexOfSong) {
    state.favorites.splice(indexOfSong, 1);
    console.log(state.favorites);
  },
};

export default mutations;
