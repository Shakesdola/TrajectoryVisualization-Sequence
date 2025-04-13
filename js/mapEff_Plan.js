let pointsPlan = [];
let linesPlan = [];
let pointsEff = [];
let linesEff = [];
let filteredLinesPlan = [];
let filteredLinesEff = [];



let isPlayingPlan = false;
let isPlayingEff = false;

let animationSpeedPlan = 300;
let animationSpeedEff = 300;
const trailLengthPlan = 8;
const trailLengthEff = 8;

let planMarkers = [];
let effMarkers = [];

let animationIndexPlan = 0;
let animationIndexEff = 0;
let animationFramePlan;
let animationFrameEff;

const animatedPathDataPlan = {
    type: 'Feature',
    geometry: {
        type: 'LineString',
        coordinates: []
    }
};

const animatedPathDataEff = {
    type: 'Feature',
    geometry: {
        type: 'LineString',
        coordinates: []
    }
};

const animatedPathIconPlan = {
    type: 'Feature',
    geometry: {
        type: 'Point',
        coordinates: []
    }
};

const animatedPathIconEff = {
    type: 'Feature',
    geometry: {
        type: 'Point',
        coordinates: []
    }
};

let originalConstantSpeedPlan = animationSpeedPlan;
let originalConstantSpeedEff = animationSpeedEff;

function controlSpeed(multiplier) {
    console.log('Current speed multiplier:', multiplier);

    if (originalConstantSpeedPlan === animationSpeedPlan && originalConstantSpeedEff ===animationSpeedEff) {
        originalConstantSpeedPlan = animationSpeedPlan;
        originalConstantSpeedEff = animationSpeedEff;
    }

    animationSpeedPlan = originalConstantSpeedPlan * multiplier;
    animationSpeedEff = originalConstantSpeedEff * multiplier;

    if (isPlayingPlan) {
        clearTimeout(animationFramePlan);
        
        animatePathPlan();
    }

    if (isPlayingEff) {
        
        clearTimeout(animationFrameEff);

        animatePathEff();
    }
}

function updatePathColorsPlan() {
    const totalSegments = animatedPathDataPlan.geometry.coordinates.length;
    const colors = [];  // 用来存储每段路径的颜色

    // 设置颜色渐变
    for (let i = 0; i < totalSegments; i++) {
        const progress = i / totalSegments; // 计算路径段的进度，0为最开始，1为最结束
        const color = interpolateColor(progress);  // 计算渐变颜色
        colors.push(color);
    }

    // 更新图层的颜色
    map.getSource('animatedPathSourcePlan').setData({
        ...animatedPathDataPlan,
        properties: { 
            colors: colors 
        }
    });
}

function updatePathColorsEff() {
    const totalSegmentsEff = animatedPathDataEff.geometry.coordinates.length;
    const colors = [];  // 用来存储每段路径的颜色

    // 设置颜色渐变
    for (let i = 0; i < totalSegmentsEff; i++) {
        const progress = i / totalSegmentsEff; // 计算路径段的进度，0为最开始，1为最结束
        const color = interpolateColor(progress);  // 计算渐变颜色
        colors.push(color);
    }

    // 更新图层的颜色
    map.getSource('animatedPathSourceEff').setData({
        ...animatedPathDataEff,
        properties: { 
            colors: colors 
        }
    });
}

// 计算颜色渐变函数，使用颜色从深到浅
function interpolateColor(progress) {
    const r = Math.round(213 + (255 - 213) * progress); // 颜色从 rgb(213,82,0) 到 rgb(255,149,0)
    const g = Math.round(82 + (149 - 82) * progress);
    const b = Math.round(0 + (0 - 0) * progress); // 保持蓝色分量为0
    return `rgb(${r}, ${g}, ${b})`;
}

let stationIndexPlan=1
let stationIndexEff=1
function animatePathPlan() {
    //Leading icon
    if (!map.getSource('plan-icon-source')) {
        map.addSource('plan-icon-source', {
            type: 'geojson',
            data: animatedPathIconPlan
        });
    }
    if (!map.getLayer('plan-icon-layer')) {
        map.addLayer({
            id: 'plan-icon-layer',
            type: 'circle',
            source: 'plan-icon-source',
            paint: {
                'circle-radius': 6,
                'circle-color': 'rgba(145, 85, 77, 0.8)',
                'circle-stroke-width': 2,
                'circle-stroke-color': '#ffffff'
            }
        });
    }
    map.moveLayer('plan-icon-layer');
    
    if (animationIndexPlan < linesPlan.length-2) {
        
        let nextPoint = linesPlan[animationIndexPlan + 1];

        // 如果遇到的是数值（即站点索引），更新 stationIndex
        if (typeof nextPoint === 'number') {
            // updateTimelinePlan(nextPoint);  // TIMELINE
            updateSequencePlan(nextPoint);
            stationIndexPlan = nextPoint;
            //animationIndexPlan++;  // 跳过这个数值，进入下一个点
        } else {
            animatedPathDataPlan.geometry.coordinates.push(nextPoint);

            //Update the location of leading icon
            animatedPathIconPlan.geometry.coordinates = nextPoint;
            map.getSource('plan-icon-source').setData(animatedPathIconPlan);
        }

        if (animatedPathDataPlan.geometry.coordinates.length > trailLengthPlan) {
            animatedPathDataPlan.geometry.coordinates.shift();
        }

        updatePathColorsPlan();

        map.getSource('animatedPathSourcePlan').setData(animatedPathDataPlan);
        updateMapView();
        
        animationIndexPlan++;

        document.getElementById('playbarSliderPlan').value = animationIndexPlan;
        updateSliderFill(sliderPlan);
        updateBanner();
        
        animationFramePlan = setTimeout(() => requestAnimationFrame(animatePathPlan), animationSpeedPlan);
    } else {
        endPlayingPlan = true;
        isPlayingPlan = false;
        document.getElementById('playbarSliderPlan').value = linesPlan.length-3;
        checkBothAnimationsComplete();
        updateBanner();
    }
}

