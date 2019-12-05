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

function buildThresholdTrace(xaxis, yval, the_color, the_style) {
    let trace = {
        x: [xaxis[0], xaxis[xaxis.length - 1]],
        y: [yval, yval],
        showlegend: false,
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

let green = 'rgb(0, 255, 0)';
let red = 'rgb(255, 0, 0)';
let blue = 'rgb(0, 0, 255)';
let orange = 'rgb(196,126,0)';

export function processedPlotData(values_df, info_df, selectedVariables) {
    // Parse de jsoned dataframe to a javascript object
    let values = JSON.parse(values_df);
    let info = JSON.parse(info_df);

    // Parse the timestamp and convert it to an array object
    let timestamp = values['timestamp'];
    delete values['timestamp'];
    let xaxis = [];
    // xaxis = dataframeToArray(timestamp);
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
        trace['line'] = {color: blue};
        processedData.push(trace);

        // Build threshold and nominal traces
        trace = buildThresholdTrace(xaxis, info[variable]['low_critic_threshold'], red, 'solid');
        processedData.push(trace);
        trace = buildThresholdTrace(xaxis, info[variable]['low_warning_threshold'], red, 'dot');
        processedData.push(trace);
        trace = buildThresholdTrace(xaxis, info[variable]['nominal'], green, 'solid');
        processedData.push(trace);
        trace = buildThresholdTrace(xaxis, info[variable]['high_warning_threshold'], red, 'dot');
        processedData.push(trace);
        trace = buildThresholdTrace(xaxis, info[variable]['high_critic_threshold'], red, 'solid');
        processedData.push(trace);
    }
    else if (selectedVariables.length === 2) {
        // If two variables are selected, display only its absolute values with two different vertical axis
        let trace = {};

        // Build first variable trace
        trace = buildTrace(selectedVariables[0], values,  xaxis);
        trace['line'] = {color: blue};
        processedData.push(trace);

        // Build second variable trace
        trace = buildTrace(selectedVariables[1], values,  xaxis);
        trace['line'] = {color: orange};
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

export function setLayout(selectedVariables) {
    let layout = {
        height: 200,
        margin: {l: 20, r: 50, b: 20, t: 20, pad: 0},
        showlegend: false,
        side: 'right',
    };

    if (selectedVariables.length === 1) {
        layout['yaxis'] = {
            title: selectedVariables[0],
            side: 'right'
        };
    }
    else if (selectedVariables.length === 2) {
        layout['margin']['l'] = 50;
        layout['yaxis'] = {
            title: selectedVariables[0],
            side: 'right',
            titlefont: {color: blue},
            tickfont: {color: blue},
        };
        layout['yaxis2'] = {
            title: selectedVariables[1],
            side: 'left',
            titlefont: {color: orange},
            tickfont: {color: orange},
            overlaying: 'y',
        }
    }
    else if (selectedVariables.length > 2) {
        layout['yaxis'] = {
            title: 'Deviation from nominal (%)',
            side: 'right',
            // range: [-5, 5],
        };
        layout['showlegend'] = true;
    }

    return layout
}
