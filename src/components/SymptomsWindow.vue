<template>
    <div>
        <div class="is-title">
            Symptoms Detection
        </div>
        <div v-if="(this.symptomsList.length === 0)" class="is-content">
            No anomalous symptoms detected.
        </div>
        <div v-else class="is-content">
            <ul>
                <li v-on:click="selectSymptom(symptom)" v-for="symptom in symptomsList">
                    {{symptom['measurement']}}: exceeds {{symptom['relationship']}}.
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
    import {mapGetters} from 'vuex'

    export default {
        name: "SymptomsWindow",

        computed: {
            ...mapGetters({
                symptomsList: 'getSymptomsList',
            }),
        },

        methods: {
            selectSymptom(symptom) {
                this.$store.commit('addSelectedSymptom', symptom);
            },
        }
    }
</script>

<style scoped>

</style>