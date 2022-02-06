<template>
  <div id="anomaly_diagnosis">
    <div class="is-title">
      Anomaly Diagnosis
      <span class="tutorialLink">
                <u v-on:click.prevent="diagnosisTutorial">?</u>
            </span>
    </div>
    <div class="is-content">
      <div class="is-content">
        <div v-if="(this.selectedSymptomsList.length === 0)">
          No anomalous symptoms selected.
        </div>
        <div v-else class="columns" style="margin: 0px; padding: 0px">
          <div class="column is-10" style="margin: 0px; padding: 0px">
            <ul>
              <li class="hover" v-on:click="deselectSymptom(symptom)" v-for="symptom in selectedSymptomsList"
                  style="cursor: pointer">
                {{ symptom['detection_text'] }}
              </li>
            </ul>
          </div>
          <div class="column is-2" style="margin: 0px; padding: 0px">
            <button class="button" style="width: 52%; border-color: #0AFEFF; color: #0AFEFF; background: #002E2E"
                    id="request_diagnosis" v-on:click.prevent="requestDiagnosis">Diagnose
            </button>
            <button class="button" style="width: 38%; border-color: #0AFEFF; color: #0AFEFF; background: #002E2E"
                    id="clear_symptoms" v-on:click.prevent="clearSymptoms">Clear
            </button>
          </div>
        </div>
      </div>
      <div class="horizontal-divider" style="margin-top: 10px; margin-bottom: 10px"></div>
      <div class="is-content">
        <div v-if="diagnosisReport.length === 0">
          <img v-if="isLoading"
               src="assets/img/loader.svg"
               style="display: block; margin: auto;"
               height="40" width="40"
               alt="Loading spinner">
          <p v-else>No diagnosis reports requested.</p>
        </div>
        <div v-else>
          <div class="columns" style="margin: 0px; padding: 0px">
            <div class="column is-6" style="margin: 0px; padding: 0px">
              <span style="margin-bottom:20px; color: #0AFEFF; background: #002E2E">Set of symptoms selected for diagnosis:</span>
              <ul>
                <li class="hover" v-for="symptom in diagnosisReport['symptoms_list']" v-on:click="recoverSymptomsList()"
                    style="cursor: pointer">
                  {{ symptom['detection_text'] }}
                </li>
              </ul>
            </div>
            <div class="column is-6" style="margin: 0px; padding: 0px">
              <span style="margin-bottom:20px; color: #0AFEFF; background: #002E2E">Could be caused by anomalies:</span>
              <ul>
                <li v-for="anomaly in diagnosisReport['diagnosis_list']">
                  {{ anomaly['name'] }} ({{ anomaly['text_score'] }})
                </li>
              </ul>
            </div>
            <div style="margin: 0px; padding: 0px">
              <a script="float:right" v-on:click.prevent="clearFullDiagnosisReport">
                x
              </a>
            </div>
          </div>
          <p class="is-mini-title" style="margin-top: 30px; margin-bottom: 10px">Symptom Comparison Table</p>
          <p style="color: red; font-weight: bold; margin-bottom: 10px" v-if="symptomsList.length > selectedSymptomsList.length">ALERT! You have selected only {{this.selectedSymptomsList.length}} out of {{this.symptomsList.length}} anomalous symptoms for diagnosis. </p>
          <div class="table-container" style="margin-bottom: 10px;">
            <table class="table is-bordered is-narrow is-hoverable is-fullwidth">
              <thead>
              <tr style="align-content: center; text-align: center; font-weight: bold;">
                <td style="color: #0AFEFF; background: #002E2E" rowspan="2">Select
                  <input type="checkbox" v-model='checkAll' style="width: 70%; border-color: #0AFEFF; color: #0AFEFF; background: #002E2E;">
                </td>
                <td style="color: #0AFEFF; background: #002E2E" rowspan="2">Anomaly scenario</td>
                <td style="color: #0AFEFF; background: #002E2E" rowspan="2">Total number of symptoms in anomaly</td>
                <td v-bind:colspan="this.diagnosisReport['symptoms_list'].length" style="color: #0AFEFF; background: #002E2E">
                  Symptoms selected for diagnosis
                </td>
                <td style="color: #0AFEFF; background: #002E2E" rowspan="2">Likelihood Score</td>
              </tr>
              <tr>
                <td v-for="symptom in diagnosisReport['symptoms_list']">{{ symptom['detection_text'] }}</td>
              </tr>
              </thead>
              <tbody>
              <tr v-for="(anomaly) in diagnosisReport['diagnosis_list']">
                <td style="text-align: center; vertical-align: middle;">
                  <input type="checkbox" v-model="checked" :value="anomaly['name']"
                          style="width: 70%; border-color: #0AFEFF; color: #0AFEFF; background: #002E2E;">
                </td>
                <td>{{ anomaly['name'] }}</td>
                <td style="text-align: center; vertical-align: middle">{{ anomaly['signature'].length }}</td>
                <td v-for="symptom in diagnosisReport['symptoms_list']" style="text-align: center; vertical-align: middle;">
                  <span v-if="tickOrCross(anomaly['containsRequestedSymptoms'], symptom['detection_text']) === 'tick'" class="checkmark">
                        <div class="checkmark_circle"></div>
                        <div class="checkmark_stem"></div>
                        <div class="checkmark_kick"></div>
                      </span>
                    <span v-if="tickOrCross(anomaly['containsRequestedSymptoms'], symptom['detection_text']) === 'cross'" class="crosssign">
                        <div class="crosssign_circle"></div>
                        <div class="crosssign_stem"></div>
                        <div class="crosssign_stem2"></div>
                      </span>
                </td>
                <td style="color:black; text-align: center; vertical-align: middle; font-weight: bold" :style="{'background': anomaly['score']<1?(anomaly['score']<0.33 ? 'red' : 'yellow'):'green'}">{{anomaly['score']}}</td>
              </tr>
              </tbody>
            </table>
            <div style="text-align: center">
              <p id="alert" style="display: none">Please select an anomaly to investigate.</p>
              <button class="button" type="submit" onclick="errorMessage()"
                      style="width: 55%; border-color: #0AFEFF; color: #0AFEFF; background: #002E2E;"
                      v-on:click.prevent="explainMore()">Investigate
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="horizontal-divider" style="margin-top: 10px; margin-bottom: 10px"></div>
      <div class="is-content">
        <div v-if="this.investigating !== true">
          <img v-if="isLoading"
               src="assets/img/loader.svg"
               style="display: block; margin: auto;"
               height="40" width="40"
               alt="Loading spinner">
          <p v-else>No explanations requested.</p>
        </div>
        <div v-else id="explanations">
          <div class="is-mini-title" style="margin-bottom:10px">
            Explanations
            <u style="float: right; cursor: pointer" v-on:click.prevent="clearExplanations">Clear</u>
          </div>
          <div class="anomaly">
            <ul v-for="anomaly in diagnosisReport['diagnosis_list']">
              <li class="toggle-accordion">
                <input type="checkbox" style="width: 100%; height: 30px" checked>
                <div class="anomaly-header head">{{ anomaly['name'] }}</div>
                <div class="anomaly-body body">
                  <div class="anomaly-content columns">
                    <div class="column">
                      <p>
                    <span
                        style="margin-bottom:20px; color: #0AFEFF; background: #002E2E">Total symptoms in anomaly:</span>
                        {{ anomaly['signature'].length }}
                      </p>
                      <span style="margin-bottom:20px; color: #0AFEFF; background: #002E2E">Anomaly Signature: </span>
                      <span v-for="item in anomaly['signature']">
                      <p style="margin-left: 20px">
                        {{ item }}
                      </p>
                    </span>
                    </div>
                    <div class="vertical-divider" style="margin-top: 10px; margin-bottom: 10px"></div>
                    <div class="column">
                      <p>
                        <span style="margin-bottom:20px; color: #0AFEFF; background: #002E2E">Number of occurrences in the past: </span>
                        6
                      </p>
                      <p>
                      <span
                          style="margin-bottom:20px; color: #0AFEFF; background: #002E2E">Resolution in the past: </span>
                        Using X procedure</p>
                    </div>
                  </div>
                  <div style="width: 100%; text-align: center">
                    <button class="button"
                            style="width: 55%; border-color: #0AFEFF; color: #0AFEFF; background: #002E2E; margin-bottom: 10px"
                            v-on:click.prevent="selectAnomaly( anomaly.name )">Resolve
                    </button>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {mapGetters} from 'vuex';
