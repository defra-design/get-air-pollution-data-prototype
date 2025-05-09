//
// For guidance on how to add JavaScript see:
// https://prototype-kit.service.gov.uk/docs/adding-css-javascript-and-images
//

window.GOVUKPrototypeKit.documentReady(() => {
});

// Set dimensions and margins for the chart
  function drawChart() {
    // Clear previous chart elements if any
    d3.select("#ozone-container-24").selectAll("*").remove();
  
    // Set dimensions and margins for the chart
    const margin = { top: 20, right: 10, bottom: 50, left: 40 };
    
    // Use the full width of the container
    const width = document.getElementById("ozone-container-24").clientWidth - margin.left - margin.right; // Use container's width
    const height = 400 - margin.top - margin.bottom; // Fixed height

// Set up the x and y scales
const x = d3.scaleTime()
  .range([0, width]);

const y = d3.scaleLinear()
  .range([height, 0]);

/* // Set up the line generator
  const line = d3.line()
  .defined(d => d.population !== 0) // Only include data points where the value is not 0
  .x(d => x(d.date))
  .y(d => y(d.population)); */

    // Set up the line generator with smoothing
const line = d3.line()
.defined(d => d.population !== 0)  // Only include data points where the value is not 0
.curve(d3.curveCardinal)           // Apply Cardinal curve for smoothness
.x(d => x(d.date))                 // Define the x position based on the date
.y(d => y(d.population));          // Define the y position based on population



// Create the SVG element and append it to the chart container
const svg = d3.select("#ozone-container-24")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);






