const tooltip = d3.select("#chart-tooltip");

const moveTooltip = event => {
    if (!Number.isFinite(event.clientX) || !Number.isFinite(event.clientY)) return;
    const node = tooltip.node();
    const left = Math.min(event.clientX + 16, window.innerWidth - node.offsetWidth - 12);
    const top = Math.min(event.clientY + 16, window.innerHeight - node.offsetHeight - 12);

    tooltip.style("left", `${Math.max(12, left)}px`).style("top", `${Math.max(12, top)}px`);
};

const showTooltip = (event, bin) => {
    const screenTypes = d3.rollup(bin, values => values.length, tv => tv.screenTech);
    const rows = Array.from(screenTypes, ([type, count]) => `
        <div class="tooltip-row"><span>${type}</span><span>${count}</span></div>
    `).join("");

    tooltip
        .html(`<strong>${bin.x0}–${bin.x1} kWh/year</strong><span class="tooltip-total">${bin.length} TVs in this range</span>${rows}`)
        .classed("is-visible", true);

    if (Number.isFinite(event.clientX) && Number.isFinite(event.clientY)) {
        moveTooltip(event);
    } else {
        const bounds = event.currentTarget.getBoundingClientRect();
        moveTooltip({clientX: bounds.right, clientY: bounds.top});
    }
};

const hideTooltip = () => tooltip.classed("is-visible", false);

const drawHistogram = (data) => {
    d3.select("#histogram").on("mouseleave", hideTooltip);

    const svg = d3.select("#histogram")
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
    
    const innerChart = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
    
    const bins = binGenerator(data);

    console.log(bins);

    const minEng = bins[0].x0;
    const maxEng = bins[bins.length - 1].x1;
    const binMaxLength = d3.max(bins, d => d.length);

    xScale
        .domain([minEng, maxEng])
        .range([0, innerWidth]);
    
    yScale
        .domain([0, binMaxLength])
        .range([innerHeight, 0])
        .nice();


    innerChart
        .selectAll("rect")
        .data(bins)
        .join("rect")
            .attr("x", d => xScale(d.x0))
            .attr("y", d => yScale(d.length))
            .attr("width", d => xScale(d.x1) - xScale(d.x0) - 1)
            .attr("height", d => innerHeight - yScale(d.length))
            .attr("fill", barColor)
            .attr("stroke", bodyBackgroundColor)
            .attr("stroke-width", 2)
            .attr("tabindex", 0)
            .on("mouseenter focus", showTooltip)
            .on("mousemove", moveTooltip)
            .on("mouseleave blur", hideTooltip);

    const bottomAxis = d3.axisBottom(xScale);

    innerChart
        .append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${innerHeight})`)
        .call(bottomAxis);

    svg
        .append("text")
        .text("Labeled Energy Consumption (kWh/year)")
        .attr("text-anchor", "end")
        .attr("x", width - 20)
        .attr("y", height - 5)
        .attr("class", "axis-label");

    
    const leftAxis = d3.axisLeft(yScale);

    innerChart
        .append("g")
        .attr("class", "y-axis")
        .call(leftAxis);
    
    svg
        .append("text")
        .text("Frequency")
        .attr("x", 30)
        .attr("y", 20)
        .attr("class", "axis-label");
}