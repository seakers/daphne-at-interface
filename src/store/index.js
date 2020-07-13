import Vue from 'vue';
import Vuex from 'vuex';
import daphne from './modules/daphne';
import daphneat from './modules/daphne-at';
import experiment from './modules/experiment';
import auth from'./modules/auth';
import modal from './modules/modal';
import {processedPlotData} from "../scripts/at-display-builders";

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production';

export default new Vuex.Store({
    state: {
    },
    computed: {
    },
    getters: {
    },
    mutations: {
    },
    actions: {
        async onWebsocketsMessage({ commit, state, getters, dispatch }, message) {
            let received_info = JSON.parse(message.data);
            if (received_info['type'] === 'active.message') {
                commit('addDialoguePiece', received_info['message']);
            } else if (received_info['type'] === 'ping') {
                console.log("Ping back!");
            } else if (received_info['type'] === 'console_text') {
                console.log(received_info['text']);
            } else if (received_info['type'] === 'initialize_telemetry') {
                let telemetryDict = received_info['content'];
                if (telemetryDict !== '') {
                    dispatch('initializeTelemetry', telemetryDict);
                }
            } else if (received_info['type'] === 'telemetry_update') {
                // Only update telemetry plot if it is initialized
                if (state.daphneat.isTelemetryInitialized) {
                    console.log('Telemetry Update Received - All good');
                    let telemetryDict = received_info['content'];
                    let selectedVariables = state.daphneat.telemetryPlotSelectedVariables;
                    let plotData = processedPlotData(telemetryDict, selectedVariables);
                    dispatch('updateTelemetryPlotData', plotData);
                    dispatch('updateTelemetryValuesAndInfo', telemetryDict);
                }
                else {
                    console.log('Telemetry Update Received - Not yet initialized');
                }
            } else if (received_info['type'] === 'symptoms_report') {
                let content = received_info['content'];
                let symptoms_report = content['symptoms_report'];
                let alarm = content['alarm'];
                dispatch('triggerAlarm', alarm);
                dispatch('updateSymptomsList', symptoms_report);
            } else if (received_info['type'] === 'finish_experiment_from_mcc') {
                dispatch('finishStage').then(() => {
                    dispatch('finishExperiment').then(() => {
                        dispatch('stopRealTelemetry');
                        dispatch('stopFakeTelemetry');
                    });
                });
            }
        },
    },
    modules: {
        daphne,
        experiment,
        daphneat,
        auth,
        modal
    },
    strict: debug
});
