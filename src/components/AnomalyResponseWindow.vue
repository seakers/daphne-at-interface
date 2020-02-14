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

        <div v-for="anomalyDict in anomalyList" class="is-content">
            <div class="horizontal-divider"></div>
            <div class="columns">
                <div class="column is-5">
                    <p class="is-mini-title">Anomaly name</p>
                    <p>{{anomalyDict['anomalyName']}}</p>
                    <br>
                    <p class="is-mini-title">Name of the procedure(s) to be followed</p>
                    <ul v-for="procedureDict in anomalyDict['anomalyProcedures']">
                        <li style="list-style-type: disc; margin-left: 30px">
                            {{procedureDict['procedureName']}}
                        </li>
                    </ul>
                </div>
                <div class="column is-7">
                    <p class="is-mini-title">Steps to be followed for each procedure</p>
                    <div v-for="procedureDict in anomalyDict['anomalyProcedures']">
                        <br><b>
                        {{procedureDict['procedureName']}}
                        ({{procedureDict['procedureCurrentStep']}}
                        out of
                        {{procedureDict['procedureSteps'].length}}
                        steps performed)
                        <span v-if="isComplete(procedureDict)" style="color: greenyellow"> COMPLETED</span>
                        <span v-else style="color: red"> PENDING</span>
                    </b>
                        <div  class="scrollable-container">
                            <div v-for="(stepName, index) in procedureDict['procedureSteps']">
                                <input type="checkbox" v-on:click="checkIt(procedureDict, index)"
                                       :checked="isChecked(procedureDict, index)" :disabled="!isEnabled(procedureDict, index)">
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

        data() {
            return {
                dodgeThis: false,
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
            anomalyList() {
                // **************************************************
                // The idea is to build a list object named anomalyList where each element is a dictionary with the information of each selected anomaly:
                //     anomalyList = [anomalyDict1, anomalyDict2, ...]
                //     Where the anomalyDict dictionary is as follows:
                //          anomalyDict = {'anomalyName': string, 'anomalyProcedures': procedureList}
                //          Where the procedureList list is as follows:
                //               procedureList = [procedureDict1, procedureDict2, ...]
                //               Where the procedureDict dictionary is as follows:
                //                    procedureDict = {'procedureName': string, 'procedureSteps': procedureList, 'procedureCurrentStep': int}
                // **************************************************

                // Do it
                let dodgeThis = this.dodgeThis;
                let anomalyList = [];
                for (let anomalyIndex in this.selectedAnomaliesList) {
                    let anomalyDict = {};
                    let anomalyName = this.selectedAnomaliesList[anomalyIndex];
                    let procedureList = [];
                    for (let procedureIndex in this.selectedAnomaliesInfo[anomalyName]['anomalyProcedures']) {
                        let procedureDict = {};
                        let procedureName = this.selectedAnomaliesInfo[anomalyName]['anomalyProcedures'][procedureIndex];
                        let procedureSteps = this.selectedProceduresInfo[procedureName]['procedureStepsList'];
                        let procedureCurrentStep = this.selectedProceduresInfo[procedureName]['currentStep'];
                        procedureDict['procedureName'] = procedureName;
                        procedureDict['procedureSteps'] = procedureSteps;
                        procedureDict['procedureCurrentStep'] = procedureCurrentStep;
                        procedureList.push(procedureDict);
                    }
                    anomalyDict['anomalyName'] = anomalyName;
                    anomalyDict['anomalyProcedures'] = procedureList;
                    anomalyList.push(anomalyDict);
                }
                console.log(anomalyList);
                return anomalyList;
            }
        },

        methods: {
            async newSelection(selectedAnomaly) {
                let anomalyName = selectedAnomaly['name'];
                if (!this.selectedAnomaliesList.includes(anomalyName)) {
                    await this.$store.dispatch('parseAndAddSelectedAnomaly', anomalyName);
                }
            },
            async newDeselection(deselectedAnomaly) {
                let anomalyName = deselectedAnomaly['name'];
                this.$store.commit('removeSelectedAnomaly', anomalyName)
            },
            loadAnomalies() {
                this.$store.dispatch('loadAllAnomalies');
            },
            isChecked(procedureDict, index) {
                let currentStep = procedureDict['procedureCurrentStep'];
                return index < currentStep;
            },
            isEnabled(procedureDict, index) {
                let currentStep = procedureDict['procedureCurrentStep'];
                return index === currentStep || index === currentStep - 1;
            },
            isComplete(procedureDict) {
                let currentStep = procedureDict['procedureCurrentStep'];
                let totalSteps = procedureDict['procedureSteps'].length;
                return currentStep === totalSteps;
            },
            checkIt(procedureDict, index) {
                let isChecked = this.isChecked(procedureDict, index);
                let stepIncrement = 0;
                if (isChecked) {stepIncrement = -1}
                else {stepIncrement = 1}
                let newCurrentStep = procedureDict['procedureCurrentStep'] + stepIncrement;
                let commitInfo = {'procedureName': procedureDict['procedureName'], 'newCurrentStep': newCurrentStep};
                this.$store.commit('updateProcedureCurrentStep', commitInfo);
                this.shoot();
            },
            shoot() {
                this.dodgeThis = !this.dodgeThis;
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