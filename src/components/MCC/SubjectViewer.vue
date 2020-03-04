<template>
    <div class="is-main" id="view-container">
        <div class="is-title">
            User: {{userName}}
            <span  style="float:right">Current stage: {{currentStage}}</span>
        </div>
        <div class="is-content">
            <div class="columns">
                <div class="column is-7">
                    <p class="is-mini-title" style="margin-bottom:20px">Daphne-AT display summary:</p>
                    <div class="content">
                        <p style="color: #0AFEFF">Selected symptoms:</p>
                        <ul>
                            <li v-for="symptom in selectedSymptomsList">{{ symptom["detection_text"]}}</li>
                        </ul>
                        <p style="color: #0AFEFF">Selected anomalies:</p>
                        <ul>
                            <li v-for="anomaly in selectedAnomaliesList">{{ anomaly }}</li>
                        </ul>
                        <p style="color: #0AFEFF">Selected procedures:</p>
                        <ul>
                            <li v-for="(procedureDict, procedureName) in selectedProceduresInfo">
                                <p style="margin-bottom:2px">{{procedureName}}</p>
                                <p style="margin-left:20px">
                                    Current Step -->
                                    {{procedureDict['procedureStepsList'][procedureDict['procedureCurrentStep']]['action']}}
                                    ({{procedureDict['procedureCurrentStep']}} out of {{procedureDict['procedureStepsList'].length}})
                                </p>
                            </li>
                        </ul>
                    </div>
                </div>
                <div class="column is-5">
                    <p class="is-mini-title" style="margin-bottom:20px">Chat History:</p>
                    <div class="scrollable-mcccontainer">
                        <ChatArea :dialogue-history="dialogueHistory"></ChatArea>
                    </div>
                    <div class="is-content" style="float: right">
                        <div class="control">
                            <button type="submit" class="button is-primary" v-on:click="finishExperiment" style="background-color: red">
                                Finish Experiment
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import App from "../App";
    import {fetchPost} from "../../scripts/fetch-helpers";
    import ChatArea from "../ChatArea";
    import {actions} from "../../store/modules/daphne-at";

    export default {
        name: "SubjectViewer",
        props: ["userName", "userId"],
        data() {
            return {
                currentStage: [],
                dialogueHistory: [],
                selectedSymptomsList: [],
                selectedAnomaliesList: [],
                selectedProceduresList: [],
                selectedProceduresInfo: {},
            }
        },
        components: {
            ChatArea,
            App
        },
        methods: {
            async refreshUserInformation() {
                try {
                    let reqData = new FormData();
                    reqData.append('user_id', this.userId);

                    let dataResponse = await fetchPost(API_URL + 'experiment-at/get-state', reqData);

                    if (dataResponse.ok) {
                        // Add the new functionality
                        let state = await dataResponse.json();
                        if (state !== 'None') {
                            this.currentStage = state["experiment"]["experimentStage"];
                            this.dialogueHistory = state["daphne"]["dialogueHistory"];
                            this.selectedSymptomsList = state["daphneat"]["selectedSymptomsList"];
                            this.selectedAnomaliesList = state["daphneat"]["selectedAnomaliesList"];
                            this.selectedProceduresList = state["daphneat"]["selectedProceduresList"];
                            this.selectedProceduresInfo = state["daphneat"]["selectedProceduresInfo"];
                        }
                        else {
                            this.currentStage = 'UNKNOWN';
                            this.dialogueHistory = [];
                            this.selectedSymptomsList = [];
                            this.selectedAnomaliesList = [];
                            this.selectedProceduresList = [];
                            this.selectedProceduresInfo = [];
                        }
                    }
                    else {
                        console.error('Error retrieving user state.');
                    }
                }
                catch(e) {
                    console.error('Networking error:', e);
                }
            },
            async finishExperiment() {
                console.log('FINISH EXPERIMENT');
                let reqData = new FormData();
                reqData.append('user_id', this.userId);
                await fetchPost(API_URL + 'experiment-at/finish-experiment-from-mcc', reqData);
            }
        },
        mounted() {
            this.refreshUserInformation();
            setInterval(this.refreshUserInformation, 5000);
        }
    }
</script>

<style scoped>
.red-border {
    border: 5px red;
}
</style>