function animatePathEff() {
    //Leading icon
    if (!map.getSource('eff-icon-source')) {
        map.addSource('eff-icon-source', {
            type: 'geojson',
            data: animatedPathIconPlan
        });
    }
    if (!map.getLayer('eff-icon-layer')) {
        map.addLayer({
            id: 'eff-icon-layer',
            type: 'circle',
            source: 'eff-icon-source',
            paint: {
                'circle-radius': 6,
                'circle-color': 'rgb(51, 106, 208)',
                'circle-stroke-width': 2,
                'circle-stroke-color': '#ffffff'
            }
        });
    }
    map.moveLayer('eff-icon-layer');

    if (animationIndexEff < linesEff.length-2) {
        

        let nextPoint = linesEff[animationIndexEff + 1];

        // 如果遇到的是数值（即站点索引），更新 stationIndex
        if (typeof nextPoint === 'number') {
            // updateTimelineEff(nextPoint);  // TIMELINE
            updateSequenceEff(nextPoint);
            stationIndexEff = nextPoint;
            //animationIndexEff++;  // 跳过这个数值，进入下一个点
        } else {
            animatedPathDataEff.geometry.coordinates.push(nextPoint);

            //Update the location of leading icon
            animatedPathIconEff.geometry.coordinates = nextPoint;
            map.getSource('eff-icon-source').setData(animatedPathIconEff);
        }

        if (animatedPathDataEff.geometry.coordinates.length > trailLengthEff) {
            animatedPathDataEff.geometry.coordinates.shift();
        }

        updatePathColorsEff();

        map.getSource('animatedPathSourceEff').setData(animatedPathDataEff);
        updateMapView();
        
        animationIndexEff++;
        document.getElementById('playbarSliderEff').value = animationIndexEff;
        updateSliderFill(sliderEff);
        updateBanner();
        console.log("endPlayEff?",endPlayingEff);

        animationFrameEff = setTimeout(() => requestAnimationFrame(animatePathEff), animationSpeedEff);
    } else {
        endPlayingEff = true;
        isPlayingEff = false;
        document.getElementById('playbarSliderEff').value = linesEff.length -3;
        checkBothAnimationsComplete();
        updateBanner();
    }
}

function updateMapView() {
    if (mapTrackMode !== 'auto') return;
    const mode = getAnimationMode();
    const combinedBounds = new mapboxgl.LngLatBounds();
    
    // 根据模式添加相应的轨迹坐标到bounds
    if (mode === 'Plan' || mode === 'Both') {
        // 添加Plan轨迹坐标
        animatedPathDataPlan.geometry.coordinates.forEach(coord => {
            combinedBounds.extend(coord);
        });
    }
    
    if (mode === 'Eff' || mode === 'Both') {
        // 添加Eff轨迹坐标
        animatedPathDataEff.geometry.coordinates.forEach(coord => {
            combinedBounds.extend(coord);
        });
    }
    
    // 检查bounds是否为空（可能在切换模式时轨迹数据未加载）
    if (combinedBounds.isEmpty()) {
        console.log('No coordinates to fit bounds');
        return;
    }
    
    // 添加一些内边距
    const padding = 50;
    
    // 只在轨迹超出当前视图边界时更新视图
    const currentBounds = map.getBounds();
    if (!currentBounds.contains(combinedBounds.getNorthEast()) || 
        !currentBounds.contains(combinedBounds.getSouthWest())) {
        map.fitBounds(combinedBounds, {
            padding: padding,
            duration: 700,
            maxZoom: 17 // 防止过度缩放
        });
    }
}

let endPlayingPlan = false;
let endPlayingEff = false;
function checkBothAnimationsComplete() {
    const animationMode = getAnimationMode();
    if (animationMode === 'Both') {
        if (endPlayingPlan && endPlayingEff) {
            document.getElementById('playPauseButton').innerHTML = playIcon;
            animationIndexPlan = 0;
            animationIndexEff = 0;
            endPlayingPlan = false;
            endPlayingEff = false;
            console.log("checkbothBothmode被调用！")
        }
    } else if (animationMode === 'Plan') {
        if (endPlayingPlan || !isPlayingPlan) {
            document.getElementById('playPauseButton').innerHTML = playIcon;
            animationIndexPlan = 0;
            endPlayingPlan = false;
            console.log("checkbothPlanmode被调用！")
        }
    } else if (animationMode === 'Eff') {
        if (endPlayingEff || !isPlayingEff) {
            document.getElementById('playPauseButton').innerHTML = playIcon;
            animationIndexEff = 0;
            endPlayingEff = false;
            console.log("checkbothEffmode被调用！")
        }
    }
}


