<template>
    <div>
        <div>
            <nav class="navbar">
                <div class="navbar-brand">
                    <a class="navbar-item" href="https://www.selva-research.com/daphne">Daphne</a>
                    <div class="navbar-burger burger">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>

                <div class="navbar-menu">
                    <div class="navbar-start is-fullwidth">
                        <div class="navbar-item is-fullwidth">
                            <question-bar v-if="questionBarExperimentCondition" id="question-bar"></question-bar>
                        </div>
                    </div>
                </div>
            </nav>
            <div class="box">
                <daphne-answer></daphne-answer>
            </div>
            <div class="box">
                <simulate-telemetry></simulate-telemetry>
                <div class="columns is-mobile">
                    <anomaly-plot></anomaly-plot>
                </div>
            </div>
        </div>
        <footer class="footer">
            <div class="container">
                <div class="has-text-centered">
                    <p>
                        <strong>Daphne</strong> by <a href="https://www.selva-research.com">SEAK Lab</a>. The source code is licensed
                        <a href="http://opensource.org/licenses/mit-license.php">MIT</a>.
                    </p>
                </div>
            </div>
        </footer>
        <modal v-bind:modal-content="modalContent" v-bind:is-active="isModalActive" v-on:close-modal="onCloseModal"></modal>
    </div>
</template>

<script>
    let introJs = require('intro.js').introJs;

    import { mapGetters } from 'vuex';
    import {wsTools} from "../scripts/websocket";

    import MainMenu from './MainMenu';
    import QuestionBar from './QuestionBar';
    import FunctionalityList from './FunctionalityList';
    import Modal from './Modal';
    import AnomalyPlot from "./AnomalyPlot";
    import DaphneAnswer from "./DaphneAnswer";
    import SimulateTelemetry from "./SimulateTelemetry";

    export default {
        name: 'app',
        data: function () {
            return {
                tutorial: {},
                isModalActive: false
            }
        },
        computed: {
            ...mapGetters({
                inExperiment: 'getInExperiment',
                experimentStage: 'getExperimentStage',
                stageInformation: 'getStageInformation',
                websocket: 'getWebsocket',
                isRecovering: 'getIsRecovering',
                currentStageNum: 'getCurrentStageNum',
                datasets: 'getDatasets',
                aggregationXls: 'getAggregationXls'
            }),
            questionBarExperimentCondition() {
                if (!this.inExperiment) {
                    return true;
                }
                else {
                    return this.stageInformation[this.experimentStage].availableFunctionalities.includes('QuestionBar');
                }
            },
            modalContent() {
                return this.$store.state.experiment.modalContent[this.$store.state.experiment.currentStageNum];
            }
        },
        methods: {
            onCloseModal() {
                this.isModalActive = false;
            }
        },
        components: {
            SimulateTelemetry,
            DaphneAnswer, AnomalyPlot, MainMenu, QuestionBar, FunctionalityList, Modal },
        async mounted() {

            // Set up initial state
            // this.$store.commit('addFunctionality', 'AnomalyDetection');
            // this.$store.commit('addFunctionality', 'DataLoader');

            // Connect to Websocket
            await wsTools.wsConnect();

            // New Anomaly detection code
            // this.$store.dispatch('loadAnomalyData', 'sample.csv');
        },
        watch: {
            experimentStage: function (val, oldVal) {
                if (this.inExperiment && !this.isRecovering) {
                    // Reset state
                    this.$store.commit('resetDaphne');
                    this.$store.commit('resetTradespacePlot');
                    this.$store.commit('resetProblem');
                    this.$store.commit('resetFunctionalityList');
                    this.$store.commit('resetDataMining');
                    this.$store.commit('resetFilter');
                    this.$store.commit('resetFeatureApplication');

                    // Add functionalities
                    for (let shownFunc of this.stageInformation[this.experimentStage].shownFunctionalities) {
                        this.$store.commit('addFunctionality', shownFunc);
                    }

                    // Load stage dataset
                    this.$store.dispatch('loadNewData', this.datasets[this.currentStageNum]).then(async () => {
                        // Switch the VASSAR models for the new ones specific to this dataset
                        await this.$store.dispatch('changeProblemLoadedFiles', {
                            'aggregationXls': this.aggregationXls[this.currentStageNum]
                        });
                        // Stage specific behaviour
                        switch (this.experimentStage) {
                            case 'tutorial': {
                                this.tutorial.addSteps(this.$store.state.experiment.stageInformation.tutorial.steps);
                                this.tutorial.setOption('exitOnOverlayClick', false);
                                this.tutorial.setOption('exitOnEsc', false);
                                this.tutorial.oncomplete(() => {
                                    this.$store.dispatch('startStage', this.stageInformation.tutorial.nextStage).then(() => {
                                        this.$store.commit('setExperimentStage', this.stageInformation.tutorial.nextStage);
                                    });
                                });
                                // TODO: Hijack next button action on tutorial
                                this.tutorial.start();
                                break;
                            }
                            case 'no_daphne': {
                                break;
                            }
                            case 'daphne_peer': {
                                break;
                            }
                            case 'daphne_assistant': {
                                break;
                            }
                            default: {
                                break;
                            }
                        }
                    });
                }
            }
        }
    }
</script>

<style scoped>

</style>
