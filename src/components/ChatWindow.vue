<template>
  <div class="chat-container box is-main" style="margin: 5px; width: 24%; height: 92%">
    <div v-if="this.workload_problem" class="box is-seclss-background-black" style="text-align: center; margin: 0px 0px 0px 0px">
      <span style="color: var(--color__text)">{{this.workload_problem}}
        <input style="background-color: var(--color__bg); border-color: var(--color__shadow); color: var(--color__text); margin-right: 10px"
             type="text" name="answer" v-model="workload_answer"/>
      </span>
      <button class="button theme-buttons" style="width: 30%; margin-top: 15px"
              v-on:click.prevent="submitWorkloadAnswer">Submit</button>
    </div>
    <div class="is-title " style="text-align: center">Chatbox</div>
    <div style="height: 85%">
      <section class="chat-area" style="height: 85%" ref="chatArea">
        <div v-for="piece in dialogueHistory" class="chat-message content"
             :class="{ 'chat-message-user': piece.writer === 'user', 'chat-message-daphne': piece.writer === 'daphne' }">
          <component v-for="(response, index) in piece['visual_message']"
                     v-bind:is="responseTypes[piece['visual_message_type'][index]]" :response="response"
                     :key="index"></component>
        </div>
        <img src="assets/img/loader.svg" style="display: block; margin: auto;" align="center" height="64" width="64"
             v-if="isLoading" alt="Loading spinner">
      </section>
    </div>

    <div>
      <div class="sticky-textbox" style="position: absolute" width="24%">
        <div id="siri-container" style="height: 30px;"></div>

        <div class="field has-addons is-fullwidth">
          <div class="control is-expanded">
            <input class="input" style="background-color: var(--color__bg); border-color: var(--color__shadow); color: var(--color__text); " type="text"
                   name="command" placeholder="Ask me something" v-model="command" v-on:keyup.enter="sendCommand">
          </div>
        </div>

        <div style="width: 100%; text-align: center">
          <button class="button theme-buttons" style="width: 10%;"
                  v-on:click.prevent="switchVoice">
            <i class="fas" v-bind:class="[ this.isUnmute ? 'fa-volume-up' : 'fa-volume-off' ]"></i>
          </button>
          <button class="button theme-buttons" style="width: 55%;"
                  id="send_command" v-on:click.prevent="sendCommand">Send
          </button>
          <button class="button theme-buttons" style="width: 20%;"
                  id="clear_history" v-on:click.prevent="clearHistory">Clear
          </button>
          <button class="button theme-buttons" style="width: 10%;"
                  v-on:click.prevent="chatTutorial">?
          </button>
        </div>
        <div style="text-align: center; font-weight: bold">
          <a href="/question_cheatsheet.html" target="_blank">Help</a>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import * as _ from 'lodash-es';
import TextResponse from './TextResponse';
import ListResponse from './ListResponse';
import {mapState} from "vuex";
import {mapGetters} from 'vuex';
import SiriWave from "siriwave";
import daphne_awake from '../sounds/awake.mp3'
import daphne_asleep from '../sounds/asleep.mp3'
let loaderImage = require('../images/loader.svg');
let responsiveVoice = window.responsiveVoice;

