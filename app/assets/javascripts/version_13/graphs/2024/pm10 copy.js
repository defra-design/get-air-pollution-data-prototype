//
// For guidance on how to add JavaScript see:
// https://prototype-kit.service.gov.uk/docs/adding-css-javascript-and-images
//

window.GOVUKPrototypeKit.documentReady(() => {
});



// Set dimensions and margins for the chart
  function drawChart() {
    // Clear previous chart elements if any
    d3.select("#pm10-container-2024").selectAll("*").remove();
  
    // Set dimensions and margins for the chart
    const margin = { top: 20, right: 10, bottom: 40, left: 40 };
    
    // Use the full width of the container
    const width = document.getElementById("pm10-container-2024").clientWidth - margin.left - margin.right; // Use container's width
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



  const line = d3.line()
.defined(d => d.population !== 0)  // Only include data points where the value is not 0
.curve(d3.curveCardinal)           // Apply Cardinal curve for smoothness
.x(d => x(d.date))                 // Define the x position based on the date
.y(d => y(d.population));          // Define the y position based on population



// Create the SVG element and append it to the chart container
const svg = d3.select("#pm10-container-2024")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);





// Load and process the data
d3.csv("/public/javascripts/version_7/chart-data/2024/pm10-exceed.csv").then(function (data) {
  // Parse the date and convert the population to a number
  const parseDate = d3.timeParse("%d/%m/%Y");
  data.forEach(d => {
    d.date = parseDate(d.date);
    d.population = +d.population;
  });

  // Set the domains for the x and y scales
  x.domain(d3.extent(data, d => d.date));
  y.domain([0, 150]);



const segments = [];
let currentSegment = [];
let currentStatus = data[0].status;

data.forEach((d, i) => {
  if (d.status === currentStatus) {
    currentSegment.push(d);
  } else {
    segments.push({ data: currentSegment, status: currentStatus });
    currentSegment = [d];
    currentStatus = d.status;
  }
  if (i === data.length - 1) {
    segments.push({ data: currentSegment, status: currentStatus });
  }
});
function splitByExceedance(segment) {
  const chunks = [];
  let subSegment = [];
  let currentExceedance = segment.data[0].exceedance;

  segment.data.forEach((d, i) => {
    if (d.exceedance === currentExceedance) {
      subSegment.push(d);
    } else {
      if (subSegment.length > 0) {
        // Add the first point of the new segment to the end of the previous one
        subSegment.push(d); // Shared point for continuity
        chunks.push({ data: subSegment, status: segment.status, exceedance: currentExceedance });
      }
      subSegment = [d]; // Start new segment
      currentExceedance = d.exceedance;
    }

    if (i === segment.data.length - 1) {
      chunks.push({ data: subSegment, status: segment.status, exceedance: currentExceedance });
    }
  });

  return chunks;
}





  
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
      .tickValues(x.ticks(d3.timeMonth.every(3))) // Display ticks every 6 months
      .tickFormat(d3.timeFormat("%b %Y"))) // Format the tick labels to show Month and Year
    .call(g => g.select(".domain").remove()) // Remove the x-axis line
    .selectAll(".tick line") // Select all tick lines
    .style("stroke-opacity", 0)
  svg.selectAll(".tick text")
    .attr("fill", "#000000");

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
  .attr("y1", y(50))
  .attr("x2", width)
  .attr("y2", y(50))
  .attr("stroke", "#505a5f") // Black color
  .attr("stroke-width", 3) // Thin line
  .attr("opacity", 1); // Adjust the opacity as needed



    // Set up the area generator
const area = d3.area()
  .defined(d => d.population !== 0) // Only include data points where the value is not 0
  .x(d => x(d.date))
  .y1(d => y(d.population))
  .y0(height); // The lower boundary goes down to the x-axis (bottom of the chart)



segments.forEach(segment => {
  const miniSegments = splitByExceedance(segment);

  miniSegments.forEach(sub => {
    const isVerified = sub.status === 'V';
    const isExceedance = sub.exceedance === 'Y';
    const color = isExceedance ? '#d4351c' : '#1d70b8';

    // Skip segments too short
    if (sub.data.length < 2) return;

    if (isVerified) {
      svg.append("path")
        .datum(sub.data)
        .attr("fill", color)
        .attr("opacity", 0.1)
        .attr("stroke", "none")
        .attr("d", area);
    }

    svg.append("path")
      .datum(sub.data)
      .attr("fill", "none")
      .attr("stroke", color)
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", isVerified ? null : "4,4")
      .attr("d", line);
  });
});



let focusPointsCreated = false;

d3.select("#pm10-container-2024").on("focus", function () {
  if (focusPointsCreated) return; // Prevent duplication
  focusPointsCreated = true;

  const focusGroup = svg.append("g")
    .attr("class", "focus-points");

  focusGroup.selectAll("circle")
/*     .data(data.filter((d, i) => i % 2 === 0)) // every second point */
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => x(d.date))
    .attr("cy", d => y(d.population))
    .attr("r", 6)
    .attr("fill", d => d.exceedance === 'Y' ? '#d4351c' : '#1d70b8')
    .attr("stroke", "#ffffff")
    .attr("stroke-width", 1)
    .attr("tabindex", 0)
    .attr("role", "button")
    .attr("aria-label", d => {
      const date = d3.timeFormat("%e %B %Y")(d.date);
      return `${d.population.toFixed(0)} micrograms per cubic metre on ${date}, ` +
             `${d.status === 'V' ? 'Verified' : 'Unverified'}${d.exceedance === 'Y' ? ', above limit' : ''}`;
    })
    .on("focus", function(event, d) {
      const xPos = x(d.date);
      const yPos = y(d.population);
      const circleColor = d.exceedance === 'Y' ? '#d4351c' : '#1d70b8';
      focusInnerCircle.raise(); // brings it to the front
      focusRing.raise(); // brings it to the front

      outerCircle
        .attr("cx", xPos)
        .attr("cy", yPos)
        .attr("fill", circleColor)
        .style("stroke", circleColor)
        .attr("r", 6)
        .style("opacity", 1);

      innerCircle
        .attr("cx", xPos)
        .attr("cy", yPos)
        .attr("r", 3)
        .style("opacity", 1);

        focusRing
          .attr("cx", xPos)
          .attr("cy", yPos)
          .style("opacity", 1);

          const innerFocusColor = d.exceedance === 'Y' ? '#7d1a1a' : '#144e8c'; // Dark red or dark blue
        
       focusInnerCircle
          .attr("cx", xPos)
          .attr("cy", yPos)
          .attr("fill", innerFocusColor)
          .style("opacity", 1);


      verticalLine
        .attr("x1", xPos)
        .attr("x2", xPos)
        .attr("y1", 0)
        .attr("y2", height)
        .style("opacity", 1);

     
            // First set tooltip content so we can measure its width
        // Set the tooltip content first so we can measure it
tooltip
  .style("display", "block")
  .html(`
    <strong style="font-size:22px;">${d.population.toFixed(0)} μg/m3</strong>
    ${d.exceedance === 'Y' ? `
      <div style="margin-top: 8px; margin-bottom: 8px;">
        <strong class="govuk-tag govuk-tag--red">Above limit</strong>
      </div>` : ''}
    <div style="margin-top: 4px; font-size: 19px;">${d3.timeFormat("%e %B %Y")(d.date)}</div>
    <div style="margin-top: 4px; font-size: 19px; color: #505a5f ">${d.status === 'V' ? 'Verified' : 'Unverified'}</div>
  `);

const tooltipWidth = tooltip.node().offsetWidth;

// Get position of chart container
const container = document.getElementById("pm10-container-2024");
const containerRect = container.getBoundingClientRect();

let tooltipLeft;
const pointOffset = xPos + containerRect.left;

if (xPos < width * 0.45) {
  // Point is on far left, push tooltip slightly right
  tooltipLeft = pointOffset + 60;
} else if (xPos > width * 0.40) {
  // Point is on far right, push tooltip left
  tooltipLeft = pointOffset - tooltipWidth + 30;
} else {
  // Centered, avoid direct overlap by shifting slightly
  tooltipLeft = pointOffset - tooltipWidth / 2;
}

// Set the final tooltip position
tooltip
  .style("left", `${tooltipLeft}px`)
  .style("top", `${containerRect.top + window.scrollY + 20}px`);



      d3.select("#chart-aria-live").text(
        `${d.population.toFixed(0)} micrograms per cubic metre on ${d3.timeFormat("%e %B %Y")(d.date)}.`
      );
    })
    
    .on("blur", () => {
      outerCircle.attr("r", 0).style("opacity", 0);
      innerCircle.attr("r", 0).style("opacity", 0);
      verticalLine.style("opacity", 0);
      tooltip.style("display", "none");
      d3.select("#chart-aria-live").text('');
      focusRing.style("opacity", 0);
      focusInnerCircle.style("opacity", 0);
    })
    .on("keydown", function(event, d) {
  const circles = document.querySelectorAll("#pm10-container-2024 .focus-points circle");
  const currentIndex = Array.prototype.indexOf.call(circles, this);

  if (event.key === "ArrowRight" && currentIndex < circles.length - 1) {
    circles[currentIndex + 1].focus();
    event.preventDefault();
  } else if (event.key === "ArrowLeft" && currentIndex > 0) {
    circles[currentIndex - 1].focus();
    event.preventDefault();
  }
});



// 👉 Focus the last point by default
const allCircles = document.querySelectorAll("#pm10-container-2024 .focus-points circle");
if (allCircles.length > 0) {
  allCircles[allCircles.length - 1].focus();
}

});







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

  // Add yellow focus ring circle
