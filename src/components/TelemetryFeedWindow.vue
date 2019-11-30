<template>
    <div>
        <div class="title">Telemetry Feed</div>
        <div class="is-centered">
            <div class="columns">
                <div class="column is-10">
                    <div class="box is-stretched space-marker">
                        <label class="typo__label">Select the telemetry feed variables to be displayed</label>
                        <multiselect
                                :value="value"
                                :options="options"
                                :multiple="true"
                                :searchable="true"
                                :close-on-select="true"
                                :clear-on-select="false"
                                :preserve-search="true"
                                :allow-empty="false"
                                placeholder="No variables selected"
                                label="name"
                                selectLabel="Click to select"
                                deselectLabel="Click to remove"
                                openDirection="below"
                                track-by="name"
                                :preselect-first="true"
                                @input="newSelection">
                        </multiselect>
                    </div>
                </div>
                <div class="column is-2">
                    <div class="box is-stretched space-marker">
                        <a class="button is-custom-button is-blue" v-on:click.prevent="startTelemetry">
                            START TELEMETRY
                        </a>
                        <a class="button is-custom-button is-red" v-on:click.prevent="stopTelemetry">
                            STOP TELEMETRY
                        </a>
                    </div>
                </div>
            </div>
            <div class="box is-stretched is-centered space-marker">
                <vue-plotly
                        :data="plotData"
                        :layout="plotLayout"
                        :options="{}"/>
            </div>
        </div>
    </div>
</template>

<script>
    import VuePlotly from '@statnett/vue-plotly'
    import Multiselect from 'vue-multiselect'
    import { mapGetters, mapMutations } from 'vuex';
    import {setLayout} from "../scripts/at-display-builders";


    export default {
        name: "TelemetryFeedWindow",

        computed: {
            ...mapGetters({
                plotData: 'getPlotData',
                selectedVariables: 'getSelectedVariables',
                inputVariables: 'getInputVariables',
            }),
            value ()  {
                let variables = this.selectedVariables;
                let aux = [];
                for (let i = 0; i < variables.length; i++) {
                    aux.push({'name': variables[i]});
                }
                return aux;
            },
            options ()  {
                let variables = this.inputVariables;
                let aux = [];
                for (let i = 0; i < variables.length; i++) {
                    aux.push({'name': variables[i]});
                }
                return aux;
            },
            plotLayout () {
                return setLayout(this.selectedVariables);
            }
        },

        methods: {
            startTelemetry() {
                this.$store.dispatch('startTelemetry');
            },
            stopTelemetry() {
                this.$store.dispatch('stopTelemetry');
                this.$store.commit('clearTelemetry');
            },
            newSelection(newElement) {
                let newSelectedVariables = [];
                for (let i = 0; i < newElement.length; i++) {
                    newSelectedVariables[i] = newElement[i]['name'];
                }
                this.$store.commit('updateSelectedVariables', newSelectedVariables);
            }
        },

        components: {
            VuePlotly,
            Multiselect,
        }
    }
</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>

<style scoped>

</style>