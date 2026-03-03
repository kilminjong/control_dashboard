const app = {
    state: { normalThreshold: 5, warningThreshold: 10, errorThreshold: 30, autoRecovery: true },
    chartInstances: [],
    c360Charts: [],
    
    hosts: [],
    logs: [],
    reports: [],

    init() {
        this.generateData(); 
        this.injectCustomer360Panel(); // 데이터 활용용 우측 패널
        this.injectMonitoringModal();  // 시스템 관제용 중앙 모달 (신규)
        const firstMenu = document.querySelector('[data-menu]');
        this.loadView('dashboard', firstMenu);
    },

    // ---------------------------------------------------------
    // [신규] 시스템 관제용 약식 상세화면(모달창) HTML 주입
    // ---------------------------------------------------------
    injectMonitoringModal() {
        const modalHtml = `
        <div id="monitoring-modal-overlay" onclick="app.closeMonitoringModal()" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] hidden opacity-0 transition-opacity duration-300 flex items-center justify-center">
            <div id="monitoring-modal-content" class="bg-white w-[500px] rounded-xl shadow-2xl overflow-hidden transform scale-95 transition-transform duration-300" onclick="event.stopPropagation()">
                <div class="p-5 bg-slate-800 text-white flex justify-between items-center">
                    <div class="flex items-center space-x-3">
                        <i class="fa-solid fa-server text-xl text-teal-400"></i>
                        <div>
                            <h3 class="text-lg font-bold" id="mon-modal-name">기업명</h3>
                            <p class="text-xs text-slate-400 font-mono mt-0.5" id="mon-modal-id">ID: AGT-0000</p>
                        </div>
                    </div>
                    <button onclick="app.closeMonitoringModal()" class="text-slate-400 hover:text-white transition"><i class="fa-solid fa-xmark text-xl"></i></button>
                </div>
                <div class="p-6">
                    <div class="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                        <div>
                            <p class="text-xs font-bold text-slate-500 mb-1">현재 통신 상태</p>
                            <div id="mon-modal-status"></div>
                        </div>
                        <div class="text-right">
                            <p class="text-xs font-bold text-slate-500 mb-1">관제 등급</p>
                            <div id="mon-modal-vip"></div>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4 mb-6">
                        <div class="bg-slate-50 p-3 rounded border border-slate-200 shadow-sm">
                            <p class="text-[10px] font-bold text-slate-400 uppercase mb-1">IP Address</p>
                            <p class="text-sm font-mono font-bold text-slate-800" id="mon-modal-ip">192.168.0.1</p>
                        </div>
                        <div class="bg-slate-50 p-3 rounded border border-slate-200 shadow-sm">
                            <p class="text-[10px] font-bold text-slate-400 uppercase mb-1">OS Environment</p>
                            <p class="text-sm font-bold text-slate-800" id="mon-modal-os">Windows 10</p>
                        </div>
                        <div class="bg-slate-50 p-3 rounded border border-slate-200 shadow-sm">
                            <p class="text-[10px] font-bold text-slate-400 uppercase mb-1">Last Ping Time</p>
                            <p class="text-sm font-mono font-bold text-slate-800" id="mon-modal-lastping">14:20:00</p>
                        </div>
                        <div class="bg-slate-50 p-3 rounded border border-slate-200 shadow-sm">
                            <p class="text-[10px] font-bold text-slate-400 uppercase mb-1">Elapsed Time</p>
                            <p class="text-sm font-bold text-slate-800" id="mon-modal-elapsed">1분 이내</p>
                        </div>
                    </div>
                    <div class="flex space-x-2 mt-2">
                        <button class="flex-1 bg-slate-800 text-white py-2 rounded text-xs font-bold hover:bg-slate-700 shadow-sm transition"><i class="fa-solid fa-rotate-right mr-1.5"></i>Agent 재구동</button>
                        <button class="flex-1 border border-slate-300 bg-white text-slate-700 py-2 rounded text-xs font-bold hover:bg-slate-50 shadow-sm transition"><i class="fa-solid fa-list-check mr-1.5"></i>전체 로그 조회</button>
                        <button class="flex-1 border border-teal-500 bg-teal-50 text-teal-700 py-2 rounded text-xs font-bold hover:bg-teal-100 shadow-sm transition"><i class="fa-solid fa-network-wired mr-1.5"></i>Ping 테스트</button>
                    </div>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    },

    openMonitoringModal(companyName) {
        // 데이터 찾기
        const hostData = this.hosts.find(h => h.name === companyName || h.name.includes(companyName)) || this.hosts[0];
        
        // 데이터 바인딩
        document.getElementById('mon-modal-name').innerText = hostData.name;
        document.getElementById('mon-modal-id').innerText = "통합 ID: " + hostData.id;
        document.getElementById('mon-modal-ip').innerText = hostData.ip;
        document.getElementById('mon-modal-os').innerText = hostData.os;
        document.getElementById('mon-modal-lastping').innerText = hostData.lastPing;
        document.getElementById('mon-modal-elapsed').innerText = hostData.elapsed;

        let statusHtml = '';
        if (hostData.status === 'critical') statusHtml = `<span class="inline-flex items-center rounded-md bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700 ring-1 ring-inset ring-red-600/20"><span class="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5"></span>연결 장애</span>`;
        else if (hostData.status === 'warning') statusHtml = `<span class="inline-flex items-center rounded-md bg-yellow-50 px-2.5 py-1 text-xs font-bold text-yellow-700 ring-1 ring-inset ring-yellow-600/20"><span class="w-1.5 h-1.5 rounded-full bg-yellow-400 mr-1.5"></span>수신 지연</span>`;
        else statusHtml = `<span class="inline-flex items-center rounded-md bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700 ring-1 ring-inset ring-teal-600/20"><span class="w-1.5 h-1.5 rounded-full bg-teal-500 mr-1.5"></span>정상 통신</span>`;
        document.getElementById('mon-modal-status').innerHTML = statusHtml;

        let vipHtml = hostData.isVip ? `<span class="bg-blue-600 text-white px-2.5 py-1 rounded text-xs font-bold shadow-sm">VIP 고객사</span>` : `<span class="bg-slate-100 border border-slate-200 text-slate-500 px-2.5 py-1 rounded text-xs font-bold">일반 고객사</span>`;
        document.getElementById('mon-modal-vip').innerHTML = vipHtml;

        // 모달 띄우기
        const overlay = document.getElementById('monitoring-modal-overlay');
        const content = document.getElementById('monitoring-modal-content');
        overlay.classList.remove('hidden');
        setTimeout(() => { overlay.classList.remove('opacity-0'); content.classList.remove('scale-95'); }, 10);
    },

    closeMonitoringModal() {
        const overlay = document.getElementById('monitoring-modal-overlay');
        const content = document.getElementById('monitoring-modal-content');
        overlay.classList.add('opacity-0');
        content.classList.add('scale-95');
        setTimeout(() => { overlay.classList.add('hidden'); }, 300);
    },

    // ---------------------------------------------------------
    // 데이터 활용용 고객사 360 우측 패널 주입 (기존과 동일)
    // ---------------------------------------------------------
    injectCustomer360Panel() {
        const panelHtml = `
        <div id="c360-overlay" onclick="app.closeCustomer360()" class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[90] hidden opacity-0 transition-opacity duration-300"></div>
        <div id="customer-360-panel" class="fixed top-0 right-0 h-full w-[750px] bg-slate-50 shadow-2xl z-[100] transform translate-x-full transition-transform duration-300 ease-in-out flex flex-col border-l border-slate-200">
            <div class="p-6 bg-slate-900 text-white flex justify-between items-start shrink-0 relative overflow-hidden">
                <i class="fa-solid fa-chart-pie absolute right-[-20px] top-[-20px] text-9xl text-white opacity-5"></i>
                <div class="relative z-10 w-full">
                    <div class="flex justify-between items-center mb-2">
                        <div class="text-[10px] text-teal-400 font-bold uppercase tracking-widest px-2 py-0.5 border border-teal-400/30 bg-teal-400/10 rounded inline-block"><i class="fa-solid fa-microscope mr-1"></i>Customer 360 심층 분석</div>
                        <button onclick="app.closeCustomer360()" class="text-slate-400 hover:text-white transition"><i class="fa-solid fa-xmark text-xl"></i></button>
                    </div>
                    <div class="flex items-end space-x-4 mt-2">
                        <h2 class="text-2xl font-bold tracking-tight" id="c360-name">기업명</h2>
                        <span class="text-sm text-slate-300 font-mono mb-1" id="c360-id">ID: AGT-0000</span>
                        <span class="bg-blue-600 text-white px-2 py-0.5 rounded text-[10px] font-bold mb-1 hidden" id="c360-vip-badge">VIP 고객사</span>
                    </div>
                </div>
            </div>
            <div class="flex-1 overflow-y-auto p-6 space-y-5">
                <div class="bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl p-5 text-white shadow-md relative overflow-hidden border border-slate-600">
                    <div class="flex items-center mb-3 relative z-10"><i class="fa-solid fa-wand-magic-sparkles text-teal-400 mr-2 text-lg"></i><span class="font-bold text-[14px]">AI 기반 영업/마케팅 추천 액션</span></div>
                    <p class="text-[13px] leading-relaxed relative z-10 text-slate-200" id="c360-ai-text">분석 데이터를 불러오는 중...</p>
                    <div class="mt-4 flex space-x-2 relative z-10" id="c360-ai-buttons"></div>
                </div>
                <div class="grid grid-cols-2 gap-5">
                    <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                        <h3 class="font-bold text-slate-800 text-[13px] mb-1">통합 금융/거래 밸런스</h3>
                        <p class="text-[10px] text-slate-400 mb-4">당행 및 타행 수집 데이터 종합 스코어</p>
                        <div class="flex-1 min-h-[220px] flex justify-center"><canvas id="c360-radarChart"></canvas></div>
                    </div>
                    <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                        <h3 class="font-bold text-slate-800 text-[13px] mb-1">수집된 자금 흐름 (매출/매입)</h3>
                        <p class="text-[10px] text-slate-400 mb-4">세금계산서 및 어음 기반 추정 (단위: 백만 원)</p>
                        <div class="flex-1 min-h-[220px] flex justify-center"><canvas id="c360-barChart"></canvas></div>
                    </div>
                </div>
                <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div class="flex justify-between items-center mb-3">
                        <h3 class="font-bold text-slate-800 text-[13px]">최근 60일 CMS 인프라(Agent) 가동 이력</h3>
                        <div class="text-[10px] text-slate-500 font-bold space-x-2 flex">
                            <span class="flex items-center"><span class="w-2.5 h-2.5 bg-red-500 rounded-sm mr-1"></span>장애</span>
                            <span class="flex items-center"><span class="w-2.5 h-2.5 bg-yellow-400 rounded-sm mr-1"></span>주의</span>
                            <span class="flex items-center"><span class="w-2.5 h-2.5 bg-teal-400 rounded-sm mr-1"></span>정상</span>
                        </div>
                    </div>
                    <div class="flex flex-wrap gap-1" id="c360-heatmap"></div>
                    <p class="text-[11px] text-slate-500 mt-3 pt-3 border-t border-slate-100"><i class="fa-solid fa-server mr-1 text-slate-400"></i>시스템 평균 가동률: <span class="font-bold text-teal-600" id="c360-uptime">99.8%</span></p>
                </div>
                <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div class="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                        <h3 class="font-bold text-slate-800 text-[13px]">최근 수집된 핵심 마케팅 타겟 데이터</h3>
                        <span class="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-bold">최근 3건 요약</span>
                    </div>
                    <table class="w-full text-left whitespace-nowrap">
                        <thead class="bg-white text-[11px] text-slate-400 border-b border-slate-100">
                            <tr><th class="px-4 py-2 font-bold">데이터 유형</th><th class="px-4 py-2 font-bold">상세 내용</th><th class="px-4 py-2 font-bold text-right">금액/가치</th><th class="px-4 py-2 font-bold text-center">상태</th></tr>
                        </thead>
                        <tbody class="text-[12px] text-slate-700 divide-y divide-slate-50" id="c360-table-body">
                        </tbody>
                    </table>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', panelHtml);
    },

    openCustomer360(companyName) {
        document.getElementById('c360-name').innerText = companyName;
        const hostData = this.hosts.find(h => h.name.includes(companyName)) || { id: "AGT-" + (Math.floor(Math.random()*8999)+1000), isVip: Math.random() > 0.5 };
        document.getElementById('c360-id').innerText = "통합 ID: " + hostData.id;
        
        const vipBadge = document.getElementById('c360-vip-badge');
        if(hostData.isVip) { vipBadge.classList.remove('hidden'); } else { vipBadge.classList.add('hidden'); }
        
        let heatmapHtml = ''; let errorDays = 0;
        for(let i=0; i<60; i++) {
            const rand = Math.random(); let color = 'bg-teal-400';
            if(rand < 0.03) { color = 'bg-red-500'; errorDays++; }
            else if(rand < 0.1) color = 'bg-yellow-400';
            heatmapHtml += `<div class="w-[12px] h-[12px] ${color} rounded-[2px] opacity-80 hover:opacity-100 cursor-pointer shadow-sm" title="D-${60-i}일"></div>`;
        }
        document.getElementById('c360-heatmap').innerHTML = heatmapHtml;
        document.getElementById('c360-uptime').innerText = ((60 - errorDays) / 60 * 100).toFixed(1) + '%';

        const scenarios = [
            { txt: `타행(A은행) <strong>전자어음 및 B2B 매입 비중이 75%</strong>로 매우 높습니다. 다음 달 총 5억 원의 결제성 자금이 필요할 것으로 예측되므로 당행의 <strong>[기업 단기 운전자금 대출]</strong> 선제적 제안을 강력히 권장합니다.`, btns: `<button class="bg-teal-500 text-white px-3 py-1.5 rounded text-[11px] font-bold shadow-sm hover:bg-teal-400 transition"><i class="fa-solid fa-paper-plane mr-1"></i>영업점 리드 전송</button><button class="bg-slate-600 text-white px-3 py-1.5 rounded text-[11px] font-bold shadow-sm hover:bg-slate-500 transition">대출 한도 조회</button>` },
            { txt: `최근 3개월간 타행 법인카드 결제액 중 <strong>주유/교통비 지출이 월 평균 3,500만 원</strong> 발생했습니다. 기업 비용 절감을 위한 <strong>당행 [하나 주유특화 비즈니스 카드]</strong> 전환 영업이 즉시 가능합니다.`, btns: `<button class="bg-blue-500 text-white px-3 py-1.5 rounded text-[11px] font-bold shadow-sm hover:bg-blue-400 transition"><i class="fa-regular fa-credit-card mr-1"></i>맞춤 카드 제안서 발송</button>` },
            { txt: `당월 자동 수집된 <strong>타행 정기예금(15억 원)의 만기가 10일 남았습니다.</strong> 이탈 방지 및 당행 유치를 위해 지점장 승인 전결의 <strong>[특별 금리 우대 예금]</strong> 혜택 부여가 필요합니다.`, btns: `<button class="bg-yellow-500 text-slate-900 px-3 py-1.5 rounded text-[11px] font-bold shadow-sm hover:bg-yellow-400 transition"><i class="fa-solid fa-phone mr-1"></i>영업점 즉시 콜</button>` }
        ];
        const selectedScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
        document.getElementById('c360-ai-text').innerHTML = selectedScenario.txt;
        document.getElementById('c360-ai-buttons').innerHTML = selectedScenario.btns;

        const tableRows = [
            `<tr class="hover:bg-slate-50"><td class="px-4 py-2.5 font-bold"><span class="bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200 text-[10px]">전자어음</span></td><td class="px-4 py-2.5 text-slate-600">A은행 발행 (만기 D-10)</td><td class="px-4 py-2.5 text-right font-mono font-bold text-slate-800">500,000,000</td><td class="px-4 py-2.5 text-center"><span class="text-[10px] text-red-500 font-bold">대출 제안 타겟</span></td></tr>`,
            `<tr class="hover:bg-slate-50"><td class="px-4 py-2.5 font-bold"><span class="bg-teal-50 text-teal-700 px-2 py-0.5 rounded border border-teal-200 text-[10px]">세금계산서</span></td><td class="px-4 py-2.5 text-slate-600">삼성물산 매출 발생</td><td class="px-4 py-2.5 text-right font-mono font-bold text-slate-800">125,000,000</td><td class="px-4 py-2.5 text-center"><span class="text-[10px] text-slate-400 font-bold">수집 완료</span></td></tr>`,
            `<tr class="hover:bg-slate-50"><td class="px-4 py-2.5 font-bold"><span class="bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-200 text-[10px]">법인카드</span></td><td class="px-4 py-2.5 text-slate-600">현대카드 (주유비 결제)</td><td class="px-4 py-2.5 text-right font-mono font-bold text-slate-800">8,500,000</td><td class="px-4 py-2.5 text-center"><span class="text-[10px] text-slate-400 font-bold">수집 완료</span></td></tr>`
        ];
        document.getElementById('c360-table-body').innerHTML = tableRows.sort(() => Math.random() - 0.5).join('');

        this.c360Charts.forEach(c => c.destroy());
        this.c360Charts = [];

        const ctxRadar = document.getElementById('c360-radarChart').getContext('2d');
        const radar = new Chart(ctxRadar, { type: 'radar', data: { labels: ['타행자산 보유', '여신(대출) 필요도', '카드 결제액', '어음/B2B 거래량', '당행 기여도'], datasets: [{ data: [Math.floor(Math.random()*60)+40, Math.floor(Math.random()*60)+40, Math.floor(Math.random()*80)+20, Math.floor(Math.random()*80)+20, Math.floor(Math.random()*50)+10], backgroundColor: 'rgba(20, 184, 166, 0.2)', borderColor: 'rgba(20, 184, 166, 1)', pointBackgroundColor: 'rgba(20, 184, 166, 1)', borderWidth: 2 }] }, options: { responsive: true, maintainAspectRatio: false, scales: { r: { angleLines: { color: '#e2e8f0' }, grid: { color: '#e2e8f0' }, pointLabels: { font: { size: 10, family: 'Pretendard', weight: 'bold' }, color: '#64748b' }, ticks: { display: false, max: 100 } } }, plugins: { legend: { display: false } } } });
        const ctxBar = document.getElementById('c360-barChart').getContext('2d');
        const bar = new Chart(ctxBar, { type: 'bar', data: { labels: ['10월', '11월', '12월', '1월', '2월', '당월'], datasets: [ { label: '매출액', data: [120, 150, 180, 130, 200, 250], backgroundColor: '#0ea5e9', borderRadius: 2 }, { label: '지출액', data: [90, 110, 100, 120, 150, 140], backgroundColor: '#f43f5e', borderRadius: 2 } ] }, options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, grid: { borderDash: [2, 2], color: '#f1f5f9' }, border: { display: false }, ticks: { font: {size: 9} } }, x: { grid: { display: false }, border: { display: false }, ticks: { font: {size: 10} } } }, plugins: { legend: { position: 'bottom', labels: { boxWidth: 8, font: {size: 10} } } } } });
        this.c360Charts.push(radar, bar);

        const overlay = document.getElementById('c360-overlay');
        const panel = document.getElementById('customer-360-panel');
        overlay.classList.remove('hidden');
        setTimeout(() => { overlay.classList.remove('opacity-0'); panel.classList.remove('translate-x-full'); }, 10);
    },

    closeCustomer360() {
        const overlay = document.getElementById('c360-overlay');
        const panel = document.getElementById('customer-360-panel');
        overlay.classList.add('opacity-0');
        panel.classList.add('translate-x-full');
        setTimeout(() => { overlay.classList.add('hidden'); }, 300);
    },

    generateData() {
        const companies = ['미래건설산업(주)', '(주)글로벌네트웍스', '제일유통', '하나시스템(주)', '태양물산', '한국정밀', '대보건설', '현대유통', '스마트솔루션즈', '다우테크', '씨제이대한', '에스케이망'];
        const osList = ['Windows 10 Pro', 'Windows 11', 'Windows Server 2019', 'Windows Server 2022'];
        
        for(let i=1; i<=300; i++) {
            const isCritical = (i === 1 || i === 85 || i === 210);
            const isWarning = (!isCritical && i % 25 === 0);
            const status = isCritical ? 'critical' : (isWarning ? 'warning' : 'normal');
            this.hosts.push({ id: `AGT-${1000 + i}`, name: companies[i % companies.length] + (i > 15 ? ` ${i}지점` : ''), ip: `192.168.${(i % 255)}.${(i * 3) % 255}`, os: osList[i % osList.length], status: status, lastPing: status === 'critical' ? '14:20:00' : (status === 'warning' ? '14:45:00' : '14:56:55'), elapsed: status === 'critical' ? '37분 경과' : (status === 'warning' ? '12분 경과' : '1분 이내'), isVip: i % 8 === 0, terminals: Math.floor(Math.random() * 200) + 10, errorCount: isCritical ? 3 : (isWarning ? 1 : 0) });
        }

        for(let i=1; i<=300; i++) {
            const rand = Math.random();
            let type, message, color;
            const host = this.hosts[i % this.hosts.length];
            if(rand < 0.05) { type = 'CRITICAL'; color = 'text-red-600 bg-red-50 border-red-100'; message = `Flag 수신 지연 임계치 초과. 상태가 [장애]로 강제 전환됨.`; } 
            else if(rand < 0.1) { type = 'SYSTEM'; color = 'text-blue-600 bg-blue-50 border-blue-100'; message = `Watcher 자동 복구 서비스 개입. 강제 재시작 명령 전송 및 복구 완료.`; } 
            else if(rand < 0.2) { type = 'WARNING'; color = 'text-yellow-600 bg-yellow-50 border-yellow-100'; message = `Flag 수신 지연 감지. 1차 모니터링 경고 발송됨.`; } 
            else { type = 'INFO'; color = 'text-slate-500 bg-slate-100 border-slate-200'; message = `정상 Ping 응답 수신 (지연시간: ${Math.floor(Math.random() * 50) + 10}ms)`; }
            const date = new Date(new Date().getTime() - (i * 1000 * 60 * 15));
            const timeStr = `${date.toISOString().split('T')[0]} ${date.toTimeString().split(' ')[0]}`;
            this.logs.push({ time: timeStr, type: type, color: color, host: `${host.name} (${host.id})`, msg: message });
        }

        this.reports = [
            { id: 'RPT-001', type: 'weekly', typeName: '주간', title: '2월 4주차 시스템 운영 주간보고서', dateRange: '2026-02-23 ~ 2026-03-01', group: 'all', groupName: '전체 고객사', created: '2026.03.02', format: 'pdf' },
            { id: 'RPT-002', type: 'monthly', typeName: '월간', title: '2월 VIP 고객사 관제 현황 월간보고서', dateRange: '2026-02-01 ~ 2026-02-28', group: 'vip', groupName: 'VIP 고객사', created: '2026.03.01', format: 'excel' }
        ];
    },

    clearCharts() {
        this.chartInstances.forEach(chart => chart.destroy());
        this.chartInstances = [];
    },

    loadView(viewName, menuElement = null) {
        const container = document.getElementById('app-view');
        const pageTitle = document.getElementById('page-title');
        
        if (menuElement) {
            document.querySelectorAll('[data-menu]').forEach(el => el.classList.remove('active'));
            menuElement.classList.add('active');
            if(pageTitle) pageTitle.innerText = menuElement.innerText;
        }

        this.clearCharts(); 

        const views = {
            'dashboard': { render: () => dashboardView.render(), init: () => dashboardView.initCharts() },
            'pcStatus': { render: () => controlViews.renderPcStatus() },
            'flagHistory': { render: () => controlViews.renderFlagHistory() },
            'groupManage': { render: () => controlViews.renderGroupManage() },
            'reportView': { render: () => controlViews.renderReportView() },
            'settings': { render: () => controlViews.renderSettings(this.state) },
            'assetView': { render: () => dataViews.renderAsset(), init: () => dataViews.initAssetChart() },
            'b2bView': { render: () => dataViews.renderB2B() },
            'cardView': { render: () => dataViews.renderCard(), init: () => dataViews.initCardChart() },
            'taxView': { render: () => dataViews.renderTax() }
        };

        if(views[viewName]) {
            container.innerHTML = views[viewName].render();
            if(views[viewName].init) setTimeout(() => views[viewName].init(), 50); 
        }
    },

    loadViewWithFilter(viewName, filterType) {
        const menus = document.querySelectorAll('[data-menu]');
        let targetMenuIndex = 1;
        if(viewName === 'flagHistory') targetMenuIndex = 2;
        this.loadView(viewName, menus[targetMenuIndex]);
        setTimeout(() => {
            const searchInput = document.getElementById('search-input');
            const statusSelect = document.getElementById('status-filter');
            if (viewName === 'pcStatus' && filterType === 'critical') { if(statusSelect) { statusSelect.value = 'critical'; controlViews.filterPcStatus(); } } 
            else if (viewName === 'flagHistory' && filterType === 'recovery') { if(searchInput) { searchInput.value = '자동 복구'; controlViews.filterLogs(); } }
        }, 100);
    },

    saveSettings() { 
        this.state.normalThreshold = document.getElementById('norm-input').value;
        this.state.warningThreshold = document.getElementById('warn-input').value;
        this.state.errorThreshold = document.getElementById('err-input').value;
        const btn = document.getElementById('save-btn');
        const originalText = btn.innerHTML;
        btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-2"></i>저장 중...`;
        btn.classList.add('opacity-75');
        setTimeout(() => {
            btn.innerHTML = `<i class="fa-solid fa-check mr-2"></i>적용 완료`;
            btn.classList.replace('bg-slate-800', 'bg-teal-600');
            setTimeout(() => { btn.innerHTML = originalText; btn.classList.replace('bg-teal-600', 'bg-slate-800'); btn.classList.remove('opacity-75'); }, 2000);
        }, 800);
    }
};

window.onload = () => app.init();