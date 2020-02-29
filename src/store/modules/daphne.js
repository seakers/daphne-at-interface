// initial state
import * as _ from 'lodash-es';
import {fetchGet, fetchPost} from "../../scripts/fetch-helpers";

const state = {
    command: '',
    dialogueHistory: [
        {"voice_message": 'Hello Daphne',
            "visual_message_type": ["text"],
            "visual_message": ['Hello Daphne'],
            "writer": "user"},
        {"voice_message": 'Hi User',
            "visual_message_type": ["text"],
            "visual_message": ['Hi User, how can I help?'],
            "writer": "daphne"}
    ],
    response: {},
    isLoading: false
};

const initialState = _.cloneDeep(state);

// getters
const getters = {
    getResponse(state) {
        return state.response;
    },
    getIsLoading(state) {
        return state.isLoading;
    }
};

// actions
const actions = {
    async loadDialogue({ state, commit, rootState }) {
        try {
            let dataResponse = await fetchGet(API_URL + 'at/dialogue/history');

            if (dataResponse.ok) {
                let data = await dataResponse.json();
                commit('setDialogueHistory', data['dialogue_pieces']);
            }
            else {
                console.error('Error retrieving past conversation history.');
            }
        }
        catch(e) {
            console.error('Networking error:', e);
        }
    },
    async clearHistory({ state, commit, rootState }) {
        try {
            let reqData = new FormData();
            let dataResponse = await fetchPost(API_URL + 'at/dialogue/clear-history', reqData);

            if (dataResponse.ok) {
                let data = await dataResponse.json();
                commit('setDialogueHistory', []);
            }
            else {
                console.error('Error clearing conversation history.');
            }
        }
        catch(e) {
            console.error('Networking error:', e);
        }
    },
    async executeCommand({ state, commit, rootState }) {
        try {
            commit('setIsLoading', true);
            commit('addDialoguePiece', {
                "voice_message": state.command,
                "visual_message_type": ["text"],
                "visual_message": [state.command],
                "writer": "user"
            });

            let reqData = new FormData();
            reqData.append('command', state.command);
            let dataResponse = await fetchPost('/api/at/dialogue/command', reqData);

            if (dataResponse.ok) {
                let data = await dataResponse.json();
                console.log(data['response']['visual_message_type']);
                commit('addDialoguePiece', data['response']);
            }
            else {
                console.error('Error processing the command.');
            }
        }
        catch(e) {
            console.error('Networking error:', e);
        }
        commit('setIsLoading', false);
    }
};

// mutations
const mutations = {
    setCommand(state, command) {
        state.command = command;
    },
    setResponse(state, response) {
        state.response = response;
    },
    setIsLoading(state, isLoading) {
        state.isLoading = isLoading;
    },
    resetDaphne(state) {
        state = Object.assign(state, _.cloneDeep(initialState));
    },
    restoreDaphne(state, recoveredState) {
        Object.keys(recoveredState).forEach((key) => {
            state[key] = recoveredState[key];
        });
    },
    setDialogueHistory(state, dialogueHistory) {
        state.dialogueHistory = dialogueHistory;
    },
    addDialoguePiece(state, dialoguePiece) {
        state.dialogueHistory.push(dialoguePiece);
    },
};

export default {
    state,
    getters,
    actions,
    mutations
}
