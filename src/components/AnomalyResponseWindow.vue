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
                        {{procedureDict['procedureName']}}
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
                                <span style="color: #0AFEFF; background: #002E2E">Objective </span>
                                {{procedureDict['procedureObjective']}}
                            </p>
                            <p style="margin-top: 10px">
                                <span style="color: #0AFEFF; background: #002E2E">Equipment</span>
                            </p>
                            <ul v-for="item in procedureDict['procedureEquipment']">
                                <li style="margin-left: 20px">
                                    {{item}}
                                </li>
                            </ul>
                            <p v-if="procedureDict['procedureReferences'].length > 0" style="margin-top: 10px">
                                <span style="color: #0AFEFF; background: #002E2E">References</span>
                            </p>
                            <ul v-if="procedureDict['procedureReferences'].length > 0" v-for="(item, itemIndex) in procedureDict['procedureReferences']">
                                <li v-on:click="openReference(procedureDict['procedureReferenceLinks'][itemIndex])" style="margin-left: 20px">
                                    {{item}}
                                </li>
                            </ul>
                            <p v-if="procedureDict['procedureFigures'].length > 0" style="margin-top: 10px">
                                <span style="color: #0AFEFF; background: #002E2E">Figures </span>
                            </p>
                            <ul v-for="(item, itemIndex) in procedureDict['procedureFigures']">
                                <li v-on:click="openFigure(item)" style="margin-left: 20px; cursor: pointer">
                                    Figure {{itemIndex+1}}
                                </li>
                            </ul>
                            <p style="margin-top: 10px">
                                <span style="color: #0AFEFF; background: #002E2E">Steps to follow</span>
                                ({{procedureDict['procedureCurrentStep']}}
                                out of
                                {{procedureDict['checkableSteps']}}
                                steps performed)
                            </p>
                            <div  class="scrollable-container" style="margin-left: 20px">
                                <div v-for="(stepItem, stepIndex) in procedureDict['procedureSteps']">
                                    <input v-if="!stepItem['isStep']" type="checkbox"
                                           v-bind:style="{'margin-left': computeLeftMargin(stepItem)}"
                                           v-on:click="checkIt(procedureDict, stepIndex)"
                                           :checked="stepItem['isDone']">
                                    <label>{{stepItem['label']}} - {{stepItem['action']}}
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
                response: 'getResponse',
                prevResponse: 'getPrevResponse',
            }),
            value()  {
                let aux = [];
                for (let index in this.selectedAnomaliesList) {aux.push({'name': this.selectedAnomaliesList[index]})}
                return aux;
            },
            options()  {
                let aux = [];
                for (let i = 0; i < this.allAnomalies.length; i++) {aux.push({'name': this.allAnomalies[i]})}
                return aux.sort();
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
                        let procedureCheckableSteps = this.selectedProceduresInfo[procedureName]['checkableSteps'];
                        let procedureCheckableStepsList = this.selectedProceduresInfo[procedureName]['checkableStepsList'];
                        let procedureCurrentStep = this.selectedProceduresInfo[procedureName]['procedureCurrentStep'];
                        let procedureObjective = this.selectedProceduresInfo[procedureName]['procedureObjective'];
                        let procedureEquipment = this.selectedProceduresInfo[procedureName]['procedureEquipment'];
                        let procedureReferences = this.selectedProceduresInfo[procedureName]['procedureReferences'];
                        let procedureReferenceLinks = this.selectedProceduresInfo[procedureName]['procedureReferenceLinks'];
                        let procedureFigures = this.selectedProceduresInfo[procedureName]['procedureFigures'];
                        let procedureIsOpen = this.selectedProceduresInfo[procedureName]['procedureIsOpen'];
                        procedureDict['procedureName'] = procedureName;
                        procedureDict['procedureSteps'] = procedureSteps;
                        procedureDict['checkableSteps'] = procedureCheckableSteps;
                        procedureDict['checkableStepsList'] = procedureCheckableStepsList;
                        procedureDict['procedureCurrentStep'] = procedureCurrentStep;
                        procedureDict['procedureObjective'] = procedureObjective;
                        procedureDict['procedureEquipment'] = procedureEquipment;
                        procedureDict['procedureReferences'] = procedureReferences;
                        procedureDict['procedureReferenceLinks'] = procedureReferenceLinks;
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
                let totalSteps = procedureDict['checkableSteps'];
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
                    if (newProcedureDict['procedureSteps'][i]['depth'] > 0) {
                        if (newProcedureDict['procedureSteps'][i]['isDone']) {
                            numberOfCheckedBoxes += 1;
                        }
                    }
                }
                newProcedureDict['procedureCurrentStep'] = numberOfCheckedBoxes;
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
                window.open(window.location.href + "api/at/recommendation/figure?filename=%2Fhome%2Fubuntu%2Fdaphne-at-interface%2Fsrc%2Fimages%2F" + url, '_blank')
            },
            openReference(url) {
                if (url !== "None") {
                    window.open(window.location.href + "api/at/recommendation/procedure?filename=%2Fhome%2Fubuntu%2Fdaphne_brain%2FAT%2Fdatabases%2Fprocedures%2F" + url, '_blank')
                }
            }
        },
        mounted: function() {
            this.loadAnomalies()
        },
        watch: {
            response: function (val, oldval) {
                for (let anomaly in this.anomalyList) {
                    for (let procedure in this.anomalyList[anomaly]['anomalyProcedures']) {
                        for (let step in this.anomalyList[anomaly]['anomalyProcedures'][procedure]['procedureSteps']) {
                            let currComparison = this.anomalyList[anomaly]['anomalyProcedures'][procedure]['procedureSteps'][step]['label'] + ", " + this.anomalyList[anomaly]['anomalyProcedures'][procedure]['procedureSteps'][step]['action'];
                            if (currComparison == this.response) {
                                let nextPrev;
                                let prevPrev;
                                if ((parseInt(step)-1) > -1) {
                                    nextPrev = this.anomalyList[anomaly]['anomalyProcedures'][procedure]['procedureSteps'][parseInt(step)-1]['label'] + ", " + this.anomalyList[anomaly]['anomalyProcedures'][procedure]['procedureSteps'][parseInt(step)-1]['action'];
                                }

                                if ((parseInt(step)+1) < this.anomalyList[anomaly]['anomalyProcedures'][procedure]['procedureSteps'].length) {
                                    prevPrev = this.anomalyList[anomaly]['anomalyProcedures'][procedure]['procedureSteps'][parseInt(step)+1]['label'] + ", " + this.anomalyList[anomaly]['anomalyProcedures'][procedure]['procedureSteps'][parseInt(step)+1]['action'];
                                }

                                if (this.prevResponse == nextPrev) {
                                    this.anomalyList[anomaly]['anomalyProcedures'][procedure]['procedureSteps'][parseInt(step)-1]['isDone'] = true;
                                }
                                else if (this.prevResponse == prevPrev) {
                                    this.anomalyList[anomaly]['anomalyProcedures'][procedure]['procedureSteps'][step]['isDone'] = false;
                                }
                                else if (step == 1) {
                                    this.anomalyList[anomaly]['anomalyProcedures'][procedure]['procedureSteps'][parseInt(step)-1]['isDone'] = true;
                                }
                                console.log("Previous " + this.prevResponse);
                                console.log("PrevPrev " + prevPrev);
                            }
                        }
                    }
                }
            },
        },

        components: {
            Multiselect,
        }
    }
</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>

<style scoped>

</style>

