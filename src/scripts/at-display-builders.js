export function detectionColorStyle(symptomsList) {
    if (symptomsList.length === 0) {
        let theColors = {'background': '#002E2E', 'font': '#0AFEFF'};
        return theColors
    }
    else {
        let topThresholdTag = '';
        for (let index in symptomsList) {
            if (topThresholdTag !== 'criticLevel') {
                let thresholdTag = symptomsList[index]['threshold_tag'];
                if (thresholdTag === 'LCL' || thresholdTag === 'UCL') {
                    topThresholdTag = 'criticLevel'
                }
                else {
                    topThresholdTag = 'warningLevel'
                }
            }
        }
        if (topThresholdTag === 'criticLevel') {
            let theColors = {'background': '#3A0000', 'font': '#FF0000'};
            return theColors
        }
        else {
            let theColors = {'background': '#342E00', 'font': '#FFBF00'};
            return theColors
        }
    }
}

function dataframeToArray(df) {
    let array = [];
    for (let value in df) {
        if (df.hasOwnProperty(value)) {
            array.push(df[value])
        }
    }
    return array
}

function buildTrace(variable, values, xaxis) {
    let trace = {};
    if (values.hasOwnProperty(variable)) {
        let yaxis = dataframeToArray(values[variable]);
        trace = { x: xaxis, y: yaxis, mode: 'lines', name: variable };
    }
    return trace
}

function buildThresholdTrace(xaxis, yval, the_color, the_style, the_name, the_bool) {
    let trace = {
        x: [xaxis[0], xaxis[xaxis.length - 1]],
        y: [yval, yval],
        name: the_name,
        showlegend: the_bool,
        mode: 'lines',
        line: {
            color: the_color,
            dash: the_style,
            width: 1,
        }};

    return trace
}

function normalizeTrace(rawTrace, info) {
    // Prse input
    let variable = rawTrace['name'];
    let nominal = info[variable]['nominal'];
    let y = rawTrace['y'];
    // Create auxiliar variables
    let newy = [];
    let yy = 0;
    // Normalize
    for (let index in y) {
        let epsilon = 0.0000000001;
        nominal = Math.max(nominal, epsilon); // To avoid zero division
        yy = 100 * (y[index] - nominal) / nominal;
        newy.push(yy);
    }
    rawTrace['y'] = newy;
    return rawTrace
}

function buildRange(plotData, variable, telemetryInfo) {
    let variableIndex = 0;
    for (let index in plotData) {
        let traceInfo = plotData[index];
        if (traceInfo['name'] === variable) {
            variableIndex = index;
        }
    }

    let yaxis = plotData[variableIndex]['y'];
    let lastValue = yaxis[yaxis.length - 1];

    let upperLimit = telemetryInfo[variable]['high_critic_threshold'];
    let lowerLimit = telemetryInfo[variable]['low_critic_threshold'];

    let upperRange = Math.max(lastValue, upperLimit);
    let lowerRange = Math.min(lastValue, lowerLimit);
    let delta = upperRange - lowerRange;
    let margin = 0.05 * delta;
    let range = [lowerRange - margin, upperRange + margin];

    return range
}

let blue = '#0AFEFF';
let red = 'rgba(255,0,0,0.8)';
let orange = 'rgba(196,126,0,0.8)';

let green = 'rgb(33,255,0)';
let pink = 'rgb(255,0,240)';

