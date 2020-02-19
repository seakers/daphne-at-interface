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
        console.log('TELEMETRY STARTED');
    },
    async stopTelemetry({state, commit}) {
        let reqData = new FormData();
        await fetchPost('/api/at/stop', reqData);
        commit('mutateTelemetryIsOngoing');
        commit('mutateTelemetryPlotData', []);
        commit('mutateTelemetryInputVariables', []);
        commit('mutateTelemetryPlotSelectedVariables', []);
        commit('mutateTelemetryValues', '');
        commit('mutateTelemetryInfo', '');
        commit('mutateSymptomsList', []);
        commit('mutateSelectedSymptomsList', []);
        commit('mutateDiagnosisReport', []);
        commit('mutateSelectedAnomaliesList', []);
        commit('mutateSelectedAnomaliesInfo', {});
        commit('mutateSelectedProceduresList', []);
        commit('mutateSelectedProceduresInfo', {});
        console.log('TELEMETRY STOP');
    },
    async updateSymptomsList({state, commit}, symptomsList) {
        commit('mutateSymptomsList', symptomsList);
    },
    async addSelectedSymptom({state, commit}, symptom) {
        let currentSelectedSymptoms = JSON.parse(JSON.stringify(state.selectedSymptomsList));
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
        let currentSelectedSymptoms = JSON.parse(JSON.stringify(state.selectedSymptomsList));
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
    async addSelectedAnomaly({state, commit}, anomalyName) {
        // A copy of each state variable to be modified is made. Modifications will be made upon such copy, and the
        // changes will be committed at the end of the action.
        let newSelectedAnomaliesList = JSON.parse(JSON.stringify(state.selectedAnomaliesList));
        let newSelectedAnomaliesInfo = JSON.parse(JSON.stringify(state.selectedAnomaliesInfo));
        let newSelectedProceduresList = JSON.parse(JSON.stringify(state.selectedProceduresList));
        let newSelectedProceduresInfo = JSON.parse(JSON.stringify(state.selectedProceduresInfo));


        // Retrieve a list with the names of all the procedures related to the anomaly
        let procedures = await Promise.resolve(this.dispatch('retrieveProcedureFromAnomaly', anomalyName));

        // Update the copy of the state variables.
        newSelectedAnomaliesList.push(anomalyName);
        newSelectedAnomaliesInfo[anomalyName] = {'anomalyProcedures': procedures};

        // For each procedure in the list, check if it is already selected (because it may be related to an other selected anomaly)
        for (let index in procedures) {
            let procedureName = procedures[index];
            if (!newSelectedProceduresList.includes(procedureName)) {
                // In case it is not already selected, retrieve its list of steps
                let stepsList = await Promise.resolve(this.dispatch('retrieveStepsFromProcedure', procedureName));
                let procedureInfo = {'procedureStepsList': stepsList, 'currentStep': 0};

                // Commit the update on the procedure and its information
                newSelectedProceduresList.push(procedureName);
                newSelectedProceduresInfo[procedureName] = procedureInfo;
            }
        }

        // Perform the commits
        commit('mutateSelectedAnomaliesList', newSelectedAnomaliesList);
        commit('mutateSelectedAnomaliesInfo', newSelectedAnomaliesInfo);
        commit('mutateSelectedProceduresList', newSelectedProceduresList);
        commit('mutateSelectedProceduresInfo', newSelectedProceduresInfo);
    },
    removeSelectedAnomaly({state, commit}, anomalyName) {
        // A copy of each state variable to be modified is made. Modifications will be made upon such copy, and the
        // changes will be committed at the end of the action.
        let newSelectedAnomaliesList = JSON.parse(JSON.stringify(state.selectedAnomaliesList));
        let newSelectedAnomaliesInfo = JSON.parse(JSON.stringify(state.selectedAnomaliesInfo));
        let newSelectedProceduresList = JSON.parse(JSON.stringify(state.selectedProceduresList));
        let newSelectedProceduresInfo = JSON.parse(JSON.stringify(state.selectedProceduresInfo));

        // For comfort, retrieve the list of procedures related to the anomaly to be removed.
        let thisAnomalyProcedures = JSON.parse(JSON.stringify(state.selectedAnomaliesInfo[anomalyName]));

        // Search the index of the anomaly to be deleted within the anomaly list
        let indexAnomalyToDelete = 0;
        for (let index in newSelectedAnomaliesList) {
            let anomaly = newSelectedAnomaliesList[index];
            if (anomaly === anomalyName) {
                indexAnomalyToDelete = index;
            }
        }

        // Delete the anomaly list item and the anomaly info key
        newSelectedAnomaliesList.splice(indexAnomalyToDelete, 1);
        delete newSelectedAnomaliesInfo[anomalyName];

        // For each procedure related to the anomaly, check if it has to be deleted or not (that is, if there is any of
        // the other selected anomalies that is also related to the procedure)
        let proceduresToDelete = [];
        for (let index in thisAnomalyProcedures) {
            let procedure = thisAnomalyProcedures[index];
            let isRelatedToAnotherAnomaly = false;
            for (let otherAnomalyName in newSelectedAnomaliesInfo) {
                // Note that the entry to the anomaly that has to be deleted has already been removed from the dictionary
                let otherAnomalyProcedures = newSelectedAnomaliesInfo[otherAnomalyName]['anomalyProcedures'];
                if (otherAnomalyProcedures.includes(procedure)) {
                    isRelatedToAnotherAnomaly = true;
                }
            }
            if (!isRelatedToAnotherAnomaly) {
                proceduresToDelete.push(procedure);
            }
        }

        // For each procedure to be deleted...
        for (let index in proceduresToDelete) {
            // ... find the index of the procedure to be deleted from the procedure list...
            let procedureToDelete = proceduresToDelete[index];
            let indexProcedureToDelete = 0;
            for (let index in newSelectedProceduresList) {
                let procedure = newSelectedProceduresList[index];
                if (procedure === procedureToDelete) {
                    indexProcedureToDelete = index;
                }
            }

            // Delete the procedure list item and the procedure info key
            newSelectedProceduresList.splice(indexProcedureToDelete, 1);
            delete newSelectedProceduresInfo[procedureToDelete];
        }

        // Perform the commits
        commit('mutateSelectedAnomaliesList', newSelectedAnomaliesList);
        commit('mutateSelectedAnomaliesInfo', newSelectedAnomaliesInfo);
        commit('mutateSelectedProceduresList', newSelectedProceduresList);
        commit('mutateSelectedProceduresInfo', newSelectedProceduresInfo);
    },
    updateProcedureDict({state, commit}, newProcedureDict) {
        // A copy of the state variable to be modified is made
        let newSelectedProceduresInfo = JSON.parse(JSON.stringify(state.selectedProceduresInfo));

        // The updated procedure information is parsed
        let procedureName = newProcedureDict['procedureName'];
        let procedureStepsList = newProcedureDict['procedureSteps'];
        let currentStep = newProcedureDict['procedureCurrentStep'];

        // The copy is modified
        newSelectedProceduresInfo[procedureName] = {'procedureStepsList': procedureStepsList, 'currentStep': currentStep};

        // Perform the commit
        commit('mutateSelectedProceduresInfo', newSelectedProceduresInfo);
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
    mutateTelemetryPlotData(state, newVal) {state.telemetryPlotData = newVal},
    mutateTelemetryValues(state, newVal) {state.telemetryValues = newVal},
    mutateTelemetryInfo(state, newVal) {state.telemetryInfo = newVal},
    mutateTelemetryInputVariables(state, newVal) {state.telemetryInputVariables = newVal},
    mutateTelemetryPlotSelectedVariables(state, newVal) {state.telemetryPlotSelectedVariables = newVal},
    mutateSymptomsList(state, newVal) {state.symptomsList = newVal},
    mutateSelectedSymptomsList(state, newVal) {state.selectedSymptomsList = newVal},
    mutateDiagnosisReport(state, newVal) {state.diagnosisReport = newVal},
    mutateAllAnomaliesList(state, newVal) {state.allAnomaliesList = newVal},
    mutateSelectedAnomaliesList(state, newVal) {state.selectedAnomaliesList = newVal},
    mutateSelectedAnomaliesInfo(state, newVal) {state.selectedAnomaliesInfo = newVal},
    mutateSelectedProceduresList(state, newVal) {state.selectedProceduresList = newVal},
    mutateSelectedProceduresInfo(state, newVal) {state.selectedProceduresInfo = newVal},
};

export default {
    state,
    getters,
    actions,
    mutations,
}