// 下拉框选择事件
document.getElementById('sourceSelector').addEventListener('change', function(event) {
    const selectedSource = event.target.value;
    clearTimeout(animationFramePlan);
    clearTimeout(animationFrameEff);
    document.getElementById('playPauseButton').innerHTML = playIcon;
    isPlayingPlan=false;
    isPlayingEff=false;

    // 更新 sourceLoader 的数据源
    window.sourceLoader.setSource(selectedSource);

    // 重新加载并更新图层
    loadDataTrajectory();
    loadDataParcel();
    
    document.getElementById('toggleSEPointPlan').checked = true;
    document.getElementById('toggleSEPointEff').checked = true;
    setTimeout(() => {
        updatePointIconVisibility();
    }, 300);
    
});

// 初始化加载数据
function loadDataTrajectory() {
    const sourcePathPlan = window.sourceLoader.getSourcePath('geoPlan'); // 获取所选源的路径
    const sourcePathEff = window.sourceLoader.getSourcePath('geoEff'); // 获取所选源的路径

    // 清除现有图层
    clearMapLayers();

    // 加载新的数据
    Promise.all([
        fetch(sourcePathPlan).then(response => response.json()),
        fetch(sourcePathEff).then(response => response.json())
    ])
    .then(([planData, effData]) => {
        // 处理 Plan 数据
        pointsPlan = planData.features
            .filter(feature => feature.geometry.type === 'Point')
            .map(feature => ({
                coordinates: feature.geometry.coordinates,
                id: feature.properties.id
            }));
        linesPlan = planData.features
            .filter(feature => feature.geometry.type === 'LineString')
            .flatMap((feature, index) => {
                const coordinates = feature.geometry.coordinates;
                // 使用索引号代替 null
                return [...coordinates,  index + 1];
            });

        // 处理 Eff 数据
        pointsEff = effData.features
            .filter(feature => feature.geometry.type === 'Point')
            .map(feature => ({
                coordinates: feature.geometry.coordinates,
                id: feature.properties.id
            }));
        linesEff = effData.features
            .filter(feature => feature.geometry.type === 'LineString')
            .flatMap((feature, index) => {
                const coordinates = feature.geometry.coordinates;
                // 使用索引号代替 null
                return [...coordinates,  index + 1];
            });
        // console.log('linesEFf的值:', linesEff);
        // console.log('linesPlan的值:', linesPlan);

        // const maxLength = Math.max(linesPlan.length, linesEff.length);
        // // 设置滑块的最大值
        // document.getElementById('playbarSlider').max = maxLength - 1;

        // 更新地图中心
        const combinedFeatures = {
            type: 'FeatureCollection',
            features: [...planData.features, ...effData.features]
        };
        const center = turf.center(combinedFeatures);
        map.setCenter(center.geometry.coordinates);

        // 更新图层
        updateLayers();
    })
    .catch(error => console.error('Error loading GeoJSON:', error));
}


