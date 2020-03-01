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
            <div class="horizontal-divider" style="margin-bottom: 10px"></div>
            <p class="is-mini-title" style="margin-bottom:10px">{{anomalyDict['anomalyName']}}</p>
            <div v-for="(procedureDict, procedureIndex) in anomalyDict['anomalyProcedures']">
                <div class="procedure" :class="accordionClasses[anomalyDict['anomalyName']][procedureIndex]">
                    <div class="procedure-header" @click="toggleAccordion(anomalyDict['anomalyName'], procedureIndex)">
                        {{procedureIndex}})   {{procedureDict['procedureName']}}
                        <span v-if="isComplete(procedureDict)" style="color: greenyellow; float:right">
                            COMPLETED
                        </span>
                        <span v-else style="color: red; float:right">
                            PENDING
                        </span>
                    </div>
                    <div class="procedure-body">
                        <div class="procedure-content">
                            <p >
                                <span style="color: #0AFEFF">Objective </span>
                                {{procedureDict['procedureObjective']}}
                            </p>
                            <p style="margin-top: 10px">
                                <span style="color: #0AFEFF">Equipment</span>
                            </p>
                            <ul v-for="item in procedureDict['procedureEquipment']">
                                <li style="margin-left: 20px">
                                    {{item}}
                                </li>
                            </ul>
                            <p style="margin-top: 10px">
                                <span style="color: #0AFEFF">Steps to follow</span>
                                ({{procedureDict['procedureCurrentStep']}}
                                out of
                                {{procedureDict['procedureSteps'].length}}
                                steps performed)
                            </p>
                            <div  class="scrollable-container" style="margin-left: 20px">
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
            </div>
            <div class="horizontal-divider" style="margin-top: 30px"></div>
        </div>
    </div>
</template>

<script>
    import Multiselect from 'vue-multiselect'
    import { mapGetters, mapMutations } from 'vuex';
    import {updateCheckboxes} from "../scripts/at-display-builders";

    export default {
        name: "AnomalyResponseWindow",

        data() {
            return {
                accordionTabIsOpen: {},
                dodgeThis: true,
            }
        },

        computed: {
            ...mapGetters({
                selectedAnomaliesList: 'getSelectedAnomaliesList',
                selectedAnomaliesInfo: 'getSelectedAnomaliesInfo',
                allAnomalies: 'getAllAnomaliesList',
                selectedProceduresList: 'getSelectedProceduresList',
                selectedProceduresInfo: 'getSelectedProceduresInfo',
            }),
            value()  {
                let aux = [];
                for (let index in this.selectedAnomaliesList) {aux.push({'name': this.selectedAnomaliesList[index]})}
                return aux;
            },
            options()  {
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
                        procedureDict['isOpen'] = false;
                        procedureList.push(procedureDict);
                    }
                    anomalyDict['anomalyName'] = anomalyName;
                    anomalyDict['anomalyProcedures'] = procedureList;
                    anomalyList.push(anomalyDict);
                }
                return anomalyList;
            },
            accordionClasses() {
                let dodgeThis = this.dodgeThis;
                let accordionClassesDict = {};
                for (let key in this.accordionTabIsOpen) {
                    let boolList = this.accordionTabIsOpen[key];
                    let aux = [];
                    for (let index in boolList) {
                        let isOpen = boolList[index];
                        let struct = {
                            'is-closed': !isOpen,
                            'is-primary': isOpen,
                            'is-dark': !isOpen
                        }
                        aux.push(struct)
                    }
                    accordionClassesDict[key] = aux;
                }
                return accordionClassesDict
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
            toggleAccordion(anomalyName, procedureIndex) {
                this.accordionTabIsOpen[anomalyName][procedureIndex] = !this.accordionTabIsOpen[anomalyName][procedureIndex];
                this.dodgeThis = !this.dodgeThis;
            },
        },

        mounted: function() {
            this.loadAnomalies()
        },

        watch: {
            selectedAnomaliesList(newVal, oldVal) {
                // Find the added or substracted anomalies
                let addedVal = newVal.filter(function(obj) { return oldVal.indexOf(obj) === -1; });
                let removedVal = oldVal.filter(function(obj) { return newVal.indexOf(obj) === -1; });
                // Proceed according to whether an anomaly has been added or substracted
                if (removedVal.length > 0) {
                    // Delete the anomaly "tab is open" bool list from the accordion bool dictionary
                    let removedAnomalyName = removedVal[0];
                    delete this.accordionTabIsOpen[removedAnomalyName];
                }
                if (addedVal.length > 0) {
                    // Add the anomaly "tab is open" bool list from the accordion bool dictionary
                    let addedAnomalyName = addedVal[0];
                    let anomalyProcedures = this.selectedAnomaliesInfo[addedAnomalyName]['anomalyProcedures'];
                    let boolList = [];
                    for (let index in anomalyProcedures) {
                        boolList.push(false);
                    }
                    this.accordionTabIsOpen[addedAnomalyName] = boolList;
                }
            }
        },

        components: {
            Multiselect,
        }
    }
</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>

<style scoped>

</style>