export function processedPlotData(telemetryDict, selectedVariables) {
    // Parse de jsoned dataframe to a javascript object
    let values = JSON.parse(telemetryDict['values']);
    let info = JSON.parse(telemetryDict['info']);

    // Build a time array for the xaxis
    let xaxis = [];
    for (let i = 0; i < 60; i++) {
        let stamp = i - 59;
        xaxis.push(stamp.toString());
    }

    // Build the processed data according to the number of selected variables
    let processedData = [];

    // If only one variable is selected, display its absolute value and all its associated thresholds
    if (selectedVariables.length === 1) {
        let variable = selectedVariables[0];

        // Build main trace
        let trace = buildTrace(variable, values, xaxis);
        // trace['line'] = {color: pink};
        processedData.push(trace);

        // Build threshold and nominal traces
        trace = buildThresholdTrace(xaxis, info[variable]['low_critic_threshold'], red, 'dot', 'Critical Limits', true);
        processedData.push(trace);
        trace = buildThresholdTrace(xaxis, info[variable]['low_warning_threshold'], orange, 'dot', 'Warning Limits', true);
        processedData.push(trace);
        trace = buildThresholdTrace(xaxis, info[variable]['nominal'], blue, 'dot', 'Nominal value', true);
        processedData.push(trace);
        trace = buildThresholdTrace(xaxis, info[variable]['high_warning_threshold'], orange, 'dot', 'Warning Limits', false);
        processedData.push(trace);
        trace = buildThresholdTrace(xaxis, info[variable]['high_critic_threshold'], red, 'dot', 'Critical Limits', false);
        processedData.push(trace);
    }
    else if (selectedVariables.length === 2) {
        // If two variables are selected, display only its absolute values with two different vertical axis
        let trace = {};

        // Build first variable trace
        trace = buildTrace(selectedVariables[0], values,  xaxis);
        // trace['line'] = {color: pink};
        processedData.push(trace);

        // Build second variable trace
        trace = buildTrace(selectedVariables[1], values,  xaxis);
        // trace['line'] = {color: green};
        trace['yaxis'] = 'y2';
        processedData.push(trace);
    }
    else {
        // If more than two variables are selected, display its normalized values and deviation from nominal
        for (let index in selectedVariables) {
            let rawTrace = buildTrace(selectedVariables[index], values, xaxis);
            let trace = normalizeTrace(rawTrace, info);
            processedData.push(trace);
        }
    }

    return processedData
}

export function setLayout(selectedVariables, telemetryInfo, plotData) {
    let selectedVariablesUnits = {};
    for (let index in selectedVariables) {
        let variable = selectedVariables[index];
        let units = telemetryInfo[variable]['units'];
        selectedVariablesUnits[variable] = units;
    }

    let layout = {
        height: 200,
        margin: {l: 60, r: 20, b: 20, t: 20, pad: 0},
        showlegend: true,
        legend: {orientation: 'h'},
        plot_bgcolor: '#111111',
        paper_bgcolor: '#111111',
        xaxis: {
            tickcolor: '#666666',
            showgrid: false,
        },
        yaxis: {
            side: 'left',
            title: '',
            titlefont: {color: '#0AFEFF',},
            tickfont: {color: '#0AFEFF',},
            tickcolor: '#0AFEFF',
            gridcolor: '#666666',
            linecolor: '#666666',
        }
    };

    if (selectedVariables.length === 1) {
        let variable = selectedVariables[0];
        let units = selectedVariablesUnits[variable];
        let label = variable + ' [' + units + ']';
        layout['yaxis']['title'] = label;
    }
    else if (selectedVariables.length === 2) {
        layout['margin']['r'] = 60;

        let variableLeft = selectedVariables[0];
        let unitsLeft = selectedVariablesUnits[variableLeft];
        let labelLeft = variableLeft + ' [' + unitsLeft + ']';

        let variableRight = selectedVariables[1];
        let unitsRight = selectedVariablesUnits[variableRight];
        let labelRight = variableRight + ' [' + unitsRight + ']';

        layout['yaxis']['title'] = labelLeft;
        layout['yaxis']['range'] = buildRange(plotData, variableLeft, telemetryInfo);

        layout['yaxis2'] = JSON.parse(JSON.stringify(layout['yaxis']));
        layout['yaxis2']['title'] = labelRight;
        layout['yaxis2']['range'] = buildRange(plotData, variableRight, telemetryInfo);
        layout['yaxis2']['side'] = 'right';
        layout['yaxis2']['overlaying'] = 'y';

        layout['showlegend'] = true;
    }
    else if (selectedVariables.length > 2) {
        layout['yaxis']['title'] = 'Nominal deviation [%]';
    }

    return layout
}
