<template>
  <div>
    <div class="message-body" style="display: flex; justify-content: center; text-align: center">
      <div class="modal-survey" id="survey" style="display:block">
        <p><b>How confident are you about your selection? Select an option from below.</b></p>
          <div id="radioGroup">
            <div class="wrap">
              <label for="1">Not at all</label>
              <label for="1">1</label>
              <input type="radio" name="mark" id="1" value="1" v-model="mark" required/>
            </div>
            <div class="wrap">
              <label for="2">2</label>
              <input type="radio" name="mark" id="2" value="2" v-model="mark" required/>
            </div>
            <div class="wrap">
              <label for="3">3</label>
              <input type="radio" name="mark" id="3" value="3" v-model="mark" required/>
            </div>
            <div class="wrap">
              <label for="4">4</label>
              <input type="radio" name="mark" id="4" value="4" v-model="mark" required/>
            </div>
            <div class="wrap">
              <label for="5">5</label>
              <input type="radio" name="mark" id="5" value="5" v-model="mark" required/>
            </div>
            <div class="wrap">
              <label for="6">6</label>
              <input type="radio" name="mark" id="6" value="6" v-model="mark" required/>
            </div>
            <div class="wrap">
              <label for="7">Very confident</label>
              <label for="7">7</label>
              <input type="radio" name="mark" id="7" value="7" v-model="mark" required/>
            </div>
          </div>
          <button class="button theme-buttons" :disabled="isDisabled"
                  style="width: 30%; border-color: #0AFEFF; color: #0AFEFF; background: #002E2E; margin-top: 15px"
                  v-on:click="submit">Done
          </button>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: "SituationalAwarenessModal",
  data() {
    return {
      mark: ''
    }
  },
  computed: {
    isDisabled: function () {
      return !this.mark;
    }
  },
  methods: {
    submit() {
      this.$emit('close-modal')
    }
  }
}

</script>

<style scoped>

#radioGroup .wrap {
  display: inline-block;
}

#radioGroup label {
  display: block;
  text-align: center;
  margin: 0 1em;
}

#radioGroup input[type="radio"] {
  display: block;
  margin: 0.5em auto;
}
</style>