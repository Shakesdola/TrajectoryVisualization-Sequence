const sourcePaths = {
    Source1: {
        mergedData: 'data/dataSource/Source1/merged_data_EFF.json',
        geoEff: 'data/dataSource/Source1/geo_eff.geojson',
        geoPlan: 'data/dataSource/Source1/geo_plan.geojson',
        timelineData: 'data/dataSource/Source1/figure_timeline.json',
        spatialData: 'data/dataSource/Source1/figure_spatial.json'
    },
    Source2: {
        mergedData: 'data/dataSource/Source2/merged_data_EFF.json',
        geoEff: 'data/dataSource/Source2/geo_eff.geojson',
        geoPlan: 'data/dataSource/Source2/geo_plan.geojson',
        timelineData: 'data/dataSource/Source2/figure_timeline.json',
        spatialData: 'data/dataSource/Source2/figure_spatial.json'
    },
    Source3: {
        mergedData: 'data/dataSource/Source3/merged_data_EFF.json',
        geoEff: 'data/dataSource/Source3/geo_eff.geojson',
        geoPlan: 'data/dataSource/Source3/geo_plan.geojson',
        timelineData: 'data/dataSource/Source3/figure_timeline.json',
        spatialData: 'data/dataSource/Source3/figure_spatial.json'
    }
};

// 默认选择 Source1
let selectedSource = 'Source1';

// 获取当前选择的数据路径
function getSourcePath(type) {
    return sourcePaths[selectedSource][type];
}

// 更新当前选择的源
function setSource(sourceName) {
    selectedSource = sourceName;
}

window.sourceLoader = {
    getSourcePath,
    setSource
};
