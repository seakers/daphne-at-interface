<template>
    <div class="is-seclss-background-black">
        <div class="horizontal-divider"></div>
        <div class="columns" style="margin-bottom: 5px">
            <div class="column is-8.9">
                <div class="box is-main" style="margin-bottom: 5px">
                    <anomaly-detection-window></anomaly-detection-window>
                </div>
                <div class="box is-main" style="margin-bottom: 5px">
                    <sensor-data-window></sensor-data-window>
                </div>
                <div class="box is-main" style="margin-bottom: 5px">
                    <anomaly-diagnosis-window></anomaly-diagnosis-window>
                </div>
                <div class="box is-main" style="margin-bottom: 5px">
                    <anomaly-response-window></anomaly-response-window>
                </div>
                <div style="margin-top: 20px">
                    <the-footer></the-footer>
                </div>
            </div>
            <div class="vertical-divider"></div>
            <div class="column is-3">
                <chat-window class="column"></chat-window>
            </div>
        </div>
    </div>
</template>

<script>

    import {mapGetters, mapState} from 'vuex';
    import {wsTools} from "../scripts/websocket-tools";

    import Shepherd from 'shepherd.js';

    import QuestionBar from './QuestionBar';
    import DaphneAnswer from "./DaphneAnswer";
    import SensorDataWindow from "./SensorDataWindow";
    import AnomalyDetectionWindow from "./AnomalyDetectionWindow";
    import AnomalyDiagnosisWindow from "./AnomalyDiagnosisWindow";
    import ChatWindow from "./ChatWindow";
    import TheFooter from "./TheFooter";
    import AnomalyResponseWindow from "./AnomalyResponseWindow";
    import {fetchPost} from "../scripts/fetch-helpers";

    export default {
        name: 'app',
        data: function () {
            return {
                tutorial: {},
            }
        },
        props: ["isViewer", "viewUserId"],
        computed: {
            ...mapState({
                inExperiment: state => state.experiment.inExperiment,
                experimentStage: state => state.experiment.experimentStage,
                stageInformation: state => state.experiment.stageInformation,
                isRecovering: state => state.experiment.isRecovering,
                currentStageNum: state => state.experiment.currentStageNum,
            }),
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
            AnomalyResponseWindow,
            AnomalyDiagnosisWindow,
            AnomalyDetectionWindow,
            ChatWindow,
            SensorDataWindow,
            DaphneAnswer,
            QuestionBar,
            TheFooter
        },
        async mounted() {
            if (!this.isViewer) {
                // Normal init code
                /*await fetchPost('/api/auth/generate-session', new FormData());
                // Connect to Websocket
                await wsTools.wsConnect(this.$store);*/

                // This is only for experiment!!!
                // Generate the session
                await fetchPost(API_URL + 'auth/generate-session', new FormData());

                // Tutorial
                this.tutorial = new Shepherd.Tour({
                    defaultStepOptions: {
                        classes: 'shadow-md bg-purple-dark',
                        scrollTo: true
                    },
                    useModalOverlay: true,
                    exitOnEsc: false
                });

                // Experiment
                this.$store.dispatch('recoverExperiment').then(async () => {
                    this.$store.commit('setIsRecovering', false);
                    // Only start experiment if it wasn't already running
                    if (!this.inExperiment) {
                        // First of all login
                        await this.$store.dispatch('loginUser', {
                            username: "seclss-user1",
                            password: "hcaamtest"
                        });
                        this.$store.dispatch('startExperiment').then(async () => {
                            // Restart WS after login
                            await wsTools.wsConnect(this.$store);
                            await wsTools.experimentWsConnect();
                            // Set the tutorial
                            this.$store.commit('setExperimentStage', 'tutorial');
                            this.$store.commit('setInExperiment', true);
                        });
                    }
                });
            }
        },
        watch: {
            experimentStage: function (val, oldVal) {
                if (this.inExperiment && !this.isRecovering) {
                    // TODO: Initialize Daphne for the new stage
                    // First the general code (nothing right now, Prachi will add something here)
                    // Make sure nothing is lingering from last stage, etc etc

                    // Stage specific behaviour
                    switch (this.experimentStage) {
                        case 'tutorial': {
                            this.$store.state.experiment.stageInformation.tutorial.steps.forEach(step => {
                                this.tutorial.addStep({
                                    ...step,
                                    buttons: [
                                        {
                                            text: 'Previous',
                                            action: this.tutorial.back
                                        },
                                        {
                                            text: 'Next',
                                            action: this.tutorial.next
                                        }
                                    ]
                                });
                            });
                            this.tutorial.on("complete", () => {
                                this.$store.dispatch('startStage', this.stageInformation.tutorial.nextStage).then(() => {
                                    this.$store.commit('setExperimentStage', this.stageInformation.tutorial.nextStage);
                                });
                            });
                            // TODO: Hijack next button action on tutorial
                            this.tutorial.start();
                            break;
                        }
                        case 'with_daphne': {
                            break;
                        }
                        case 'without_daphne': {
                            break;
                        }
                        default: {
                            break;
                        }
                    }
                }
            }
        }
    }
</script>

<style lang="scss">
    @import "../../node_modules/bulma/sass/utilities/initial-variables";
</style>