const focusRing = svg.append("circle")
  .attr("r", 8)
  .attr("fill", "none")
  .attr("stroke", "#ffdd00") // Yellow ring
  .attr("stroke-width", 3)
  .style("pointer-events", "none")
  .style("opacity", 0); // Initially hidden

  // Add inner focus circle (slightly darker blue)
const focusInnerCircle = svg.append("circle")
  .attr("r", 6)
  .attr("fill", "#003078") // Slightly darker than #1d70b8
  .style("pointer-events", "none")
  .style("opacity", 0); // Initially hidden

// Create event listeners for the pm10-container-2024 to show/hide elements
d3.select("#pm10-container-2024")
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

  // Clear aria-live region
  d3.select("#chart-aria-live").text('');
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

   const circleColor = d.exceedance === 'Y' ? '#d4351c' : '#1d70b8';

outerCircle
  .attr("cx", xPos)
  .attr("cy", yPos)
  .attr("fill", circleColor)
  .style("stroke", circleColor);

innerCircle
  .attr("cx", xPos)
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

  // Create a date formatter
  const formatDate = d3.timeFormat("%e %B %Y");

  // Update the tooltip content and position
tooltip.html(`
  <strong style="font-size:22px;">${d.population === 0 ? 'No data' : d.population.toFixed(0) + ' μg/m3'}</strong>
  ${d.exceedance === 'Y' ? `
    <div style="margin-top: 8px; margin-bottom: 8px;">
      <strong class="govuk-tag govuk-tag--red">Above limit</strong>
    </div>` : '' }
  <div style="margin-top: 4px; font-size: 19px;">${formatDate(d.date)}</div>
  <div style="margin-top: 4px; font-size: 19px; color: ${d.status === 'V' ? '#505a5f' : '#505a5f'};">
    ${d.status === 'V' ? 'Verified' : 'Unverified'}
  </div>
`);

