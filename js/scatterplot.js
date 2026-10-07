const drawScatterplot = data => {
    const svg = d3.select("#scatterplot")
        .append("svg")
        .attr("viewBox", `0 0 ${widthS} ${heightS}`)
        .attr("role", "img")
        .attr("aria-label", "Scatterplot of labelled energy consumption by star rating");

    const innerChartS = svg.append("g")
        .attr("transform", `translate(${marginS.left}, ${marginS.top})`);

    xScaleS
        .domain([0, d3.max(data, d => +d.star)])
        .range([0, innerWidthS])
        .nice();

    yScaleS
        .domain([0, d3.max(data, d => d.energyConsumption)])
        .range([innerHeightS, 0])
        .nice();

    innerChartS
        .selectAll("circle")
        .data(data)
        .join("circle")
        .attr("cx", d => xScaleS(+d.star))
        .attr("cy", d => yScaleS(d.energyConsumption))
        .attr("r", 4)
        .attr("fill", d => screenTechColor(d.screenTech))
        .attr("opacity", 0.62)
        .attr("tabindex", 0)
        .attr("aria-label", d => `${d.screenTech}, ${d.screenSize} inch screen, ${d.energyConsumption} kilowatt hours per year`)
        .on("mouseenter focus", (event, d) => {
            tooltip
                .html(`<strong>${d.screenSize}&quot; screen</strong><span class="tooltip-total">${d.screenTech} · ${d.star} stars</span><div class="tooltip-row"><span>Energy</span><span>${d.energyConsumption} kWh/year</span></div>`)
                .classed("is-visible", true);
            moveTooltip(event);
        })
        .on("mousemove", moveTooltip)
        .on("mouseleave blur", hideTooltip);

    innerChartS
        .append("g")
        .attr("class", "x-axis scatter-x-axis")
        .attr("transform", `translate(0, ${innerHeightS})`)
        .call(d3.axisBottom(xScaleS).ticks(8));

    innerChartS
        .append("g")
        .attr("class", "y-axis scatter-y-axis")
        .call(d3.axisLeft(yScaleS));

    svg.append("text")
        .attr("class", "axis-label")
        .attr("text-anchor", "middle")
        .attr("x", marginS.left + innerWidthS / 2)
        .attr("y", heightS - 8)
        .text("Star Rating");

    svg.append("text")
        .attr("class", "axis-label")
        .attr("text-anchor", "middle")
        .attr("transform", `translate(18 ${marginS.top + innerHeightS / 2}) rotate(-90)`)
        .text("Labeled Energy Consumption (kWh/year)");

    const legend = svg.append("g")
        .attr("class", "scatter-legend")
        .attr("transform", `translate(${widthS - marginS.right + 30}, ${marginS.top + 15})`);

    ["LED", "LCD", "OLED"].forEach((technology, index) => {
        const item = legend.append("g")
            .attr("transform", `translate(0, ${index * 22})`);

        item.append("circle")
            .attr("r", 5)
            .attr("fill", screenTechColor(technology));

        item.append("text")
            .attr("x", 12)
            .attr("y", 4)
            .text(technology);
    });
};