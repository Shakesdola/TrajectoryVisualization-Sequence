// 图表容器的 ID
const timelineContainerID = 'timelineChart';
let timelineData = [];  // for highlight function used

function updateTimelineData() {
    // 加载 JSON 数据
    const sourcePath = window.sourceLoader.getSourcePath('timelineData')
    fetch(sourcePath)
        .then(response => response.json())
        .then(data => {
            timelineData = data;  // for highlight function used
            // 提取数据
            //const identcodeTimeline = data.map(item => item.identcode);
            // console.log('identcodeTimeline:', identcodeTimeline);
            const planOrdinals = data.map(item => item.plan_ordinal);
            const effOrdinals = data.map(item => item.eff_ordinal);
            const planTimes = data.map(item => new Date(item.plan_time));
            const effTimes = data.map(item => new Date(item.eff_time));
            const planTimesUpper = data.map(item => new Date(item.plan_time_upper));
            const planTimesLower = data.map(item => new Date(item.plan_time_lower));

            // 存储 identcode 和 coordinates
            const customData = data.map(item => ({
                identcode: item.identcode,
                coordinates: item.coordinates,
                effOrdinal: item.eff_ordinal,
                plan_time : item.plan_time,
            }));

            // 绘制计划时间 ±15分钟的阴影区域
            const shadowTrace = {
                x: planOrdinals.concat(planOrdinals.slice().reverse()), // 顺序 + 逆序
                y: planTimesUpper.concat(planTimesLower.slice().reverse()),
                fill: 'toself',
                fillcolor: 'rgb(142, 140, 140)',
                line: { color: 'rgb(142, 140, 140)' }, // 无边界线
                hoverinfo: 'skip',
                name: 'Planned Time ±15 min'
            };

            // 绘制执行时间的线和点
            const effTrace = {
                x: planOrdinals,
                y: effTimes,
                mode: 'lines+markers',
                marker: { color: 'rgb(75, 111, 228)', size: 8, symbol: 'circle-dot' },
                line: { color: 'rgb(75, 111, 228)', dash: 'solid' },
                name: 'Executed Completion Time',
                customdata: customData,
                hovertemplate: (
                    'Parcel No.: %{x}<br>' +
                    'Planned Time: %{customdata.plan_time|%H:%M}<br>'+
                    'Effective Time: %{y|%H:%M}<extra></extra>'
                )                
            };

            // 配置布局
            const layout = {
                title: null,
                xaxis: {
                    title: {
                        text: 'Parcel Sequence Sorted by Plan Time',
                        standoff: 10, // 减小标题与x轴的距离
                        font: {
                            size: 10, // 设置字体大小为10
                        }
                    },
                    tickmode: 'linear',
                    tickvals: planOrdinals,
                    ticktext: planOrdinals,
                    //tick0: 1,
                    dtick: 20,
                    range: [Math.min(...planOrdinals)-1, Math.max(...planOrdinals)+1],  // 确保x轴从数据的最小值到最大值
                    //rangeslider: { visible: true }  // 添加滚动条
                    rangeslider: {
                        visible: true,
                        thickness: 0.05, // Make the rangeslider thinner
                        bgcolor: 'transparent', // Hide the background of the mini-graph
                        bordercolor: 'transparent', // Hide the border of the mini-graph
                    }
                },
                yaxis: {
                    title: 'Timeline',
                    //titlefont: {size: 13,family:'Arial'}, // 设置字体大小为10（可以根据需要调整）
                    tickformat: '%H:%M',
                },
                margin: {
                    t: 10,
                    b: 0,
                    l: 60,
                    r: 10
                },
                showlegend: false
            };

            const config = {
                responsive: true,
                displayModeBar: false,  // 完全取消右上角的功能按钮
                scrollZoom: true,  // 允许鼠标滚轮缩放
                modeBarButtonsToRemove: ['toImage', 'pan', 'select2d', 'lasso2d', 'zoom2d', 'zoomIn', 'zoomOut', 'autoScale']
            };

            // 绘制图表
            //Plotly.newPlot(timelineContainerID, [shadowTrace, effTrace], layout, config);
            // 在timeline.js中的updateTimelineData函数内添加点击事件监听
            Plotly.newPlot(timelineContainerID, [shadowTrace, effTrace], layout, config).then(function() {
                // 获取图表容器并绑定点击事件
                const timelineChart = document.getElementById(timelineContainerID);
                updateTimelinePlan(0);
                updateTimelineEff(0);

                // 添加 plotly_click 事件监听器
                
                timelineChart.on('plotly_click', function(eventData) {
                    const clickedPoint = eventData.points[0];
                    const clickedData = clickedPoint.customdata;
                    const identcodeClicked = clickedData.identcode;
                    const coordinates = clickedData.coordinates;
                
                    if (identcodeClicked && coordinates) {
                        zoomToCoordinates(coordinates);
                        addClickMarker(coordinates);
                        highlightTimeline(identcodeClicked, { 
                            fromTimelineClick: true,
                            coordinates 
                        });
                    }
                });
            });

        })
        .catch(error => console.error('Error loading timeline data:', error));
}