let loaderImage = require('../images/loader.svg');

export default {
  name: "AnomalyDiagnosisWindow",

  data: function () {
    return {
      isLoading: false,
      isAnomalySelected: false,
      anomaliesForExplanations: '',
      checked: [],
      investigating: false
    }
  },

  computed: {
    ...mapGetters({
      symptomsList: 'getSymptomsList',
      selectedSymptomsList: 'getSelectedSymptomsList',
      lastSelectedSymptomsList: 'getLastSelectedSymptomsList',
      diagnosisReport: 'getDiagnosisReport',
      explanationsReport: 'getExplanationsReport',
      selectedAnomalies: 'getSelectedAnomaliesList',
    }),
    checkAll: {
      get: function () {
        return this.diagnosisReport['diagnosis_list'] ? this.checked.length === this.diagnosisReport['diagnosis_list'].length : false;
      },
      set: function (value) {
        let checked = [];
        if (value) {
          this.diagnosisReport['diagnosis_list'].forEach(function (anomaly) {
            checked.push(anomaly['name']);
          });
        }
        this.checked = checked;
      }
    }
  },

  methods: {
    errorMessage(){
      if (isNaN(document.getElementById("number").value))
      {
        // Changing content and color of content
        error.textContent = "Please select anomalies for investigation."
        error.style.color = "red"
      } else {
        error.textContent = ""
      }
    },
    deselectSymptom(symptom) {
      this.$store.dispatch('removeSelectedSymptom', symptom);
    },
    clearSymptoms() {
      this.$store.dispatch('clearSelectedSymptoms');
    },
    clearFullDiagnosisReport() {
      this.$store.dispatch('clearDiagnosisReport');
    },
    async requestDiagnosis() {
      this.isLoading = true;
      await this.$store.dispatch('requestDiagnosis', this.selectedSymptomsList);
      this.isLoading = false;
    },
    async selectAnomaly(anomalyName) {
      this.isAnomalySelected = true;
      if (!this.selectedAnomalies.includes(anomalyName)) {
        await this.$store.dispatch('addSelectedAnomaly', anomalyName);
        this.isAnomalySelected = false;
      }
    },
    recoverSymptomsList() {
      this.$store.dispatch('recoverSymptomsList')
    },
    diagnosisTutorial(event) {
      this.$root.$emit('diagnosisTutorialIndividual');
    },
    explainMore() {
      if (this.checked.length === 0) {
        document.getElementById('alert').style.display = "block";
      }
      else {
        this.investigating = true;
        this.isLoading = true;
        document.getElementById('alert').style.display = "none";
      }
      //   document.getElementById('explanations').style.display = "block";
      //   this.investigating = false;
      //   this.isLoading = false;
      // }
    },
    clearExplanations() {
      document.getElementById('explanations').style.display = "none";
    },
    tickOrCross(anomaly, symptom) {
      let ticksOrCross = 'cross'
      for (let i = 0; i < anomaly.length; i++){
        if (anomaly[i] === symptom) {
          ticksOrCross = 'tick'
        }
      }
      return ticksOrCross;
    },
  }
}
</script>

