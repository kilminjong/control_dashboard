const dataViews = {

    // ═══════════════════════════════════════
    //  [신규] 데이터 활용 총괄 대시보드
    // ═══════════════════════════════════════
    renderDataDashboard() {
        const o = DB.getDataOverview();
        return `<div class="max-w-[1400px] mx-auto">
            <div class="grid grid-cols-5 gap-4 mb-5">
                <div class="bg-teal-50 border border-teal-200 p-4 rounded shadow-sm border-l-4 border-l-teal-500"><p class="text-[10px] font-bold text-teal-600 mb-1">당행 자산 점유율</p><h3 class="text-2xl font-black text-teal-800">${o.hanaRatio}<span class="text-sm ml-0.5">%</span></h3><p class="text-[10px] text-teal-600 mt-1">${Math.round(o.hanaShare/100000000).toLocaleString()}억 / ${Math.round(o.assetTotal/100000000).toLocaleString()}억</p></div>
                <div class="bg-blue-50 border border-blue-200 p-4 rounded shadow-sm border-l-4 border-l-blue-500"><p class="text-[10px] font-bold text-blue-600 mb-1">B2B/전자어음 수집</p><h3 class="text-2xl font-black text-blue-800">${o.b2bCount}<span class="text-sm text-blue-400 ml-1">건</span></h3><p class="text-[10px] text-blue-600 mt-1">대출 타겟 ${o.b2bTarget}개사</p></div>
                <div class="bg-amber-50 border border-amber-200 p-4 rounded shadow-sm border-l-4 border-l-amber-500"><p class="text-[10px] font-bold text-amber-600 mb-1">세금계산서 매출</p><h3 class="text-2xl font-black text-amber-800 font-mono">${Math.round(o.taxSales/100000000).toLocaleString()}<span class="text-sm ml-1">억</span></h3><p class="text-[10px] text-amber-600 mt-1">우량 기업 ${o.taxPremium}개사</p></div>
                <div class="bg-purple-50 border border-purple-200 p-4 rounded shadow-sm border-l-4 border-l-purple-500"><p class="text-[10px] font-bold text-purple-600 mb-1">타행 법인카드</p><h3 class="text-2xl font-black text-purple-800 font-mono">${Math.round(o.cardTotal/100000000).toLocaleString()}<span class="text-sm ml-1">억</span></h3><p class="text-[10px] text-purple-600 mt-1">전환 타겟 ${o.cardCount}건</p></div>
                <div class="bg-${o.cashNet7d>=0?'green':'red'}-50 border border-${o.cashNet7d>=0?'green':'red'}-200 p-4 rounded shadow-sm border-l-4 border-l-${o.cashNet7d>=0?'green':'red'}-500"><p class="text-[10px] font-bold text-${o.cashNet7d>=0?'green':'red'}-600 mb-1">7일 순 자금흐름</p><h3 class="text-2xl font-black text-${o.cashNet7d>=0?'green':'red'}-800 font-mono">${o.cashNet7d>=0?'+':''}${Math.round(o.cashNet7d/100000000).toLocaleString()}<span class="text-sm ml-0.5">억</span></h3></div>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
                <div class="bg-white border border-slate-200 rounded p-5 shadow-sm">
                    <h3 class="font-bold text-slate-800 text-[14px] mb-1">금융기관별 자산 점유<span class="info-tip"><i class="fa-solid fa-circle-info"></i><span class="tip-box"><b>수집:</b> 은행명, 계좌구분, 보유금액<br>하나+타행 예적금 잔액을 은행별 도넛 차트로 비교합니다.</span></span></h3>
                    <p class="text-[11px] text-slate-500 mb-4">예금+적금 합산 기준</p>
                    <div class="h-[220px]"><canvas id="dataDashPie"></canvas></div>
                </div>
                <div class="bg-white border border-slate-200 rounded p-5 shadow-sm">
                    <h3 class="font-bold text-slate-800 text-[14px] mb-1">최근 30일 자금흐름 추이<span class="info-tip"><i class="fa-solid fa-circle-info"></i><span class="tip-box"><b>수집:</b> 모계좌 거래내역 — 거래일자, 입/출구분, 거래금액<br>30일간 입출금 추이를 바+라인 혼합 차트로 표시합니다.</span></span></h3>
                    <p class="text-[11px] text-slate-500 mb-4">전체 고객사 합산 입출금</p>
                    <div class="h-[220px]"><canvas id="dataDashFlow"></canvas></div>
                </div>
                <div class="bg-white border border-slate-200 rounded p-5 shadow-sm">
                    <h3 class="font-bold text-slate-800 text-[14px] mb-1">카드 업종별 비중<span class="info-tip"><i class="fa-solid fa-circle-info"></i><span class="tip-box"><b>수집:</b> 카드사명, 사용건수, 사용액<br>타행 법인카드 결제를 업종별 도넛 차트로 분류합니다.</span></span></h3>
                    <p class="text-[11px] text-slate-500 mb-4">타행 법인카드 결제 분석</p>
                    <div class="h-[220px]"><canvas id="dataDashCard"></canvas></div>
                </div>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div class="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
                    <div class="px-4 py-3 border-b border-slate-200 bg-slate-50 flex justify-between items-center"><h3 class="text-[13px] font-bold text-slate-800"><i class="fa-solid fa-bullseye text-teal-600 mr-1.5"></i>영업 타겟 긴급 액션<span class="info-tip"><i class="fa-solid fa-circle-info"></i><span class="tip-box"><b>활용:</b> 수집 데이터 복합 분석으로 만기 도래·고액 결제·매출 우량 기업을 자동 필터링합니다.</span></span></h3><span class="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold">${o.d30Assets + o.b2bTarget}건 조치 필요</span></div>
                    <div class="max-h-[250px] overflow-y-auto">
                        <table class="w-full text-left"><thead class="bg-white text-[11px] text-slate-500 border-b border-slate-200 sticky top-0"><tr><th class="px-4 py-2 font-bold">구분</th><th class="px-4 py-2 font-bold">상세</th><th class="px-4 py-2 font-bold text-right">건수</th><th class="px-4 py-2 font-bold text-center">바로가기</th></tr></thead>
                        <tbody class="text-xs text-slate-700 divide-y divide-slate-100">
                            <tr class="hover:bg-slate-50"><td class="px-4 py-2.5"><span class="text-red-600 font-bold">D-30 만기 임박</span></td><td class="px-4 py-2.5 text-slate-600">예적금 만기 도래 고객</td><td class="px-4 py-2.5 text-right font-mono font-bold">${o.d30Assets}건</td><td class="px-4 py-2.5 text-center"><button onclick="app.loadView('assetView', document.querySelectorAll('[data-menu]')[7])" class="text-[10px] text-teal-600 font-bold hover:underline">이동 →</button></td></tr>
                            <tr class="hover:bg-slate-50"><td class="px-4 py-2.5"><span class="text-blue-600 font-bold">대출(여신) 타겟</span></td><td class="px-4 py-2.5 text-slate-600">B2B/어음 만기 기반</td><td class="px-4 py-2.5 text-right font-mono font-bold">${o.b2bTarget}건</td><td class="px-4 py-2.5 text-center"><button onclick="app.loadView('b2bView', document.querySelectorAll('[data-menu]')[9])" class="text-[10px] text-teal-600 font-bold hover:underline">이동 →</button></td></tr>
                            <tr class="hover:bg-slate-50"><td class="px-4 py-2.5"><span class="text-teal-600 font-bold">매출 우량 기업</span></td><td class="px-4 py-2.5 text-slate-600">여신 한도 상향 대상</td><td class="px-4 py-2.5 text-right font-mono font-bold">${o.taxPremium}건</td><td class="px-4 py-2.5 text-center"><button onclick="app.loadView('taxView', document.querySelectorAll('[data-menu]')[11])" class="text-[10px] text-teal-600 font-bold hover:underline">이동 →</button></td></tr>
                            <tr class="hover:bg-slate-50"><td class="px-4 py-2.5"><span class="text-purple-600 font-bold">카드 전환 타겟</span></td><td class="px-4 py-2.5 text-slate-600">타행카드 고액 결제 기업</td><td class="px-4 py-2.5 text-right font-mono font-bold">${o.cardCount}건</td><td class="px-4 py-2.5 text-center"><button onclick="app.loadView('cardView', document.querySelectorAll('[data-menu]')[10])" class="text-[10px] text-teal-600 font-bold hover:underline">이동 →</button></td></tr>
                        </tbody></table>
                    </div>
                </div>
                <div class="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
                    <div class="px-4 py-3 border-b border-slate-200 bg-slate-50"><h3 class="text-[13px] font-bold text-slate-800"><i class="fa-solid fa-ranking-star text-amber-500 mr-1.5"></i>고객사 자금흐름 순위 (30일)<span class="info-tip"><i class="fa-solid fa-circle-info"></i><span class="tip-box"><b>수집:</b> 모계좌 거래내역<br>30일 누적 입금/출금/순흐름을 고객사별로 집계한 순위입니다.</span></span></h3></div>
                    <div class="max-h-[250px] overflow-y-auto" id="flow-ranking">${this.buildFlowRanking()}</div>
                </div>
            </div>
        </div>`;
    },
    buildFlowRanking() {
        const ranking = DB.getCashFlowRanking();
        return `<table class="w-full text-left"><thead class="bg-white text-[11px] text-slate-500 border-b border-slate-200 sticky top-0"><tr><th class="px-4 py-2 font-bold w-8">#</th><th class="px-4 py-2 font-bold">고객사</th><th class="px-4 py-2 font-bold text-right">총 입금</th><th class="px-4 py-2 font-bold text-right">총 출금</th><th class="px-4 py-2 font-bold text-right">순 흐름</th></tr></thead><tbody class="text-xs text-slate-700 divide-y divide-slate-100">${ranking.map((r,i) => `<tr class="hover:bg-slate-50 cursor-pointer" onclick="app.loadView('cashFlow', document.querySelectorAll('[data-menu]')[12]); setTimeout(()=>{ if(document.getElementById('cf-company')) { document.getElementById('cf-company').value='${r.company}'; dataViews.filterCashFlow(); }},100)"><td class="px-4 py-2.5 font-bold text-slate-400">${i+1}</td><td class="px-4 py-2.5 font-bold text-teal-700">${r.company}</td><td class="px-4 py-2.5 text-right font-mono text-blue-700 font-bold">${Math.round(r.totalIn/100000000).toLocaleString()}억</td><td class="px-4 py-2.5 text-right font-mono text-red-600">${Math.round(r.totalOut/100000000).toLocaleString()}억</td><td class="px-4 py-2.5 text-right font-mono font-bold ${r.net>=0?'text-teal-700':'text-amber-700'}">${r.net>=0?'+':''}${Math.round(r.net/100000000).toLocaleString()}억</td></tr>`).join('')}</tbody></table>`;
    },
    initDataDashCharts() {
        // 점유율 도넛
        const details = DB.getDepositDetail();
        const c1 = new Chart(document.getElementById('dataDashPie').getContext('2d'), { type:'doughnut', data:{ labels:details.map(d=>d.bank), datasets:[{ data:details.map(d=>Math.round(d.total/100000000)), backgroundColor:details.map(d=>d.color), borderWidth:2, borderColor:'#fff' }] }, options:{ responsive:true, maintainAspectRatio:false, cutout:'60%', plugins:{ legend:{ position:'bottom', labels:{boxWidth:8,font:{size:9,family:'Pretendard'}} } } } });
        app.chartInstances.push(c1);
        // 자금흐름 라인
        const flows = DB.getCashFlow();
        const c2 = new Chart(document.getElementById('dataDashFlow').getContext('2d'), { type:'line', data:{ labels:flows.map(f=>f.date), datasets:[
            { label:'입금', data:flows.map(f=>Math.round(f.inflow/1000000)), borderColor:'#3b82f6', backgroundColor:'rgba(59,130,246,0.1)', fill:true, borderWidth:1.5, tension:0.3, pointRadius:0 },
            { label:'출금', data:flows.map(f=>Math.round(f.outflow/1000000)), borderColor:'#ef4444', backgroundColor:'rgba(239,68,68,0.05)', fill:true, borderWidth:1.5, tension:0.3, pointRadius:0 }
        ]}, options:{ responsive:true, maintainAspectRatio:false, scales:{ y:{ grid:{borderDash:[2,2],color:'#f1f5f9'}, border:{display:false}, ticks:{font:{size:8}} }, x:{ grid:{display:false}, border:{display:false}, ticks:{maxRotation:0,font:{size:7},maxTicksLimit:8} } }, plugins:{ legend:{ position:'bottom', labels:{boxWidth:8,font:{size:9}} } } } });
        app.chartInstances.push(c2);
        // 카드 도넛
        const c3 = new Chart(document.getElementById('dataDashCard').getContext('2d'), { type:'doughnut', data:{ labels:['주유/교통비','항공/숙박','식대/접대비','공과금/기타'], datasets:[{ data:[40,35,15,10], backgroundColor:['#0d9488','#3b82f6','#94a3b8','#cbd5e1'], borderWidth:2, borderColor:'#fff' }] }, options:{ responsive:true, maintainAspectRatio:false, cutout:'60%', plugins:{ legend:{ position:'bottom', labels:{boxWidth:8,font:{size:9}} } } } });
        app.chartInstances.push(c3);
    },

    // ═══════════════════════════════════════
    //  금융자산 점유 현황
    // ═══════════════════════════════════════
    renderAsset() {
        const summary = DB.getDepositSummary();
        const assets = DB.getAssets();
        const d30 = assets.filter(a => a.dday <= 30).length;
        return `<div class="max-w-[1400px] mx-auto">
            <div class="grid grid-cols-4 gap-4 mb-5">
                <div class="bg-teal-50 border border-teal-200 p-4 rounded shadow-sm"><p class="text-[11px] font-bold text-teal-700 mb-1">당행(하나) 점유 자산</p><h3 class="text-2xl font-black font-mono text-teal-800">${(summary.hanaShare/100000000).toLocaleString()}<span class="text-sm ml-1">억 원</span></h3><p class="text-[10px] text-teal-600 mt-1">점유율 ${summary.hanaRatio}%</p></div>
                <div class="bg-white border border-slate-200 p-4 rounded shadow-sm"><p class="text-[11px] font-bold text-slate-500 mb-1">전 금융기관 합산</p><h3 class="text-2xl font-black font-mono text-slate-800">${(summary.totalAll/100000000).toLocaleString()}<span class="text-sm text-slate-400 ml-1">억 원</span></h3></div>
                <div class="bg-blue-50 border border-blue-200 p-4 rounded shadow-sm"><p class="text-[11px] font-bold text-blue-700 mb-1">정기예금 총액</p><h3 class="text-2xl font-black font-mono text-blue-800">${(summary.totalDeposit/100000000).toLocaleString()}<span class="text-sm ml-1">억</span></h3></div>
                <div class="bg-red-50 border border-red-200 p-4 rounded shadow-sm"><p class="text-[11px] font-bold text-red-700 mb-1">D-30 만기 임박</p><h3 class="text-2xl font-black font-mono text-red-800">${d30}<span class="text-sm ml-1">건</span></h3></div>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div class="bg-white border border-slate-200 rounded p-5 shadow-sm">
                    <h3 class="font-bold text-slate-800 text-[14px] mb-1">금융기관별 자산 점유율<span class="info-tip"><i class="fa-solid fa-circle-info"></i><span class="tip-box"><b>수집:</b> 은행명, 계좌구분, 보유금액(백만/억)<br>은행별 스택 바차트로 자산 분포를 비교합니다.</span></span></h3><p class="text-[11px] text-slate-500 mb-5">예금+적금 합산 (억 원)</p>
                    <div class="h-[300px] w-full"><canvas id="assetChart"></canvas></div>
                </div>
                <div class="bg-white border border-slate-200 rounded p-5 flex flex-col shadow-sm max-h-[700px]">
                    <div class="flex justify-between items-center mb-4"><h3 class="font-bold text-slate-800 text-[14px]">만기 도래 타겟<span class="info-tip"><i class="fa-solid fa-circle-info"></i><span class="tip-box"><b>수집:</b> 계좌 원장 — 은행명, 잔액, 만기일, 이율<br>D-30 이내 만기 도래 타행 예적금 보유 고객사 목록입니다.</span></span></h3><input type="text" id="asset-search" onkeyup="dataViews.filterAsset()" placeholder="고객사, 은행명 검색" class="border border-slate-300 rounded text-xs px-3 py-1 w-48 outline-none focus:border-teal-500 font-medium"></div>
                    <div id="asset-list" class="flex-1 overflow-y-auto pr-2 space-y-1">${this.buildAssetRows(assets)}</div>
                </div>
            </div></div>`;
    },
    initAssetChart() {
        const d = DB.getDepositDetail(); const ctx = document.getElementById('assetChart').getContext('2d');
        const chart = new Chart(ctx, { type:'bar', data:{ labels:d.map(x=>x.bank), datasets:[{ label:'정기예금', data:d.map(x=>Math.round(x.deposit/100000000)), backgroundColor:d.map(x=>x.color), borderRadius:4, barThickness:35 },{ label:'적금', data:d.map(x=>Math.round(x.savings/100000000)), backgroundColor:d.map(x=>x.color+'88'), borderRadius:4, barThickness:35 }] }, options:{ responsive:true, maintainAspectRatio:false, scales:{ y:{ beginAtZero:true, stacked:true, grid:{borderDash:[2,2],color:'#f1f5f9'}, border:{display:false} }, x:{ stacked:true, grid:{display:false}, border:{display:false} } }, plugins:{ legend:{ position:'bottom', labels:{boxWidth:10,font:{size:10,family:'Pretendard'}} } } } });
        app.chartInstances.push(chart);
    },
    buildAssetRows(data) {
        if(!data.length) return `<div class="text-center py-10 text-slate-500 font-bold">검색 결과가 없습니다.</div>`;
        return data.map(item => `<div class="p-3 border border-slate-200 bg-slate-50 rounded flex justify-between items-center hover:bg-white transition shadow-sm mb-2"><div><p class="text-[13px] font-bold text-slate-800"><span onclick="app.openCustomer360('${item.name}','asset')" class="cursor-pointer text-teal-700 hover:underline">${item.name}</span> <span class="text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded ml-1 text-slate-500">${item.bank}</span></p><p class="text-[11px] ${item.dday<=30?'text-red-500':'text-slate-500'} font-bold mt-1">${item.product} 만기 ${item.dday<=30?'임박':'예정'} (D-${item.dday})</p></div><div class="text-right"><p class="text-[15px] font-black font-mono text-slate-800">${item.amount.toLocaleString()} 원</p><button onclick="app.openProposalModal('${item.name}','예적금 유치 제안')" class="text-[11px] bg-teal-600 text-white px-2.5 py-1 rounded font-bold mt-1.5 hover:bg-teal-700 shadow-sm">유치 제안</button></div></div>`).join('');
    },
    filterAsset() {
        const kw = document.getElementById('asset-search').value.toLowerCase();
        document.getElementById('asset-list').innerHTML = this.buildAssetRows(DB.getAssets().filter(i => !kw || i.name.toLowerCase().includes(kw) || i.bank.toLowerCase().includes(kw)));
    },

    // ═══════════════════════════════════════
    //  예적금 보유/만기 분석 (고객사별)
    // ═══════════════════════════════════════
    renderDepositView() {
        const details = DB.getDepositDetail();
        const summary = DB.getDepositSummary();
        const byCompany = DB.getAssetsByCompany();
        return `<div class="max-w-[1400px] mx-auto">
            <div class="grid grid-cols-3 gap-4 mb-5">
                <div class="bg-teal-50 border border-teal-200 p-5 rounded shadow-sm"><p class="text-[11px] font-bold text-teal-700 mb-1">당행 점유율</p><h3 class="text-3xl font-black text-teal-800">${summary.hanaRatio}<span class="text-lg ml-0.5">%</span></h3><p class="text-[10px] text-teal-600 mt-1">${(summary.hanaShare/100000000).toLocaleString()}억 / ${(summary.totalAll/100000000).toLocaleString()}억</p></div>
                <div class="bg-blue-50 border border-blue-200 p-5 rounded shadow-sm"><p class="text-[11px] font-bold text-blue-700 mb-1">정기예금</p><h3 class="text-3xl font-black text-blue-800 font-mono">${(summary.totalDeposit/100000000).toLocaleString()}<span class="text-lg ml-0.5">억</span></h3></div>
                <div class="bg-amber-50 border border-amber-200 p-5 rounded shadow-sm"><p class="text-[11px] font-bold text-amber-700 mb-1">적금</p><h3 class="text-3xl font-black text-amber-800 font-mono">${(summary.totalSavings/100000000).toLocaleString()}<span class="text-lg ml-0.5">억</span></h3></div>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-5">
                <div class="lg:col-span-5 bg-white border border-slate-200 rounded p-5 shadow-sm">
                    <h3 class="font-bold text-slate-800 text-[14px] mb-1">금융기관별 점유<span class="info-tip"><i class="fa-solid fa-circle-info"></i><span class="tip-box"><b>수집:</b> 은행명, 잔액, 만기일, 이율<br>전 금융기관 예적금 비중을 도넛 차트로 표시합니다.</span></span></h3><p class="text-[11px] text-slate-500 mb-5">정기예금 + 적금 합산</p>
                    <div class="h-[280px]"><canvas id="depositPieChart"></canvas></div>
                </div>
                <div class="lg:col-span-7 bg-white border border-slate-200 rounded p-5 shadow-sm">
                    <h3 class="font-bold text-slate-800 text-[14px] mb-4">은행별 만기 도래 분석<span class="info-tip"><i class="fa-solid fa-circle-info"></i><span class="tip-box"><b>수집:</b> 계좌 원장 — 은행명, 잔액, 만기일, 이율<br>은행별 만기 스케줄 테이블입니다. D-30 이내 건은 빨간색 하이라이팅.</span></span></h3>
                    <table class="w-full text-left whitespace-nowrap"><thead class="bg-slate-50 text-[12px] text-slate-500 border-b border-slate-200"><tr><th class="px-4 py-3 font-bold">금융기관</th><th class="px-4 py-3 font-bold text-right">정기예금</th><th class="px-4 py-3 font-bold text-right">적금</th><th class="px-4 py-3 font-bold text-center">D-30</th><th class="px-4 py-3 font-bold text-center">D-60</th><th class="px-4 py-3 font-bold text-center">D-90</th><th class="px-4 py-3 font-bold text-center">금리</th></tr></thead>
                    <tbody class="text-xs text-slate-700 divide-y divide-slate-100">${details.map(d=>`<tr class="hover:bg-slate-50"><td class="px-4 py-3 font-bold text-[13px]"><span class="inline-block w-2.5 h-2.5 rounded-full mr-2" style="background:${d.color}"></span>${d.bank}</td><td class="px-4 py-3 text-right font-mono font-bold">${(d.deposit/100000000).toLocaleString()}억</td><td class="px-4 py-3 text-right font-mono">${(d.savings/100000000).toLocaleString()}억</td><td class="px-4 py-3 text-center text-red-600 font-bold">${d.maturity30}</td><td class="px-4 py-3 text-center text-yellow-600 font-bold">${d.maturity60}</td><td class="px-4 py-3 text-center text-slate-500">${d.maturity90}</td><td class="px-4 py-3 text-center font-mono font-bold text-teal-700">${d.rate}%</td></tr>`).join('')}</tbody></table>
                </div>
            </div>
            <div class="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
                <div class="px-4 py-3 border-b border-slate-200 bg-slate-50 flex justify-between items-center"><h3 class="text-[14px] font-bold text-slate-800"><i class="fa-solid fa-building mr-1.5 text-teal-600"></i>고객사별 예적금 보유 현황<span class="info-tip"><i class="fa-solid fa-circle-info"></i><span class="tip-box"><b>수집:</b> 은행명, 계좌구분, 보유금액<br>고객사 단위 보유 잔액과 당행 비중을 확인합니다.</span></span></h3>
                    <input type="text" id="dep-company-search" onkeyup="dataViews.filterDepositCompany()" placeholder="고객사명 검색" class="border border-slate-300 rounded text-xs px-3 py-1.5 w-48 outline-none focus:border-teal-500 font-medium">
                </div>
                <div class="overflow-y-auto max-h-[400px]">
                    <table class="w-full text-left whitespace-nowrap"><thead class="bg-white text-[12px] text-slate-500 border-b border-slate-200 sticky top-0 z-10"><tr><th class="px-4 py-3 font-bold">고객사</th><th class="px-4 py-3 font-bold text-center">보유 건수</th><th class="px-4 py-3 font-bold">보유 금융기관</th><th class="px-4 py-3 font-bold text-right">총 보유액</th><th class="px-4 py-3 font-bold text-center">D-30 만기</th><th class="px-4 py-3 font-bold text-center">영업 조치</th></tr></thead>
                    <tbody id="dep-company-tbody" class="text-xs text-slate-700 divide-y divide-slate-100">${this.buildDepositCompanyRows(byCompany)}</tbody></table>
                </div>
            </div>
        </div>`;
    },
    buildDepositCompanyRows(data) {
        if(!data.length) return `<tr><td colspan="6" class="text-center py-10 text-slate-500 font-bold">결과 없음</td></tr>`;
        return data.map(c => `<tr class="hover:bg-slate-50"><td class="px-4 py-3"><span onclick="app.openCustomer360('${c.name}','deposit')" class="cursor-pointer text-teal-700 hover:underline font-bold text-[13px]">${c.name}</span></td><td class="px-4 py-3 text-center font-mono font-bold">${c.count}건</td><td class="px-4 py-3 text-[11px] text-slate-600">${c.banks}</td><td class="px-4 py-3 text-right font-mono font-bold text-[13px]">${c.totalAmt.toLocaleString()}</td><td class="px-4 py-3 text-center">${c.d30>0?`<span class="text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded border border-red-200">${c.d30}건 임박</span>`:'<span class="text-slate-400">-</span>'}</td><td class="px-4 py-3 text-center">${c.d30>0?`<button onclick="app.openProposalModal('${c.name}','만기 도래 예적금 유치')" class="text-[11px] font-bold px-3 py-1.5 bg-teal-50 text-teal-700 border border-teal-200 rounded hover:bg-teal-100 shadow-sm">유치 제안</button>`:'<span class="text-slate-400 text-[11px]">관찰 중</span>'}</td></tr>`).join('');
    },
    filterDepositCompany() {
        const kw = document.getElementById('dep-company-search').value.toLowerCase();
        const data = DB.getAssetsByCompany().filter(c => !kw || c.name.toLowerCase().includes(kw));
        document.getElementById('dep-company-tbody').innerHTML = this.buildDepositCompanyRows(data);
    },
    initDepositChart() {
        const d = DB.getDepositDetail(); const ctx = document.getElementById('depositPieChart').getContext('2d');
        const chart = new Chart(ctx, { type:'doughnut', data:{ labels:d.map(x=>x.bank), datasets:[{ data:d.map(x=>Math.round(x.total/100000000)), backgroundColor:d.map(x=>x.color), borderWidth:2, borderColor:'#fff' }] }, options:{ responsive:true, maintainAspectRatio:false, cutout:'65%', plugins:{ legend:{ position:'bottom', labels:{boxWidth:10,font:{size:11,family:'Pretendard'}} } } } });
        app.chartInstances.push(chart);
    },

    // ═══════════════════════════════════════
    //  전자어음 및 B2B
    // ═══════════════════════════════════════
    renderB2B() {
        const data = DB.getB2B(); const qtr = DB.getB2BSummaryByQuarter(); const totalAmt = data.reduce((s,d)=>s+d.amount,0);
        return `<div class="max-w-[1400px] mx-auto flex flex-col h-full">
            <div class="grid grid-cols-4 gap-4 mb-4">
                <div class="bg-blue-50 border border-blue-200 p-4 rounded shadow-sm"><p class="text-[11px] font-bold text-blue-700 mb-1">총 만기 예정 금액</p><h3 class="text-2xl font-black font-mono text-blue-800">${Math.round(totalAmt/100000000).toLocaleString()}<span class="text-sm ml-1">억</span></h3></div>
                <div class="bg-white border border-slate-200 p-4 rounded shadow-sm"><p class="text-[11px] font-bold text-slate-500 mb-1">D-30 만기 임박</p><h3 class="text-2xl font-black font-mono text-slate-800">${data.filter(d=>d.dday<=30).length}<span class="text-sm text-slate-400 ml-1">건</span></h3></div>
                <div class="bg-teal-50 border border-teal-200 p-4 rounded shadow-sm"><p class="text-[11px] font-bold text-teal-700 mb-1">대출 타겟</p><h3 class="text-2xl font-black font-mono text-teal-800">${data.filter(d=>d.status==='target').length}<span class="text-sm ml-1">개사</span></h3></div>
                <div class="bg-amber-50 border border-amber-200 p-4 rounded shadow-sm"><p class="text-[11px] font-bold text-amber-700 mb-1">분기별 현황</p><div class="mt-1">${Object.entries(qtr).map(([k,v])=>`<p class="text-[10px]"><b class="text-amber-800">${k}</b>: ${v.count}건 / 타겟 ${v.target}</p>`).join('')}</div></div>
            </div>
            <div class="flex justify-between items-end mb-3"><h2 class="text-[15px] font-bold text-slate-800">전자어음 및 B2B 거래 상세<span class="info-tip"><i class="fa-solid fa-circle-info"></i><span class="tip-box"><b>수집:</b> 은행명, 상품구분, 매입/매출, 금액, 만기일<br>전자어음·매출채권 거래를 분기별로 집계하고 만기 임박 건을 하이라이팅합니다.</span></span></h2><div class="flex space-x-2"><div class="relative"><i class="fa-solid fa-magnifying-glass absolute left-3 top-2 text-slate-400 text-xs"></i><input type="text" id="b2b-search" onkeyup="dataViews.filterB2B()" placeholder="고객사명, 사업자번호" class="border border-slate-300 rounded text-xs pl-8 pr-3 py-1.5 w-56 outline-none focus:border-teal-500 font-medium"></div><button class="bg-slate-800 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-slate-700 shadow-sm"><i class="fa-solid fa-paper-plane mr-1.5"></i>영업점 전송</button></div></div>
            <div class="bg-white border border-slate-200 rounded flex-1 overflow-hidden shadow-sm"><div class="overflow-y-auto max-h-[500px]"><table class="w-full text-left whitespace-nowrap"><thead class="bg-slate-50 text-[12px] text-slate-500 border-b border-slate-200 sticky top-0 z-10"><tr><th class="px-4 py-3 font-bold w-10 text-center"><input type="checkbox" class="rounded border-slate-300"></th><th class="px-4 py-3 font-bold">고객사 (사업자번호)</th><th class="px-4 py-3 font-bold">금융기관 / 상품</th><th class="px-4 py-3 font-bold text-right">만기 금액</th><th class="px-4 py-3 font-bold text-center">만기 D-Day</th><th class="px-4 py-3 font-bold">조치</th></tr></thead><tbody id="b2b-tbody" class="text-xs text-slate-700 divide-y divide-slate-100">${this.buildB2BRows(data)}</tbody></table></div></div></div>`;
    },
    buildB2BRows(data) {
        if(!data.length) return `<tr><td colspan="6" class="text-center py-10 text-slate-500 font-bold">결과 없음</td></tr>`;
        return data.map(item => `<tr class="hover:bg-slate-50"><td class="px-4 py-3 text-center"><input type="checkbox" class="rounded border-slate-300"></td><td class="px-4 py-3"><p class="font-bold text-[13px]"><span onclick="app.openCustomer360('${item.name}','b2b')" class="cursor-pointer text-teal-700 hover:underline">${item.name}</span></p><p class="text-[10px] text-slate-400 font-mono mt-0.5">${item.regNo}</p></td><td class="px-4 py-3"><span class="bg-slate-100 text-slate-600 px-2 py-1 rounded font-bold text-[10px] border border-slate-200">${item.bank} / ${item.type}</span></td><td class="px-4 py-3 text-right font-mono font-bold text-[13px]">${item.amount.toLocaleString()}</td><td class="px-4 py-3 text-center"><span class="${item.status==='target'?'text-red-600 bg-red-50 border-red-100':'text-slate-500'} font-bold px-2 py-1 rounded border">${item.date} (D-${item.dday})</span></td><td class="px-4 py-3">${item.status==='target'?`<button onclick="app.openProposalModal('${item.name}','B2B 대출 제안')" class="text-[11px] font-bold px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100 shadow-sm">대출 제안</button>`:`<span class="text-slate-400 font-bold text-[11px]">관찰 중</span>`}</td></tr>`).join('');
    },
    filterB2B() { const kw=document.getElementById('b2b-search').value.toLowerCase(); document.getElementById('b2b-tbody').innerHTML=this.buildB2BRows(DB.getB2B().filter(i=>!kw||i.name.toLowerCase().includes(kw)||i.regNo.includes(kw)||i.bank.toLowerCase().includes(kw))); },

    // ═══════════════════════════════════════
    //  법인카드 (월별 추이 포함)
    // ═══════════════════════════════════════
    renderCard() {
        const cards = DB.getCards(); const totalAmt = cards.reduce((s,c)=>s+c.amount,0);
        return `<div class="max-w-[1400px] mx-auto">
            <div class="grid grid-cols-4 gap-4 mb-5">
                <div class="bg-white border border-slate-200 p-4 rounded shadow-sm"><p class="text-[11px] font-bold text-slate-500 mb-1">타행카드 총액</p><h3 class="text-2xl font-black font-mono text-slate-800">${Math.round(totalAmt/100000000).toLocaleString()}<span class="text-sm text-slate-400 ml-1">억</span></h3></div>
                <div class="bg-teal-50 border border-teal-200 p-4 rounded shadow-sm"><p class="text-[11px] font-bold text-teal-700 mb-1">주유/교통 비중</p><h3 class="text-2xl font-black text-teal-800">40<span class="text-lg ml-0.5">%</span></h3></div>
                <div class="bg-blue-50 border border-blue-200 p-4 rounded shadow-sm"><p class="text-[11px] font-bold text-blue-700 mb-1">전환 타겟</p><h3 class="text-2xl font-black text-blue-800">${cards.length}<span class="text-sm ml-1">건</span></h3></div>
                <div class="bg-amber-50 border border-amber-200 p-4 rounded shadow-sm"><p class="text-[11px] font-bold text-amber-700 mb-1">연간 절감 예상</p><h3 class="text-2xl font-black text-amber-800 font-mono">${Math.round(totalAmt*0.08/10000).toLocaleString()}<span class="text-sm ml-1">만</span></h3></div>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div class="lg:col-span-4 space-y-4">
                    <div class="bg-white border border-slate-200 rounded p-5 shadow-sm"><h3 class="font-bold text-slate-800 text-[14px] mb-4">업종별 비율<span class="info-tip"><i class="fa-solid fa-circle-info"></i><span class="tip-box"><b>수집:</b> 카드사명, 사용카드 장수, 사용건수, 사용액<br>타행 법인카드 승인내역에서 업종별 결제 비중을 도넛 차트로 표시합니다.</span></span></h3><div class="h-[200px] flex justify-center"><canvas id="cardChart"></canvas></div></div>
                    <div class="bg-white border border-slate-200 rounded p-5 shadow-sm"><h3 class="font-bold text-slate-800 text-[14px] mb-4">월별 추이 (8개월)<span class="info-tip"><i class="fa-solid fa-circle-info"></i><span class="tip-box"><b>수집:</b> 카드사명, 사용액 (월별)<br>8개월간 결제 금액 추이를 업종별 라인 차트로 표시합니다.</span></span></h3><div class="h-[200px]"><canvas id="cardTrendChart"></canvas></div></div>
                </div>
                <div class="lg:col-span-8 bg-white border border-slate-200 rounded flex flex-col shadow-sm overflow-hidden">
                    <div class="px-4 py-3 border-b border-slate-200 bg-slate-50 flex justify-between items-center"><h3 class="text-[14px] font-bold text-slate-800">고액 결제 기업 타겟<span class="info-tip"><i class="fa-solid fa-circle-info"></i><span class="tip-box"><b>수집:</b> 카드사명, 사용건수, 사용액<br>월 500만원+ 타행 카드 사용 기업 목록입니다.</span></span></h3><div class="relative"><i class="fa-solid fa-magnifying-glass absolute left-3 top-2 text-slate-400 text-xs"></i><input type="text" id="card-search" onkeyup="dataViews.filterCard()" placeholder="고객사, 카드사" class="border border-slate-300 rounded text-xs pl-8 pr-3 py-1.5 w-48 outline-none focus:border-teal-500 font-medium"></div></div>
                    <div class="overflow-y-auto max-h-[550px]"><table class="w-full text-left whitespace-nowrap"><thead class="bg-white text-[12px] text-slate-500 border-b border-slate-200 sticky top-0 z-10"><tr><th class="px-4 py-3 font-bold">고객사</th><th class="px-4 py-3 font-bold">타행 카드</th><th class="px-4 py-3 font-bold">업종</th><th class="px-4 py-3 font-bold text-right">월평균</th><th class="px-4 py-3 font-bold text-center">영업</th></tr></thead><tbody id="card-tbody" class="text-xs text-slate-700 divide-y divide-slate-100">${this.buildCardRows(cards)}</tbody></table></div>
                </div></div></div>`;
    },
    initCardChart() {
        const c1 = new Chart(document.getElementById('cardChart').getContext('2d'), { type:'doughnut', data:{ labels:['주유/교통비','항공/숙박','식대/접대비','공과금/기타'], datasets:[{ data:[40,35,15,10], backgroundColor:['#0d9488','#3b82f6','#94a3b8','#cbd5e1'], borderWidth:2, borderColor:'#fff' }] }, options:{ responsive:true, maintainAspectRatio:false, cutout:'65%', plugins:{ legend:{ position:'right', labels:{boxWidth:8,font:{size:10}} } } } });
        app.chartInstances.push(c1);
        const monthly = DB.getCardMonthlyByCategory(); const months=['2025.08','2025.09','2025.10','2025.11','2025.12','2026.01','2026.02','2026.03']; const colors={'주유/교통비':'#0d9488','항공/숙박(출장)':'#3b82f6','식대/접대비':'#94a3b8','공과금/기타':'#cbd5e1'};
        const ds = Object.entries(monthly).map(([cat,arr])=>({ label:cat, data:arr.map(a=>Math.round(a.amount/10000)), borderColor:colors[cat]||'#ccc', backgroundColor:'transparent', borderWidth:1.5, tension:0.3, pointRadius:2 }));
        const c2 = new Chart(document.getElementById('cardTrendChart').getContext('2d'), { type:'line', data:{ labels:months.map(m=>m.slice(5)+'월'), datasets:ds }, options:{ responsive:true, maintainAspectRatio:false, scales:{ y:{ beginAtZero:true, grid:{borderDash:[2,2],color:'#f1f5f9'}, border:{display:false}, ticks:{callback:v=>v+'만',font:{size:9}} }, x:{ grid:{display:false}, border:{display:false}, ticks:{font:{size:9}} } }, plugins:{ legend:{ position:'bottom', labels:{boxWidth:8,font:{size:9}} } } } });
        app.chartInstances.push(c2);
    },
    buildCardRows(data) {
        if(!data.length) return `<tr><td colspan="5" class="text-center py-10 text-slate-500 font-bold">결과 없음</td></tr>`;
        return data.map(item => `<tr class="hover:bg-slate-50"><td class="px-4 py-3"><span onclick="app.openCustomer360('${item.name}','card')" class="cursor-pointer text-teal-700 hover:underline font-bold text-[13px]">${item.name}</span></td><td class="px-4 py-3"><span class="bg-slate-100 text-slate-600 px-2 py-1 rounded font-bold text-[10px] border border-slate-200">${item.bank}</span></td><td class="px-4 py-3 font-bold text-[12px]">${item.category}</td><td class="px-4 py-3 text-right font-mono font-bold text-[13px]">${item.amount.toLocaleString()}</td><td class="px-4 py-3 text-center"><button onclick="app.openProposalModal('${item.name}','카드 제안')" class="text-[11px] font-bold px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100 shadow-sm">카드 제안</button></td></tr>`).join('');
    },
    filterCard() { const kw=document.getElementById('card-search').value.toLowerCase(); document.getElementById('card-tbody').innerHTML=this.buildCardRows(DB.getCards().filter(i=>!kw||i.name.toLowerCase().includes(kw)||i.category.toLowerCase().includes(kw)||i.bank.toLowerCase().includes(kw))); },

    // ═══════════════════════════════════════
    //  세금계산서
    // ═══════════════════════════════════════
    renderTax() {
        const ts = DB.getTaxSummary();
        return `<div class="max-w-[1400px] mx-auto flex flex-col h-full">
            <div class="grid grid-cols-4 gap-4 mb-4">
                <div class="bg-blue-50 border border-blue-200 p-4 rounded shadow-sm"><p class="text-[11px] font-bold text-blue-700 mb-1">매출 세금계산서</p><h3 class="text-2xl font-black font-mono text-blue-800">${Math.round(ts.salesAmt/100000000).toLocaleString()}<span class="text-sm ml-1">억</span></h3><p class="text-[10px] text-blue-600 mt-1">${ts.salesCnt}건</p></div>
                <div class="bg-red-50 border border-red-200 p-4 rounded shadow-sm"><p class="text-[11px] font-bold text-red-700 mb-1">매입 세금계산서</p><h3 class="text-2xl font-black font-mono text-red-800">${Math.round(ts.purchaseAmt/100000000).toLocaleString()}<span class="text-sm ml-1">억</span></h3><p class="text-[10px] text-red-600 mt-1">${ts.purchaseCnt}건</p></div>
                <div class="bg-teal-50 border border-teal-200 p-4 rounded shadow-sm"><p class="text-[11px] font-bold text-teal-700 mb-1">매출 우량 (여신 타겟)</p><h3 class="text-2xl font-black text-teal-800">${ts.premium}<span class="text-sm ml-1">개사</span></h3></div>
                <div class="bg-white border border-slate-200 p-4 rounded shadow-sm"><p class="text-[11px] font-bold text-slate-500 mb-1">순매출</p><h3 class="text-2xl font-black font-mono ${ts.salesAmt-ts.purchaseAmt>=0?'text-teal-800':'text-red-700'}">${Math.round((ts.salesAmt-ts.purchaseAmt)/100000000).toLocaleString()}<span class="text-sm ml-1">억</span></h3></div>
            </div>
            <div class="flex justify-between items-end mb-3"><h2 class="text-[15px] font-bold text-slate-800">세금계산서 매입/매출 장부<span class="info-tip"><i class="fa-solid fa-circle-info"></i><span class="tip-box"><b>수집:</b> 매입/매출, 사업자명, 합계금액, 품목, 작성일, 발행일<br>전자세금계산서 발행·수취 내역 테이블입니다.</span></span></h2><div class="flex space-x-2"><div class="relative"><i class="fa-solid fa-magnifying-glass absolute left-3 top-2 text-slate-400 text-xs"></i><input type="text" id="tax-search" onkeyup="dataViews.filterTax()" placeholder="거래처, 품목, 매출/매입" class="border border-slate-300 rounded text-xs pl-8 pr-3 py-1.5 w-56 outline-none focus:border-teal-500 font-medium"></div><button class="border border-slate-300 bg-white px-3 py-1.5 rounded text-xs font-bold text-slate-600 hover:bg-slate-50 shadow-sm"><i class="fa-solid fa-download mr-1.5"></i>엑셀</button></div></div>
            <div class="bg-white border border-slate-200 rounded overflow-hidden shadow-sm flex-1"><div class="overflow-y-auto max-h-[500px]"><table class="w-full text-left whitespace-nowrap"><thead class="bg-slate-50 text-[12px] text-slate-500 border-b border-slate-200 sticky top-0 z-10"><tr><th class="px-4 py-3 font-bold w-24 text-center">구분</th><th class="px-4 py-3 font-bold">거래처</th><th class="px-4 py-3 font-bold">품목</th><th class="px-4 py-3 font-bold text-right">공급가액</th><th class="px-4 py-3 font-bold text-center">여신 평가</th></tr></thead><tbody id="tax-tbody" class="text-xs text-slate-700 divide-y divide-slate-100">${this.buildTaxRows(DB.getTax())}</tbody></table></div></div></div>`;
    },
    buildTaxRows(data) {
        if(!data.length) return `<tr><td colspan="5" class="text-center py-10 text-slate-500 font-bold">결과 없음</td></tr>`;
        return data.map(item=>`<tr class="hover:bg-slate-50"><td class="px-4 py-3 text-center"><span class="${item.type==='매출'?'text-blue-700 bg-blue-50 border-blue-200':'text-red-600 bg-red-50 border-red-200'} font-bold px-2 py-0.5 rounded border text-[11px]">${item.type}</span></td><td class="px-4 py-3 font-bold text-[13px]"><span onclick="app.openCustomer360('${item.partner}','tax')" class="cursor-pointer text-teal-700 hover:underline">${item.partner}</span></td><td class="px-4 py-3 text-slate-600">${item.item}</td><td class="px-4 py-3 text-right font-mono font-bold text-[13px]">${item.amount.toLocaleString()}</td><td class="px-4 py-3 text-center">${item.status==='우량'?`<button onclick="app.openProposalModal('${item.partner}','여신 상향')" class="text-[11px] text-teal-700 font-bold border border-teal-200 bg-teal-50 px-2.5 py-1 rounded-full hover:bg-teal-100 shadow-sm">여신 상향</button>`:`<span class="text-[11px] text-slate-500 font-bold bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">${item.status==='지출'?'고정 지출':'일반 거래'}</span>`}</td></tr>`).join('');
    },
    filterTax() { const kw=document.getElementById('tax-search').value.toLowerCase(); document.getElementById('tax-tbody').innerHTML=this.buildTaxRows(DB.getTax().filter(i=>!kw||i.partner.toLowerCase().includes(kw)||i.item.toLowerCase().includes(kw)||i.type.includes(kw))); },

    // ═══════════════════════════════════════
    //  자금흐름 분석 (고객사별 필터)
    // ═══════════════════════════════════════
    renderCashFlow() {
        const companies = DB.getCashFlowCompanies();
        const summary = DB.getCashFlowSummary();
        const flows = DB.getCashFlow();
        const netClass = summary.net >= 0 ? 'teal' : 'amber';
        return `<div class="max-w-[1400px] mx-auto">
            <div class="flex justify-between items-center mb-5">
                <div class="flex items-center space-x-3">
                    <h2 class="text-lg font-bold text-slate-800">자금흐름 분석<span class="info-tip"><i class="fa-solid fa-circle-info"></i><span class="tip-box"><b>수집:</b> 모계좌 거래내역 + 수시입출 거래내역 + 이체결과/자금집금 내역<br>30일간 입출금 패턴을 차트로 시각화합니다.</span></span></h2>
                    <select id="cf-select" onchange="document.getElementById('cf-company').value=this.value; dataViews.filterCashFlow()" class="border border-slate-300 rounded text-xs px-3 py-1.5 outline-none focus:border-teal-500 font-bold text-slate-700">
                        <option value="">전체 고객사 합산</option>
                        ${companies.map(c => `<option value="${c}">${c}</option>`).join('')}
                    </select>
                    <div class="relative">
                        <i class="fa-solid fa-magnifying-glass absolute left-2.5 top-2 text-slate-400 text-xs"></i>
                        <input type="text" id="cf-company" list="cf-company-list" placeholder="고객사 직접 검색" oninput="dataViews.filterCashFlow()" class="pl-7 pr-3 py-1.5 border border-slate-300 rounded text-xs focus:border-teal-500 outline-none w-52 font-medium text-slate-700">
                        <datalist id="cf-company-list">${companies.map(c => `<option value="${c}">`).join('')}</datalist>
                    </div>
                    <button onclick="document.getElementById('cf-company').value=''; document.getElementById('cf-select').value=''; dataViews.filterCashFlow()" class="text-[11px] border border-slate-300 px-2.5 py-1.5 rounded font-bold text-slate-600 hover:bg-slate-50"><i class="fa-solid fa-rotate-right mr-1"></i>초기화</button>
                </div>
            </div>
            <div class="grid grid-cols-3 gap-4 mb-5" id="cf-kpi">
                <div class="bg-blue-50 border border-blue-200 p-5 rounded shadow-sm"><p class="text-[11px] font-bold text-blue-700 mb-1">최근 7일 입금</p><h3 class="text-3xl font-black font-mono text-blue-800" id="cf-in">${Math.round(summary.inTotal/100000000).toLocaleString()}<span class="text-lg ml-0.5">억</span></h3></div>
                <div class="bg-red-50 border border-red-200 p-5 rounded shadow-sm"><p class="text-[11px] font-bold text-red-700 mb-1">최근 7일 출금</p><h3 class="text-3xl font-black font-mono text-red-800" id="cf-out">${Math.round(summary.outTotal/100000000).toLocaleString()}<span class="text-lg ml-0.5">억</span></h3></div>
                <div class="bg-${netClass}-50 border border-${netClass}-200 p-5 rounded shadow-sm"><p class="text-[11px] font-bold text-${netClass}-700 mb-1">순 자금흐름</p><h3 class="text-3xl font-black font-mono text-${netClass}-800" id="cf-net">${summary.net>=0?'+':''}${Math.round(summary.net/100000000).toLocaleString()}<span class="text-lg ml-0.5">억</span></h3></div>
            </div>
            <div class="bg-white border border-slate-200 rounded p-5 shadow-sm mb-5">
                <h3 class="font-bold text-slate-800 text-[14px] mb-4">30일간 일별 입출금 추이 <span id="cf-chart-label" class="text-[11px] text-slate-500 font-normal">(전체 합산)</span></h3>
                <div class="h-[300px]"><canvas id="cashFlowChart"></canvas></div>
            </div>
            <div class="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
                <div class="px-4 py-3 border-b border-slate-200 bg-slate-50"><h3 class="font-bold text-slate-800 text-[14px]">일별 상세 내역<span class="info-tip"><i class="fa-solid fa-circle-info"></i><span class="tip-box"><b>수집:</b> 수시입출 거래내역(적요 포함)<br>일별 입금/출금/순흐름과 흑자·적자 상태를 테이블로 표시합니다.</span></span></h3></div>
                <div class="overflow-y-auto max-h-[350px]"><table class="w-full text-left whitespace-nowrap"><thead class="bg-white text-[12px] text-slate-500 border-b border-slate-200 sticky top-0 z-10"><tr><th class="px-4 py-3 font-bold">일자</th><th class="px-4 py-3 font-bold text-right">입금</th><th class="px-4 py-3 font-bold text-right">출금</th><th class="px-4 py-3 font-bold text-right">순 흐름</th><th class="px-4 py-3 font-bold text-center">상태</th></tr></thead>
                <tbody id="cf-tbody" class="text-xs text-slate-700 divide-y divide-slate-100">${this.buildCashFlowRows(flows)}</tbody></table></div>
            </div>
        </div>`;
    },
    buildCashFlowRows(flows) {
        return flows.map(f=>`<tr class="hover:bg-slate-50"><td class="px-4 py-3 font-mono font-bold text-slate-600">${f.date}</td><td class="px-4 py-3 text-right font-mono text-blue-700 font-bold">+${Math.round(f.inflow/1000000).toLocaleString()}백만</td><td class="px-4 py-3 text-right font-mono text-red-600 font-bold">-${Math.round(f.outflow/1000000).toLocaleString()}백만</td><td class="px-4 py-3 text-right font-mono font-bold ${f.net>=0?'text-teal-700':'text-amber-700'}">${f.net>=0?'+':''}${Math.round(f.net/1000000).toLocaleString()}백만</td><td class="px-4 py-3 text-center"><span class="text-[10px] font-bold px-2 py-0.5 rounded ${f.net>=0?'bg-teal-50 text-teal-700 border border-teal-200':'bg-amber-50 text-amber-700 border border-amber-200'}">${f.net>=0?'흑자':'적자'}</span></td></tr>`).join('');
    },
    initCashFlowChart() {
        const flows = DB.getCashFlow();
        const ctx = document.getElementById('cashFlowChart').getContext('2d');
        this._cfChart = new Chart(ctx, { type:'bar', data:{ labels:flows.map(f=>f.date), datasets:[
            { label:'입금', data:flows.map(f=>Math.round(f.inflow/1000000)), backgroundColor:'rgba(59,130,246,0.7)', borderRadius:2, barThickness:8 },
            { label:'출금', data:flows.map(f=>-Math.round(f.outflow/1000000)), backgroundColor:'rgba(239,68,68,0.5)', borderRadius:2, barThickness:8 },
            { label:'순 흐름', data:flows.map(f=>Math.round(f.net/1000000)), type:'line', borderColor:'#0d9488', backgroundColor:'transparent', borderWidth:2, tension:0.3, pointRadius:0 }
        ]}, options:{ responsive:true, maintainAspectRatio:false, scales:{ y:{ grid:{borderDash:[2,2],color:'#f1f5f9'}, border:{display:false}, ticks:{callback:v=>v+'백만',font:{size:9}} }, x:{ grid:{display:false}, border:{display:false}, ticks:{maxRotation:0,font:{size:8}} } }, plugins:{ legend:{ position:'bottom', labels:{boxWidth:8,font:{size:10}} } } } });
        app.chartInstances.push(this._cfChart);
    },
    _cfChart: null,
    filterCashFlow() {
        const input = document.getElementById('cf-company').value.trim();
        const companies = DB.getCashFlowCompanies();
        const company = companies.find(c => c === input) || '';
        const sel = document.getElementById('cf-select');
        if(sel && sel.value !== company) sel.value = company;
        const flows = DB.getCashFlow(company || undefined);
        const summary = DB.getCashFlowSummary(company || undefined);
        // KPI 업데이트
        document.getElementById('cf-in').innerHTML = `${Math.round(summary.inTotal/100000000).toLocaleString()}<span class="text-lg ml-0.5">억</span>`;
        document.getElementById('cf-out').innerHTML = `${Math.round(summary.outTotal/100000000).toLocaleString()}<span class="text-lg ml-0.5">억</span>`;
        document.getElementById('cf-net').innerHTML = `${summary.net>=0?'+':''}${Math.round(summary.net/100000000).toLocaleString()}<span class="text-lg ml-0.5">억</span>`;
        document.getElementById('cf-chart-label').textContent = company ? `(${company})` : '(전체 합산)';
        // 테이블 업데이트
        document.getElementById('cf-tbody').innerHTML = this.buildCashFlowRows(flows);
        // 차트 업데이트
        if (this._cfChart) {
            this._cfChart.data.labels = flows.map(f=>f.date);
            this._cfChart.data.datasets[0].data = flows.map(f=>Math.round(f.inflow/1000000));
            this._cfChart.data.datasets[1].data = flows.map(f=>-Math.round(f.outflow/1000000));
            this._cfChart.data.datasets[2].data = flows.map(f=>Math.round(f.net/1000000));
            this._cfChart.update();
        }
    },

    // ═══════════════════════════════════════
    //  제안 이력 관리
    // ═══════════════════════════════════════
    renderProposalHistory() {
        const st = DB.getProposalStats(); const data = DB.getProposals();
        const sc = { sent:'bg-slate-100 text-slate-600 border-slate-200', read:'bg-blue-50 text-blue-700 border-blue-200', responded:'bg-amber-50 text-amber-700 border-amber-200', accepted:'bg-teal-50 text-teal-700 border-teal-200', rejected:'bg-red-50 text-red-600 border-red-200', expired:'bg-slate-50 text-slate-400 border-slate-200' };
        return `<div class="max-w-[1400px] mx-auto">
            <div class="grid grid-cols-6 gap-3 mb-5">
                <div class="bg-white border border-slate-200 p-4 rounded shadow-sm border-l-4 border-l-slate-400"><p class="text-[10px] font-bold text-slate-500 mb-1">전체 발송</p><h3 class="text-2xl font-black text-slate-800">${st.total}<span class="text-sm ml-0.5">건</span></h3></div>
                <div class="bg-white border border-slate-200 p-4 rounded shadow-sm border-l-4 border-l-blue-400"><p class="text-[10px] font-bold text-blue-600 mb-1">열람 확인</p><h3 class="text-2xl font-black text-blue-800">${st.read}</h3></div>
                <div class="bg-white border border-slate-200 p-4 rounded shadow-sm border-l-4 border-l-amber-400"><p class="text-[10px] font-bold text-amber-600 mb-1">회신 접수</p><h3 class="text-2xl font-black text-amber-800">${st.responded}</h3></div>
                <div class="bg-white border border-slate-200 p-4 rounded shadow-sm border-l-4 border-l-teal-500"><p class="text-[10px] font-bold text-teal-600 mb-1">승인(계약)</p><h3 class="text-2xl font-black text-teal-800">${st.accepted}</h3></div>
                <div class="bg-white border border-slate-200 p-4 rounded shadow-sm border-l-4 border-l-red-400"><p class="text-[10px] font-bold text-red-600 mb-1">거절</p><h3 class="text-2xl font-black text-red-800">${st.rejected}</h3></div>
                <div class="bg-teal-50 border border-teal-200 p-4 rounded shadow-sm border-l-4 border-l-teal-600"><p class="text-[10px] font-bold text-teal-700 mb-1">전환율</p><h3 class="text-2xl font-black text-teal-800">${st.conversionRate}<span class="text-sm ml-0.5">%</span></h3><p class="text-[10px] text-teal-600 mt-0.5">계약금 ${Math.round(st.totalAmount/100000000).toLocaleString()}억</p></div>
            </div>
            <div class="grid grid-cols-12 gap-4 mb-5">
                <div class="col-span-4 bg-white border border-slate-200 rounded p-5 shadow-sm"><h3 class="font-bold text-slate-800 text-[14px] mb-4">제안 상태 분포<span class="info-tip"><i class="fa-solid fa-circle-info"></i><span class="tip-box"><b>활용:</b> 영업 제안의 상태별 분포(발송/열람/회신/승인/거절/만료)를 도넛 차트로 표시합니다.</span></span></h3><div class="h-[220px]"><canvas id="propStatusChart"></canvas></div></div>
                <div class="col-span-8 bg-white border border-slate-200 rounded p-5 shadow-sm"><h3 class="font-bold text-slate-800 text-[14px] mb-4">최근 30일 제안 발송 추이<span class="info-tip"><i class="fa-solid fa-circle-info"></i><span class="tip-box"><b>활용:</b> 일별 제안 발송 건수를 바 차트로 표시합니다.</span></span></h3><div class="h-[220px]"><canvas id="propTrendChart"></canvas></div></div>
            </div>
            <div class="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
                <div class="px-4 py-3 border-b border-slate-200 bg-slate-50 flex justify-between items-center"><h3 class="text-[14px] font-bold text-slate-800">제안 발송 이력<span class="info-tip"><i class="fa-solid fa-circle-info"></i><span class="tip-box"><b>활용:</b> 데이터 분석으로 식별된 타겟에 발송한 제안 이력을 추적합니다.</span></span></h3>
                    <div class="flex space-x-2"><select id="prop-status-filter" onchange="dataViews.filterProposals()" class="border border-slate-300 rounded text-xs px-2 py-1.5 font-bold"><option value="all">전체 상태</option><option value="sent">발송완료</option><option value="read">열람확인</option><option value="responded">회신접수</option><option value="accepted">승인</option><option value="rejected">거절</option></select>
                    <div class="relative"><i class="fa-solid fa-magnifying-glass absolute left-2.5 top-2 text-slate-400 text-xs"></i><input type="text" id="prop-search" oninput="dataViews.filterProposals()" placeholder="고객사, 유형, RM 검색" class="pl-7 pr-3 py-1.5 border border-slate-300 rounded text-xs w-52 outline-none focus:border-teal-500 font-medium"></div></div>
                </div>
                <div class="overflow-y-auto max-h-[400px]"><table class="w-full text-left whitespace-nowrap"><thead class="bg-white text-[12px] text-slate-500 border-b border-slate-200 sticky top-0 z-10"><tr><th class="px-4 py-3 font-bold">발송일</th><th class="px-4 py-3 font-bold">고객사</th><th class="px-4 py-3 font-bold">제안 유형</th><th class="px-4 py-3 font-bold">채널</th><th class="px-4 py-3 font-bold text-right">제안 금액</th><th class="px-4 py-3 font-bold text-center">RM</th><th class="px-4 py-3 font-bold text-center">상태</th></tr></thead>
                <tbody id="prop-tbody" class="text-xs text-slate-700 divide-y divide-slate-100">${this._buildPropRows(data,sc)}</tbody></table></div>
            </div></div>`;
    },
    _buildPropRows(data,sc) {
        return data.map(p=>`<tr class="hover:bg-slate-50"><td class="px-4 py-3 font-mono text-slate-500 text-[11px]">${p.sentAt}</td><td class="px-4 py-3 font-bold text-[13px]"><span onclick="app.openCustomer360('${p.company}','general')" class="cursor-pointer text-teal-700 hover:underline">${p.company}</span></td><td class="px-4 py-3 text-[11px]">${p.type}</td><td class="px-4 py-3">${p.channels.map(c=>`<span class="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded mr-0.5">${c}</span>`).join('')}</td><td class="px-4 py-3 text-right font-mono font-bold">${(p.amount/100000000).toFixed(1)}억</td><td class="px-4 py-3 text-center font-mono text-[11px]">${p.rm}</td><td class="px-4 py-3 text-center"><span class="text-[10px] font-bold px-2 py-0.5 rounded border ${sc[p.status]||''}">${p.statusLabel}</span></td></tr>`).join('');
    },
    initProposalCharts() {
        const st = DB.getProposalStats();
        const c1 = new Chart(document.getElementById('propStatusChart').getContext('2d'), { type:'doughnut', data:{ labels:['발송','열람','회신','승인','거절','만료'], datasets:[{data:[st.sent,st.read,st.responded,st.accepted,st.rejected,st.expired],backgroundColor:['#94a3b8','#3b82f6','#f59e0b','#0d9488','#ef4444','#cbd5e1'],borderWidth:2,borderColor:'#fff'}] }, options:{ responsive:true,maintainAspectRatio:false,cutout:'60%',plugins:{legend:{position:'bottom',labels:{boxWidth:8,font:{size:9}}}} } });
        app.chartInstances.push(c1);
        const props = DB.getProposals(); const dayMap = {};
        for(let i=29;i>=0;i--){ const d=new Date(Date.now()-i*86400000); dayMap[`${d.getMonth()+1}/${d.getDate()}`]=0; }
        props.forEach(p=>{ const parts=p.sentAt.split('-'); const k=parseInt(parts[1])+'/'+parseInt(parts[2]); if(dayMap[k]!==undefined) dayMap[k]++; });
        const c2 = new Chart(document.getElementById('propTrendChart').getContext('2d'), { type:'bar', data:{ labels:Object.keys(dayMap), datasets:[{label:'발송',data:Object.values(dayMap),backgroundColor:'rgba(13,148,136,0.6)',borderRadius:2,barThickness:6}] }, options:{ responsive:true,maintainAspectRatio:false,scales:{y:{beginAtZero:true,grid:{borderDash:[2,2],color:'#f1f5f9'},border:{display:false},ticks:{stepSize:1,font:{size:9}}},x:{grid:{display:false},border:{display:false},ticks:{maxRotation:0,font:{size:7},maxTicksLimit:10}}},plugins:{legend:{display:false}} } });
        app.chartInstances.push(c2);
    },
    filterProposals() {
        const sc = { sent:'bg-slate-100 text-slate-600 border-slate-200', read:'bg-blue-50 text-blue-700 border-blue-200', responded:'bg-amber-50 text-amber-700 border-amber-200', accepted:'bg-teal-50 text-teal-700 border-teal-200', rejected:'bg-red-50 text-red-600 border-red-200', expired:'bg-slate-50 text-slate-400 border-slate-200' };
        const data = DB.getProposals({ status:document.getElementById('prop-status-filter').value, keyword:document.getElementById('prop-search').value });
        document.getElementById('prop-tbody').innerHTML = this._buildPropRows(data,sc);
    },

    // ═══════════════════════════════════════
    //  캠페인 관리
    // ═══════════════════════════════════════
    renderCampaignView() {
        const camps = DB.getCampaigns(); const active=camps.filter(c=>c.status==='active');
        const tgt=camps.reduce((s,c)=>s+c.targetCount,0); const acc=camps.reduce((s,c)=>s+c.acceptCount,0);
        const stCls = { active:'bg-teal-50 text-teal-700 border-teal-200', scheduled:'bg-blue-50 text-blue-700 border-blue-200', completed:'bg-slate-100 text-slate-500 border-slate-200' };
        return `<div class="max-w-[1400px] mx-auto">
            <div class="grid grid-cols-4 gap-4 mb-5">
                <div class="bg-teal-50 border border-teal-200 p-4 rounded shadow-sm border-l-4 border-l-teal-500"><p class="text-[10px] font-bold text-teal-700 mb-1">진행 중</p><h3 class="text-2xl font-black text-teal-800">${active.length}<span class="text-sm ml-0.5">개</span></h3></div>
                <div class="bg-white border border-slate-200 p-4 rounded shadow-sm"><p class="text-[10px] font-bold text-slate-500 mb-1">전체 타겟</p><h3 class="text-2xl font-black text-slate-800">${tgt}<span class="text-sm ml-0.5">개사</span></h3></div>
                <div class="bg-blue-50 border border-blue-200 p-4 rounded shadow-sm"><p class="text-[10px] font-bold text-blue-700 mb-1">계약 전환</p><h3 class="text-2xl font-black text-blue-800">${acc}<span class="text-sm ml-0.5">건</span></h3></div>
                <div class="bg-amber-50 border border-amber-200 p-4 rounded shadow-sm"><p class="text-[10px] font-bold text-amber-700 mb-1">평균 전환율</p><h3 class="text-2xl font-black text-amber-800">${tgt>0?((acc/tgt)*100).toFixed(1):'0'}<span class="text-sm ml-0.5">%</span></h3></div>
            </div>
            <div class="space-y-4">${camps.map(c=>{const prog=c.targetCount>0?Math.round((c.sentCount/c.targetCount)*100):0;const cv=c.sentCount>0?((c.acceptCount/c.sentCount)*100).toFixed(1):'0';return `<div class="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden"><div class="p-5 flex justify-between items-start"><div class="flex-1"><div class="flex items-center space-x-2 mb-2"><span class="text-[10px] font-bold px-2 py-0.5 rounded border ${stCls[c.status]||''}">${c.statusLabel}</span><span class="text-[10px] text-slate-400 font-mono">${c.id}</span></div><h3 class="text-[16px] font-bold text-slate-800 mb-1">${c.name}</h3><p class="text-[12px] text-slate-500 mb-3">${c.desc}</p><div class="flex space-x-6 text-[11px]"><span class="text-slate-500">기간: <b class="text-slate-700">${c.startDate} ~ ${c.endDate}</b></span><span class="text-slate-500">유형: <b class="text-slate-700">${c.type}</b></span></div></div><div class="grid grid-cols-4 gap-3 text-center ml-6"><div class="bg-slate-50 border border-slate-200 rounded p-3 min-w-[80px]"><p class="text-[9px] font-bold text-slate-400 mb-0.5">타겟</p><p class="text-lg font-black text-slate-800">${c.targetCount}</p></div><div class="bg-blue-50 border border-blue-200 rounded p-3 min-w-[80px]"><p class="text-[9px] font-bold text-blue-600 mb-0.5">발송</p><p class="text-lg font-black text-blue-800">${c.sentCount}</p></div><div class="bg-amber-50 border border-amber-200 rounded p-3 min-w-[80px]"><p class="text-[9px] font-bold text-amber-600 mb-0.5">회신</p><p class="text-lg font-black text-amber-800">${c.responseCount}</p></div><div class="bg-teal-50 border border-teal-200 rounded p-3 min-w-[80px]"><p class="text-[9px] font-bold text-teal-600 mb-0.5">계약</p><p class="text-lg font-black text-teal-800">${c.acceptCount}</p></div></div></div><div class="px-5 pb-4"><div class="flex justify-between items-center mb-1.5"><span class="text-[10px] font-bold text-slate-500">발송 진행률</span><span class="text-[10px] font-bold text-slate-700">${prog}% (${c.sentCount}/${c.targetCount})</span></div><div class="w-full bg-slate-100 rounded-full h-2"><div class="h-2 rounded-full ${c.status==='completed'?'bg-slate-400':'bg-teal-500'}" style="width:${prog}%"></div></div><div class="flex justify-between mt-2"><span class="text-[10px] text-slate-400">전환율: <b class="${parseFloat(cv)>10?'text-teal-600':'text-slate-600'}">${cv}%</b></span>${c.status==='active'?'<button class="text-[11px] font-bold text-teal-600 hover:underline"><i class="fa-solid fa-paper-plane mr-1"></i>미발송 일괄 발송</button>':''}</div></div></div>`;}).join('')}</div></div>`;
    },

    // ═══════════════════════════════════════
    //  고객 세그먼트
    // ═══════════════════════════════════════
    _selectedSegment: null,
    renderSegmentView() {
        const segs = DB.getSegments(); const tot=segs.reduce((s,seg)=>s+seg.count,0);
        return `<div class="max-w-[1400px] mx-auto">
            <div class="grid grid-cols-2 gap-4 mb-4">
                <div class="bg-white border border-slate-200 p-4 rounded shadow-sm"><p class="text-[10px] font-bold text-slate-500 mb-1">전체 세그먼트</p><h3 class="text-2xl font-black text-slate-800">${segs.length}<span class="text-sm ml-0.5">개</span></h3></div>
                <div class="bg-white border border-slate-200 p-4 rounded shadow-sm"><p class="text-[10px] font-bold text-slate-500 mb-1">분류된 고객 총수</p><h3 class="text-2xl font-black text-slate-800">${tot}<span class="text-sm ml-0.5">개사</span></h3></div>
            </div>
            <div class="bg-white border border-slate-200 rounded shadow-sm p-5 mb-5"><h3 class="font-bold text-slate-800 text-[14px] mb-4"><i class="fa-solid fa-chart-bar text-teal-600 mr-1.5"></i>세그먼트별 고객 분포<span class="info-tip"><i class="fa-solid fa-circle-info"></i><span class="tip-box"><b>활용:</b> 전체 수집 데이터를 종합 스코어링하여 6개 세그먼트로 분류한 결과입니다.</span></span></h3><div class="h-[140px]"><canvas id="segMiniChart"></canvas></div></div>
            <div class="grid grid-cols-12 gap-4">
                <div class="col-span-5 space-y-3">${segs.map(seg=>`<div class="bg-white border border-slate-200 rounded-lg shadow-sm p-4 cursor-pointer hover:border-teal-300 hover:shadow-md transition ${this._selectedSegment===seg.id?'ring-2 ring-teal-500 border-teal-400':''}" onclick="dataViews.selectSegment('${seg.id}')"><div class="flex justify-between items-start"><div class="flex items-center space-x-3"><div class="w-10 h-10 rounded-lg flex items-center justify-center" style="background:${seg.color}15;border:1px solid ${seg.color}33"><i class="fa-solid ${seg.icon}" style="color:${seg.color}"></i></div><div><h4 class="font-bold text-[14px] text-slate-800">${seg.name}</h4><p class="text-[11px] text-slate-500 mt-0.5">${seg.criteria}</p></div></div><div class="text-right"><p class="text-xl font-black text-slate-800">${seg.count}</p><p class="text-[10px] text-slate-400">개사</p></div></div><div class="flex justify-between items-center mt-3 pt-3 border-t border-slate-100"><span class="text-[10px] text-slate-500">평균 스코어: <b class="text-slate-700">${seg.avgScore}점</b></span><button class="text-[10px] font-bold text-teal-600 hover:underline"><i class="fa-solid fa-paper-plane mr-0.5"></i>일괄 캠페인</button></div></div>`).join('')}</div>
                <div class="col-span-7 bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden" id="seg-detail">${this._selectedSegment?this._buildSegDetail(this._selectedSegment):'<div class="flex items-center justify-center h-[400px] text-slate-400 text-sm font-bold"><i class="fa-solid fa-arrow-left mr-2"></i>좌측에서 세그먼트를 선택하세요</div>'}</div>
            </div></div>`;
    },
    selectSegment(id) { this._selectedSegment=id; const el=document.getElementById('seg-detail'); if(el) el.innerHTML=this._buildSegDetail(id); },
    _buildSegDetail(id) {
        const seg=DB.getSegmentById(id); if(!seg) return '';
        return `<div class="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center"><div><h3 class="font-bold text-[14px] text-slate-800"><i class="fa-solid ${seg.icon} mr-1.5" style="color:${seg.color}"></i>${seg.name}</h3><p class="text-[11px] text-slate-500 mt-0.5">${seg.desc}</p></div><span class="text-[12px] font-bold px-3 py-1 rounded" style="background:${seg.color}15;color:${seg.color};border:1px solid ${seg.color}33">${seg.count}개사</span></div><div class="overflow-y-auto max-h-[500px]"><table class="w-full text-left whitespace-nowrap"><thead class="bg-white text-[12px] text-slate-500 border-b sticky top-0 z-10"><tr><th class="px-4 py-3 font-bold w-8">#</th><th class="px-4 py-3 font-bold">고객사</th><th class="px-4 py-3 font-bold text-center">스코어</th><th class="px-4 py-3 font-bold text-right">매출</th><th class="px-4 py-3 font-bold text-center">당행 점유</th><th class="px-4 py-3 font-bold text-center">조치</th></tr></thead><tbody class="text-xs text-slate-700 divide-y divide-slate-100">${seg.members.map((m,i)=>`<tr class="hover:bg-slate-50"><td class="px-4 py-2.5 font-bold text-slate-400">${i+1}</td><td class="px-4 py-2.5 font-bold text-[13px]"><span onclick="app.openCustomer360('${m.name}','general')" class="cursor-pointer text-teal-700 hover:underline">${m.name}</span></td><td class="px-4 py-2.5 text-center"><span class="font-mono font-bold ${m.score>=70?'text-teal-700':m.score>=50?'text-amber-700':'text-red-600'}">${m.score}</span></td><td class="px-4 py-2.5 text-right font-mono font-bold">${Math.round(m.revenue/100000000).toLocaleString()}억</td><td class="px-4 py-2.5 text-center"><div class="inline-flex items-center"><div class="w-12 bg-slate-100 rounded-full h-1.5 mr-1.5"><div class="h-1.5 rounded-full bg-teal-500" style="width:${m.hanaRatio}%"></div></div><span class="text-[10px] font-bold">${m.hanaRatio}%</span></div></td><td class="px-4 py-2.5 text-center"><button onclick="app.openProposalModal('${m.name}','세그먼트 맞춤 제안')" class="text-[10px] font-bold text-teal-600 hover:underline">제안 발송</button></td></tr>`).join('')}</tbody></table></div>`;
    },
    initSegmentChart() {
        const segs=DB.getSegments(); if(!document.getElementById('segMiniChart')) return;
        const c=new Chart(document.getElementById('segMiniChart').getContext('2d'),{type:'bar',data:{labels:segs.map(s=>s.name),datasets:[{label:'고객수',data:segs.map(s=>s.count),backgroundColor:segs.map(s=>s.color+'cc'),borderColor:segs.map(s=>s.color),borderWidth:1,borderRadius:4,barThickness:20}]},options:{responsive:true,maintainAspectRatio:false,indexAxis:'y',scales:{x:{beginAtZero:true,grid:{borderDash:[2,2],color:'#f1f5f9'},border:{display:false},ticks:{font:{size:10}}},y:{grid:{display:false},border:{display:false},ticks:{font:{size:11,weight:'bold'},color:'#334155'}}},plugins:{legend:{display:false}}}});
        app.chartInstances.push(c);
    }
};
