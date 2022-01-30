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
          <p class="is-mini-title" style="margin-bottom:10px; margin-top: 20px;">Symptom Comparison Table</p>
          <div class="table-container" style="margin-bottom: 10px;">
            <table class="table is-bordered is-narrow is-hoverable is-fullwidth">
              <thead>
              <tr style="align-content: center; text-align: center">
                <td style="color: #0AFEFF; background: #002E2E">Anomaly<p>&darr;</p></td>
                <td v-bind:colspan="this.diagnosisReport['symptoms_list'].length" style="color: #0AFEFF; background: #002E2E">
                  Symptoms
                  <p>&larr;&rarr;</p>
                </td>
              </tr>
              <tr>
                <td></td>
                <td v-for="symptom in diagnosisReport['symptoms_list']">{{ symptom['detection_text'] }}</td>
              </tr>
              </thead>
              <tbody>
              <tr v-for="(anomaly) in diagnosisReport['diagnosis_list']">
                <td>{{ anomaly['name'] }}</td>
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
              </tr>
              </tbody>
            </table>
            <div style="width: 100%; text-align: center">
              <button class="button"
                      style="width: 55%; border-color: #0AFEFF; color: #0AFEFF; background: #002E2E;"
                      v-on:click.prevent="explainMore()">Provide More Explanation
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="horizontal-divider" style="margin-top: 10px; margin-bottom: 10px"></div>
      <div id="explanations" class="is-content">
        <div v-if="this.investigate">
          <img v-if="this.isLoading"
               src="assets/img/loader.svg"
               style="display: block; margin: auto;"
               height="40" width="40"
               alt="Loading spinner">
          <p class="is-mini-title" style="margin-bottom:10px">
            Explanations
            <u style="float: right; cursor: pointer" v-on:click.prevent="clearExplanations">Clear</u>
          </p>
          <div class="anomaly">
            <ul v-for="anomaly in diagnosisReport['diagnosis_list']">
              <li class="toggle-accordion">
                <input type="checkbox" style="width: 100%; height: 30px" checked>
                <div class="anomaly-header head">{{ anomaly['name'] }}</div>
                <div class="anomaly-body body">
                  <div class="anomaly-content">
                    <p>
                      <span style="margin-bottom:20px; color: #0AFEFF; background: #002E2E">Anomaly Score:</span>
                      {{ anomaly['score'] }}
                    </p>
                    <p>
                    <span
                        style="margin-bottom:20px; color: #0AFEFF; background: #002E2E">Number of symptoms present:</span>
                      {{ anomaly['cardinality'] }} out of {{ selectedSymptomsList.length }}
                    </p>
                    <span style="margin-bottom:20px; color: #0AFEFF; background: #002E2E">Anomaly Signature: </span>
                    <span v-for="item in anomaly['signature']">
                      <p style="margin-left: 20px">
                        {{ item }}
                      </p>
                    </span>
                    <p>
                      <span style="margin-bottom:20px; color: #0AFEFF; background: #002E2E">Number of occurrences in the past: </span>
                      6
                    </p>
                    <p>
                      <span
                          style="margin-bottom:20px; color: #0AFEFF; background: #002E2E">Resolution in the past: </span>
                      Using X procedure</p>
                  </div>
                  <div style="width: 100%; text-align: center">
                    <button class="button"
                            style="width: 55%; border-color: #0AFEFF; color: #0AFEFF; background: #002E2E; margin-bottom: 10px"
                            v-on:click.prevent="selectAnomaly( anomaly.name )">Select Anomaly
                    </button>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
        <p v-else>No explanations requested.</p>
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
      investigate: false,
    }
  },

  computed: {
    ...mapGetters({
      selectedSymptomsList: 'getSelectedSymptomsList',
      lastSelectedSymptomsList: 'getLastSelectedSymptomsList',
      diagnosisReport: 'getDiagnosisReport',
      selectedAnomalies: 'getSelectedAnomaliesList',
    }),
  },

  methods: {
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
      this.investigate = true;
      document.getElementById('explanations').style.display = "block";
    },
    clearExplanations() {
      this.investigate = false;
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