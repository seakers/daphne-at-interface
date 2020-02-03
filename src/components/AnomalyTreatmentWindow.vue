<template>
    <div>
        <div class="is-title">Anomaly Treatment</div>
        <div class="is-content">
            <multiselect
                    :value="value"
                    :options="options"
                    :multiple="true"
                    :searchable="true"
                    :close-on-select="true"
                    :clear-on-select="false"
                    :preserve-search="true"
                    :allow-empty="true"
                    placeholder="No anomalies selected"
                    label="name"
                    selectLabel="Click to select"
                    deselectLabel="Click to remove"
                    openDirection="below"
                    track-by="name"
                    :preselect-first="true"
                    @select="newSelection">
            </multiselect>
        </div>
        <div v-if="selectedAnomalies.length > 0">
            <div v-for="anomaly in selectedAnomalies" class="is-content">
                <div class="columns">
                    <div class="column is-3">
                        <u>ANOMALY</u>
                        <p>{{anomaly['name']}}</p>
                    </div>
                    <div class="column is-3">
                        <u>PROCEDURE(S)</u>
                        <p>{{anomaly['procedure']}}</p>
                    </div>
                    <div class="column is-6">
                        <u>STEPS</u>
                        <p><- {{anomaly['steps'][0]}} -></p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import Multiselect from 'vue-multiselect'
    import { mapGetters, mapMutations } from 'vuex';


    export default {
        name: "AnomalyTreatmentWindow",

        data() {
            return {
                counterDict: {},
            }
        },

        computed: {
            ...mapGetters({
                selectedAnomalies: 'getSelectedAnomaliesDict',
                allAnomalies: 'getAllAnomaliesList',
            }),
            value ()  {
                let anomalies = this.selectedAnomalies;
                let aux = [];
                for (let index in anomalies) {
                    let anomaly = anomalies[index]['name'];
                    aux.push({'name': anomaly});
                }
                return aux;
            },
            options ()  {
                let anomalies = this.allAnomalies;
                let aux = [];
                for (let i = 0; i < anomalies.length; i++) {
                    aux.push({'name': anomalies[i]});
                }
                return aux;
            },
        },

        methods: {
            async newSelection(newSelectedAnomaly) {
                let anomaly = newSelectedAnomaly['name'];
                let procedure = await Promise.resolve(this.$store.dispatch('retrieveProcedureFromAnomaly', anomaly));
                let steps = await Promise.resolve(this.$store.dispatch('retrieveStepsFromProcedure', procedure));
                let newAnomaly = {'name': anomaly, 'procedure': procedure, 'steps': steps};
                this.$store.commit('updateSelectedAnomalies', newAnomaly);
                console.log(this.selectedAnomalies);
            },
            loadAnomalies() {
                this.$store.commit('loadAllAnomalies');
            },
        },

        mounted: function() {
            this.loadAnomalies()
        },

        watch: {
            // selectedAnomalies(newValue, oldValue) {
            //     console.log(oldValue);
            //     console.log(newValue);
            // }
        },

        components: {
            Multiselect,
        }
    }
</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>

<style scoped>

</style>