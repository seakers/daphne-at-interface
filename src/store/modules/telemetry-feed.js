import {fetchPost} from "../../scripts/fetch-helpers";

const state = {
    telemetryPlotData: [],
    telemetryInputVariables: [],
    telemetryPlotSelectedVariables: [],
    signatureMessages: [],
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
    getSignatureMessages(state) {
        return state.signatureMessages
    }
};

const actions = {
    async startTelemetry() {
        let reqData = new FormData();
        await fetchPost('/api/at/simulate', reqData);
    },
    async stopTelemetry() {
        let reqData = new FormData();
        await fetchPost('/api/at/stop', reqData);
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
    },
    async clearTelemetry(state) {
        state.telemetryPlotData = [];
        state.telemetryInputVariables = [];
        state.telemetryPlotSelectedVariables = [];
    },
    async updateSignatureMessages(state, messages) {
        state.signatureMessages = messages;
    }
};

export default {
    state,
    getters,
    actions,
    mutations,
}
