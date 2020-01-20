import {fetchPost} from "../../scripts/fetch-helpers";

const state = {
    telemetryPlotData: [],
    telemetryInputVariables: [],
    telemetryPlotSelectedVariables: [],
    detectionMessages: [],
    diagnosisMessages: [],
    recommendationMessages: [],
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
    getDetectionMessages(state) {
        return state.detectionMessages
    },
    getDiagnosisMessages(state) {
        return state.diagnosisMessages
    },
    getRecommendationMessages(state) {
        return state.recommendationMessages
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
    async startSeclssFeed() {
        let reqData = new FormData();
        await fetchPost('/api/at/startSeclssFeed', reqData);
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
    async updateATMessages(state, report) {
        state.detectionMessages = report['detection'];
        state.diagnosisMessages = report['diagnosis'];
        state.recommendationMessages = report['recommendation'];
    }
};

export default {
    state,
    getters,
    actions,
    mutations,
}
