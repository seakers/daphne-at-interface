import * as _ from 'lodash-es';

let functionalityTypes = new Map();

// Anomaly Code
functionalityTypes.set('AnomalyDetection', {
    title: 'Anomaly Detection',
    component: 'AnomalyDetection',
    class: 'anomaly-detection',
    minSize: 'two-thirds',
    maxRepeat: 1,
    optionsList: [
        // Here we will be listing all the methods implemented
        // Algorithms parameters are defined in algorithmsInfo in 'anomaly-problem'
        {name: "", value: ""},
        {name: "UniVariate: Windowed Statistic Method", value: "ADWindowedStats"},
        {name: "UniVariate: Seasonal ARIMA + Exogenous Variables", value: "SARIMAX_AD"},
        {name: "Multivariate: Adaptive Kernel Density Based", value: "adaptiveKNN"},
        {name: "Multivariate: Isolation Forest", value: "iForest"}
    ]
});

functionalityTypes.set('AnomalyQuestions', {
    title: 'Anomaly Questions',
    component: 'AnomalyQuestions',
    class: 'anomaly-questions',
    minSize: 'one-third',
    maxRepeat: 1,
    optionsList: []
});

functionalityTypes.set('DaphneAnswer', { title: 'Answers', component: 'DaphneAnswer', class: 'answers', minSize: 'one-third', maxRepeat: 1});
functionalityTypes.set('OrbitInstrInfo', {
    title: 'Orbits and Instruments Information',
    class: 'orbit-instr-info',
    minSize: 'one-third',
    maxRepeat: 10,
    optionsList: [
        {name: "", value: ""},
        {name: "Orbits Information", value: "orb_info"},
        {name: "Instruments Information", value: "instr_info"}
    ]});
functionalityTypes.set('AvailableCommands', {
    title: 'Available Commands',
    class: 'available-commands',
    minSize: 'one-third',
    maxRepeat: 10,
    optionsList: [
        {name: "", value: ""},
        {name: "General", value: "general"},
        {name: "iFEED", value: "ifeed"},
        {name: "Analyst", value: "analyst"},
        {name: "Critic", value: "critic"},
        {name: "Historian", value: "historian"}
    ]});
functionalityTypes.set('CommandsInformation', {
    title: 'Commands Information',
    class: 'commands-information',
    minSize: 'one-third',
    maxRepeat: 10,
    optionsList: [
        {name: "", value: ""},
        {name: "Analyst Instruments", value: "analyst_instruments"},
        {name: "Analyst Instrument Parameters", value: "analyst_instrument_parameters"},
        {name: "Analyst Measurements", value: "analyst_measurements"},
        {name: "Analyst Stakeholders", value: "analyst_stakeholders"},
        {name: "Analyst Objectives", value: "objectives"},
        {name: "Historical Measurements", value: "measurements"},
        {name: "Historical Missions", value: "missions"},
        {name: "Historical Technologies", value: "technologies"},
        {name: "Historical Space Agencies", value: "space_agencies"}
    ]});


let newFunctionalityId = 0;

// initial state
// shape: [{ id, quantity }]
const state = {
    availableFunctionalities: [
        // { name: 'DaphneAnswer', title: 'Answers', icon: 'fa-comments' },
        { name: 'AnomalyDetection', title: 'Anomaly Detection', icon: 'fa-chart-bar' },
        { name: 'AnomalyQuestions', title: 'Questions', icon: 'fa-question-circle' },
        // { name: 'OrbitInstrInfo', title: 'Orbits and Instruments Information', icon: 'fa-book' },
        // { name: 'AvailableCommands', title: 'Available Commands', icon: 'fa-book' },
        // { name: 'CommandsInformation', title: 'Commands Information', icon: 'fa-book' }
    ],
    functionalities: [],
    functionalityCount: {
        'DaphneAnswer': 0,
        'AnomalyDetection': 0,
        'AnomalyQuestions': 0,
        'OrbitInstrInfo': 0,
        'AvailableCommands': 0,
        'CommandsInformation': 0
    }
};

const initialState = _.cloneDeep(state);

// getters
const getters = {
    getOptionsList: (state) => (name) => {
        return functionalityTypes.get(name).optionsList;
    }
};

// actions
const actions = {
};

// mutations
const mutations = {
    addFunctionality(state, functionality) {
        let funcInfo = functionalityTypes.get(functionality);

        if (state.functionalityCount[functionality] < funcInfo.maxRepeat) {
            // Add to columns and to the array
            state.functionalities.push({
                name: functionality,
                component: funcInfo.component,
                title: funcInfo.title,
                funcClass: funcInfo.class,
                initialSize: funcInfo.minSize,
                id: newFunctionalityId++
            });
            state.functionalityCount[functionality]++;
        }
    },
    closeFunctionality(state, funcId) {
        let funcIndex = state.functionalities.findIndex((elem) => elem.id === funcId);
        let funcName = state.functionalities[funcIndex].name;
        state.functionalities.splice(funcIndex, 1);
        state.functionalityCount[funcName]--;
    },
};

export default {
    state,
    getters,
    actions,
    mutations
}