const screenReaderText = `${d.population === 0 ? 'No data' : d.population.toFixed(0) + ' micrograms per cubic metre'}, ` +
                         `${d.exceedance === 'Y' ? 'Above limit. ' : ''}` +
                         `${formatDate(d.date)}, ` +
                         `${d.status === 'V' ? 'Verified' : 'Unverified'}`;

d3.select("#chart-aria-live").text(screenReaderText);




 // Measure tooltip after setting content
const tooltipWidth = tooltip.node().offsetWidth;

// Get position of chart container
const container = document.getElementById("pm10-container-2024");
const containerRect = container.getBoundingClientRect();

let tooltipLeft;
const pointOffset = xPos + containerRect.left;

if (xPos < width * 0.45) {
  // Point is on far left, push tooltip slightly right
  tooltipLeft = pointOffset + 60;
} else if (xPos > width * 0.40) {
  // Point is on far right, push tooltip left
  tooltipLeft = pointOffset - tooltipWidth + 30;
} else {
  // Centered, avoid direct overlap by shifting slightly
  tooltipLeft = pointOffset - tooltipWidth / 2;
}

// Set the final tooltip position
tooltip
  .style("left", `${tooltipLeft}px`)
  .style("top", `${containerRect.top + window.scrollY + 20}px`);



  
});
   
  
  });
}


// Initial chart rendering
drawChart();

// Add an event listener for window resize
window.addEventListener("resize", drawChart);


// Remove focus visuals and reset focus state when clicking outside
/* document.addEventListener("click", function (event) {
  const container = document.getElementById("pm10-container-2024");

  if (!container.contains(event.target)) {
    // Hide visuals
    d3.select("#pm10-container-2024").selectAll(".focus-points circle")
      .attr("r", 0);

    outerCircle.attr("r", 0).style("opacity", 0);
    innerCircle.attr("r", 0).style("opacity", 0);
    verticalLine.style("opacity", 0);
    focusRing.style("opacity", 0);
    tooltip.style("display", "none");
    d3.select("#chart-aria-live").text('');

    // Remove focus group so it can be recreated on re-entry
    d3.select("#pm10-container-2024").select(".focus-points").remove();

    // Reset the flag so focus points get re-added when refocusing
    focusPointsCreated = false;
  }
}); */


