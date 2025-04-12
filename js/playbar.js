// 获取 DOM 元素
const sliderPlan = document.getElementById('playbarSliderPlan');
const sliderEff = document.getElementById('playbarSliderEff');
const sliderRowPlan = document.querySelector('.slider-row-plan');
const sliderRowEff = document.querySelector('.slider-row-eff');

// Helper: 获取当前动画模式
function getAnimationMode() {
    if (document.getElementById('toggleAnimationPlan').checked) return 'Plan';
    if (document.getElementById('toggleAnimationEff').checked) return 'Eff';
    return 'Both';
}

// 设置滑块 thumb 样式
function updateSliderThumbColor(mode) {
    sliderPlan.classList.remove('plan-thumb', 'eff-thumb', 'both-thumb');
    sliderEff.classList.remove('plan-thumb', 'eff-thumb', 'both-thumb');

    if (mode === 'Plan') {
        sliderPlan.classList.add('plan-thumb');
    } else if (mode === 'Eff') {
        sliderEff.classList.add('eff-thumb');
    } else {
        sliderPlan.classList.add('both-thumb');
        sliderEff.classList.add('both-thumb');
    }
}


// 配置滑块（max值、可见性、thumb颜色等）
function updateSliderConfig() {
    const mode = getAnimationMode();
    updateSliderThumbColor(mode);

    let maxVal;

    if (mode === 'Plan') {
        maxVal = linesPlan.length - 1;
        sliderRowPlan.style.display = 'flex';  // or 'block' depending on your layout
        sliderRowEff.style.display = 'none';
        sliderPlan.max = maxVal;

        sliderPlan.style.width = '100%';
    } else if (mode === 'Eff') {
        maxVal = linesEff.length - 1;
        sliderRowPlan.style.display = 'none';
        sliderRowEff.style.display = 'flex';  // or 'block' depending on your layout
        sliderEff.max = maxVal;

        sliderEff.style.width = '100%';
    } else {
        const maxPlan = linesPlan.length - 1;
        const maxEff = linesEff.length - 1;
        maxVal = Math.max(maxPlan, maxEff);

        sliderRowPlan.style.display = 'flex';
        sliderRowEff.style.display = 'flex';
        // 设置 max 值
        sliderPlan.max = maxPlan;
        sliderEff.max = maxEff;

        // 设置 slider 的可视长度按比例显示
        const widthPlan = (linesPlan.length / (maxVal+1)) * 100;
        const widthEff = (linesEff.length / (maxVal+1)) * 100;
        console.log("宽度Plan",widthPlan)
        console.log("宽度Eff",widthEff)

        sliderPlan.style.width = `${widthPlan}%`;
        sliderEff.style.width = `${widthEff}%`;

        // 可选：对齐 sliderPlan 到左边，sliderEff 到右边
        sliderPlan.style.float = 'left';
        sliderEff.style.float = 'left'; // 保持对齐
    }

    return maxVal;
}


// 更新动画状态
function updateAnimation(index) {
    const mode = getAnimationMode();

    if (mode === 'Plan') {
        if (index >= linesPlan.length) stopAnimationPlan();
        updatePlan(index);
        isPlayingEff = false;
        endPlayingEff = true;
        console.log("INDEXplan", index);
    } else if (mode === 'Eff') {
        if (index >= linesEff.length) stopAnimationEff();
        updateEff(index);
        isPlayingPlan = false;
        endPlayingPlan = true;
        console.log("INDEXeff", index);
    } else if (mode === 'Both') {
        if (index < linesPlan.length - 1) {
            updatePlan(index);
        } else {
            updatePlan(linesPlan.length - 2);
            console.log("⚠️ Plan 超出");
        }

        if (index < linesEff.length) {
            updateEff(index);
        } else {
            updateEff(linesEff.length - 2);
            console.log("⚠️ Eff 超出");
        }

        if (endPlayingPlan && isPlayingEff) updatePlan(index);
        if (endPlayingEff && isPlayingPlan) updateEff(index);
        if (endPlayingPlan && endPlayingEff) {
            animationIndexPlan = 0;
            animationIndexEff = 0;
            updateAnimation(0);
        }
    }
}

// 更新轨迹线和图标
function updatePlan(index) {
    endPlayingPlan = false;
    animationIndexPlan = index;
    animatedPathDataPlan.geometry.coordinates = linesPlan.slice(
        Math.max(0, index - trailLengthPlan + 1), index + 1
    );
    map.getSource('animatedPathSourcePlan')?.setData(animatedPathDataPlan);

    const trail = animatedPathDataPlan.geometry.coordinates;
    if (trail.length > 0) {
        animatedPathIconPlan.geometry.coordinates = trail[trail.length - 1];
        map.getSource('plan-icon-source')?.setData(animatedPathIconPlan);
    }
}

function updateEff(index) {
    animationIndexEff = index;
    animatedPathDataEff.geometry.coordinates = linesEff.slice(
        Math.max(0, index - trailLengthEff + 1), index + 1
    );
    map.getSource('animatedPathSourceEff')?.setData(animatedPathDataEff);

    const trail = animatedPathDataEff.geometry.coordinates;
    if (trail.length > 0) {
        animatedPathIconEff.geometry.coordinates = trail[trail.length - 1];
        map.getSource('eff-icon-source')?.setData(animatedPathIconEff);
    }
}

