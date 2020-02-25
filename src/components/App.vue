<template>
    <div class="is-seclss-background-black is-vertical-filler">
        <div class="horizontal-divider"></div>
        <div class="columns is-vertical-filler" style="margin-bottom: 5px">
            <div class="column is-8.9 is-vertical-filler">
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
<!--                <div class="box is-main" style="margin-bottom: 5px">-->
<!--                    <telemetry-buttons></telemetry-buttons>-->
<!--                </div>-->
            </div>
            <div class="vertical-divider"></div>
            <div class="column is-3 is-vertical-filler">
                <chat-window class="column"></chat-window>
            </div>
        </div>
        <modal v-bind:modal-content="modalContent" v-bind:is-active="isModalActive" v-on:close-modal="onCloseModal"></modal>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import {wsTools} from "../scripts/websocket-tools";
    import Shepherd from 'shepherd.js';
    import SensorDataWindow from "./SensorDataWindow";
    import AnomalyDetectionWindow from "./AnomalyDetectionWindow";
    import AnomalyDiagnosisWindow from "./AnomalyDiagnosisWindow";
    import AnomalyResponseWindow from "./AnomalyResponseWindow";
    import TelemetryButtons from "./TelemetryButtons";
    import {fetchGet, fetchPost} from "../scripts/fetch-helpers";
    import DaphneAnswer from "./DaphneAnswer";
    import TheFooter from "./TheFooter";
    import Timer from './Timer';
    import RegisterModal from './RegisterModal';
    import QuestionBar from './QuestionBar';
    import Modal from './Modal';
    import ChatWindow from "./ChatWindow";

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
                isModalActive: state => state.modal.isModalActive,
                modalContent: state => state.modal.modalContent,
                inExperiment: state => state.experiment.inExperiment,
                experimentStage: state => state.experiment.experimentStage,
                stageInformation: state => state.experiment.stageInformation,
                isRecovering: state => state.experiment.isRecovering,
                currentStageNum: state => state.experiment.currentStageNum,
            }),
            timerExperimentCondition() {
                if (!this.inExperiment) {
                    return false;
                } else {
                    return this.currentStageNum > 0;
                }
            },
            stageDuration() {
                return this.stageInformation[this.experimentStage].stageDuration;
            },
            stageStartTime() {
                return this.stageInformation[this.experimentStage].startTime;
            }
        },
        methods: {
            onCountdownEnd() {
                console.log('Countdown ended!');
                // First stop the current stage
                this.$store.dispatch('finishStage').then(() => {
                });
            },
            autoStartTelemetry() {
                this.$store.dispatch('startTelemetry');
            },
            autoStopTelemetry() {
                // this.$store.dispatch('stopTelemetry');
            },
            openRegisterForm() {
                this.$store.commit('activateModal', 'RegisterModal');
            },
            openResetPasswordForm() {
                this.$store.commit('activateModal', 'ResetPasswordModal');
            },
            onCloseModal() {
                this.$store.commit('closeModal');
                if (this.modalContent === 'LoginModal') {
                    this.initExperiment();
                }
            },
            async initExperiment() {
                this.$store.dispatch('startExperiment').then(async () => {
                    // Restart WS after login
                    await wsTools.wsConnect(this.$store);
                    await wsTools.experimentWsConnect();
                    // Set the tutorial
                    this.$store.commit('setExperimentStage', 'tutorial');
                    this.$store.commit('setInExperiment', true);
                });
            }
        },
        components: {
            AnomalyResponseWindow,
            AnomalyDiagnosisWindow,
            AnomalyDetectionWindow,
            ChatWindow,
            SensorDataWindow,
            RegisterModal,
            DaphneAnswer,
            QuestionBar,
            TheFooter,
            TelemetryButtons,
            Modal,
            Timer
        },
        async mounted() {
            if (!this.isViewer) {
                // // Normal init code
                // await fetchPost('/api/auth/generate-session', new FormData());
                // // Connect to Websocket
                // await wsTools.wsConnect(this.$store);

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
                        this.$store.commit('activateModal', 'LoginModal');
                        this.$store.dispatch('startTelemetry');
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

                    // Set problem for this stage and load the corresponding dataset
                    console.log(this.problems, this.currentStageNum);

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

    .user-info {
        padding: 30px;
        width: 100%;
        flex-grow: 1;
        color: #F6F7F7;
        font-size: 16px;
        font-weight: bold;
    }

    .vertical-divider {
        background: $grey-light;
        width: 1px;
    }
</style>
