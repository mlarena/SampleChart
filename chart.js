/**
 * chart.js - Модуль для построения графика с использованием D3.js
 * Создает мультиосевой график с точками и интерактивными элементами
 */

// Глобальные переменные для доступа из функций
let xScale, yLeft, yRight, yRight2;
let svg, width, height;

// Функция обновления верхней панели со всеми показателями
function updateStatsPanel(pointData) {
    if (!pointData) return;
    const grid = d3.select("#statsGrid");
    grid.html(""); // очищаем
    
    Object.keys(METRICS).forEach(key => {
        const m = METRICS[key];
        const value = pointData[key];
        // Форматируем с фиксированным количеством знаков для единообразия
        const formatted = typeof value === 'number' ? value.toFixed(4) : value;
        
        const card = grid.append("div").attr("class", "stat-card");
        
        // Создаем обертку для label + unit (всегда в одну строку)
        const labelWrapper = card.append("div").attr("class", "stat-label-wrapper");
        labelWrapper.append("span").attr("class", "stat-label").text(m.name);
        labelWrapper.append("span").attr("class", "stat-unit").text(m.unit);
        
        // Значение с фиксированной шириной
        card.append("span").attr("class", "stat-value").text(formatted);
    });
}

// Инициализация графика после загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    // --- Настройка размеров и отступов ---
    const margin = { top: 60, right: 150, bottom: 70, left: 80 };
    width = 1200 - margin.left - margin.right;
    height = 600 - margin.top - margin.bottom;

    // Создание SVG контейнера
    svg = d3.select("#chart")
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // --- Создание шкал ---
    
    // X scale (время)
    xScale = d3.scaleLinear()
        .domain([0, 24])
        .range([0, width]);

    // Левая ось (Вольты и °C)
    const leftKeys = ["voltagePower", "caseTemperature", "roadTemperature", "freezeTemperature"];
    const leftMin = Math.min(0, d3.min(chartData.flatMap(d => leftKeys.map(k => d[k]))) - 1);
    const leftMax = d3.max(chartData.flatMap(d => leftKeys.map(k => d[k]))) + 1;
    yLeft = d3.scaleLinear().domain([leftMin, leftMax]).range([height, 0]);

    // Правая ось 1 (мм и %)
    const rightKeys = ["waterHeight", "icePercentage", "pgmPercentage", "distanceToSurface"];
    const rightMin = Math.min(0, d3.min(chartData.flatMap(d => rightKeys.map(k => d[k]))) - 2);
    const rightMax = d3.max(chartData.flatMap(d => rightKeys.map(k => d[k]))) + 5;
    yRight = d3.scaleLinear().domain([rightMin, rightMax]).range([height, 0]);

    // Правая ось 2 (дополнительные параметры)
    const right2Keys = ["iceHeight", "snowHeight", "roadStatusCode", "roadAngle"];
    const right2Min = Math.min(0, d3.min(chartData.flatMap(d => right2Keys.map(k => d[k]))) - 1);
    const right2Max = d3.max(chartData.flatMap(d => right2Keys.map(k => d[k]))) + 2;
    yRight2 = d3.scaleLinear().domain([right2Min, right2Max]).range([height, 0]);

    // --- Сетка (горизонтальные линии) ---
    svg.append("g")
        .attr("class", "grid")
        .attr("transform", `translate(0,0)`)
        .call(d3.axisLeft(yLeft).ticks(6).tickSize(-width).tickFormat(""))
        .style("stroke", null) // Цвет будет управляться CSS
        .style("stroke-dasharray", "4 4")
        .style("opacity", 0.5);

    // --- Отрисовка осей Y ---
    
    // Левая ось
    svg.append("g")
        .attr("class", "axis-left")
        .call(d3.axisLeft(yLeft).ticks(8))
        .style("font-size", "11px")
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -55)
        .attr("x", -height/2)
        .style("fill", null)
        .style("font-weight", "600")
        .text("Левая ось (В / °C)");

    // Правая ось 1
    svg.append("g")
        .attr("class", "axis-right")
        .attr("transform", `translate(${width}, 0)`)
        .call(d3.axisRight(yRight).ticks(6))
        .style("font-size", "11px")
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 50)
        .attr("x", -height/2)
        .style("fill", null)
        .style("font-weight", "600")
        .text("Правая ось 1 (мм / %)");

    // Правая ось 2 (смещена дополнительно)
    svg.append("g")
        .attr("class", "axis-right2")
        .attr("transform", `translate(${width + 70}, 0)`)
        .call(d3.axisRight(yRight2).ticks(6))
        .style("font-size", "11px")
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 50)
        .attr("x", -height/2)
        .style("fill", null)
        .style("font-weight", "600")
        .text("Правая ось 2 (мм / код / °)");

    // Ось X (время)
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale).ticks(12).tickFormat(d => d + "ч"))
        .style("font-size", "12px");

    // --- Отрисовка линий для всех метрик ---
    Object.keys(METRICS).forEach(key => {
        const m = METRICS[key];
        // Выбор соответствующей шкалы Y
        let scale = m.axis === 'left' ? yLeft : (m.axis === 'right' ? yRight : yRight2);
        
        // Создание линии
        svg.append("path")
            .datum(chartData.map(d => ({ hour: d.hour, value: d[key] })))
            .attr("fill", "none")
            .attr("stroke", m.color)
            .attr("stroke-width", 1.8)
            .attr("opacity", 0.7)
            .attr("d", d3.line()
                .x(d => xScale(d.hour))
                .y(d => scale(d.value))
                .curve(d3.curveMonotoneX) // Сглаживание линий
            );
    });

    // --- Вертикальная линия-следователь ---
    const verticalLine = svg.append("line")
        .attr("class", "vertical-line")
        .attr("y1", 0)
        .attr("y2", height)
        .attr("x1", -10)  // начально спрятана
        .attr("x2", -10)
        .style("stroke", null) // Цвет из CSS
        .style("stroke-width", 2)
        .style("stroke-dasharray", "5,4")
        .style("opacity", 0);

    // --- Создание точек для всех метрик ---
    Object.keys(METRICS).forEach(key => {
        const m = METRICS[key];
        const scale = m.axis === 'left' ? yLeft : (m.axis === 'right' ? yRight : yRight2);
        const group = svg.append("g").attr("class", `points-${key}`);

        group.selectAll(`circle-${key}`)
            .data(chartData)
            .enter()
            .append("circle")
            .attr("cx", d => xScale(d.hour))
            .attr("cy", d => scale(d[key]))
            .attr("r", 4.5)
            .attr("fill", m.color)
            .attr("stroke", "white")
            .attr("stroke-width", 1.5)
            .attr("opacity", 0.85)
            .attr("data-metric", key)
            .attr("data-hour", d => d.hour)
            .style("cursor", "pointer")
            // Обработчик наведения на точку
            .on("mouseenter", function(event, d) {
                // Выделяем точку
                d3.select(this).attr("r", 7).attr("stroke-width", 2.5).attr("opacity", 1);
                // Обновляем верхнюю панель со всеми значениями
                updateStatsPanel(d);
                // Показываем и перемещаем вертикальную линию
                verticalLine
                    .attr("x1", xScale(d.hour))
                    .attr("x2", xScale(d.hour))
                    .style("opacity", 1);
            })
            .on("mouseleave", function() {
                // Возвращаем точку к исходному размеру
                d3.select(this).attr("r", 4.5).attr("stroke-width", 1.5).attr("opacity", 0.85);
                // Прячем вертикальную линию
                verticalLine.style("opacity", 0);
                // Показываем данные первой точки как значения по умолчанию
                updateStatsPanel(chartData[0]);
            });
    });

    // --- Прозрачный прямоугольник для отслеживания движения мыши ---
    // Позволяет обновлять панель при движении мыши вне точек
    svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .style("fill", "none")
        .style("pointer-events", "all")
        .on("mousemove", function(event) {
            const [xCoord] = d3.pointer(event);
            const mouseHour = xScale.invert(xCoord);
            // Находим ближайший объект в данных
            const closest = chartData.reduce((prev, curr) => 
                Math.abs(curr.hour - mouseHour) < Math.abs(prev.hour - mouseHour) ? curr : prev
            );
            // Показываем вертикальную линию и обновляем панель
            verticalLine
                .attr("x1", xScale(closest.hour))
                .attr("x2", xScale(closest.hour))
                .style("opacity", 1);
            updateStatsPanel(closest);
        })
        .on("mouseleave", function() {
            // Прячем линию и показываем данные первой точки
            verticalLine.style("opacity", 0);
            updateStatsPanel(chartData[0]);
        });

    // --- Инициализация панели первым элементом ---
    updateStatsPanel(chartData[0]);

    // --- Создание легенды ---
    const legendDiv = d3.select("#legendContainer");
    Object.keys(METRICS).forEach(key => {
        const m = METRICS[key];
        const item = legendDiv.append("div").attr("class", "legend-item");
        item.append("span").attr("class", "legend-color").style("background", m.color);
        item.append("span").text(m.name);
        item.append("span").attr("class", "unit-badge").text(m.unit || '—');
    });
});