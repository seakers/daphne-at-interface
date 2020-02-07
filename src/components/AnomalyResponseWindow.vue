<template>
    <div>
        <div class="is-title">
            Anomaly Response
        </div>
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
                    @select="newSelection"
                    @remove="newDeselection">
            </multiselect>
        </div>
        <div v-for="(Info, anomalyName) in selectedAnomaliesInfo" class="is-content">
            <div class="columns">
                <div class="column is-4">
                    <u>Anomaly name</u>
                    <p>{{anomalyName}}</p>
                </div>
                <div class="column is-4">
                    <u>Procedure to be followed</u>
                    <p>{{Info['procedure']}}</p>
                </div>
                <div class="column is-6">
                    <u>Current procedure step</u>
                    <p>{{Info['stepsList'][Info['currentStep']]}}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import Multiselect from 'vue-multiselect'
    import { mapGetters, mapMutations } from 'vuex';


    export default {
        name: "AnomalyResponseWindow",

        computed: {
            ...mapGetters({
                selectedAnomaliesList: 'getSelectedAnomaliesList',
                selectedAnomaliesInfo: 'getSelectedAnomaliesInfo',
                allAnomalies: 'getAllAnomaliesList',
            }),
            value ()  {
                let anomalies = this.selectedAnomaliesList;
                let aux = [];
                for (let index in anomalies) {
                    let anomaly = anomalies[index];
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
            async newSelection(selectedAnomaly) {
                let anomalyName = selectedAnomaly['name'];
                await this.$store.dispatch('parseAndAddSelectedAnomaly', anomalyName);
            },
            async newDeselection(deselectedAnomaly) {
                let anomalyName = deselectedAnomaly['name'];
                this.$store.commit('removeSelectedAnomaly', anomalyName)
            },
            loadAnomalies() {
                this.$store.commit('loadAllAnomalies');
            },
        },

        mounted: function() {
            this.loadAnomalies()
        },

        components: {
            Multiselect,
        }
    }
</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>

<style scoped>

</style>