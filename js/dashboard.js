const dashboardView = {
    currentFilter: 'all',

    getDynamicData(filterVal) {
        // ✅ 변경: DB.getHostStats() 호출 (기존: 직접 hosts 순회)
        const stats = DB.getHostStats(filterVal);

        // ✅ 변경: DB.getHosts()로 필터 (기존: app.hosts 직접 필터)
        let filtered = DB.getHosts();
        if (filterVal === 'vip') filtered = filtered.filter(h => h.isVip);
        if (filterVal === 'gen') filtered = filtered.filter(h => !h.isVip);

        const lineErr = [Math.max(0, stats.error-2), 0, 0, Math.max(0, stats.error-1), stats.error, 0];
        const lineWarn = [Math.max(0, stats.warn-3), Math.max(0, stats.warn-5), Math.max(0, stats.warn-2), Math.max(0, stats.warn-4), stats.warn, Math.max(0, stats.warn-6)];

        // ✅ 변경: DB.getAlertLogs() 호출 (기존: app.logs 직접 필터)
        const filteredIds = filtered.map(h => h.id);
        const filteredLogs = DB.getAlertLogs(filteredIds, 3);

        // ✅ 변경: DB.getB2B(), DB.getTax() 호출 (기존: dataViews.getB2BData())
        const b2bData = DB.getB2B();
        const taxData = DB.getTax();
        const b2bCount = filterVal === 'vip' ? Math.floor(b2bData.length * 0.15) : (filterVal === 'gen' ? Math.floor(b2bData.length * 0.85) : b2bData.length);
        const taxCount = filterVal === 'vip' ? Math.floor(taxData.length * 0.15) : (filterVal === 'gen' ? Math.floor(taxData.length * 0.85) : taxData.length);

        return {
            uptime: stats.uptime, normal: stats.normal, total: stats.total, error: stats.error, warn: stats.warn, recovery: stats.recovery,
            persistent: stats.persistent || 0,
            lineErr, lineWarn, dough: [stats.normal, stats.warn, stats.error],
            logs: filteredLogs, b2bCount, taxCount, isVip: filterVal === 'vip',
            todayErrors: DB.getTodayErrors(),
            repeatOffenders: DB.getRepeatOffenders(7).slice(0, 5)
        };
    },

    render() {
        const d = this.getDynamicData(this.currentFilter);
        return `
        <div class="max-w-[1400px] mx-auto">
            <div class="flex justify-between items-center mb-5">
                <div class="flex space-x-2">
                    <select id="group-filter" onchange="dashboardView.updateFilter(this.value)" class="text-xs border border-slate-300 rounded px-3 py-1.5 bg-white text-slate-700 outline-none focus:border-teal-500 font-bold shadow-sm cursor-pointer hover:border-teal-400 transition">
                        <option value="all" ${this.currentFilter==='all'?'selected':''}>전체 고객사 그룹</option>
                        <option value="vip" ${this.currentFilter==='vip'?'selected':''}>VIP 등급 고객사 (집중관제)</option>
                        <option value="gen" ${this.currentFilter==='gen'?'selected':''}>일반 등급 고객사</option>
                    </select>
                    <select class="text-xs border border-slate-300 rounded px-3 py-1.5 bg-white text-slate-700 outline-none focus:border-teal-500 font-medium shadow-sm">
                        <option>오늘 (당일)</option><option>최근 7일</option><option>이번 달</option>
                    </select>
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-5" id="kpi-cards">${this.renderKPI(d)}</div>
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-5">
                <div class="lg:col-span-8 bg-white border border-slate-200 rounded flex flex-col shadow-sm">
                    <div class="px-5 py-3 border-b border-slate-100 flex justify-between items-center"><h3 class="text-[13px] font-bold text-slate-800">시간대별 트래픽 및 장애 발생 추이<span class="info-tip"><i class="fa-solid fa-circle-info"></i><span class="tip-box"><b>수집:</b> Agent Flag 수신 로그 (최근 7일)<br>일별 장애 건수를 라인 차트로 표시합니다.</span></span></h3></div>
                    <div class="p-5 flex-1 min-h-[260px] relative"><canvas id="mainLineChart"></canvas></div>
                </div>
                <div class="lg:col-span-4 bg-white border border-slate-200 rounded flex flex-col shadow-sm">
                    <div class="px-5 py-3 border-b border-slate-100"><h3 class="text-[13px] font-bold text-slate-800">단말 실시간 상태 분포도<span class="info-tip"><i class="fa-solid fa-circle-info"></i><span class="tip-box"><b>수집:</b> 전체 Agent Flag 수신 상태<br>300대 단말을 정상/주의/장애/지속장애로 분류한 도넛 차트입니다.</span></span></h3></div>
                    <div class="p-5 flex-1 flex flex-col">
                        <div class="h-[150px] relative flex justify-center items-center mb-5"><canvas id="mainDoughnutChart"></canvas></div>
                        <div class="space-y-2 mt-auto" id="doughnut-legend">${this.renderLegend(d)}</div>
                    </div>
                </div>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
                <div class="bg-white border border-slate-200 rounded overflow-hidden shadow-sm">
                    <div class="px-4 py-3 border-b border-slate-200 bg-red-50 flex justify-between items-center">
                        <h3 class="text-[13px] font-bold text-red-700"><i class="fa-solid fa-triangle-exclamation mr-1.5"></i>금일 장애 현황<span class="info-tip"><i class="fa-solid fa-circle-info"></i><span class="tip-box"><b>판정:</b> Flag 미수신 30분+<br>오늘 장애 판정된 고객사 목록입니다.</span></span></h3>
                        <span class="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold">${d.todayErrors.length}건</span>
                    </div>
                    <div class="max-h-[200px] overflow-y-auto" id="today-errors">${this.renderTodayErrors(d.todayErrors)}</div>
                </div>
                <div class="bg-white border border-slate-200 rounded overflow-hidden shadow-sm">
                    <div class="px-4 py-3 border-b border-slate-200 bg-amber-50 flex justify-between items-center">
                        <h3 class="text-[13px] font-bold text-amber-700"><i class="fa-solid fa-repeat mr-1.5"></i>반복 장애 고객 (7일)<span class="info-tip"><i class="fa-solid fa-circle-info"></i><span class="tip-box"><b>판정:</b> 7일 내 2회+ 장애<br>반복 장애 고객사입니다. 인프라 점검이 필요합니다.</span></span></h3>
                        <span class="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-bold">${d.repeatOffenders.length}건</span>
                    </div>
                    <div class="max-h-[200px] overflow-y-auto" id="repeat-offenders">${this.renderRepeatOffenders(d.repeatOffenders)}</div>
                </div>
                <div class="bg-white border border-slate-200 rounded overflow-hidden shadow-sm">
                    <div class="px-4 py-3 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                        <h3 class="text-[13px] font-bold text-slate-800"><i class="fa-solid fa-bell mr-1.5"></i>최근 시스템 알람<span class="info-tip"><i class="fa-solid fa-circle-info"></i><span class="tip-box"><b>수집:</b> Agent Flag 이벤트 로그<br>최근 시스템 이벤트(장애, 복구, 재구동)를 시간순으로 표시합니다.</span></span></h3>
                        <a href="#" onclick="app.loadView('flagHistory', document.querySelectorAll('[data-menu]')[2])" class="text-[11px] text-teal-600 font-bold hover:underline">전체 &rarr;</a>
                    </div>
                    <div class="max-h-[200px] overflow-y-auto">
                        <table class="w-full text-left border-collapse"><thead class="bg-white text-[11px] text-slate-500 border-b border-slate-200"><tr><th class="px-4 py-2 font-bold">시간</th><th class="px-4 py-2 font-bold">고객사</th><th class="px-4 py-2 font-bold">내용</th></tr></thead><tbody class="text-xs text-slate-700 divide-y divide-slate-100" id="alarm-table">${this.renderAlarms(d.logs)}</tbody></table>
                    </div>
                </div>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div class="px-4 py-3 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                        <h3 class="text-[13px] font-bold text-slate-800">금일 마케팅 데이터 수집 현황<span class="info-tip"><i class="fa-solid fa-circle-info"></i><span class="tip-box"><b>수집:</b> 자산현황, B2B거래, 카드승인, 세금계산서<br>CMS Agent가 수집한 금융 데이터 건수입니다.</span></span></h3>
                        <span class="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-bold">자동 수집 중</span>
                    </div>
                    <div class="grid grid-cols-4 gap-3 p-4" id="marketing-data">${this.renderMarketingStats(d)}</div>
                </div>
            </div>
        </div>`;
    },

    renderKPI(d) {
        return `
        <div onclick="app.loadView('pcStatus', document.querySelectorAll('[data-menu]')[1])" class="bg-white border border-slate-200 rounded p-5 shadow-sm cursor-pointer hover:border-teal-400 hover:shadow-md transition">
            <p class="text-[12px] font-bold text-slate-500 mb-1">전체 시스템 가동률</p>
            <div class="flex items-end space-x-2 mb-2"><h3 class="text-3xl font-bold text-slate-800 tracking-tighter">${d.uptime}<span class="text-lg font-medium text-slate-500 ml-0.5">%</span></h3></div>
            <div class="text-[11px] ${d.uptime === '100.00' ? 'text-blue-600' : 'text-teal-600'} font-bold flex items-center"><i class="fa-solid fa-arrow-up mr-1"></i>안정적 유지 중</div>
        </div>
        <div onclick="app.loadView('pcStatus', document.querySelectorAll('[data-menu]')[1])" class="bg-white border border-slate-200 rounded p-5 shadow-sm cursor-pointer hover:border-teal-400 hover:shadow-md transition">
            <p class="text-[12px] font-bold text-slate-500 mb-1">정상 통신 단말 (Agent)</p>
            <div class="flex items-end space-x-2 mb-2"><h3 class="text-3xl font-bold text-slate-800 tracking-tighter">${d.normal}<span class="text-lg font-medium text-slate-400 ml-1">/ ${d.total}대</span></h3></div>
            <div class="text-[11px] text-slate-500 font-medium">대상 단말 기준 점유율</div>
        </div>
        <div onclick="app.loadViewWithFilter('pcStatus', 'critical')" class="bg-white border border-${d.error > 0 ? 'red-200' : 'slate-200'} rounded p-5 shadow-sm border-l-4 border-l-${d.error > 0 ? 'red-500' : 'slate-200'} cursor-pointer hover:border-red-400 hover:shadow-md transition">
            <p class="text-[12px] font-bold ${d.error > 0 ? 'text-red-600' : 'text-slate-500'} mb-1">즉시 조치 필요 (장애)</p>
            <div class="flex items-end space-x-2 mb-2"><h3 class="text-3xl font-bold ${d.error > 0 ? 'text-red-600' : 'text-slate-800'} tracking-tighter">${d.error}<span class="text-lg font-medium text-slate-400 ml-1">건</span></h3><span class="text-[10px] text-red-500 bg-red-50 px-1 rounded ml-2">Click!</span></div>
            <div class="text-[11px] ${d.error > 0 ? 'text-red-500' : 'text-slate-400'} font-bold flex items-center">${d.error > 0 ? '<i class="fa-solid fa-circle-exclamation mr-1"></i>장애 상세 리스트 보기' : '특이사항 없음'}</div>
        </div>
        <div onclick="app.loadViewWithFilter('flagHistory', 'recovery')" class="bg-white border border-slate-200 rounded p-5 shadow-sm border-l-4 border-l-blue-500 cursor-pointer hover:border-blue-400 hover:shadow-md transition">
            <p class="text-[12px] font-bold text-slate-600 mb-1">자동 복구 성공 (Watcher)</p>
            <div class="flex items-end space-x-2 mb-2"><h3 class="text-3xl font-bold text-blue-700 tracking-tighter">${d.recovery}<span class="text-lg font-medium text-blue-400 ml-1">건</span></h3><span class="text-[10px] text-blue-500 bg-blue-50 px-1 rounded ml-2">Click!</span></div>
            <div class="text-[11px] text-blue-600 font-bold flex items-center"><i class="fa-solid fa-rotate-right mr-1"></i>자동 조치 이력 보기</div>
        </div>
        <div onclick="app.loadView('rebootView', document.querySelectorAll('[data-menu]')[3])" class="bg-white border border-${d.persistent > 0 ? 'purple-200' : 'slate-200'} rounded p-5 shadow-sm border-l-4 border-l-purple-500 cursor-pointer hover:shadow-md transition">
            <p class="text-[12px] font-bold ${d.persistent > 0 ? 'text-purple-600' : 'text-slate-500'} mb-1">지속 장애 (재구동 실패)</p>
            <div class="flex items-end space-x-2 mb-2"><h3 class="text-3xl font-bold ${d.persistent > 0 ? 'text-purple-700' : 'text-slate-800'} tracking-tighter">${d.persistent}<span class="text-lg font-medium text-slate-400 ml-1">건</span></h3></div>
            <div class="text-[11px] ${d.persistent > 0 ? 'text-purple-600' : 'text-slate-400'} font-bold">${d.persistent > 0 ? '<i class="fa-solid fa-user-shield mr-1"></i>운영자 확인 필요' : '없음'}</div>
        </div>`;
    },

    renderLegend(d) {
        return `<div class="flex justify-between items-center text-xs p-2 bg-slate-50 rounded border border-slate-100"><div class="flex items-center"><span class="w-2.5 h-2.5 rounded-full bg-teal-500 mr-2"></span><span class="font-bold text-slate-700">정상 통신 (Normal)</span></div><span class="font-bold text-slate-800">${d.normal}대</span></div><div class="flex justify-between items-center text-xs p-2 bg-slate-50 rounded border border-slate-100"><div class="flex items-center"><span class="w-2.5 h-2.5 rounded-full bg-yellow-400 mr-2"></span><span class="font-bold text-slate-700">지연 주의 (Warning)</span></div><span class="font-bold text-slate-800">${d.warn}대</span></div><div class="flex justify-between items-center text-xs p-2 ${d.error > 0 ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'} rounded border"><div class="flex items-center"><span class="w-2.5 h-2.5 rounded-full ${d.error > 0 ? 'bg-red-500' : 'bg-slate-300'} mr-2"></span><span class="font-bold ${d.error > 0 ? 'text-red-700' : 'text-slate-500'}">연결 장애 (Critical)</span></div><span class="font-bold ${d.error > 0 ? 'text-red-600' : 'text-slate-500'}">${d.error}대</span></div>`;
    },

    renderAlarms(logs) {
        if (!logs || logs.length === 0) return `<tr><td colspan="3" class="text-center py-6 text-slate-500 font-medium">해당 그룹에 최근 발생한 알람이 없습니다.</td></tr>`;
        return logs.map(log => {
            const timeStr = log.time.split(' ')[1] || log.time;
            let colorClass = 'text-blue-600';
            if(log.type === 'CRITICAL') colorClass = 'text-red-600';
            else if(log.type === 'WARNING') colorClass = 'text-yellow-600';
            return `<tr class="hover:bg-slate-50"><td class="px-4 py-2 text-slate-500 font-mono">${timeStr}</td><td class="px-4 py-2 font-bold ${colorClass}">${log.host.split(' ')[0]}</td><td class="px-4 py-2 ${colorClass} font-medium text-[11px] truncate max-w-[200px]" title="${log.msg}">${log.msg}</td></tr>`;
        }).join('');
    },

    renderMarketingStats(d) {
        const ts = DB.getTaxSummary();
        const cs = DB.getCashFlowSummary();
        return `
        <div class="border border-slate-200 rounded p-3 text-center hover:shadow-md cursor-pointer transition" onclick="app.loadView('b2bView', document.querySelectorAll('[data-menu]')[8])"><p class="text-[10px] text-slate-500 font-bold mb-0.5">전자어음 / B2B</p><h4 class="text-lg font-bold text-slate-800">${d.b2bCount}<span class="text-[10px] text-slate-400 ml-1">건</span></h4></div>
        <div class="border border-slate-200 rounded p-3 text-center hover:shadow-md cursor-pointer transition" onclick="app.loadView('taxView', document.querySelectorAll('[data-menu]')[10])"><p class="text-[10px] text-slate-500 font-bold mb-0.5">세금계산서</p><h4 class="text-lg font-bold text-slate-800">${d.taxCount}<span class="text-[10px] text-slate-400 ml-1">건</span></h4></div>
        <div class="border border-blue-200 bg-blue-50/50 rounded p-3 text-center hover:shadow-md cursor-pointer transition" onclick="app.loadView('cashFlow', document.querySelectorAll('[data-menu]')[11])"><p class="text-[10px] text-blue-600 font-bold mb-0.5">7일 입금 흐름</p><h4 class="text-lg font-bold text-blue-700">${Math.round(cs.inTotal/100000000)}<span class="text-[10px] text-blue-400 ml-1">억</span></h4></div>
        <div class="border border-teal-200 bg-teal-50/50 rounded p-3 text-center"><p class="text-[10px] text-teal-600 font-bold mb-0.5">매출 우량 타겟</p><h4 class="text-lg font-bold text-teal-700">${ts.premium}<span class="text-[10px] text-teal-400 ml-1">개사</span></h4></div>`;
    },

    updateFilter(val) {
        this.currentFilter = val;
        const d = this.getDynamicData(val);
        document.getElementById('kpi-cards').innerHTML = this.renderKPI(d);
        document.getElementById('doughnut-legend').innerHTML = this.renderLegend(d);
        document.getElementById('alarm-table').innerHTML = this.renderAlarms(d.logs);
        document.getElementById('marketing-data').innerHTML = this.renderMarketingStats(d);
        document.getElementById('today-errors').innerHTML = this.renderTodayErrors(d.todayErrors);
        document.getElementById('repeat-offenders').innerHTML = this.renderRepeatOffenders(d.repeatOffenders);
        const lineChart = app.chartInstances[0];
        const doughChart = app.chartInstances[1];
        lineChart.data.datasets[0].data = d.lineErr;
        lineChart.data.datasets[1].data = d.lineWarn;
        lineChart.update();
        doughChart.data.datasets[0].data = d.dough;
        doughChart.update();
    },

    renderTodayErrors(errors) {
        if (!errors || !errors.length) return `<div class="text-center py-6 text-slate-400 text-xs font-bold">금일 장애 없음</div>`;
        return errors.map(h => `<div class="px-4 py-2.5 border-b border-slate-100 hover:bg-red-50/30 flex justify-between items-center"><div><span onclick="app.openMonitoringModal('${h.name}')" class="text-[12px] font-bold text-red-700 cursor-pointer hover:underline">${h.name}</span><span class="text-[10px] text-slate-400 font-mono ml-1">${h.id}</span>${h.status==='persistent'?'<span class="text-[9px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold ml-1">지속장애</span>':''}</div><div class="text-right"><p class="text-[11px] font-mono text-red-600 font-bold">${h.lastPing}</p><p class="text-[10px] text-slate-500">${h.elapsed}</p></div></div>`).join('');
    },

    renderRepeatOffenders(offenders) {
        if (!offenders || !offenders.length) return `<div class="text-center py-6 text-slate-400 text-xs font-bold">반복 장애 없음</div>`;
        return offenders.map(o => `<div class="px-4 py-2.5 border-b border-slate-100 hover:bg-amber-50/30 flex justify-between items-center"><span class="text-[12px] font-bold text-amber-800">${o.hostName.split('(')[0].trim()}</span><div class="flex items-center space-x-1">${o.types.CRITICAL?`<span class="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold">장애 ${o.types.CRITICAL}</span>`:''}${o.types.WARNING?`<span class="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-bold">주의 ${o.types.WARNING}</span>`:''}</div></div>`).join('');
    },

    initCharts() {
        Chart.defaults.font.family = "'Pretendard', sans-serif";
        Chart.defaults.font.size = 10;
        Chart.defaults.color = '#94a3b8';
        const d = this.getDynamicData(this.currentFilter);
        const ctxLine = document.getElementById('mainLineChart').getContext('2d');
        const gradientRed = ctxLine.createLinearGradient(0, 0, 0, 250);
        gradientRed.addColorStop(0, 'rgba(239, 68, 68, 0.15)');
        gradientRed.addColorStop(1, 'rgba(239, 68, 68, 0)');
        const lineChart = new Chart(ctxLine, { type: 'line', data: { labels: ['09:00','11:00','13:00','15:00','17:00','19:00'], datasets: [{ label: '장애 발생 건수', data: d.lineErr, borderColor: '#ef4444', backgroundColor: gradientRed, borderWidth: 1.5, tension: 0.4, fill: true, pointRadius: 0, pointHoverRadius: 4 }, { type: 'bar', label: '지연(주의) 건수', data: d.lineWarn, backgroundColor: '#facc15', borderRadius: 2, barThickness: 10 }] }, options: { responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false }, scales: { y: { beginAtZero: true, grid: { borderDash: [2,2], color: '#f1f5f9' }, border: { display: false }, ticks: { stepSize: 2 } }, x: { grid: { display: false }, border: { display: false } } }, plugins: { legend: { display: false } } } });
        const ctxDoughnut = document.getElementById('mainDoughnutChart').getContext('2d');
        const doughnutChart = new Chart(ctxDoughnut, { type: 'doughnut', data: { labels: ['정상','주의','장애'], datasets: [{ data: d.dough, backgroundColor: ['#14b8a6','#facc15','#ef4444'], borderWidth: 0, hoverOffset: 4 }] }, options: { responsive: true, maintainAspectRatio: false, cutout: '80%', plugins: { legend: { display: false } } } });
        app.chartInstances.push(lineChart, doughnutChart);
    }
};
