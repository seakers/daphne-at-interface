<template xmlns="http://www.w3.org/1999/html">
  <div id="settings" class="container-settings">
    <div class="header">
      <div class="header-logo">
        Settings
      </div>
    </div>
    <div class="nav">
      <ul class="nav-links">
        <li class="nav-links--link active tablinks" v-on:click="openTab($event, 'themes')">
          Themes
        </li>
        <li class="nav-links--link tablinks" v-on:click.prevent="openTab($event, 'sounds')">
          Sounds
        </li>
        <li class="nav-links--link tablinks" v-on:click="openTab($event, 'voice')">
          Voice
        </li>
      </ul>
    </div>

    <div id="themes" class="tabcontent" style="display: block">
      <div style="padding: 5px 5px 5px 5px">
        <div class="header-settings" style="margin-bottom: 20px">
          <button type="button" class="header--theme-button"
                  style="--theme-primary:black; --theme-secondary:#0AFEFF; cursor: pointer"
                  v-on:click.prevent="themeDark">
          </button>
          <button type="button" class="header--theme-button"
                  style="--theme-primary:white; --theme-secondary:#0AFEFF; cursor:pointer;"
                  v-on:click.prevent="themeLight">
          </button>
          <button type="button" class="header--theme-button"
                  style="--theme-primary:orange; --theme-secondary:white; cursor:pointer;"
                  v-on:click.prevent="themeLightOrange">
          </button>
          <button type="button" class="header--theme-button"
                  style="--theme-primary:orange; --theme-secondary:black; cursor:pointer;"
                  v-on:click.prevent="themeDarkOrange">
          </button>
        </div>
        <p class="is-title" style="margin-top: 60px">
        Anomaly Diagnosis
        </p>
        <p class="is-content" style="width: 100%">
          No anomalous symptoms detected.
        </p>
      </div>
    </div>

    <div id="sounds" class="tabcontent" style="display: none">
      <div style="text-align: center; vertical-align: center">
        <p v-if="isUnmute === true">Daphne is unmuted. Click to mute.</p>
        <p v-else>Daphne is muted. Click to unmute.</p>
        <button class="button theme-buttons" style="width: 10%;"
                v-on:click="this.switchMute">
          <i class="fas" v-bind:class="[ this.isUnmute ? 'fa-volume-up' : 'fa-volume-off' ]"></i>
        </button>
      </div>
    </div>

    <div id="voice" class="tabcontent" style="display: none">
      <p>Click on the dropdown menu to customize Daphne's voice.</p>
        <div style="text-align: center; vertical-align: center">
          <select class="dropdown" v-on:change="voiceSelected($event)" id="my-select">
            <option value="US English Female">US English Female</option>
            <option value="UK English Male">US English Male</option>
          </select>
        </div>
    </div>

  </div>
</template>

<script>

import {mapGetters} from 'vuex';

export default {
  name: "SettingsModal",
  data: function () {
    return {
      theme: "dark",
    }
  },
  computed: {
    ...mapGetters({
      isUnmute: 'getIsUnmute'
    }),
    isUnmute: {
      get() {
        return this.$store.state.daphne.isUnmute;
      },
      set(newValue) {
        this.$store.commit('setIsUnmute', newValue);
      },
    }
  },
  methods: {
    voiceSelected(event) {
      const selectElement = event.target;
      const value = selectElement.value;
      this.$store.commit('setDaphneVoice', value);
      },
    switchMute() {
      this.isUnmute = !this.isUnmute;
      this.$store.commit("setIsUnmute", this.isUnmute);
    },
    openTab (event, tabname){
      var i, tabcontent, tablinks;
      tabcontent = document.getElementsByClassName("tabcontent");
      for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
      }
      tablinks = document.getElementsByClassName("tablinks");
      for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace("active", "");
      }
      document.getElementById(tabname).style.display = "block";
      event.currentTarget.className += " active";
    },
    themeDark() {
      document.documentElement.dataset.theme = 'dark';
    },
    themeLight() {
      document.documentElement.dataset.theme = 'light';
    },
    themeLightOrange() {
      document.documentElement.dataset.theme = 'light_orange';
    },
    themeDarkOrange() {
      document.documentElement.dataset.theme = 'dark_orange';
    }
  },
  watch: {
    theme(theme) {
      document.documentElement.dataset.theme = theme;
    },
  }
}
</script>

<style scoped>

</style>