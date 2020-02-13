'use strict';

import Vue from 'vue';

import App from './components/App';
import store from './store';
import {wsTools} from "./scripts/websocket-tools";

// Non ES-modularized libraries
let annyang = require('annyang');
let SpeechKITT = window.SpeechKITT;
let responsiveVoice = window.responsiveVoice;

// Styles
import 'shepherd.js/dist/css/shepherd.css';
import './styles/app.scss';

// Record state and mutations when inside an experiment
let stateTimer = 0;
let mutationBlackList = ['setIsLoading', 'resetDaphne', 'clearFeatures',
    'resetFilter', 'setProblem', 'updateExtra', 'updatePlotData', 'restoreFilter',
    'restoreDaphne', 'restoreExperiment', 'setIsRecovering'];
let updatesContextList = ['updateTelemetryValuesAndInfo'];


store.subscribe(async (mutation, state) => {
    // Only update if inside experiment
    if (state.experiment.inExperiment) {
        // Only update mutations if after tutorial (currentStageNum > 0)
        if (state.experiment.currentStageNum > 0 && !mutationBlackList.includes(mutation.type)) {
            // Upload mutation to server
            wsTools.experimentWebsocket.send(JSON.stringify({
                msg_type: 'add_action',
                stage: state.experiment.currentStageNum - 1,
                action: mutation
            }));
        }

        // Upload new state to server
        if (stateTimer === 0) {
            stateTimer = window.setInterval(async () => {
                wsTools.experimentWebsocket.send(JSON.stringify({
                    msg_type: 'update_state',
                    state: state
                }));
            }, 10000);
        }
    }
    else {
        if (stateTimer !== 0) {
            clearInterval(stateTimer);
            stateTimer = 0;
        }
    }

    // Context updates TODO: Refactor into something more modular
    if (updatesContextList.includes(mutation.type)) {
        // Lazily create the Websocket to ensure the session is already created by this point
        if (mutation.type === 'updateTelemetryValuesAndInfo') {
            wsTools.websocket.send(JSON.stringify({
                msg_type: 'context_add',
                new_context: {
                    atcontext: {
                        current_telemetry_values: mutation.payload['values'],
                    }
                }
            }));
        }
    }
});


let app = new Vue({
    el: '#app',
    store,
    propsData: {
        isViewer: false
    },
    render: h => h(App)
});

// Voice recognition
if (annyang) {
    annyang.addCallback('result', phrases => {
        if (responsiveVoice.isPlaying()) {
            return;
        }
        app.$store.commit('setCommand', phrases[0]);
        app.$store.dispatch('executeCommand');
    });

    annyang.debug();

    // Tell KITT to use annyang
    SpeechKITT.annyang();

    // Define a stylesheet for KITT to use
    SpeechKITT.setStylesheet('//cdnjs.cloudflare.com/ajax/libs/SpeechKITT/0.3.0/themes/flat.css');

    // Render KITT's interface
    // SpeechKITT.vroom();

    // SpeechKITT.startRecognition();
}
