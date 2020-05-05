// initial state
import * as _ from "lodash-es";
import {fetchGet} from "../../scripts/fetch-helpers";
import {wsTools} from "../../scripts/websocket-tools";

const state = {
    inExperiment: false,
    isRecovering: false,
    experimentStage: '',
    currentStageNum: -1,
    stageInformation: {
        preTutorial: {
            nextStage: 'introTutorial',
        },
        // each tutorial is given an initial next and previous stage based on the order of the initial tutorial
        // the first step is added on its own in App.vue to ensure it can switch between stages
        introTutorial: {
            nextStage: 'telemetryTutorial',
            prevStage: 'preTutorial',

            steps: [
                {
                    text: `In the next few minutes, I will tell you more about myself and how I can help you during the
                    process of treating an anomaly. So please, pay close attention!`
                },
                {
                    id: 'lastStep',
                    text: `My name is Daphne-AT. I have been assigned as your personal assistant on this mission. I will
                    monitor the Environment Control and Life Support System (ECLSS), and I will assist you with any
                    anomalies that may occur within its subsystems. Together, we will ensure the success of this mission.`
                }
            ]
        },
        telemetryTutorial: {
            nextStage: 'detectionTutorial',
            prevStage: 'introTutorial',

            steps: [
                {
                    attachTo: {
                        element: '#telemetry-feed',
                        on: 'bottom'
                    },
                    text: `Note that there is a dropdown menu at the top. You can use it to choose which
                    measurements you want me to display. I can even display more than one measurement at once! Bear in
                    mind though that if you want me to do so, then I will not show the limits of each measurement (there
                    would be too many lines!).`
                },
                {
                    attachTo: {
                        element: '#telemetry-feed',
                        on: 'bottom'
                    },
                    id: 'lastStep',
                    text: `Try clicking on the dropdown menu and adding a new measurement to the
                    plot. After that, try to  it clicking on the little cross next to it. When you are done, click
                    Next.`
                }
            ]
        },
        detectionTutorial: {
            nextStage: 'diagnosisTutorial',
            prevStage: 'telemetryTutorial',

            steps: [
                {
                    attachTo: {
                        element: '#anomaly-detection',
                        on: 'bottom'
                    },
                    text: `To make sure that you do not miss any of my notifications, this window is anchored to the top
                    of the screen, so you will always be able to see it (scroll down and check that!). Also, I will change
                    the color of this window to bring your attention, as well as to inform you about how severe are the
                    anomalies that I found. I will use red when any measurement exceeds its critic limits, and orange
                    when all of them are just above its warning limits.`
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
                                let newAnomalySound = require('../../sounds/woopwoop.mp3');
                                let audio = new Audio(newAnomalySound);
                                await audio.play();
                            },
                            secondary: true,
                        },
                    ],
                    text: `Additionally, as you probably have already realized, I will trigger an alarm every time this
                    window changes. That is, if an anomalous measurement either appears, disappears or exceeds a new
                    limit, I will make this sound. Try clicking the Alarm IN button to hear this alarm and become
                    familiar with it. Click Next when you are ready.`
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
                                let newAnomalySound = require('../../sounds/endgame.mp3');
                                let audio = new Audio(newAnomalySound);
                                await audio.play();
                            },
                            secondary: true,
                        },
                    ],
                    text: `Similarly, I will trigger a different alarm every time I think that an anomaly has finished
                    and the situation is back to normal. Try clicking the Alarm OUT button to listen to this alarm
                    (which you have not heard yet!) and become familiar with it. Click Next when you are ready.`
                },
                {
                    attachTo: {
                        element: '#anomaly-detection',
                        on: 'bottom'
                    },
                    id: 'lastStep',
                    text: `Once an anomalous measurement is detected, you can click on it to select it. I will soon tell
                    you what is this useful for. Try selecting the ppN2 (L1) and Level Cabin Pressure (L1) anomalous
                    measurements, and then click Next.`
                }
            ]
        },
        diagnosisTutorial: {
            nextStage: 'responseTutorial',
            prevStage: 'detectionTutorial',

            steps: [
                {
                    attachTo: {
                        element: '#anomaly_diagnosis',
                        on: 'bottom'
                    },
                    text: `You can also deselect any item from the list. To do so, you just have to click on it, and it
                    will disappear. Try this by clicking on the 'Level Cabin Pressure (L1): is above Upper Critic
                    Limit' one, and then click Next.`
                },
                {
                    attachTo: {
                        element: '#anomaly_diagnosis',
                        on: 'bottom'
                    },
                    text: `As you might have noticed, a 'Diagnose' button appeared on the right side of the upper slot.
                    This button will be only available when you have some anomalous measurements selected. Do not click
                    it yet!`
                },
                {
                    attachTo: {
                        element: '#anomaly_diagnosis',
                        on: 'bottom'
                    },
                    text: `Whenever you click on this button, I will try to provide you with possible causes for the
                    selected anomalous measurements. It takes me a while to think sometimes (specially if you select a
                    lot of measurements), so be patient! Try to click the 'Diagnose' button now, and then click Next.`
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
                    text: `Apart from the previous, some new information appeared on the lower slot. This is how I
                    provide you with my (possible) explanations of what might be causing an anomaly. On the left, you
                    can see the list of the anomalous measurements that were selected when you clicked on 'Diagnose'. On
                    the right, you can see a list of some possible causes for such anomalous measurements.`
                },
                {
                    attachTo: {
                        element: '#anomaly_diagnosis',
                        on: 'bottom'
                    },
                    text: `As I said, you might want to recover the exact same list of anomalous measurements that you
                    had selected before clicking the diagnose button, and then modify it. To do so, click on the list on
                    the left part of the lower slot, and it will appear on the upper one again. Try doing it now, and
                    then click Next.`
                },
                {
                    attachTo: {
                        element: '#anomaly_diagnosis',
                        on: 'bottom'
                    },
                    text: `We will focus now on how to deal with my suggested explanations. As you might have realized,
                    I provided a list of them, and each item has an associated score between 0 and 1. This score stands
                    for how confident I am for each cause to be the one that is actually happening. The highest the
                    score, the most confident I am.`
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
                    id: 'lastStep',
                    text: `If you want to further explore any of my suggestions, you can click on it to select it. Try
                    selecting the 'N2 Tank Burst' now, and then click on Next.`
                }
            ]
        },
        responseTutorial: {
            nextStage: 'chatTutorial',
            prevStage: 'diagnosisTutorial',

            steps: [
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
                    information about it. Try clicking on it now, and then click Next.`
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
                    check it whenever you complete it. Try checking some steps now, and then click Next.`
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
                    step). Click Next when you are ready.`
                },
                {
                    attachTo: {
                        element: '#anomaly_response',
                        on: 'top'
                    },
                    text: `Try on clicking on the 'N2 Ballast Tank Replacement' procedure slot again onw. This will hide
                    all its details, to ease navigation through the screen. Click Next when you are ready.`
                },
                {
                    attachTo: {
                        element: '#anomaly_response',
                        on: 'top'
                    },
                    text: `You can also explore multiple anomaly causes simultaneously. This might be useful in case I
                    provided more than one suggestion, or if more than one anomaly is happening at the same time.`
                },
                {
                    attachTo: {
                        element: '#anomaly_response',
                        on: 'top'
                    },
                    id: 'lastStep',
                    text: `I am not almighty, so I could be providing you with wrong suggestions. In case you disagree
                    with me, you can use the dropdown menu at the top of this window to explore the procedures of other
                    anomalies of the ECLSS system. Try selecting a new one, and then deselect it by clicking on the tiny
                    cross next to it. Click Next when you are ready.`
                }
            ]
        },
        chatTutorial: {
            nextStage: 'conclusionTutorial',
            prevStage: 'responseTutorial',

            steps: [
                {
                    attachTo: {
                        element: '.sticky-textbox',
                        on: 'top'
                    },
                    text: `For example, you can ask me "What is the current value of the ppN2 L1?", and I will give you
                    the current value such measurement. Try writing or copying the above question into the text box,
                    area, and then click the enter key (↵) on your keyboard. Wait until my answer appears on the chat,
                    and then click Next.`
                },
                {
                    attachTo: {
                        element: '.sticky-textbox',
                        on: 'top'
                    },
                    text: `There are other questions that I can answer too, apart from the one you tried. If you want to
                    know about them, click on the link just below this question bar. A new tab will be opened with a
                    list of the questions that I am able to answer. This is a good moment for you to get familiar with
                    such list, so try on clicking the link. Whenever you are done, click on Next.`
                },
                {
                    attachTo: {
                        element: '.sticky-textbox',
                        on: 'top'
                    },
                    text: `As you can see, there are three buttons attached to this question bar. Two of them are very
                    straightforward: the Send button does exactly the same than hitting the enter key when you type a
                    question, and the Clear button clears all the messages from our chat. We will talk about the third
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
                    text: `First, you can ask me questions out loud and I will recognise and process your speech.
                    Second, I can read my own answers out loud. Both features are independent: you can activate either
                    of them, both or none. It is up to you! I will now explain you how to do so.`
                },
                {
                    attachTo: {
                        element: '.sticky-textbox',
                        on: 'top'
                    },
                    text: `The purpose of the third button (the Speaker button) is to mute or unmute me. When unmuted,
                    I will read all the answers to your questions out loud!`
                },
                {
                    attachTo: {
                        element: '.sticky-textbox',
                        on: 'top'
                    },
                    text: `Try clicking on the Speaker button to unmute me now. Then click Next.`
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
                    text: `Try clicking on the Microphone now. Then say "Hello there" loud and clear, and wait for a
                    bit. Then click Next.`
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
                    text: `Now click again on the Speaker button to mute me, and then click Next.`
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
                    id: 'lastStep',
                    text: `Finally, click again on the Microphone to deactivate the speech recognition. Then click Next.`
                }
            ]
        },
        conclusionTutorial: {
            nextStage: '',
            prevStage: 'chatTutorial',

            steps: [
                {
                    text: `IMPORTANT: It should not be a problem, but try to avoid refreshing the browser page during the
                    experiment.`
                },
                {
                    text: `Now the experiment is about to start. Before you click Next, tell the person that is
                    monitoring you that you are ready. DO NOT click Next until he/she has given you explicit permission.`
                },
                {
                    id: 'lastStep',
                    text: `You should be seeing this only if you have been granted permission. Click on Next to start
                    the experiment.`
                },
            ]
        },
        with_daphne: {
            restrictedQuestions: null,
            nextStage: '',
            startTime: 0,
            stageDuration: 30*60
        },
        without_daphne: {
            restrictedQuestions: {
            },
            nextStage: '',
            startTime: 0,
            stageDuration: 30*60
        }
    }
};

