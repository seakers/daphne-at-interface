<template>
    <div class="is-seclss-background-black">
        <div class="horizontal-divider"></div>
        <div class="columns" style="margin-bottom: 5px">
            <div class="column is-8.9">
                <div class="box is-main" style="margin-bottom: 5px">
                    <anomaly-detection-window></anomaly-detection-window>
                </div>
                <div class="box is-main" style="margin-bottom: 5px">
                    <sensor-data-window></sensor-data-window>
                </div>
                <div class="box is-main" style="margin-bottom: 5px">
                    <anomaly-diagnosis-window></anomaly-diagnosis-window>
                </div>
                <div class="box is-main" style="margin-bottom: 5px">
                    <anomaly-response-window></anomaly-response-window>
                </div>
                <div style="margin-top: 20px">
                    <the-footer></the-footer>
                </div>
            </div>
            <div class="vertical-divider"></div>
            <div class="column is-3">
                <chat-window class="column"></chat-window>
            </div>
        </div>
    </div>
</template>

<script>

    import { mapGetters } from 'vuex';
    import {wsTools} from "../scripts/websocket-tools";

    let introJs = require('intro.js').introJs;

    import QuestionBar from './QuestionBar';
    import DaphneAnswer from "./DaphneAnswer";
    import SensorDataWindow from "./SensorDataWindow";
    import AnomalyDetectionWindow from "./AnomalyDetectionWindow";
    import AnomalyDiagnosisWindow from "./AnomalyDiagnosisWindow";
    import ChatWindow from "./ChatWindow";
    import TheFooter from "./TheFooter";
    import AnomalyResponseWindow from "./AnomalyResponseWindow";
    import {fetchPost} from "../scripts/fetch-helpers";

    export default {
        name: 'app',
        data: function () {
            return {
                tutorial: {},
            }
        },
        computed: {
            ...mapGetters({
                inExperiment: 'getInExperiment',
                experimentStage: 'getExperimentStage',
                stageInformation: 'getStageInformation',
                websocket: 'getWebsocket',
                isRecovering: 'getIsRecovering',
                currentStageNum: 'getCurrentStageNum',
                datasets: 'getDatasets',
                aggregationXls: 'getAggregationXls'
            }),
            stageDuration() {
                return this.stageInformation[this.experimentStage].stageDuration;
            },
            stageStartTime() {
                return this.stageInformation[this.experimentStage].startTime;
            },
        },
        methods: {
            onCountdownEnd() {
                console.log('Countdown ended!');
                // First stop the current stage
                this.$store.dispatch('finishStage').then(() => {
                });
            },
        },
        components: {
            AnomalyResponseWindow,
            AnomalyDiagnosisWindow,
            AnomalyDetectionWindow,
            ChatWindow,
            SensorDataWindow,
            DaphneAnswer,
            QuestionBar,
            TheFooter
        },
        async mounted() {
            await fetchPost('/api/auth/generate-session', new FormData());
            // Connect to Websocket
            await wsTools.wsConnect(this.$store);

            // Generate the session
            await fetchPost(API_URL + 'auth/generate-session', new FormData());
            // Start the Websocket
            await wsTools.wsConnect(this.$store);
            // Check if user is logged in before putting prompt
            try {
                fetchGet(API_URL + 'auth/check-status').then(async (response) => {
                    if (response.ok) {
                        let data = await response.json();
                        // Start by setting problem name and current dataset
                        let problemName = data['problem'];
                        let datasetFilename = data['dataset_filename'];
                        let datasetUser = data['dataset_user'];
                        if (problemName === '') {
                            problemName = 'SMAP';
                        }
                        if (datasetFilename === '') {
                            datasetFilename = 'test_smap.csv';
                        }
                        // Put the name and dataset back into the store
                        await this.$store.dispatch('setProblemName', problemName);
                        this.$store.commit('setDatasetInformation', {
                            filename: datasetFilename,
                            user: datasetUser
                        });
                        // If the user is already logged in, just proceed with loading as usual; if not, show login screen
                        if (data['is_logged_in'] === true) {
                            this.$store.commit('logUserIn', data);
                            this.init(data);
                        }
                        else {
                            this.$store.commit('activateModal', 'LoginModal');
                        }
                    }
                });
            }
            catch (e) {
                console.error('Networking error:', e);
            }
            // Generate the session
            await fetchPost(API_URL + 'auth/generate-session', new FormData());
            // Experiment
            this.$store.dispatch('recoverExperiment').then(async () => {
                this.$store.commit('setIsRecovering', false);
                // Only start experiment if it wasn't already running
                if (!this.inExperiment) {
                    // First of all login
                    await this.$store.dispatch('loginUser', {
                        username: "tamu-experiment",
                        password: "tamu2019"
                    });
                    this.$store.dispatch('startExperiment').then(async () => {
                        // Restart WS after login
                        await wsTools.wsConnect(this.$store);
                        await wsTools.experimentWsConnect();
                        // Set the tutorial
                        this.$store.commit('setExperimentStage', 'tutorial');
                        this.$store.commit('setInExperiment', true);
                    });
                }
            });
        },
        watch: {
            experimentStage: function (val, oldVal) {
                if (this.inExperiment && !this.isRecovering) {
                    // Reset state
                    this.$store.commit('resetDaphne');
                    this.$store.commit('resetProblem');
                    this.$store.commit('resetFilter');

                    // Load stage dataset
                    this.$store.dispatch('loadNewData', this.datasets[this.currentStageNum]).then(async () => {
                        // Switch the VASSAR models for the new ones specific to this dataset
                        await this.$store.dispatch('changeProblemLoadedFiles', {
                            'aggregationXls': this.aggregationXls[this.currentStageNum]
                        });
                        // Stage specific behaviour
                        switch (this.experimentStage) {
                            case 'tutorial': {
                                this.tutorial.addSteps(this.$store.state.experiment.stageInformation.tutorial.steps);
                                this.tutorial.setOption('exitOnOverlayClick', false);
                                this.tutorial.setOption('exitOnEsc', false);
                                this.tutorial.oncomplete(() => {
                                    this.$store.dispatch('startStage', this.stageInformation.tutorial.nextStage).then(() => {
                                        this.$store.commit('setExperimentStage', this.stageInformation.tutorial.nextStage);
                                    });
                                });
                                // TODO: Hijack next button action on tutorial
                                this.tutorial.start();
                                break;
                            }
                            case 'no_daphne': {
                                break;
                            }
                            case 'daphne_peer': {
                                break;
                            }
                            case 'daphne_assistant': {
                                break;
                            }
                            default: {
                                break;
                            }
                        }
                    });
                }
            }
        }
    }
</script>

<style lang="scss">
    @import "../../node_modules/bulma/sass/utilities/initial-variables";
</style>
