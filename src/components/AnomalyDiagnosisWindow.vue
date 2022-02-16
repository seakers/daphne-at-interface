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
          <p style="color: red; font-weight: bold; margin-bottom: 10px"
             v-if="symptomsList.length > selectedSymptomsList.length">WARNING! You have selected only
            {{ this.selectedSymptomsList.length }} out of {{ this.symptomsList.length }} anomalous symptoms for
            diagnosis. </p>
          <div class="table-container" style="margin-bottom: 10px;">
            <table class="table is-bordered is-narrow is-hoverable is-fullwidth">
              <thead>
              <tr style="align-content: center; text-align: center; font-weight: bold;">
                <td style="color: #0AFEFF; background: #002E2E" rowspan="2"><p
                    title="Select the anomaly scenarios for further investigation by clicking on their respective checkboxes.">
                  Select</p>
                  <input type="checkbox" v-model='checkAll'
                         style="width: 70%; border-color: #0AFEFF; color: #0AFEFF; background: #002E2E;">
                </td>
                <td style="color: #0AFEFF; background: #002E2E" rowspan="2"><p
                    title="The names of potential anomaly scenarios from the Knowledge Graph.">Anomaly scenario</p></td>
                <td style="color: #0AFEFF; background: #002E2E" rowspan="2"><p
                    title="This column provides the total number of off-nominal measurements, also called symptoms, that usually define the signature of an anomaly scenario.">
                  Total number of symptoms in anomaly</p></td>
                <td v-bind:colspan="this.diagnosisReport['symptoms_list'].length"
                    style="color: #0AFEFF; background: #002E2E">
                  <p title="These are the symptoms that you have selected above for diagnosis. Note, that these selected symptoms may or may not be present in the signature of an anomaly scenario present in this table.">
                    Symptoms selected for diagnosis</p>
                </td>
                <td style="color: #0AFEFF; background: #002E2E" rowspan="2"><p
                    title="These are the number of symptoms that are missing from this table. This can mean either that they are not currently anomalous or that they are anomalous but you have not selected them for diagnosis.">
                  Symptoms missing</p></td>
                <td style="color: #0AFEFF; background: #002E2E" rowspan="2"><p
                    title="This column provides the likelihood of the respective anomaly being the current anomaly scenario. The closer to 1 the score is, the more likely it is the anomaly scenario.">
                  Likelihood Score</p></td>
              </tr>
              <tr>
                <td v-for="symptom in diagnosisReport['symptoms_list']">{{ symptom['detection_text'] }}</td>
              </tr>
              </thead>
              <tbody>
              <tr v-for="(anomaly) in diagnosisReport['diagnosis_list']">
                <td style="text-align: center; vertical-align: middle;">
                  <input type="checkbox" v-model="checked" :value="anomaly"
                         style="width: 70%; border-color: #0AFEFF; color: #0AFEFF; background: #002E2E;">
                </td>
                <td>{{ anomaly['name'] }}</td>
                <td style="text-align: center; vertical-align: middle"><p class="hover" style="cursor: pointer"
                                                                          v-bind:title="'The signature of this anomaly is: '+ anomaly['signature']"
                                                                          v-on:click="showSignature(anomaly)">
                  {{ anomaly['signature'].length }}</p></td>
                <td v-for="symptom in diagnosisReport['symptoms_list']"
                    style="text-align: center; vertical-align: middle;">
                  <span v-if="tickOrCross(anomaly['containsRequestedSymptoms'], symptom['detection_text']) === 'tick'"
                        class="checkmark">
                        <div class="checkmark_circle"></div>
                        <div class="checkmark_stem"></div>
                        <div class="checkmark_kick"></div>
                      </span>
                  <span v-if="tickOrCross(anomaly['containsRequestedSymptoms'], symptom['detection_text']) === 'cross'"
                        class="crosssign">
                        <div class="crosssign_circle"></div>
                        <div class="crosssign_stem"></div>
                        <div class="crosssign_stem2"></div>
                      </span>
                </td>
                <td style="text-align: center; vertical-align: middle"><p class="hover" style="cursor: pointer"
                                                                          v-bind:title="'The symptoms of this anomaly that are not present in this table are : '+ anomaly['missing_symptoms']"
                                                                          v-on:click="showMissingSymptoms(anomaly)">
                  {{ anomaly['missing_symptoms'].length }}</p></td>
                <td style="color:black; text-align: center; vertical-align: middle; font-weight: bold"
                    :style="{'background': anomaly['score']<1?(anomaly['score']<0.33 ? 'red' : 'yellow'):'green'}">
                  {{ anomaly['score'] }}
                </td>
              </tr>
              </tbody>
            </table>
            <div style="text-align: center">
              <p id="alert" style="display: none">Please select an anomaly to investigate.</p>
              <button class="button" type="submit" onclick="errorMessage()"
                      style="width: 55%; border-color: #0AFEFF; color: #0AFEFF; background: #002E2E;"
                      v-on:click.prevent="requestExplanations()">Investigate
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="horizontal-divider" style="margin-top: 10px; margin-bottom: 10px"></div>
      <div class="is-content">
        <div v-if="explanationsReport.length === 0">
          <img v-if="this.investigating"
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
            <ul v-for="explanation in this.explanationsReport['explanations']">
              <li class="toggle-accordion">
                <input type="checkbox" style="width: 100%; height: 30px" checked>
                <div class="anomaly-header head">{{ explanation['name'] }}</div>
                <div class="anomaly-body body">
                  <div class="anomaly-content">
                    <div class="columns">
                      <div class="column is-7">
                    <span style="margin-bottom:20px; color: #0AFEFF; background: #002E2E">Anomaly Signature: </span>
                    <span v-for="item in explanation['signature']">
                      <p style="margin-left: 20px">
                        {{ item }}
                      </p>
                    </span>
                      </div>
                      <div class="vertical-divider"></div>
                      <div class="column">
                    <span style="margin-bottom:20px; color: #0AFEFF; background: #002E2E">Number of occurrences in the past:</span>
                    {{explanation['num_occurrences'] }}
                      </div>
                    </div>
                    <div class="table-container" style="margin-bottom: 10px; margin-top: 10px">
                      <table class="table is-bordered is-narrow is-hoverable is-fullwidth">
                        <thead>
                        <tr style="align-content: center; text-align: center; font-weight: bold;">
                          <td style="color: #0AFEFF; background: #002E2E">Start Date</td>
                          <td style="color: #0AFEFF; background: #002E2E">Start Time</td>
                          <td style="color: #0AFEFF; background: #002E2E">End Date</td>
                          <td style="color: #0AFEFF; background: #002E2E">End Time</td>
                          <td style="color: #0AFEFF; background: #002E2E">Root Cause</td>
                          <td style="color: #0AFEFF; background: #002E2E">Resolution</td>
                        </tr>
                        </thead>
                        <tbody>
                        <tr v-for="occurrence in explanation['time']">
                          <td> {{ occurrence['start_date'] }}</td>
                          <td> {{ occurrence['start_time'] }}</td>
                          <td> {{ occurrence['end_date'] }}</td>
                          <td> {{ occurrence['end_time'] }}</td>
                          <td> {{ occurrence['root_cause'] }}</td>
                          <td> {{ occurrence['actions_taken'] }}</td>
                        </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div style="width: 100%; text-align: center">
                    <button class="button"
                            style="width: 55%; border-color: #0AFEFF; color: #0AFEFF; background: #002E2E; margin-bottom: 20px"
                            v-on:click.prevent="selectAnomaly(explanation['name'])">Resolve
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
      investigating: false,
      explaining: false
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
            checked.push(anomaly);
          });
        }
        this.checked = checked;
      }
    }
  },

  methods: {
    showSignature(anomaly) {
      const sign = 'The signature of the anomaly ' + anomaly['name'] + ' is: ';
      let text = sign + '<ul>';
      for (let symptom in anomaly['signature']) {
        text = text + '<li>' + anomaly['signature'][symptom] + '</li>'
      }
      const voice = sign + ' ' + anomaly['signature']
      text = text + '</ul>'
      if (this.command === 'stop') {
        responsiveVoice.cancel();
      } else {
        this.$store.commit('addDialoguePiece', {
          "voice_message": voice,
          "visual_message_type": ["text"],
          "visual_message": [text],
          "writer": "daphne"
        });
      }
    },
    showMissingSymptoms(anomaly) {
      const missing = 'The symptoms of the anomaly ' + anomaly['name'] + ' that are not present in this table are: ';
      let text = missing + '<ul>';
      for (let symptom in anomaly['missing_symptoms']) {
        text = text + '<li>' + anomaly['missing_symptoms'][symptom] + '</li>'
      }
      text = text + '</ul>'
      const voice = missing + ' ' + anomaly['missing_symptoms']
      if (this.command === 'stop') {
        responsiveVoice.cancel();
      } else {
        this.$store.commit('addDialoguePiece', {
          "voice_message": voice,
          "visual_message_type": ["text"],
          "visual_message": [text],
          "writer": "daphne"
        });
      }
    },
    errorMessage() {
      if (isNaN(document.getElementById("number").value)) {
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
    async requestExplanations() {
      if (this.checked.length === 0) {
        document.getElementById('alert').style.display = "block";
      } else {
        this.investigating = true;
        this.explaining = true;
        document.getElementById('alert').style.display = "none";
        await this.$store.dispatch('requestExplanations', this.checked);
        this.investigating = false;
        this.explaining = false;
        this.checked = [];
      }
    },
    clearExplanations() {
      // document.getElementById('explanations').style.display = "none";
      this.$store.dispatch('clearExplanationReport');
    },
    tickOrCross(anomaly, symptom) {
      let ticksOrCross = 'cross'
      for (let i = 0; i < anomaly.length; i++) {
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