// 滑块填充颜色
function updateSliderFill(slider) {
    const value = (slider.value - slider.min) / (slider.max - slider.min) * 100;
    slider.style.background = `linear-gradient(to right, var(--track-fill) 0%, var(--track-fill) ${value}%, #ddd ${value}%, #ddd 100%)`;
}

// 给滑块绑定交互事件
// 为 Plan 滑块设置事件
function setupSliderPlanEvents() {
    // sliderPlan.addEventListener('mousedown', () => {
    //     const currentMode = getAnimationMode();
    //     if (currentMode === 'Plan' || currentMode === 'Both') {
    //         pauseAnimationPlan();
    //     }
    //     if (currentMode === 'Both') {
    //         pauseAnimationEff();
    //     }
    // });

    // sliderPlan.addEventListener('mouseup', () => {
    //     const currentMode = getAnimationMode();
    //     if (currentMode === 'Plan' || currentMode === 'Both') {
    //         playAnimationPlan();
    //     }
    //     if (currentMode === 'Both') {
    //         playAnimationEff();
    //     }
    // });

    sliderPlan.addEventListener('input', function(event) {
        const newIndex = parseInt(event.target.value, 10);
        const currentMode = getAnimationMode();

        if (newIndex === linesPlan.length) {
            stopAnimationPlan();
            updatePlan(newIndex - 3);
        }

        if (currentMode === 'Both') {
            const effIndex = Math.floor(
                (newIndex / (linesPlan.length - 1)) * (linesEff.length - 1)
            );
            sliderEff.value = effIndex;
            updateEff(effIndex);
        }

        updatePlan(newIndex);
        updateSliderFill(sliderPlan);
    });
}


// 为 Eff 滑块设置事件
function setupSliderEffEvents() {
    // sliderEff.addEventListener('mousedown', () => {
    //     const currentMode = getAnimationMode();
    //     if (currentMode === 'Eff' || currentMode === 'Both') {
    //         pauseAnimationEff();
    //     }
    //     if (currentMode === 'Both') {
    //         pauseAnimationPlan();
    //     }
    // });

    // sliderEff.addEventListener('mouseup', () => {
    //     const currentMode = getAnimationMode();
    //     if (currentMode === 'Eff' || currentMode === 'Both') {
    //         playAnimationEff();
    //     }
    //     if (currentMode === 'Both') {
    //         playAnimationPlan();
    //     }
    // });

    sliderEff.addEventListener('input', function(event) {
        const newIndex = parseInt(event.target.value, 10);
        const currentMode = getAnimationMode();

        if (newIndex === linesEff.length) {
            stopAnimationEff();
            updateEff(newIndex - 3);
        }

        if (currentMode === 'Both') {
            const planIndex = Math.floor(
                (newIndex / (linesEff.length - 1)) * (linesPlan.length - 1)
            );
            sliderPlan.value = planIndex;
            updatePlan(planIndex);
        }

        updateEff(newIndex);
        updateSliderFill(sliderEff);
    });
}


// // 初始化时调用这两个函数
// function initSliders() {
//     setupSliderPlanEvents();
//     setupSliderEffEvents();
// }

['toggleAnimationPlan', 'toggleAnimationEff', 'toggleAnimationBoth'].forEach(id => {
    document.getElementById(id).addEventListener('change', () => {
        updateSliderConfig();
        // updateAnimation(0);
    });
});

// setTimeout(() => {
//     updateSliderConfig();
//     updateAnimation(0);
//     updateSliderFill(sliderPlan);
//     updateSliderFill(sliderEff);
// }, 100);

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

            setTimeout(() => {
                updateSliderConfig();
                updateAnimation(0);
                updateSliderFill(sliderPlan);
                updateSliderFill(sliderEff); 
                
            }, 100);
                    // 初始化
            sliderPlan.value = 0;
            sliderEff.value = 0;
            setupSliderPlanEvents();
            setupSliderEffEvents(); 
        } else {
            alert('Error update source for InfoPanel: ' + data.message);
        }
    })
    .catch(error => console.error('Error:', error));
});


function resetToDefaultSource() {
    fetch('/reset-source', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => response.json())

    .then(data => {
        console.log('Source reset response:', data);
        if (data.status === 'success') {
            console.log('Playbar reset to default source: Source 1.');
            setTimeout(() => {
                updateSliderConfig();
                updateAnimation(0);
                updateSliderFill(sliderPlan);
                updateSliderFill(sliderEff);
                
            }, 100);
            // 初始化
            // 初始化
            sliderPlan.value = 0;
            sliderEff.value = 0;
            setupSliderPlanEvents();
            setupSliderEffEvents();  
        } else {
            throw new Error('Failed to reset XX');
        }
    })
    .catch(error => console.error('Error resetting source for XX:', error));
}

// 页面加载时先执行 resetToDefaultSource
resetToDefaultSource();
