// Add your JavaScript code here
const MAX_WIDTH = Math.max(1080, window.innerWidth);
const MAX_HEIGHT = 720;
const margin = {top: 40, right: 100, bottom: 40, left: 175};

// Assumes the same graph width, height dimensions as the example dashboard. Feel free to change these if you'd like

// Your boss wants to know the top 10 video games of all time or top 10 for a specific year.
let graph_1_width = (MAX_WIDTH / 2) - 10, graph_1_height = 250;
let svg = d3.select("#graph1")
    .append("svg")
    .attr("width", graph_1_width)     // HINT: width
    .attr("height", graph_1_height)     // HINT: height
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);    // HINT: transform
let countRef = svg.append("g");

// TODO: Load the artists CSV file into D3 by using the d3.csv() method
d3.csv("../data/video_games.csv").then(function(data) {
    data= cleanData(data, 10);
    console.log(data);
    let x = d3.scaleLinear()
        .domain([0, d3.max(data, function(d) { return parseFloat(d['Global_Sales'], 10)})])
        .range([0, graph_1_width - margin.left - margin.right]);

    let y = d3.scaleBand()
        .domain(data.map(function(d) {return d['Name']}))
        .range([0, graph_1_height- margin.top- margin.bottom])
        .padding(0.1);  // Improves readability

    svg.append("g")
        .call(d3.axisLeft(y).tickSize(0).tickPadding(10));

    let bars = svg.selectAll("rect").data(data);
   
    let color = d3.scaleOrdinal()
        .domain(data.map(function(d) { return d["Name"] }))
        .range(d3.quantize(d3.interpolateHcl("#66a0e2", "#81c2c3"), 10));

    bars.enter()
        .append("rect")
        .merge(bars)
        .attr("fill", function(d) { return color(d['Name'])})
        .attr("x", x(0))
        .attr("y", function(d) {return y(d['Name'])})         
        .attr("width", function(d) {return x(parseFloat(d['Global_Sales'])) }) 
        .attr("height", y.bandwidth())
    
    let counts = countRef.selectAll("text").data(data);

    counts.enter()
        .append("text")
        .merge(counts)
        .attr("x", function(d){return x(parseFloat(d['Global_Sales'])) + 10})      
        .attr("y", function(d){return y(d['Name']) + 10})       
        .style("text-anchor", "start")
        .text(function(d){return parseFloat(d['Global_Sales'])}); 
    
    svg.append("text")
        .attr("transform", `translate(${(graph_1_width - margin.left - margin.right) / 2}, ${(graph_1_height - margin.top - margin.bottom) + 15})`)
        .style("text-anchor", "middle")
        .text("Global Sales (in millions)")
        .style("font-size", 14);
        
    svg.append("text")
        .style("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left+20)
        .attr("x", -margin.top)
        .text("Video Games")
        .style("font-size", 14);
    
    // TODO: Add chart title
    svg.append("text")
        .attr("transform", `translate(${(graph_1_width - margin.left - margin.right) / 2}, ${-10})`)
        .style("text-anchor", "middle")
        .style("font-size", 15)
        .text("Top Ten Video Games of all Times based on Global Sales");

});

// Your boss wants to understand which genre is most popular. We'd like to see genre sales broken out per region.
let graph_2_width = (MAX_WIDTH / 2) - 10, graph_2_height = 275;
const pie_height = graph_2_height- 30;
const pie_width= graph_2_width - 30;
let radius= Math.min(pie_width, pie_height)/2 - margin;



let svg2 = d3.select("#graph2")
    .append("svg")
    .attr("width", graph_2_width)     
    .attr("height", graph_2_height)
    .append("g")
    .attr("transform", "translate(" + graph_2_width / 2 + "," + graph_2_height / 2 + ")");

    // Set up reference to tooltip
let tooltip = d3.select("#graph2")     
     .append("div")
     .attr("class", "tooltip")
     .style("opacity", 0);

let title= svg2.append("text")
    .attr("transform", `translate(${(graph_2_width - margin.right - 610) / 2}, ${(-125)})`)       // HINT: Place this at the top middle edge of the graph
    // .attr("transform", `translate(${(graph_2_width - margin.left - margin.right- 290) / 2}, ${(-125)})`)       // HINT: Place this at the top middle edge of the graph
    .style("text-anchor", "middle")
    .style("font-size", 15);

  
svg2.append("g").attr("class", "slices").attr("name", "slices");

function setData(attr){
    d3.csv("../data/video_games_modified.csv").then(function(data) {
        const dict = {}
        let total_sales=0
        for (let i = 0; i < data.length; i++) {
            dict[data[i]["Genre"]] = data[i][attr]
            total_sales += parseFloat(data[i][attr])
        }
        console.log("dict", dict)
        console.log("total sales", total_sales)


        const list=[ ]
        for (var key in dict) {
            const key_val= { }
            key_val["label"]= key
            key_val["value"]= dict[key]
            key_val["percentage"] = (parseFloat(dict[key])/ total_sales) * 100
            list.push(key_val)
        }

        data= list;
        console.log("data", data);
       
        let color = d3.scaleOrdinal()
            .domain(function(d){return d.data.label})
            .range(d3.quantize(t => d3.interpolateSpectral(t), data.length));
            // .range(d3.schemeDark2); 
            
               
        let pie= d3.pie().value(function(d){return d['value']})
        let mouseover = function(d, i) {
            let html = `Genre: ${d.data.label}<br/>
                    Total Sales: ${d['value']}mill<br/>
                    Percentage: ${d.data.percentage.toFixed(2)}% </span>`;       

            tooltip.html(html)
                .style("left", `${(d3.event.pageX) - 220}px`)
                .style("top", `${(d3.event.pageY) - 30}px`)
                .transition()
                .duration(200)
                .style("opacity", 0.9)
        };

        let mouseout = function(d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", 0);
        };

        var slice = svg2.select(".slices").selectAll("path").data(pie(data));

        slice.enter()
            .append("path")
            .on("mouseover", mouseover)
            .on("mouseout", mouseout)
            .merge(slice)
            .transition()
            .duration(1000)
            .attr("d", d3.arc()
                 .innerRadius(0)
                 .outerRadius(Math.min(pie_width,pie_height)/2))
            .attr("fill", function(d, i) {return color(i);})
            .attr("class", "slice")
            .attr("stroke", "white")
            .style("stroke-width", "2px")
            .style("opacity", 1);            

        slice.exit()
            .remove();
        
        var label = svg2.selectAll(".legend").data(pie(data))

        label= label.enter()
            .append("g")
            .attr("transform", function(d, i){
                return `translate(${(margin.right+ 100)}, ${i*15 - 90})`})
             .attr("class", "legend");   
          
        label.append("rect")
            .attr("width", 10)
            .attr("height", 10)
            .attr("fill", function(d, i) {
                return color(i);
             });
          
        label.append("text")
            .text(function(d){
            return d.data.label;})
            .style("font-size", 12)
            .attr("y", 10)
            .attr("x", 11);

        if (attr== "Global"){
            title.text("Popular Genre of Video Game Worldwide");    
        }else{
            title.text("Popular Genre of Video Game in " + attr);    
        }
    });
}
setData("North America");

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Your boss wants to know which publisher to pick based on which genre a game is. 
// Your chart should provide a clear top publisher for each genre (could be interactive or statically show).
let graph_3_width = MAX_WIDTH / 2, graph_3_height = 575;
let svg3 = d3.select("#graph3")
    .append("svg")
    .attr("width", graph_3_width)     
    .attr("height", graph_3_height)     
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);   


