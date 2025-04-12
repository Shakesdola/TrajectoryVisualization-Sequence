function loadDataInfoPanel() {


    // 加载 JSON 文件并处理数据
    const sourcePath_timeline = window.sourceLoader.getSourcePath('timelineData')
    fetch(sourcePath_timeline)
    .then(response => response.json())
    .then(data => {
        const totalParcelNumber = data.length;
        document.getElementById('totalParcelNumber').innerHTML=`
        ${totalParcelNumber} PARCELS
        `;

        // 提取 plan_time 和 eff_time 并转换为 Date 对象
        const planTimes = data.map(item => new Date(item.plan_time));
        const effTimes = data.map(item => new Date(item.eff_time));

        // 找到最小和最大的 plan_time
        const minPlanTime = new Date(Math.min(...planTimes));
        const maxPlanTime = new Date(Math.max(...planTimes));

        // 找到最小和最大的 eff_time
        const minEffTime = new Date(Math.min(...effTimes));
        const maxEffTime = new Date(Math.max(...effTimes));

        // 计算时间差值（Completion Time）
        const planCompletionTime = (maxPlanTime - minPlanTime) / (1000 * 60 * 60); // 转换为小时
        const effCompletionTime = (maxEffTime - minEffTime) / (1000 * 60 * 60); // 转换为小时


        // 计算 eff 和 plan 的差值
        const timeDifference = (effCompletionTime - planCompletionTime).toFixed(2);
        // 格式化日期（只显示日期）
        const formatDate = (date) => date.toLocaleDateString(); // 输出 "YYYY/MM/DD"
        const formatTime = (date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // 输出 "HH:mm"


        document.getElementById('yymmdd').innerHTML = `
            ${formatDate(minPlanTime)}

        `;


        // 更新 <p> 元素的内容
        const detailsParagraph = document.getElementById('infos-time');
        detailsParagraph.innerHTML = `
            
            <strong>Planned:</strong>  ${formatTime(minPlanTime)}
            -  ${formatTime(maxPlanTime)}
            <span class="text-to-right">${planCompletionTime.toFixed(2)} hour</span>
            <br>
            <strong>Effective:</strong> ${formatTime(minEffTime)}
            - ${formatTime(maxEffTime)}
            <span>${effCompletionTime.toFixed(2)} hour</span>

        `;

        document.getElementById('infos-time-deviation').innerHTML=`
            ${timeDifference >= 0 ? '+' : ''}${timeDifference} Hours
        `;

        // 提取 plan_ordinal 和 eff_ordinal
        const planSeq = data.map(item => item.plan_ordinal);
        const realSeq = data.map(item => item.eff_ordinal);

        // // 计算 LCS 和匹配度
        // const { lcsLength, matchRatio, lcs } = longestCommonSubsequence(planSeq, realSeq);

        // // 显示匹配度
        // const similarityParagraph = document.getElementById('infos-similarity');
        // similarityParagraph.innerHTML = `
        //     <strong>Trajectory Similarity:</strong> ${(matchRatio * 100).toFixed(2)}%<br>
        // `;
    })
    .catch(error => {
        console.error('Error loading or processing data:', error);
        const detailsParagraph = document.getElementById('details');
        detailsParagraph.textContent = 'Failed to load data.';
    });

    // 加载 JSON 文件并处理数据
    const sourcePath_spatial = window.sourceLoader.getSourcePath('spatialData')
    fetch(sourcePath_spatial)
    .then(response => response.json())
    .then(data => {
        const planTotalDistance = data.plan_total_distance;
        const effTotalDistance = data.eff_total_distance;
        const spaceDifference = (effTotalDistance - planTotalDistance).toFixed(2)

        // 更新 <p> 元素的内容
        const detailsParagraph = document.getElementById('infos-distance');
        detailsParagraph.innerHTML = `
            
            <strong>Planned:</strong> <span>${planTotalDistance.toFixed(2)} km</span><br>
            
            <strong>Effective: </strong> <span>${effTotalDistance.toFixed(2)} km</span><br>
           
        `;

        document.getElementById('infos-distance-deviation').innerHTML= `
            ${spaceDifference >= 0 ? '+' : ''}${spaceDifference} KM
            `;

            const similarity = data.similarity
            // 显示匹配度
        const similarityParagraph = document.getElementById('infos-similarity');
        similarityParagraph.innerHTML = `
            Similarity to Plan: ${(similarity * 100).toFixed(2)}%<br>
        `;
    })
    .catch(error => {
        console.error('Error loading or processing data:', error);
        const detailsParagraph = document.getElementById('details');
        detailsParagraph.textContent = 'Failed to load data.';
    });

    // Reset checkboxes to default values
    document.getElementById('toggleMapPlan').checked = true;  // Set "Show Plan Trajectory" to checked
    document.getElementById('toggleMapEff').checked = true;   // Set "Show Effective Trajectory" to checked
    document.getElementById('toggleAnimationPlan').checked = false; // Set "Animation Plan" to unchecked
    document.getElementById('toggleAnimationEff').checked = false;  // Set "Animation Effective" to unchecked
    document.getElementById('toggleAnimationBoth').checked = true; // Set "Animation Plan + Effective" to unchecked

}



document.querySelectorAll('.toggle-btn').forEach(button => {
    // 创建工具提示元素
    const tooltip = document.createElement('span');
    tooltip.className = 'toggle-tooltip';
    

    // 预先创建图标（避免每次点击都创建）
    const expandIcon = document.createElement('img');
    expandIcon.src = 'https://img.icons8.com/external-dashed-line-kawalan-studio/24/1A1A1A/external-expand-arrows-dashed-line-kawalan-studio.png';
    expandIcon.width = 17;
    expandIcon.height = 17;
    expandIcon.alt = 'Expand';

    const collapseIcon = document.createElement('img');
    collapseIcon.src = 'https://img.icons8.com/ios-glyphs/30/1A1A1A/compress--v1.png';
    collapseIcon.width = 17;
    collapseIcon.height = 17;
    collapseIcon.alt = 'Hide';

    // 初始化状态
    const section = button.closest('.info-section');
    const content = section.querySelector('.info-content');
    const isExpanded = button.getAttribute('aria-expanded') === 'true';
    content.style.display = isExpanded ? 'block' : 'none';
    button.innerHTML = ''; // 清空按钮内容
    button.appendChild(isExpanded ? collapseIcon : expandIcon);
    
    button.appendChild(tooltip);
    tooltip.textContent = isExpanded ? 'Hide' : 'Expand';
    button.style.position = 'relative'; // 为工具提示定位

    button.addEventListener('mouseenter', () => {
        tooltip.style.opacity = '1';
    });
    button.addEventListener('mouseleave', () => {
        tooltip.style.opacity = '0';
    });


    button.addEventListener('click', (e) => {
        e.stopPropagation();
        const isExpanded = button.getAttribute('aria-expanded') === 'true';
        
        // 切换内容显示
        content.style.display = isExpanded ? 'none' : 'block';
        button.setAttribute('aria-expanded', !isExpanded);
        
        // 正确切换图标
        button.innerHTML = ''; // 先清空
        button.appendChild(isExpanded ? expandIcon : collapseIcon); // 添加新图标

        tooltip.textContent = isExpanded ? 'Expand' : 'Hide';
        button.appendChild(tooltip);
    });
    
    // 更健壮的标题点击处理
    const header = button.closest('.infos-title');
    if (header) {
        header.addEventListener('click', (e) => {
            if (!button.contains(e.target)) {
                button.click();
            }
        });
    }
});


// 页面加载时先重置数据源并更新数据
function resetToDefaultSource() {
    fetch('/reset-source', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => response.json())

    .then(data => {
        if (data.status === 'success') {
            console.log('InfoPanel reset to default source: Source 1.');
            loadDataInfoPanel();  // 确保图表使用最新数据

        } else {
            console.error('Failed to reset InfoPanel');
        }
    })
    .catch(error => console.error('Error resetting source for InfoPanel:', error));
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
        if (data.status === 'success') {
            console.log('InfoPanel updated to:', selectedSource);

            // **等待后端数据生成完成后，再加载数据**
            loadDataInfoPanel();
            updateBanner();
        } else {
            alert('Error update source for InfoPanel: ' + data.message);
        }
    })
    .catch(error => console.error('Error:', error));
});



