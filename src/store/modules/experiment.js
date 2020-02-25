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
        tutorial: {
            nextStage: '',
            steps: [
                {
                    text: `Hello astronaut! Congratulations on been selected as one of the crew members for the
                    mission to Mars.`
                },
                {
                    text: `My name is Daphne. I have been assigned as your personal assistant on this mission. I will monitor
                    the Environment Control and Life Support System (ECLSS) and notify you of anomalous events caused in its subsystems.
                    I can also help you troubleshoot anomalies by guiding you through a procedure.
                    Together, we'll make sure everything on this mission goes smoothly.
                    In the next few minutes, I will tell you more about myself and how I can help you with anomaly treatment.
                    So, please pay close attention.`
                },
                {
                    attachTo: {
                        element: '#telemetry-feed',
                        on: 'bottom'
                    },
                    text: `This is the <b>Sensor Data</b> window which will provide you with subsystem level information of ECLSS.
Here you will see real-time telemetry feed from various ECLSS subsystems. If you want to see the data related to a specific signature,
click on the drop down menu and select the signature you want to see. Right now you are looking at the feed of a default sensor.`
                },
                {
                    attachTo: {
                        element: '#telemetry-feed',
                        on: 'bottom'
                    },
                    text: `If you want to see multiple signatures at the same time,
                    you can do so by selecting multiple signatures from the drop down list. Try selecting multiple signatures and click on Next.`
                },
                {
                    attachTo: {
                        element: '#telemetry-feed',
                        on: 'bottom'
                    },
                    text: `You can click the close button next to a signature to remove it from the telemetry feed. Try doing it now. Click on Next when you're done.`
                },
                {
                    attachTo: {
                        element: '#anomaly-detection',
                        on: 'bottom'
                    },
                    text: `This is the  <b>Anomaly Detection</b> window. This is where you will get the first notification related to anomalies occurring
in ECLSS. I will alert you of the anomalies by changing the colors of this window. Blue color implies all the systems are working nominally. Yellow color implies that the signature related to that anomaly
has exceeded the Warning Limits and Red color will imply that the signature has exceeded Critical Limits. A signature exceeding Critical limits can pose serious
health hazards to the crew and must be rectified immediately.`
                },
                {
                    attachTo: {
                        element: '#anomaly-detection',
                        on: 'bottom'
                    },
                    text: `Once an anomaly is detected, you can click on it for diagnosis. Try clicking on an anomalous signature now and click Next.`
                },
                {
                    attachTo: {
                        element: '#anomaly_diagnosis',
                        on: 'bottom'
                    },
                    text: `When you click on an anomaly you want to diagnose in the Anomaly Detection window, it
                    will appear here, in <b>Anomaly Diagnosis</b> window. You will see the information about the anomalies you selected for diagnosis.For example, 'ppN2 exceeds upper critical limit' is one symptom of
an anomaly that is causing the partial pressure of Nitrogen to exceed nominal values.`
                },
                {
                    attachTo: {
                        element: '#anomaly_diagnosis',
                        on: 'bottom'
                    },
                    text: `Once you see the symptoms associated with anomalies, click on the symptom you want to
                    investigate further and then click on the 'Diagnose' button to find what may be the cause.
                    Try clicking on 'ppN2 exceeds upper critical limit' to further investigate this anomalous signature.`
                },
                {
                    attachTo: {
                        element: '#anomaly_response',
                        on: 'top'
                    },
                    text: `This is the <b>Anomaly Response</b> window. You can find information about treating anomalies here.
I will provide you with the list of steps that you can perform to resolve the anomalies that you are investigating.`
                },
                {
                    attachTo: {
                        element: '.chat-container',
                        on: 'left'
                    },
                    text: `This is the chat window where you can have a conversation with me. To ask a question, you can write it down in the question bar at the bottom, and then either click Send or press Enter
on your keyboard. To clear the question bar click on "Clear" button. If you want to hear my answers to you instead of just reading it, you can unmute me by clicking on the speaker`
                },
                {
                    attachTo: {
                        element: '.chat-container',
                        on: 'left'
                    },
                    text: `For example, you can ask me "What is the current value of the ppN2?", and I will give you the
 current value of partial pressure of nitrogen in the spacecraft. <b>Try writing or copying the above question into the
 text box.</b>`
                },
                {
                    attachTo: {
                        element: '.chat-container',
                        on: 'left'
                    },
                    text: `You can also ask me questions related to procedures or tools and components required during procedures.
 If you need a pdf procedure for a specific anomaly that you want to resolve, you can ask me "Show procedure for anomaly" followed by anomaly name and
 the procedure file will open in a new window for your viewing.`
                },
                {
                    text: `Now, you know all the tools available to you in order to solve anomalies during this mission. It is going to be a long, arduous journey, so good luck! Onwards to Mars!`
                },
            ],
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
                commit('setNextStage', { experimentStage: 'tutorial', nextStage: experimentStages[0] });
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
                    commit('setIsRecovering', true);
                    commit('restoreAuth', experimentInformation.experiment_data.auth);
                    // Functions inside the problem don't survive the recovery, so they need to be reloaded from scratch
                    commit('restoreDaphne', experimentInformation.experiment_data.daphne);
                    commit('restoreExperiment', experimentInformation.experiment_data.experiment);
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
