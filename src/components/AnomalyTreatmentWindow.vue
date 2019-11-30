<template>
    <div>
        <div class="title">Anomaly Treatment</div>
        <div class="columns">
            <div class="column">
                Signature:
                <div style="margin-left: 40px">
                    <ul>
                        <li v-for="message in signatureMessages">{{message}}</li>
                    </ul>
                </div>
            </div>
            <div class="vertical-divider"></div>
            <div class="column">
                Diagnosis:
                <div style="margin-left: 40px">
                    <ol>
                    </ol>
                </div>
            </div>
            <div class="vertical-divider"></div>
            <div class="column">
                Recommendations:
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
                signatureMessages: 'getSignatureMessages'
            }),
        }
    }
</script>

<style scoped>

</style>