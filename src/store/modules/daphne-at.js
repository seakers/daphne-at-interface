import {fetchPost} from "../../scripts/fetch-helpers";

const state = {
    // Telemetry slot variables
    telemetryPlotData: [],
    telemetryInputVariables: [],
    telemetryInputVariablesUnits: {},
    telemetryPlotSelectedVariables: [],
    telemetryIsOngoing: false,

    // Symptoms detection and diagnosis slots variables
    symptomsList: [],
    selectedSymptomsList: [],

    // Diagnosis report slot variables
    diagnosisReport: [],

    // Anomaly treatment slot variables
    selectedAnomaliesList: [],
    selectedAnomaliesInfo: {},
    allAnomaliesList: [],
};

const getters = {
    // A getter for each state variable
    getPlotData(state) {return state.telemetryPlotData},
    getSelectedVariables(state) {return state.telemetryPlotSelectedVariables},
    getInputVariables(state) {return state.telemetryInputVariables},
    getInputVariablesUnits(state) {return state.telemetryInputVariablesUnits},
    getTelemetryIsOngoing(state) {return state.telemetryIsOngoing},
    getSymptomsList(state) {return state.symptomsList},
    getSelectedSymptomsList(state) {return state.selectedSymptomsList},
    getDiagnosisReport(state) {return state.diagnosisReport},
    getSelectedAnomaliesList(state) {return state.selectedAnomaliesList},
    getSelectedAnomaliesInfo(state) {return state.selectedAnomaliesInfo},
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
    async parseAndAddSelectedAnomaly({state, commit}, anomalyName) {
        let procedure = await Promise.resolve(this.dispatch('retrieveProcedureFromAnomaly', anomalyName));
        let stepsList = await Promise.resolve(this.dispatch('retrieveStepsFromProcedure', procedure));
        let currentStep = 0;
        let anomalyInfo = {'procedure': procedure, 'stepsList': stepsList, 'currentStep': currentStep};
        let newAnomalyDict = {'anomalyName': anomalyName, 'anomalyInfo': anomalyInfo};
        commit('addSelectedAnomaly', newAnomalyDict);
    }
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
    async addSelectedAnomaly(state, newAnomalyDict) {
        let anomalyName = newAnomalyDict['anomalyName'];
        let anomalyInfo = newAnomalyDict['anomalyInfo'];
        state.selectedAnomaliesList.push(anomalyName);
        state.selectedAnomaliesInfo[anomalyName] = anomalyInfo;
    },
    async removeSelectedAnomaly(state, anomalyName) {
        let selectedAnomaliesList = state.selectedAnomaliesList;
        let indexToDelete = 0;
        for (let index in selectedAnomaliesList) {
            let anomaly = selectedAnomaliesList[index];
            if (anomaly === anomalyName) {
                indexToDelete = index;
            }
        }
        state.selectedAnomaliesList.splice(indexToDelete, 1);
        delete state.selectedAnomaliesInfo[anomalyName];
    }
};

export default {
    state,
    getters,
    actions,
    mutations,
}