let filenames = ["./data/video_games_puzzle.csv",  "./data/video_games_rolePlaying.csv", "./data/video_games_action.csv",
"./data/video_games_shooter.csv" ,"./data/video_games_simulation.csv", "./data/video_games_racing.csv", "./data/video_games_fighting.csv", "./data/video_games_strategy.csv",
"./data/video_games_adventure.csv", "./data/video_games_sports.csv", "./data/video_games_platform.csv", "./data/video_games_misc.csv",]
bar_width= graph_3_width -30;
bar_height= graph_3_height -30;

let x = d3.scaleLinear()
    .range([0, bar_width - margin.left - margin.right]);

let y = d3.scaleBand()
    .range([0, bar_height- margin.top- margin.bottom])
    .padding(0.1);  // Improves readability

let countRef3 = svg3.append("g");
let y_axis_label = svg3.append("g");

let x_axis_label= svg3.append("text")
    .attr("transform",`translate(${(graph_3_width - margin.left - margin.right) / 2}, ${(graph_3_height - margin.top - margin.bottom) + 15})`)       // HINT: Place this at the bottom middle edge of the graph
    .style("text-anchor", "middle")
    .style("font-size", 13);

let y_axis_text = svg3.append("text")
    .style("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .attr("y", -margin.left+20)
    .attr("x", -margin.top)
    .text("Publishers")
    .style("font-size", 13);


let title3 = svg3.append("text")
    .attr("transform",`translate(${(graph_3_width - margin.left - margin.right) / 2}, ${-10})`)       // HINT: Place this at the top middle edge of the graph
    .style("text-anchor", "middle")
    .style("font-size", 15);

function setData3(index, attr) {
    d3.csv(filenames[index]).then(function(data) {
        data= cleanData3(data, 20);
        x.domain([0, d3.max(data, function(d) { return parseInt(d['Count'])})]);
        y.domain(data.map(function(d) {return d['Publisher']}))

        y_axis_label.call(d3.axisLeft(y).tickSize(0).tickPadding(10));

        let bars = svg3.selectAll("rect").data(data);
        let color = d3.scaleOrdinal()
                .domain(data.map(function(d) { return d['Publisher'] }))
                .range(d3.quantize(d3.interpolateHcl("#66a0e2", "#81c2c3"), 20));

        bars.enter()
            .append("rect")
            .merge(bars)
            .transition()
            .duration(1000)
            .attr("fill", function(d) { return color(d['Publisher'])}) // Here, we are using functin(d) { ... } to return fill colors based on the data point d
            .attr("x", x(0))
            .attr("y", function(d) {return y(d['Publisher'])})           // HINT: Use function(d) { return ...; } to apply styles based on the data point
            .attr("width", function(d) {return x(parseInt(d['Count'])) })
            .attr("height", y.bandwidth());        // HINT: y.bandwidth() makes a reasonable display height

        /*
            In lieu of x-axis labels, we are going to display the count of the artist next to its bar on the
            bar plot. We will be creating these in the same manner as the bars.
            */
        let counts = countRef3.selectAll("text").data(data);

        // TODO: Render the text elements on the DOM
        counts.enter()
            .append("text")
            .merge(counts)
            .transition()
            .duration(1000)
            .attr("x", function(d){return x(parseInt(d['Count'])) + 10})       // HINT: Add a small offset to the right edge of the bar, found by x(d.count)
            .attr("y", function(d){return y(d['Publisher']) + 10})      // HINT: Add a small offset to the top edge of the bar, found by y(d.artist)
            .style("text-anchor", "start")
            .text(function(d){return parseInt(d['Count'])});           // HINT: Get the count of the artist

        x_axis_label.text("Number of " + attr + " Video Games Published")
        title3.text("Top Publishers for " + attr + " Genre");

        // Remove elements not in use if fewer groups in new dataset
        bars.exit().remove();
        counts.exit().remove();
    });
}

setData3(0, "Puzzle");

////////////////////////////////////////////////////////////////////////////////
function cleanData(data, numExamples) {
    // TODO: sort and return the given data with the comparator (extracting the desired number of examples)
    data.sort(function(a, b){return b['Global_Sales'] - a['Global_Sales']});
    return data.slice(0, numExamples);
}

function cleanData3(data, numExamples) {
    // TODO: sort and return the given data with the comparator (extracting the desired number of examples)
    data.sort(function(a, b){return b['Count'] - a['Count']});
    return data.slice(0, numExamples);
}

function filterData(data, attr) {
    return data.filter(function(a) { return a.attr === (attr); });
}