// getters
const getters = {
};

// actions
const actions = {
    async startExperiment({ state, commit }) {
        // Call server to start experiment
        try {
            let response = await fetchGet(API_URL + 'experiment-at/start-experiment');
            if (response.ok) {
                let experimentStages = await response.json();
                // Start the experiment: set the order of the conditions after the tutorial
                commit('setNextStage', { experimentStage: 'conclusionTutorial', nextStage: experimentStages[0] });

                for (let i = 0; i < experimentStages.length - 1; ++i) {
                    commit('setNextStage', { experimentStage: experimentStages[i], nextStage: experimentStages[i+1] });
                }
            }
            else {
                console.error('Error starting the experiment.');
            }
        }
        catch(e) {
            console.error('Networking error:', e);
        }
    },

    async startStage({ state, commit }, stage) {
        // Call server to start stage
        try {
            let nextStage = state.currentStageNum;
            let response = await fetchGet(API_URL + 'experiment-at/start-stage/' + nextStage);
            if (response.ok) {
                let startDateData = await response.json();
                // Start the stage: get the starting time from the server information
                console.log(startDateData);
                let startTime = startDateData.start_date + '+00:00';
                startTime = Date.parse(startTime);
                commit('setStartTime', { experimentStage: stage, startTime: startTime });
            }
            else {
                console.error('Error starting the stage.');
            }
        }
        catch(e) {
            console.error('Networking error:', e);
        }
    },

    async finishStage({ state, commit }) {
        // Call server to finish stage
        try {
            let currentStage = state.currentStageNum - 1;
            let response = await fetchGet(API_URL + 'experiment-at/finish-stage/' + currentStage);
            if (response.ok) {
                let experimentInformation = await response.json();
                // Stage is finished!
                console.log(experimentInformation);
            }
            else {
                console.error('Error finishing the stage.');
            }
        }
        catch(e) {
            console.error('Networking error:', e);
        }
    },

    async finishExperiment({ state, commit }) {
        // Call server to finish experiment
        try {
            let response = await fetchGet(API_URL + 'experiment-at/finish-experiment');
            if (response.ok) {
                let experimentInformation = await response.json();
                // Finish the experiment: set inExperiment to false
                console.log(experimentInformation);
                commit('setInExperiment', false);
            }
            else {
                console.error('Error finishing the experiment.');
            }
        }
        catch(e) {
            console.error('Networking error:', e);
        }
    },

    async recoverExperiment({ state, commit, rootState, dispatch }) {
        // Call server to see if there is an experiment already running
        try {
            //TODO add and remove restores from modules
            let response = await fetchGet(API_URL + 'experiment-at/reload-experiment');
            if (response.ok) {
                let experimentInformation = await response.json();
                if (experimentInformation.is_running) {
                    // If experiment was already running restore the last known state
                    try {
                        commit('setIsRecovering', true);
                        commit('restoreAuth', experimentInformation.experiment_data.auth);
                        // Functions inside the problem don't survive the recovery, so they need to be reloaded from scratch
                        commit('restoreDaphne', experimentInformation.experiment_data.daphne);
                        commit('restoreExperiment', experimentInformation.experiment_data.experiment);
                        commit('restoreDaphneAT', experimentInformation.experiment_data.daphneat);
                    }
                    catch(err) {
                        console.log(err);
                    }
                    // Start the websockets after completing the request so the session cookie is already set
                    await wsTools.experimentWsConnect();
                    await wsTools.wsConnect(this);
                }
            }
            else {
                console.error('Error recovering the experiment.');
            }
        }
        catch(e) {
            console.error('Networking error:', e);
        }
    }
};

// mutations
const mutations = {
    setInExperiment(state, inExperiment) {
        state.inExperiment = inExperiment;
    },
    setExperimentStage(state, experimentStage) {
        state.experimentStage = experimentStage;
        state.currentStageNum++;
    },
    setNextStage(state, { experimentStage, nextStage }) {
        state.stageInformation[experimentStage].nextStage = nextStage;
    },
    setStartTime(state, { experimentStage, startTime }) {
        state.stageInformation[experimentStage].startTime = startTime;
    },
    restoreExperiment(state, recoveredState) {
        Object.keys(recoveredState).forEach((key) => {
            if (key !== 'isRecovering') {
                state[key] = recoveredState[key];
            }
        });
    },
    setIsRecovering(state, isRecovering) {
        state.isRecovering = isRecovering;
    },
};

export default {
    state,
    getters,
    actions,
    mutations
}
