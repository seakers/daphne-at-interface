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
    async updateTelemetryPlotData({state, commit}, telemetryData) {
        commit('mutateTelemetryPlotData', telemetryData)
    },
    async updateTelemetryValuesAndInfo({state, commit}, telemetryDict) {
        let telemetryValues = JSON.parse(telemetryDict['values']);
        let telemetryInfo = JSON.parse(telemetryDict['info']);
        commit('mutateTelemetryValues', telemetryValues);
        commit('mutateTelemetryInfo', telemetryInfo);
    },
    async initializeTelemetry({state, commit}, telemetryDict) {
        let telemetryVariablesNames = telemetryDict['variables_names'];
        let telemetryValues = JSON.parse(telemetryDict['values']);
        let telemetryInfo = JSON.parse(telemetryDict['info']);
        commit('mutateTelemetryInputVariables', telemetryVariablesNames);
        commit('mutateTelemetryPlotSelectedVariables', [telemetryVariablesNames[0]]);
        commit('mutateTelemetryValues', telemetryValues);
        commit('mutateTelemetryInfo', telemetryInfo);
    },
    async updateSelectedVariables({state, commit}, newVariables) {
        commit('mutateTelemetryPlotSelectedVariables', newVariables);
    },
    async startTelemetry({state, commit}) {
        let reqData = new FormData();
        await fetchPost('/api/at/startTelemetry', reqData);
        commit('mutateTelemetryIsOngoing');
    },
    async stopTelemetry({state, commit}) {
        let reqData = new FormData();
        await fetchPost('/api/at/stop', reqData);
        commit('mutateTelemetryIsOngoing');
        commit('mutateTelemetryPlotData', []);
        commit('mutateTelemetryInputVariables', []);
        commit('mutateTelemetryPlotSelectedVariables', []);
    },
    async updateSymptomsList({state, commit}, symptomsList) {
        commit('mutateSymptomsList', symptomsList);
    },
    async addSelectedSymptom({state, commit}, symptom) {
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
            commit('mutateSelectedSymptomsList', currentSelectedSymptoms);
        }
    },
    async removeSelectedSymptom({state, commit}, symptom) {
        let currentSelectedSymptoms = state.selectedSymptomsList;
        let index = currentSelectedSymptoms.indexOf(symptom);
        currentSelectedSymptoms.splice(index, 1);
        commit('mutateSelectedSymptomsList', currentSelectedSymptoms);
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
        // This action requires making a single commit for various store variables (rendering problems otherwise). For
        // this reason, a local copy of the each of the state variables is created and modified, and a single commit
        // is made passing such modified copies as arguments.
        // let selectedAnomaliesList = state.selectedAnomaliesList;
        // let selectedAnomaliesInfo = state.selectedAnomaliesInfo;
        // let selectedProceduresList = state.selectedProceduresList;
        // let selectedProceduresInfo = state.selectedProceduresInfo;

        // Update the selected anomalies and its info (in the state variables copy)


        // Retrieve a list with the names of all the procedures related to the anomaly
        let procedures = await Promise.resolve(this.dispatch('retrieveProcedureFromAnomaly', anomalyName));

        // For each procedure in the list, check if it is already selected (because it may be related to an other selected anomaly)
        for (let index in procedures) {
            let procedureName = procedures[index];
            if (!state.selectedProceduresList.includes(procedureName)) {
                // In case it is not already selected, retrieve its list of steps
                let stepsList = await Promise.resolve(this.dispatch('retrieveStepsFromProcedure', procedureName));
                let procedureInfo = {'procedureStepsList': stepsList, 'currentStep': 0};

                // Commit the update on the procedure and its information
                let commitInfo = {'procedureName': procedureName, 'procedureInfo': procedureInfo};
                commit('mutateSelectedProceduresList', procedureName);
                commit('mutateSelectedProceduresInfo', commitInfo);
            }
        }

        // Commit the update on the anomaly and its information
        let commitInfo = {'anomalyName': anomalyName, 'anomalyInfo': {'anomalyProcedures': procedures}};
        commit('mutateSelectedAnomaliesList', anomalyName);
        commit('mutateSelectedAnomaliesInfo', commitInfo);
    },
    async requestDiagnosis({state, commit}, selectedSymptomsList) {
        let reqData = new FormData();
        reqData.append('symptomsList',  JSON.stringify(selectedSymptomsList));
        let response = await fetchPost('/api/at/requestDiagnosis', reqData);
        if (response.ok) {
            let diagnosis_report = await response.json();
            commit('mutateDiagnosisReport', diagnosis_report);
        } else {
            console.log('Error requesting a diagnosis report.')
        }
    },
    async loadAllAnomalies({state, commit}) {
        let reqData = new FormData();
        let response = await fetchPost('/api/at/loadAllAnomalies', reqData);
        if (response.ok) {
            let anomaly_list = await response.json();
            commit('mutateAllAnomaliesList', anomaly_list);
        } else {
            console.log('Error loading the anomalies list.');
        }
    },
};

const mutations = {
    mutateTelemetryIsOngoing(state) {state.telemetryIsOngoing = !state.telemetryIsOngoing},
    mutateTelemetryPlotData(state, telemetryData) {state.telemetryPlotData = telemetryData},
    mutateTelemetryValues(state, telemetryValues) {state.telemetryValues = telemetryValues},
    mutateTelemetryInfo(state, telemetryInfo) {state.telemetryInfo = telemetryInfo},
    mutateTelemetryInputVariables(state, telemetryVariablesNames) {state.telemetryInputVariables = telemetryVariablesNames},
    mutateTelemetryPlotSelectedVariables(state, telemetryPlotSelectedVariables) {state.telemetryPlotSelectedVariables = telemetryPlotSelectedVariables},
    mutateSymptomsList(state, symptomsList) {state.symptomsList = symptomsList},
    mutateSelectedSymptomsList(state, selectedSymptomsList) {state.symptomsList = selectedSymptomsList},
    mutateDiagnosisReport(state, diagnosisReport) {state.diagnosisReport = diagnosisReport},
    mutateAllAnomaliesList(state, allAnomaliesList) {state.allAnomaliesList = allAnomaliesList},

    mutateSelectedAnomaliesList(state, anomalyName) {state.selectedAnomaliesList.push(anomalyName)},
    mutateSelectedAnomaliesInfo(state, commitInfo) {state.selectedAnomaliesInfo[commitInfo['anomalyName']] = commitInfo['anomalyInfo']},
    mutateSelectedProceduresList(state, procedureName) {state.selectedProceduresList.push(procedureName)},
    mutateSelectedProceduresInfo(state, commitInfo) {state.selectedProceduresInfo[commitInfo['procedureName']] = commitInfo['procedureInfo']},

    //////
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
        console.log(newCurrentStep);
        state.selectedProceduresInfo[procedureName]['currentStep'] = newCurrentStep;
    }
};

export default {
    state,
    getters,
    actions,
    mutations,
}