function loadDataParcel() {
    const sourcePath = window.sourceLoader.getSourcePath('mergedData');

    fetch(sourcePath)
        .then(response => response.json())
        .then(data => {
            const mergedParcels = {};
            const planPoints = [];
            const effPoints = [];

            data.forEach(parcel => {
                const key = `${parcel.recipient_longitude},${parcel.recipient_latitude}`;
                if (!mergedParcels[key]) {
                    mergedParcels[key] = [];
                }
                mergedParcels[key].push(parcel);

                planPoints.push({
                    time: new Date(parcel.PLAN_DAT),
                    coordinates: [parcel.recipient_longitude, parcel.recipient_latitude]
                });
                effPoints.push({
                    time: new Date(parcel.EFF_DAT),
                    coordinates: [parcel.recipient_longitude, parcel.recipient_latitude]
                });
            });

            // 提取四个关键点
            planPoints.sort((a, b) => a.time - b.time);
            effPoints.sort((a, b) => a.time - b.time);
            const startPlan = planPoints[0];
            const endPlan = planPoints[planPoints.length - 1];
            const startEff = effPoints[0];
            const endEff = effPoints[effPoints.length - 1];

            const features = [];

            for (const key in mergedParcels) {
                const [longitude, latitude] = key.split(',').map(Number);
                const parcelGroup = mergedParcels[key];
                const totalParcels = parcelGroup.length;
                const firstParcel = parcelGroup[0];

                const timeDelay = parcelGroup.some(parcel => {
                    const planTime = new Date(parcel.PLAN_DAT);
                    const effTime = new Date(parcel.EFF_DAT);
                    return (effTime - planTime) / 60000 > 15;
                });

                const timeEarly = parcelGroup.some(parcel => {
                    const planTime = new Date(parcel.PLAN_DAT);
                    const effTime = new Date(parcel.EFF_DAT);
                    return (planTime - effTime) / 60000 > 15;
                });

                let markerColor = 'rgb(6, 145, 39)';
                if (timeDelay) {
                    markerColor = 'rgb(214, 42, 33)';
                } else if (timeEarly) {
                    markerColor = 'rgb(255, 234, 0)';
                }

                features.push({
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [longitude, latitude]
                    },
                    properties: {
                        markerColor,
                        identcode: firstParcel.identcode,
                        popupContent: generatePopupHTML(parcelGroup, totalParcels)
                    }
                });
            }

            const geojson = {
                type: 'FeatureCollection',
                features
            };

            if (map.getLayer('parcel-markers')) map.removeLayer('parcel-markers');
            if (map.getSource('parcel-points')) map.removeSource('parcel-points');

            map.addSource('parcel-points', {
                type: 'geojson',
                data: geojson
            });

            map.addLayer({
                id: 'parcel-markers',
                type: 'circle',
                source: 'parcel-points',
                paint: {
                    'circle-radius': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        13, 5,
                        16, 10,
                        20, 20
                    ],
                    'circle-color': ['get', 'markerColor'],
                    'circle-stroke-color': '#f4f3f1',
                    'circle-stroke-width': 1
                }
            });

        
            map.on('click', 'parcel-markers', (e) => {
                const coordinates = e.features[0].geometry.coordinates.slice();
                const html = e.features[0].properties.popupContent;
                const identcode = e.features[0].properties.identcode;
            
                new mapboxgl.Popup()
                    .setLngLat(coordinates)
                    .setHTML(html)
                    .addTo(map);
            
                // highlightTimeline(identcode, { 
                //     fromTimelineClick: false,
                //     coordinates 
                // });
                highlightSequence(identcode, { 
                    fromSequenceClick: false,
                    coordinates 
                });
                addClickMarker(coordinates);
            });

            // Change cursor to pointer when hovering over parcel markers
            map.on('mouseenter', 'parcel-markers', () => {
                map.getCanvas().style.cursor = 'pointer';
            });

            // Revert cursor when not hovering
            map.on('mouseleave', 'parcel-markers', () => {
                map.getCanvas().style.cursor = '';
            });


            const region = data[0].SND_EMPF_ORT;
            const plz = data[0].PLZ_ZUST;
            const bezirk = data[0].BEZIRK;
            document.getElementById('deliveryCode').innerHTML = `BEZIRK ${bezirk}, PLZ ${plz}, ${region}`;

            // Start End point
            const iconGeoJSONPlan = {
                type: 'FeatureCollection',
                features: [
                    {
                        type: 'Feature',
                        geometry: { type: 'Point', coordinates: startPlan.coordinates },
                        properties: { title: 'Start Plan', group: 'plan', icon: 'start-plan-icon'}
                    },
                    {
                        type: 'Feature',
                        geometry: { type: 'Point', coordinates: endPlan.coordinates },
                        properties: { title: 'End Plan', group: 'plan', icon: 'end-plan-icon'}
                    }
                ]
            };
            
            const iconGeoJSONEff = {
                type: 'FeatureCollection',
                features: [
                    {
                        type: 'Feature',
                        geometry: { type: 'Point', coordinates: startEff.coordinates },
                        properties: { title: 'Start Eff', group: 'eff', icon: 'start-eff-icon'}
                    },
                    {
                        type: 'Feature',
                        geometry: { type: 'Point', coordinates: endEff.coordinates },
                        properties: { title: 'End Eff', group: 'eff', icon: 'end-eff-icon'}
                    }
                ]
            };
            
            Promise.all([
                ['start-plan-icon', '/static/start-plan.png'],
                ['end-plan-icon', '/static/end-plan.png'],
                ['start-eff-icon', '/static/start-eff.png'],
                ['end-eff-icon', '/static/end-eff.png'],
            ].map(([name, url]) => 
                new Promise((resolve, reject) => {
                    map.loadImage(url, (error, image) => {
                        if (error) return reject(error);
                        if (!map.hasImage(name)) map.addImage(name, image);
                        resolve();
                    });
                }))
            ).then(() => {
                // Remove existing sources/layers if needed
                if (map.getLayer('point-icons-eff-layer')) map.removeLayer('point-icons-eff-layer');
                if (map.getLayer('point-icons-plan-layer')) map.removeLayer('point-icons-plan-layer');
            
                if (map.getSource('point-icons-eff')) map.removeSource('point-icons-eff');
                if (map.getSource('point-icons-plan')) map.removeSource('point-icons-plan');
            
                map.addSource('point-icons-plan', { type: 'geojson', data: iconGeoJSONPlan });
                map.addSource('point-icons-eff', { type: 'geojson', data: iconGeoJSONEff });
            
                map.addLayer({
                    id: 'point-icons-plan-layer',
                    type: 'symbol',
                    source: 'point-icons-plan',
                    layout: {
                        'icon-image': ['get', 'icon'], // Use icon field from properties
                        'icon-size': [
                            'interpolate', 
                            ['linear'], 
                            ['zoom'],
                            13, 0.05,
                            16, 0.1,
                            20, 0.2  // 最大缩放级别时的尺寸
                            ],
                        'icon-anchor': 'bottom',
                        'icon-offset': [200, 0],
                        'icon-allow-overlap': true
                    }
                });
            
                map.addLayer({
                    id: 'point-icons-eff-layer',
                    type: 'symbol',
                    source: 'point-icons-eff',
                    layout: {
                        'icon-image': ['get', 'icon'],
                        'icon-size': [
                            'interpolate', 
                            ['linear'], 
                            ['zoom'],
                            13, 0.05,
                            16, 0.1,
                            20, 0.2  // 最大缩放级别时的尺寸
                            ],
                        'icon-anchor': 'bottom',
                        'icon-offset': [200, -80],
                        'icon-allow-overlap': true
                    }
                });
            }).catch(console.error);
            
            
            
            
        })
        .catch(error => console.error('Error loading parcel data:', error));
}


