import {fetchPost} from "../../scripts/fetch-helpers";

const state = {
    // Telemetry related variables
    telemetryInputVariables: [], // A list of all the telemetry variables. Used for the telemetry plot dropdown menu.
    telemetryPlotSelectedVariables: [], // A list of the telemetry variables selected by the user to be displayed. RELEVANT FOR THE CONTEXT.
    telemetryPlotData: [], // Contains formatted telemetry feed values so that they can be properly plotted using vue.plotly.
    telemetryIsOngoing: false, // Self descriptive.
    telemetryValues: '', // A string that stores the telemetry values as a jsoned dataframe.
    telemetryInfo: '', // A string that stores the telemetry info as a jsoned dataframe. To be deprecated.

    // Symptoms detection and diagnosis related variables
    symptomsList: [], // A list of all the currently detected symptoms.
    selectedSymptomsList: [], // A list of the symptoms selected by the user to be diagnosed.
    diagnosisReport: [], // Contains the information related to a requested diagnosis.

    // Anomaly treatment related variables
    selectedAnomaliesList: [], // A list of the anomalies selected by the user to be displayed. RELEVANT FOR THE CONTEXT.
    selectedAnomaliesInfo: {}, // A dictionary with all the information of each of the selected anomalies.
    allAnomaliesList: [], // A list of all the anomalies that are present in the knowledge graph. Used for the telemetry plot dropdown menu.
    selectedProceduresList: [], // A list of all the procedures that relate to the current selected anomalies. RELEVANT FOR THE CONTEXT.
    selectedProceduresInfo: {}, // A dictionary with the information regarding the current status of the procedures.
};

const getters = {
    // A getter for each state variable
    getPlotData(state) {return state.telemetryPlotData},
    getSelectedVariables(state) {return state.telemetryPlotSelectedVariables},
    getInputVariables(state) {return state.telemetryInputVariables},
    getTelemetryIsOngoing(state) {return state.telemetryIsOngoing},
    getTelemetryValues(state) {return state.telemetryValues},
    getTelemetryInfo(state) {return state.telemetryInfo},
    getSymptomsList(state) {return state.symptomsList},
    getSelectedSymptomsList(state) {return state.selectedSymptomsList},
    getDiagnosisReport(state) {return state.diagnosisReport},
    getSelectedAnomaliesList(state) {return state.selectedAnomaliesList},
    getSelectedAnomaliesInfo(state) {return state.selectedAnomaliesInfo},
    getAllAnomaliesList(state) {return state.allAnomaliesList},
    getSelectedProceduresList(state) {return state.selectedProceduresList},
    getSelectedProceduresInfo(state) {return state.selectedProceduresInfo},
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
        let procedures = await Promise.resolve(this.dispatch('retrieveProcedureFromAnomaly', anomalyName));
        let proceduresList = [];
        for (let index in procedures) {
            let procedure = procedures[index];
            let stepsList = await Promise.resolve(this.dispatch('retrieveStepsFromProcedure', procedure));
            let procedureInfo = {'procedureName': procedure, 'procedureStepsList': stepsList};
            proceduresList.push(procedureInfo)
        }
        let newAnomalyDict = {'anomalyName': anomalyName, 'anomalyProceduresList': proceduresList};
        commit('addSelectedAnomaly', newAnomalyDict);
    },
    async requestDiagnosis({state, commit}, selectedSymptomsList) {
        let reqData = new FormData();
        reqData.append('symptomsList',  JSON.stringify(selectedSymptomsList));
        let response = await fetchPost('/api/at/requestDiagnosis', reqData);
        if (response.ok) {
            let diagnosis_report = await response.json();
            commit('setDiagnosisReport', diagnosis_report);
        } else {
            console.log('Error requesting a diagnosis report.')
        }
    },
    async loadAllAnomalies({state, commit}) {
        let reqData = new FormData();
        let response = await fetchPost('/api/at/loadAllAnomalies', reqData);
        if (response.ok) {
            let anomaly_list = await response.json();
            commit('setAllAnomaliesList', anomaly_list);
        } else {
            console.log('Error loading the anomalies list.');
        }
    },
};

const mutations = {
    switchTelemetryStatus(state) {
        state.telemetryIsOngoing = !state.telemetryIsOngoing;
    },
    updateTelemetryPlotData(state, telemetryData) {
        state.telemetryPlotData = telemetryData;
    },
    updateTelemetryValuesAndInfo(state, telemetryDict) {
        let telemetryValues = JSON.parse(telemetryDict['values']);
        let telemetryInfo = JSON.parse(telemetryDict['info']);
        state.telemetryValues = telemetryValues;
        state.telemetryInfo = telemetryInfo;
    },
    initializeTelemetry(state, telemetryDict) {
        let telemetryVariablesNames = telemetryDict['variables_names'];
        let telemetryValues = JSON.parse(telemetryDict['values']);
        let telemetryInfo = JSON.parse(telemetryDict['info']);
        state.telemetryInputVariables = telemetryVariablesNames;
        state.telemetryPlotSelectedVariables = [telemetryVariablesNames[0]];
        state.telemetryValues = telemetryValues;
        state.telemetryInfo = telemetryInfo;
    },
    updateSelectedVariables(state, newVariables) {
        state.telemetryPlotSelectedVariables = newVariables;
    },
    clearTelemetry(state) {
        state.telemetryPlotData = [];
        state.telemetryInputVariables = [];
        state.telemetryPlotSelectedVariables = [];
    },
    updateSymptomsReport(state, symptomsReport) {
        state.symptomsList = symptomsReport;
    },
    addSelectedSymptom(state, symptom) {
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
    clearSelectedSymptom(state, symptom) {
        let currentSelectedSymptoms = state.selectedSymptomsList;
        let index = currentSelectedSymptoms.indexOf(symptom);
        currentSelectedSymptoms.splice(index, 1);
        state.selectedSymptomsList = currentSelectedSymptoms;
    },
    setDiagnosisReport(state, diagnosisReport) {
        state.diagnosisReport = diagnosisReport;
    },
    setAllAnomaliesList(state, allAnomaliesList) {
        state.allAnomaliesList = allAnomaliesList;
    },
    addSelectedAnomaly(state, newAnomalyDict) {
        let anomalyName = newAnomalyDict['anomalyName'];
        let anomalyProceduresInfoList = newAnomalyDict['anomalyProceduresList'];
        let proceduresNameList = [];
        for (let index in anomalyProceduresInfoList) {
            let procedure = anomalyProceduresInfoList[index];
            let procedureName = procedure['procedureName'];
            if (!state.selectedProceduresList.includes(procedureName)) {
                let procedureStepsList = procedure['procedureStepsList'];
                let procedureInfo = {'procedureStepsList': procedureStepsList, 'currentStep': 0};
                state.selectedProceduresList.push(procedureName);
                state.selectedProceduresInfo[procedureName] = procedureInfo;
            }
            proceduresNameList.push(procedureName)
        }
        state.selectedAnomaliesList.push(anomalyName);
        state.selectedAnomaliesInfo[anomalyName] = {'anomalyProceduresList': proceduresNameList};
    },
    removeSelectedAnomaly(state, anomalyName) {
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
    },
    updateProcedureCurrentStep(state, commitInfo) {
        let procedureName = commitInfo['procedureName'];
        let newCurrentStep = commitInfo['newCurrentStep'];
        console.log('Updating procedure step!', procedureName, newCurrentStep);
        state.selectedProceduresInfo[procedureName]['currentStep'] = newCurrentStep;
    }
};

export default {
    state,
    getters,
    actions,
    mutations,
}
