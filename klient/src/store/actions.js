const actions = {
  async fetchUpPlayList(context, albumTitle) {
    const songs = await fetch('http://localhost:3000/songs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(albumTitle),
    });

    const songsParsed = await songs.json();
    context.commit('setPlayList', songsParsed);
  },

  async fetchUpFavoriteSongs(context) {
    const favorites = await fetch('http://localhost:3000/favorites');
    const parsedFavorites = await favorites.json();
    context.commit('updateFavorites', parsedFavorites);
  },

  changeIsPlaying(context, isPlaying) {
    context.commit('setIsPlaying', isPlaying);
  },
  changeCurrentPlayinSong(context, { album, title }) {
    const currentPLayingSong = {
      album,
      title,
    };
    context.commit('setCurrentPlayingSong', currentPLayingSong);
  },

  changeAudioStatus(context, { currentTime, duration }) {
    const durationSeconds = Math.floor(duration % 60) < 10 ? `0${Math.floor(duration % 60)}` : `${Math.floor(duration % 60)}`;
    const durationMinutes = Math.floor(duration / 60) < 10 ? `0${Math.floor(duration / 60)}` : `${Math.floor(duration / 60)}`;

    const currentTimeSeconds = Math.floor(currentTime % 60) < 10 ? `0${Math.floor(currentTime % 60)}` : `${Math.floor(currentTime % 60)}`;
    const currentTimeMinutes = Math.floor(currentTime / 60) < 10 ? `0${Math.floor(currentTime / 60)}` : `${Math.floor(currentTime / 60)}`;

    const audioStatus = {
      currentTime: `${currentTimeMinutes}:${currentTimeSeconds}`,
      duration: `${durationMinutes}:${durationSeconds}`,
    };

    context.commit('setAudioStatus', audioStatus);
  },
  setFavoritePlayList(context) {
    const favoriteSongs = context.getters.getFavoriteSongs;
    console.log(favoriteSongs);
    context.commit('setPlayList', favoriteSongs);
  },
  async addToFavorites(context, song) {
    await fetch('http://localhost:3000/addToFavorites', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(song),
    });
    context.commit('setNewFavoriteSong', song);
  },
  async removeFromFavorites(context, song) {
    await fetch('http://localhost:3000/removeFromFavorites', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(song),
    });
    const stringifySong = JSON.stringify(song);
    console.log(context.getters.getFavoriteSongs);
    const indexOfSongToRemove = context.getters.getFavoriteSongs.findIndex((element) => {
      const stringifyElement = JSON.stringify({ album: element.album, title: element.title });
      if (stringifyElement === stringifySong) {
        return element;
      }
    });
    context.commit('removeFromFavoriteSongs', indexOfSongToRemove);
  },
};
export default actions;
