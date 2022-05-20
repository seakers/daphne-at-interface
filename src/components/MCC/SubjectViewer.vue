<template>
  <div class="is-main" id="view-container">
    <div class="is-title">
      User: {{ userName }}
      <span style="float:right">Current stage: {{ currentStage }}</span>
    </div>
    <div class="is-content">
      <div class="columns">
        <div class="column is-7">
          <p class="is-mini-title" style="margin-bottom:20px">Daphne-AT display summary:</p>
          <div class="content">
            <p style="color: #0AFEFF">Selected symptoms at {{this.symptoms_timestamp}}:</p>
            <ul>
              <li style="color: white" v-for="symptom in selectedSymptomsList">{{ symptom["detection_text"] }}</li>
            </ul>
            <p style="color: #0AFEFF">Last provided diagnosis at {{ this.diagnosis_timestamp }} :</p>
            <ul>
              <li style="color: white" v-for="anomaly in lastProvidedDiagnosis">
                {{ anomaly['name'] }} (with a score of {{ anomaly['score'] }})
              </li>
            </ul>
            <p style="color: #0AFEFF">Selected anomalies at {{ this.anomalies_timestamp }}:</p>
            <ul>
              <li style="color: white" v-for="anomaly in selectedAnomaliesList">{{ anomaly }}</li>
            </ul>
            <p style="color: #0AFEFF">Selected procedures at {{ this.procedure_timestamp }}:</p>
            <ul>
              <li style="color: white" v-for="(procedureDict, procedureName) in selectedProceduresInfo">
                <p style="margin-bottom:2px">{{ procedureName }}</p>
                <p style="margin-left:20px">
                  Current Step -->
                  {{ writeCurrentStep(procedureDict, procedureName) }}
                </p>
              </li>
            </ul>
            <p style="color: #0AFEFF">Workload Answer at {{this.new_workload_timestamp}}:</p>
            <p style="color: white"> {{new_workload_answer}} </p>
          </div>
        </div>
        <div class="column is-5">
          <p class="is-mini-title" style="margin-bottom:20px">Chat History:</p>
          <div class="scrollable-mcccontainer">
            <ChatArea :dialogue-history="dialogueHistory"></ChatArea>
          </div>
          <div class="is-content" style="text-align: center">
            <div class="control">
              <button class="button is-info" v-on:click.prevent="switchAlarms">
                                <span class="icon is-small">
                                    <i class="fas"
                                       v-bind:class="[ this.playAlarms ? 'fa-volume-up' : 'fa-volume-off' ]"></i>
                                </span>
              </button>
              <input class="input" style="width:70%;background-color: var(--color__bg); border-color: var(--color__shadow); color: var(--color__text); "
                     type="text" name="workload_problem" v-model="workload_problem"/>
              <p>{{workload_timestamp}}</p>
            </div>

            <div class="control" style="margin-top: 10px">
              <button type="submit" class="button is-primary" v-on:click="openSituationalAwarenessModal" style="background-color: blue; width: 70%">
                Situational Awareness
              </button>
            </div>

            <!--            <div class="control" style="margin-top: 10px">-->
            <!--              <button type="submit" class="button is-primary" v-on:click="openWorkloadModal" style="background-color: blue; width: 70%">-->
            <!--                Workload-->
            <!--              </button>-->
            <!--            </div>-->

            <div class="control" style="margin-top: 10px">
              <button type="submit" class="button is-primary" v-on:click="openConfidenceModal" style="background-color: blue; width: 70%">
                Confidence
              </button>
            </div>

            <div class="control" style="margin-top: 10px">
              <button type="submit" class="button is-primary" v-on:click="sendMsgCorrect" style="background-color: green; width: 35%">
                Correct
              </button>
              <button type="submit" class="button is-primary" v-on:click="sendMsgIncorrect" style="background-color: red; width: 35%">
                Incorrect
              </button>
            </div>

            <div class="control" style="margin-top: 10px">
              <button type="submit" class="button is-primary" v-on:click="finishExperiment"
                      style="background-color: blue; width: 70%">
                Send Final Survey
              </button>
            </div>

            <div class="control" style="margin-top: 10px">
              <button type="submit" class="button is-primary" v-on:click="forceFinishExperiment"
                      style="background-color: red; width: 70%">
                Force Logout User
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

const Shepherd = require("shepherd.js");

