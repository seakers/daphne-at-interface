<template>
    <div>
        <div class="is-title">
            Anomaly Treatment
        </div>
        <div class="is-content">
            Diagnosis report: {{diagnosisReport}}
        </div>
    </div>
</template>

<script>
    import {mapGetters} from 'vuex'

    export default {
        name: "AnomalyTreatmentWindow",

        computed: {
            ...mapGetters({
                diagnosisReport: 'getDiagnosisReport'
            }),
        },

        methods: {
            requestDiagnosis() {
                this.$store.dispatch('requestDiagnosis', this.selectedSymptomsList);
            }
        }
    }
</script>

<style scoped>

</style>