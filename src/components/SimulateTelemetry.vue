<template>
    <div class="columns is-mobile is-centered">
        <a class="button is-info is-centered" id="send_command" v-on:click.prevent="startTelemetry">
            Simulate telemetry feed surveillance
        </a>
    </div>
</template>

<script>
    export default {
        name: "startTelemetry",
        methods: {
             startTelemetry() {
                this.$store.dispatch('simulateTelemetry');
             }
        }
    }
</script>

<style scoped>

</style>