export default {
  name: "SubjectViewer",
  props: ["userName", "userId"],
  data() {
    return {
      currentStage: [],
      dialogueHistory: [],
      selectedSymptomsList: [],
      new_selectedSymptomsList: [],
      selectedAnomaliesList: [],
      new_selectedAnomaliesList: [],
      selectedProceduresList: [],
      selectedProceduresInfo: {},
      new_selectedProceduresInfo:{},
      lastProvidedDiagnosis: [],
      new_lastProvidedDiagnosis: [],
      playAlarms: false,
      isLoggedIn: false,
      workload_answer: '',
      workload_problem:'',
      workload_timestamp: '',
      new_workload_answer: '',
      new_workload_timestamp: '',
      diagnosis_timestamp: '',
      symptoms_timestamp: '',
      anomalies_timestamp: '',
      procedure_timestamp: ''
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
          try {
            eval(state["daphneat"]["isLoggedIn"]);
            if (state["daphneat"]["isLoggedIn"] && state !== 'None') {
              this.currentStage = state["experiment"]["experimentStage"];
              this.dialogueHistory = state["daphne"]["dialogueHistory"];
              this.selectedSymptomsList = state["daphneat"]["selectedSymptomsList"];
              if (JSON.stringify(this.new_selectedSymptomsList) !== JSON.stringify(this.selectedSymptomsList)) {
                this.new_selectedSymptomsList = this.selectedSymptomsList;
                this.symptoms_timestamp = this.getNow();
              }
              this.selectedAnomaliesList = state["daphneat"]["selectedAnomaliesList"];
              if (JSON.stringify(this.new_selectedAnomaliesList) !== JSON.stringify(this.selectedAnomaliesList)) {
                this.new_selectedAnomaliesList = this.selectedAnomaliesList;
                this.anomalies_timestamp = this.getNow();
              }
              this.selectedProceduresList = state["daphneat"]["selectedProceduresList"];
              this.selectedProceduresInfo = state["daphneat"]["selectedProceduresInfo"];
              if (JSON.stringify(this.new_selectedProceduresInfo) !== JSON.stringify(this.selectedProceduresInfo)) {
                this.new_selectedProceduresInfo = this.selectedProceduresInfo;
                this.procedure_timestamp = this.getNow();
              }
              this.lastProvidedDiagnosis = state["daphneat"]["diagnosisReport"]["diagnosis_list"];
              if (JSON.stringify(this.new_lastProvidedDiagnosis) !== JSON.stringify(this.lastProvidedDiagnosis)) {
                this.new_lastProvidedDiagnosis = this.lastProvidedDiagnosis;
                this.diagnosis_timestamp = this.getNow();
              }
              this.new_workload_answer = state["daphneat"]["workload_answer"];
              if (this.new_workload_answer !== this.workload_answer) {
                this.workload_answer = this.new_workload_answer;
                this.new_workload_timestamp = this.getNow();
              }
            } else {
              this.currentStage = 'UNKNOWN';
              this.dialogueHistory = [];
              this.selectedSymptomsList = [];
              this.selectedAnomaliesList = [];
              this.selectedProceduresList = [];
              this.selectedProceduresInfo = [];
              this.workload_answer = [];
            }
          } catch (e) {
            this.currentStage = 'UNKNOWN';
            this.dialogueHistory = [];
            this.selectedSymptomsList = [];
            this.selectedAnomaliesList = [];
            this.selectedProceduresList = [];
            this.selectedProceduresInfo = [];
            this.workload_answer = [];
          }
        } else {
          console.error('Error retrieving user state.');
          this.currentStage = 'UNKNOWN';
          this.dialogueHistory = [];
          this.selectedSymptomsList = [];
          this.selectedAnomaliesList = [];
          this.selectedProceduresList = [];
          this.selectedProceduresInfo = [];
          this.workload_answer = [];
        }
      } catch (e) {
        console.error('Networking error:', e);
        this.currentStage = 'UNKNOWN';
        this.dialogueHistory = [];
        this.selectedSymptomsList = [];
        this.selectedAnomaliesList = [];
        this.selectedProceduresList = [];
        this.selectedProceduresInfo = [];
        this.workload_answer = [];
      }
    },
    async openSituationalAwarenessModal() {
      let reqData = new FormData();
      reqData.append('user_id', this.userId);
      await fetchPost(API_URL + 'experiment-at/situational-awareness', reqData);
    },
    async openConfidenceModal() {
      let reqData = new FormData();
      reqData.append('user_id', this.userId);
      await fetchPost(API_URL + 'experiment-at/confidence', reqData);
    },
    async sendMsgCorrect(){
      let reqData = new FormData();
      reqData.append('user_id', this.userId);
      await fetchPost(API_URL + 'experiment-at/send-msg-correct', reqData);
    },
    async sendMsgIncorrect(){
      let reqData = new FormData();
      reqData.append('user_id', this.userId);
      await fetchPost(API_URL + 'experiment-at/send-msg-incorrect', reqData);
    },
    async openWorkloadModal() {
      this.workload_timestamp = this.getNow();
      let reqData = new FormData();
      reqData.append('user_id', this.userId);
      reqData.append('workload_problem', this.workload_problem);
      await fetchPost(API_URL + 'experiment-at/workload', reqData);
    },
    async finishExperiment() {
      console.log('FINISH EXPERIMENT');
      let reqData = new FormData();
      reqData.append('user_id', this.userId);
      await fetchPost(API_URL + 'experiment-at/finish-experiment-from-mcc', reqData);
      this.$emit('remove-shown', this.userId);
    },
    async forceFinishExperiment() {
      console.log('FORCE FINISH EXPERIMENT');
      let reqData = new FormData();
      reqData.append('user_id', this.userId);
      await fetchPost(API_URL + 'experiment-at/force-finish-experiment-from-mcc', reqData);
      this.$emit('remove-shown', this.userId);
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
    getNow: function() {
      const today = new Date();
      const date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
      const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
      return date + ' ' + time;
    }
  },
  mounted() {
    this.refreshUserInformation();
    setInterval(this.refreshUserInformation, 1000);

  }
}
</script>

<style scoped>
.red-border {
  border: 5px red;
}
</style>