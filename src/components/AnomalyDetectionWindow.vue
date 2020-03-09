<template>
    <div id="anomaly-detection">
        <div class="is-title" v-bind:style="{'background': backgroundColor, 'color': fontColor}">
            Anomaly Detection
        </div>
        <div v-if="(this.symptomsList.length === 0)" class="is-content" style="min-height: 100px">
            No anomalous symptoms detected.
        </div>
        <div v-else class="is-content" style="min-height: 100px">
            <div class="columns">
                <div class="column is-6">
                    <ul>
                        <li v-on:click="selectSymptom(symptom)" v-for="symptom in symptomsListLeftColumn" style="cursor: pointer">
                            {{symptom['detection_text']}}
                        </li>
                    </ul>
                </div>
                <div class="column is-6">
                    <ul>
                        <li v-on:click="selectSymptom(symptom)" v-for="symptom in symptomsListRightColumn" style="cursor: pointer">
                            {{symptom['detection_text']}}
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import {mapGetters} from 'vuex'
    import {detectionColorStyle} from "../scripts/at-display-builders";

    export default {
        name: "AnomalyDetectionWindow",

        data: function() {
            return {
                backgroundColor: '#002E2E',
                fontColor: '#0AFEFF',
            }
        },

        computed: {
            ...mapGetters({
                symptomsList: 'getSymptomsList',
            }),
            symptomsListLeftColumn() {
                let aux = [];
                let symptomsList = this.symptomsList;
                for (let i = 0; i < symptomsList.length; i = i + 2) {
                    aux.push(symptomsList[i]);
                }
                return aux;
            },
            symptomsListRightColumn() {
                let aux = [];
                let symptomsList = this.symptomsList;
                for (let i = 1; i < symptomsList.length; i = i + 2) {
                    aux.push(symptomsList[i]);
                }
                return aux;
            }
        },

        methods: {
            selectSymptom(symptom) {
                this.$store.dispatch('addSelectedSymptom', symptom);
            }
        },

        watch: {
            symptomsList(newVal, oldVal) {
                let oldValJSON = JSON.stringify(oldVal);
                let newValJSON = JSON.stringify(newVal);
                if (oldValJSON !== newValJSON) {
                    let newSymptomsList = JSON.parse(newValJSON);
                    let theColors = detectionColorStyle(newSymptomsList);
                    let backgroundColor = theColors['background'];
                    let fontColor = theColors['font'];
                    this.backgroundColor = backgroundColor;
                    this.fontColor = fontColor;
                }
            }
        }
    }
</script>

<style scoped>

</style>