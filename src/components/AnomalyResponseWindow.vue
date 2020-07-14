<template>
    <div id="anomaly_response">
        <div class="is-title">
            Anomaly Response
            <span class="tutorialLink">
                <u v-on:click.prevent="responseTutorial">?</u>
            </span>
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
            <div v-if="clearButtonBoolean">
                <a class="button is-small-button" v-on:click.prevent="clearCompletedProcedures" style="float:right">
                    Clear Completed Procedures
                </a>
            </div>
        </div>
        <div v-if="isLoading" class="is-content">
            <img v-if="isLoading"
                 src="assets/img/loader.svg"
                 style="display: block; margin: auto;"
                 height="40" width="40"
                 alt="Loading spinner">
        </div>
        <div v-else v-for="(anomalyDict, anomalyIndex) in anomalyList" class="is-content" :key="componentKey">
            <div class="horizontal-divider" style="margin-bottom: 10px"></div>
            <p class="is-mini-title" style="margin-bottom:10px">{{anomalyDict['anomalyName']}}</p>
            <div v-for="(procedureDict, procedureIndex) in anomalyDict['anomalyProcedures']">
                <div class="procedure" :class="{
                            'is-closed': !anomalyList[anomalyIndex]['anomalyProcedures'][procedureIndex]['procedureIsOpen'],
                            'is-primary': anomalyList[anomalyIndex]['anomalyProcedures'][procedureIndex]['procedureIsOpen'],
                            'is-dark': !anomalyList[anomalyIndex]['anomalyProcedures'][procedureIndex]['procedureIsOpen']
                        }">
                    <div class="procedure-header" @click="toggleAccordion(procedureDict)">
                        {{procedureIndex + 1}})   {{procedureDict['procedureName']}}
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
                            <p v-if="procedureDict['procedureFigures'].length > 0" style="margin-top: 10px">
                                <span style="color: #0AFEFF">Figures </span>
                            </p>
                            <ul v-for="(item, itemIndex) in procedureDict['procedureFigures']">
                                <li v-on:click="openFigure(item)" style="margin-left: 20px; cursor: pointer">
                                    Figure {{itemIndex+1}}
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
                                    <label>{{stepItem['label']}} - {{stepItem['action']}} Hello World
                                        <span v-if="stepItem['hasFigure']">
                                             (see
                                            <a v-on:click="openFigure(stepItem['figure'])">
                                                  Figure {{stepItem['fNumber']}}
                                            </a>
                                            <span v-if="stepItem['hasFigure2']">
                                                 and
                                                <a  v-on:click="openFigure(stepItem['figure2'])">
                                                     Figure {{stepItem['fNumber2']}}
                                                </a>
                                            </span>
                                            )
                                        </span>
                                    </label>
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

    let loaderImage = require('../images/loader.svg');

    export default {
        name: "AnomalyResponseWindow",

        data() {
            return {
                componentKey: true,
                anomalyListCopy: [],
            }
        },

        computed: {
            ...mapGetters({
                selectedAnomaliesList: 'getSelectedAnomaliesList',
                selectedAnomaliesInfo: 'getSelectedAnomaliesInfo',
                allAnomalies: 'getAllAnomaliesList',
                selectedProceduresList: 'getSelectedProceduresList',
                selectedProceduresInfo: 'getSelectedProceduresInfo',
                isLoading: 'getLoadingNewAnomaly',
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
                        let procedureFigures = this.selectedProceduresInfo[procedureName]['procedureFigures'];
                        let procedureIsOpen = this.selectedProceduresInfo[procedureName]['procedureIsOpen'];
                        procedureDict['procedureName'] = procedureName;
                        procedureDict['procedureSteps'] = procedureSteps;
                        procedureDict['procedureCurrentStep'] = procedureCurrentStep;
                        procedureDict['procedureObjective'] = procedureObjective;
                        procedureDict['procedureEquipment'] = procedureEquipment;
                        procedureDict['procedureFigures'] = procedureFigures;
                        procedureDict['procedureIsOpen'] = procedureIsOpen;
                        procedureList.push(procedureDict);
                    }
                    anomalyDict['anomalyName'] = anomalyName;
                    anomalyDict['anomalyProcedures'] = procedureList;
                    anomalyList.push(anomalyDict);
                }
                return anomalyList;
            },
            clearButtonBoolean() {
                for (let anomalyIndex in this.anomalyList) {
                    for (let procedureIndex in this.anomalyList[anomalyIndex]['anomalyProcedures']) {
                        if (this.isComplete(this.anomalyList[anomalyIndex]['anomalyProcedures'][procedureIndex])) {
                            return true;
                        }
                    }
                }
                return false;
            }
        },

        methods: {
            async newSelection(selectedAnomaly) {
                let anomalyName = selectedAnomaly['name'];
                if (!this.selectedAnomaliesList.includes(anomalyName)) {
                    await this.$store.dispatch('addSelectedAnomaly', anomalyName);
                }
            },
            async newDeselection(deselectedAnomaly) {
                let anomalyName = deselectedAnomaly['name'];
                await this.$store.dispatch('removeSelectedAnomaly', anomalyName);
            },
            loadAnomalies() {
                this.$store.dispatch('loadAllAnomalies');
            },
            computeLeftMargin(stepItem) {
                let margin = '0px';
                let depth = stepItem['depth'];
                if (depth === 0) {
                    margin = '10px'
                } else if (depth === 1) {
                    margin = '25px'
                } else if (depth === 2) {
                    margin = '40px'
                }
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
            toggleAccordion(procedureDict) {
                procedureDict['procedureIsOpen'] = !procedureDict['procedureIsOpen'];
                this.$store.dispatch('updateProcedureDict', procedureDict);
            },
            responseTutorial(event) {
                this.$root.$emit('responseTutorialIndividual');
            },
            clearCompletedProcedures() {
                for (let anomalyIndex in this.anomalyList) {
                    let proceduresToDelete = [];
                    let anomalyName = this.selectedAnomaliesList[anomalyIndex];
                    for (let procedureIndex in this.anomalyList[anomalyIndex]['anomalyProcedures']) {
                        if (this.isComplete(this.anomalyList[anomalyIndex]['anomalyProcedures'][procedureIndex])) {
                            let procedure = this.anomalyList[anomalyIndex]['anomalyProcedures'][procedureIndex]['procedureName'];
                            proceduresToDelete.push(procedure);
                        }
                    }
                    if (proceduresToDelete.length > 0) {
                        for (let procedure in proceduresToDelete) {
                            let procedureName = proceduresToDelete[procedure];
                            let anomalyAndProcedure = [anomalyName, procedureName];
                            this.$store.dispatch('removeProcedures', anomalyAndProcedure);
                        }
                    }
                }
            },
            openFigure(url) {
                window.open(url, '_blank')
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

