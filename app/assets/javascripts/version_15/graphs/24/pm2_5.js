//
// For guidance on how to add JavaScript see:
// https://prototype-kit.service.gov.uk/docs/adding-css-javascript-and-images
//

window.GOVUKPrototypeKit.documentReady(() => {
  // no-op
});

/**
 * Monthly pm25 chart (limit = 50 μg/m3) with:
 * - Uses CSV columns: date,population,status,exceedance
 * - status: 'V' = Verified (solid), anything else = Unverified (dotted)
 * - exceedance: 'Y'/'N' (if missing/blank, computed from limit=50)
 * - red segments + filled area when exceedance=Y
 * - tooltip + vertical cursor line + hover point
 * - aria-live announcements
 * - keyboard “focus points” mode (Tab into chart, then ArrowLeft/ArrowRight)
 *
 * NOTE: Supports timestamps like 2024-10-29T24:00:00 (rolled to next day 00:00:00)
 */

(function () {
  const CONTAINER_ID = "pm25-container-24";
  const CSV_PM25_PATH = "/public/javascripts/version_15/chart-data/24/pm2_5.csv";
  const CSV_PM10_PATH = "/public/javascripts/version_15/chart-data/24/pm10.csv";
  const CSV_O3_PATH = "/public/javascripts/version_15/chart-data/24/o3.csv";
  const CSV_NO2_PATH = "/public/javascripts/version_15/chart-data/24/no2.csv";
  const LIMIT_PM25 = 50; // μg/m3
  const LIMIT_PM10 = 50; // μg/m3
  const LIMIT_O3 = 50; // μg/m3
  const LIMIT_NO2 = 200; // μg/m3

  let focusPointsCreated = false;
  let keyboardNavigation = false;
  let kbPollutantIdx = 0;
  let kbPointIdx = 0;

  // Avoid stacking global listeners if this file is loaded more than once
  if (!window.__AQ_PM25_24_LISTENERS__) {
    window.__AQ_PM25_24_LISTENERS__ = true;

    document.addEventListener("keydown", function (event) {
      if (event.key === "Tab") keyboardNavigation = true;
    });

    document.addEventListener("mousedown", function () {
      keyboardNavigation = false;
    });
  }

  function parseISOish(ts) {
    // Handles "YYYY-MM-DDTHH:mm:ss" and fixes "24:00:00" -> next day 00:00:00
    if (!ts || typeof ts !== "string") return null;

    const m = ts.match(
      /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})$/
    );
    if (!m) return null;

    let year = +m[1];
    let month = +m[2] - 1;
    let day = +m[3];
    let hour = +m[4];
    let minute = +m[5];
    let second = +m[6];

    if (hour === 24) {
      hour = 0;
      const d = new Date(year, month, day, hour, minute, second);
      d.setDate(d.getDate() + 1);
      return d;
    }

    return new Date(year, month, day, hour, minute, second);
  }

  function normaliseStatus(s) {
    // Accept V/v as verified; anything else treat as unverified
    if (!s) return "U";
    return String(s).trim().toUpperCase() === "V" ? "V" : "U";
  }

  function normaliseExceedance(ex, population, limit) {
    // Use provided exceedance if valid, else compute from limit
    const v = (ex ?? "").toString().trim().toUpperCase();
    if (v === "Y" || v === "N") return v;
    return population > limit ? "Y" : "N";
  }

  function splitByStatusAndExceedance(data) {
    // First split by status, then within each segment split by exceedance (with continuity point)
    const statusSegments = [];
    let current = [];
    let currentStatus = data[0]?.status;

    data.forEach((d, i) => {
      if (d.status === currentStatus) {
        current.push(d);
      } else {
        statusSegments.push({ data: current, status: currentStatus });
        current = [d];
        currentStatus = d.status;
      }
      if (i === data.length - 1) {
        statusSegments.push({ data: current, status: currentStatus });
      }
    });

    function splitByExceedance(seg) {
      const chunks = [];
      let sub = [];
      let currentEx = seg.data[0]?.exceedance;

      seg.data.forEach((d, i) => {
        if (d.exceedance === currentEx) {
          sub.push(d);
        } else {
          if (sub.length > 0) {
            // continuity point
            sub.push(d);
            chunks.push({ data: sub, status: seg.status, exceedance: currentEx });
          }
          sub = [d];
          currentEx = d.exceedance;
        }
        if (i === seg.data.length - 1) {
          chunks.push({ data: sub, status: seg.status, exceedance: currentEx });
        }
      });

      return chunks;
    }

    return statusSegments.flatMap(splitByExceedance);
  }

  function findNearestIndex(data, date) {
    let minDiff = Infinity;
    let idx = 0;
    data.forEach(function (d, i) {
      const diff = Math.abs(d.date - date);
      if (diff < minDiff) { minDiff = diff; idx = i; }
    });
    return idx;
  }

  function drawChart() {
    // Remove any previous tooltip (avoid duplicates)
    d3.selectAll("body > .graph-tooltip").remove();

    // Clear previous chart
    d3.select(`#${CONTAINER_ID}`).selectAll("*").remove();

    const containerEl = document.getElementById(CONTAINER_ID);
    if (!containerEl) return;

    const margin = { top: 20, right: 10, bottom: 50, left: 40 };
    const width = containerEl.clientWidth - margin.left - margin.right;
    const height = 480 - margin.top - margin.bottom;

    const x = d3.scaleTime().range([0, width]);
    const y = d3.scaleLinear().range([height, 0]);

    const line = d3
      .line()
      .defined((d) => d.population !== 0 && d.date)
      .curve(d3.curveMonotoneX)

      .x((d) => x(d.date))
      .y((d) => y(d.population));

    const area = d3
      .area()
      .defined((d) => d.population !== 0 && d.date)
      .x((d) => x(d.date))
      .y1((d) => y(d.population))
      .y0(height);

    const svg = d3
      .select(`#${CONTAINER_ID}`)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    d3.csv(CSV_PM25_PATH).then(function (rawPM25) {
      // Load all pollutant data in parallel
      return Promise.all([
        Promise.resolve(rawPM25),
        d3.csv(CSV_PM10_PATH),
        d3.csv(CSV_O3_PATH),
        d3.csv(CSV_NO2_PATH)
      ]);
    }).then(function ([rawPM25, rawPM10, rawO3, rawNo2]) {
      // Parse PM2.5 data
      const dataPM25 = rawPM25
        .map((d) => {
          const dt = parseISOish(d.date);
          const pop = +d.population;
          const population = Number.isFinite(pop) ? pop : 0;

          const status = normaliseStatus(d.status);
          const exceedance = normaliseExceedance(d.exceedance, population, LIMIT_PM25);

          return { date: dt, population, status, exceedance, pollutant: "PM2.5" };
        })
        .filter((d) => d.date)
        .sort((a, b) => a.date - b.date);

      // Parse PM10 data
      const dataPM10 = rawPM10
        .map((d) => {
          const dt = parseISOish(d.date);
          const pop = +d.population;
          const population = Number.isFinite(pop) ? pop : 0;

          const status = normaliseStatus(d.status);
          const exceedance = normaliseExceedance(d.exceedance, population, LIMIT_PM10);

          return { date: dt, population, status, exceedance, pollutant: "PM10" };
        })
        .filter((d) => d.date)
        .sort((a, b) => a.date - b.date);

      // Parse O3 data
      const dataO3 = rawO3
        .map((d) => {
          const dt = parseISOish(d.date);
          const pop = +d.population;
          const population = Number.isFinite(pop) ? pop : 0;

          const status = normaliseStatus(d.status);
          const exceedance = normaliseExceedance(d.exceedance, population, LIMIT_O3);

          return { date: dt, population, status, exceedance, pollutant: "O3" };
        })
        .filter((d) => d.date)
        .sort((a, b) => a.date - b.date);

      // Parse NO2 data
      const dataNo2 = rawNo2
        .map((d) => {
          const dt = parseISOish(d.date);
          const pop = +d.population;
          const population = Number.isFinite(pop) ? pop : 0;

          const status = normaliseStatus(d.status);
          const exceedance = normaliseExceedance(d.exceedance, population, LIMIT_NO2);

          return { date: dt, population, status, exceedance, pollutant: "NO2" };
        })
        .filter((d) => d.date)
        .sort((a, b) => a.date - b.date);

      if (!dataPM25.length || !dataPM10.length || !dataO3.length || !dataNo2.length) return;

      // Merge data by date for domain calculations
      const dateSet = new Set();
      dataPM25.forEach((d) => dateSet.add(d.date.getTime()));
      dataPM10.forEach((d) => dateSet.add(d.date.getTime()));
      dataO3.forEach((d) => dateSet.add(d.date.getTime()));
      dataNo2.forEach((d) => dateSet.add(d.date.getTime()));

      const dates = Array.from(dateSet)
        .map((t) => new Date(t))
        .sort((a, b) => a - b);

      x.domain([dates[0], dates[dates.length - 1]]);

      const maxPM25 = d3.max(dataPM25, (d) => d.population) || 0;
      const maxPM10 = d3.max(dataPM10, (d) => d.population) || 0;
      const maxO3 = d3.max(dataO3, (d) => d.population) || 0;
      const maxNo2 = d3.max(dataNo2, (d) => d.population) || 0;
      const maxValue = Math.max(maxPM25, maxPM10, maxO3, maxNo2);
      // Keep the domain tight to observed values so points are easier to distinguish/hover.
      const yMax = Math.max(20, Math.ceil((maxValue * 1.15) / 10) * 10);
      y.domain([0, yMax]);

      // Top/bottom borders
      svg
        .append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", width)
        .attr("y2", 0)
        .attr("stroke", "#505a5f")
        .attr("stroke-width", 1.5)
        .attr("opacity", 0.5);

      svg
        .append("line")
        .attr("x1", 0)
        .attr("y1", height)
        .attr("x2", width)
        .attr("y2", height)
        .attr("stroke", "#505a5f")
        .attr("stroke-width", 1)
        .attr("opacity", 0.5);

      // X axis (same stacked tick style you had)
      const xAxis = svg
        .append("g")
        .attr("transform", `translate(0,${height})`)
        .style("font-size", "16px")
        .call(
          d3
            .axisBottom(x)
            .ticks(d3.timeDay.every(1))
            .tickFormat(() => "")
        );

      xAxis.call((g) => g.select(".domain").remove());
      xAxis.selectAll(".tick line").style("stroke-opacity", 0);

      xAxis.selectAll(".tick text").each(function (d) {
        const time = d3.timeFormat("%I%p")(d).replace(/^0/, "").toLowerCase();
        const date = d3.timeFormat("%e %b")(d);

        const text = d3.select(this);
        text.text("");

        text.append("tspan").attr("x", 0).attr("dy", 10).text(time);
        text.append("tspan").attr("x", 0).attr("dy", "1.2em").text(date);
      });

      // Gridlines
      svg
        .selectAll("xGrid")
        .data(x.ticks().slice(1))
        .join("line")
        .attr("x1", (d) => x(d))
        .attr("x2", (d) => x(d))
        .attr("y1", 0)
        .attr("y2", height)
        .attr("stroke", "#e0e0e0")
        .attr("stroke-width", 0.5);

      svg
        .append("g")
        .style("font-size", "16px")
        .call(
          d3
            .axisLeft(y)
            .ticks(4)
            .tickFormat((d) => d)
            .tickSize(0)
            .tickPadding(10)
        )
        .call((g) => g.select(".domain").remove())
        .selectAll(".tick text")
        .style("fill", "#000000")
        .style("visibility", (d, i) => (i === 0 ? "hidden" : "visible"));

      svg
        .selectAll("yGrid")
        .data(y.ticks(12).slice(1))
        .join("line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", (d) => y(d))
        .attr("y2", (d) => y(d))
        .attr("stroke", "#e0e0e0")
        .attr("stroke-width", 0.5);

     

      // Tooltip + cursor visuals
      const tooltip = d3
        .select("body")
        .append("div")
        .attr("class", "graph-tooltip")
        .classed("tooltip-bg tooltip-text", true)
        .style("position", "absolute")
        .style("display", "none");

      const verticalLine = svg
        .append("line")
        .attr("stroke", "#000000")
        .attr("stroke-width", 0.5)
        .style("opacity", 0);

     
      // Draw segmented lines for all four pollutants
      // - red when exceedance=Y
      // - blue otherwise (by default)
      const segmentsPM25 = splitByStatusAndExceedance(dataPM25);
      const segmentsPM10 = splitByStatusAndExceedance(dataPM10);
      const segmentsO3 = splitByStatusAndExceedance(dataO3);
      const segmentsNo2 = splitByStatusAndExceedance(dataNo2);

      [segmentsPM25, segmentsPM10, segmentsO3, segmentsNo2].forEach((segments) => {
        segments.forEach((seg) => {
          if (!seg.data || seg.data.length < 2) return;

          const isVerified = seg.status === "V";
          const isExceedance = seg.exceedance === "Y";
          const color = isExceedance ? "#d4351c" : "#1d70b8";

          if (isVerified) {
            svg
              .append("path")
              .datum(seg.data)
              .attr("fill", color)
              .attr("opacity", 0.1)
              .attr("stroke", "none")
              .attr("d", area)
              .attr("class", `pollutant-path-${seg.data[0].pollutant}`);
          }

          svg
            .append("path")
            .datum(seg.data)
            .attr("fill", "none")
            .attr("stroke", color)
            .attr("stroke-width", 3)
            .attr("d", line)
            .attr("class", `pollutant-line-${seg.data[0].pollutant}`)
            .attr("data-pollutant", seg.data[0].pollutant);
        });
      });

       const outerCircle = svg
        .append("circle")
        .attr("r", 0)
        .attr("fill", "#1d70b8")
        .style("stroke", "#1d70b8")
        .style("pointer-events", "none")
        .style("opacity", 0);

      const innerCircle = svg
        .append("circle")
        .attr("r", 0)
        .attr("fill", "#ffffff")
        .style("pointer-events", "none")
        .style("opacity", 0);

      const focusRing = svg
        .append("circle")
        .attr("r", 8)
        .attr("fill", "none")
        .attr("stroke", "#ffdd00")
        .attr("stroke-width", 3)
        .style("pointer-events", "none")
        .style("opacity", 0);

      const focusInnerCircle = svg
        .append("circle")
        .attr("r", 6)
        .attr("fill", "#003078")
        .style("pointer-events", "none")
        .style("opacity", 0);


      // Listening rect
      const listeningRect = svg
        .append("rect")
        .attr("width", width)
        .attr("height", height)
        .style("fill", "transparent");

      // Keep hover selection stable unless another line is clearly closer.
      const HOVER_SWITCH_MARGIN_PX = 5;
      let lastHoveredPollutant = null;

      function positionTooltip(xPos) {
        const tooltipWidth = tooltip.node().offsetWidth;
        const containerRect = containerEl.getBoundingClientRect();
        const pointOffset = xPos + containerRect.left;

        let left;
        if (xPos < width * 0.45) {
          left = pointOffset + 60;
        } else if (xPos > width * 0.55) {
          left = pointOffset - tooltipWidth + 30;
        } else {
          left = pointOffset - tooltipWidth / 2;
        }

        tooltip
          .style("left", `${left}px`)
          .style("top", `${containerRect.top + window.scrollY + 20}px`);
      }

      function formatDateTime(d) {
        const time = d3
          .timeFormat("%I:%M%p")(d)
          .replace(/^0/, "")
          .toLowerCase();
        const date = d3.timeFormat("%e %b")(d);
        return `${time}, ${date}`;
      }

      const POLLUTANT_FULL_NAMES = {
        "PM2.5": "PM2.5",
        "PM10": "PM10",
        "O3": "Ozone",
        "NO2": "Nitrogen dioxide"
      };

      function tooltipHtml(d) {
        const fullName = POLLUTANT_FULL_NAMES[d.pollutant] || d.pollutant;
        const valueStr = d.population === 0 ? "No data" : `${d.population.toFixed(0)} μg/m3`;
        return `
          <div style="font-size:22px;"><strong>${fullName}</strong> | ${valueStr}</div>
          ${
            d.exceedance === "Y"
              ? `<div style="margin-top: 8px; margin-bottom: 8px;">
                   <strong class="govuk-tag govuk-tag--red">Above limit</strong>
                 </div>`
              : ""
          }
          <div style="margin-top: 4px; font-size: 19px;">${formatDateTime(d.date)}</div>
          <div style="margin-top: 4px; font-size: 19px; color: #505a5f;">
            ${d.status === "V" ? "Verified" : "Unverified"}
          </div>
        `;
      }

      // Hover show/hide
      d3.select(`#${CONTAINER_ID}`)
        .attr("tabindex", 0)
        .style("outline", "none")
        .on("mouseover", function () {
          tooltip.style("display", "block");
          verticalLine.style("opacity", 1);
          outerCircle.style("opacity", 1);
          innerCircle.style("opacity", 1);
          labelGroup.style("display", "none");
        })
        .on("mouseout", function () {
          tooltip.style("display", "none");
          verticalLine.style("opacity", 0);
          outerCircle.attr("r", 0).style("opacity", 0);
          innerCircle.attr("r", 0).style("opacity", 0);
          labelGroup.style("display", "block");
          d3.select("#chart-aria-live").text("");
          lastHoveredPollutant = null;
          // Restore all lines to full opacity
          svg.selectAll("path[data-pollutant]").style("opacity", 1);
        });

      listeningRect.on("mousemove", function (event) {
        const [xCoord] = d3.pointer(event, this);
        const bisectDate = d3.bisector((d) => d.date).left;
        const x0 = x.invert(xCoord);
        
        // Find closest points for all four pollutants
        const i25 = bisectDate(dataPM25, x0, 1);
        const d25_0 = dataPM25[i25 - 1];
        const d25_1 = dataPM25[i25];
        const d25 = !d25_1 ? d25_0 : x0 - d25_0.date > d25_1.date - x0 ? d25_1 : d25_0;

        const i10 = bisectDate(dataPM10, x0, 1);
        const d10_0 = dataPM10[i10 - 1];
        const d10_1 = dataPM10[i10];
        const d10 = !d10_1 ? d10_0 : x0 - d10_0.date > d10_1.date - x0 ? d10_1 : d10_0;

        const iO3 = bisectDate(dataO3, x0, 1);
        const dO3_0 = dataO3[iO3 - 1];
        const dO3_1 = dataO3[iO3];
        const dO3 = !dO3_1 ? dO3_0 : x0 - dO3_0.date > dO3_1.date - x0 ? dO3_1 : dO3_0;

        const iNo2 = bisectDate(dataNo2, x0, 1);
        const dNo2_0 = dataNo2[iNo2 - 1];
        const dNo2_1 = dataNo2[iNo2];
        const dNo2 = !dNo2_1 ? dNo2_0 : x0 - dNo2_0.date > dNo2_1.date - x0 ? dNo2_1 : dNo2_0;

        // Calculate pixel distances to determine which is closest
        const yPos25 = y(d25.population);
        const yPos10 = y(d10.population);
        const yPosO3 = y(dO3.population);
        const yPosNo2 = y(dNo2.population);

        const xPos25 = x(d25.date);
        const xPos10 = x(d10.date);
        const xPosO3 = x(dO3.date);
        const xPosNo2 = x(dNo2.date);

        const dist25 = Math.sqrt((xCoord - xPos25) ** 2 + (event.offsetY - yPos25) ** 2);
        const dist10 = Math.sqrt((xCoord - xPos10) ** 2 + (event.offsetY - yPos10) ** 2);
        const distO3 = Math.sqrt((xCoord - xPosO3) ** 2 + (event.offsetY - yPosO3) ** 2);
        const distNo2 = Math.sqrt((xCoord - xPosNo2) ** 2 + (event.offsetY - yPosNo2) ** 2);

        // Find which is closest
        const distances = [
          { dist: dist25, data: d25, pollutant: "PM2.5", xPos: xPos25, yPos: yPos25 },
          { dist: dist10, data: d10, pollutant: "PM10", xPos: xPos10, yPos: yPos10 },
          { dist: distO3, data: dO3, pollutant: "O3", xPos: xPosO3, yPos: yPosO3 },
          { dist: distNo2, data: dNo2, pollutant: "NO2", xPos: xPosNo2, yPos: yPosNo2 }
        ];

        const closest = distances.reduce((min, curr) => curr.dist < min.dist ? curr : min);
        const previous = distances.find((entry) => entry.pollutant === lastHoveredPollutant);

        let active = closest;
        if (previous && closest.pollutant !== previous.pollutant) {
          const improvement = previous.dist - closest.dist;
          if (improvement < HOVER_SWITCH_MARGIN_PX) {
            active = previous;
          }
        }
        lastHoveredPollutant = active.pollutant;

        // Highlight active pollutant, grey out others
        svg.selectAll("path[data-pollutant]").style("opacity", function () {
          const pollutant = d3.select(this).attr("data-pollutant");
          return pollutant === active.pollutant ? 1 : 0.2;
        });

        const d = active.data;
        const xPos = active.xPos;
        const yPos = active.yPos;
        const circleColor = d.exceedance === "Y" ? "#d4351c" : "#1d70b8";

        outerCircle
          .attr("cx", xPos)
          .attr("cy", yPos)
          .attr("fill", circleColor)
          .style("stroke", circleColor)
          .transition()
          .duration(50)
          .attr("r", 6);

        innerCircle
          .attr("cx", xPos)
          .attr("cy", yPos)
          .transition()
          .duration(50)
          .attr("r", 3);

        verticalLine
          .attr("x1", xPos)
          .attr("x2", xPos)
          .attr("y1", 0)
          .attr("y2", height);

        tooltip.style("display", "block").html(tooltipHtml(d));
        positionTooltip(xPos);

        const screenReaderText =
          `${d.pollutant}: ` +
          `${d.population === 0 ? "No data" : `${d.population.toFixed(0)} micrograms per cubic metre`}, ` +
          `${d.exceedance === "Y" ? "Above limit. " : ""}` +
          `${formatDateTime(d.date)}, ` +
          `${d.status === "V" ? "Verified" : "Unverified"}`;

        d3.select("#chart-aria-live").text(screenReaderText);
      });

      // Keyboard focus mode
      function handleFocus(event, d) {
        const xPos = x(d.date);
        const yPos = y(d.population);
        const circleColor = d.exceedance === "Y" ? "#d4351c" : "#1d70b8";
        const innerFocusColor = d.exceedance === "Y" ? "#7d1a1a" : "#144e8c";

        // Grey out other pollutants' lines
        svg.selectAll("path[data-pollutant]").style("opacity", function () {
          const pollutant = d3.select(this).attr("data-pollutant");
          return pollutant === d.pollutant ? 1 : 0.2;
        });

        outerCircle
          .attr("cx", xPos)
          .attr("cy", yPos)
          .attr("fill", circleColor)
          .style("stroke", circleColor)
          .attr("r", 6)
          .style("opacity", 1);

        innerCircle.attr("cx", xPos).attr("cy", yPos).attr("r", 3).style("opacity", 1);

        focusRing.attr("cx", xPos).attr("cy", yPos).style("opacity", 1);

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

        tooltip.style("display", "block").html(tooltipHtml(d));
        positionTooltip(xPos);

        d3.select("#chart-aria-live").text(
          `${d.pollutant}: ${d.population === 0 ? "No data" : `${d.population.toFixed(0)} micrograms per cubic metre`} on ${formatDateTime(d.date)}.`
        );
      }

      function handleBlur() {
        outerCircle.attr("r", 0).style("opacity", 0);
        innerCircle.attr("r", 0).style("opacity", 0);
        verticalLine.style("opacity", 0);
        tooltip.style("display", "none");
        focusRing.style("opacity", 0);
        focusInnerCircle.style("opacity", 0);
        d3.select("#chart-aria-live").text("");
        // Restore all lines to full opacity
        svg.selectAll("path[data-pollutant]").style("opacity", 1);
        // Remove data point dots
        svg.select(".kb-data-points").selectAll("circle").remove();
      }

      const kbPollutants = [
        { name: "PM2.5", data: dataPM25 },
        { name: "PM10",  data: dataPM10 },
        { name: "O3",    data: dataO3 },
        { name: "NO2",   data: dataNo2 }
      ];

      const dataPointsGroup = svg.append("g").attr("class", "kb-data-points");

      function updateKeyboardFocus() {
        const activePoll = kbPollutants[kbPollutantIdx];
        const d = activePoll.data[kbPointIdx];
        if (!d) return;

        // Render dots at every point on the active pollutant's line
        dataPointsGroup.selectAll("circle").remove();
        activePoll.data.forEach(function (pt) {
          if (!pt.date || pt.population === 0) return;
          dataPointsGroup
            .append("circle")
            .attr("cx", x(pt.date))
            .attr("cy", y(pt.population))
            .attr("r", 6)
            .attr("fill", pt.exceedance === "Y" ? "#d4351c" : "#1d70b8")
            .attr("stroke", "#ffffff")
            .attr("stroke-width", 1)
            .style("pointer-events", "none");
        });

        handleFocus(null, d);
        // Ensure focus indicators sit above the data point dots
        outerCircle.raise();
        innerCircle.raise();
        focusRing.raise();
        focusInnerCircle.raise();
        verticalLine.raise();
      }

      d3.select(`#${CONTAINER_ID}`)
        .attr("aria-label", "Air quality chart. Use arrow keys to navigate data points. Left and Right move along the current pollutant. Up and Down switch between pollutants.")
        .on("focus", function () {
          if (!keyboardNavigation) return;
          if (!focusPointsCreated) {
            focusPointsCreated = true;
            kbPollutantIdx = 0;
            kbPointIdx = 0;
          }
          updateKeyboardFocus();
        })
        .on("blur", function () {
          if (focusPointsCreated) {
            focusPointsCreated = false;
            handleBlur();
          }
        })
        .on("keydown", function (event) {
          if (!focusPointsCreated) return;

          const poll = kbPollutants[kbPollutantIdx];

          if (event.key === "ArrowRight") {
            if (kbPointIdx < poll.data.length - 1) {
              kbPointIdx++;
              updateKeyboardFocus();
            }
            event.preventDefault();
          } else if (event.key === "ArrowLeft") {
            if (kbPointIdx > 0) {
              kbPointIdx--;
              updateKeyboardFocus();
            }
            event.preventDefault();
          } else if (event.key === "ArrowDown") {
            if (kbPollutantIdx > 0) {
              const currentDate = poll.data[kbPointIdx].date;
              kbPollutantIdx--;
              kbPointIdx = findNearestIndex(kbPollutants[kbPollutantIdx].data, currentDate);
              updateKeyboardFocus();
            }
            event.preventDefault();
          } else if (event.key === "ArrowUp") {
            if (kbPollutantIdx < kbPollutants.length - 1) {
              const currentDate = poll.data[kbPointIdx].date;
              kbPollutantIdx++;
              kbPointIdx = findNearestIndex(kbPollutants[kbPollutantIdx].data, currentDate);
              updateKeyboardFocus();
            }
            event.preventDefault();
          }
        });

      // Optional: click clears keyboard focus visuals on desktop
      if (!window.__AQ_PM25_24_CLEAR_CLICK__) {
        window.__AQ_PM25_24_CLEAR_CLICK__ = true;

        document.addEventListener("click", function () {
          if (window.innerWidth <= 768) return;

          focusPointsCreated = false;
          handleBlur();
        });
      }
    });
  }

  // Expose redraw hook
  window.AQGraphs = window.AQGraphs || {};
  window.AQGraphs.pm25_24 = drawChart;

  // Initial render
  if (document.getElementById(CONTAINER_ID)) {
    drawChart();
  }

  // Avoid stacking resize listeners if you redraw multiple times
  window.removeEventListener("resize", drawChart);
  window.addEventListener("resize", drawChart);
})();
