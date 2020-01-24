import {fetchPost} from "../../scripts/fetch-helpers";

const state = {
    telemetryPlotData: [],
    telemetryInputVariables: [],
    telemetryInputVariablesUnits: {},
    telemetryPlotSelectedVariables: [],
    symptomsList: [],
    selectedSymptomsList: [],
    diagnosisReport: '',
    telemetryIsOngoing: false,
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
    getDiagnosisReport(state) {
        return state.diagnosisReport;
    },
    getTelemetryIsOngoing(state) {
        return state.telemetryIsOngoing;
    },
};

const actions = {
    async startTelemetry(state) {
        let reqData = new FormData();
        await fetchPost('/api/at/startTelemetry', reqData);
    },
    async stopTelemetry(state) {
        let reqData = new FormData();
        await fetchPost('/api/at/stop', reqData);
    },
    async requestDiagnosis(state, selectedSymptomsList) {
        let reqData = new FormData();
        reqData.append('symptomsList',  JSON.stringify(selectedSymptomsList));
        await fetchPost('/api/at/requestDiagnosis', reqData);
    },
};

const mutations = {
    async switchTelemetryStatus(state) {
        state.telemetryIsOngoing = !state.telemetryIsOngoing;
    },
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
        state.symptomsList = symptomsReport;
    },
    async addSelectedSymptom(state, symptom) {
        let currentSelectedSymptoms = state.selectedSymptomsList;
        let already_in_list = false;
        for (let index in currentSelectedSymptoms) {
            let item = currentSelectedSymptoms[index];
            if (JSON.stringify(item) === JSON.stringify(symptom)) {
                already_in_list = true;
            }
        }
        if (!already_in_list) {
            currentSelectedSymptoms.push(symptom);
            state.selectedSymptomsList = currentSelectedSymptoms;
        }
    },
    async clearSelectedSymptom(state, symptom) {
        let currentSelectedSymptoms = state.selectedSymptomsList;
        let index = currentSelectedSymptoms.indexOf(symptom);
        currentSelectedSymptoms.splice(index, 1);
        state.selectedSymptomsList = currentSelectedSymptoms;
    },
    async updateDiagnosisReport(state, diagnosis_report) {
        let symptoms_list = diagnosis_report['symptoms_list'];
        let diagnosis_list = diagnosis_report['diagnosis_list'];
        let parsed_symptoms_list = [];
        for (let index in symptoms_list) {
            let symptom = symptoms_list[index];
            let text = symptom['measurement'] + ' exceeds ' + symptom['relationship'];
            parsed_symptoms_list.push(text);
        }
        let parsed_diagnosis_report = 'The set of symptoms [' +
                                       parsed_symptoms_list +
                                      '] could be caused by [' +
                                       diagnosis_list + '].';
        state.diagnosisReport = parsed_diagnosis_report;
    },
};

export default {
    state,
    getters,
    actions,
    mutations,
}
