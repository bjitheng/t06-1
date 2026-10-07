const updateHistogram = (data, screenFilterId, sizeFilterId) => {
    const selectedSize = filters_size.find(filter => filter.id === sizeFilterId);
    const updatedData = data.filter(tv => {
        const matchesScreen = screenFilterId === "all" || tv.screenTech === screenFilterId;
        const matchesSize = sizeFilterId === "all-sizes" ||
            (tv.screenSize >= selectedSize.min && tv.screenSize <= selectedSize.max);
        return matchesScreen && matchesSize;
    });

    const updatedBins = binGenerator(updatedData);
    const binMaxLength = d3.max(updatedBins, d => d.length) || 0;

    if (updatedBins.length) {
        xScale.domain([updatedBins[0].x0, updatedBins[updatedBins.length - 1].x1]);
    }
    yScale.domain([0, binMaxLength]).nice();

    const bars = d3.select("#histogram svg g").selectAll("rect").data(updatedBins);

    bars.join(
        enter => enter.append("rect")
            .attr("x", d => xScale(d.x0))
            .attr("y", innerHeight)
            .attr("width", d => xScale(d.x1) - xScale(d.x0) - 1)
            .attr("height", 0)
            .attr("fill", barColor)
            .attr("stroke", bodyBackgroundColor)
            .attr("stroke-width", 2)
            .attr("tabindex", 0)
            .on("mouseenter focus", showTooltip)
            .on("mousemove", moveTooltip)
            .on("mouseleave blur", hideTooltip)
            .call(enter => enter.append("title")
                .text(d => {
                    const screenTypes = d3.rollup(d, values => values.length, tv => tv.screenTech);
                    return `${d.x0} to ${d.x1} kWh/year\n${Array.from(screenTypes, ([type, count]) => `${type}: ${count}`).join("\n")}`;
                }))
            .call(enter => enter.transition().duration(500)
                .attr("y", d => yScale(d.length))
                .attr("height", d => innerHeight - yScale(d.length))),
        update => update.transition().duration(500)
            .attr("x", d => xScale(d.x0))
            .attr("y", d => yScale(d.length))
            .attr("width", d => xScale(d.x1) - xScale(d.x0) - 1)
            .attr("height", d => innerHeight - yScale(d.length)),
        exit => exit.transition().duration(500)
            .attr("y", innerHeight)
            .attr("height", 0)
            .remove()
    );

    bars.select("title").text(d => {
        const screenTypes = d3.rollup(d, values => values.length, tv => tv.screenTech);
        return `${d.x0} to ${d.x1} kWh/year\n${Array.from(screenTypes, ([type, count]) => `${type}: ${count}`).join("\n")}`;
    });

    d3.select("#histogram .y-axis").transition().duration(500).call(d3.axisLeft(yScale));
    d3.select("#histogram .x-axis").transition().duration(500).call(d3.axisBottom(xScale));
};

const populateFilters = data => {
    const renderFilters = (selector, filters, otherFilters) => {
        d3.select(selector)
            .selectAll(".filter")
            .data(filters)
            .join("button")
            .attr("class", d => d.isActive ? "filter active" : "filter")
            .text(d => d.label)
            .on("click", (event, selectedFilter) => {
                filters.forEach(filter => {
                    filter.isActive = filter.id === selectedFilter.id;
                });

                d3.select(selector)
                    .selectAll(".filter")
                    .classed("active", filter => filter.isActive);

                const activeFilter = filters.find(filter => filter.isActive).id;
                const activeOtherFilter = otherFilters.find(filter => filter.isActive).id;
                updateHistogram(
                    data,
                    selector === "#filters_screen" ? activeFilter : activeOtherFilter,
                    selector === "#filters_size" ? activeFilter : activeOtherFilter
                );
            });
    };

    renderFilters("#filters_screen", filters_screen, filters_size);
    renderFilters("#filters_size", filters_size, filters_screen);
};