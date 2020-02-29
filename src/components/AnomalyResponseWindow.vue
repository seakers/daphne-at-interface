<template>
    <div id="anomaly_response">
        <div class="is-title">
            Anomaly Response
        </div>
        <div class="is-content is-multiselect">
            <multiselect
                    :value="value"
                    :options="options"
                    :multiple="true"
                    :searchable="true"
                    :close-on-select="true"
                    :clear-on-select="false"
                    :preserve-search="true"
                    :allow-empty="true"
                    placeholder="Search and/or select the anomalies to be explored."
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
        <div v-for="anomalyDict in anomalyList" class="is-content">
            <div class="horizontal-divider"></div>
            <div class="columns">
                <div class="column is-5">
                    <p class="is-mini-title">Anomaly root cause</p>
                    <p>{{anomalyDict['anomalyName']}}</p>
                    <br>
                    <p class="is-mini-title">Procedure(s) to be followed</p>
                    <ul v-for="procedureDict in anomalyDict['anomalyProcedures']">
                        <li style="list-style-type: disc; margin-left: 30px">
                            <p>{{procedureDict['procedureName']}}</p>
                            <ul>
                                <li style="list-style-type: circle; margin-left: 20px">
                                    Objective: {{procedureDict['procedureObjective']}}
                                </li>
                                <li style="list-style-type: circle; margin-left: 20px">
                                    Equipment:
                                    <ul v-for="item in procedureDict['procedureEquipment']">
                                        <li style="margin-left: 20px">
                                            {{item}}
                                        </li>
                                    </ul>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </div>
                <div class="column is-7">
                    <p class="is-mini-title">Steps to be followed for each procedure</p>
                    <div v-for="(procedureDict, index) in anomalyDict['anomalyProcedures']">
                        <br><b>
                        {{index + 1}})
                        {{procedureDict['procedureName']}}
                        ({{procedureDict['procedureCurrentStep']}}
                        out of
                        {{procedureDict['procedureSteps'].length}}
                        steps performed)
                        <span v-if="isComplete(procedureDict)" style="color: greenyellow"> COMPLETED</span>
                        <span v-else style="color: red"> PENDING</span>
                    </b>
                        <div  class="scrollable-container">
                            <div v-for="(stepItem, stepIndex) in procedureDict['procedureSteps']">
                                <input type="checkbox"
                                       v-bind:style="{'margin-left': computeLeftMargin(stepItem)}"
                                       v-on:click="checkIt(procedureDict, stepIndex)"
                                       :checked="stepItem['isDone']">
                                <label>{{stepItem['label']}} - {{stepItem['action']}}</label>
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
    import {updateCheckboxes} from "../scripts/at-display-builders";

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
                let aux = [];
                for (let index in this.selectedAnomaliesList) {aux.push({'name': this.selectedAnomaliesList[index]})}
                return aux;
            },
            options ()  {
                let aux = [];
                for (let i = 0; i < this.allAnomalies.length; i++) {aux.push({'name': this.allAnomalies[i]})}
                return aux;
            },
            anomalyList() {
                let anomalyList = [];
                for (let anomalyIndex in this.selectedAnomaliesList) {
                    let anomalyDict = {};
                    let anomalyName = this.selectedAnomaliesList[anomalyIndex];
                    let procedureList = [];
                    for (let procedureIndex in this.selectedAnomaliesInfo[anomalyName]['anomalyProcedures']) {
                        let procedureDict = {};
                        let procedureName = this.selectedAnomaliesInfo[anomalyName]['anomalyProcedures'][procedureIndex];
                        let procedureSteps = this.selectedProceduresInfo[procedureName]['procedureStepsList'];
                        let procedureCurrentStep = this.selectedProceduresInfo[procedureName]['procedureCurrentStep'];
                        let procedureObjective = this.selectedProceduresInfo[procedureName]['procedureObjective'];
                        let procedureEquipment = this.selectedProceduresInfo[procedureName]['procedureEquipment'];
                        procedureDict['procedureName'] = procedureName;
                        procedureDict['procedureSteps'] = procedureSteps;
                        procedureDict['procedureCurrentStep'] = procedureCurrentStep;
                        procedureDict['procedureObjective'] = procedureObjective;
                        procedureDict['procedureEquipment'] = procedureEquipment;
                        procedureList.push(procedureDict);
                    }
                    anomalyDict['anomalyName'] = anomalyName;
                    anomalyDict['anomalyProcedures'] = procedureList;
                    anomalyList.push(anomalyDict);
                }
                return anomalyList;
            }
        },

        methods: {
            async newSelection(selectedAnomaly) {
                let anomalyName = selectedAnomaly['name'];
                if (!this.selectedAnomaliesList.includes(anomalyName)) {await this.$store.dispatch('addSelectedAnomaly', anomalyName)}
            },
            async newDeselection(deselectedAnomaly) {
                let anomalyName = deselectedAnomaly['name'];
                await this.$store.dispatch('removeSelectedAnomaly', anomalyName)
            },
            loadAnomalies() {
                this.$store.dispatch('loadAllAnomalies');
            },
            computeLeftMargin(stepItem) {
                let margin = '0px';
                let depth = stepItem['depth'];
                if (depth === 0) {margin = '10px'}
                else if (depth === 1) {margin = '25px'}
                else if (depth === 2) {margin = '40px'}
                return margin
            },
            isComplete(procedureDict) {
                let currentStep = procedureDict['procedureCurrentStep'];
                let totalSteps = procedureDict['procedureSteps'].length;
                return currentStep === totalSteps;
            },
            checkIt(procedureDict, stepIndex) {
                // This auxiliary function returns the proper updated procedureDict object. It only changes whether the
                // checkboxes of each step should be checked and/or disabled or not. It's easy to understand what it
                // does, but the actual code is an "if nightmare", and that's why it's implemented elsewhere.
                let newProcedureDict = updateCheckboxes(procedureDict, stepIndex);

                // Compute the current step (as the number of checked boxes)
                let numberOfCheckedBoxes = 0;
                for (let i = 0; i < newProcedureDict['procedureSteps'].length; i++) {
                    if (newProcedureDict['procedureSteps'][i]['isDone']) {
                        numberOfCheckedBoxes += 1;
                    }
                }
                newProcedureDict['procedureCurrentStep'] = numberOfCheckedBoxes;

                // Perform the update
                this.$store.dispatch('updateProcedureDict', newProcedureDict);
            },
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