function generatePopupHTML(parcelGroup, totalParcels) {
    let html = `<b>Number of Parcels: </b> ${totalParcels}<br>`;
    parcelGroup.forEach((parcel, i) => {
        html += `<b>Parcel-${i + 1}:</b><br>` +
                `Identcode: ${parcel.identcode}<br>` +
                `Planned: ${parcel.PLAN_DAT}<br>` +
                `Effective: ${parcel.EFF_DAT}<br><br>`;
    });
    html += parcelGroup.length > 0 ? 
        `${parcelGroup[0].SND_EMPF_STRASSE}, ${String(parcelGroup[0].SND_EMPF_PLZZZ).slice(0, 4)}, ${parcelGroup[0].SND_EMPF_ORT}` : '';
    return html;
}

// 清除现有图层
function clearMapLayers() {
    if (map.getLayer('geoPlanLineLayer')) {
        map.removeLayer('geoPlanLineLayer');
        map.removeSource('geoPlanLineSource');
    }

    if (map.getLayer('geoEffLineLayer')) {
        map.removeLayer('geoEffLineLayer');
        map.removeSource('geoEffLineSource');
    }

    if (map.getLayer('animatedPathLayerPlan')) {
        map.removeLayer('animatedPathLayerPlan');
        map.removeSource('animatedPathSourcePlan');
    }

    if (map.getLayer('animatedPathLayerEff')) {
        map.removeLayer('animatedPathLayerEff');
        map.removeSource('animatedPathSourceEff');
    }

    // 清除现有标记
    planMarkers.forEach(marker => marker.remove());
    effMarkers.forEach(marker => marker.remove());
    planMarkers = [];
    effMarkers = [];
}

// 更新图层
function updateLayers() {
    // 过滤掉 linesPlan 中的 null 值
    filteredLinesPlan = linesPlan.filter(point => point !== null);
    filteredLinesEff = linesEff.filter(point => point !== null);


    // 添加 Plan 数据的图层
    map.addSource('geoPlanLineSource', {
        type: 'geojson',
        data: {
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates: filteredLinesPlan
            }
        }
    });

    map.addLayer({
        id: 'geoPlanLineLayer',
        type: 'line',
        source: 'geoPlanLineSource',
        paint: {
            'line-color': 'rgba(145, 85, 77, 0.8)',
            'line-width': 12
        }
    });

    // 添加 Eff 数据的图层
    map.addSource('geoEffLineSource', {
        type: 'geojson',
        data: {
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates: filteredLinesEff
            }
        }
    });

    map.addLayer({
        id: 'geoEffLineLayer',
        type: 'line',
        source: 'geoEffLineSource',
        paint: {
            'line-color': 'rgba(0, 149, 255,0.7)',
            'line-width': 5
        }
    });

    // 添加动画路径图层
    map.addSource('animatedPathSourcePlan', {
        type: 'geojson',
        data: animatedPathDataPlan,
        lineMetrics: true  // 启用线段的度量信息
    });

    map.addLayer({
        id: 'animatedPathLayerPlan',
        type: 'line',
        source: 'animatedPathSourcePlan',
        paint: {
            //'line-color': 'rgb(213, 82, 0)',
            'line-width': 14,
            'line-gradient': [
            'interpolate',
            ['linear'],
            ['line-progress'],
            0, 'rgba(228, 56, 33, 0.6)',  // light color
            1, 'rgba(215, 38, 14, 0.8)'   // dark color
        ]
        }
    });

    map.addSource('animatedPathSourceEff', {
        type: 'geojson',
        data: animatedPathDataEff,
        lineMetrics: true  // 启用线段的度量信息
    });

    map.addLayer({
        id: 'animatedPathLayerEff',
        type: 'line',
        source: 'animatedPathSourceEff',
        paint: {
            //'line-color': 'rgb(0, 82, 213)',
            'line-width': 5,
            'line-gradient': [
            'interpolate',
            ['linear'],
            ['line-progress'],
            0, 'rgb(34, 110, 234)',  // 开始的颜色
            1, 'rgb(40, 45, 104)'   // 结束的颜色
        ]
        }
    });

    // // 重新添加标记
    // pointsPlan.forEach(point => {
    //     planMarkers.push(createMarker(point, false)); // Plan 路径标记
    // });

    // pointsEff.forEach(point => {
    //     effMarkers.push(createMarker(point, true)); // Eff 路径标记
    // });
    // console.log('pointsEff:', pointsEff);
}
/*
// 创建标记
function createMarker(point, isEffective) {
    const marker = document.createElement('div');
    marker.className = 'marker';
    marker.style.width = '20px';
    marker.style.height = '20px';
    marker.style.backgroundColor = 'rgb(255,255,255)';
    marker.style.borderRadius = '50%';
    marker.style.border = `2px solid ${isEffective ? 'rgb(0, 149, 255)' : 'rgb(255, 149, 0)'}`;
    marker.style.display = 'flex';
    marker.style.alignItems = 'center';
    marker.style.justifyContent = 'center';
    marker.style.color = isEffective ? 'rgb(0, 149, 255)' : 'rgb(255, 149, 0)';
    marker.style.fontSize = '12px';
    marker.style.fontWeight = 'bold';
    marker.style.textAlign = 'center';
    marker.style.zIndex = isEffective ? 5 : 1;
    //marker.style.zIndex = '1';  // 设置较低的 zIndex，使标记位于底层

    // 显示起始标记的自定义图标
    if (point.id === 0) {
        const icon = document.createElement('img');
        icon.src = isEffective ? 'static/blueMarker.png' : 'static/orangeMarker.png';
        icon.style.width = '35px';
        icon.style.height = '35px';
        marker.appendChild(icon);

        const text = document.createElement('div');
        text.innerHTML = '1';
        text.style.position = 'absolute';
        text.style.fontSize = '12px';
        text.style.fontWeight = 'bold';
        text.style.color = 'white';
        marker.appendChild(text);
    } else {
        marker.innerHTML = point.id + 1;
    }

    let coordinates = point.coordinates;
    if (!isEffective) {
        // Plan点偏移
        const offsetLat = 0.0001;
        coordinates = [point.coordinates[0] + offsetLat, point.coordinates[1]];
    }

    return new mapboxgl.Marker(marker).setLngLat(coordinates).addTo(map);
}*/

