// 图表容器的ID
const chartContainerID = 'plotlyChart';
let sequenceData = [];  // for highlight function used

function updateSequenceData() {
    // 加载 JSON 数据
    const sourcePath = window.sourceLoader.getSourcePath('timelineData');
    fetch(sourcePath)
        .then(response => response.json())
        .then(data => {
            sequenceData = data;  // for highlight function used
            
            // 提取数据
            const planOrdinals = data.map(item => item.plan_ordinal);
            const effOrdinals = data.map(item => item.eff_ordinal);
            
            // 存储 identcode 和 coordinates
            const customData = data.map(item => ({
                identcode: item.identcode,
                coordinates: item.coordinates,
                effOrdinal: item.eff_ordinal,
                plan_ordinal: item.plan_ordinal
            }));

            // 创建主散点图
            const trace = {
                x: planOrdinals,
                y: effOrdinals,
                mode: 'markers',
                marker: {
                    color: 'rgb(75, 111, 228)',
                    size: 8,
                    symbol: 'circle-dot'
                },
                customdata: customData,
                hovertemplate: (
                    'Planned Sequence: %{x}<br>' +
                    'Effective Sequence: %{y}<extra></extra>'
                )
            };

            // 配置布局
            const layout = {
                title: null,
                xaxis: {
                    title: {
                        text: 'Planned Sequence',
                        standoff: 10,
                        font: {
                            size: 12
                        }
                    },
                    tickmode: 'linear',
                    tickvals: planOrdinals,
                    ticktext: planOrdinals,
                    dtick: 20,
                    range: [Math.min(...planOrdinals)-1, Math.max(...planOrdinals)+1],
                    rangeslider: {
                        visible: true,
                        thickness: 0.05,
                        bgcolor: '#fc0',
                    }
                },
                yaxis: {
                    title: {
                        text: 'Effective Sequence',
                        standoff: 10,
                        font: {
                            size: 12
                        }
                    },
                    tickmode: 'linear',
                    dtick: 20
                },
                margin: {
                    t: 20,
                    b: 30,
                    l: 45,
                    r: 10
                },
                showlegend: false
            };

            const config = {
                responsive: true,
                displayModeBar: false,
                scrollZoom: true,
                modeBarButtonsToRemove: ['toImage', 'pan', 'select2d', 'lasso2d', 'zoom2d', 'zoomIn', 'zoomOut', 'autoScale']
            };

            // 绘制图表并添加点击事件
            Plotly.newPlot(chartContainerID, [trace], layout, config).then(function() {
                const sequenceChart = document.getElementById(chartContainerID);
                updateSequencePlan(0);
                updateSequenceEff(0);
                sequenceChart.on('plotly_click', function(eventData) {
                    const clickedPoint = eventData.points[0];
                    const clickedData = clickedPoint.customdata;
                    const identcodeClicked = clickedData.identcode;
                    const coordinates = clickedData.coordinates;
                
                    if (identcodeClicked && coordinates) {
                        zoomToCoordinates(coordinates);
                        addClickMarker(coordinates);
                        highlightSequence(identcodeClicked, { 
                            fromSequenceClick: true,
                            coordinates 
                        });
                    }
                });
            });
        })
        .catch(error => console.error('Error loading sequence data:', error));
}

