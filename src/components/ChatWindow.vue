<template>
    <div>
        <div class="chat-container">
            <ChatArea :dialogue-history="dialogueHistory"></ChatArea>
            <QuestionBar class="sticky-textbox"></QuestionBar>
        </div>
    </div>
</template>

<script>
    import {mapState} from "vuex";
    import QuestionBar from "./QuestionBar";
    import ChatArea from "./ChatArea";

    export default {
        name: "ChatWindow",
        components: {
            ChatArea,
            QuestionBar
        },
        computed: {
            ...mapState({
                dialogueHistory: state => state.daphne.dialogueHistory
            })
        },
        methods: {
        },
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
    .sticky-textbox {
        padding: 1em;
        position: sticky;
        bottom: 0;
    }
</style>