// 初始化加载数据
loadDataTrajectory(); // 默认加载数据
loadDataParcel();

const playIcon = `
<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="bi bi-play-fill" viewBox="0 0 16 16">
  <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393"/>
</svg>`;

const pauseIcon = `
<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="bi bi-pause" viewBox="0 0 16 16">
  <path d="M5.5 3A.5.5 0 0 1 6 3.5v9a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-9A.5.5 0 0 1 4.5 3h1zM11 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-9A.5.5 0 0 1 10 3h1z"/>
</svg>`;

const stopIcon =`
<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="bi bi-stop-fill" viewBox="0 0 16 16">
  <path d="M5 3.5h6A1.5 1.5 0 0 1 12.5 5v6a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 11V5A1.5 1.5 0 0 1 5 3.5"/>
</svg>`

function playAnimationPlan() {
    if (!isPlayingPlan) {
        isPlayingPlan = true;
        updateBanner();

        // if (animationIndexPlan >= linesPlan.length) {
        //     animationIndexPlan = 0; // 如果超出范围，重置
        // }

        animatedPathDataPlan.geometry.coordinates = [linesPlan[animationIndexPlan]];
        map.getSource('animatedPathSourcePlan').setData(animatedPathDataPlan);

        animatePathPlan();
        document.getElementById('playPauseButton').innerHTML=pauseIcon;
    }
}

function playAnimationEff() {
    if (!isPlayingEff) {
        isPlayingEff = true;
        updateBanner();

        // if (animationIndexEff >= linesEff.length) {
        //     animationIndexEff = 0;
        // }

        animatedPathDataEff.geometry.coordinates = [linesEff[animationIndexEff]];
        map.getSource('animatedPathSourceEff').setData(animatedPathDataEff);

        animatePathEff();
        document.getElementById('playPauseButton').innerHTML=pauseIcon;
    }
}

function pauseAnimationPlan() {
    if (isPlayingPlan) {
        clearTimeout(animationFramePlan);
        isPlayingPlan = false;
        document.getElementById('playPauseButton').innerHTML=playIcon;
        updateBanner();
    }
}

function pauseAnimationEff() {
    if (isPlayingEff) {
        clearTimeout(animationFrameEff);
        isPlayingEff = false;
        document.getElementById('playPauseButton').innerHTML=playIcon;
        updateBanner();
    }
}



function stopAnimationPlan() {
    clearTimeout(animationFramePlan);
    isPlayingPlan = false;
    endPlayingPlan=true;
    animationIndexPlan = 0;
    animatedPathDataPlan.geometry.coordinates = [];
    map.getSource('animatedPathSourcePlan').setData(animatedPathDataPlan);
    
    animatedPathIconPlan.geometry.coordinates = [];
    map.getSource('plan-icon-source').setData(animatedPathIconPlan);

    // Reset slider(s)
    document.getElementById('playbarSliderPlan').value = 0;
    endPlayingPlan = true;

    document.getElementById('playPauseButton').innerHTML=playIcon;
    updateBanner();
    resetSequenceHighlights();
}

function stopAnimationEff() {
    clearTimeout(animationFrameEff);
    isPlayingEff = false;
    endPlayingEff=true;
    animationIndexEff = 0;
    animatedPathDataEff.geometry.coordinates = [];
    map.getSource('animatedPathSourceEff').setData(animatedPathDataEff);

    animatedPathIconEff.geometry.coordinates = [];
    map.getSource('eff-icon-source').setData(animatedPathIconEff);

    document.getElementById('playPauseButton').innerHTML=playIcon;
    updateBanner();
    // resetTimelineHighlights();  //TIMELINE
    resetSequenceHighlights();

    // Reset slider(s)
    document.getElementById('playbarSliderEff').value = 0;
    endPlayingEff = true;
}