function highlightSequence(identcode, options = {}) {
    const data = sequenceData;
    const { fromSequenceClick = false} = options;

    // 获取点击的坐标点
    const clickedItem = data.find(item => item.identcode === identcode);
    if (!clickedItem) {
        console.log('No matching identcode found:', identcode);
        return;
    }
    const clickedCoord = clickedItem.coordinates;

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

    // // 同时添加水平高亮线（保持sequence图的特性）
    // matchedItems.forEach(item => {
    //     highlightShapes.push({
    //         type: 'line',
    //         x0: 0,
    //         x1: 1,
    //         y0: item.eff_ordinal,
    //         y1: item.eff_ordinal,
    //         xref: 'paper',
    //         yref: 'y',
    //         line: {
    //             color: '#fc0',
    //             width: 2,
    //             dash: 'dot'
    //         }
    //     });
    // });

    // 如果有多点匹配，添加水平背景高亮
    if (matchedItems.length > 1) {
        const minY = Math.min(...matchedItems.map(p => p.eff_ordinal));
        const maxY = Math.max(...matchedItems.map(p => p.eff_ordinal));
        
        highlightShapes.push({
            type: 'rect',
            x0: 0,
            x1: 1,
            y0: minY - 0.5,
            y1: maxY + 0.5,
            xref: 'paper',
            yref: 'y',
            fillcolor: 'rgba(231, 207, 163, 0.1)',
            line: { width: 0 }
        });
    }


    // 设置动画索引 - 根据点击来源采用不同策略
    let startFromIndexPlan, startFromIndexEff;
    const animationMode = getAnimationMode(); // Get current animation mode
    
    if (fromSequenceClick) {
        // 来自sequence图点击 - 使用被点击的identcode自身的数据
        startFromIndexPlan = linesPlan.findIndex(p => p === clickedItem.plan_ordinal - 1);
        startFromIndexEff = linesEff.findIndex(p => p === clickedItem.eff_ordinal - 1);
    } else {
        // 来自map点击 - 使用第一个匹配项的数据
        startFromIndexPlan = linesPlan.findIndex(p => p === matchedItems[0].plan_ordinal - 1);
        startFromIndexEff = linesEff.findIndex(p => p === matchedItems[0].eff_ordinal - 1);
    }

    // 更新动画索引
    if (animationMode === 'Plan' || animationMode === 'Both') {
        if (startFromIndexPlan !== -1) {
            animationIndexPlan = startFromIndexPlan-1;
            updatePlan(animationIndexPlan); //updatePlan is defined in playbar.js
        }
    }
    
    if (animationMode === 'Eff' || animationMode === 'Both') {
        if (startFromIndexEff !== -1) {
            animationIndexEff = startFromIndexEff-1;
            updateEff(animationIndexEff);
        }
    }

    // 更新图表形状
    const shapes = [
        ...(se_planLineShape ? [se_planLineShape] : []),
        ...(se_effLineShape ? [se_effLineShape] : []),
        ...highlightShapes
    ];



    // 更新图表形状
    Plotly.relayout(chartContainerID, { shapes: shapes });

    // 更新点的颜色 - 只高亮被点击的项目
    const highlightIndices = [data.findIndex(d => d.identcode === clickedItem.identcode)];

    Plotly.restyle(chartContainerID, {
        'marker.color': [
            data.map((_, i) => 
                i === highlightIndices[0] ? '#fc0' : 'rgb(75, 111, 228)'
            )
        ]
    }, [0]);
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
            console.log('Sequence chart reset to default source: Source 1.');
            updateSequenceData();
        } else {
            throw new Error('Failed to reset sequence chart');
        }
    })
    .catch(error => console.error('Error resetting source for sequence chart:', error));
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
            console.log('Sequence chart updated to:', selectedSource);
            updateSequenceData();
        } else {
            alert('Error update source for sequence chart: ' + data.message);
        }
    })
    .catch(error => console.error('Error:', error));
});


// 创建全局变量来存储两条线的状态 (添加se_前缀)
let se_planLineShape = null;
let se_effLineShape = null;

function updateSequencePlan(stationIndexPlan) {
    if (!sequenceData || stationIndexPlan < 0 || stationIndexPlan >= sequenceData.length) return;
    
    const xValuePlan = sequenceData[stationIndexPlan].plan_ordinal;

    se_planLineShape = createPlayhead(xValuePlan, 'rgb(142, 140, 140)', 'solid');
    
    // 合并形状
    const shapes = [...se_planLineShape];
    if (se_effLineShape) {
        shapes.push(...se_effLineShape);
    }
    
    Plotly.relayout(chartContainerID, {shapes});
}

function updateSequenceEff(stationIndexEff) {
    const matchingItem = sequenceData.find(item => item.eff_ordinal === (stationIndexEff + 1));
    if (!matchingItem) return;
    
    const xValueEff = matchingItem.plan_ordinal;

    se_effLineShape = createPlayhead(xValueEff, 'rgb(11, 76, 190)', 'solid');

    // 合并形状
    const shapes = [...se_effLineShape];
    if (se_planLineShape) {
        shapes.push(...se_planLineShape);
    }

    Plotly.relayout(chartContainerID, {shapes});
}

// 重置函数
function resetSequenceHighlights() {
    stationIndexPlan=0;
    stationIndexEff=0;
    se_planLineShape = null;
    se_effLineShape = null;
    Plotly.relayout(chartContainerID, {
        shapes: []
    });
    updateSequencePlan(stationIndexPlan);
    updateSequenceEff(stationIndexEff);
}


function createPlayhead(xValue, color = 'gray', dash = 'solid') {
    return [
        {
            type: 'line',
            x0: xValue,
            x1: xValue,
            y0: 0,
            y1: 1,
            xref: 'x',
            yref: 'paper',
            line: { color, width: 2, dash }
        },
        {
            type: 'line',
            x0: xValue - 0.2,
            x1: xValue + 0.2,
            y0: 1,
            y1: 1,
            xref: 'x',
            yref: 'paper',
            line: { color, width: 2 }
        },
        {
            type: 'line',
            x0: xValue - 0.2,
            x1: xValue + 0.2,
            y0: 0,
            y1: 0,
            xref: 'x',
            yref: 'paper',
            line: { color, width: 2 }
        }
    ];
}
