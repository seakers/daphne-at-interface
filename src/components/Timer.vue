<template>
    <div class="notification" id="experiment-timer">
        <p class="is-size-1">{{minutes}} : {{seconds}}</p>
    </div>

</template>

<script>
    import Shepherd from "shepherd.js";

    export default {
        name: 'timer',
        props: ['duration', 'startTime'],
        data() {
            return {
                now: 0,
                timeInterval: {}
            }
        },
        computed: {
            endTime() {
                return this.startTime + 1000*this.duration;
            },
            endTimer() {
                return (Math.floor(this.endTime - this.now) <= 0);
            },
            minutes() {
                let t = this.endTime - this.now;
                let minutes = Math.floor((t/1000/60) % 60);
                return ('0' + minutes).slice(-2);
            },
            seconds() {
                let t = this.endTime - this.now;
                let seconds = Math.floor((t/1000) % 60);
                return ('0' + seconds).slice(-2);
            }
        },
        methods: {
            createTimeInterval() {
                this.timeInterval = window.setInterval(() => {
                    this.now = Date.now();
                    if (this.endTime - this.now <= 0) {
                        window.clearInterval(this.timeInterval);
                        this.$emit('countdown-end');
                    }
                }, 1000);
            },
            timeUp() {
                this.$root.$emit('endExperiment');
                // set up pop up to link
                const surveyLink = new Shepherd.Tour({
                    defaultStepOptions: {
                        classes: 'shadow-md bg-purple-dark',
                        scrollTo: true
                    },
                    useModalOverlay: true,
                    exitOnEsc: false
                });
                // add steps
                surveyLink.addStep({
                    text: `The time for the experiment has expired. Please click the "Survey Link" button to
                    fill out the survey. Thank you.`,
                    buttons: [
                        {
                            text: 'Survey Link',
                            action: surveyLink.next
                        }
                    ]
                });
                // show the closing pop up
                surveyLink.show();
                // once the button is clicked, the tour is over and redirect to survey
                surveyLink.on("complete", () => {
                    window.location.replace("https://tamu.qualtrics.com/jfe/form/SV_6ydIj0PRqBE5RT7");
                });
            }
        },
        mounted() {
            this.createTimeInterval();
        },
        watch: {
            startTime: function (val, oldVal) {
                this.createTimeInterval();
            },
            now: function(val, oldVal) {
                if (this.endTimer) {
                    this.timeUp();
                }
            }
        }
    }
</script>

<style scoped>
    #experiment-timer {
        position: fixed;
        bottom: 40px;
        left: 100px;
    }
</style>