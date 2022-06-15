<template>
  <div class="control-panel">
    <div id="current-song-name">
      <p>{{ this.$store.getters.getCurrentPlayingSong.album }} - {{ this.$store.getters.getCurrentPlayingSong.title }}</p>
    </div>

    <div id="bars-container">
      <input @input="volumeChange" type="range" id="volume-range" min="0" max="50" v-model="volume" />
      <div id="progress-bar">
        <p class="proggres-bar-info">{{ this.$store.getters.getAudioStatus.currentTime }}</p>
        <input type="range" id="progress-range" @input="scrollSong" min="0" :max="this.audio.duration" :value="this.audio.currentTime" ref="range" />
      </div>
      <p class="proggres-bar-info">{{ this.$store.getters.getAudioStatus.duration }}</p>
    </div>
    <div class="previous-next-song-button">
      <img @click="previousSong" src="images/previous.png" alt="" class="previous-next-image" />
    </div>
    <div class="play-stop-button">
      <img class="stop-play-image" @click="startPlaying" v-if="!this.$store.getters.getIsPlaying" src="images/play.png" alt="Play" />
      <img class="stop-play-image" @click="stopPlaying" v-else-if="this.$store.getters.getIsPlaying" src="images/pause.png" alt="Pause" />
    </div>
    <div class="previous-next-song-button">
      <img @click="nextSong" src="images/next.png" alt="" class="previous-next-image" />
    </div>
  </div>
</template>
<script>
export default {
  name: 'audioControl',
  emits: ['childrenNextSong'],
  data() {
    return {
      audio: null,
      rangeValue: null,
      volume: 0,
    };
  },
  mounted() {
    this.audio = document.getElementById('audio');
    this.volume = this.audio.volume * 50;
  },
  methods: {
    volumeChange() {
      this.audio.volume = this.volume / 100;
      console.log(this.audio.volume);
    },
    stopPlaying() {
      console.log('loolek');
      this.audio.pause();
      this.$store.dispatch('changeIsPlaying', false);
    },
    startPlaying() {
      this.audio.play();
      this.$store.dispatch('changeIsPlaying', true);
    },
    nextSong() {
      this.$emit('childrenNextSong', 1);
    },
    previousSong() {
      this.$emit('childrenNextSong', -1);
    },
    scrollSong() {
      this.audio.currentTime = this.$refs.range.value;
    },
  },
};
</script>
<style scoped>
.control-panel {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  width: 60%;
  height: 200px;
}

#bars-container {
  width: 100%;
  height: 30px;
  display: flex;
  justify-content: left;
  align-items: center;
  align-content: center;
}

.proggres-bar-info {
  margin: 0px 15px;
  font-size: 14px;
  color: #ddd;
}

#progress-bar {
  margin-left: 15.5%;
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 40%;
  min-width: 200px;
}
#progress-range {
  width: 100%;
  min-width: 100px;
}

#volume-range {
  width: 10%;
}

input[type='range'] {
  -webkit-appearance: none;
  margin: 18px 0;
  width: 100%;
}
input[type='range']:focus {
  outline: none;
}

input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  border: 1px solid #000000;
  height: 16px;
  width: 16px;
  border-radius: 50%;
  background: #ddd;
  cursor: pointer;
  margin-top: -5px; /* You need to specify a margin in Chrome, but in Firefox and IE it is automatic */
  box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d; /* Add cool effects to your sliders! */
}
input[type='range']::-webkit-slider-runnable-track {
  width: 100%;
  height: 8.4px;
  cursor: pointer;
  box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
  background: #ddd;
  border-radius: 0px;
  border: 0.2px solid #010101;
}

.play-stop-button {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 12%;
  height: 100px;

  max-width: 65px;
}

.stop-play-image {
  width: 100%;
  cursor: pointer;
}

.previous-next-song-button {
  display: flex;
  justify-content: center;
  align-items: center;

  width: 10%;
  height: 90px;

  max-width: 60px;
}

.previous-next-image {
  width: 100%;
  cursor: pointer;
}
img:hover {
  filter: opacity(50%);
}

#current-song-name {
  width: 100%;
  height: 40px;
  text-align: center;
  color: white;
  font-size: 19px;
  margin-bottom: 20px;
}

#timer {
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  width: 25%;
  height: 50px;
  margin: 0 10px 0 10px;
  font-size: 20px;
}
</style>