//Load data
  d3.csv("/public/javascripts/version_7/chart-data/24hour/ozone.csv").then(function (data) {
    // Adjusted date parsing to match your timestamp format
    const parseTime = d3.timeParse("%Y-%m-%dT%H:%M:%S");

    data.forEach(d => {
      // Parse the date and population values
      d.date = parseTime(d.date);
      d.population = +d.population; // Convert population to a number
    });

    // Set the domains for the x and y scales
    x.domain(d3.extent(data, d => d.date));
    y.domain([0, 200]);


// Add a thin black line at the top of the graph
svg.append("line")
  .attr("x1", 0)
  .attr("y1", 0)
  .attr("x2", width)
  .attr("y2", 0)
  .attr("stroke", "#505a5f") // Black color
  .attr("stroke-width", 1) // Thin line
  .attr("opacity", 0.5);
// Add a thin black line at the bottom of the graph
svg.append("line")
  .attr("x1", 0)
  .attr("y1", height)
  .attr("x2", width)
  .attr("y2", height)
  .attr("stroke", "#505a5f") // Black color
  .attr("stroke-width", 1) // Thin line
  .attr("opacity", 0.5);


// Add the x-axis
svg.append("g")
   .attr("transform", `translate(0,${height})`)
   .style("font-size", "16px")
   .call(d3.axisBottom(x)
     .ticks(d3.timeHour.every(6)) // Display ticks every 6 hours
     .tickFormat(d => {
       const time = d3.timeFormat("")(d).replace(/^0/, '').toLowerCase(); // Format time (am/pm)
       const date = d3.timeFormat("")(d); // Format day and month
       return `${time}\n${date}`; // Add a line break between time and date
     })
   )
   .call(g => g.select(".domain").remove()) // Remove the x-axis line
   .selectAll(".tick line") // Select all tick lines
   .style("stroke-opacity", 0);

// Adjust tick text
svg.selectAll(".tick text")
   .each(function(d) {
     const time = d3.timeFormat("%I%p")(d).replace(/^0/, '').toLowerCase();
     const date = d3.timeFormat("%e %b")(d);

     d3.select(this)
       .append("tspan")
       .attr("x", 0)
       .attr("dy", 10)
       .text(time); // Add time as the first line

     d3.select(this)
       .append("tspan")
       .attr("x", 0)
       .attr("dy", "1.2em")
       .text(date); // Add date as the second line
   });







   


  // Add vertical gridlines
  svg.selectAll("xGrid")
    .data(x.ticks().slice(1))
    .join("line")
    .attr("x1", d => x(d))
    .attr("x2", d => x(d))
    .attr("y1", 0)
    .attr("y2", height)
    .attr("stroke", "#e0e0e0")
    .attr("stroke-width", .5);

  // Add the y-axis
      svg.append("g")
    .style("font-size", "16px")
    .call(d3.axisLeft(y)
    .ticks(4) // Adjust the number of ticks as needed
    .tickFormat(d => d) // Divide by 1000 to show the values in thousands
    .tickSize(0)
    .tickPadding(10))


    .call(g => g.select(".domain").remove()) // Remove the y-axis line
    .selectAll(".tick text")
    .style("fill", "#000000") // Make the font color grayer
    .style("visibility", (d, i, nodes) => {
      if (i === 0) {
        return "hidden"; // Hide the first and last tick labels
      } else {
        return "visible"; // Show the remaining tick labels
      }
    });

  
    svg.selectAll("yGrid")
  .data(y.ticks(12).slice(1)) // Adjust to match the tick intervals
  .join("line")
  .attr("x1", 0)
  .attr("x2", width)
  .attr("y1", d => y(d))
  .attr("y2", d => y(d))
  .attr("stroke", "#e0e0e0")
  .attr("stroke-width", .5);

// Add the thin black line at the y-value of 200,000
svg.append("line")
  .attr("x1", 0)
  .attr("y1", y(200000))
  .attr("x2", width)
  .attr("y2", y(200000))
  .attr("stroke", "#505a5f") // Black color
  .attr("stroke-width", 3) // Thin line
  .attr("opacity", 1); // Adjust the opacity as needed

// Create a group element to hold the text label and background
const labelGroup = svg.append("g")
  .attr("class", "exceedance-label")
  .style("display", "block"); // Initially display the label

// Add a foreignObject to act as the container for HTML content
labelGroup.append("foreignObject")
  .attr("x", width / 2 - 140) // Center the container horizontally
  .attr("y", y(200000) - 65) // Position it slightly above the line
  .attr("width", 260) // Width of the container
  .attr("height", 80) // Height of the container
  .append("xhtml:div") // Append a div inside the foreignObject
  .attr("class", "exceedance-label-container") // Apply CSS class for styling
  .html("Exceedance over 200 µg/m3"); // Set the text inside the div


    // Set up the area generator
const area = d3.area()
  .defined(d => d.population !== 0) // Only include data points where the value is not 0
  .x(d => x(d.date))
  .y1(d => y(d.population))
  .y0(height); // The lower boundary goes down to the x-axis (bottom of the chart)


// Add the area path to the SVG
svg.append("path")
.datum(data)
.attr("fill", "#1d70b8") // Light blue color for the filled area
.attr("opacity", .1)
.attr("stroke", "none")
.attr("d", area);

  // Add the line path
  const path = svg.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "#1d70b8")
    .attr("stroke-width", 3)
    .attr("d", line);



  const listeningRect = svg.append("rect")
    .attr("width", width)
    .attr("height", height);


// Create the vertical line element
const verticalLine = svg.append("line")
.attr("stroke", "#000000")
.attr("stroke-width", 0.5); // Start with the line hidden



// create tooltip
    const tooltip = d3.select("body")
    .append("div")
    .attr("class", "graph-tooltip") // Adds the initial class
    .classed("tooltip-bg tooltip-text", true) // Adds multiple classes
    .style("position", "absolute") // Ensure it is absolutely positioned
    .style("display", "none") // Start hidden
    /* .attr("x", width / 2 - 140) 
    .attr("y", y(200000) - 25); */

// Add the circle element for the data point hover effect (outer blue circle)
const outerCircle = svg.append("circle")
  .attr("r", 0) // Start with a radius of 0
  .attr("fill", "#1d70b8") // Blue color
  .style("stroke", "#1d70b8") // Stroke same as fill
  .attr("opacity", 100)
  .style("pointer-events", "none");

// Add the inner circle for the white circle effect
const innerCircle = svg.append("circle")
  .attr("r", 0) // Start with a radius of 0
  .attr("fill", "#ffffff") // White color
  .attr("opacity", 1) // Slightly transparent white
  .style("pointer-events", "none");


// Create event listeners for the ozone-container-24 to show/hide elements
d3.select("#ozone-container-24")
  .on("mouseover", function () {
    // Show the elements when the mouse enters the chart container
    tooltip.style("display", "block");
    verticalLine.style("opacity", 1);
    outerCircle.style("opacity", 1);
    innerCircle.style("opacity", 1);
    labelGroup.style("display", "none"); // Hide the label when mouse enters
  })
  .on("mouseout", function () {
    // Hide the elements when the mouse leaves the chart container
    tooltip.style("display", "none");
    verticalLine.style("opacity", 0);
    outerCircle.attr("r", 0); // Hide the outer circle
    innerCircle.attr("r", 0); // Hide the inner circle
    labelGroup.style("display", "block");
  });

listeningRect.on("mousemove", function (event) {
  const [xCoord, yCoord] = d3.pointer(event, this);
  const bisectDate = d3.bisector(d => d.date).left;
  const x0 = x.invert(xCoord);
  const i = bisectDate(data, x0, 1);
  const d0 = data[i - 1];
  const d1 = data[i];
  const d = x0 - d0.date > d1.date - x0 ? d1 : d0;
  const xPos = x(d.date);
  const yPos = y(d.population);

  // Update the positions of both circles
  outerCircle.attr("cx", xPos)
    .attr("cy", yPos);
  innerCircle.attr("cx", xPos)
    .attr("cy", yPos);

  // Add transition for both circle radii
  outerCircle.transition()
    .duration(50)
    .attr("r", 6); // Outer circle radius
  innerCircle.transition()
    .duration(50)
    .attr("r", 3); // Inner circle radius

  // Update the vertical line position and make it visible
  verticalLine
    .attr("x1", xPos)
    .attr("x2", xPos)
    .attr("y1", 0)
    .attr("y2", height);

// Create a date formatter for time and day
const formatDateTime = d => {
  const time = d3.timeFormat("%I:%M%p")(d).replace(/^0/, '').toLowerCase(); // Format time (e.g., 12:30am)
  const date = d3.timeFormat("%e %b")(d); // Format day and abbreviated month (e.g., 28 Nov)
  return `${time}, ${date}`; // Combine time and date
};

// Update the tooltip content and position
tooltip.html(`<strong style="font-size:22px;">${d.population === 0 ? 'No data' : (d.population).toFixed(0) + ' μg/m3'}</strong><div style="display: block; margin-top: 2px; font-size: 19px;">${formatDateTime(d.date)}</div>`);




  // Get tooltip width to adjust its position
  const tooltipWidth = tooltip.node().offsetWidth;

// As you add more content to page, you need to adjust the pixels here to make sure the tooltip is in the right place.
  // Adjust tooltip position based on window width
   if (window.innerWidth >= 1800) {
    tooltip.style("left", `${xCoord - (tooltipWidth - 600)}px`)
           .style("top", `${yCoord + 540}px`);
  } else if (window.innerWidth >= 1400){
    tooltip.style("left", `${xCoord - (tooltipWidth - 400)}px`)
           .style("top", `${yCoord + 560}px`);
  } 
  else if (window.innerWidth >= 1200){
    tooltip.style("left", `${xCoord - (tooltipWidth - 300)}px`)
           .style("top", `${yCoord + 560}px`);
  } 
  else if (window.innerWidth >= 900){
    tooltip.style("left", `${xCoord - (tooltipWidth - 200)}px`)
           .style("top", `${yCoord + 560}px`);
  }
  else if (window.innerWidth >= 200){
    tooltip.style("left", `${xCoord - (tooltipWidth - 120)}px`)
           .style("top", `${yCoord + 600}px`);
  }
  
});
   
  
  });
}

// Initial chart rendering
drawChart();

// Add an event listener for window resize
window.addEventListener("resize", drawChart);




