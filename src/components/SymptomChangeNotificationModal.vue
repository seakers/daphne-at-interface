<template>
  <div class="message-body">
    <div style="justify-content: center">
      <p style="text-align: center">I have detected a change in the measurements.</p>
      <div style="display: flex; justify-content: center;">
        <button class="button" style="margin-top:20px; width: 30%; border-color: #0AFEFF; color: #0AFEFF; background: #002E2E" v-on:click.prevent="closeModal">Ok
        </button>
      </div>
    </div>
  </div>
</template>

<script>

import {mapGetters} from "vuex";

export default {
  name: "SettingsModal",
  data: function () {
    return {
      theme: "dark"
    }
  },
  computed: {
    ...mapGetters({
      symptomsList: 'getSymptomsList'
    })
  },
  methods: {
    closeModal(state) {
      let symp_list =  this.symptomsList.map(item => item['detection_text']).join('<br><br>');

      this.$store.commit('addDialoguePiece', {
        "voice_message": "Attention an Anomaly has been Detected, here is the signature",
        "visual_message_type": ["text"],
        "visual_message": ["Attention an Anomaly has been Detected, here is the signature:<br><br>"+symp_list], // Mapping each item to its detection_text property
        "writer": "daphne"
      });
        this.$store.commit('closeModal');
    },
  },
  watch: {
  }
}
</script>

<style scoped>

</style>