<style scoped>
.hover:hover {
  font-weight: bold;
}

.checkmark {
  display: inline-block;
  width: 22px;
  height: 22px;
  -ms-transform: rotate(45deg); /* IE 9 */
  -webkit-transform: rotate(45deg); /* Chrome, Safari, Opera */
  transform: rotate(45deg);
}

.checkmark_circle {
  position: absolute;
  width: 22px;
  height: 22px;
  background-color: green;
  border-radius: 11px;
  left: 0;
  top: 0;
}

.checkmark_stem {
  position: absolute;
  width: 3px;
  height: 12px;
  background-color: #fff;
  left: 11px;
  top: 5px;
}

.checkmark_kick {
  position: absolute;
  width: 3px;
  height: 3px;
  background-color: #fff;
  left: 8px;
  top: 14px;
}
.crosssign {
  display: inline-block;
  width: 22px;
  height: 22px;
  position: relative;
  transform: rotate(45deg);
}

.crosssign_circle {
  position: absolute;
  width: 22px;
  height: 22px;
  background-color: red;
  border-radius: 11px;
  left: 0;
  top: 0;
}

.crosssign_stem,
.crosssign_stem2 {
  position: absolute;
  background-color: #fff;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.crosssign_stem {
  width: 3px;
  height: 12px;
}

.crosssign_stem2 {
  width: 12px;
  height: 3px;
}

</style>