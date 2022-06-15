<template>
  <div @dblclick="startPlaying" class="song-bin" :class="{ 'current-song': currentSong }">
    <div class="oridinal-number">{{ album }}</div>
    <div class="song-title">{{ title }}</div>
    <div class="song-size">{{ megaBytes }}MB</div>

    <div v-if="this.$store.getters.getIsPlaying && currentSong" @click="stopPlaying" class="stop-play-button">
      <img src="images/pause.png" alt="Play" class="stop-play-image" />
    </div>
    <div v-else-if="(!this.$store.getters.getIsPlaying && currentSong) || !currentSong" @click="startPlaying" class="stop-play-button">
      <img src="images/play.png" alt="Play" class="stop-play-image" />
    </div>
    <div class="favorite-container">
      <img v-if="!this.inFavorites" @click="addToFavorites" src="images/unChoosenFav.png" alt="outOfFav" class="fav-icon" />
      <img v-else-if="this.inFavorites" @click="removeFromFavorites" src="images/choosenFav.png" alt="inFav" class="fav-icon" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'song',
  props: ['propTitle', 'propSize', 'propAlbum'],
  emits: ['childrenChangeSong', 'childrenNextSong'],
  data() {
    return {
      title: this.propTitle,
      size: this.propSize,
      album: this.propAlbum,
      currentSong: false,
      inFavorites: false,
      audioSource: null,
      audio: null,
    };
  },
  async mounted() {
    const { album, title } = this.$store.getters.getCurrentPlayingSong;
    if (title === this.title && album === this.album) this.currentSong = true;
    const favorites = this.$store.getters.getFavoriteSongs;
    const inFavorites = favorites.find((element) => {
      const song = JSON.stringify({ album: element.album, title: element.title });
      const thatSong = JSON.stringify({ album: this.album, title: this.title });

      if (song === thatSong) {
        return true;
      }
    });

    this.inFavorites = inFavorites;

    this.audioSource = document.getElementById('audio-source');
    this.audio = document.getElementById('audio');
  },
  computed: {
    megaBytes() {
      return Math.round((this.size / 1024 / 1024) * 100) / 100;
    },
  },
  methods: {
    async startPlaying() {
      const { album, title } = this.$store.getters.getCurrentPlayingSong;
      console.log(album, title);

      if (title !== this.title || album !== this.album) {
        this.audioSource.src = `http://localhost:3000/${this.album}/${this.title}`;
        this.$emit('childrenChangeSong', this);
        await this.audio.load();
        this.audio.onloadeddata = () => {
          this.currentSong = true;
          this.audio.play();
          this.audio.onended = () => {
            this.$emit('childrenNextSong', 1);
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
      } else if (title === this.title || album === this.album) {
        this.$store.dispatch('changeIsPlaying', true);
        this.audio.play();
      }

      console.log(this.$store.getters.getIsPlaying, this.currentSong);
    },
    stopPlaying() {
      this.audio.pause();
      this.$store.dispatch('changeIsPlaying', false);
      console.log(this.$store.getters.getIsPlaying, this.currentSong);
    },
    addToFavorites() {
      alert('dodaje piosenke do ulubionych');
      this.$store.dispatch('addToFavorites', {
        album: this.album,
        title: this.title,
        size: this.size,
      });
      this.inFavorites = true;
    },
    removeFromFavorites() {
      this.$store.dispatch('removeFromFavorites', {
        album: this.album,
        title: this.title,
      });
      this.inFavorites = false;
    },
  },
};
</script>
<style scoped>
.song-bin {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  min-height: 50px;
  margin: 5px;
  cursor: pointer;
  user-select: none;
}
.song-bin:hover,
.current-song {
  background-color: #0cb0da;
}

.oridinal-number {
  font-size: 11px;
  width: 20%;
  height: 100%;
  padding: 5px;
  border-right: 1px solid #c4e538;
}

@media (max-width: 768px) {
  .oridinal-number {
    font-size: 8px;
  }

  .song-title {
    font-size: 13px;
  }

  .song-size {
    font-size: 11px;
  }
}
.song-title {
  width: 55%;
  height: 100%;
  text-align: left;
  padding-left: 10px;
}

.song-size {
  width: 10%;
  padding: 5px;
  height: 100%;
}
.stop-play-button {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 7.5%;
  height: 100%;
}

.stop-play-image {
  width: 50%;
}

.favorite-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 7.5%;
  height: 100%;
}

.fav-icon {
  width: 50%;
}
</style>