document.getElementById('playPauseButton').addEventListener('click', () => { 
    const mode = getAnimationMode();

    if (mode === 'Both') {
        // If both ended, reset and play
        if (endPlayingPlan && endPlayingEff) {
            animationIndexPlan = 0;
            animationIndexEff = 0;
            endPlayingPlan = false;
            endPlayingEff = false;
            playAnimationPlan();
            playAnimationEff();
        } 
        // If both are playing, pause
        else if (isPlayingPlan && isPlayingEff) {
            pauseAnimationPlan();
            pauseAnimationEff();
        } 
        // Otherwise, resume whichever is paused and not ended
        else {
            if (!isPlayingPlan && !endPlayingPlan) playAnimationPlan();
            if (!isPlayingEff && !endPlayingEff) playAnimationEff();
        }
    }

    // Plan only
    else if (mode === 'Plan') {
        if (endPlayingPlan) {
            animationIndexPlan = 0;
            endPlayingPlan = false;
            playAnimationPlan();
        } else if (isPlayingPlan) {
            pauseAnimationPlan();
        } else {
            playAnimationPlan();
        }
    }

    // Eff only
    else if (mode === 'Eff') {
        if (endPlayingEff) {
            animationIndexEff = 0;
            endPlayingEff = false;
            playAnimationEff();
        } else if (isPlayingEff) {
            pauseAnimationEff();
        } else {
            playAnimationEff();
        }
    }
});


document.getElementById('toggleAnimationPlan').addEventListener('change', (event) => { 
    if (event.target.checked) {
        // 如果toggleAnimationPlan被选中
        // 确保toggleAnimationEff和toggleAnimationBoth没有选中
        document.getElementById('toggleAnimationEff').checked = false;
        document.getElementById('toggleAnimationBoth').checked = false;
        
        if (isPlayingPlan || isPlayingEff) {
            pauseAnimationPlan();
            pauseAnimationEff();
        } 
        
    } else {
        pauseAnimationPlan();
    }
});

document.getElementById('toggleAnimationEff').addEventListener('change', (event) => { 
    if (event.target.checked) {
        // 如果toggleAnimationEff被选中
        // 确保toggleAnimationPlan和toggleAnimationBoth没有选中
        document.getElementById('toggleAnimationPlan').checked = false;
        document.getElementById('toggleAnimationBoth').checked = false;
        
        if (isPlayingPlan || isPlayingEff) {
            pauseAnimationPlan();
            pauseAnimationEff();
        } 

        
    }else {
        pauseAnimationEff();
    }
});

document.getElementById('toggleAnimationBoth').addEventListener('change', (event) => { 
    if (event.target.checked) {
        // 如果toggleAnimationBoth被选中
        // 确保toggleAnimationPlan和toggleAnimationEff没有选中
        document.getElementById('toggleAnimationPlan').checked = false;
        document.getElementById('toggleAnimationEff').checked = false;
        
        
        if (isPlayingPlan || isPlayingEff) {
            pauseAnimationPlan();
            pauseAnimationEff();
        } 
    }
    else {
        // pauseAnimationPlan();
        // pauseAnimationEff();
    }
});

// 停止动画操作
document.getElementById('stopButton').addEventListener('click', () => {
    // 停止所有动画
    stopAnimationPlan();
    stopAnimationEff();
    
    // // 更新按钮状态
    // document.getElementById('toggleAnimationPlan').checked = false;
    // document.getElementById('toggleAnimationEff').checked = false;
    // document.getElementById('toggleAnimationBoth').checked = true;
    
    // 更新动画播放状态
    isPlayingPlan = false;
    isPlayingEff = false;
    endPlayingEff = true;
    endPlayingPlan=true;
});










/*
document.getElementById('playPauseButton').addEventListener('click', () => {
    if (isPlayingPlan || isPlayingEff) {
        pauseAnimation();
    } else {
        playAnimation();
    }
});

document.getElementById('stopButton').addEventListener('click', () => {
    stopAnimation();
});
*/


document.getElementById('toggleMapPlan').addEventListener('change', (event) => {
    if (event.target.checked) {
        // 显示轨迹
        map.setLayoutProperty('geoPlanLineLayer', 'visibility', 'visible');
        map.setLayoutProperty('animatedPathLayerPlan', 'visibility', 'visible');
        // 显示所有 markers
        planMarkers.forEach(marker => {
            marker.getElement().style.visibility = 'visible';  // 使用 visibility 控制显示
        });
        document.getElementById('playPauseButton').disabled = false;
    } else {
        // 隐藏轨迹
        map.setLayoutProperty('geoPlanLineLayer', 'visibility', 'none');
        map.setLayoutProperty('animatedPathLayerPlan', 'visibility', 'visible');
        // 隐藏所有 markers
        planMarkers.forEach(marker => {
            marker.getElement().style.visibility = 'hidden';  // 使用 visibility 控制隐藏
        });

        if(document.getElementById('toggleMapEff').checked){
            if(document.getElementById('toggleAnimationEff').checked) {
                document.getElementById('playPauseButton').disabled = false;
            } else {document.getElementById('playPauseButton').disabled = false;}
        } else {document.getElementById('playPauseButton').disabled = false;}

            
    }
});

