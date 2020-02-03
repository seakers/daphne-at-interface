<template>
    <div>
        <div class="is-title">
            Symptoms Diagnosis
        </div>
        <div v-if="(this.selectedSymptomsList.length === 0)" class="is-content">
            No symptoms selected.
        </div>
        <div v-else class="columns" style="margin: 0px; padding: 10px">
            <div class="column is-10" style="margin: 0px; padding: 0px">
                <ul>
                    <li v-on:click="deselectSymptom(symptom)" v-for="symptom in selectedSymptomsList">
                        {{symptom['measurement']}}: exceeds {{symptom['relationship']}}.
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
</template>

<script>
    import {mapGetters} from 'vuex'

    export default {
        name: "DiagnosisRequestWindow",

        computed: {
            ...mapGetters({
                selectedSymptomsList: 'getSelectedSymptomsList',
            }),
        },

        methods: {
            deselectSymptom(symptom) {
                this.$store.commit('clearSelectedSymptom', symptom);
            },
            requestDiagnosis() {
                this.$store.commit('requestDiagnosis', this.selectedSymptomsList);
            }
        }
    }
</script>

<style scoped>

</style>