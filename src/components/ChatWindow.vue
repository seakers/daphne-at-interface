<template>
    <div>
        <div class="chat-container">
            <div>
                <span class="tutorialLink">
                    <u v-on:click.prevent="chatTutorial">?</u>
                </span>
            </div>
            <section ref="chatArea" class="chat-area">
                <div v-for="piece in dialogueHistory" class="chat-message content" :class="{ 'chat-message-user': piece.writer === 'user', 'chat-message-daphne': piece.writer === 'daphne' }">
                    <component v-for="(response, index) in piece['visual_message']" v-bind:is="responseTypes[piece['visual_message_type'][index]]" :response="response" :key="index"></component>
                </div>
                <img src="assets/img/loader.svg" style="display: block; margin: auto;" height="64" width="64" v-if="isLoading" alt="Loading spinner">
            </section>

            <div class="sticky-textbox">
                <div class="field has-addons is-fullwidth">
                    <div class="control is-expanded">
                        <input class="input" type="text" name="command" placeholder="Ask a question / Give a command / Speak it out!" v-model="command" v-on:keyup.enter="sendCommand">
                    </div>
                    <div class="control">
                        <a class="button is-info" v-on:click.prevent="switchVoice">
                    <span class="icon is-small">
                        <i class="fas" v-bind:class="[ this.speakOut ? 'fa-volume-up' : 'fa-volume-off' ]"></i>
                    </span>
                        </a>
                    </div>
                    <div class="control">
                        <a class="button is-info" id="clear_history" v-on:click.prevent="clearHistory">Clear</a>
                    </div>
                    <div class="control">
                        <a class="button is-info" id="send_command" v-on:click.prevent="sendCommand">Send</a>
                    </div>
                </div>
                <div>
                    <a href="/question_cheatsheet.html" target="_blank">
                        Here's a list of the questions that I can answer!
                    </a>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import * as _ from 'lodash-es';
    // import QuestionBar from "./QuestionBar";
    import TextResponse from './TextResponse';
    import ListResponse from './ListResponse';
    import {mapState} from "vuex";
    import { mapGetters } from 'vuex';

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
                speakOut: false
            }
        },
        computed: {
            ...mapState({
                dialogueHistory: state => state.daphne.dialogueHistory,
                isLoading: state => state.daphne.isLoading,
            }),
            ...mapGetters([
                'getResponse'
            ]),
            command: {
                get() {
                    return this.$store.state.daphne.command;
                },
                set(newCommand) {
                    this.$store.commit('setCommand', newCommand);
                }
            }
        },
        methods: {
            scrollToBottom: function() {
                console.log("Scrolling to bottom");
                let container = this.$el.querySelector(".chat-area");
                container.scrollTop = container.scrollHeight;
            },
            clearHistory(event) {
                this.$store.dispatch('clearHistory');
            },
            sendCommand(event) {
                if (this.command === 'stop') {
                    responsiveVoice.cancel();
                }
                else {
                    this.$store.dispatch('executeCommand');
                }
            },
            switchVoice(event) {
                console.log(this.speakOut);
                this.speakOut = !this.speakOut;
            },
            chatTutorial(event) {
                this.$root.$emit('chatTutorialI');
            }
        },
        watch: {
            dialogueHistory: function(val, oldVal) {
                this.$nextTick(() => {
                    this.scrollToBottom();
                });
                if (this.speakOut) {
                    if (val.length > 0) {
                        let lastMessage = val[val.length - 1];
                        if (lastMessage['writer'] === "daphne") {
                            let voiceAnswer = lastMessage['voice_message'];
                            responsiveVoice.speak(voiceAnswer);
                        }
                    }
                }
            },
            isLoading: function(val, oldVal) {
                if (val === true) {
                    _.delay(() => { this.scrollToBottom(); }, 500);
                }
            },
        }
    }
</script>

<style lang="scss">
    @import "../../node_modules/bulma/sass/utilities/initial-variables";
    .chat-container {
        position: fixed;
        display: flex;
        flex-direction: column;
        height: 100%;
    }
    .chat-area {
        width: 100%;
        padding: 1em;
        overflow: auto;
        flex-grow: 1;
    }
    .chat-message {
        width: 95%;
        border-radius: 10px;
        padding: .8em;
        margin-bottom: .8em;
    }
    .chat-message-daphne {
        background: $white-ter;
    }
    .chat-message-user {
        margin-left: 5%;
        color: $white;
        background: $cyan;
    }
    .sticky-textbox {
        padding: 1em;
        bottom: 0;
    }
</style>