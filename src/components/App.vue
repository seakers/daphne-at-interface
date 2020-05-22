<template>
    <div class="is-seclss-background-black is-vertical-filler">
        <div class="columns is-vertical-filler" style="margin-bottom: 5px">
            <div class="column is-8.9 is-vertical-filler">
                <div class="is-sticky" >
                    <div v-if="timerExperimentCondition">
                        <timer v-bind:startTime=Date.now() v-bind:duration="3600"></timer>
                    </div>
                    <div style="height: 5px; background-color: #111111"></div>
                    <div class="box is-main" style="margin: 0px;">
                        <anomaly-detection-window></anomaly-detection-window>
                    </div>
                    <div style="height: 10px; background-color: #111111"></div>
                    <div class="horizontal-divider" style="margin-bottom: 0px"></div>
                    <div style="height: 20px; background-color: #111111"></div>
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
                    <the-footer>
                    </the-footer>
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
        <div style="height: 20px; background-color: #111111"></div>
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
    import TelemetryButtons from "./TelemetryButtons";
    import {fetchGet, fetchPost} from "../scripts/fetch-helpers";
    import DaphneAnswer from "./DaphneAnswer";
    import TheFooter from "./TheFooter";
    import Timer from './Timer';
    import RegisterModal from './RegisterModal';
    // import QuestionBar from './QuestionBar';
    import Modal from './Modal';
    import ChatWindow from "./ChatWindow";
    import AnomalyResponseWindow from "./AnomalyResponseWindow";
    import * as _ from 'lodash-es';

    export default {
        name: 'app',
        data: function () {
            return {
                preTutorial: {},
                introTutorial: {},
                telemetryTutorial: {},
                detectionTutorial: {},
                diagnosisTutorial: {},
                responseTutorial: {},
                chatTutorial: {},
                conclusionTutorial: {}
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

                    // If not already ongoing, start receiving a fake telemetry for the tutorial
                    if (!this.telemetryIsOngoing) {
                        await this.$store.dispatch('startFakeTelemetry');
                    }

                    // Establish the experiment websocket connection
                    await wsTools.experimentWsConnect();
                    // Set the tutorial
                    this.$store.commit('setExperimentStage', 'preTutorial');
                    this.$store.commit('setInExperiment', true);
                });
            },
            customizer(objValue, srcValue) {
                if (_.isArray(objValue)) {
                    return objValue.concat(srcValue);
                }
            },
            clearTutorialSequence() {
                this.preTutorial.off("complete");
                this.preTutorial.off("cancel");
                this.introTutorial.off("complete");
                this.introTutorial.off("cancel");
                this.telemetryTutorial.off("complete");
                this.telemetryTutorial.off("cancel");
                this.detectionTutorial.off("complete");
                this.detectionTutorial.off("cancel");
                this.diagnosisTutorial.off("complete");
                this.diagnosisTutorial.off("cancel");
                this.responseTutorial.off("complete");
                this.responseTutorial.off("cancel");
                this.chatTutorial.off("complete");
                this.chatTutorial.off("cancel");
                this.conclusionTutorial.off("complete");
                this.conclusionTutorial.off("cancel");
            },
            telemetryTutorialI() {
                this.preTutorial.show();
                this.preTutorial.on("complete", () => {
                    this.telemetryTutorial.show('firstStep');
                });
                this.telemetryTutorial.on("cancel", () => {
                    this.preTutorial.show();
                });
                this.preTutorial.on("cancel", () => {
                    this.clearTutorialSequence();
                });
                this.telemetryTutorial.on("complete", () => {
                    this.clearTutorialSequence();
                });
            },
            detectionTutorialI() {
                this.preTutorial.show();
                this.preTutorial.on("complete", () => {
                    this.detectionTutorial.show('firstStep');
                });
                this.detectionTutorial.on("cancel", () => {
                    this.preTutorial.show();
                });
                this.preTutorial.on("cancel", () => {
                    this.clearTutorialSequence();
                });
                this.detectionTutorial.on("complete", () => {
                    this.clearTutorialSequence();
                });
            },
            diagnosisTutorialI() {
                this.preTutorial.show();
                this.preTutorial.on("complete", () => {
                    this.diagnosisTutorial.show('firstStep');
                });
                this.diagnosisTutorial.on("cancel", () => {
                    this.preTutorial.show();
                });
                this.preTutorial.on("cancel", () => {
                    this.clearTutorialSequence();
                });
                this.diagnosisTutorial.on("complete", () => {
                    this.clearTutorialSequence();
                });
            },
            responseTutorialI() {
                this.preTutorial.show();
                this.preTutorial.on("complete", () => {
                    this.responseTutorial.show('firstStep');
                });
                this.responseTutorial.on("cancel", () => {
                    this.preTutorial.show();
                });
                this.preTutorial.on("cancel", () => {
                    this.clearTutorialSequence();
                });
                this.responseTutorial.on("complete", () => {
                    this.clearTutorialSequence();
                });
            },
            chatTutorialI() {
                this.preTutorial.show();
                this.preTutorial.on("complete", () => {
                    this.chatTutorial.show('firstStep');
                });
                this.chatTutorial.on("cancel", () => {
                    this.preTutorial.show();
                });
                this.preTutorial.on("cancel", () => {
                    this.clearTutorialSequence();
                });
                this.chatTutorial.on("complete", () => {
                    this.clearTutorialSequence();
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
            // QuestionBar,
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

                // preTutorial
                this.preTutorial = new Shepherd.Tour({
                    defaultStepOptions: {
                        classes: 'shadow-md bg-purple-dark',
                        scrollTo: true
                    },
                    useModalOverlay: true,
                    exitOnEsc: false
                });
                // add steps
                this.preTutorial.addStep({
                    text: 'Would you like to continue with the tutorial?',
                    buttons: [
                        {
                            text: 'No',
                            action: this.preTutorial.cancel
                        },
                        {
                            text: 'Yes',
                            action: this.preTutorial.next
                        }
                    ]
                });

                // Tutorial

                // introTutorial
                this.introTutorial = new Shepherd.Tour({
                    defaultStepOptions: {
                        classes: 'shadow-md bg-purple-dark',
                        scrollTo: true
                    },
                    useModalOverlay: true,
                    exitOnEsc: false
                });
                // add first step
                this.introTutorial.addStep({
                    id: 'firstStep',
                    text: `Hello astronaut! Congratulations for being selected as one of the crew members for the
                        mission to Mars.`,
                    buttons: [
                        {
                            text: 'Prev',
                            action: this.introTutorial.cancel
                        },
                        {
                            text: 'Next',
                            action: this.introTutorial.next
                        }
                    ]
                });
                // add rest of steps
                this.$store.state.experiment.stageInformation.introTutorial.steps.forEach(step => {
                    this.introTutorial.addStep(_.mergeWith({
                        // ...step,
                        buttons: [
                            {
                                text: 'Previous',
                                action: this.introTutorial.back
                            },
                            {
                                text: 'Next',
                                action: this.introTutorial.next
                            }
                        ]
                    }, step, this.customizer));
                });

                // telemetry tutorial
                this.telemetryTutorial = new Shepherd.Tour({
                    defaultStepOptions: {
                        classes: 'shadow-md bg-purple-dark',
                        scrollTo: true
                    },
                    useModalOverlay: true,
                    exitOnEsc: false
                });
                // add first step
                this.telemetryTutorial.addStep({
                    id: 'firstStep',
                    attachTo: {
                        element: '#telemetry-feed',
                        on: 'bottom'
                    },
                    text: `This is the <b>Sensor Data</b> window. The purpose of this area is to plot the evolution
                    of the measurements provided by the sensors of the ECLSS. As you can see, I am now showing the
                    sensor readings for the ppN2 (L1) measurement as a blue solid line. The other lines (the dashed
                    orange and red ones) stand for the warning and critic limits of such measurement.`,
                    buttons: [
                        {
                            text: 'Prev',
                            action: this.telemetryTutorial.cancel
                        },
                        {
                            text: 'Next',
                            action: this.telemetryTutorial.next
                        }
                    ]
                });
                // add rest of steps
                this.$store.state.experiment.stageInformation.telemetryTutorial.steps.forEach(step => {
                    this.telemetryTutorial.addStep(_.mergeWith({
                        // ...step,
                        buttons: [
                            {
                                text: 'Previous',
                                action: this.telemetryTutorial.back
                            },
                            {
                                text: 'Next',
                                action: this.telemetryTutorial.next
                            }
                        ]
                    }, step, this.customizer));
                });

                // detection tutorial
                this.detectionTutorial = new Shepherd.Tour({
                    defaultStepOptions: {
                        classes: 'shadow-md bg-purple-dark',
                        scrollTo: true
                    },
                    useModalOverlay: true,
                    exitOnEsc: false
                });
                // add first step
                this.detectionTutorial.addStep({
                    id: 'firstStep',
                    attachTo: {
                        element: '#anomaly-detection',
                            on: 'bottom'
                    },
                    text: `This is the  <b>Anomaly Detection</b> window. I will use this area to notify you about any
                    anomalies that I might find within the sensor data readings. As you can see right now, I will
                    basically provide you with a list of the measurements that exceed any of its limits.`,
                    buttons: [
                        {
                            text: 'Prev',
                            action: this.detectionTutorial.cancel
                        },
                        {
                            text: 'Next',
                            action: this.detectionTutorial.next
                        }
                    ]
                });
                // add rest of steps
                this.$store.state.experiment.stageInformation.detectionTutorial.steps.forEach(step => {
                    this.detectionTutorial.addStep(_.mergeWith({
                        // ...step,
                        buttons: [
                            {
                                text: 'Previous',
                                action: this.detectionTutorial.back
                            },
                            {
                                text: 'Next',
                                action: this.detectionTutorial.next
                            }
                        ]
                    }, step, this.customizer));
                });

                // diagnosis tutorial
                this.diagnosisTutorial = new Shepherd.Tour({
                    defaultStepOptions: {
                        classes: 'shadow-md bg-purple-dark',
                        scrollTo: true
                    },
                    useModalOverlay: true,
                    exitOnEsc: false
                });
                // add first step
                this.diagnosisTutorial.addStep({
                    id: 'firstStep',
                    attachTo: {
                        element: '#anomaly_diagnosis',
                        on: 'bottom'
                    },
                    text: `This is the <b>Anomaly Diagnosis</b> window. Whenever you select an anomalous measurement, it
                    will appear on the upper slot. In fact, if you select more than one, I will display a list of all
                    of your selections. Right now, if you followed my instructions, you should be seeing 'ppN2(L1): is
                    above Upper Critic Limit' and 'Level Cabin Pressure (L1): is above Upper Critic Limit'.`,
                    buttons: [
                        {
                            text: 'Prev',
                            action: this.diagnosisTutorial.cancel
                        },
                        {
                            text: 'Next',
                            action: this.diagnosisTutorial.next
                        }
                    ]
                });
                // add rest of steps
                this.$store.state.experiment.stageInformation.diagnosisTutorial.steps.forEach(step => {
                    this.diagnosisTutorial.addStep(_.mergeWith({
                        // ...step,
                        buttons: [
                            {
                                text: 'Previous',
                                action: this.diagnosisTutorial.back
                            },
                            {
                                text: 'Next',
                                action: this.diagnosisTutorial.next
                            }
                        ]
                    }, step, this.customizer));
                });

                // response tutorial
                this.responseTutorial = new Shepherd.Tour({
                    defaultStepOptions: {
                        classes: 'shadow-md bg-purple-dark',
                        scrollTo: true
                    },
                    useModalOverlay: true,
                    exitOnEsc: false
                });
                // add first step
                this.responseTutorial.addStep({
                    id: 'firstStep',
                    attachTo: {
                        element: '#anomaly_response',
                        on: 'top'
                    },
                    text: `This is the <b>Anomaly Response</b> window. In this area, I will display all the procedures
                    to treat each of the anomaly causes that you selected.`,
                    buttons: [
                        {
                            text: 'Prev',
                            action: this.responseTutorial.cancel
                        },
                        {
                            text: 'Next',
                            action: this.responseTutorial.next
                        }
                    ]
                });
                // add rest of steps
                this.$store.state.experiment.stageInformation.responseTutorial.steps.forEach(step => {
                    this.responseTutorial.addStep(_.mergeWith({
                        // ...step,
                        buttons: [
                            {
                                text: 'Previous',
                                action: this.responseTutorial.back
                            },
                            {
                                text: 'Next',
                                action: this.responseTutorial.next
                            }
                        ]
                    }, step, this.customizer));
                });

                // chatTutorial
                this.chatTutorial = new Shepherd.Tour({
                    defaultStepOptions: {
                        classes: 'shadow-md bg-purple-dark',
                        scrollTo: true
                    },
                    useModalOverlay: true,
                    exitOnEsc: false
                });
                // add first step
                this.chatTutorial.addStep({
                    id: 'firstStep',
                    attachTo: {
                        element: '.sticky-textbox',
                        on: 'top'
                    },
                    text: `This is the <b>Chat</b> window. You can use it to ask me questions related to the anomaly
                    treatment process.`,
                    buttons: [
                        {
                            text: 'Prev',
                            action: this.chatTutorial.cancel
                        },
                        {
                            text: 'Next',
                            action: this.chatTutorial.next
                        }
                    ]
                });
                // add rest of steps
                this.$store.state.experiment.stageInformation.chatTutorial.steps.forEach(step => {
                    this.chatTutorial.addStep(_.mergeWith({
                        // ...step,
                        buttons: [
                            {
                                text: 'Previous',
                                action: this.chatTutorial.back
                            },
                            {
                                text: 'Next',
                                action: this.chatTutorial.next
                            }
                        ]
                    }, step, this.customizer));
                });

                // conclusion tutorial
                this.conclusionTutorial = new Shepherd.Tour({
                    defaultStepOptions: {
                        classes: 'shadow-md bg-purple-dark',
                        scrollTo: true
                    },
                    useModalOverlay: true,
                    exitOnEsc: false
                });
                // add first step
                this.conclusionTutorial.addStep({
                    id: 'firstStep',
                    text: `Now you know all the tools available to you in order to solve anomalies during this mission.
                    It is going to be a long, arduous journey, so good luck! Onwards to Mars!`,
                    buttons: [
                        {
                            text: 'Prev',
                            action: this.conclusionTutorial.cancel
                        },
                        {
                            text: 'Next',
                            action: this.conclusionTutorial.next
                        }
                    ]
                });
                // add rest of steps
                this.$store.state.experiment.stageInformation.conclusionTutorial.steps.forEach(step => {
                    this.conclusionTutorial.addStep(_.mergeWith({
                        // ...step,
                        buttons: [
                            {
                                text: 'Previous',
                                action: this.conclusionTutorial.back
                            },
                            {
                                text: 'Next',
                                action: this.conclusionTutorial.next
                            }
                        ]
                    }, step, this.customizer));
                });

                // individual telemetry tutorial
                this.$root.$on('telemetryTutorialI', () => {
                    this.telemetryTutorialI();
                });

                // individual detection tutorial
                this.$root.$on('detectionTutorialI', () => {
                    this.detectionTutorialI();
                });

                // individual diagnosis tutorial
                this.$root.$on('diagnosisTutorialI', () => {
                    this.diagnosisTutorialI();
                });

                // individual response tutorial
                this.$root.$on('responseTutorialI', () => {
                    this.responseTutorialI();
                });

                // individual chat tutorial
                this.$root.$on('chatTutorialI', () => {
                    this.chatTutorialI();
                });

                // Experiment
                this.$store.dispatch('recoverExperiment').then(async () => {
                    this.$store.commit('setIsRecovering', false);
                    // Only start experiment if it wasn't already running
                    if (!this.inExperiment) {
                        // First of all login
                        this.$store.commit('activateModal', 'LoginModal');
                    }
                });

                // finish experiment when time is up (allow for function to call in timer.vue)
                this.$root.$on('endExperiment', () => {
                    this.$store.dispatch('finishExperiment');
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
                    console.log(this.currentStageNum);

                    // Stage specific behaviour
                    switch (this.experimentStage) {
                    case 'preTutorial': {
                        this.preTutorial.on("complete", () => {
                            this.introTutorial.show('firstStep');
                        });
                        this.preTutorial.on("cancel", () => {
                            this.$store.dispatch('startStage', this.stageInformation.conclusionTutorial.nextStage).then(() => {
                                this.$store.commit('setExperimentStage', this.stageInformation.conclusionTutorial.nextStage);
                            });
                            // Stop the fake telemetry for the tutorial and start receiving from the real ECLSS
                            this.$store.dispatch('stopTelemetry').then(() => {
                                this.$store.dispatch('startTelemetry');
                                this.$store.dispatch('loadAllAnomalies')
                            });

                            this.clearTutorialSequence();
                        });

                        this.introTutorial.on("complete", () => {
                            this.telemetryTutorial.show('firstStep');
                        });
                        this.introTutorial.on("cancel", () => {
                            this.preTutorial.show();
                        });

                        this.telemetryTutorial.on("complete", () => {
                            this.detectionTutorial.show('firstStep');
                        });
                        this.telemetryTutorial.on("cancel", () => {
                            this.introTutorial.show('lastStep');
                        });

                        this.detectionTutorial.on("complete", () => {
                            this.diagnosisTutorial.show('firstStep');
                        });
                        this.detectionTutorial.on("cancel", () => {
                            this.telemetryTutorial.show('lastStep');
                        });

                        this.diagnosisTutorial.on("complete", () => {
                            this.responseTutorial.show('firstStep');
                        });
                        this.diagnosisTutorial.on("cancel", () => {
                            this.detectionTutorial.show('lastStep');
                        });

                        this.responseTutorial.on("complete", () => {
                            this.chatTutorial.show('firstStep');
                        });
                        this.responseTutorial.on("cancel", () => {
                            this.diagnosisTutorial.show('lastStep');
                        });

                        this.chatTutorial.on("complete", () => {
                            this.conclusionTutorial.show('firstStep');
                        });
                        this.chatTutorial.on("cancel", () => {
                            this.responseTutorial.show('lastStep');
                        });

                        this.conclusionTutorial.on("complete", () => {
                            this.$store.dispatch('startStage', this.stageInformation.conclusionTutorial.nextStage).then(() => {
                                this.$store.commit('setExperimentStage', this.stageInformation.conclusionTutorial.nextStage);
                            });
                            // Stop the fake telemetry for the tutorial and start receiving from the real ECLSS
                            this.$store.dispatch('stopTelemetry').then(() => {
                                this.$store.dispatch('startTelemetry');
                                this.$store.dispatch('loadAllAnomalies')
                            });
                            this.clearTutorialSequence();
                        });
                        this.conclusionTutorial.on("cancel", () => {
                            this.chatTutorial.show('lastStep');
                        });

                        this.preTutorial.show();
                        break;
                    }
                    case 'with_daphne': {
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

    .tutorialLink {
        float:right;
        cursor:pointer;
    }
</style>
