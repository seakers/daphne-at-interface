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
                    text: `Hello astronaut! Congratulations for being selected as one of the crew members for the
                    mission to Mars.`
                },
                {
                    text: `My name is Daphne-AT. I have been assigned as your personal assistant on this mission. I will
                    monitor the Environment Control and Life Support System (ECLSS), and I will assist you with any
                    anomalies that may occur within its subsystems. Together, we will ensure the success of this mission.`
                },
                {
                    text: `In the next few minutes, I will tell you more about myself and how I can help you during the
                    process of treating an anomaly. So please, pay close attention!`
                },
                {
                    attachTo: {
                        element: '#telemetry-feed',
                        on: 'bottom'
                    },
                    text: `This is the <b>Sensor Data</b> window. The purpose of this area is to plot the evolution
                    of the measurements provided by the sensors of the ECLSS. As you can see, I am now showing the
                    sensor readings for the ppN2 (L1) measurement as a blue solid line. The other lines (the dashed 
                    orange and red ones) stand for the warning and critical limits of such measurement.`
                },
                {
                    attachTo: {
                        element: '#telemetry-feed',
                        on: 'bottom'
                    },
                    text: `Note that there is a dropdown menu at the top. You can use it to choose which
                    measurements you want me to display. I can even display more than one measurement at once! Bear in
                    mind though that if you want me to do so, then I will not show the limits of each measurement (there
                    would be too many lines!). Try clicking on the dropdown menu and adding a new measurement to the
                    plot. After that, try to remove by clicking on the little cross next to it. When you are done, click
                    Next.`
                },
                {
                    attachTo: {
                        element: '#anomaly-detection',
                        on: 'bottom'
                    },
                    text: `This is the  <b>Anomaly Detection</b> window. I will use this area to notify you about any
                    anomalies that I might find within the sensor data readings. As you can see right now, I will
                    basically provide you with a list of the measurements that exceed any of its limits.`
                },
                {
                    attachTo: {
                        element: '#anomaly-detection',
                        on: 'bottom'
                    },
                    text: `To make sure that you do not miss any of my notifications, this window is anchored to the top
                    of the screen, so you will always be able to see it (scroll down and check that!). Also, I will change
                    the color of this window to bring your attention, as well as to inform you about how severe are the 
                    anomalies that I found. I will use red when any measurement exceeds its critical limits, and orange
                    when all of them are just above its warning limits.`
                },
                {
                    attachTo: {
                        element: '#anomaly-detection',
                        on: 'bottom'
                    },
                    text: `Once an anomalous measurement is detected, you can click on it to select it. I will soon tell
                    you what is this useful for. Try selecting the ppN2 (L1) and Level Cabin Pressure (L1) anomalous
                    measurements, and then click Next.`
                },
                {
                    attachTo: {
                        element: '#anomaly_diagnosis',
                        on: 'bottom'
                    },
                    text: `This is the <b>Anomaly Diagnosis</b> window. Whenever you select an anomalous measurement, it
                    will appear on the upper slot. In fact, if you select more than one, I will display a list of all
                    of your selections. Right now, if you followed my instructions, you should be seeing 'ppN2(L1): is
                    above Upper Critic Limit' and 'Level Cabin Pressure (L1): is above Upper Critic Limit'.`
                },
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
                    text: `If you want to further explore any of my suggestions, you can click on it to select it. Try
                    selecting the 'N2 Tank Burst' now, and then click on Next.`
                },
                {
                    attachTo: {
                        element: '#anomaly_response',
                        on: 'top'
                    },
                    text: `This is the <b>Anomaly Response</b> window. In this area, I will display all the procedures
                    to treat each of the anomaly causes that you selected.`
                },
                {
                    attachTo: {
                        element: '#anomaly_response',
                        on: 'top'
                    },
                    text: `As you can se right now, the 'N2 Tank Burst' has only one related procedure, the 'N2 Ballast
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
                    required material to perform it and the steps that you show follow to complete it.`
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
                    text: `I am not almighty, so I could be providing you with wrong suggestions. In case you disagree
                    with me, you can use the dropdown menu at the top of this window to explore the procedures of other
                    anomalies of the ECLSS system. Try selecting a new one, and then deselect it by clicking on the tiny
                    cross next to it. Click Next when you are ready.`
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
                    the current value such measurement. Try writing or copying the above question into the text box,
                    area, and then click 'Send' or the enter tab.`
                },
                {
                    attachTo: {
                        element: '.sticky-textbox',
                        on: 'top'
                    },
                    text: `You can click on the 'Clear' button to clear all the previously asked questions and their
                    corresponding answers from our dialogue.`
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
                    text: `Now, you know all the tools available to you in order to solve anomalies during this mission.
                    It is going to be a long, arduous journey, so good luck! Onwards to Mars!`
                },
                {
                    text: `IMPORTANT: It should not be a problem, but try to avoid refreshing the browser page during the
                    experiment.`
                },
                {
                    text: `Now the experiment is about to start. Before you click Next, tell the person that is
                    monitoring you that you are ready. DO NOT click Next until he/she has given you explicit permission.`
                },
                {
                    text: `You should be seeing this only if you have been granted permission. Click on Next to start
                    the experiment.`
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
