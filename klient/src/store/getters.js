const getters = {
  getPlayList(state) {
    return state.playList;
  },
  getIsPlaying(state) {
    return state.isPlaying;
  },
  getCurrentPlayingSong(state) {
    return state.currentPlayingSong;
  },
  getAudioStatus(state) {
    return state.audioStatus;
  },
  getFavoriteSongs(state) {
    return state.favorites;
  },
};
export default getters;
