<template>
    <div>
        <p>Please select whose screen you want to see (only users currently doing an experiment are available):</p>
        <div class="field has-addons">
            <div class="control">
                <div class="select">
                    <select name="subject-list" v-model="selectedSubject">
                        <option v-for="subject in subjectList" :value="subject.id">{{ subject.name }}</option>
                    </select>
                </div>
            </div>
            <div class="control">
                <button type="submit" class="button is-primary">Add</button>
            </div>
        </div>

    </div>
</template>

<script>
    import {fetchGet} from "../../scripts/fetch-helpers";

    export default {
        name: "MCCApp",
        data() {
            return {
                subjectList: [],
                selectedSubject: '',
                shownSubjects: []
            }
        },
        methods: {
            async updateSubjectList() {
                try {
                    let response = await fetchGet(API_URL + 'experiment-at/subject-list');
                    if (response.ok) {
                        let subjectList = await response.json();
                        this.subjectList = subjectList["subjects"];
                    }
                    else {
                        console.error('Error loading current subjects.');
                    }
                }
                catch(e) {
                    console.error('Networking error:', e);
                }
            }
        },
        mounted() {
            this.updateSubjectList();
            setInterval(this.updateSubjectList, 5000);
        }
    }
</script>

<style scoped>

</style>