<template>
    <section ref="chatArea" class="chat-area">
        <div v-for="piece in dialogueHistory" class="chat-message content" :class="{ 'chat-message-user': piece.writer === 'user', 'chat-message-daphne': piece.writer === 'daphne' }">
            <component v-for="(response, index) in piece['visual_message']" v-bind:is="responseTypes[piece['visual_message_type'][index]]" :response="response" :key="index"></component>
        </div>
<!--        <img src="assets/img/loader.svg" style="display: block; margin: auto;" height="64" width="64" v-if="isLoading" alt="Loading spinner">-->
    </section>
</template>

<script>
    import TextResponse from "./TextResponse";
    import ListResponse from './ListResponse';

    // let loaderImage = require('../images/loader.svg');

    export default {
        name: "ChatArea",
        props: ["dialogueHistory"],
        components: {
            TextResponse,
            ListResponse,
            // TimelineResponse,
            // ActiveMessage
        },
        data() {
            return {
                responseTypes: {
                    text: 'TextResponse',
                    list: 'ListResponse',
                    // timeline_plot: 'TimelineResponse',
                    // active_message: 'ActiveMessage'
                }
            }
        },
        watch: {
            addDialoguePiece: function(val, oldVal) {
                if (this.speakOut) {
                    if (val["writer"] === "daphne") {
                        responsiveVoice.speak(val['voice_answer']);
                    }
                }
            },
            // isLoading: function(val, oldVal) {
            //     if (val === true) {
            //         _.delay(() => { this.scrollToBottom(); }, 500);
            //     }
            // },
        }
    }
</script>

<style lang="scss" scoped>
    @import "../../node_modules/bulma/sass/utilities/initial-variables";
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
</style>