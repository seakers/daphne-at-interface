<template>
    <div class="is-seclss-background-black is-vertical-filler">
        <div class="columns is-vertical-filler" style="margin-bottom: 5px">
            <div class="column is-8.9 is-vertical-filler">
                <div class="is-sticky" >
                    <div v-if="timerExperimentCondition">
                        <timer v-bind:startTime=Date.now() v-bind:duration="3602"></timer>
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

    // Sound files
    import startAnomalySound from '../sounds/woopwoop.mp3';
    import endAnomalySound from '../sounds/endgame.mp3';

    export default {
        name: 'app',
        data: function () {
            return {
                tutorial: {},
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

                    // Start both Hub and AT threads if not already started before
                    await this.$store.dispatch('startHubThread')

                    // Establish the experiment websocket connection
                    await wsTools.experimentWsConnect();
                    // Set the tutorial
                    this.$store.commit('setExperimentStage', 'tutorial');
                    this.$store.commit('setInExperiment', true);
                });
            },
            customizer(objValue, srcValue) {
                if (_.isArray(objValue)) {
                    return objValue.concat(srcValue);
                }
            },
            clearTutorialSequence() {
                this.tutorialConfirm.off("complete");
                this.tutorialConfirm.off("cancel");
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
            },
            telemetryTutorialIndividual() {
                this.tutorialConfirm.show();
                this.tutorialConfirm.on("complete", () => {
                    this.telemetryTutorial.show('firstStep');
                });
                this.telemetryTutorial.on("cancel", () => {
                    this.clearTutorialSequence();
                });
                this.tutorialConfirm.on("cancel", () => {
                    this.clearTutorialSequence();
                });
                this.telemetryTutorial.on("complete", () => {
                    this.clearTutorialSequence();
                });
            },
            detectionTutorialIndividual() {
                this.tutorialConfirm.show();
                this.tutorialConfirm.on("complete", () => {
                    this.detectionTutorial.show('firstStep');
                });
                this.detectionTutorial.on("cancel", () => {
                    this.clearTutorialSequence();
                });
                this.tutorialConfirm.on("cancel", () => {
                    this.clearTutorialSequence();
                });
                this.detectionTutorial.on("complete", () => {
                    this.clearTutorialSequence();
                });
            },
            diagnosisTutorialIndividual() {
                this.tutorialConfirm.show();
                this.tutorialConfirm.on("complete", () => {
                    this.diagnosisTutorial.show('firstStep');
                });
                this.diagnosisTutorial.on("cancel", () => {
                    this.clearTutorialSequence();
                });
                this.tutorialConfirm.on("cancel", () => {
                    this.clearTutorialSequence();
                });
                this.diagnosisTutorial.on("complete", () => {
                    this.clearTutorialSequence();
                });
            },
            responseTutorialIndividual() {
                this.tutorialConfirm.show();
                this.tutorialConfirm.on("complete", () => {
                    this.responseTutorial.show('firstStep');
                });
                this.responseTutorial.on("cancel", () => {
                    this.clearTutorialSequence();
                });
                this.tutorialConfirm.on("cancel", () => {
                    this.clearTutorialSequence();
                });
                this.responseTutorial.on("complete", () => {
                    this.clearTutorialSequence();
                });
            },
            chatTutorialIndividual() {
                this.tutorialConfirm.show();
                this.tutorialConfirm.on("complete", () => {
                    this.chatTutorial.show('firstStep');
                });
                this.chatTutorial.on("cancel", () => {
                    this.clearTutorialSequence();
                });
                this.tutorialConfirm.on("cancel", () => {
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

                // skip tutorial button
                this.tutorialConfirm = new Shepherd.Tour({
                    defaultStepOptions: {
                        classes: 'shadow-md bg-purple-dark',
                        scrollTo: true
                    },
                    useModalOverlay: true,
                    exitOnEsc: false
                });
                // add steps
                this.tutorialConfirm.addStep({
                    text: 'Would you like to continue with the tutorial?',
                    buttons: [
                        {
                            text: 'No',
                            action: this.tutorialConfirm.cancel
                        },
                        {
                            text: 'Yes',
                            action: this.tutorialConfirm.next
                        }
                    ]
                });

                // Tutorial
                // full tutorial at the beginning
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
                    text: `Hello astronaut! My name is Daphne-AT. I have been assigned as your personal assistant on this mission. I will
                    monitor the Environmental Control and Life Support System (ECLSS), and I will assist you with any
                    anomalies that may occur within its subsystems. Together, we will ensure the success of this mission.`,
                    buttons: [
                        {
                            text: 'Skip',
                            action: this.introTutorial.cancel
                        },
                        {
                            text: 'Next',
                            action: this.introTutorial.next
                        }
                    ]
                });
                // list of steps
                const introSteps = [
                    {
                        attachTo: {
                            element: '#telemetry-feed',
                            on: 'bottom'
                        },
                        text: `This is the <b>Sensor Data</b> window. The purpose of this area is to display the real-time
                    of the measurements provided by the sensors of the ECLSS. As you can see, I am now showing the
                    sensor readings for the ppN2 (L1) measurement as a blue solid line. The other lines (the dashed
                    orange and red lines) stand for the warning and critical limits of the selected measurement.`
                    },
                    {
                        attachTo: {
                            element: '#telemetry-feed',
                            on: 'bottom'
                        },
                        text: `Note that there is a dropdown menu above the graph. You can use it to choose which
                    measurements you want me to display. I can even display more than one measurement at once! Bear in
                    mind that if you want me to do so, I will not show the limits of each measurement because there
                    would be too many lines!.`
                    },
                    {
                        attachTo: {
                            element: '#telemetry-feed',
                            on: 'bottom'
                        },
                        text: `Try clicking on the dropdown menu and adding a new measurement to the
                    plot. After that, try clicking on the little cross 'x' next to the measurement name to deselect it.
                    When you are done, click 'Next'.`
                    },
                    {
                        attachTo: {
                            element: '#anomaly-detection',
                            on: 'bottom'
                        },
                        text: `This is the  <b>Anomaly Detection</b> window. As you can see right now, I will use this area
                    to provide you with a list of measurements that exceed any of their limits.`
                    },
                    {
                        attachTo: {
                            element: '#anomaly-detection',
                            on: 'bottom'
                        },
                        text: `To make sure that you do not miss any of my notifications, this window is anchored to the top
                    of the screen, so you will always be able to see it. Scroll down and check that! Also, I will change
                    the color of this window to bring your attention, as well as to inform you about which limits are
                    being exceeded by the measurements. I will use orange when any detected measurement exceeds its
                    warning limit, but not its critical limit, and I will use red when any detected measurement exceeds
                    its critical limit.`
                    },
                    {
                        attachTo: {
                            element: '#anomaly-detection',
                            on: 'bottom'
                        },
                        buttons: [
                            {
                                text: 'Alarm IN',
                                action: async function () {
                                    let newAnomalySound = require('../sounds/woopwoop.mp3');
                                    let audio = new Audio(newAnomalySound);
                                    await audio.play();
                                },
                                secondary: true,
                            },
                        ],
                        text: `Additionally, as you probably have already realized, I will trigger an alarm every time this
                    window changes. That is, if an anomalous measurement either appears, disappears or exceeds a new
                    limit, I will make this sound. Try clicking the 'Alarm IN' button to hear this alarm and become
                    familiar with it. Click 'Next' when you are ready.`
                    },
                    {
                        attachTo: {
                            element: '#anomaly-detection',
                            on: 'bottom'
                        },
                        buttons: [
                            {
                                text: 'Alarm OUT',
                                action: async function () {
                                    let newAnomalySound = require('../sounds/endgame.mp3');
                                    let audio = new Audio(newAnomalySound);
                                    await audio.play();
                                },
                                secondary: true,
                            },
                        ],
                        text: `Similarly, I will trigger a different alarm every time I think that an anomaly has
                        been resolved and the situation is back to normal. This is a new sound that you have not heard
                        yet. Try clicking ‘Alarm OUT’ button to listen to this alarm and become familiar with it.
                        Click ‘Next’ when you are ready.`
                    },
                    {
                        attachTo: {
                            element: '#anomaly-detection',
                            on: 'bottom'
                        },
                        text: `Once an anomalous measurement is detected, you can click on it to select it. The
                        measurement will then appear<b>Anomaly Diagnosis</b> window. Try selecting the ppN2 (L1)
                        and Level Cabin Pressure (L1) anomalous measurements, then click ‘Next’.`
                    },
                    {
                        attachTo: {
                            element: '#anomaly_diagnosis',
                            on: 'bottom'
                        },
                        text: `This is the <b>Anomaly Diagnosis</b> window. When you select an anomalous measurement, it
                    will appear in the upper slot. In fact, if you select more than one, I will display a list of all
                    your selections. Right now, if you followed my instructions, you should be seeing ‘ppN2(L1):
                    is above Upper Critical Limit’ and ‘Level Cabin Pressure (L1): is above Upper Critic Limit’.`
                    },
                    {
                        attachTo: {
                            element: '#anomaly_diagnosis',
                            on: 'bottom'
                        },
                        text: `You can also deselect any item from this list by clicking on it. Try this by clicking on
                        ‘Level Cabin Pressure (L1): is above Upper Critical Limit’ and see that it disappears. You can
                         also click the 'Clear All' button to deselect all the items from this list. Click ‘Next’ when
                         you are ready.`
                    },
                    {
                        attachTo: {
                            element: '#anomaly_diagnosis',
                            on: 'bottom'
                        },
                        text: `As you might have noticed, a ‘Diagnose’ button appears on the right side of the upper
                        slot. This button will only be available when you have some anomalous measurements selected. Do not
                        click it yet!`
                    },
                    {
                        attachTo: {
                            element: '#anomaly_diagnosis',
                            on: 'bottom'
                        },
                        text: `Whenever you click on this button, I will try to provide you with possible causes for
                        the selected anomalous measurements. It takes me a while to think sometimes, especially if you
                        select a lot of measurements, so be patient! Try to click the ‘Diagnose’ button now, then
                        click ‘Next’.`
                    },
                    {
                        attachTo: {
                            element: '#anomaly_diagnosis',
                            on: 'bottom'
                        },
                        text: `As you can see, several things happened here. First, I cleaned all your selected measurements
                    from the upper slot. Do not worry about that, I will soon tell you how to recover them.`
                    },
                    {
                        attachTo: {
                            element: '#anomaly_diagnosis',
                            on: 'bottom'
                        },
                        text: `Also, some new information appeared on the lower slot. This is how I
                        provide you with my possible explanations of what might be causing an anomaly along. On the
                        left, you can see the list of the anomalous measurements that were selected when you
                        clicked on ‘Diagnose’. On the right, you can see a lit of some possible causes for such
                        anomalous measurements. If at any point you would like to clear this report, you can click the
                        'x' in the top right corner of the lower slot.`
                    },
                    {
                        attachTo: {
                            element: '#anomaly_diagnosis',
                            on: 'bottom'
                        },
                        text: `You might want to recover the exact same list of anomalous measurements that you
                    had selected before clicking the diagnose button, and then modify it. To do so, click on the list on
                    the left part of the lower slot, and it will appear in the upper slot again. Try doing it now, and
                    then click 'Next'.`
                    },
                    {
                        attachTo: {
                            element: '#anomaly_diagnosis',
                            on: 'bottom'
                        },
                        text: `We will focus now on how to deal with my suggested explanations. As you might have realized,
                    I provided a list of them, and each item has an associated confidence level between 0 and 1. This score stands
                    for how confident I am for each cause to be the one that is actually happening. The higher the score,
                    the more confident I am in my suggestion.`
                    },
                    {
                        attachTo: {
                            element: '#anomaly_diagnosis',
                            on: 'bottom'
                        },
                        text: `Bear in mind two important things: first, this list is only a suggestion, and second, more
                    than one of such causes might be happening at once!`
                    },
                    {
                        attachTo: {
                            element: '#anomaly_diagnosis',
                            on: 'bottom'
                        },
                        text: `If you want to further explore any of my suggestions, you can click on it to select it. Try
                    selecting the 'N2 Tank Burst' now, and then click on 'Next'.`
                    },
                    {
                        attachTo: {
                            element: '#anomaly_response',
                            on: 'top'
                        },
                        text: `This is the <b>Anomaly Response</b> window. In this area, I will display all the procedures
                    to treat each of the anomaly causes that you select.`
                    },
                    {
                        attachTo: {
                            element: '#anomaly_response',
                            on: 'top'
                        },
                        text: `As you can see right now, the 'N2 Tank Burst' has only one related procedure, the 'N2 Ballast
                    Tank Replacement'. Other anomaly causes might have more than one associated procedure though.`
                    },
                    {
                        attachTo: {
                            element: '#anomaly_response',
                            on: 'top'
                        },
                        text: `You can click on the slot for the 'N2 Ballast Tank Replacement' procedure to see detailed
                    information about it. Try clicking on it now, then click 'Next'.`
                    },
                    {
                        attachTo: {
                            element: '#anomaly_response',
                            on: 'top'
                        },
                        text: `For each procedure, I will show you three important pieces of information: its objective, the
                    required material to perform it and the steps that you should follow to complete it.`
                    },
                    {
                        attachTo: {
                            element: '#anomaly_response',
                            on: 'top'
                        },
                        text: `Pay close attention on how I display the steps to be followed now. As you can see, I am
                    showing a scrollable box with all the steps. Each step has a checkbox on its left, so that you can
                    check it whenever you complete it. Try checking some steps now, then click 'Next'.`
                    },
                    {
                        attachTo: {
                            element: '#anomaly_response',
                            on: 'top'
                        },
                        text: `When performing a procedure, make sure you check each step when you complete it!`
                    },
                    {
                        attachTo: {
                            element: '#anomaly_response',
                            on: 'top'
                        },
                        text: `At the top right side of the procedure slot, I will display the status of such procedure. I
                    will only mark it as complete whenever you check all its steps, and as pending otherwise. Try
                    selecting all the steps of this procedure now to see the difference (you only need to check the last
                    step). You will also see that once a procedure is complete that a new button appears. This button
                    'Clear Completed Procedures' will remove all the procedures that you have completed. Click 'Next'
                    when you are ready.`
                    },
                    {
                        attachTo: {
                            element: '#anomaly_response',
                            on: 'top'
                        },
                        text: `Try clicking on the 'N2 Ballast Tank Replacement' procedure slot again now. This will hide
                    all its details, to ease navigation through the screen. Click 'Next' when you are ready.`
                    },
                    {
                        attachTo: {
                            element: '#anomaly_response',
                            on: 'top'
                        },
                        text: `You can also explore multiple causes of an anomaly simultaneously. This might be useful
                        in case I provided more than one suggestion, or if more than one anomaly is happening at the same time.`
                    },
                    {
                        attachTo: {
                            element: '#anomaly_response',
                            on: 'top'
                        },
                        text: `Remember: I am not almighty, so I could be providing you with wrong suggestions. In case you disagree
                    with me, you can use the dropdown menu at the top of this window to explore the procedures of other
                    anomalies of the ECLSS system. Try selecting a new one, and then deselect it by clicking on the tiny
                    cross next 'x' to it. Click 'Next' when you are ready.`
                    },
                    {
                        attachTo: {
                            element: '.sticky-textbox',
                            on: 'top'
                        },
                        text: `This is the <b>Chat</b> window. You can use it to ask me questions related to the anomaly
                    treatment process.`
                    },
                    {
                        attachTo: {
                            element: '.sticky-textbox',
                            on: 'top'
                        },
                        text: `For example, you can ask me "What is the current value of the ppN2 L1?", and I will give you
                    the current value of such measurement. Try writing or copying the above question into the text box,
                    area, and then click the enter key on your keyboard. Wait until my answer appears on the chat,
                    then click 'Next'.`
                    },
                    {
                        attachTo: {
                            element: '.sticky-textbox',
                            on: 'top'
                        },
                        text: `There are other questions that I can answer too, apart from the one you tried. If you want to
                    know about them, click on the link just below this question bar. A new tab will be opened with a
                    list of the questions that I am able to answer. This is a good moment for you to get familiar with
                    this list, so try on clicking the link. Whenever you are done, click on 'Next'.`
                    },
                    {
                        attachTo: {
                            element: '.sticky-textbox',
                            on: 'top'
                        },
                        text: `As you can see, there are three buttons attached to this question bar. Two of them are very
                    straightforward: the 'Send' button does the same as hitting the enter key when you type a
                    question, and the 'Clear' button clears all the messages from our chat. We will talk about the third
                    button soon.`
                    },
                    {
                        attachTo: {
                            element: '.sticky-textbox',
                            on: 'top'
                        },
                        text: `Now, the final feature: I have the ability to speak with you!`
                    },
                    {
                        attachTo: {
                            element: '.sticky-textbox',
                            on: 'top'
                        },
                        text: `First, you can ask me questions out loud and I will recognize and process your speech.
                    Second, I can read my own answers out loud. Both features are independent: you can activate either
                    of them, both or none. It is up to you! I will now explain you how to do so.`
                    },
                    {
                        attachTo: {
                            element: '.sticky-textbox',
                            on: 'top'
                        },
                        text: `The purpose of the third button, the 'Speaker' button, is to mute or unmute me. When unmuted,
                    I will read all the answers to your questions out loud!`
                    },
                    {
                        attachTo: {
                            element: '.sticky-textbox',
                            on: 'top'
                        },
                        text: `Try clicking on the Speaker button to unmute me now, then click Next.`
                    },
                    {
                        attachTo: {
                            element: '#skitt-ui',
                        },
                        tetherOptions: {
                            target: '#skitt-toggle-button',
                            attachment: 'top left',
                            targetAttachment: 'top right',
                            offset: '200px -30px'
                        },
                        text: `The purpose of this small add-on at the bottom left part of the screen (with a microphone on
                    it) is to activate or deactivate the voice recognition feature. When activated, I'll listen to what
                    you are saying all the time.`
                    },
                    {
                        attachTo: {
                            element: '#skitt-ui',
                        },
                        tetherOptions: {
                            target: '#skitt-toggle-button',
                            attachment: 'top left',
                            targetAttachment: 'top right',
                            offset: '200px -30px'
                        },
                        text: `Try clicking on the microphone, then say "Hello there" loud and clear, and wait for a
                    bit. Then click 'Next'.`
                    },
                    {
                        attachTo: {
                            element: '.sticky-textbox',
                            on: 'top'
                        },
                        text: `You can see that a message with what I understood from your speech has appeared in the chat.
                    Also, if you followed my instructions, you should have heard me reading my answer.`
                    },
                    {
                        attachTo: {
                            element: '.sticky-textbox',
                            on: 'top'
                        },
                        text: `As you can see, I do not always understand your questions. This is my way of telling you so.`
                    },
                    {
                        attachTo: {
                            element: '.sticky-textbox',
                            on: 'top'
                        },
                        text: `Now click again on the 'Speaker' button to mute me, then click 'Next'.`
                    },
                    {
                        attachTo: {
                            element: '#skitt-ui',
                        },
                        tetherOptions: {
                            target: '#skitt-toggle-button',
                            attachment: 'top left',
                            targetAttachment: 'top right',
                            offset: '200px -30px'
                        },
                        text: `Finally, click again on the microphone to deactivate the speech recognition. Then click 'Next'.`
                    },
                    {
                        text: `Now you know all the tools available to you to solve anomalies during this mission.
                    It is going to be a long, arduous journey, so good luck!`
                    },
                    {
                        text: `IMPORTANT: It should not be a problem but try to avoid refreshing the browser page during the
                    experiment.`
                    },
                    {
                        text: `Now the experiment is about to start. Before you click 'Next', tell the person that is
                    monitoring you that you are ready. DO NOT click 'Next' until he/she has given you explicit permission.`
                    },
                    {
                        text: `You should be seeing this only if you have been granted permission. Click on 'Next' to start
                    the experiment.`
                    },
                ];
                // add rest of steps
                introSteps.forEach(step => {
                    this.introTutorial.addStep(_.mergeWith({
                        // ...step,
                        buttons: [
                            {
                                text:'Skip',
                                action: this.introTutorial.cancel
                            },
                            {
                                text: 'Back',
                                action: this.introTutorial.back
                            },
                            {
                                text: 'Next',
                                action: this.introTutorial.next
                            }
                        ]
                    }, step, this.customizer));
                });

                // individual tutorial for ? links
                // telemetry
                this.telemetryTutorial = new Shepherd.Tour({
                    defaultStepOptions: {
                        classes: 'shadow-md bg-purple-dark',
                        scrollTo: true
                    },
                    useModalOverlay: true,
                    exitOnEsc: false
                });
                this.telemetryTutorial.addStep({
                    id: 'firstStep',
                    attachTo: {
                        element: '#telemetry-feed',
                        on: 'bottom'
                    },
                    text: `This is the <b>Sensor Data</b> window. The purpose of this area is to display the real-time
                    of the measurements provided by the sensors of the ECLSS. As you can see, I am now showing the
                    sensor readings for the ppN2 (L1) measurement as a blue solid line. The other lines (the dashed
                    orange and red lines) stand for the warning and critical limits of the selected measurement.`,
                    buttons: [
                        {
                            text: 'Next',
                            action: this.telemetryTutorial.next
                        },
                        {
                            text: 'Exit',
                            action: this.telemetryTutorial.cancel
                        }
                    ]
                });
                const telemetrySteps = [
                    {
                        attachTo: {
                            element: '#telemetry-feed',
                            on: 'bottom'
                        },
                        text: `Note that there is a dropdown menu above the graph. You can use it to choose which
                    measurements you want me to display. I can even display more than one measurement at once! Bear in
                    mind that if you want me to do so, I will not show the limits of each measurement because there
                    would be too many lines!.`
                    },
                    {
                        attachTo: {
                            element: '#telemetry-feed',
                            on: 'bottom'
                        },
                        id: 'lastStep',
                        text: `Try clicking on the dropdown menu and adding a new measurement to the
                    plot. After that, try clicking on the little cross 'x' next to the measurement name to deselect it.
                    When you are done, click 'Next'.`
                    }
                ];
                telemetrySteps.forEach(step => {
                    this.telemetryTutorial.addStep(_.mergeWith({
                        // ...step,
                        buttons: [
                            {
                                text: 'Back',
                                action: this.telemetryTutorial.back
                            },
                            {
                                text: 'Next',
                                action: this.telemetryTutorial.next
                            },
                            {
                                text:'Exit',
                                action: this.telemetryTutorial.cancel
                            }
                        ]
                    }, step, this.customizer));
                });

                // detection
                this.detectionTutorial = new Shepherd.Tour({
                    defaultStepOptions: {
                        classes: 'shadow-md bg-purple-dark',
                        scrollTo: true
                    },
                    useModalOverlay: true,
                    exitOnEsc: false
                });
                this.detectionTutorial.addStep({
                    id: 'firstStep',
                    attachTo: {
                        element: '#anomaly-detection',
                        on: 'bottom'
                    },
                    text: `This is the  <b>Anomaly Detection</b> window. I will use this area
                    to provide you with a list of measurements that exceed any of their limits.`,
                    buttons: [
                        {
                            text: 'Next',
                            action: this.detectionTutorial.next
                        },
                        {
                            text: 'Exit',
                            action: this.detectionTutorial.cancel
                        }
                    ]
                });
                const detectionSteps = [
                    {
                        attachTo: {
                            element: '#anomaly-detection',
                            on: 'bottom'
                        },
                        text: `To make sure that you do not miss any of my notifications, this window is anchored to the top
                    of the screen, so you will always be able to see it. Scroll down and check that! Also, I will change
                    the color of this window to bring your attention, as well as to inform you about which limits are
                    being exceeded by the measurements. I will use orange when any detected measurement exceeds its
                    warning limit, but not its critical limit, and I will use red when any detected measurement exceeds
                    its critical limit.`
                    },
                    {
                        attachTo: {
                            element: '#anomaly-detection',
                            on: 'bottom'
                        },
                        buttons: [
                            {
                                text: 'Alarm IN',
                                action: async function () {
                                    let newAnomalySound = require('../sounds/woopwoop.mp3');
                                    let audio = new Audio(newAnomalySound);
                                    await audio.play();
                                },
                                secondary: true,
                            },
                        ],
                        text: `Additionally, I will trigger an alarm every time this window changes. That is, if an
                        anomalous measurement either appears, disappears or exceeds a new limit, I will make this sound.
                        Try clicking the 'Alarm IN' button to hear this alarm and become familiar with it. Click 'Next'
                        when you are ready.`
                    },
                    {
                        attachTo: {
                            element: '#anomaly-detection',
                            on: 'bottom'
                        },
                        buttons: [
                            {
                                text: 'Alarm OUT',
                                action: async function () {
                                    let newAnomalySound = require('../sounds/endgame.mp3');
                                    let audio = new Audio(newAnomalySound);
                                    await audio.play();
                                },
                                secondary: true,
                            },
                        ],
                        text: `Similarly, I will trigger a different alarm every time I think that an anomaly has
                        been resolved and the situation is back to normal. This is a new sound that you have not heard
                        yet. Try clicking ‘Alarm OUT’ button to listen to this alarm and become familiar with it.
                        Click ‘Next’ when you are ready.`
                    },
                    {
                        attachTo: {
                            element: '#anomaly-detection',
                            on: 'bottom'
                        },
                        text: `Once an anomalous measurement is detected, you can click on it to select it. The
                        measurement will then appear<b>Anomaly Diagnosis</b> window. When you are ready click ‘Next’.`
                    }
                ];
                detectionSteps.forEach(step => {
                    this.detectionTutorial.addStep(_.mergeWith({
                        // ...step,
                        buttons: [
                            {
                                text: 'Back',
                                action: this.detectionTutorial.back
                            },
                            {
                                text: 'Next',
                                action: this.detectionTutorial.next
                            },
                            {
                                text:'Exit',
                                action: this.detectionTutorial.cancel
                            }
                        ]
                    }, step, this.customizer));
                });

                // diagnosis
                this.diagnosisTutorial = new Shepherd.Tour({
                    defaultStepOptions: {
                        classes: 'shadow-md bg-purple-dark',
                        scrollTo: true
                    },
                    useModalOverlay: true,
                    exitOnEsc: false
                });
                this.diagnosisTutorial.addStep({
                    id: 'firstStep',
                    attachTo: {
                        element: '#anomaly_diagnosis',
                        on: 'bottom'
                    },
                    text: `This is the <b>Anomaly Diagnosis</b> window. When you select an anomalous measurement, it
                    will appear in the upper slot. In fact, if you select more than one, I will display a list of all
                    your selections.`,
                    buttons: [
                        {
                            text: 'Next',
                            action: this.diagnosisTutorial.next
                        },
                        {
                            text: 'Exit',
                            action: this.diagnosisTutorial.cancel
                        }
                    ]
                });
                const diagnosisSteps = [
                    {
                        attachTo: {
                            element: '#anomaly_diagnosis',
                            on: 'bottom'
                        },
                        text: `You can also deselect any item from this list by clicking on it. You can also click the
                        'Clear All' button to deselect all the items from this list. The 'Clear All' button will appear
                        on the right side of the lower slot when anomalous measurements are selected. Click ‘Next’
                        when you are ready.`
                    },
                    {
                        attachTo: {
                            element: '#anomaly_diagnosis',
                            on: 'bottom'
                        },
                        text: `A ‘Diagnose’ button will appear on the right side of the upper slot. This button will
                         only be available when you have some anomalous measurements selected.`
                    },
                    {
                        attachTo: {
                            element: '#anomaly_diagnosis',
                            on: 'bottom'
                        },
                        text: `Whenever you click on this button, I will try to provide you with possible causes for
                        the selected anomalous measurements. It takes me a while to think sometimes, especially if you
                        select a lot of measurements, so be patient! Click 'Next' when you are ready.`
                    },
                    {
                        attachTo: {
                            element: '#anomaly_diagnosis',
                            on: 'bottom'
                        },
                        text: `When you click 'Diagnosis' several things happened here. First, I will clean all your
                        selected measurements from the upper slot. If you want to recover the exact same list of anomalous
                        measurements that you had selected before clicking the diagnose button, click on the list that
                        appears on the left side of the lower slot, and it will appear in the upper slot again. Click 'Next'
                        when you are ready.`
                    },
                    {
                        attachTo: {
                            element: '#anomaly_diagnosis',
                            on: 'bottom'
                        },
                        text: `Also, some new information will on the lower slot. This is how I
                        provide you with my possible explanations of what might be causing an anomaly along. On the
                        left, you would see the list of the anomalous measurements that were selected when you
                        clicked on ‘Diagnose’. On the right, you would see a list of some possible causes for such
                        anomalous measurements. If at any point you would like to clear this report, you could click the
                        'x' in the top right corner of the lower slot.`
                    },
                    {
                        attachTo: {
                            element: '#anomaly_diagnosis',
                            on: 'bottom'
                        },
                        text: `We will focus now on how to deal with my suggested explanations. I will provide a list of
                        them, and each item has an associated confidence level between 0 and 1. The higher the score,
                    the more confident I am in my suggestion.`
                    },
                    {
                        attachTo: {
                            element: '#anomaly_diagnosis',
                            on: 'bottom'
                        },
                        text: `Bear in mind two important things: first, this list is only a suggestion, and second, more
                    than one of such causes might be happening at once!`
                    },
                    {
                        attachTo: {
                            element: '#anomaly_diagnosis',
                            on: 'bottom'
                        },
                        text: `If you want to further explore any of my suggestions, you can click on it to select it.
                        Click on 'Next' when you are ready.`
                    }
                ];
                diagnosisSteps.forEach(step => {
                    this.diagnosisTutorial.addStep(_.mergeWith({
                        // ...step,
                        buttons: [
                            {
                                text: 'Back',
                                action: this.diagnosisTutorial.back
                            },
                            {
                                text: 'Next',
                                action: this.diagnosisTutorial.next
                            },
                            {
                                text: 'Exit',
                                action: this.diagnosisTutorial.cancel
                            }
                        ]
                    }, step, this.customizer));
                });

                // response
                this.responseTutorial = new Shepherd.Tour({
                    defaultStepOptions: {
                        classes: 'shadow-md bg-purple-dark',
                        scrollTo: true
                    },
                    useModalOverlay: true,
                    exitOnEsc: false
                });
                this.responseTutorial.addStep({
                    id: 'firstStep',
                    attachTo: {
                        element: '#anomaly_response',
                        on: 'bottom'
                    },
                    text: `This is the <b>Anomaly Response</b> window. In this area, I will display all the procedures
                    to treat each of the anomaly causes that you select.`,
                    buttons: [
                        {
                            text: 'Next',
                            action: this.responseTutorial.next
                        },
                        {
                            text: 'Exit',
                            action: this.responseTutorial.cancel
                        }
                    ]
                });
                const responseSteps = [
                    {
                        attachTo: {
                            element: '#anomaly_response',
                            on: 'top'
                        },
                        text: `Try selecting the 'N2 Tank Burst' from the dropdown menu. You can see 'N2 Tank Burst'
                        has only one related procedure, the 'N2 Ballast Tank Replacement'. Other anomaly causes might
                        have more than one associated procedure though.`
                    },
                    {
                        attachTo: {
                            element: '#anomaly_response',
                            on: 'top'
                        },
                        text: `You can click on the slot for the 'N2 Ballast Tank Replacement' procedure to see detailed
                    information about it. Try clicking on it now, then click 'Next'.`
                    },
                    {
                        attachTo: {
                            element: '#anomaly_response',
                            on: 'top'
                        },
                        text: `For each procedure, I will show you three important pieces of information: its objective, the
                    required material to perform it and the steps that you should follow to complete it.`
                    },
                    {
                        attachTo: {
                            element: '#anomaly_response',
                            on: 'top'
                        },
                        text: `Pay close attention on how I display the steps to be followed now. As you can see, I am
                    showing a scrollable box with all the steps. Each step has a checkbox on its left, so that you can
                    check it whenever you complete it. Try checking some steps now, then click 'Next'.`
                    },
                    {
                        attachTo: {
                            element: '#anomaly_response',
                            on: 'top'
                        },
                        text: `When performing a procedure, make sure you check each step when you complete it!`
                    },
                    {
                        attachTo: {
                            element: '#anomaly_response',
                            on: 'top'
                        },
                        text: `At the top right side of the procedure slot, I will display the status of such procedure. I
                    will only mark it as complete whenever you check all its steps, and as pending otherwise. Try
                    selecting all the steps of this procedure now to see the difference (you only need to check the last
                    step). You will also see that once a procedure is complete that a new button appears. This button
                    'Clear Completed Procedures' will remove all the procedures that you have completed. Click 'Next'
                    when you are ready.`
                    },
                    {
                        attachTo: {
                            element: '#anomaly_response',
                            on: 'top'
                        },
                        text: `Try clicking on the 'N2 Ballast Tank Replacement' procedure slot again now. This will hide
                    all its details, to ease navigation through the screen. Click 'Next' when you are ready.`
                    },
                    {
                        attachTo: {
                            element: '#anomaly_response',
                            on: 'top'
                        },
                        text: `You can also explore multiple causes of an anomaly simultaneously. This might be useful
                        in case I provided more than one suggestion, or if more than one anomaly is happening at the same time.`
                    },
                    {
                        attachTo: {
                            element: '#anomaly_response',
                            on: 'top'
                        },
                        text: `Remember: I am not almighty, so I could be providing you with wrong suggestions. In case you disagree
                    with me, you can use the dropdown menu at the top of this window to explore the procedures of other
                    anomalies of the ECLSS system. Try selecting a new one, and then deselect it by clicking on the tiny
                    cross next 'x' to it. Click 'Next' when you are ready.`
                    }
                ];
                responseSteps.forEach(step => {
                    this.responseTutorial.addStep(_.mergeWith({
                        // ...step,
                        buttons: [
                            {
                                text: 'Back',
                                action: this.responseTutorial.back
                            },
                            {
                                text: 'Next',
                                action: this.responseTutorial.next
                            },
                            {
                                text: 'Exit',
                                action: this.responseTutorial.cancel
                            }
                        ]
                    }, step, this.customizer));
                });

                // chat
                this.chatTutorial = new Shepherd.Tour({
                    defaultStepOptions: {
                        classes: 'shadow-md bg-purple-dark',
                        scrollTo: true
                    },
                    useModalOverlay: true,
                    exitOnEsc: false
                });
                this.chatTutorial.addStep({
                    id: 'firstStep',
                    attachTo: {
                        element: '.sticky-textbox',
                        on: 'bottom'
                    },
                    text: `This is the <b>Chat</b> window. You can use it to ask me questions related to the anomaly
                    treatment process.`,
                    buttons: [
                        {
                            text: 'Next',
                            action: this.chatTutorial.next
                        },
                        {
                            text: 'Exit',
                            action: this.chatTutorial.cancel
                        }
                    ]
                });
                const chatSteps = [
                    {
                        attachTo: {
                            element: '.sticky-textbox',
                            on: 'top'
                        },
                        text: `For example, you can ask me "What is the current value of the ppN2 L1?", and I will give you
                    the current value of such measurement. Try writing or copying the above question into the text box,
                    area, and then click the enter key on your keyboard. Wait until my answer appears on the chat,
                    then click 'Next'.`
                    },
                    {
                        attachTo: {
                            element: '.sticky-textbox',
                            on: 'top'
                        },
                        text: `There are other questions that I can answer too, apart from the one you tried. If you want to
                    know about them, click on the link just below this question bar. A new tab will be opened with a
                    list of the questions that I am able to answer. This is a good moment for you to get familiar with
                    this list, so try on clicking the link. Whenever you are done, click on 'Next'.`
                    },
                    {
                        attachTo: {
                            element: '.sticky-textbox',
                            on: 'top'
                        },
                        text: `As you can see, there are three buttons attached to this question bar. Two of them are very
                    straightforward: the 'Send' button does the same as hitting the enter key when you type a
                    question, and the 'Clear' button clears all the messages from our chat. We will talk about the third
                    button soon.`
                    },
                    {
                        attachTo: {
                            element: '.sticky-textbox',
                            on: 'top'
                        },
                        text: `Now, the final feature: I have the ability to speak with you!`
                    },
                    {
                        attachTo: {
                            element: '.sticky-textbox',
                            on: 'top'
                        },
                        text: `First, you can ask me questions out loud and I will recognize and process your speech.
                    Second, I can read my own answers out loud. Both features are independent: you can activate either
                    of them, both or none. It is up to you! I will now explain you how to do so.`
                    },
                    {
                        attachTo: {
                            element: '.sticky-textbox',
                            on: 'top'
                        },
                        text: `The purpose of the third button, the 'Speaker' button, is to mute or unmute me. When unmuted,
                    I will read all the answers to your questions out loud!`
                    },
                    {
                        attachTo: {
                            element: '.sticky-textbox',
                            on: 'top'
                        },
                        text: `Try clicking on the Speaker button to unmute me now, then click Next.`
                    },
                    {
                        attachTo: {
                            element: '#skitt-ui',
                        },
                        tetherOptions: {
                            target: '#skitt-toggle-button',
                            attachment: 'top left',
                            targetAttachment: 'top right',
                            offset: '200px -30px'
                        },
                        text: `The purpose of the small add-on at the bottom left part of the screen (with a microphone on
                    it) is to activate or deactivate the voice recognition feature. When activated, I'll listen to what
                    you are saying all the time.`
                    },
                    {
                        attachTo: {
                            element: '#skitt-ui',
                        },
                        tetherOptions: {
                            target: '#skitt-toggle-button',
                            attachment: 'top left',
                            targetAttachment: 'top right',
                            offset: '200px -30px'
                        },
                        text: `Try clicking on the microphone, then say "Hello there" loud and clear, and wait for a
                    bit. Then click 'Next'.`
                    },
                    {
                        attachTo: {
                            element: '.sticky-textbox',
                            on: 'top'
                        },
                        text: `You can see that a message with what I understood from your speech has appeared in the chat.
                    Also, if you followed my instructions, you should have heard me reading my answer.`
                    },
                    {
                        attachTo: {
                            element: '.sticky-textbox',
                            on: 'top'
                        },
                        text: `As you can see, I do not always understand your questions. This is my way of telling you so.`
                    },
                    {
                        attachTo: {
                            element: '.sticky-textbox',
                            on: 'top'
                        },
                        text: `Now click again on the 'Speaker' button to mute me, then click 'Next'.`
                    },
                    {
                        attachTo: {
                            element: '#skitt-ui',
                        },
                        tetherOptions: {
                            target: '#skitt-toggle-button',
                            attachment: 'top left',
                            targetAttachment: 'top right',
                            offset: '200px -30px'
                        },
                        text: `Finally, click again on the microphone to deactivate the speech recognition. Then click 'Next'.`
                    }
                ];
                chatSteps.forEach(step => {
                    this.chatTutorial.addStep(_.mergeWith({
                        // ...step,
                        buttons: [
                            {
                                text: 'Back',
                                action: this.chatTutorial.back
                            },
                            {
                                text: 'Next',
                                action: this.chatTutorial.next
                            },
                            {
                                text: 'Exit',
                                action: this.chatTutorial.cancel
                            }
                        ]
                    }, step, this.customizer));
                });

                // individual telemetry tutorial
                this.$root.$on('telemetryTutorialIndividual', () => {
                    this.telemetryTutorialIndividual();
                });

                // individual detection tutorial
                this.$root.$on('detectionTutorialIndividual', () => {
                    this.detectionTutorialIndividual();
                });

                // individual diagnosis tutorial
                this.$root.$on('diagnosisTutorialIndividual', () => {
                    this.diagnosisTutorialIndividual();
                });

                // individual response tutorial
                this.$root.$on('responseTutorialIndividual', () => {
                    this.responseTutorialIndividual();
                });

                // individual chat tutorial
                this.$root.$on('chatTutorialIndividual', () => {
                    this.chatTutorialIndividual();
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
                    case 'tutorial': {
                        this.tutorialConfirm.on("complete", async () => {
                            // If not already ongoing, start receiving a fake telemetry for the tutorial
                            await this.$store.dispatch('stopRealTelemetry');
                            await this.$store.dispatch('startFakeATThread');
                            await this.$store.dispatch('startFakeTelemetry');
                            wsTools.websocket.send(JSON.stringify({
                                msg_type: 'get_fake_telemetry_params'
                            }));

                            this.introTutorial.show();
                        });
                        this.tutorialConfirm.on("cancel", () => {
                            this.$store.dispatch('startStage', this.stageInformation.tutorial.nextStage).then(() => {
                                this.$store.commit('setExperimentStage', this.stageInformation.tutorial.nextStage);
                            });
                            // Stop the fake telemetry for the tutorial and start receiving from the real ECLSS
                            this.$store.dispatch('stopFakeTelemetry').then(() => {
                                this.$store.dispatch('startRealATThread');
                                this.$store.dispatch('startRealTelemetry');
                                wsTools.websocket.send(JSON.stringify({
                                    msg_type: 'get_real_telemetry_params'
                                }));
                                this.$store.dispatch('loadAllAnomalies');
                            });
                            this.clearTutorialSequence();
                        });

                        this.introTutorial.on("complete", () => {
                            this.$store.dispatch('startStage', this.stageInformation.tutorial.nextStage).then(() => {
                                this.$store.commit('setExperimentStage', this.stageInformation.tutorial.nextStage);
                            });
                            // Stop the fake telemetry for the tutorial and start receiving from the real ECLSS
                            this.$store.dispatch('stopFakeTelemetry').then(() => {
                                this.$store.dispatch('startRealATThread');
                                this.$store.dispatch('startRealTelemetry');
                                wsTools.websocket.send(JSON.stringify({
                                    msg_type: 'get_real_telemetry_params'
                                }));
                                this.$store.dispatch('loadAllAnomalies');
                            });
                            this.clearTutorialSequence();
                        });
                        this.introTutorial.on("cancel", () => {
                            this.$store.dispatch('startStage', this.stageInformation.tutorial.nextStage).then(() => {
                                this.$store.commit('setExperimentStage', this.stageInformation.tutorial.nextStage);
                            });
                            // Stop the fake telemetry for the tutorial and start receiving from the real ECLSS
                            this.$store.dispatch('stopFakeTelemetry').then(() => {
                                this.$store.dispatch('startRealATThread');
                                this.$store.dispatch('startRealTelemetry');
                                wsTools.websocket.send(JSON.stringify({
                                    msg_type: 'get_real_telemetry_params'
                                }));
                                this.$store.dispatch('loadAllAnomalies');
                            });
                            this.clearTutorialSequence();
                        });

                        this.tutorialConfirm.show();
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
