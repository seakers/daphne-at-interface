<template>
    <div id="telemetry-feed">
        <div class="is-title">
            Sensor Data
        </div>
        <div class="is-centered is-content">
            <div class="is-content is-multiselect">
                    <multiselect
                            :value="value"
                            :options="options"
                            :multiple="true"
                            :searchable="true"
                            :close-on-select="true"
                            :clear-on-select="false"
                            :preserve-search="true"
                            :allow-empty="false"
                            placeholder="Search and/or select the measurements to be displayed."
                            label="name"
                            selectLabel="Click to select"
                            deselectLabel="Click to remove"
                            openDirection="below"
                            track-by="name"
                            :preselect-first="true"
                            @input="newSelection">
                    </multiselect>
            </div>
            <div class="box is-stretched is-centered space-marker" style="background: #111111">
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
        name: "SensorDataWindow",

        computed: {
            ...mapGetters({
                plotData: 'getPlotData',
                selectedVariables: 'getSelectedVariables',
                inputVariables: 'getInputVariables',
                telemetryIsOngoing: 'getTelemetryIsOngoing',
                telemetryInfo: 'getTelemetryInfo',
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
                return setLayout(this.selectedVariables, this.telemetryInfo, this.plotData);
            }
        },

        methods: {
            newSelection(newElement) {
                let newSelectedVariables = [];
                for (let i = 0; i < newElement.length; i++) {
                    newSelectedVariables[i] = newElement[i]['name'];
                }
                this.$store.dispatch('updateSelectedVariables', newSelectedVariables);
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