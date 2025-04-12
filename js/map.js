mapboxgl.accessToken = 'pk.eyJ1IjoiamlheGluZ3hpbmciLCJhIjoiY200bGVteW5vMDB4bjJscXl6a3lzM2tuayJ9.bLKO3JtC4ryfRh-EtY-chw';

const map = new mapboxgl.Map({
    container: 'mapView',
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [6.1397, 46.1990],
    zoom: 15
});

window.map = map;






// // 下拉框选择事件
// document.getElementById('sourceSelector').addEventListener('change', function(event) {
//     const selectedSource = event.target.value;

//     // 更新 sourceLoader 的数据源
//     window.sourceLoader.setSource(selectedSource);

//     // 重新加载数据
//     // loadDataForSource();

    
//     document.getElementById('toggleSEPointPlan').checked = true;
//     document.getElementById('toggleSEPointEff').checked = true;
//     setTimeout(() => {
//         updatePointIconVisibility();
//     }, 300);

    // // 发送数据到后端
    // fetch('/update-source', {
    //     method: 'POST', // 通过POST方法发送数据
    //     headers: {
    //         'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({ selectedSource: selectedSource }) // 将数据源路径传递给后端
    // })
    // .then(response => response.json())
    // .then(data => {
    //     // 后端返回的响应
    //     console.log('Server response:', data);
    // })
    // .catch(error => {
    //     console.error('Error sending data:', error);
    // });

    // fetch('/run_scripts', {
    //     method: 'POST'
    // })
    // .then(response => response.json())
    // .then(data => {
    //     console.log('Response data:', data);
    //     if (data.status === 'success') {
    //         //alert('Scripts executed successfully!');
    //     } else {
    //         alert('Error executing scripts: ' + data.message);
    //     }
    // })
    // .catch(error => console.error('Error running scripts:', error));

// });


document.getElementById('tourOverviewButton').addEventListener('click', () => {
    // Combine all coordinates from both planned and effective lines
    const allCoordinates = [
        ...filteredLinesPlan,
        ...filteredLinesEff
    ];

    if (allCoordinates.length === 0) return;

    const bounds = allCoordinates.reduce((b, coord) => {
        return b.extend(coord);
    }, new mapboxgl.LngLatBounds(allCoordinates[0], allCoordinates[0]));

    map.fitBounds(bounds, {
        padding: 20,
        linear: true,
        duration: 1000
    });
});

document.getElementById('satelliteButton').addEventListener('click', () => {
    let currentStyle = map.getStyle().name; // 获取当前地图样式的名称
    console.log("map",currentStyle)
    document.getElementById('playPauseButton').innerHTML=playIcon;
    isPlayingPlan = false;
    isPlayingEff = false;
    document.getElementById('toggleMapPlan').checked = true;
    document.getElementById('toggleMapEff').checked = true;
    updateBanner();

    // 切换为卫星视图或街道视图
    if (currentStyle === 'Mapbox Streets') {
        map.setStyle('mapbox://styles/mapbox/satellite-streets-v12'); // 设置为卫星地图
        console.log("map1",currentStyle)
    } else if (currentStyle === 'Mapbox Satellite Streets') {
        map.setStyle('mapbox://styles/mapbox/streets-v12'); // 设置为街道地图
        console.log("map2",currentStyle)
    }

    setTimeout(() => {
        if (window.map) window.map.resize(); // 重新调整大小
        mapView.classList.remove("hidden"); // 显示
        loadDataTrajectory();
        loadDataParcel();
    }, 300);
});


document.getElementById("collapseButton").addEventListener("click", function() {
    let figureGroup = document.getElementById("figureGroup");
    let button = document.getElementById("collapseButton");

    figureGroup.classList.toggle("collapse");

    // 切换按钮文本的箭头方向
    if (figureGroup.classList.contains("collapse")) {
        button.innerHTML = `<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
 <path d="M18 15L12 9L6 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
 </svg>`; // 变成向下箭头，表示已折叠
    } else {
        button.innerHTML = `<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
 <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
 </svg>`; // 变成向上箭头，表示已展开
    setTimeout(() => {
        updateSequenceData();
    }, 300);
     
    }

    let mapView = document.getElementById("mapView");
    mapView.classList.add("hidden"); // 隐藏
    setTimeout(() => {
        if (window.map) window.map.resize(); // 重新调整大小
        mapView.classList.remove("hidden"); // 显示
    }, 300);

});



document.getElementById("infocollapseButton").addEventListener("click", function() {
    let infoPanel = document.getElementById("infoPanel");
    let infocollapseButton = document.getElementById("infocollapseButton");
    let figureGroup = document.getElementById("figureGroup");

    infoPanel.classList.toggle("collapse");

    // 切换按钮文本的箭头方向
    if (infoPanel.classList.contains("collapse")) {

        infocollapseButton.innerHTML = `<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`; // 变成向下箭头，表示已折叠
    } else {

        infocollapseButton.innerHTML = `<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`; // 变成向上箭头，表示已展开
    }

    let mapView = document.getElementById("mapView");
    mapView.classList.add("hidden"); // 隐藏
    setTimeout(() => {

        // 重新调整 Plotly 图表大小
        let plotlyChart = document.getElementById("plotlyChart");
        if (plotlyChart && typeof Plotly !== "undefined") {
            Plotly.Plots.resize(plotlyChart); // 调用 Plotly 的 resize 方法
        }
        let timelineChart = document.getElementById("timelineChart");
        if (timelineChart && typeof Plotly !== "undefined") {
            Plotly.Plots.resize(timelineChart); // 调用 Plotly 的 resize 方法
        }

        if (window.map) window.map.resize(); // 重新调整大小
        mapView.classList.remove("hidden"); // 显示
    }, 300);




});

// 导出 map 实例供其他文件使用
window.map = map;