export default {
  name: "ChatWindow",
  components: {
    // QuestionBar,
    TextResponse,
    ListResponse,
  },
  data() {
    return {
      responseTypes: {
        text: 'TextResponse',
        list: 'ListResponse',
        multilist: 'MultiListResponse',
        timeline_plot: 'TimelineResponse',
        active_message: 'ActiveMessage',
      },
      workload_answer: ''
    }
  },
  computed: {
    ...mapState({
      dialogueHistory: state => state.daphne.dialogueHistory,
      isLoading: state => state.daphne.isLoading,
      isSpeaking: state => state.daphne.isSpeaking,
      workload_problem: state => state.workload_problem
    }),
    ...mapGetters([
      'getResponse'
    ]),
    ...mapGetters({
      isListening: 'getIsListening',
      isSpeaking: 'getIsSpeaking',
      isUnmute: 'getIsUnmute',
      daphneVoice: 'getDaphneVoice',
      workload_problem: 'getWorkloadProblem'
    }),
    command: {
      get() {
        return this.$store.state.daphne.command;
      },
      set(newCommand) {
        this.$store.commit('setCommand', newCommand);
      }
    },
    isUnmute: {
      get() {
        return this.$store.state.daphne.isUnmute;
      },
      set(newValue) {
        this.$store.commit('setIsUnmute', newValue);
      },
    },
    daphneVoice: {
      get() {
        return this.$store.state.daphne.daphneVoice;
      },
      set(newValue) {
        this.$store.commit('setDaphneVoice', newValue);
      },
    }
  },
  methods: {
    scrollToBottom: function () {
      let container = this.$el.querySelector(".chat-area");
      container.scrollTop = container.scrollHeight;
    },
    clearHistory(event) {
      this.$store.dispatch('clearHistory');
    },
    sendCommand(event) {
      if (this.command === 'stop') {
        responsiveVoice.cancel();
      } else {
        this.$store.dispatch('executeCommand');
      }
    },
    switchVoice() {
      this.isUnmute = !this.isUnmute;
      this.$store.commit("setIsUnmute", this.isUnmute);
    },
    chatTutorial(event) {
      this.$root.$emit('chatTutorialIndividual');
    },
    submitWorkloadAnswer() {
      this.$store.commit("mutateWorkloadAnswer", this.workload_answer);
      this.$store.commit("mutateWorkloadProblem", '');
    }
  },
  watch: {
    dialogueHistory: function (val, oldVal) {
      this.$nextTick(() => {
        this.scrollToBottom();
      });
      if (this.isUnmute) {
        if (val.length > 0) {
          let lastMessage = val[val.length - 1];
          if (lastMessage['writer'] === "daphne") {
            let voiceAnswer = lastMessage['voice_message'];
            responsiveVoice.speak(voiceAnswer, this.daphneVoice , {rate: 1.05}, {volume: 1});
          }
        }
      }
    },
    isLoading: function (val, oldVal) {
      if (val === true) {
        _.delay(() => {
          this.scrollToBottom();
        }, 500);
      }
    },
    isSpeaking: async function (val, oldVal) {
      if (val) {
        this.siriWave = new SiriWave({
          container: document.getElementById('siri-container'),
          cover: true,
          style: "ios9",
          curveDefinition: [
            {color: "255,255,255", supportLine: true},
            {color: "15, 82, 169"}, // blue
            {color: "173, 57, 76"}, // red
            {color: "48, 220, 155"}, // green
          ]
        });
        this.siriWave.start();
        let audio = new Audio(daphne_awake);
        await audio.play();
        this.siriWave.setAmplitude(5);
      } else {
        let audio = new Audio(daphne_asleep);
        await audio.play();
        this.siriWave.stop();
        this.siriWave.dispose();
      }
    }
  }
}
</script>

<style lang="scss">
@import "../../node_modules/bulma/sass/utilities/initial-variables";

.chat-container {
  position: fixed;
  display: flex;
  flex-direction: column;
  padding-bottom: 1em;
}

.chat-area {
  width: 100%;
  overflow: auto;
  flex-grow: 1;
  margin: 0.5em;
}

.chat-message {
  width: 100%;
  border-radius: 10px;
  padding: .8em;
  margin-bottom: .8em;
  font-size: 15px;
}

.chat-message-daphne {
  float: left;
  background: #303030;
  color: $white;
  width: 80%;
}

.chat-message-user {
  float: right;
  margin-right: 15px;
  color: $white;
  background: $cyan;
  width: 80%;
}

.sticky-textbox {
  bottom: 0;
  padding: 0.5em;
  width: 100%;
}

::placeholder {
  color: gray !important;
}
</style>