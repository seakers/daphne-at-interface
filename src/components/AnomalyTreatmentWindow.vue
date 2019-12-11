<template>
    <div>
        <div class="title">Anomaly Treatment</div>
        <div class="columns">
            <div class="column">
                Detection:
                <div style="margin-left: 40px">
                    <ul>
                        <li v-for="message in detectionMessages">{{message}}</li>
                    </ul>
                </div>
            </div>
            <div class="vertical-divider"></div>
            <div class="column">
                Diagnosis:
                <div style="margin-left: 40px">
                    <ul>
                        <li v-for="message in diagnosisMessages">{{message}}</li>
                    </ul>
                </div>
            </div>
            <div class="vertical-divider"></div>
            <div class="column">
                Recommendations:
                <div style="margin-left: 40px">
                    <ul>
                        <li v-for="message in recommendationMessages">{{message}}</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import {mapGetters} from 'vuex'

    export default {
        name: "AnomalyTreatmentWindow",

        computed: {
            ...mapGetters({
                detectionMessages: 'getDetectionMessages',
                diagnosisMessages: 'getDiagnosisMessages',
                recommendationMessages: 'getRecommendationMessages'
            }),
        }
    }
</script>

<style scoped>

</style>