// //Button for running the script and generate files saved into folder
// document.getElementById("runScriptsButton").addEventListener("click", function() {
//     fetch("/run_scripts", {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json"
//         }
//     })
//     .then(response => response.json())
//     .then(data => {

//         console.log("Response:", data);
//     })
//     .catch(error => {
//         console.error("Error:", error);
//     });
// });



// 获取问号图标和弹窗
const helpIcon1 = document.getElementById('helpIcon1');
const helpModal1 = document.getElementById('helpModal1');

// 显示弹窗 TIMELINE
helpIcon1.addEventListener('click', function() {
    helpModal1.style.display = 'block';
    // closeHelpModal2();
    closeHelpModal3();
});

// 关闭弹窗
function closeHelpModal1() {
    helpModal1.style.display = 'none';
}

// // 获取问号图标和弹窗
// const helpIcon2 = document.getElementById('helpIcon2');
// const helpModal2 = document.getElementById('helpModal2');

// // 显示弹窗
// helpIcon2.addEventListener('click', function() {
//     helpModal2.style.display = 'block';
//     closeHelpModal1();
//     closeHelpModal3();
// });

// // 关闭弹窗
// function closeHelpModal2() {
//     helpModal2.style.display = 'none';
// }

// 获取问号图标和弹窗
const helpIcon3 = document.getElementById('helpIcon3');
const helpModal3 = document.getElementById('helpModal3');

// 显示弹窗
helpIcon3.addEventListener('click', function() {
    helpModal3.style.display = 'block';
    closeHelpModal1();
    // closeHelpModal2();
});

// 关闭弹窗
function closeHelpModal3() {
    helpModal3.style.display = 'none';
}


const mapTrackToggle = document.getElementById('mapTrackToggle');
const toggleWrapper = document.querySelector('.toggle-wrapper');

mapTrackToggle.addEventListener('change', function () {
  if (this.checked) {
    toggleWrapper.setAttribute('data-tooltip', 'Auto tracking the animation');
  } else {
    toggleWrapper.setAttribute('data-tooltip', 'User manually adjust the map');
  }
});



const dynamicBanner = document.getElementById("animation-dynamic-banner");

function updateBanner() {
  if (isPlayingPlan || isPlayingEff) {
    dynamicBanner.textContent = "ANIMATION PLAYING ";
    dynamicBanner.classList.add("blinking");
  } else {
    dynamicBanner.textContent = "Animation Off";
    dynamicBanner.classList.remove("blinking");
  }
}