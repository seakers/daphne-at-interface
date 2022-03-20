<template>
  <div>
  <div class="message-body">
    <div class="modal-survey">
      <p><b>Answer the following questions. Click on Done <i>ONLY</i> after submitting your answer.</b></p>
      <section class="modal-card-body">
        <iframe style="width: 100%; height: 500px" src="https://tamu.qualtrics.com/jfe/form/SV_b1s8iAlcslQSMuO"></iframe>
      </section>
      <div style="text-align: center">
      <button class="button is-success" style="width: 30%; border-color: #0AFEFF; color: #0AFEFF; background: #002E2E; margin-top: 15px"
                id="send_command" v-on:click.prevent="submitAnswer">Done</button>
      </div>
    </div>
  </div>
  </div>
</template>

<script>

export default {
  name: "AfterAnomalySurveyModal",
  computed: {
  },
  methods: {
    submitAnswer() {
      this.$store.commit("mutateSelectedAnomaliesList", []);
      this.$store.commit("mutateSelectedSymptomsList", []);
      this.$store.commit("mutateDiagnosisReport", []);
      this.$emit('close-modal')
    }
  },
  watch: {}
}
</script>

<style scoped>
</style>