// 页面加载时先重置数据源并更新数据
function resetToDefaultSource() {
    fetch('/reset-source', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => response.json())

    .then(data => {
        console.log('Source reset response:', data);
        if (data.status === 'success') {
            console.log('Timeline reset to default source: Source 1.');
            updateTimelineData();  // 确保图表使用最新数据

        } else {
            throw new Error('Failed to reset timeline');
        }
    })
    .catch(error => console.error('Error resetting source for timeline:', error));
}

// 页面加载时先执行 resetToDefaultSource
resetToDefaultSource();

// 下拉框选择事件
document.getElementById('sourceSelector').addEventListener('change', function(event) {
    const selectedSource = event.target.value;

    // 发送新的数据源到后端
    fetch('/update-source', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedSource })
    })
    .then(response => response.json())

    .then(data => {
        console.log('Update data source response:', data);
        if (data.status === 'success') {
            console.log('Timeline updated to:', selectedSource);

            // **等待后端数据生成完成后，再加载数据**
            updateTimelineData();
        } else {
            alert('Error update source for timeline: ' + data.message);
        }
    })
    .catch(error => console.error('Error:', error));
});


function highlightTimeline(identcode, options = {}) {
    const data = timelineData;
    const { fromTimelineClick = false, coordinates } = options;

    // 获取点击的坐标点
    const clickedItem = data.find(item => item.identcode === identcode);
    if (!clickedItem) {
        console.log('No matching identcode found:', identcode);
        return;
    }
    const clickedCoord = coordinates || clickedItem.coordinates;

    // 找到所有具有相同坐标的点
    const matchedItems = data.filter(item =>
        item.coordinates && 
        item.coordinates[0] === clickedCoord[0] &&
        item.coordinates[1] === clickedCoord[1]
    );

    if (matchedItems.length === 0) {
        console.log('No matching coordinates found');
        return;
    }

    // 创建高亮形状数组
    const highlightShapes = matchedItems.map(item => ({
        type: 'line',
        x0: item.plan_ordinal,
        x1: item.plan_ordinal,
        y0: 0,
        y1: 1,
        xref: 'x',
        yref: 'paper',
        line: {
            color: '#fc0',
            width: 3,
            dash: 'solid'
        }
    }));

    // 添加背景高亮区域
    if (matchedItems.length > 1) {
        const minX = Math.min(...matchedItems.map(p => p.plan_ordinal));
        const maxX = Math.max(...matchedItems.map(p => p.plan_ordinal));
        
        highlightShapes.push({
            type: 'rect',
            x0: minX - 0.5,
            x1: maxX + 0.5,
            y0: 0,
            y1: 1,
            xref: 'x',
            yref: 'paper',
            fillcolor: 'rgba(231, 207, 163, 0.1)',
            line: { width: 0 }
        });
    }

    // 设置动画索引 - 根据点击来源采用不同策略
    let startFromIndexPlan, startFromIndexEff;
    
    if (fromTimelineClick) {
        // 来自timeline点击 - 使用被点击的identcode自身的数据
        startFromIndexPlan = linesPlan.findIndex(p => p === clickedItem.plan_ordinal - 1);
        startFromIndexEff = linesEff.findIndex(p => p === clickedItem.eff_ordinal - 1);
    } else {
        // 来自map点击 - 使用第一个匹配项的数据
        startFromIndexPlan = linesPlan.findIndex(p => p === matchedItems[0].plan_ordinal - 1);
        startFromIndexEff = linesEff.findIndex(p => p === matchedItems[0].eff_ordinal - 1);
    }

    if (startFromIndexPlan !== -1) {
        animationIndexPlan = startFromIndexPlan;
        updatePlan(animationIndexPlan);
    }
    if (startFromIndexEff !== -1) {
        animationIndexEff = startFromIndexEff;
        updateEff(animationIndexEff);
    }

    // 更新图表形状
    const shapes = [
        ...(planLineShape ? [planLineShape] : []),
        ...(effLineShape ? [effLineShape] : []),
        ...highlightShapes
    ];
    
    Plotly.relayout(timelineContainerID, { shapes });

    // 更新点的颜色
    const highlightIndices = matchedItems.map(item => 
        data.findIndex(d => d.identcode === item.identcode)
    );
    
    Plotly.restyle(timelineContainerID, {
        'marker.color': [
            data.map((_, i) => 
                highlightIndices.includes(i) ? '#fc0' : 'rgb(75, 111, 228)'
            )
        ]
    }, [1]);
}


