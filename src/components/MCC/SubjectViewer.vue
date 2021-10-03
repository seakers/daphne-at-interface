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
                        <p style="color: #0AFEFF">Last provided diagnosis:</p>
                        <ul>
                            <li  v-for="anomaly in lastProvidedDiagnosis">
                                {{anomaly['name']}} (with a score of {{anomaly['score']}})
                            </li>
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
                                    {{writeCurrentStep(procedureDict, procedureName)}}
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
                            <a class="button is-info" v-on:click.prevent="switchAlarms">
                                <span class="icon is-small">
                                    <i class="fas" v-bind:class="[ this.playAlarms ? 'fa-volume-up' : 'fa-volume-off' ]"></i>
                                </span>
                            </a>
                        </div>
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
    import {mapGetters} from "vuex";

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
          lastProvidedDiagnosis: [],
          playAlarms: false,
          isLoggedIn: false
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
              if (state["daphneat"]["isLoggedIn"] && state !== 'None') {
                this.currentStage = state["experiment"]["experimentStage"];
                this.dialogueHistory = state["daphne"]["dialogueHistory"];
                this.selectedSymptomsList = state["daphneat"]["selectedSymptomsList"];
                this.selectedAnomaliesList = state["daphneat"]["selectedAnomaliesList"];
                this.selectedProceduresList = state["daphneat"]["selectedProceduresList"];
                this.selectedProceduresInfo = state["daphneat"]["selectedProceduresInfo"];
                this.lastProvidedDiagnosis = state["daphneat"]["diagnosisReport"]["diagnosis_list"];
              } else {
                this.currentStage = 'UNKNOWN';
                this.dialogueHistory = [];
                this.selectedSymptomsList = [];
                this.selectedAnomaliesList = [];
                this.selectedProceduresList = [];
                this.selectedProceduresInfo = [];
              }
            } else {
              console.error('Error retrieving user state.');
            }
          } catch (e) {
            console.error('Networking error:', e);
          }
        },
        async finishExperiment() {
          console.log('FINISH EXPERIMENT');
          let reqData = new FormData();
          reqData.append('user_id', this.userId);
          await fetchPost(API_URL + 'experiment-at/finish-experiment-from-mcc', reqData);
        },
        async switchAlarms() {
          console.log("Alarm was on " + this.playAlarms);
          this.playAlarms = !this.playAlarms;
          console.log("Alarm is now on " + this.playAlarms)
          let reqData = new FormData();
          reqData.append('user_id', this.userId);
          await fetchPost(API_URL + 'experiment-at/turn-off-alarms', reqData);
        },
        writeCurrentStep(procedureDict, procedureName) {
          let stepsList = procedureDict['checkableStepsList'];
          let currentStepIndex = procedureDict['procedureCurrentStep'];
          let totalSteps = procedureDict['checkableSteps'];

          if (currentStepIndex === totalSteps) {
            let message = 'COMPLETED (' + currentStepIndex + ' out of ' + totalSteps + ')';
            return message
          } else {
            try {
              let action = stepsList[currentStepIndex]['action'];
              let stepNumber = stepsList[currentStepIndex]['label'];
              let message = stepNumber + " - " + action + ' (' + currentStepIndex + ' out of ' + totalSteps + ')';
              return message
            } catch (err) {
              console.log('ERROR retrieving the procedure current step action.');
              return 'ERROR retrieving the procedure current step information.'
            }
          }
        },
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