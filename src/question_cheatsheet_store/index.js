import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production';

export default new Vuex.Store({
    state: {
        questionList: [
            {
                'question': 'Show the current value of X measurement.',
                'parameters': 'A measurement, as a name (e. g.: "Pressure") and a parameter group (e. g.: "L1").',
                'answer': 'The last numerical value of measurement X is provided.'
            },
            {
                'question': 'What are the thresholds for measurement X?',
                'parameters': 'A measurement, as a name (e. g.: "Pressure") and a parameter group (e. g.: "L1").',
                'answer': 'The warning and critical thresholds of measurement X are provided.'
            },
            {
                'question': 'Check the status of X measurement.',
                'parameters': 'A measurement, as a name (e. g.: "Pressure") and a parameter group (e. g.: "L1").',
                'answer': 'The X measurement status zone (i. e.: Nominal, UWL, LWL, etc.) is provided.'
            },
            {
                'question': 'What are the potential risks of X anomaly?',
                'parameters': 'An anomaly (e. g.: "N2 Tank Burst").',
                'answer': 'A list with the potential risks of anomaly X is provided.'
            },
            {
                'question': 'What are the signatures of anomaly X?',
                'parameters': 'An anomaly (e. g.: "N2 Tank Burst").',
                'answer': 'A list with the names of the measurements affected by anomaly X is provided.'
            },
            {
                'question': 'What subsystems does anomaly X affect?',
                'parameters': 'An anomaly (e. g.: "N2 Tank Burst").',
                'answer': 'A list with the names of the subsystems affected by anomaly X is provided.'
            },
            {
                'question': 'What are the procedures for anomaly X?',
                'parameters': 'An anomaly (e. g.: "N2 Tank Burst").',
                'answer': 'A list with the names of the procedures related to anomaly X is provided.'
            },
            {
                'question': 'Provide procedure X.',
                'parameters': 'A procedure (e. g.: "N2 Ballast Tank Replacement").',
                'answer': 'A link is provided so that the procedure PDF can be opened in a new tab.'
            },
            {
                'question': 'What components does procedure X impact?',
                'parameters': 'A procedure (e. g.: "N2 Ballast Tank Replacement").',
                'answer': 'A list with the names of the components affected by procedure X is provided.'
            },
            {
                'question': 'How long will it take to correct anomaly X?',
                'parameters': 'An anomaly (e. g.: "N2 Tank Burst").',
                'answer': 'A list with the estimated times to complete each procedure related to anomaly X is provided.'
            },
            {
                'question': 'How long does it take to complete X procedure?',
                'parameters': 'A procedure (e. g.: "N2 Ballast Tank Replacement").',
                'answer': 'The estimated time to complete procedure X is provided.'
            },
            {
                'question': 'Show the image of component X.',
                'parameters': 'A component (e. g.: "Emergency O2 Generation System").',
                'answer': 'The image for component X has been provided.'
            }
        ],
        selectedQuestionsList: [],
    },
    computed: {
    },
    getters: {
        getQuestionList(state) {return state.questionList},
        getSelectedQuestionsList(state) {return state.selectedQuestionsList},
    },
    mutations: {
        mutateSelectedQuestionsList(state, newVal) {state.selectedQuestionsList = newVal},
    },
    actions: {
        async addSelectedQuestion({state, commit}, question) {
            let currentSelectedQuestions = JSON.parse(JSON.stringify(state.selectedQuestionsList));
            currentSelectedQuestions.push(question);
            commit('mutateSelectedQuestionsList', currentSelectedQuestions);
        },
        async removeSelectedQuestion({state, commit}, question) {
            let currentSelectedQuestions = JSON.parse(JSON.stringify(state.selectedQuestionsList));
            let index = currentSelectedQuestions.indexOf(question);
            currentSelectedQuestions.splice(index, 1);
            commit('mutateSelectedQuestionsList', currentSelectedQuestions);
        },
    },
    modules: {
    },
    strict: debug
});
