const state = {
  playList: [],
  isPlaying: false,
  currentPlayingSong: {
    album: '',
    title: '',
  },
  audioStatus: {
    currentTime: `00:00`,
    duration: `00:00`,
  },
  favorites: [],
};

export default state;
