<template>
    <div>
        <div class="horizontal-divider"></div>
        <div class="columns">
            <div class="column is-8.9">
                <div class="box is-main">
                    <telemetry-feed-window></telemetry-feed-window>
                </div>
                <div class="box is-main">
                    <anomaly-treatment-window></anomaly-treatment-window>
                </div>
                <div class="box is-main">
                    <other-stuff-window></other-stuff-window>
                </div>
                <the-footer></the-footer>
            </div>
            <div class="vertical-divider"></div>
            <div class="column is-3">
                <chat-window class="column"></chat-window>
            </div>
        </div>
    </div>
</template>

<script>
    import QuestionBar from './QuestionBar';
    //import AnomalyPlot from './AnomalyPlot'

    import { mapGetters } from 'vuex';
    import AnomalyPlot from "./ZZZAnomalyPlot";
    import DaphneAnswer from "./DaphneAnswer";

    import {wsTools} from "../scripts/websocket-tools";
    import TelemetryFeedWindow from "./TelemetryFeedWindow";
    import AnomalyTreatmentWindow from "./AnomalyTreatmentWindow";
    import OtherStuffWindow from "./OtherStuffWindow";
    import AnomalyDetection from "./ZZZAnomalyDetection";
    import ChatWindow from "./ChatWindow";
    import TheFooter from "./TheFooter";

    let introJs = require('intro.js').introJs;

    export default {
        name: 'app',
        data: function () {
            return {
                tutorial: {},
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
            stageDuration() {
                return this.stageInformation[this.experimentStage].stageDuration;
            },
            stageStartTime() {
                return this.stageInformation[this.experimentStage].startTime;
            },
        },
        methods: {
            onCountdownEnd() {
                console.log('Countdown ended!');
                // First stop the current stage
                this.$store.dispatch('finishStage').then(() => {
                });
            },
        },
        components: {
            TheFooter,
            ChatWindow,
            AnomalyDetection,
            TelemetryFeedWindow,
            AnomalyTreatmentWindow,
            OtherStuffWindow,
            DaphneAnswer,
            // AnomalyPlot,
            QuestionBar,
            TheFooter
        },
        async mounted() {
            // Connect to Websocket
            await wsTools.wsConnect(this.$store);
        },
        watch: {
            experimentStage: function (val, oldVal) {
                if (this.inExperiment && !this.isRecovering) {
                    // Reset state
                    this.$store.commit('resetDaphne');
                    this.$store.commit('resetProblem');
                    this.$store.commit('resetFilter');

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

<style lang="scss">
    @import "../../node_modules/bulma/sass/utilities/initial-variables";
</style>