// 创建全局变量来存储两条线的状态
let planLineShape = null;
let effLineShape = null;

function updateTimelinePlan(stationIndexPlan) {
    const xValuePlan = timelineData[stationIndexPlan].plan_ordinal;
    console.log("stationIndexPlan", stationIndexPlan)
    console.log("xValuePlan", xValuePlan)
    planLineShape = {
        type: 'line',
        x0: xValuePlan,
        x1: xValuePlan,
        y0: 0,
        y1: 1,
        xref: 'x',
        yref: 'paper',
        line: {
            color: 'rgb(142, 140, 140)',
            width: 2,
            dash: 'dash'
        }
    };

    // 合并两条线的形状
    const shapes = [planLineShape];
    if (effLineShape) {
        shapes.push(effLineShape);
    }

    Plotly.relayout(timelineContainerID, {
        shapes: shapes
    });
}

function updateTimelineEff(stationIndexEff) {
    const matchingItem = timelineData.find(item => item.eff_ordinal === (stationIndexEff+1))
    const xValueEff = matchingItem ? matchingItem.plan_ordinal : null;
    //console.log("matchingItem:",matchingItem)
    console.log("stationIndexEff", stationIndexEff)
    console.log("xValuEff:",xValueEff)
    effLineShape = {
        type: 'line',
        x0: xValueEff,
        x1: xValueEff,
        y0: 0,
        y1: 1,
        xref: 'x',
        yref: 'paper',
        line: {
            color: 'blue',
            width: 2,
            dash: 'dash'
        }
    };

    // 合并两条线的形状
    const shapes = [effLineShape];
    if (planLineShape) {
        shapes.push(planLineShape);
    }

    Plotly.relayout(timelineContainerID, {
        shapes: shapes
    });
}

// 可以添加一个清除函数
function resetTimelineHighlights() {
    stationIndexPlan=0
    stationIndexEff=0
    planLineShape = null;
    effLineShape = null;
    Plotly.relayout(timelineContainerID, {
        shapes: []
    });
    updateTimelinePlan(stationIndexPlan);
    updateTimelineEff(stationIndexEff);
}