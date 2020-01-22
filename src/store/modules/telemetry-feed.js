import {fetchPost} from "../../scripts/fetch-helpers";

const state = {
    telemetryPlotData: [],
    telemetryInputVariables: [],
    telemetryInputVariablesUnits: {},
    telemetryPlotSelectedVariables: [],
    symptomsList: [],
    selectedSymptomsList: [],
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
    getInputVariablesUnits(state) {
        return state.telemetryInputVariablesUnits;
    },
    getSymptomsList(state) {
        return state.symptomsList;
    },
    getSelectedSymptomsList(state) {
        return state.selectedSymptomsList;
    },
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
    async initializeTelemetry(state, telemetryVariablesInfo) {
        let telemetryVariablesNames = telemetryVariablesInfo['names'];
        let telemetryVariablesUnits = telemetryVariablesInfo['units'];
        state.telemetryInputVariables = telemetryVariablesNames;
        state.telemetryPlotSelectedVariables = [telemetryVariablesNames[0]];
        state.telemetryInputVariablesUnits = telemetryVariablesUnits;
    },
    async updateSelectedVariables(state, newVariables) {
        state.telemetryPlotSelectedVariables = newVariables;
    },
    async clearTelemetry(state) {
        state.telemetryPlotData = [];
        state.telemetryInputVariables = [];
        state.telemetryPlotSelectedVariables = [];
    },
    async updateSymptomsReport(state, symptomsReport) {
        let symptomsList = [];
        for (let index in symptomsReport) {
            let event = symptomsReport[index];
            let message = event['text'];
            symptomsList.push(message);
        }
        state.symptomsList = symptomsList;
    },
    async addSelectedSymptom(state, message) {
        let currentSelectedSymptoms = state.selectedSymptomsList;
        if (!currentSelectedSymptoms.includes(message)) {
            currentSelectedSymptoms.push(message);
            state.selectedSymptomsList = currentSelectedSymptoms;
        }
    },
    async clearSelectedSymptom(state, message) {
        let currentSelectedSymptoms = state.selectedSymptomsList;
        let index = currentSelectedSymptoms.indexOf(message);
        currentSelectedSymptoms.splice(index, 1);
        state.selectedSymptomsList = currentSelectedSymptoms;
    },
};

export default {
    state,
    getters,
    actions,
    mutations,
}
