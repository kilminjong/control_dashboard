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
            if (item.status === 'persistent') return `<tr class="hover:bg-purple-50/30 transition-colors"><td class="px-4 py-3 text-center"><input type="checkbox" class="rounded border-slate-300"></td><td class="px-4 py-3"><div class="flex items-center font-bold text-purple-600"><span class="w-2 h-2 rounded-full bg-purple-500 mr-2 shadow-[0_0_4px_rgba(168,85,247,0.6)]"></span>지속 장애</div><span class="text-[9px] text-purple-500 ml-4">재구동 ${item.rebootAttempts||0}회 실패</span></td><td class="px-4 py-3">${nameClickHtml}<span class="text-[10px] text-slate-400 font-mono bg-slate-100 px-1.5 py-0.5 rounded ml-1">${item.id}</span></td><td class="px-4 py-3"><p class="font-mono text-slate-600 font-medium">${item.ip}</p><p class="text-[10px] text-slate-400 mt-0.5">${item.os}</p></td><td class="px-4 py-3"><p class="text-purple-600 font-bold font-mono">${item.lastPing}</p><p class="text-[10px] text-slate-500 mt-0.5">${item.elapsed}</p></td><td class="px-4 py-3 text-right"><button onclick="app.openMonitoringModal('${item.name}')" class="text-[11px] px-2.5 py-1.5 border border-purple-300 rounded bg-purple-600 text-white font-bold hover:bg-purple-700 shadow-sm"><i class="fa-solid fa-truck-medical mr-1"></i>현장 점검</button></td></tr>`;
            else if (item.status === 'critical') return `<tr class="hover:bg-slate-50 transition-colors"><td class="px-4 py-3 text-center"><input type="checkbox" class="rounded border-slate-300"></td><td class="px-4 py-3"><div class="flex items-center font-bold text-red-600"><span class="w-2 h-2 rounded-full bg-red-500 mr-2 shadow-[0_0_4px_rgba(239,68,68,0.6)]"></span>장애 발생</div></td><td class="px-4 py-3">${nameClickHtml}<span class="text-[10px] text-slate-400 font-mono bg-slate-100 px-1.5 py-0.5 rounded ml-1">${item.id}</span></td><td class="px-4 py-3"><p class="font-mono text-slate-600 font-medium">${item.ip}</p><p class="text-[10px] text-slate-400 mt-0.5">${item.os}</p></td><td class="px-4 py-3"><p class="text-red-600 font-bold font-mono">${item.lastPing}</p><p class="text-[10px] text-slate-500 mt-0.5">통신 끊김 <span class="font-bold">${item.elapsed}</span></p></td><td class="px-4 py-3 text-right"><button onclick="app.openMonitoringModal('${item.name}')" class="text-[11px] px-2.5 py-1.5 bg-slate-800 text-white rounded font-bold hover:bg-slate-700 shadow-sm mr-1"><i class="fa-solid fa-rotate-right mr-1"></i>재구동</button><button onclick="app.openMonitoringModal('${item.name}')" class="text-[11px] px-2.5 py-1.5 border border-teal-300 bg-teal-50 text-teal-700 rounded font-bold hover:bg-teal-100 shadow-sm"><i class="fa-solid fa-network-wired mr-1"></i>Ping</button></td></tr>`;
            else if (item.status === 'warning') return `<tr class="hover:bg-slate-50 transition-colors"><td class="px-4 py-3 text-center"><input type="checkbox" class="rounded border-slate-300"></td><td class="px-4 py-3"><div class="flex items-center font-bold text-yellow-600"><span class="w-2 h-2 rounded-full bg-yellow-400 mr-2"></span>수신 지연 (주의)</div></td><td class="px-4 py-3">${nameClickHtml}<span class="text-[10px] text-slate-400 font-mono bg-slate-100 px-1.5 py-0.5 rounded ml-1">${item.id}</span></td><td class="px-4 py-3"><p class="font-mono text-slate-600 font-medium">${item.ip}</p><p class="text-[10px] text-slate-400 mt-0.5">${item.os}</p></td><td class="px-4 py-3"><p class="text-yellow-600 font-bold font-mono">${item.lastPing}</p><p class="text-[10px] text-slate-500 mt-0.5">지연 발생 <span class="font-bold">${item.elapsed}</span></p></td><td class="px-4 py-3 text-right"><button onclick="app.openMonitoringModal('${item.name}')" class="text-[11px] px-2.5 py-1.5 border border-amber-300 bg-amber-50 text-amber-700 rounded font-bold hover:bg-amber-100 shadow-sm"><i class="fa-solid fa-network-wired mr-1"></i>Ping 테스트</button></td></tr>`;
            else return `<tr class="hover:bg-slate-50 transition-colors"><td class="px-4 py-3 text-center"><input type="checkbox" class="rounded border-slate-300"></td><td class="px-4 py-3"><div class="flex items-center font-bold text-teal-600"><span class="w-2 h-2 rounded-full bg-teal-500 mr-2"></span>정상 통신</div></td><td class="px-4 py-3">${nameClickHtml}<span class="text-[10px] text-slate-400 font-mono bg-slate-100 px-1.5 py-0.5 rounded ml-1">${item.id}</span></td><td class="px-4 py-3"><p class="font-mono text-slate-600 font-medium">${item.ip}</p><p class="text-[10px] text-slate-400 mt-0.5">${item.os}</p></td><td class="px-4 py-3"><p class="text-slate-600 font-bold font-mono">${item.lastPing}</p><p class="text-[10px] text-slate-500 mt-0.5">1분 이내 정상 수신</p></td><td class="px-4 py-3 text-right"><button onclick="app.openMonitoringModal('${item.name}')" class="text-[11px] text-slate-500 hover:text-teal-600 font-bold hover:underline"><i class="fa-solid fa-magnifying-glass mr-1"></i>상세 조회</button></td></tr>`;
        }).join('');
    },
    filterPcStatus() {
        const keyword = document.getElementById('search-input').value.toLowerCase();
        const statusVal = document.getElementById('status-filter').value;
        const filtered = DB.getHosts().filter(h => {
            const matchKeyword = h.name.toLowerCase().includes(keyword) || h.ip.includes(keyword) || h.id.toLowerCase().includes(keyword);
            const matchStatus = statusVal === 'all' ? true : (statusVal === 'critical' ? (h.status === 'critical' || h.status === 'warning' || h.status === 'persistent') : (statusVal === 'persistent' ? h.status === 'persistent' : true));
            return matchKeyword && matchStatus;
        });
        document.getElementById('pc-status-tbody').innerHTML = this.buildPcStatusRows(filtered);
        document.getElementById('pc-count').innerText = `필터링 결과: ${filtered.length}건`;
    },
    renderPcStatus() {
        return `<div class="max-w-[1400px] mx-auto"><div class="grid grid-cols-4 gap-4 mb-5"><div class="bg-white border border-slate-200 p-3 rounded flex justify-between items-center shadow-sm"><span class="text-xs font-bold text-slate-500">전체 관제 단말</span><span class="text-lg font-bold text-slate-800">300대</span></div><div class="bg-teal-50 border border-teal-200 p-3 rounded flex justify-between items-center shadow-sm"><span class="text-xs font-bold text-teal-700">정상 동작 중</span><span class="text-lg font-bold text-teal-700">285대</span></div><div class="bg-yellow-50 border border-yellow-200 p-3 rounded flex justify-between items-center shadow-sm"><span class="text-xs font-bold text-yellow-700">수신 지연 (주의)</span><span class="text-lg font-bold text-yellow-700">12대</span></div><div class="bg-red-50 border border-red-200 p-3 rounded flex justify-between items-center shadow-sm"><span class="text-xs font-bold text-red-700">연결 끊김 (장애)</span><span class="text-lg font-bold text-red-700">3대</span></div></div><div class="flex justify-between items-end mb-4"><div><h2 class="text-lg font-bold text-slate-800 tracking-tight">단말 상태 관제 리스트<span class="info-tip"><i class="fa-solid fa-circle-info"></i><span class="tip-box"><b>수집:</b> Agent ID, IP, OS, Flag 수신 시각<br>임계값(5/10/30분)과 비교하여 상태를 자동 판별합니다.</span></span></h2></div><div class="flex items-center space-x-2"><div class="relative"><i class="fa-solid fa-magnifying-glass absolute left-2.5 top-2 text-slate-400 text-xs"></i><input type="text" id="search-input" onkeyup="controlViews.filterPcStatus()" placeholder="고객사명, IP 주소 검색" class="pl-7 pr-3 py-1.5 border border-slate-300 rounded text-xs focus:border-teal-500 outline-none w-56 font-medium"></div><select id="status-filter" onchange="controlViews.filterPcStatus()" class="border border-slate-300 rounded text-xs px-2 py-1.5 text-slate-700 outline-none focus:border-teal-500 font-medium"><option value="all">전체 상태 보기</option><option value="critical">장애/주의 대상만 필터링</option></select><button class="border border-slate-300 bg-white px-3 py-1.5 rounded text-xs font-bold text-slate-600 hover:bg-slate-50 shadow-sm"><i class="fa-solid fa-rotate-right mr-1.5"></i>새로고침</button></div></div><div class="bg-white border border-slate-200 rounded shadow-sm overflow-hidden"><div class="overflow-y-auto max-h-[600px] relative"><table class="w-full text-left border-collapse whitespace-nowrap"><thead class="bg-slate-50 text-[12px] text-slate-500 border-b border-slate-200 sticky top-0 z-10"><tr><th class="px-4 py-3 font-bold text-center w-10"><input type="checkbox" class="rounded border-slate-300"></th><th class="px-4 py-3 font-bold">현재 상태</th><th class="px-4 py-3 font-bold">고객사 정보 (ID)</th><th class="px-4 py-3 font-bold">단말 IP / OS 환경</th><th class="px-4 py-3 font-bold">최근 통신 수신 (경과)</th><th class="px-4 py-3 font-bold text-right">조치</th></tr></thead><tbody id="pc-status-tbody" class="text-xs text-slate-700 divide-y divide-slate-100">${this.buildPcStatusRows(DB.getHosts())}</tbody></table></div><div class="px-4 py-3 border-t border-slate-200 bg-slate-50 flex justify-between items-center text-xs text-slate-500 font-bold"><span id="pc-count">전체 ${DB.getHosts().length}대 중 ${DB.getHosts().length}대 표시 중</span><div class="flex space-x-1"><button class="px-2 py-1 border rounded bg-white">이전</button><button class="px-2 py-1 border rounded bg-slate-800 text-white">1</button><button class="px-2 py-1 border rounded bg-white">다음</button></div></div></div></div>`;
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
        const counts = DB.getFlagCounts();
        const flags = DB.getFlagMessages();
        return `<div class="max-w-[1400px] mx-auto">
            <div class="grid grid-cols-6 gap-3 mb-5">
                <div class="bg-teal-50 border border-teal-200 p-3 rounded text-center shadow-sm cursor-pointer hover:shadow-md" onclick="controlViews.filterFlags('FLAG_ACK')"><p class="text-[10px] font-bold text-teal-700 mb-1">정상 수신</p><p class="text-lg font-bold text-teal-800">${counts.FLAG_ACK}</p></div>
                <div class="bg-yellow-50 border border-yellow-200 p-3 rounded text-center shadow-sm cursor-pointer hover:shadow-md" onclick="controlViews.filterFlags('LATENCY_WARN')"><p class="text-[10px] font-bold text-yellow-700 mb-1">1회 미수신 (지연)</p><p class="text-lg font-bold text-yellow-800">${counts.LATENCY_WARN}</p></div>
                <div class="bg-red-50 border border-red-200 p-3 rounded text-center shadow-sm cursor-pointer hover:shadow-md" onclick="controlViews.filterFlags('TIMEOUT')"><p class="text-[10px] font-bold text-red-700 mb-1">2회+ 미수신 (장애)</p><p class="text-lg font-bold text-red-800">${counts.TIMEOUT}</p></div>
                <div class="bg-blue-50 border border-blue-200 p-3 rounded text-center shadow-sm cursor-pointer hover:shadow-md" onclick="controlViews.filterFlags('REBOOT_CMD')"><p class="text-[10px] font-bold text-blue-700 mb-1">재구동 명령 전송</p><p class="text-lg font-bold text-blue-800">${counts.REBOOT_CMD}</p></div>
                <div class="bg-green-50 border border-green-200 p-3 rounded text-center shadow-sm cursor-pointer hover:shadow-md" onclick="controlViews.filterFlags('REBOOT_OK')"><p class="text-[10px] font-bold text-green-700 mb-1">재구동 성공</p><p class="text-lg font-bold text-green-800">${counts.REBOOT_OK}</p></div>
                <div class="bg-purple-50 border border-purple-200 p-3 rounded text-center shadow-sm cursor-pointer hover:shadow-md" onclick="controlViews.filterFlags('REBOOT_FAIL')"><p class="text-[10px] font-bold text-purple-700 mb-1">재구동 실패</p><p class="text-lg font-bold text-purple-800">${counts.REBOOT_FAIL}</p></div>
            </div>
            <div class="flex justify-between items-end mb-4"><h2 class="text-lg font-bold text-slate-800">Flag 메시지 수신 이력<span class="info-tip"><i class="fa-solid fa-circle-info"></i><span class="tip-box"><b>수집:</b> Agent→관제서버 Flag 전송 로그<br>모든 Flag 이벤트를 기록합니다. 고객사 클릭 시 타임라인 확인.</span></span></h2>
                <div class="flex items-center space-x-2">
                    <div class="relative"><i class="fa-solid fa-magnifying-glass absolute left-2.5 top-2 text-slate-400 text-xs"></i><input type="text" id="flag-search" onkeyup="controlViews.filterFlags()" placeholder="고객사명 검색" class="pl-7 pr-3 py-1.5 border border-slate-300 rounded text-xs focus:border-teal-500 outline-none w-56 font-medium"></div>
                    <select id="flag-type-filter" onchange="controlViews.filterFlags()" class="border border-slate-300 rounded text-xs px-2 py-1.5 outline-none focus:border-teal-500 font-medium"><option value="all">전체 유형</option><option value="FLAG_ACK">정상 수신</option><option value="LATENCY_WARN">수신 지연 (주의)</option><option value="TIMEOUT">미수신 (장애)</option><option value="REBOOT_CMD">재구동 명령</option><option value="REBOOT_OK">재구동 성공</option><option value="REBOOT_FAIL">재구동 실패</option></select>
                </div>
            </div>
            <div class="bg-white border border-slate-200 rounded shadow-sm overflow-hidden"><div class="overflow-y-auto max-h-[550px]"><table class="w-full text-left whitespace-nowrap"><thead class="bg-slate-50 text-[12px] text-slate-500 border-b border-slate-200 sticky top-0 z-10"><tr><th class="px-4 py-3 font-bold">수신 시간</th><th class="px-4 py-3 font-bold text-center">Flag 유형</th><th class="px-4 py-3 font-bold">고객사 (단말)</th><th class="px-4 py-3 font-bold">상세 내용</th><th class="px-4 py-3 font-bold text-center">지연시간</th></tr></thead>
            <tbody id="flag-tbody" class="text-xs text-slate-700 divide-y divide-slate-100">${this.buildFlagRows(flags.slice(0,300))}</tbody></table></div></div>
        </div>`;
    },

    _fLabel: { FLAG_ACK:'정상 수신', LATENCY_WARN:'수신 지연', TIMEOUT:'미수신 (장애)', REBOOT_CMD:'재구동 명령', REBOOT_OK:'재구동 성공', REBOOT_FAIL:'재구동 실패' },

    buildFlagRows(data) {
        if(!data.length) return `<tr><td colspan="5" class="text-center py-10 text-slate-500 font-bold">결과 없음</td></tr>`;
        const sm = { normal:'text-teal-600 bg-teal-50 border-teal-100', warning:'text-yellow-600 bg-yellow-50 border-yellow-100', critical:'text-red-600 bg-red-50 border-red-100', system:'text-blue-600 bg-blue-50 border-blue-100', success:'text-green-600 bg-green-50 border-green-100', error:'text-purple-600 bg-purple-50 border-purple-100' };
        return data.map(f => `<tr class="hover:bg-slate-50"><td class="px-4 py-3 text-slate-500 font-mono text-[11px]">${f.time}</td><td class="px-4 py-3 text-center"><span class="${sm[f.severity]||sm.normal} font-bold px-2 py-0.5 rounded border text-[10px]">${this._fLabel[f.code]||f.code}</span></td><td class="px-4 py-3"><span onclick="controlViews.openFlagDetail('${f.hostName}')" class="cursor-pointer text-teal-700 hover:underline font-bold text-[12px]">${f.hostName}</span><span class="text-[10px] text-slate-400 font-mono ml-1">(${f.hostId})</span></td><td class="px-4 py-3 text-slate-600 text-[11px]">${f.detail}</td><td class="px-4 py-3 text-center font-mono text-[11px] text-slate-500">${f.latency}</td></tr>`).join('');
    },

    filterFlags(typeOverride) {
        const keyword = document.getElementById('flag-search') ? document.getElementById('flag-search').value : '';
        const typeEl = document.getElementById('flag-type-filter');
        if (typeOverride && typeOverride !== 'all' && typeEl) typeEl.value = typeOverride;
        const code = typeEl ? typeEl.value : 'all';
        const data = DB.getFlagMessages({ code, keyword });
        document.getElementById('flag-tbody').innerHTML = this.buildFlagRows(data.slice(0, 300));
    },

    openFlagDetail(hostName) {
        const allFlags = DB.getFlagMessages({ keyword: hostName }).filter(f => f.hostName === hostName);
        // 시간순 오래된것 먼저 (타임라인 위→아래 = 과거→현재)
        const sorted = [...allFlags].sort((a,b) => a.time.localeCompare(b.time));
        const interval = app.state.flagInterval || 60;
        const sm = { normal:'text-teal-600 bg-teal-50 border-teal-100', warning:'text-yellow-600 bg-yellow-50 border-yellow-100', critical:'text-red-600 bg-red-50 border-red-100', system:'text-blue-600 bg-blue-50 border-blue-100', success:'text-green-600 bg-green-50 border-green-100', error:'text-purple-600 bg-purple-50 border-purple-100' };
        const ic = { normal:'fa-circle-check text-teal-500', warning:'fa-triangle-exclamation text-yellow-500', critical:'fa-circle-xmark text-red-500', system:'fa-paper-plane text-blue-500', success:'fa-rotate-right text-green-500', error:'fa-skull-crossbones text-purple-500' };
        const cnt = {}; sorted.forEach(f => { cnt[f.severity] = (cnt[f.severity]||0)+1; });
        const old = document.getElementById('flag-detail-overlay'); if(old) old.remove();
        const html = `<div id="flag-detail-overlay" onclick="controlViews.closeFlagDetail()" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[130] flex items-center justify-center" style="opacity:0;transition:opacity .3s">
            <div class="bg-white w-[1000px] max-h-[92vh] rounded-xl shadow-2xl overflow-hidden flex flex-col" onclick="event.stopPropagation()" style="transform:scale(.95);transition:transform .3s">
                <div class="p-5 bg-slate-800 text-white flex justify-between items-center shrink-0">
                    <div class="flex items-center space-x-3"><div class="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center border border-slate-600"><i class="fa-solid fa-flag text-teal-400"></i></div>
                    <div><h3 class="text-lg font-bold">${hostName} — Flag 수신 타임라인</h3><p class="text-xs text-slate-300 mt-0.5">수신 주기: <b class="text-teal-400">${interval}분</b> | 전체 <b class="text-white">${sorted.length}건</b> | 장애→재구동→복구 흐름을 시간순으로 확인</p></div></div>
                    <button onclick="controlViews.closeFlagDetail()" class="text-slate-400 hover:text-white"><i class="fa-solid fa-xmark text-xl"></i></button>
                </div>
                <div class="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
                    <div class="flex space-x-3">
                        <span class="text-[10px] font-bold px-2 py-0.5 rounded border bg-teal-50 text-teal-700 border-teal-200"><i class="fa-solid fa-circle-check mr-1"></i>정상 ${cnt.normal||0}</span>
                        <span class="text-[10px] font-bold px-2 py-0.5 rounded border bg-yellow-50 text-yellow-700 border-yellow-200"><i class="fa-solid fa-triangle-exclamation mr-1"></i>지연 ${cnt.warning||0}</span>
                        <span class="text-[10px] font-bold px-2 py-0.5 rounded border bg-red-50 text-red-700 border-red-200"><i class="fa-solid fa-circle-xmark mr-1"></i>장애 ${cnt.critical||0}</span>
                        <span class="text-[10px] font-bold px-2 py-0.5 rounded border bg-blue-50 text-blue-700 border-blue-200"><i class="fa-solid fa-paper-plane mr-1"></i>명령 ${cnt.system||0}</span>
                        <span class="text-[10px] font-bold px-2 py-0.5 rounded border bg-green-50 text-green-700 border-green-200"><i class="fa-solid fa-rotate-right mr-1"></i>성공 ${cnt.success||0}</span>
                        <span class="text-[10px] font-bold px-2 py-0.5 rounded border bg-purple-50 text-purple-700 border-purple-200"><i class="fa-solid fa-skull-crossbones mr-1"></i>실패 ${cnt.error||0}</span>
                    </div>
                    <span class="text-[10px] text-slate-400">과거 ↓ → 현재 (시간순)</span>
                </div>
                <div class="flex-1 overflow-y-auto p-6"><div class="relative pl-10">${sorted.map((f,i) => {
                    const evt = f.severity !== 'normal';
                    const lc = evt ? (f.severity==='critical'||f.severity==='error'?'bg-red-300':f.severity==='warning'?'bg-yellow-300':'bg-blue-300') : 'bg-slate-200';
                    const dc = f.severity==='normal'?'bg-teal-400 border-teal-300':f.severity==='warning'?'bg-yellow-400 border-yellow-300':f.severity==='critical'?'bg-red-500 border-red-300':f.severity==='system'?'bg-blue-500 border-blue-300':f.severity==='success'?'bg-green-500 border-green-300':'bg-purple-500 border-purple-300';
                    return `<div class="relative mb-1">${i<sorted.length-1?`<div class="absolute left-[-24px] top-7 w-0.5 h-full ${lc}"></div>`:''}<div class="absolute left-[-30px] top-2 w-3.5 h-3.5 rounded-full border-2 ${dc} shadow-sm"></div><div class="pb-2"><div class="${evt?'bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm':'py-1.5'}"><div class="flex items-center space-x-2 flex-wrap"><span class="font-mono text-[11px] text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded">${f.time}</span><span class="${sm[f.severity]||sm.normal} font-bold px-2.5 py-0.5 rounded border text-[10px]"><i class="fa-solid ${ic[f.severity]||ic.normal} mr-1"></i>${this._fLabel[f.code]||f.code}</span>${f.latency!=='-'?`<span class="text-[10px] text-slate-400 font-mono bg-slate-50 px-1.5 py-0.5 rounded">${f.latency}</span>`:''}</div><p class="text-[12px] text-slate-600 mt-1.5 ${evt?'font-medium':''}">${f.detail}</p></div></div></div>`;
                }).join('')}${sorted.length===0?'<div class="text-center py-10 text-slate-400 font-bold">Flag 이력이 없습니다.</div>':''}</div></div>
            </div></div>`;
        document.body.insertAdjacentHTML('beforeend', html);
        setTimeout(() => { const o=document.getElementById('flag-detail-overlay'); if(o){o.style.opacity='1';o.firstElementChild.style.transform='scale(1)';} }, 10);
    },
    closeFlagDetail() { const o=document.getElementById('flag-detail-overlay'); if(o){o.style.opacity='0';o.firstElementChild.style.transform='scale(.95)';setTimeout(()=>o.remove(),300);} },

    // ─── [신규] 재구동 이력 관리 ───
    renderRebootView() {
        const stats = DB.getRebootStats();
        const history = DB.getRebootHistory();
        return `<div class="max-w-[1400px] mx-auto">
            <div class="grid grid-cols-4 gap-4 mb-5">
                <div class="bg-white border border-slate-200 p-4 rounded shadow-sm"><p class="text-[11px] font-bold text-slate-500 mb-1">총 재구동 시도</p><h3 class="text-2xl font-bold text-slate-800">${stats.total}<span class="text-sm text-slate-400 ml-1">회</span></h3></div>
                <div class="bg-green-50 border border-green-200 p-4 rounded shadow-sm"><p class="text-[11px] font-bold text-green-700 mb-1">성공</p><h3 class="text-2xl font-bold text-green-700">${stats.success}<span class="text-sm text-green-500 ml-1">회 (${stats.successRate}%)</span></h3></div>
                <div class="bg-red-50 border border-red-200 p-4 rounded shadow-sm"><p class="text-[11px] font-bold text-red-700 mb-1">실패</p><h3 class="text-2xl font-bold text-red-700">${stats.fail}<span class="text-sm text-red-400 ml-1">회</span></h3></div>
                <div class="bg-purple-50 border border-purple-200 p-4 rounded shadow-sm"><p class="text-[11px] font-bold text-purple-700 mb-1">지속 장애 (3회 실패)</p><h3 class="text-2xl font-bold text-purple-700">${stats.persistentHosts}<span class="text-sm text-purple-400 ml-1">대</span></h3></div>
            </div>
            <div class="flex justify-between items-end mb-4"><h2 class="text-lg font-bold text-slate-800">Agent 재구동 시도 이력<span class="info-tip"><i class="fa-solid fa-circle-info"></i><span class="tip-box"><b>수집:</b> Watcher.dog 재구동 로그<br>장애 감지 후 자동 재시작 이력. 3회+ 실패 시 현장 점검 대상.</span></span></h2>
                <div class="flex items-center space-x-2">
                    <div class="relative"><i class="fa-solid fa-magnifying-glass absolute left-2.5 top-2 text-slate-400 text-xs"></i><input type="text" id="reboot-search" onkeyup="controlViews.filterReboots()" placeholder="고객사명, 단말ID 검색" class="pl-7 pr-3 py-1.5 border border-slate-300 rounded text-xs focus:border-teal-500 outline-none w-56 font-medium"></div>
                    <select id="reboot-result-filter" onchange="controlViews.filterReboots()" class="border border-slate-300 rounded text-xs px-2 py-1.5 outline-none focus:border-teal-500 font-medium"><option value="all">전체 결과</option><option value="success">성공만</option><option value="fail">실패만</option></select>
                </div>
            </div>
            <div class="bg-white border border-slate-200 rounded shadow-sm overflow-hidden"><div class="overflow-y-auto max-h-[550px]"><table class="w-full text-left whitespace-nowrap"><thead class="bg-slate-50 text-[12px] text-slate-500 border-b border-slate-200 sticky top-0 z-10"><tr><th class="px-4 py-3 font-bold">시도 시간</th><th class="px-4 py-3 font-bold">고객사 (단말)</th><th class="px-4 py-3 font-bold text-center">시도 횟수</th><th class="px-4 py-3 font-bold text-center">결과</th><th class="px-4 py-3 font-bold">후속 조치</th></tr></thead>
            <tbody id="reboot-tbody" class="text-xs text-slate-700 divide-y divide-slate-100">${this.buildRebootRows(history)}</tbody></table></div></div>
        </div>`;
    },

    buildRebootRows(data) {
        if(!data.length) return `<tr><td colspan="5" class="text-center py-10 text-slate-500 font-bold">재구동 이력 없음</td></tr>`;
        return data.map(r => {
            const resCls = r.result === 'success' ? 'text-green-600 bg-green-50 border-green-200' : 'text-red-600 bg-red-50 border-red-200';
            return `<tr class="hover:bg-slate-50"><td class="px-4 py-3 text-slate-500 font-mono text-[11px]">${r.time}</td><td class="px-4 py-3"><span onclick="app.openMonitoringModal('${r.hostName}')" class="cursor-pointer text-teal-700 hover:underline font-bold text-[12px]">${r.hostName}</span><span class="text-[10px] text-slate-400 font-mono ml-1">(${r.hostId})</span>${r.isVip?'<span class="text-[9px] bg-blue-100 text-blue-600 px-1 py-0.5 rounded ml-1">VIP</span>':''}</td><td class="px-4 py-3 text-center font-bold">${r.attempt} / ${r.maxAttempts}회</td><td class="px-4 py-3 text-center"><span class="${resCls} font-bold px-2 py-0.5 rounded border text-[11px]">${r.resultLabel}</span></td><td class="px-4 py-3 text-[11px] ${r.result==='fail'?'text-red-600 font-bold':'text-slate-600'}">${r.nextAction}</td></tr>`;
        }).join('');
    },

    filterReboots() {
        const keyword = document.getElementById('reboot-search') ? document.getElementById('reboot-search').value : '';
        const result = document.getElementById('reboot-result-filter') ? document.getElementById('reboot-result-filter').value : 'all';
        const data = DB.getRebootHistory({ keyword, result });
        document.getElementById('reboot-tbody').innerHTML = this.buildRebootRows(data);
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
        return `<div class="max-w-[1400px] mx-auto"><div class="flex justify-between items-end mb-4"><div><h2 class="text-lg font-bold text-slate-800 tracking-tight">고객사 관제 등급 (VIP/일반) 설정<span class="info-tip"><i class="fa-solid fa-circle-info"></i><span class="tip-box"><b>활용:</b> 장애 빈도와 중요도 기반 VIP/일반 등급 설정. 전 메뉴에서 우선 표시.</span></span></h2><p class="text-xs text-slate-500 mt-1">집중 관제가 필요한 중요 고객사를 VIP로 설정하여 대시보드 필터에 반영합니다.</p></div><div class="flex items-center space-x-2"><div class="relative"><i class="fa-solid fa-magnifying-glass absolute left-2.5 top-2 text-slate-400 text-xs"></i><input type="text" id="group-search-input" onkeyup="controlViews.filterGroupManage()" placeholder="고객사명 검색" class="pl-7 pr-3 py-1.5 border border-slate-300 rounded text-xs outline-none focus:border-teal-500 w-56 font-medium"></div><button id="batch-save-btn" class="bg-slate-800 text-white px-3 py-1.5 rounded text-xs font-bold shadow-sm transition-colors">선택 항목 일괄 저장</button></div></div><div class="bg-white border border-slate-200 rounded shadow-sm overflow-hidden"><div class="overflow-y-auto max-h-[650px] relative"><table class="w-full text-left border-collapse whitespace-nowrap"><thead class="bg-slate-50 text-[12px] text-slate-500 border-b border-slate-200 sticky top-0 z-10"><tr><th class="px-5 py-3 font-bold w-12 text-center"><input type="checkbox" class="rounded border-slate-300"></th><th class="px-5 py-3 font-bold">고객사명</th><th class="px-5 py-3 font-bold">설치된 단말 수</th><th class="px-5 py-3 font-bold">최근 한 달 장애 건수</th><th class="px-5 py-3 font-bold text-center">현재 관제 등급</th><th class="px-5 py-3 font-bold">등급 설정 변경</th></tr></thead><tbody id="group-manage-tbody" class="text-xs text-slate-700 divide-y divide-slate-100">${this.buildGroupRows(DB.getHosts())}</tbody></table></div></div></div>`;
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
                <h3 class="font-bold text-slate-800 text-[15px] mb-5 border-b border-slate-100 pb-3"><i class="fa-solid fa-file-contract text-teal-600 mr-2"></i>보고서 생성 조건 설정<span class="info-tip"><i class="fa-solid fa-circle-info"></i><span class="tip-box"><b>활용:</b> 보고서 유형, 조회 기간, 포함 항목을 설정하여 운영 보고서를 자동 생성합니다.</span></span></h3>
                
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
                <h2 class="text-lg font-bold text-slate-800 tracking-tight">모니터링 정책 및 알림 설정<span class="info-tip"><i class="fa-solid fa-circle-info"></i><span class="tip-box"><b>활용:</b> Flag 수신 주기(기본 1시간)와 임계값(5/10/30분)을 설정합니다. 전체 장애 판단 기준.</span></span></h2>
                <p class="text-xs text-slate-500 mt-1">시스템에서 장애를 판단하는 전역 임계값과 관리자 알림 수신 채널을 설정합니다.</p>
            </div>
            <div class="bg-white border border-slate-200 rounded p-6 mb-6 shadow-sm">
                <h3 class="text-[13px] font-bold text-slate-800 mb-3 pb-2 border-b border-slate-100"><i class="fa-solid fa-clock text-blue-600 mr-2"></i>Flag 수신 주기 설정</h3>
                <p class="text-[11px] text-slate-500 mb-4">각 고객사 Agent가 관제 서버로 Flag를 전송하는 주기를 설정합니다. 설정된 주기마다 Agent 상태를 수신하여 정상/주의/장애를 판단합니다.</p>
                <div class="flex items-center justify-between max-w-[450px]">
                    <div><label class="block text-sm font-bold text-slate-700">Flag 수신 주기</label><span class="text-[11px] text-slate-400">Agent → 관제서버 전송 간격</span></div>
                    <select id="flag-interval" class="border border-slate-300 rounded px-3 py-1.5 text-sm font-bold text-slate-700 outline-none focus:border-teal-500 w-40">
                        <option value="10" ${(state.flagInterval||60)==10?'selected':''}>10분</option>
                        <option value="30" ${(state.flagInterval||60)==30?'selected':''}>30분</option>
                        <option value="60" ${(state.flagInterval||60)==60?'selected':''}>1시간 (기본)</option>
                        <option value="120" ${(state.flagInterval||60)==120?'selected':''}>2시간</option>
                        <option value="180" ${(state.flagInterval||60)==180?'selected':''}>3시간</option>
                    </select>
                </div>
            </div>
            <div class="bg-white border border-slate-200 rounded p-6 mb-6 shadow-sm">
                <h3 class="text-[13px] font-bold text-slate-800 mb-3 pb-2 border-b border-slate-100"><i class="fa-solid fa-stopwatch text-teal-600 mr-2"></i>상태 판별 임계값 설정</h3>
                <p class="text-[11px] text-slate-500 mb-4">Flag 수신 주기 기준으로, 마지막 수신 이후 경과 시간에 따라 단말의 상태를 자동으로 판별합니다.</p>
                <div class="space-y-4 max-w-[550px]">
                    <div class="flex items-center justify-between">
                        <div class="flex-1"><label class="block text-sm font-bold text-teal-700"><i class="fa-solid fa-circle-check mr-1.5 text-teal-500"></i>정상 통신 기준</label><p class="text-[11px] text-slate-400 mt-0.5 ml-5">마지막 Flag 수신 후 <b class="text-teal-600">${state.normalThreshold}분 이내</b>에 다음 Flag가 수신되면 <b class="text-teal-600">정상</b>으로 판단합니다.</p></div>
                        <div class="relative w-28 shrink-0 ml-4"><input type="number" id="norm-input" value="${state.normalThreshold}" class="w-full text-right pr-7 pl-2 py-1.5 border border-slate-300 rounded text-sm font-mono font-bold focus:border-teal-500 outline-none"><span class="absolute right-3 top-1.5 text-xs text-slate-500 font-bold">분</span></div>
                    </div>
                    <div class="flex items-center justify-between border-t border-slate-100 pt-4">
                        <div class="flex-1"><label class="block text-sm font-bold text-yellow-600"><i class="fa-solid fa-triangle-exclamation mr-1.5 text-yellow-500"></i>수신 지연 (주의) 기준</label><p class="text-[11px] text-slate-400 mt-0.5 ml-5">마지막 Flag 수신 후 <b class="text-yellow-600">${state.warningThreshold}분 이내</b>까지 미수신 시 <b class="text-yellow-600">주의</b> 상태로 전환됩니다.</p></div>
                        <div class="relative w-28 shrink-0 ml-4"><input type="number" id="warn-input" value="${state.warningThreshold}" class="w-full text-right pr-7 pl-2 py-1.5 border border-slate-300 rounded text-sm font-mono font-bold focus:border-teal-500 outline-none"><span class="absolute right-3 top-1.5 text-xs text-slate-500 font-bold">분</span></div>
                    </div>
                    <div class="flex items-center justify-between border-t border-slate-100 pt-4">
                        <div class="flex-1"><label class="block text-sm font-bold text-red-600"><i class="fa-solid fa-circle-xmark mr-1.5 text-red-500"></i>장애 판단 기준</label><p class="text-[11px] text-slate-400 mt-0.5 ml-5">마지막 Flag 수신 후 <b class="text-red-600">${state.errorThreshold}분 이상</b> 미수신 시 <b class="text-red-600">장애</b>로 판단하며, Watcher 자동 재구동이 시작됩니다.</p></div>
                        <div class="relative w-28 shrink-0 ml-4"><input type="number" id="err-input" value="${state.errorThreshold}" class="w-full text-right pr-7 pl-2 py-1.5 border border-red-300 rounded text-sm font-mono font-bold focus:border-red-500 outline-none text-red-700 bg-red-50"><span class="absolute right-3 top-1.5 text-xs text-red-500 font-bold">분</span></div>
                    </div>
                </div>
                <div class="mt-5 p-3 bg-slate-50 border border-slate-200 rounded">
                    <p class="text-[11px] text-slate-500"><i class="fa-solid fa-info-circle text-slate-400 mr-1"></i><b>판별 흐름:</b> Flag 수신 → <span class="text-teal-600 font-bold">${state.normalThreshold}분 이내 = 정상</span> → <span class="text-yellow-600 font-bold">${state.warningThreshold}분 이내 = 주의</span> → <span class="text-red-600 font-bold">${state.errorThreshold}분 이상 = 장애</span> → Watcher 자동 재구동</p>
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