document.getElementById('toggleMapEff').addEventListener('change', (event) => {
    if (event.target.checked) {
        map.setLayoutProperty('geoEffLineLayer', 'visibility', 'visible');
        map.setLayoutProperty('animatedPathLayerEff', 'visibility', 'visible');
        effMarkers.forEach(marker => {
            marker.getElement().style.visibility = 'visible';
        });
        document.getElementById('playPauseButton').disabled = false;
    } else {
        map.setLayoutProperty('geoEffLineLayer', 'visibility', 'none');
        map.setLayoutProperty('animatedPathLayerEff', 'visibility', 'visible');
        effMarkers.forEach(marker => {
            marker.getElement().style.visibility = 'hidden';
        });

        
        if(document.getElementById('toggleMapPlan').checked){
            if(document.getElementById('toggleAnimationPlan').checked) {
                document.getElementById('playPauseButton').disabled = false;
            } else {document.getElementById('playPauseButton').disabled = false;}
        } else {document.getElementById('playPauseButton').disabled = false;}

    }
});

document.getElementById('speedSlider').addEventListener('input', (event) => {
    const speedMultiplier = parseFloat(event.target.value);
    controlSpeed(speedMultiplier);
});



// 跳转到指定坐标，并执行动画
function zoomToCoordinates(coordinates) {
    // 先跳转地图到目标坐标
    map.flyTo({
        center: coordinates,  // 地图跳转到目标坐标
        zoom: 17,  // 适当设置缩放级别
        speed: 2,  // 动画速度
        curve: 1,  // 曲线的程度
        easing: function(t) {
            return t;
        }
    });

    // 如果需要在该坐标处做动画（例如显示标记或者路径动画），可调用相关函数
    // 比如你可以更新路径动画的起点为这个坐标，或者为该点添加标记
    // 例如，如果有动画的需求，可以用 `animatePathEff` 或 `animatePathPlan` 来控制动画
    // 假设有相关逻辑，我们可以在这里添加:
    //animatePathToCoordinate(coordinates);
}

let previousMarker = null;  // 用于存储上一个添加的 marker

// addClickMarker 函数：点击事件时在地图上添加标记
function addClickMarker(coordinates) {
        
        // 如果之前有添加过 marker，先将其移除
        if (previousMarker) {
            previousMarker.remove();
        }

        // 创建新的标记
        const markerElement = document.createElement('div');
        markerElement.style.width = '50px';  // 设置标记大小
        markerElement.style.height = '50px';
        //markerElement.style.backgroundColor = 'red';  // 设置标记颜色
        markerElement.style.backgroundImage = 'url("https://img.icons8.com/retro/128/marker.png")';  // 设置标记的图片
        // markerElement.style.backgroundSize = '50px 50px';  // 确保背景图像大小为 50x50

        markerElement.style.backgroundSize = 'cover';  // 确保图片完全覆盖标记区域
        markerElement.style.borderRadius = '50%';  // 圆形标记
        markerElement.style.zIndex = '1000';  // 设置较低的 zIndex，使标记位于底层
        markerElement.style.position = 'relative';  // 使用相对定位
        markerElement.style.top = '-10px';  // 向上偏移 5px

        // 创建并添加标记到地图
        const newMarker = new mapboxgl.Marker(markerElement)
            .setLngLat(coordinates)  // 设置标记的经纬度
            .setOffset([0, -20]) 
            .addTo(map);  // 将标记添加到地图上

        // 更新 previousMarker 为当前标记
        previousMarker = newMarker;
}


// // Control the playbar版本1
// document.getElementById('playbarSlider').max = linesPlan.length - 1;

// document.getElementById('playbarSlider').addEventListener('input', function(event) {
//     let newIndex = parseInt(event.target.value, 10);

//     // 更新 Plan 轨迹
//     animationIndexPlan = newIndex;
//     animatedPathDataPlan.geometry.coordinates = linesPlan.slice(Math.max(0, newIndex - trailLengthPlan + 1), newIndex + 1);
//     map.getSource('animatedPathSourcePlan').setData(animatedPathDataPlan);

//     // 更新 Eff 轨迹
//     animationIndexEff = newIndex;
//     animatedPathDataEff.geometry.coordinates = linesEff.slice(Math.max(0, newIndex - trailLengthEff + 1), newIndex + 1);
//     map.getSource('animatedPathSourceEff').setData(animatedPathDataEff);

//     // 更新标签
//     const progress = (newIndex / (linesPlan.length - 1)) * 100;
//     document.getElementById('timelineLabel').textContent = `${Math.round(progress)}%`;
// });


let mapTrackMode = 'auto';  // default

const trackToggle = document.getElementById('mapTrackToggle');
const trackLabel = document.getElementById('mapTrackLabel');

trackToggle.addEventListener('change', () => {
    if (trackToggle.checked) {
        mapTrackMode = 'auto';
        trackLabel.textContent = 'Auto-Track';
    } else {
        mapTrackMode = 'manual';
    }
});

//For Start point/ End point
function updatePointIconVisibility() {
    const planChecked = document.getElementById('toggleSEPointPlan').checked;
    const effChecked = document.getElementById('toggleSEPointEff').checked;

    if (map.getLayer('point-icons-plan-layer')) {
        map.setLayoutProperty('point-icons-plan-layer', 'visibility', planChecked ? 'visible' : 'none');
    }
    if (map.getLayer('point-icons-eff-layer')) {
        map.setLayoutProperty('point-icons-eff-layer', 'visibility', effChecked ? 'visible' : 'none');
    }
}

document.getElementById('toggleSEPointPlan').addEventListener('change', updatePointIconVisibility);
document.getElementById('toggleSEPointEff').addEventListener('change', updatePointIconVisibility);