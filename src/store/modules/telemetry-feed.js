import {fetchPost} from "../../scripts/fetch-helpers";

const state = {
    telemetryPlotData: [],
    telemetryInputVariables: [],
    telemetryPlotSelectedVariables: [],
};

const getters = {
    getPlotData(state) {
        return state.telemetryPlotData;
    },
    getSelectedVariables(state) {
        return state.telemetryPlotSelectedVariables;
    },
    getInputVariables(state) {
        return state.telemetryInputVariables;
    },
}

const actions = {
    async simulateTelemetry() {
        let reqData = new FormData();
        let dataResponse = await fetchPost('/api/at/telemetry/simulate', reqData);
        if (dataResponse.ok) {
            console.info('Triggering the telemetry feed simulation.')
        }
        else {
            console.error('Error simulating the telemetry feed.');
        }
    },
};

const mutations = {
    async updateTelemetryPlotData(state, telemetryData) {
        state.telemetryPlotData = telemetryData;
    },
    async initializeTelemetry(state, telemetryVariables) {
        state.telemetryInputVariables = telemetryVariables;
        state.telemetryPlotSelectedVariables = [telemetryVariables[0]];
    },
    async updateSelectedVariables(state, newVariables) {
        state.telemetryPlotSelectedVariables = newVariables;
    }
};

export default {
    state,
    getters,
    actions,
    mutations,
}
