import {fetchPost} from "../../scripts/fetch-helpers";

const state = {
    telemetryPlotData: [],
    telemetryInputVariables: [],
    telemetryInputVariablesUnits: {},
    telemetryPlotSelectedVariables: [],
    symptomsList: [],
    selectedSymptomsList: [],
    diagnosisReport: [],
    telemetryIsOngoing: false,
    selectedAnomalies: [],
    allAnomaliesList: [],
};

const getters = {
    getPlotData(state) {return state.telemetryPlotData},
    getSelectedVariables(state) {return state.telemetryPlotSelectedVariables},
    getInputVariables(state) {return state.telemetryInputVariables},
    getInputVariablesUnits(state) {return state.telemetryInputVariablesUnits},
    getSymptomsList(state) {return state.symptomsList},
    getSelectedSymptomsList(state) {return state.selectedSymptomsList},
    getDiagnosisReport(state) {return state.diagnosisReport},
    getTelemetryIsOngoing(state) {return state.telemetryIsOngoing},
    getSelectedAnomaliesDict(state) {return state.selectedAnomalies},
    getAllAnomaliesList(state) {return state.allAnomaliesList},
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
    async retrieveProcedureFromAnomaly(state, anomalyName) {
        let reqData = new FormData();
        reqData.append('anomaly_name',  JSON.stringify(anomalyName));
        let response = await fetchPost('/api/at/retrieveProcedureFromAnomaly', reqData);
        if (response.ok) {
            let procedureName = await response.json();
            return procedureName;
        } else {
            console.log('Error retrieving the procedure name.');
            return 'ERROR'
        }
    },
    async retrieveStepsFromProcedure(state, procedureName) {
        let reqData = new FormData();
        reqData.append('procedure_name',  JSON.stringify(procedureName));
        let response = await fetchPost('/api/at/retrieveStepsFromProcedure', reqData);
        if (response.ok) {
            let stepsList = await response.json();
            return stepsList;
        } else {
            console.log('Error retrieving the procedure name.');
            return ['ERROR']
        }
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
    async requestDiagnosis(state, selectedSymptomsList) {
        let reqData = new FormData();
        reqData.append('symptomsList',  JSON.stringify(selectedSymptomsList));
        let response = await fetchPost('/api/at/requestDiagnosis', reqData);
        if (response.ok) {
            let diagnosis_report = await response.json();
            state.diagnosisReport = diagnosis_report;
        } else {
            console.log('Error requesting a diagnosis report.')
        }
    },
    async loadAllAnomalies(state) {
        let reqData = new FormData();
        let response = await fetchPost('/api/at/loadAllAnomalies', reqData);
        if (response.ok) {
            let anomaly_list = await response.json();
            state.allAnomaliesList = anomaly_list;
        } else {
            console.log('Error loading the anomalies list.');
        }
    },
    async updateSelectedAnomalies(state, newAnomaly) {
        state.selectedAnomalies.push(newAnomaly);
    },
};

export default {
    state,
    getters,
    actions,
    mutations,
}
