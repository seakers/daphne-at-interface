<template>
  <div>
  <div class="message-body">
    <div class="modal-survey">
      <p><b>Answer the following questions. Click on Done <i>ONLY</i> after submitting the survey.</b></p>
      <section class="modal-card-body">
        <iframe style="width: 100%; height: 500px" src="https://tamu.qualtrics.com/jfe/form/SV_5u2vCanwaqxnMwe"></iframe>
      </section>
      <div style="text-align: center">
      <button class="button is-success" style="width: 30%; border-color: #0AFEFF; color: #0AFEFF; background: #002E2E; margin-top: 15px"
                id="send_command" v-on:click.prevent="submitAnswer">Submit</button>
      </div>
    </div>
  </div>
  </div>
</template>

<script>

export default {
  name: "SituationalAwarenessModal",
  computed: {
  },
  methods: {
    submitAnswer() {
      this.$emit('close-modal')
    }
  },
  watch: {}
}
</script>

<style scoped>
</style>