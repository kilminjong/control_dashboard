const controlViews = {
    // [기존 코드 100% 유지] 단말 수 생성 시 Math.random() * 3 반영되어 생성됨
    generateDummyHosts(count) {
        const companies = ['미래건설산업(주)', '(주)글로벌네트웍스', '제일유통', '하나시스템(주)', '태양물산', '한국정밀', '대보건설', '현대유통', '스마트솔루션즈', '다우테크', '씨제이대한', '에스케이망'];
        const osList = ['Windows 10 Pro', 'Windows 11', 'Windows Server 2019', 'Windows Server 2022'];
        const data = [];
        for(let i=1; i<=count; i++) {
            const isCritical = (i === 1 || i === 85 || i === 210);
            const isWarning = (!isCritical && i % 25 === 0);
            const status = isCritical ? 'critical' : (isWarning ? 'warning' : 'normal');
            data.push({ id: `AGT-${1000 + i}`, name: companies[i % companies.length] + (i > 15 ? ` ${i}지점` : ''), ip: `192.168.${(i % 255)}.${(i * 3) % 255}`, os: osList[i % osList.length], status: status, lastPing: status === 'critical' ? '14:20:00' : (status === 'warning' ? '14:45:00' : '14:56:55'), elapsed: status === 'critical' ? '37분 경과' : (status === 'warning' ? '12분 경과' : '1분 이내'), isVip: i % 8 === 0, terminals: Math.floor(Math.random() * 3) + 1, errorCount: isCritical ? 3 : (isWarning ? 1 : 0) });
        }
        return data;
    },
    buildPcStatusRows(data) {
        if(data.length === 0) return `<tr><td colspan="6" class="text-center py-10 text-slate-500 font-bold">검색 결과가 없습니다.</td></tr>`;
        return data.map(item => {
            const nameClickHtml = `<span onclick="app.openMonitoringModal('${item.name}')" class="cursor-pointer text-teal-700 hover:text-teal-900 hover:underline font-bold transition-colors text-[13px]">${item.name}</span>`;
            if (item.status === 'critical') return `<tr class="hover:bg-slate-50 transition-colors"><td class="px-4 py-3 text-center"><input type="checkbox" class="rounded border-slate-300"></td><td class="px-4 py-3"><div class="flex items-center font-bold text-red-600"><span class="w-2 h-2 rounded-full bg-red-500 mr-2 shadow-[0_0_4px_rgba(239,68,68,0.6)]"></span>장애 발생</div></td><td class="px-4 py-3">${nameClickHtml}<span class="text-[10px] text-slate-400 font-mono bg-slate-100 px-1.5 py-0.5 rounded ml-1">${item.id}</span></td><td class="px-4 py-3"><p class="font-mono text-slate-600 font-medium">${item.ip}</p><p class="text-[10px] text-slate-400 mt-0.5">${item.os}</p></td><td class="px-4 py-3"><p class="text-red-600 font-bold font-mono">${item.lastPing}</p><p class="text-[10px] text-slate-500 mt-0.5">통신 끊김 <span class="font-bold">${item.elapsed}</span></p></td><td class="px-4 py-3 text-right"><button class="text-[11px] px-3 py-1.5 border border-slate-300 rounded bg-slate-800 text-white font-bold hover:bg-slate-700 shadow-sm">원격 재시작</button></td></tr>`;
            else if (item.status === 'warning') return `<tr class="hover:bg-slate-50 transition-colors"><td class="px-4 py-3 text-center"><input type="checkbox" class="rounded border-slate-300"></td><td class="px-4 py-3"><div class="flex items-center font-bold text-yellow-600"><span class="w-2 h-2 rounded-full bg-yellow-400 mr-2"></span>수신 지연 (주의)</div></td><td class="px-4 py-3">${nameClickHtml}<span class="text-[10px] text-slate-400 font-mono bg-slate-100 px-1.5 py-0.5 rounded ml-1">${item.id}</span></td><td class="px-4 py-3"><p class="font-mono text-slate-600 font-medium">${item.ip}</p><p class="text-[10px] text-slate-400 mt-0.5">${item.os}</p></td><td class="px-4 py-3"><p class="text-yellow-600 font-bold font-mono">${item.lastPing}</p><p class="text-[10px] text-slate-500 mt-0.5">지연 발생 <span class="font-bold">${item.elapsed}</span></p></td><td class="px-4 py-3 text-right"><button class="text-[11px] px-3 py-1.5 border border-slate-300 rounded bg-white text-slate-700 font-bold hover:bg-slate-50 shadow-sm">상태 점검</button></td></tr>`;
            else return `<tr class="hover:bg-slate-50 transition-colors"><td class="px-4 py-3 text-center"><input type="checkbox" class="rounded border-slate-300"></td><td class="px-4 py-3"><div class="flex items-center font-bold text-teal-600"><span class="w-2 h-2 rounded-full bg-teal-500 mr-2"></span>정상 통신</div></td><td class="px-4 py-3">${nameClickHtml}<span class="text-[10px] text-slate-400 font-mono bg-slate-100 px-1.5 py-0.5 rounded ml-1">${item.id}</span></td><td class="px-4 py-3"><p class="font-mono text-slate-600 font-medium">${item.ip}</p><p class="text-[10px] text-slate-400 mt-0.5">${item.os}</p></td><td class="px-4 py-3"><p class="text-slate-600 font-bold font-mono">${item.lastPing}</p><p class="text-[10px] text-slate-500 mt-0.5">1분 이내 정상 수신</p></td><td class="px-4 py-3 text-right"><button class="text-[11px] text-teal-600 hover:underline font-bold">상세 로그</button></td></tr>`;
        }).join('');
    },
    filterPcStatus() {
        const keyword = document.getElementById('search-input').value.toLowerCase();
        const statusVal = document.getElementById('status-filter').value;
        const filtered = DB.getHosts().filter(h => {
            const matchKeyword = h.name.toLowerCase().includes(keyword) || h.ip.includes(keyword) || h.id.toLowerCase().includes(keyword);
            const matchStatus = statusVal === 'all' ? true : (statusVal === 'critical' ? (h.status === 'critical' || h.status === 'warning') : true);
            return matchKeyword && matchStatus;
        });
        document.getElementById('pc-status-tbody').innerHTML = this.buildPcStatusRows(filtered);
        document.getElementById('pc-count').innerText = `필터링 결과: ${filtered.length}건`;
    },
    renderPcStatus() {
        return `<div class="max-w-[1400px] mx-auto"><div class="grid grid-cols-4 gap-4 mb-5"><div class="bg-white border border-slate-200 p-3 rounded flex justify-between items-center shadow-sm"><span class="text-xs font-bold text-slate-500">전체 관제 단말</span><span class="text-lg font-bold text-slate-800">300대</span></div><div class="bg-teal-50 border border-teal-200 p-3 rounded flex justify-between items-center shadow-sm"><span class="text-xs font-bold text-teal-700">정상 동작 중</span><span class="text-lg font-bold text-teal-700">285대</span></div><div class="bg-yellow-50 border border-yellow-200 p-3 rounded flex justify-between items-center shadow-sm"><span class="text-xs font-bold text-yellow-700">수신 지연 (주의)</span><span class="text-lg font-bold text-yellow-700">12대</span></div><div class="bg-red-50 border border-red-200 p-3 rounded flex justify-between items-center shadow-sm"><span class="text-xs font-bold text-red-700">연결 끊김 (장애)</span><span class="text-lg font-bold text-red-700">3대</span></div></div><div class="flex justify-between items-end mb-4"><div><h2 class="text-lg font-bold text-slate-800 tracking-tight">단말 상태 관제 리스트</h2></div><div class="flex items-center space-x-2"><div class="relative"><i class="fa-solid fa-magnifying-glass absolute left-2.5 top-2 text-slate-400 text-xs"></i><input type="text" id="search-input" onkeyup="controlViews.filterPcStatus()" placeholder="고객사명, IP 주소 검색" class="pl-7 pr-3 py-1.5 border border-slate-300 rounded text-xs focus:border-teal-500 outline-none w-56 font-medium"></div><select id="status-filter" onchange="controlViews.filterPcStatus()" class="border border-slate-300 rounded text-xs px-2 py-1.5 text-slate-700 outline-none focus:border-teal-500 font-medium"><option value="all">전체 상태 보기</option><option value="critical">장애/주의 대상만 필터링</option></select><button class="border border-slate-300 bg-white px-3 py-1.5 rounded text-xs font-bold text-slate-600 hover:bg-slate-50 shadow-sm"><i class="fa-solid fa-rotate-right mr-1.5"></i>새로고침</button></div></div><div class="bg-white border border-slate-200 rounded shadow-sm overflow-hidden"><div class="overflow-y-auto max-h-[600px] relative"><table class="w-full text-left border-collapse whitespace-nowrap"><thead class="bg-slate-50 text-[12px] text-slate-500 border-b border-slate-200 sticky top-0 z-10"><tr><th class="px-4 py-3 font-bold text-center w-10"><input type="checkbox" class="rounded border-slate-300"></th><th class="px-4 py-3 font-bold">현재 상태</th><th class="px-4 py-3 font-bold">고객사 정보 (ID)</th><th class="px-4 py-3 font-bold">단말 IP / OS 환경</th><th class="px-4 py-3 font-bold">최근 통신 수신 (경과)</th><th class="px-4 py-3 font-bold text-right">관리 옵션</th></tr></thead><tbody id="pc-status-tbody" class="text-xs text-slate-700 divide-y divide-slate-100">${this.buildPcStatusRows(DB.getHosts())}</tbody></table></div><div class="px-4 py-3 border-t border-slate-200 bg-slate-50 flex justify-between items-center text-xs text-slate-500 font-bold"><span id="pc-count">전체 ${DB.getHosts().length}대 중 ${DB.getHosts().length}대 표시 중</span><div class="flex space-x-1"><button class="px-2 py-1 border rounded bg-white">이전</button><button class="px-2 py-1 border rounded bg-slate-800 text-white">1</button><button class="px-2 py-1 border rounded bg-white">다음</button></div></div></div></div>`;
    },

    buildLogRows(data) {
        if(data.length === 0) return `<tr><td colspan="4" class="text-center py-10 text-slate-500 font-bold">검색 결과가 없습니다.</td></tr>`;
        return data.map(log => {
            const compName = log.host.split(' ')[0];
            const nameClickHtml = `<span onclick="app.openMonitoringModal('${compName}')" class="cursor-pointer text-teal-700 hover:text-teal-900 hover:underline font-bold transition-colors">${log.host}</span>`;
            return `<tr class="hover:bg-slate-50"><td class="px-4 py-3 text-slate-500 font-mono font-medium">${log.time}</td><td class="px-4 py-3 text-center"><span class="${log.color} font-bold px-2 py-0.5 rounded border text-[11px]">${log.type}</span></td><td class="px-4 py-3 text-slate-800">${nameClickHtml}</td><td class="px-4 py-3 text-slate-700 font-medium">${log.msg}</td></tr>`;
        }).join('');
    },
    filterLogs() {
        const keyword = document.getElementById('search-input').value.toLowerCase();
        const filtered = DB.getLogs().filter(l => l.host.toLowerCase().includes(keyword) || l.msg.toLowerCase().includes(keyword) || l.type.toLowerCase().includes(keyword));
        document.getElementById('log-tbody').innerHTML = this.buildLogRows(filtered);
    },
    renderFlagHistory() {
        return `<div class="max-w-[1400px] mx-auto"><div class="flex justify-between items-end mb-4"><div><h2 class="text-lg font-bold text-slate-800 tracking-tight">시스템 수신 이력 상세 (로그)</h2><p class="text-xs text-slate-500 mt-1">에이전트 통신 상태 변경 및 시스템 자동 조치 내역을 시간순으로 추적합니다.</p></div><div class="flex items-center space-x-2"><div class="relative"><i class="fa-solid fa-magnifying-glass absolute left-2.5 top-2 text-slate-400 text-xs"></i><input type="text" id="search-input" onkeyup="controlViews.filterLogs()" placeholder="로그 메시지, 고객사 검색" class="pl-7 pr-3 py-1.5 border border-slate-300 rounded text-xs focus:border-teal-500 outline-none w-64 font-medium"></div><button class="border border-slate-300 bg-white px-3 py-1.5 rounded text-xs font-bold text-slate-600 hover:bg-slate-50 shadow-sm"><i class="fa-solid fa-download mr-1.5"></i>엑셀(CSV) 다운로드</button></div></div><div class="bg-white border border-slate-200 rounded shadow-sm overflow-hidden"><div class="overflow-y-auto max-h-[650px] relative"><table class="w-full text-left whitespace-nowrap"><thead class="bg-slate-50 text-[12px] text-slate-500 border-b border-slate-200 sticky top-0 z-10"><tr><th class="px-4 py-3 font-bold w-44">발생 일시 (역순)</th><th class="px-4 py-3 font-bold w-24 text-center">심각도</th><th class="px-4 py-3 font-bold w-56">발생 위치 (고객사명)</th><th class="px-4 py-3 font-bold">이벤트 상세 내역</th></tr></thead><tbody id="log-tbody" class="text-xs text-slate-700 divide-y divide-slate-100">${this.buildLogRows(DB.getLogs())}</tbody></table></div></div></div>`;
    },

    changeVipStatus(id, selectElement) {
        const isVip = selectElement.value === 'vip';
        const host = DB.getHosts().find(h => h.id === id);
        if(host) {
            host.isVip = isVip;
            this.filterGroupManage();
            const btn = document.getElementById('batch-save-btn');
            const orig = btn.innerHTML;
            btn.innerHTML = `<i class="fa-solid fa-check mr-1"></i> 반영됨`;
            btn.classList.replace('bg-slate-800', 'bg-teal-600');
            setTimeout(() => { btn.innerHTML = orig; btn.classList.replace('bg-teal-600', 'bg-slate-800'); }, 1000);
        }
    },
    buildGroupRows(data) {
        if(data.length === 0) return `<tr><td colspan="6" class="text-center py-10 text-slate-500 font-bold">검색 결과가 없습니다.</td></tr>`;
        return data.map(item => {
            const nameClickHtml = `<span onclick="app.openMonitoringModal('${item.name}')" class="cursor-pointer text-teal-700 hover:text-teal-900 hover:underline font-bold transition-colors text-[13px]">${item.name}</span>`;
            return `<tr class="hover:bg-slate-50 transition-colors ${item.isVip ? 'bg-blue-50/20' : ''}"><td class="px-5 py-3.5 text-center"><input type="checkbox" class="rounded border-slate-300"></td><td class="px-5 py-3.5">${nameClickHtml}<span class="text-[10px] text-slate-400 font-mono ml-2">ID: ${item.id}</span></td><td class="px-5 py-3.5 font-mono font-bold">${item.terminals}대</td><td class="px-5 py-3.5 ${item.errorCount > 0 ? 'text-red-500' : 'text-slate-500'} font-bold">${item.errorCount}건</td><td class="px-5 py-3.5 text-center">${item.isVip ? '<span class="bg-blue-600 text-white px-2 py-0.5 rounded text-[10px] font-bold shadow-sm">VIP 고객사</span>' : '<span class="bg-slate-100 border border-slate-200 text-slate-500 px-2 py-0.5 rounded text-[10px] font-bold">일반 고객사</span>'}</td><td class="px-5 py-3.5"><select onchange="controlViews.changeVipStatus('${item.id}', this)" class="border border-slate-300 rounded px-2 py-1 outline-none text-[11px] font-bold ${item.isVip ? 'text-blue-700' : 'text-slate-600'} bg-white cursor-pointer hover:border-blue-400"><option value="vip" ${item.isVip ? 'selected' : ''}>VIP로 설정</option><option value="normal" ${!item.isVip ? 'selected' : ''}>일반 유지/강등</option></select></td></tr>`;
        }).join('');
    },
    filterGroupManage() {
        const keyword = document.getElementById('group-search-input').value.toLowerCase();
        const filtered = DB.getHosts().filter(h => h.name.toLowerCase().includes(keyword) || h.id.toLowerCase().includes(keyword));
        document.getElementById('group-manage-tbody').innerHTML = this.buildGroupRows(filtered);
    },
    renderGroupManage() {
        return `<div class="max-w-[1400px] mx-auto"><div class="flex justify-between items-end mb-4"><div><h2 class="text-lg font-bold text-slate-800 tracking-tight">고객사 관제 등급 (VIP/일반) 설정</h2><p class="text-xs text-slate-500 mt-1">집중 관제가 필요한 중요 고객사를 VIP로 설정하여 대시보드 필터에 반영합니다.</p></div><div class="flex items-center space-x-2"><div class="relative"><i class="fa-solid fa-magnifying-glass absolute left-2.5 top-2 text-slate-400 text-xs"></i><input type="text" id="group-search-input" onkeyup="controlViews.filterGroupManage()" placeholder="고객사명 검색" class="pl-7 pr-3 py-1.5 border border-slate-300 rounded text-xs outline-none focus:border-teal-500 w-56 font-medium"></div><button id="batch-save-btn" class="bg-slate-800 text-white px-3 py-1.5 rounded text-xs font-bold shadow-sm transition-colors">선택 항목 일괄 저장</button></div></div><div class="bg-white border border-slate-200 rounded shadow-sm overflow-hidden"><div class="overflow-y-auto max-h-[650px] relative"><table class="w-full text-left border-collapse whitespace-nowrap"><thead class="bg-slate-50 text-[12px] text-slate-500 border-b border-slate-200 sticky top-0 z-10"><tr><th class="px-5 py-3 font-bold w-12 text-center"><input type="checkbox" class="rounded border-slate-300"></th><th class="px-5 py-3 font-bold">고객사명</th><th class="px-5 py-3 font-bold">설치된 단말 수</th><th class="px-5 py-3 font-bold">최근 한 달 장애 건수</th><th class="px-5 py-3 font-bold text-center">현재 관제 등급</th><th class="px-5 py-3 font-bold">등급 설정 변경</th></tr></thead><tbody id="group-manage-tbody" class="text-xs text-slate-700 divide-y divide-slate-100">${this.buildGroupRows(DB.getHosts())}</tbody></table></div></div></div>`;
    },

    generateNewReport() {
        const typeObj = document.querySelector('input[name="rpt-type"]:checked');
        const groupObj = document.getElementById('rpt-group');
        const startDate = document.getElementById('rpt-start').value;
        const endDate = document.getElementById('rpt-end').value;

        if(!typeObj || !startDate || !endDate) return alert('보고서 생성 조건을 모두 확인해주세요.');

        const type = typeObj.value;
        const group = groupObj.value;
        
        let typeName = type === 'daily' ? '일간' : (type === 'weekly' ? '주간' : '월간');
        let groupName = group === 'vip' ? 'VIP 대상' : '통합';
        
        const today = new Date();
        const createdStr = `${today.getFullYear()}.${String(today.getMonth()+1).padStart(2,'0')}.${String(today.getDate()).padStart(2,'0')}`;
        
        const newReport = {
            id: 'RPT-' + Math.floor(Math.random() * 10000),
            type: type,
            typeName: typeName,
            title: `[${groupName}] 시스템 운영 ${typeName} 리포트`,
            dateRange: `${startDate.replace(/-/g, '.')} ~ ${endDate.replace(/-/g, '.')}`,
            group: group,
            groupName: group === 'vip' ? 'VIP 고객사' : '전체 고객사',
            created: createdStr,
            format: 'pdf'
        };

        const btn = document.getElementById('btn-generate');
        const orig = btn.innerHTML;
        btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-2"></i>데이터 집계 중...`;
        btn.classList.replace('bg-slate-800', 'bg-slate-500');

        setTimeout(() => {
            DB.addReport(newReport);
            this.refreshReportList();
            
            btn.innerHTML = `<i class="fa-solid fa-check mr-2"></i>보고서 생성 완료!`;
            btn.classList.replace('bg-slate-500', 'bg-teal-600');
            setTimeout(() => { btn.innerHTML = orig; btn.classList.replace('bg-teal-600', 'bg-slate-800'); }, 2000);
        }, 1200);
    },

    buildReportListHtml() {
        if(DB.getReports().length === 0) return `<tr><td colspan="5" class="text-center py-6">생성된 보고서가 없습니다.</td></tr>`;
        return DB.getReports().map(r => `
            <tr class="hover:bg-slate-50 transition-colors cursor-pointer" onclick="controlViews.openReportPreview('${r.id}')">
                <td class="px-5 py-3.5 text-center"><i class="fa-solid fa-file-${r.format === 'excel' ? 'excel text-green-600' : 'pdf text-red-500'} text-xl"></i></td>
                <td class="px-5 py-3.5"><p class="font-bold text-slate-800 text-[13px] hover:text-teal-600">${r.title}</p><p class="text-[10px] text-slate-400 mt-0.5">클릭하여 보고서 미리보기</p></td>
                <td class="px-5 py-3.5 font-mono font-bold text-slate-600">${r.dateRange}</td>
                <td class="px-5 py-3.5 text-center text-slate-500">${r.created}</td>
                <td class="px-5 py-3.5 text-right">
                    <button onclick="event.stopPropagation(); controlViews.downloadReport('${r.id}')" class="border border-slate-300 bg-white px-3 py-1.5 rounded text-[11px] font-bold text-slate-700 hover:bg-slate-50 shadow-sm"><i class="fa-solid fa-download mr-1.5"></i>다운로드</button>
                </td>
            </tr>
        `).join('');
    },

    refreshReportList() {
        document.getElementById('report-list-tbody').innerHTML = this.buildReportListHtml();
    },

    openReportPreview(id) {
        const report = DB.getReports().find(r => r.id === id);
        if(!report) return;

        let filteredHosts = DB.getHosts();
        if(report.group === 'vip') filteredHosts = DB.getHosts().filter(h => h.isVip);
        
        const total = filteredHosts.length;
        const errs = filteredHosts.filter(h => h.status === 'critical').length;
        const uptime = (100 - (errs / total)).toFixed(2);

        const modalHtml = `
        <div id="report-modal" class="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center backdrop-blur-sm p-6 opacity-0 transition-opacity duration-300">
            <div class="bg-white w-full max-w-[800px] h-[90vh] rounded-lg shadow-2xl flex flex-col overflow-hidden scale-95 transition-transform duration-300" id="report-modal-content">
                
                <div class="px-6 py-4 bg-slate-800 text-white flex justify-between items-center shrink-0">
                    <div class="flex items-center"><i class="fa-solid fa-file-contract mr-2 text-teal-400"></i><span class="font-bold text-sm">보고서 미리보기 (Preview)</span></div>
                    <div class="flex space-x-2">
                        <button onclick="controlViews.downloadReport('${report.id}')" class="px-3 py-1 bg-teal-600 hover:bg-teal-500 rounded text-xs font-bold transition"><i class="fa-solid fa-download mr-1"></i>다운로드</button>
                        <button onclick="controlViews.closeReportPreview()" class="px-3 py-1 bg-slate-600 hover:bg-slate-500 rounded text-xs font-bold transition"><i class="fa-solid fa-xmark mr-1"></i>닫기</button>
                    </div>
                </div>

                <div id="printable-report" class="flex-1 overflow-y-auto p-10 bg-[#f1f5f9] flex flex-col items-center">
                    <div class="bg-white w-full max-w-[700px] min-h-[900px] p-12 shadow-md border border-slate-200">
                        <div class="border-b-2 border-slate-800 pb-4 mb-8 flex justify-between items-end">
                            <div>
                                <h1 class="text-3xl font-black text-slate-900 tracking-tight">${report.title}</h1>
                                <p class="text-sm font-bold text-slate-500 mt-2">조회 기간: ${report.dateRange}</p>
                            </div>
                            <div class="text-right">
                                <div class="text-xl font-black text-teal-700 tracking-tighter">Hana 통합관제센터</div>
                                <p class="text-xs text-slate-400 mt-1">발행일: ${report.created}</p>
                            </div>
                        </div>

                        <h2 class="text-lg font-bold text-slate-800 mb-3 border-l-4 border-teal-600 pl-2">1. 운영 요약 (Executive Summary)</h2>
                        <div class="grid grid-cols-3 gap-4 mb-8">
                            <div class="bg-slate-50 p-4 border border-slate-200 text-center"><p class="text-xs font-bold text-slate-500 mb-1">대상 단말 수</p><p class="text-2xl font-black text-slate-800">${total}대</p></div>
                            <div class="bg-slate-50 p-4 border border-slate-200 text-center"><p class="text-xs font-bold text-slate-500 mb-1">평균 가동률</p><p class="text-2xl font-black text-teal-600">${uptime}%</p></div>
                            <div class="bg-red-50 p-4 border border-red-200 text-center"><p class="text-xs font-bold text-red-600 mb-1">총 장애 발생</p><p class="text-2xl font-black text-red-600">${errs * (report.type === 'monthly'? 15 : 3)}건</p></div>
                        </div>

                        <h2 class="text-lg font-bold text-slate-800 mb-3 border-l-4 border-teal-600 pl-2">2. 마케팅 데이터 수집 성과</h2>
                        <table class="w-full text-left border-collapse mb-8 text-sm">
                            <thead class="bg-slate-100 border-b border-slate-300">
                                <tr><th class="p-3 font-bold text-slate-600">구분</th><th class="p-3 font-bold text-slate-600 text-right">수집 건수</th><th class="p-3 font-bold text-slate-600 text-right">추정 금액</th><th class="p-3 font-bold text-slate-600">영업 활용 방안</th></tr>
                            </thead>
                            <tbody>
                                <tr class="border-b border-slate-200"><td class="p-3 font-bold">전자어음 / B2B</td><td class="p-3 text-right font-mono">${report.type === 'daily' ? '42' : '345'}건</td><td class="p-3 text-right font-mono text-teal-700 font-bold">약 1,500억</td><td class="p-3">대출(여신) 제안</td></tr>
                                <tr class="border-b border-slate-200"><td class="p-3 font-bold">법인카드 (타행)</td><td class="p-3 text-right font-mono">${report.type === 'daily' ? '120' : '1,250'}건</td><td class="p-3 text-right font-mono text-teal-700 font-bold">약 85억</td><td class="p-3">주유 특화카드 타겟팅</td></tr>
                                <tr><td class="p-3 font-bold">세금계산서</td><td class="p-3 text-right font-mono">${report.type === 'daily' ? '850' : '12,500'}건</td><td class="p-3 text-right font-mono text-teal-700 font-bold">-</td><td class="p-3">기업 여신 평가 모델링</td></tr>
                            </tbody>
                        </table>

                        <p class="text-xs text-slate-400 text-center mt-20 border-t border-slate-200 pt-4">- 본 문서는 통합관제 시스템에서 자동 생성되었습니다 -</p>
                    </div>
                </div>
            </div>
        </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        setTimeout(() => {
            document.getElementById('report-modal').classList.remove('opacity-0');
            document.getElementById('report-modal-content').classList.remove('scale-95');
        }, 10);
    },

    closeReportPreview() {
        const modal = document.getElementById('report-modal');
        if(modal) {
            modal.classList.add('opacity-0');
            document.getElementById('report-modal-content').classList.add('scale-95');
            setTimeout(() => modal.remove(), 300);
        }
    },

    downloadReport(id) {
        const report = DB.getReports().find(r => r.id === id);
        if(!report) return;

        const content = `<html><head><title>${report.title}</title><meta charset="utf-8"></head><body style="font-family:sans-serif; padding:50px;"><h1>${report.title}</h1><p>조회기간: ${report.dateRange}</p><hr><p>성공적으로 다운로드 되었습니다.</p></body></html>`;
        
        const blob = new Blob([content], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${report.title.replace(/ /g, '_')}_${report.created}.html`;
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    },

    renderReportView() {
        setTimeout(() => { this.refreshReportList(); }, 0);

        return `
        <div class="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div class="lg:col-span-4 bg-white border border-slate-200 rounded shadow-sm p-6 h-fit">
                <h3 class="font-bold text-slate-800 text-[15px] mb-5 border-b border-slate-100 pb-3"><i class="fa-solid fa-file-contract text-teal-600 mr-2"></i>보고서 생성 조건 설정</h3>
                
                <div class="space-y-5">
                    <div>
                        <label class="block text-xs font-bold text-slate-700 mb-2">보고서 유형 (Type)</label>
                        <div class="flex space-x-2">
                            <label class="flex-1 cursor-pointer">
                                <input type="radio" name="rpt-type" value="daily" class="peer sr-only" checked>
                                <div class="text-center py-2 border border-slate-300 rounded text-[11px] font-bold text-slate-600 peer-checked:bg-teal-50 peer-checked:text-teal-700 peer-checked:border-teal-500 peer-checked:ring-1 peer-checked:ring-teal-500 transition">일간 (Daily)</div>
                            </label>
                            <label class="flex-1 cursor-pointer">
                                <input type="radio" name="rpt-type" value="weekly" class="peer sr-only">
                                <div class="text-center py-2 border border-slate-300 rounded text-[11px] font-bold text-slate-600 peer-checked:bg-teal-50 peer-checked:text-teal-700 peer-checked:border-teal-500 peer-checked:ring-1 peer-checked:ring-teal-500 transition">주간 (Weekly)</div>
                            </label>
                            <label class="flex-1 cursor-pointer">
                                <input type="radio" name="rpt-type" value="monthly" class="peer sr-only">
                                <div class="text-center py-2 border border-slate-300 rounded text-[11px] font-bold text-slate-600 peer-checked:bg-teal-50 peer-checked:text-teal-700 peer-checked:border-teal-500 peer-checked:ring-1 peer-checked:ring-teal-500 transition">월간 (Monthly)</div>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-slate-700 mb-2">조회 기간 설정</label>
                        <div class="flex items-center space-x-2">
                            <input type="date" id="rpt-start" value="2026-02-23" class="border border-slate-300 rounded px-2 py-1.5 text-xs text-slate-700 w-full outline-none focus:border-teal-500">
                            <span class="text-slate-400 font-bold">~</span>
                            <input type="date" id="rpt-end" value="2026-03-01" class="border border-slate-300 rounded px-2 py-1.5 text-xs text-slate-700 w-full outline-none focus:border-teal-500">
                        </div>
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-slate-700 mb-2">대상 고객사 그룹</label>
                        <select id="rpt-group" class="w-full border border-slate-300 rounded px-3 py-2 text-xs text-slate-700 outline-none focus:border-teal-500 font-medium">
                            <option value="all">전체 고객사 통합 보고서</option>
                            <option value="vip">VIP 고객사 전용 보고서</option>
                        </select>
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-slate-700 mb-2">포함할 데이터 섹션</label>
                        <div class="space-y-2 bg-slate-50 p-3 rounded border border-slate-100">
                            <label class="flex items-center space-x-2 cursor-pointer"><input type="checkbox" checked class="rounded border-slate-300 text-teal-600"><span class="text-[11px] font-bold text-slate-600">시스템 가동률 및 장애 요약</span></label>
                            <label class="flex items-center space-x-2 cursor-pointer"><input type="checkbox" checked class="rounded border-slate-300 text-teal-600"><span class="text-[11px] font-bold text-slate-600">Watcher 자동 복구 성과표</span></label>
                            <label class="flex items-center space-x-2 cursor-pointer"><input type="checkbox" checked class="rounded border-slate-300 text-teal-600"><span class="text-[11px] font-bold text-slate-600">수집된 데이터 마케팅 활용 실적</span></label>
                        </div>
                    </div>
                </div>

                <div class="mt-6 pt-4 border-t border-slate-100">
                    <button id="btn-generate" onclick="controlViews.generateNewReport()" class="w-full bg-slate-800 text-white font-bold py-2.5 rounded shadow-sm hover:bg-slate-700 transition flex items-center justify-center text-[13px]">
                        <i class="fa-solid fa-wand-magic-sparkles mr-2"></i>보고서 생성 (Generate)
                    </button>
                </div>
            </div>

            <div class="lg:col-span-8 flex flex-col space-y-4">
                <div class="bg-white border border-slate-200 rounded shadow-sm p-1">
                    <div class="flex border-b border-slate-100">
                        <button class="px-5 py-3 text-[13px] font-bold text-teal-600 border-b-2 border-teal-600">생성된 보고서 보관함</button>
                        <button class="px-5 py-3 text-[13px] font-bold text-slate-500 hover:text-slate-800">예약 발송 설정</button>
                    </div>
                </div>

                <div class="bg-white border border-slate-200 rounded shadow-sm overflow-hidden flex-1">
                    <div class="overflow-y-auto max-h-[700px]">
                        <table class="w-full text-left whitespace-nowrap">
                            <thead class="bg-slate-50 text-[12px] text-slate-500 border-b border-slate-200 sticky top-0">
                                <tr>
                                    <th class="px-5 py-3 font-bold w-12 text-center">형식</th>
                                    <th class="px-5 py-3 font-bold">보고서 명칭</th>
                                    <th class="px-5 py-3 font-bold">조회 대상 기간</th>
                                    <th class="px-5 py-3 font-bold text-center">생성 일자</th>
                                    <th class="px-5 py-3 font-bold text-right">다운로드</th>
                                </tr>
                            </thead>
                            <tbody id="report-list-tbody" class="text-xs text-slate-700 divide-y divide-slate-100">
                                </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
        `;
    },

    renderSettings(state) {
        return `
        <div class="max-w-[800px] mx-auto">
            <div class="mb-6 border-b border-slate-200 pb-4">
                <h2 class="text-lg font-bold text-slate-800 tracking-tight">모니터링 정책 및 알림 설정</h2>
                <p class="text-xs text-slate-500 mt-1">시스템에서 장애를 판단하는 전역 임계값과 관리자 알림 수신 채널을 설정합니다.</p>
            </div>
            <div class="bg-white border border-slate-200 rounded p-6 mb-6 shadow-sm">
                <h3 class="text-[13px] font-bold text-slate-800 mb-5 pb-2 border-b border-slate-100"><i class="fa-solid fa-stopwatch text-teal-600 mr-2"></i>상태 판별 임계값 설정</h3>
                <div class="space-y-4 max-w-[450px]">
                    <div class="flex items-center justify-between"><div><label class="block text-sm font-bold text-slate-700">정상 통신 기준 시간</label></div><div class="relative w-28"><input type="number" id="norm-input" value="${state.normalThreshold}" class="w-full text-right pr-7 pl-2 py-1.5 border border-slate-300 rounded text-sm font-mono font-bold focus:border-teal-500 outline-none"><span class="absolute right-3 top-1.5 text-xs text-slate-500 font-bold">분</span></div></div>
                    <div class="flex items-center justify-between border-t border-slate-100 pt-4"><div><label class="block text-sm font-bold text-yellow-600">수신 지연 (주의) 기준</label></div><div class="relative w-28"><input type="number" id="warn-input" value="${state.warningThreshold}" class="w-full text-right pr-7 pl-2 py-1.5 border border-slate-300 rounded text-sm font-mono font-bold focus:border-teal-500 outline-none"><span class="absolute right-3 top-1.5 text-xs text-slate-500 font-bold">분</span></div></div>
                    <div class="flex items-center justify-between border-t border-slate-100 pt-4"><div><label class="block text-sm font-bold text-red-600">장애 판단 및 복구 개입 기준</label></div><div class="relative w-28"><input type="number" id="err-input" value="${state.errorThreshold}" class="w-full text-right pr-7 pl-2 py-1.5 border border-red-300 rounded text-sm font-mono font-bold focus:border-red-500 outline-none text-red-700 bg-red-50"><span class="absolute right-3 top-1.5 text-xs text-red-500 font-bold">분</span></div></div>
                </div>
            </div>
            <div class="bg-white border border-slate-200 rounded p-6 mb-6 shadow-sm">
                <h3 class="text-[13px] font-bold text-slate-800 mb-5 pb-2 border-b border-slate-100"><i class="fa-solid fa-bell text-blue-600 mr-2"></i>장애 발생 시 알림 수신 채널 설정</h3>
                <div class="space-y-4 max-w-[450px]">
                    <div class="flex items-center justify-between"><div><label class="block text-sm font-bold text-slate-700">이메일 알림 수신</label><span class="text-[11px] text-slate-400">admin@hana.com 외 2명</span></div><label class="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked class="sr-only peer"><div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-500"></div></label></div>
                    <div class="flex items-center justify-between border-t border-slate-100 pt-4"><div><label class="block text-sm font-bold text-slate-700">긴급 SMS (문자) 알림 수신</label><span class="text-[11px] text-slate-400">장애 발생 시 즉시 발송</span></div><label class="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked class="sr-only peer"><div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-500"></div></label></div>
                </div>
            </div>
            <div class="flex justify-start"><button id="save-btn" onclick="app.saveSettings()" class="bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 px-6 rounded text-sm shadow-sm">설정 내용 저장 및 적용</button></div>
        </div>
        `;
    }
};