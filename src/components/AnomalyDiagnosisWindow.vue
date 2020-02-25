<template>
    <div id="anomaly_diagnosis">
        <div class="is-title">
            Anomaly Diagnosis
        </div>
        <div class="is-content">
            <div class="is-content">
                <div v-if="(this.selectedSymptomsList.length === 0)" >
                    No anomalies selected.
                </div>
                <div v-else class="columns" style="margin: 0px; padding: 0px">
                    <div class="column is-10" style="margin: 0px; padding: 0px">
                        <ul>
                            <li v-on:click="deselectSymptom(symptom)" v-for="symptom in selectedSymptomsList">
                                {{symptom['detection_text']}}
                            </li>
                        </ul>
                    </div>
                    <div class="column is-2" style="margin: 0px; padding: 0px">
                        <a class="button is-small-button" v-on:click.prevent="requestDiagnosis">
                            Diagnose
                        </a>
                    </div>
                </div>
            </div>
            <div class="horizontal-divider" style="margin-top: 10px; margin-bottom: 10px"></div>
            <div class="is-content">
                <div v-if="diagnosisReport.length === 0">
                    No diagnosis reports requested.
                </div>
                <div v-else class="columns" style="margin: 0px; padding: 0px">
                    <div class="column is-2" style="margin: 0px; padding: 0px">
                        The set of anomalies
                    </div>
                    <div class="column is-4" style="margin: 0px; padding: 0px">
                        <ul>
                            <li  v-for="symptom in diagnosisReport['symptoms_list']">
                                {{symptom['detection_text']}}
                            </li>
                        </ul>
                    </div>
                    <div class="column is-2" style="margin: 0px; padding: 0px">
                        could be caused by:
                    </div>
                    <div class="column is-4" style="margin: 0px; padding: 0px">
                        <ul>
                            <li  v-on:click="selectAnomaly(anomaly)" v-for="anomaly in diagnosisReport['diagnosis_list']">
                                {{anomaly}}
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import {mapGetters} from 'vuex'

    export default {
        name: "AnomalyDiagnosisWindow",

        computed: {
            ...mapGetters({
                selectedSymptomsList: 'getSelectedSymptomsList',
                diagnosisReport: 'getDiagnosisReport',
                selectedAnomalies: 'getSelectedAnomaliesList',
            }),
        },

        methods: {
            deselectSymptom(symptom) {
                this.$store.dispatch('removeSelectedSymptom', symptom);
            },
            requestDiagnosis() {
                this.$store.dispatch('requestDiagnosis', this.selectedSymptomsList);
            },
            selectAnomaly(anomalyName) {
                if (!this.selectedAnomalies.includes(anomalyName)) {
                    this.$store.dispatch('addSelectedAnomaly', anomalyName);
                }
            }
        }
    }
</script>

<style scoped>

</style>