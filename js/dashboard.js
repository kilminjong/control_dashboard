const dashboardView = {
    dummyData: {
        'all': { uptime: '99.98', normal: 885, total: 900, error: 3, warn: 12, recovery: 5, lineErr: [1,0,0,2,5,0], lineWarn: [2,1,3,2,8,1], dough: [885,12,3] },
        'vip': { uptime: '100.00', normal: 150, total: 150, error: 0, warn: 2, recovery: 1, lineErr: [0,0,0,0,0,0], lineWarn: [0,1,0,0,1,0], dough: [148,2,0] },
        'gen': { uptime: '99.95', normal: 735, total: 750, error: 3, warn: 10, recovery: 4, lineErr: [1,0,0,2,5,0], lineWarn: [2,0,3,2,7,1], dough: [737,10,3] }
    },
    currentFilter: 'all',

    render() {
        const d = this.dummyData[this.currentFilter];
        return `
        <div class="max-w-[1400px] mx-auto">
            <div class="flex justify-between items-center mb-5">
                <div class="flex space-x-2">
                    <select id="group-filter" onchange="dashboardView.updateFilter(this.value)" class="text-xs border border-slate-300 rounded px-3 py-1.5 bg-white text-slate-700 outline-none focus:border-teal-500 font-bold shadow-sm">
                        <option value="all" ${this.currentFilter==='all'?'selected':''}>전체 고객사 그룹</option>
                        <option value="vip" ${this.currentFilter==='vip'?'selected':''}>VIP 등급 고객사 (집중관제)</option>
                        <option value="gen" ${this.currentFilter==='gen'?'selected':''}>일반 등급 고객사</option>
                    </select>
                    <select class="text-xs border border-slate-300 rounded px-3 py-1.5 bg-white text-slate-700 outline-none focus:border-teal-500 font-medium shadow-sm">
                        <option>오늘 (당일)</option><option>최근 7일</option><option>이번 달</option>
                    </select>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5" id="kpi-cards">
                ${this.renderKPI(d)}
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-5">
                <div class="lg:col-span-8 bg-white border border-slate-200 rounded flex flex-col shadow-sm">
                    <div class="px-5 py-3 border-b border-slate-100 flex justify-between items-center">
                        <h3 class="text-[13px] font-bold text-slate-800">시간대별 트래픽 및 장애 발생 추이</h3>
                    </div>
                    <div class="p-5 flex-1 min-h-[260px] relative"><canvas id="mainLineChart"></canvas></div>
                </div>
                <div class="lg:col-span-4 bg-white border border-slate-200 rounded flex flex-col shadow-sm">
                    <div class="px-5 py-3 border-b border-slate-100">
                        <h3 class="text-[13px] font-bold text-slate-800">단말 실시간 상태 분포도</h3>
                    </div>
                    <div class="p-5 flex-1 flex flex-col">
                        <div class="h-[150px] relative flex justify-center items-center mb-5"><canvas id="mainDoughnutChart"></canvas></div>
                        <div class="space-y-2 mt-auto" id="doughnut-legend">
                            ${this.renderLegend(d)}
                        </div>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div class="bg-white border border-slate-200 rounded overflow-hidden shadow-sm">
                    <div class="px-4 py-3 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                        <h3 class="text-[13px] font-bold text-slate-800">최근 발생한 시스템 장애 알람</h3>
                        <a href="#" onclick="app.loadView('flagHistory', document.querySelectorAll('[data-menu]')[2])" class="text-[11px] text-teal-600 font-bold hover:underline">상세보기 &rarr;</a>
                    </div>
                    <table class="w-full text-left border-collapse">
                        <thead class="bg-white text-[11px] text-slate-500 border-b border-slate-200">
                            <tr><th class="px-4 py-2 font-bold">발생 시간</th><th class="px-4 py-2 font-bold">고객사 정보</th><th class="px-4 py-2 font-bold">상세 내용</th></tr>
                        </thead>
                        <tbody class="text-xs text-slate-700 divide-y divide-slate-100" id="alarm-table">
                            ${this.currentFilter === 'vip' ? 
                                `<tr class="hover:bg-slate-50"><td class="px-4 py-2 text-slate-500 font-mono">14:00:00</td><td class="px-4 py-2 font-bold text-blue-600">(VIP) 글로벌테크</td><td class="px-4 py-2 text-yellow-600 font-medium">Flag 수신 10분 지연 감지</td></tr>` : 
                                `<tr class="hover:bg-slate-50"><td class="px-4 py-2 text-slate-500 font-mono">14:20:00</td><td class="px-4 py-2 font-bold">미래건설산업(주)</td><td class="px-4 py-2 text-red-600 font-medium">Flag 수신 30분 초과 (장애 전환)</td></tr>
                                 <tr class="hover:bg-slate-50"><td class="px-4 py-2 text-slate-500 font-mono">14:15:30</td><td class="px-4 py-2 font-bold">하나시스템(주)</td><td class="px-4 py-2 text-blue-600 font-medium">Watcher 프로세스 자동 재구동 성공</td></tr>`
                            }
                        </tbody>
                    </table>
                </div>
                <div class="bg-white border border-slate-200 rounded overflow-hidden shadow-sm">
                    <div class="px-4 py-3 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                        <h3 class="text-[13px] font-bold text-slate-800">금일 마케팅 데이터 수집 현황</h3>
                        <span class="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-bold">자동 수집 중</span>
                    </div>
                    <div class="p-4 grid grid-cols-2 gap-3">
                        <div class="border border-slate-200 rounded p-3 text-center">
                            <p class="text-[11px] text-slate-500 font-bold mb-1">전자어음 / B2B 만기</p>
                            <h4 class="text-xl font-bold text-slate-800">${this.currentFilter==='vip'?'42':'142'}<span class="text-xs text-slate-500 font-medium ml-1">건 수집</span></h4>
                        </div>
                        <div class="border border-slate-200 rounded p-3 text-center">
                            <p class="text-[11px] text-slate-500 font-bold mb-1">세금계산서 (매입/매출)</p>
                            <h4 class="text-xl font-bold text-slate-800">${this.currentFilter==='vip'?'1,250':'8,450'}<span class="text-xs text-slate-500 font-medium ml-1">건 수집</span></h4>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;
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
        `;
    },

    renderLegend(d) { return `<div class="flex justify-between items-center text-xs p-2 bg-slate-50 rounded border border-slate-100"><div class="flex items-center"><span class="w-2.5 h-2.5 rounded-full bg-teal-500 mr-2"></span><span class="font-bold text-slate-700">정상 통신 (Normal)</span></div><span class="font-bold text-slate-800">${d.normal}대</span></div><div class="flex justify-between items-center text-xs p-2 bg-slate-50 rounded border border-slate-100"><div class="flex items-center"><span class="w-2.5 h-2.5 rounded-full bg-yellow-400 mr-2"></span><span class="font-bold text-slate-700">지연 주의 (Warning)</span></div><span class="font-bold text-slate-800">${d.warn}대</span></div><div class="flex justify-between items-center text-xs p-2 ${d.error > 0 ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'} rounded border"><div class="flex items-center"><span class="w-2.5 h-2.5 rounded-full ${d.error > 0 ? 'bg-red-500' : 'bg-slate-300'} mr-2"></span><span class="font-bold ${d.error > 0 ? 'text-red-700' : 'text-slate-500'}">연결 장애 (Critical)</span></div><span class="font-bold ${d.error > 0 ? 'text-red-600' : 'text-slate-500'}">${d.error}대</span></div>`; },
    updateFilter(val) { /* 생략 무방, 기존 로직 동일 */ this.currentFilter = val; const d = this.dummyData[val]; document.getElementById('kpi-cards').innerHTML = this.renderKPI(d); document.getElementById('doughnut-legend').innerHTML = this.renderLegend(d); const lineChart = app.chartInstances[0]; const doughChart = app.chartInstances[1]; lineChart.data.datasets[0].data = d.lineErr; lineChart.data.datasets[1].data = d.lineWarn; lineChart.update(); doughChart.data.datasets[0].data = d.dough; doughChart.update(); app.loadView('dashboard'); },
    initCharts() { /* 생략 무방, 기존 로직 동일 */ Chart.defaults.font.family = "'Pretendard', sans-serif"; Chart.defaults.font.size = 10; Chart.defaults.color = '#94a3b8'; const d = this.dummyData[this.currentFilter]; const ctxLine = document.getElementById('mainLineChart').getContext('2d'); const gradientRed = ctxLine.createLinearGradient(0, 0, 0, 250); gradientRed.addColorStop(0, 'rgba(239, 68, 68, 0.15)'); gradientRed.addColorStop(1, 'rgba(239, 68, 68, 0)'); const lineChart = new Chart(ctxLine, { type: 'line', data: { labels: ['09:00', '11:00', '13:00', '15:00', '17:00', '19:00'], datasets: [{ label: '장애 발생 건수', data: d.lineErr, borderColor: '#ef4444', backgroundColor: gradientRed, borderWidth: 1.5, tension: 0.4, fill: true, pointRadius: 0, pointHoverRadius: 4 }, { type: 'bar', label: '지연(주의) 건수', data: d.lineWarn, backgroundColor: '#facc15', borderRadius: 2, barThickness: 10 }] }, options: { responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false }, scales: { y: { beginAtZero: true, grid: { borderDash: [2, 2], color: '#f1f5f9' }, border: { display: false }, ticks: { stepSize: 2 } }, x: { grid: { display: false }, border: { display: false } } }, plugins: { legend: { display: false } } } }); const ctxDoughnut = document.getElementById('mainDoughnutChart').getContext('2d'); const doughnutChart = new Chart(ctxDoughnut, { type: 'doughnut', data: { labels: ['정상', '주의', '장애'], datasets: [{ data: d.dough, backgroundColor: ['#14b8a6', '#facc15', '#ef4444'], borderWidth: 0, hoverOffset: 4 }] }, options: { responsive: true, maintainAspectRatio: false, cutout: '80%', plugins: { legend: { display: false } } } }); app.chartInstances.push(lineChart, doughnutChart); }
};