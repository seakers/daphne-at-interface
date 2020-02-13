<template>
    <div>
        <div class="is-title">
            Anomaly Response
        </div>
        <div class="is-content">
            <multiselect
                    :value="value"
                    :options="options"
                    :multiple="true"
                    :searchable="true"
                    :close-on-select="true"
                    :clear-on-select="false"
                    :preserve-search="true"
                    :allow-empty="true"
                    placeholder="No anomalies selected"
                    label="name"
                    selectLabel="Click to select"
                    deselectLabel="Click to remove"
                    openDirection="below"
                    track-by="name"
                    :preselect-first="true"
                    @select="newSelection"
                    @remove="newDeselection">
            </multiselect>
        </div>
        <div v-for="anomaly in selectedAnomaliesList" class="is-content">
            <div class="horizontal-divider"></div>
            <div class="columns">
                <div class="column is-5">
                    <p class="is-mini-title">Anomaly name</p>
                    <p>{{anomaly}}</p>
                    <br>
                    <p class="is-mini-title">Name of the procedure(s) to be followed</p>
                    <ul v-for="procedure in selectedAnomaliesInfo[anomaly]['anomalyProceduresList']">
                        <li style="list-style-type: disc; margin-left: 30px">
                            {{procedure}}
                        </li>
                    </ul>
                </div>
                <div class="column is-7">
                    <p class="is-mini-title">Steps to be followed for each procedure</p>
                    <div v-for="(procedure in selectedAnomaliesInfo[anomaly]['anomalyProceduresList']">
                        <br><b>
                            {{procedure}}
                            ({{selectedProceduresInfo[procedure]['currentStep']}}
                            out of
                            {{selectedProceduresInfo[procedure]['procedureStepsList'].length}}
                        steps completed)
                        </b>
                        <div  class="scrollable-container">
                            <div v-for="(stepName, index) in selectedProceduresInfo[procedure]['procedureStepsList']">
                                <input type="checkbox" v-on:click="checkIt(procedure)"
                                       :checked="checkBoxInfo[procedure]['isDone'][index]"
                                       :disabled="!checkBoxInfo[procedure]['isEnabled'][index]">
                                {{stepName}}
                                <br />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="horizontal-divider"></div>
        </div>
    </div>
</template>

<script>
    import Multiselect from 'vue-multiselect'
    import { mapGetters, mapMutations } from 'vuex';


    export default {
        name: "AnomalyResponseWindow",

        computed: {
            ...mapGetters({
                selectedAnomaliesList: 'getSelectedAnomaliesList',
                selectedAnomaliesInfo: 'getSelectedAnomaliesInfo',
                allAnomalies: 'getAllAnomaliesList',
                selectedProceduresList: 'getSelectedProceduresList',
                selectedProceduresInfo: 'getSelectedProceduresInfo',
            }),
            value ()  {
                let anomalies = this.selectedAnomaliesList;
                let aux = [];
                for (let index in anomalies) {
                    let anomaly = anomalies[index];
                    aux.push({'name': anomaly});
                }
                return aux;
            },
            options ()  {
                let anomalies = this.allAnomalies;
                let aux = [];
                for (let i = 0; i < anomalies.length; i++) {
                    aux.push({'name': anomalies[i]});
                }
                return aux;
            },
            checkBoxInfo () {
                let procedures = this.selectedProceduresList;
                let proceduresInfo = this.selectedProceduresInfo;
                let checkBoxInfo = {};
                for (let index in procedures) {
                    let procedureName = procedures[index];
                    let totalSteps = proceduresInfo[procedureName]['procedureStepsList'].length;
                    let currentStep = proceduresInfo[procedureName]['currentStep'];
                    let isDone = new Array(totalSteps).fill(false);
                    let isEnabled = new Array(totalSteps).fill(false);
                    for (let i = 0; i < totalSteps; i++) {
                        if (i < currentStep) {
                            isDone[i] = true;
                        }
                        if (currentStep - 1 <= i && i <= currentStep) {
                            isEnabled[i] = true;
                        }
                    }
                    checkBoxInfo[procedureName] = {'isDone': isDone, 'isEnabled': isEnabled};
                }
                return checkBoxInfo;
            }
        },

        methods: {
            async newSelection(selectedAnomaly) {
                let anomalyName = selectedAnomaly['name'];
                await this.$store.dispatch('parseAndAddSelectedAnomaly', anomalyName);
            },
            async newDeselection(deselectedAnomaly) {
                let anomalyName = deselectedAnomaly['name'];
                this.$store.commit('removeSelectedAnomaly', anomalyName)
            },
            loadAnomalies() {
                this.$store.commit('loadAllAnomalies');
            },
            isChecked(procedure, index) {
                let currentStep = this.selectedProceduresInfo[procedure]['currentStep'];
                return index < currentStep;
            },
            isEnabled(procedure, index) {
                let currentStep = this.selectedProceduresInfo[procedure]['currentStep'];
                return index === currentStep || index === currentStep - 1;
            },
            checkIt(procedure) {
                let newCurrentStep = this.selectedProceduresInfo[procedure]['currentStep'] + 1;
                let commitInfo = {'procedureName': procedure, 'newCurrentStep': newCurrentStep};
                this.$store.commit('updateProcedureCurrentStep', commitInfo);
            }
        },

        mounted: function() {
            this.loadAnomalies()
        },

        components: {
            Multiselect,
        }
    }
</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>

<style scoped>

</style>