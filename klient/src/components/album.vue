<template>
  <div class="album-container">
    <img :src="sourceImage" alt="There should be an image" @click="choseAlbum" />
  </div>
</template>
<script>
export default {
  name: "album",
  props: ["propSource", "propTitle"],
  data() {
    return {
      sourceImage: this.propSource,
      title: this.propTitle,
    };
  },
  methods: {
    choseAlbum() {
      const albumTitle = { title: this.title };
      this.$store.dispatch("fetchUpPlayList", albumTitle);
    },
  },
};
</script>
<style scoped>
img {
  width: 95%;
  margin: 0;
}
img:hover {
  filter: opacity(50%);
  cursor: pointer;
}
</style>
