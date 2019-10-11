<template>
    <div id='myBlock'>My Potato</div>
</template>

<script>
    import { mapGetters } from 'vuex';
    import newPlot from 'Plotly';
    export default {
        name: 'plot-response',
        computed: {
            ...mapGetters([
                'getResponse'
            ])
        },
        mounted() {
            console.log('We Are In');
            let trace1 = {
                x: [1, 2, 3, 4],
                y: [10, 15, 13, 17],
                type: 'scatter'
            };

            let trace2 = {
                x: [1, 2, 3, 4],
                y: [16, 5, 11, 9],
                type: 'scatter'
            };

            let data = [trace1, trace2];

            let element = document.getElementById("myBlock");
            if(typeof(element) != 'undefined' && element != null){
                console.log('Element exists!');
            } else{
                console.log('Element does not exist!');
            }

            newPlot('#myBlock', data);
            console.log('We Are Out');
        },
    }
</script>

<style scoped>

</style>