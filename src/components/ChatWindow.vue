<template>
    <div>
        <div class="chat-container" style="margin-top:10px">
            <section ref="chatArea" class="chat-area">
                <div v-for="piece in dialogueHistory" class="chat-message content" :class="{ 'chat-message-user': piece.writer === 'user', 'chat-message-daphne': piece.writer === 'daphne' }">
                    <component v-for="(response, index) in piece['visual_message']" v-bind:is="responseTypes[piece['visual_message_type'][index]]" :response="response" :key="index"></component>
                </div>
                <img src="assets/img/loader.svg" style="display: block; margin: auto;" height="64" width="64" v-if="isLoading" alt="Loading spinner">
            </section>

            <div class="sticky-textbox">
                <div class="field has-addons is-fullwidth">
                        <div class="control is-expanded">
                            <input class="input" type="text" name="command" placeholder="Ask me something" v-model="command" v-on:keyup.enter="sendCommand">
                        </div>
                </div>
                <div class="field has-addons is-fullwidth">
                        <div class="control is-expanded">
                            <a class="button is-info" v-on:click.prevent="switchVoice">
                                <span v-if="this.isListening" class="icon is-small" style="background-color:red;">
                                    <i class="fas" v-bind:class="[ this.speakOut ? 'fa-volume-up' : 'fa-volume-off' ]"></i>
                                </span>
                                <span v-else class="icon is-small">
                                    <i class="fas" v-bind:class="[ this.speakOut ? 'fa-volume-up' : 'fa-volume-off' ]"></i>
                                </span>
                            </a>
                        </div>
                        <div class="control is-expanded">
                          <a class="button is-info" v-on:click.prevent="chatTutorial">?</a>
                        </div>
                        <div class="control is-fullwidth">
                            <a class="button is-info" id="clear_history" v-on:click.prevent="clearHistory">Clear</a>
                        </div>
                        <div class="control is-fullwidth">
                            <a class="button is-info" id="send_command" v-on:click.prevent="sendCommand">Send</a>
                        </div>
                </div>
                <div style="padding-bottom: 10px;">
                    <a href="/question_cheatsheet.html" target="_blank">
                        Click here for Question Cheatsheet
                    </a>
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
                speakOut: true
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
            ...mapGetters({
                isListening: 'getIsListening',
            }),
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
                this.$root.$emit('chatTutorialIndividual');
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
        padding-bottom: 1em;
    }
    .chat-area {
        width: 100%;
        padding-right: 1em;
        overflow: auto;
        flex-grow: 1;
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
        color: $white;
        background: $cyan;
        width: 80%;
    }
    .sticky-textbox {
        padding-right: 1em;
        bottom: 0;
    }
</style>