<template>
  <div id="app">
    <audio id="audio" ref="audio" type="audio" controls><source type="audio/mp3" id="audio-source" /></audio>

    <nav>
      <h1>WEBPLAYER</h1>
    </nav>
    <div class="user-playList" @click="setFavoritePlayList">
      <img class="playList-image" src="images/playList.png" alt="play list" />
    </div>
    <div class="covers-container">
      <album-cover v-for="album of albums" :key="album.title" :prop-source="album.source" :prop-title="album.title"></album-cover>
    </div>
    <div class="songs-container">
      <song-element
        v-for="song of this.$store.getters.getPlayList"
        :key="song.id"
        :prop-title="song.title"
        :prop-size="song.size"
        :prop-album="song.album"
        ref="songElement"
        @childrenChangeSong="songChange"
        @childrenNextSong="nextSong"
      ></song-element>
    </div>
    <audio-control @childrenNextSong="nextSong"></audio-control>
  </div>
</template>

<script>
import album from './components/album.vue';
import song from './components/song.vue';
import audioControl from './components/audioControl.vue';

export default {
  name: 'App',
  components: {
    'album-cover': album,
    'song-element': song,
    'audio-control': audioControl,
  },
  data() {
    return {
      albums: [],
      audio: null,
      audioSource: null,
    };
  },

  async mounted() {
    const albumsRespond = await fetch(`http://localhost:3000/albums`);
    const albumsParsedRespond = await albumsRespond.json();
    await this.$store.dispatch('fetchUpFavoriteSongs');

    for (let albumParsedRespond of albumsParsedRespond) {
      const album = {
        title: albumParsedRespond.title,
        source: `http://localhost:3000/${albumParsedRespond.cover}`,
      };
      this.albums.push(album);
    }

    const albumTitle = { title: this.albums[0].title };
    await this.$store.dispatch('fetchUpPlayList', albumTitle);

    this.audio = document.getElementById('audio');
    this.audioSource = document.getElementById('audio-source');
  },

  methods: {
    async songChange(newSong) {
      const { album, title } = this.$store.getters.getCurrentPlayingSong;
      const previusPlayingSong = this.$refs.songElement.find((element) => {
        if (album === element.album && title === element.title) {
          return element;
        }
      });

      if (previusPlayingSong) {
        console.log('jest priviussong');
        previusPlayingSong.currentSong = false;
        this.$store.dispatch('changeIsPlaying', true);
      } else if (album === '' || album !== newSong.album) {
        console.log('jestem tutaj');
        this.$store.dispatch('changeIsPlaying', true);
      }

      newSong.currentSong = true;
      const song = {
        album: newSong.album,
        title: newSong.title,
      };
      await this.$store.dispatch('changeCurrentPlayinSong', song);
    },
    async nextSong(direction) {
      const { album, title } = this.$store.getters.getCurrentPlayingSong;
      const indexOfCurrentSong = this.$refs.songElement.findIndex((element) => {
        if (album === element.album && title === element.title) {
          return element;
        }
      });
      let nextSong;
      const lengthOfPlayList = this.$refs.songElement.length;

      if (indexOfCurrentSong + direction < lengthOfPlayList && indexOfCurrentSong + direction >= 0) nextSong = this.$refs.songElement[indexOfCurrentSong + direction];
      else if (indexOfCurrentSong + direction === lengthOfPlayList) nextSong = this.$refs.songElement[0];
      else if (indexOfCurrentSong + direction < 0) nextSong = this.$refs.songElement[lengthOfPlayList - 1];
      this.audioSource.src = `http://localhost:3000/${nextSong.album}/${nextSong.title}`;

      await this.audio.load();
      this.audio.onloadeddata = () => {
        this.songChange(nextSong);
        this.audio.play();
        this.audio.onended = () => {
          this.nextSong(1);
        };
        this.audio.ontimeupdate = () => {
          if (this.audio.duration && this.audio.currentTime) {
            const audioStatus = {
              currentTime: this.audio.currentTime,
              duration: this.audio.duration,
            };
            this.$store.dispatch('changeAudioStatus', audioStatus);
          }
        };
      };
    },
    setFavoritePlayList() {
      this.$store.dispatch('setFavoritePlayList');
    },
  },
};
</script>

<style>
body {
  background-color: #1289a7;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #1289a7;
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  height: 100vh;
  align-items: center;
  justify-content: center;
}

nav {
  width: 100%;
  color: #c4e538;
  text-align: center;
  height: 70px;
}
.covers-container {
  height: 480px;
  width: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: auto;
  margin: 20px;
}

@media (max-width: 1235px) {
  .covers-container {
    height: 200px;
  }
}

::-webkit-scrollbar {
  width: 10px;
}
::-webkit-scrollbar-thumb {
  border-radius: 6px;
  background: linear-gradient(transparent, #c4e538);
  height: 10px;
}

.songs-container {
  display: flex;
  flex-direction: column;
  text-align: center;
  overflow-y: auto;
  color: #ddd;
  font-size: 19px;
  width: 750px;
  max-height: 480px;
  margin: 20px;
  padding: 20px 50px;
}

.user-playList {
  min-width: 90px;
  width: 7%;
  margin: 0 30px 0 0;
}

.playList-image {
  width: 100%;
}

.playList-image:hover {
  filter: opacity(50%);
  cursor: pointer;
}

audio {
  display: none;
}
</style>
