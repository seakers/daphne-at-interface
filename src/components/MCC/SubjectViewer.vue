<template>
    <div id="view-container">
        <h5>User: {{userName}}</h5>
        <div class="content">
            <h5>Experiment information:</h5>
            <p>Current stage: {{currentStage}}</p>
        </div>
        <div class="content">
            <h5>Chat History:</h5>
            <ChatArea :dialogue-history="dialogueHistory"></ChatArea>
        </div>
        <div class="content">
            <h5>Anomalies Summary:</h5>
            <p>Selected symptoms:</p>
            <ul>
                <li v-for="symptom in selectedSymptomsList">{{ symptom["detection_text"]}}</li>
            </ul>
            <p>Selected anomalies:</p>
            <ul>
                <li v-for="anomaly in selectedAnomaliesList">{{ anomaly }}</li>
            </ul>
            <p>Selected procedures:</p>
            <ul>
                <li v-for="(key, value) in selectedProceduresInfo">
                    {{key}} (Current Step: {{value['procedureStepList'][value['procedureCurrentStep']]}})
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
    import App from "../App";
    import {fetchPost} from "../../scripts/fetch-helpers";
    import ChatArea from "../ChatArea";
    import {mapGetters} from 'vuex';

    export default {
        name: "SubjectViewer",
        props: ["userName", "userId"],
        data() {
            return {
                currentStage: [],
                dialogueHistory: [],
                currentStep: 0
            }
        },
        computed: {
            ...mapGetters({
                selectedSymptomsList: 'getSelectedSymptomsList',
                selectedAnomaliesList: 'getSelectedAnomaliesList',
                selectedProceduresList: 'getSelectedProceduresList',
                selectedProceduresInfo: 'getSelectedProceduresInfo',
            }),
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
                        this.currentStage = state["experiment"]["experimentStage"];
                        this.dialogueHistory = state["daphne"]["dialogueHistory"];
                        this.selectedSymptomsList = state["daphneat"]["selectedSymptomsList"];
                        this.selectedAnomaliesList = state["daphneat"]["selectedAnomaliesList"];
                        // TODO: Add the rest when they exist
                    }
                    else {
                        console.error('Error retrieving user state.');
                    }
                }
                catch(e) {
                    console.error('Networking error:', e);
                }
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