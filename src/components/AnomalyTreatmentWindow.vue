<template>
    <div>
        <div class="title">Anomaly Treatment</div>
        <div class="columns">
            <div class="column">
                Signature:
                <div style="margin-left: 40px">
                    <ul>
                        <li>Battery is below threshold.</li>
                        <li>Pressure is above threshold.</li>
                        <li>Oxigen trend is anomalous.</li>
                    </ul>
                </div>
            </div>
            <div class="vertical-divider"></div>
            <div class="column">
                Diagnosis:
                <div style="margin-left: 40px">
                    <ol>
                        <li>N2 tank burst (87%)</li>
                        <li>Cabin leak (43%) </li>
                        <li>Fan malfunction (20%)</li>
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
    export default {
        name: "AnomalyTreatmentWindow"
    }
</script>

<style scoped>

</style>