<template>
  <div>
    <div class="message-body" style="display: flex; justify-content: center; text-align: center">
      <div class="modal-survey" id="survey" style="display:block">
        <p>This is a <b>without</b> Daphne session. Please close the browser window and perform this session without using Daphne.</p>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: "WithoutDaphneSessionModal",
  computed: {
    isDone: false
  },
  methods: {
  },
  watch: {}
}
</script>

<style scoped>
</style>
