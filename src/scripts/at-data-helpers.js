function dataframeToArray(df) {
    let array = [];
    for (let value in df) {
        if (df.hasOwnProperty(value)) {
            array.push(df[value])
        }
    }
    return array
}

function buildTrace(variable, df, xaxis) {
    let trace = {};
    if (df.hasOwnProperty(variable)) {
        let yaxis = dataframeToArray(df[variable])
        trace = { x: xaxis, y: yaxis, type: 'scatter', name: variable };
    }
    return trace
}

export function processedTelemetryData(dataframe, selectedVariables) {
    // Parse de jsoned dataframe to a javascript object
    let df = JSON.parse(dataframe);

    // Parse the timestamp and convert it to an array object
    let timestamp = df['timestamp'];
    delete df['timestamp'];
    let xaxis = dataframeToArray(timestamp)

    // Initialize the processed data variable
    let processedData = [];

    // Build the processed data according to the number of selected variables
    if (selectedVariables.length === 1) {
        let variable = selectedVariables[0];
        let trace = buildTrace(variable, df,  xaxis);
        processedData.push(trace)
    } else {
        for (let index in selectedVariables) {
            let trace = buildTrace(selectedVariables[index], df, xaxis);
            processedData.push(trace)
        }
    }

    return processedData
}
