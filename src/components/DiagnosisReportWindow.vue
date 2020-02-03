<template>
    <div>
        <div class="is-title">
            Diagnosis Report
        </div>
        <div class="is-content">
            <div v-if="diagnosisReport.length === 0">
                No diagnosis reports requested.
            </div>
            <div v-else class="columns">
                <div class="column is-3">
                    The set of symptoms
                </div>
                <div class="column is-3">
                    <ul>
                        <li  v-for="symptom in diagnosisReport['symptoms_list']">
                            {{symptom['measurement']}}: exceeds {{symptom['relationship']}}
                        </li>
                    </ul>
                </div>
                <div class="column is-3">
                    could be caused by the anomalies
                </div>
                <div class="column is-3">
                    <ul>
                        <li  v-for="anomaly in diagnosisReport['diagnosis_list']">
                            {{anomaly}}
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import {mapGetters} from 'vuex'

    export default {
        name: "DiagnosisReportWindow",

        computed: {
            ...mapGetters({
                diagnosisReport: 'getDiagnosisReport',
            }),
        },
    }
</script>

<style scoped>

</style>