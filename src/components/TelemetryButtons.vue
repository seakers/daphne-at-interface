<template>
    <div id="telemetry-feed">
        <div class="is-title">
            Telemetry Buttons
            (This window will never be shown to the user, it's only for development purposes)
        </div>
        <div class="is-centered is-content">
            <a v-if="!this.telemetryIsOngoing"
               class="button is-telemetry-button is-green" v-on:click.prevent="startTelemetry">
                START RECEIVING
            </a>
            <a v-else
               class="button is-telemetry-button is-red" v-on:click.prevent="stopFakeTelemetry">
                STOP RECEIVING
            </a>
        </div>
    </div>
</template>

<script>
    import { mapGetters, mapMutations } from 'vuex';

    export default {
        name: "TelemetryButtons",

        computed: {
            ...mapGetters({
                telemetryIsOngoing: 'getTelemetryIsOngoing',
            }),
        },

        methods: {
            startTelemetry() {
                this.$store.dispatch('startFakeTelemetry');
            },
            stopFakeTelemetry() {
                this.$store.dispatch('stopFakeTelemetry');
            },
        },
    }
</script>

<style scoped>

</style>