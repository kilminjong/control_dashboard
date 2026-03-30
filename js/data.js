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
    //  금융자산 점유 현황 (타행 비중 TOP5 유치 타겟 추가)
    // ═══════════════════════════════════════
    renderAsset() {
        const summary  = DB.getDepositSummary();
        const assets   = DB.getAssets();
        const d30      = assets.filter(a => a.dday <= 30).length;
        const top5     = DB.getOtherBankTop(5);
        const otherPct = 100 - Math.round(Number(summary.hanaRatio));

        return `<div class="max-w-[1400px] mx-auto space-y-4">
            <div class="grid grid-cols-5 gap-4">
                <div class="bg-teal-50 border border-teal-200 p-4 rounded shadow-sm border-l-4 border-l-teal-500">
                    <p class="text-[10px] font-bold text-teal-700 mb-1">당행(하나) 점유 자산</p>
                    <h3 class="text-2xl font-black font-mono text-teal-800">${Math.round(summary.hanaShare/100000000).toLocaleString()}<span class="text-sm ml-1">억</span></h3>
                    <p class="text-[10px] text-teal-600 mt-1">점유율 <b>${summary.hanaRatio}%</b></p>
                </div>
                <div class="bg-white border border-slate-200 p-4 rounded shadow-sm border-l-4 border-l-slate-300">
                    <p class="text-[10px] font-bold text-slate-500 mb-1">전 금융기관 합산</p>
                    <h3 class="text-2xl font-black font-mono text-slate-800">${Math.round(summary.totalAll/100000000).toLocaleString()}<span class="text-sm text-slate-400 ml-1">억</span></h3>
                </div>
                <div class="bg-blue-50 border border-blue-200 p-4 rounded shadow-sm border-l-4 border-l-blue-500">
                    <p class="text-[10px] font-bold text-blue-700 mb-1">정기예금 총액</p>
                    <h3 class="text-2xl font-black font-mono text-blue-800">${Math.round(summary.totalDeposit/100000000).toLocaleString()}<span class="text-sm ml-1">억</span></h3>
                </div>
                <div class="bg-red-50 border border-red-200 p-4 rounded shadow-sm border-l-4 border-l-red-500">
                    <p class="text-[10px] font-bold text-red-700 mb-1">D-30 만기 임박</p>
                    <h3 class="text-2xl font-black font-mono text-red-800">${d30}<span class="text-sm ml-1">건</span></h3>
                </div>
                <div class="bg-amber-50 border border-amber-200 p-4 rounded shadow-sm border-l-4 border-l-amber-500">
                    <p class="text-[10px] font-bold text-amber-700 mb-1">타행 유치 가능액</p>
                    <h3 class="text-2xl font-black font-mono text-amber-800">${Math.round((summary.totalAll-summary.hanaShare)/100000000).toLocaleString()}<span class="text-sm ml-1">억</span></h3>
                    <p class="text-[10px] text-amber-600 mt-1">타행 비중 <b>${otherPct}%</b></p>
                </div>
            </div>
            <div class="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
                <div class="px-5 py-3 border-b border-slate-200 bg-gradient-to-r from-amber-50 to-white flex justify-between items-center">
                    <div class="flex items-center gap-2">
                        <i class="fa-solid fa-bullseye text-amber-500 text-[15px]"></i>
                        <div>
                            <h3 class="text-[13px] font-bold text-slate-800">타행 비중 TOP 5 — 유치 우선 타겟</h3>
                            <p class="text-[10px] text-slate-400 mt-0.5">타행 보유 비중이 높은 순 · 당장 유치 영업이 필요한 고객사</p>
                        </div>
                    </div>
                    <button onclick="app.loadView('depositView', document.querySelectorAll('[data-menu]')[2])" class="text-[11px] font-bold text-teal-600 hover:underline flex items-center gap-1">전체 분석 보기 <i class="fa-solid fa-arrow-right text-[9px]"></i></button>
                </div>
                <div class="grid grid-cols-5 divide-x divide-slate-100">
                    ${top5.map((c, i) => {
                        const rankColor = ['#ef4444','#f59e0b','#3b82f6','#8b5cf6','#64748b'][i];
                        const urgency = c.otherRatio>=80?{label:'긴급',cls:'bg-red-100 text-red-700'}:c.otherRatio>=60?{label:'중요',cls:'bg-amber-100 text-amber-700'}:{label:'관찰',cls:'bg-blue-100 text-blue-700'};
                        return `<div class="p-4 hover:bg-slate-50 transition">
                            <div class="flex items-start justify-between mb-3">
                                <div class="flex items-center gap-2 min-w-0">
                                    <span class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0" style="background:${rankColor}">${i+1}</span>
                                    <p class="text-[12px] font-bold text-slate-800 truncate" title="${c.name}">${c.name}</p>
                                </div>
                                <span class="text-[9px] font-bold px-1.5 py-0.5 rounded ml-1 shrink-0 ${urgency.cls}">${urgency.label}</span>
                            </div>
                            <div class="mb-1.5">
                                <div class="flex rounded-full overflow-hidden h-2">
                                    <div class="bg-teal-400 h-full" style="width:${c.hanaRatio}%"></div>
                                    <div class="h-full" style="width:${c.otherRatio}%;background:${rankColor}99"></div>
                                </div>
                                <div class="flex justify-between mt-1">
                                    <span class="text-[9px] text-teal-600 font-bold">당행 ${c.hanaRatio}%</span>
                                    <span class="text-[9px] font-bold" style="color:${rankColor}">타행 ${c.otherRatio}%</span>
                                </div>
                            </div>
                            <div class="flex justify-between items-end mt-2.5 pt-2.5 border-t border-slate-100">
                                <div><p class="text-[9px] text-slate-400">주 타행</p><p class="text-[10px] font-bold text-slate-600">${c.topBank}</p></div>
                                <div class="text-right"><p class="text-[9px] text-slate-400">타행 보유액</p><p class="text-[12px] font-black font-mono" style="color:${rankColor}">${Math.round(c.other/100000000).toLocaleString()}억</p></div>
                            </div>
                            <button onclick="app.openProposalModal('${c.name}','예적금 유치 제안')" class="w-full mt-3 text-[10px] font-bold py-1.5 rounded border transition" style="color:${rankColor};border-color:${rankColor}44;background:${rankColor}08" onmouseover="this.style.background='${rankColor}14'" onmouseout="this.style.background='${rankColor}08'">
                                <i class="fa-solid fa-paper-plane mr-1"></i>유치 제안 발송
                            </button>
                        </div>`;
                    }).join('')}
                </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div class="bg-white border border-slate-200 rounded p-5 shadow-sm">
                    <h3 class="font-bold text-slate-800 text-[14px] mb-1">금융기관별 자산 점유율<span class="info-tip"><i class="fa-solid fa-circle-info"></i><span class="tip-box"><b>수집:</b> 은행명, 계좌구분, 보유금액<br>은행별 스택 바차트로 자산 분포를 비교합니다.</span></span></h3>
                    <p class="text-[11px] text-slate-400 mb-4">예금 + 적금 합산 (억 원)</p>
                    <div class="h-[280px]"><canvas id="assetChart"></canvas></div>
                </div>
                <div class="bg-white border border-slate-200 rounded shadow-sm flex flex-col overflow-hidden">
                    <div class="px-4 py-3 border-b border-slate-200 bg-slate-50 flex justify-between items-center shrink-0">
                        <h3 class="font-bold text-slate-800 text-[13px]">만기 도래 타겟<span class="info-tip"><i class="fa-solid fa-circle-info"></i><span class="tip-box"><b>수집:</b> 계좌 원장 — 은행명, 잔액, 만기일, 이율<br>D-30 이내 빨간 강조, 유치 제안 즉시 발송 가능.</span></span></h3>
                        <input type="text" id="asset-search" onkeyup="dataViews.filterAsset()" placeholder="고객사, 은행명 검색" class="border border-slate-300 rounded text-xs px-3 py-1 w-44 outline-none focus:border-teal-500 font-medium">
                    </div>
                    <div id="asset-list" class="overflow-y-auto p-3 space-y-1.5" style="max-height:372px">${this.buildAssetRows(assets)}</div>
                </div>
            </div>
        </div>`;
    },
    initAssetChart() {
        const d = DB.getDepositDetail();
        const chart = new Chart(document.getElementById('assetChart').getContext('2d'), {
            type:'bar', data:{ labels:d.map(x=>x.bank), datasets:[
                {label:'정기예금',data:d.map(x=>Math.round(x.deposit/100000000)),backgroundColor:d.map(x=>x.color),borderRadius:4,barThickness:36},
                {label:'적금',data:d.map(x=>Math.round(x.savings/100000000)),backgroundColor:d.map(x=>x.color+'88'),borderRadius:4,barThickness:36}
            ]},
            options:{responsive:true,maintainAspectRatio:false,scales:{y:{beginAtZero:true,stacked:true,grid:{borderDash:[2,2],color:'#f1f5f9'},border:{display:false},ticks:{callback:v=>v+'억',font:{size:9}}},x:{stacked:true,grid:{display:false},border:{display:false},ticks:{font:{size:10}}}},plugins:{legend:{position:'bottom',labels:{boxWidth:10,font:{size:10}}}}}
        });
        app.chartInstances.push(chart);
    },
    buildAssetRows(data) {
        if(!data.length) return `<div class="text-center py-10 text-slate-500 font-bold text-xs">검색 결과가 없습니다.</div>`;
        return data.map(item => {
            const isUrgent = item.dday<=30;
            return `<div class="flex items-center justify-between px-3 py-2.5 rounded-lg border ${isUrgent?'bg-red-50 border-red-200':'bg-slate-50 border-slate-200'} hover:brightness-95 transition">
                <div class="min-w-0 flex-1 mr-3">
                    <div class="flex items-center gap-1.5 flex-wrap">
                        <span onclick="app.openCustomer360('${item.name}','asset')" class="text-[12px] font-bold text-teal-700 hover:underline cursor-pointer">${item.name}</span>
                        <span class="text-[9px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-500">${item.bank}</span>
                        ${isUrgent?`<span class="text-[9px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded">D-${item.dday} 긴급</span>`:`<span class="text-[9px] text-slate-400">D-${item.dday}</span>`}
                    </div>
                    <p class="text-[10px] mt-0.5 ${isUrgent?'text-red-500 font-bold':'text-slate-400'}">${item.product}</p>
                </div>
                <div class="text-right shrink-0">
                    <p class="text-[13px] font-black font-mono ${isUrgent?'text-red-700':'text-slate-800'}">${Math.round(item.amount/100000000).toLocaleString()}억</p>
                    <button onclick="app.openProposalModal('${item.name}','예적금 유치 제안')" class="text-[10px] font-bold px-2.5 py-1 rounded mt-1 shadow-sm transition ${isUrgent?'bg-red-600 hover:bg-red-700 text-white':'bg-teal-600 hover:bg-teal-700 text-white'}">유치 제안</button>
                </div>
            </div>`;
        }).join('');
    },
    filterAsset() {
        const kw=document.getElementById('asset-search').value.toLowerCase();
        document.getElementById('asset-list').innerHTML=this.buildAssetRows(DB.getAssets().filter(i=>!kw||i.name.toLowerCase().includes(kw)||i.bank.toLowerCase().includes(kw)));
    },

    // ═══════════════════════════════════════
    //  예적금 보유/만기 분석 (D-30 KPI + 만기 탭 필터)
    // ═══════════════════════════════════════
    _depFilter: 'all',
    renderDepositView() {
        const details=DB.getDepositDetail(), summary=DB.getDepositSummary(), byCompany=DB.getAssetsByCompany(), allAssets=DB.getAssets();
        const cnt30=allAssets.filter(a=>a.dday<=30).length, cnt60=allAssets.filter(a=>a.dday>30&&a.dday<=60).length, cnt90=allAssets.filter(a=>a.dday>60&&a.dday<=90).length;
        const amt30=allAssets.filter(a=>a.dday<=30).reduce((s,a)=>s+a.amount,0), amt60=allAssets.filter(a=>a.dday>30&&a.dday<=60).reduce((s,a)=>s+a.amount,0);
        this._depFilter='all';
        return `<div class="max-w-[1400px] mx-auto space-y-4">
            <div class="grid grid-cols-6 gap-3">
                <div class="bg-teal-50 border border-teal-200 p-4 rounded shadow-sm border-l-4 border-l-teal-500"><p class="text-[10px] font-bold text-teal-700 mb-1">당행 점유율</p><h3 class="text-2xl font-black text-teal-800">${summary.hanaRatio}<span class="text-base ml-0.5">%</span></h3><p class="text-[10px] text-teal-600 mt-1">${Math.round(summary.hanaShare/100000000).toLocaleString()}억 / ${Math.round(summary.totalAll/100000000).toLocaleString()}억</p></div>
                <div class="bg-blue-50 border border-blue-200 p-4 rounded shadow-sm border-l-4 border-l-blue-500"><p class="text-[10px] font-bold text-blue-700 mb-1">정기예금</p><h3 class="text-2xl font-black text-blue-800 font-mono">${Math.round(summary.totalDeposit/100000000).toLocaleString()}<span class="text-base ml-0.5">억</span></h3></div>
                <div class="bg-amber-50 border border-amber-200 p-4 rounded shadow-sm border-l-4 border-l-amber-500"><p class="text-[10px] font-bold text-amber-700 mb-1">적금</p><h3 class="text-2xl font-black text-amber-800 font-mono">${Math.round(summary.totalSavings/100000000).toLocaleString()}<span class="text-base ml-0.5">억</span></h3></div>
                <div class="bg-red-50 border-2 border-red-300 p-4 rounded shadow-sm cursor-pointer hover:bg-red-100 transition" onclick="dataViews.setDepFilter('d30')" id="kpi-d30"><div class="flex justify-between items-start mb-1"><p class="text-[10px] font-bold text-red-700">D-30 만기 임박</p><i class="fa-solid fa-triangle-exclamation text-red-500 text-[11px]"></i></div><h3 class="text-2xl font-black text-red-800">${cnt30}<span class="text-base ml-0.5">건</span></h3><p class="text-[10px] text-red-600 mt-1 font-mono">${Math.round(amt30/100000000).toLocaleString()}억 규모</p></div>
                <div class="bg-orange-50 border border-orange-200 p-4 rounded shadow-sm cursor-pointer hover:bg-orange-100 transition" onclick="dataViews.setDepFilter('d60')" id="kpi-d60"><div class="flex justify-between items-start mb-1"><p class="text-[10px] font-bold text-orange-700">D-60 만기 예정</p><i class="fa-solid fa-clock text-orange-400 text-[11px]"></i></div><h3 class="text-2xl font-black text-orange-700">${cnt60}<span class="text-base ml-0.5">건</span></h3><p class="text-[10px] text-orange-600 mt-1 font-mono">${Math.round(amt60/100000000).toLocaleString()}억 규모</p></div>
                <div class="bg-yellow-50 border border-yellow-200 p-4 rounded shadow-sm cursor-pointer hover:bg-yellow-100 transition" onclick="dataViews.setDepFilter('d90')" id="kpi-d90"><div class="flex justify-between items-start mb-1"><p class="text-[10px] font-bold text-yellow-700">D-90 만기 예정</p><i class="fa-solid fa-calendar text-yellow-500 text-[11px]"></i></div><h3 class="text-2xl font-black text-yellow-700">${cnt90}<span class="text-base ml-0.5">건</span></h3><p class="text-[10px] text-yellow-600 mt-1">클릭 시 필터 적용</p></div>
            </div>
            <div class="grid grid-cols-12 gap-4">
                <div class="col-span-5 bg-white border border-slate-200 rounded p-5 shadow-sm"><h3 class="font-bold text-slate-800 text-[14px] mb-1">금융기관별 점유<span class="info-tip"><i class="fa-solid fa-circle-info"></i><span class="tip-box"><b>수집:</b> 은행명, 잔액, 만기일, 이율</span></span></h3><p class="text-[11px] text-slate-500 mb-4">정기예금 + 적금 합산</p><div class="h-[260px]"><canvas id="depositPieChart"></canvas></div></div>
                <div class="col-span-7 bg-white border border-slate-200 rounded p-5 shadow-sm"><h3 class="font-bold text-slate-800 text-[14px] mb-4">은행별 만기 도래 분석</h3>
                <table class="w-full text-left whitespace-nowrap"><thead class="bg-slate-50 text-[12px] text-slate-500 border-b border-slate-200"><tr><th class="px-4 py-3 font-bold">금융기관</th><th class="px-4 py-3 font-bold text-right">정기예금</th><th class="px-4 py-3 font-bold text-right">적금</th><th class="px-4 py-3 font-bold text-center"><span class="text-red-600">D-30</span><span class="text-[9px] bg-red-100 text-red-600 px-1 py-0.5 rounded ml-1 font-bold">임박</span></th><th class="px-4 py-3 font-bold text-center text-orange-600">D-60</th><th class="px-4 py-3 font-bold text-center text-yellow-600">D-90</th><th class="px-4 py-3 font-bold text-center">금리</th></tr></thead>
                <tbody class="text-xs text-slate-700 divide-y divide-slate-100">${details.map(d=>`<tr class="hover:bg-slate-50"><td class="px-4 py-3 font-bold text-[13px]"><span class="inline-block w-2.5 h-2.5 rounded-full mr-2" style="background:${d.color}"></span>${d.bank}</td><td class="px-4 py-3 text-right font-mono font-bold">${Math.round(d.deposit/100000000).toLocaleString()}억</td><td class="px-4 py-3 text-right font-mono">${Math.round(d.savings/100000000).toLocaleString()}억</td><td class="px-4 py-3 text-center">${d.maturity30>0?`<span class="inline-flex items-center gap-1 text-red-700 font-black bg-red-100 px-2 py-0.5 rounded border border-red-200 text-[11px]"><i class="fa-solid fa-triangle-exclamation text-[9px]"></i>${d.maturity30}</span>`:`<span class="text-slate-300 font-bold">-</span>`}</td><td class="px-4 py-3 text-center">${d.maturity60>0?`<span class="text-orange-700 font-bold bg-orange-50 px-2 py-0.5 rounded border border-orange-200 text-[11px]">${d.maturity60}</span>`:`<span class="text-slate-300 font-bold">-</span>`}</td><td class="px-4 py-3 text-center">${d.maturity90>0?`<span class="text-yellow-700 font-bold bg-yellow-50 px-2 py-0.5 rounded border border-yellow-200 text-[11px]">${d.maturity90}</span>`:`<span class="text-slate-300 font-bold">-</span>`}</td><td class="px-4 py-3 text-center font-mono font-bold text-teal-700">${d.rate}%</td></tr>`).join('')}</tbody></table></div>
            </div>
            <div class="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
                <div class="px-4 py-3 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                    <div class="flex items-center gap-3">
                        <h3 class="text-[14px] font-bold text-slate-800"><i class="fa-solid fa-building mr-1.5 text-teal-600"></i>고객사별 예적금 보유 현황</h3>
                        <div class="flex rounded-lg border border-slate-200 overflow-hidden text-[11px] font-bold" id="dep-tab-group">
                            <button onclick="dataViews.setDepFilter('all')" id="tab-all" class="px-3 py-1.5 bg-slate-800 text-white transition">전체</button>
                            <button onclick="dataViews.setDepFilter('d30')" id="tab-d30" class="px-3 py-1.5 bg-white text-slate-500 hover:bg-red-50 hover:text-red-700 transition border-l border-slate-200">D-30 <span class="ml-1 text-[10px] bg-red-100 text-red-700 px-1 rounded">${cnt30}</span></button>
                            <button onclick="dataViews.setDepFilter('d60')" id="tab-d60" class="px-3 py-1.5 bg-white text-slate-500 hover:bg-orange-50 hover:text-orange-700 transition border-l border-slate-200">D-60 <span class="ml-1 text-[10px] bg-orange-100 text-orange-700 px-1 rounded">${cnt60}</span></button>
                            <button onclick="dataViews.setDepFilter('d90')" id="tab-d90" class="px-3 py-1.5 bg-white text-slate-500 hover:bg-yellow-50 hover:text-yellow-700 transition border-l border-slate-200">D-90 <span class="ml-1 text-[10px] bg-yellow-100 text-yellow-700 px-1 rounded">${cnt90}</span></button>
                        </div>
                    </div>
                    <input type="text" id="dep-company-search" onkeyup="dataViews.filterDepositCompany()" placeholder="고객사명 검색" class="border border-slate-300 rounded text-xs px-3 py-1.5 w-44 outline-none focus:border-teal-500 font-medium">
                </div>
                <div id="dep-filter-banner" class="hidden px-4 py-2 border-b text-[11px] font-bold flex items-center gap-2"></div>
                <div class="overflow-y-auto max-h-[420px]">
                    <table class="w-full text-left whitespace-nowrap"><thead class="bg-white text-[12px] text-slate-500 border-b border-slate-200 sticky top-0 z-10"><tr><th class="px-4 py-3 font-bold">고객사</th><th class="px-4 py-3 font-bold text-center">보유 건수</th><th class="px-4 py-3 font-bold">보유 금융기관</th><th class="px-4 py-3 font-bold text-right">총 보유액</th><th class="px-4 py-3 font-bold text-center">D-30</th><th class="px-4 py-3 font-bold text-center">D-60</th><th class="px-4 py-3 font-bold text-center">D-90</th><th class="px-4 py-3 font-bold text-center">영업 조치</th></tr></thead>
                    <tbody id="dep-company-tbody" class="text-xs text-slate-700 divide-y divide-slate-100">${this.buildDepositCompanyRows(byCompany,'all')}</tbody></table>
                </div>
            </div>
        </div>`;
    },
    setDepFilter(filter) {
        this._depFilter=filter;
        ['all','d30','d60','d90'].forEach(f=>{
            const btn=document.getElementById('tab-'+f); if(!btn) return;
            if(f===filter){const ac=f==='d30'?'bg-red-600 text-white':f==='d60'?'bg-orange-500 text-white':f==='d90'?'bg-yellow-500 text-white':'bg-slate-800 text-white';btn.className=`px-3 py-1.5 ${ac} transition border-l border-slate-200 font-bold text-[11px]`;}
            else btn.className='px-3 py-1.5 bg-white text-slate-500 hover:bg-slate-50 transition border-l border-slate-200 font-bold text-[11px]';
        });
        ['d30','d60','d90'].forEach(f=>{
            const kpi=document.getElementById('kpi-'+f); if(!kpi) return;
            if(f===filter) kpi.classList.add('ring-2','ring-offset-1',f==='d30'?'ring-red-400':f==='d60'?'ring-orange-400':'ring-yellow-400');
            else kpi.classList.remove('ring-2','ring-offset-1','ring-red-400','ring-orange-400','ring-yellow-400');
        });
        const banner=document.getElementById('dep-filter-banner');
        if(banner){
            if(filter==='all'){banner.classList.add('hidden');}
            else{const cfg={d30:{text:'D-30 이내 만기 임박 고객사만 표시 중',bg:'bg-red-50 border-red-200 text-red-700',icon:'fa-triangle-exclamation text-red-500'},d60:{text:'D-31~D-60 만기 예정 고객사만 표시 중',bg:'bg-orange-50 border-orange-200 text-orange-700',icon:'fa-clock text-orange-400'},d90:{text:'D-61~D-90 만기 예정 고객사만 표시 중',bg:'bg-yellow-50 border-yellow-200 text-yellow-700',icon:'fa-calendar text-yellow-500'}}[filter];banner.className=`px-4 py-2 border-b text-[11px] font-bold flex items-center gap-2 ${cfg.bg}`;banner.innerHTML=`<i class="fa-solid ${cfg.icon}"></i>${cfg.text}<button onclick="dataViews.setDepFilter('all')" class="ml-auto text-[10px] underline opacity-70 hover:opacity-100">필터 해제</button>`;banner.classList.remove('hidden');}
        }
        this.filterDepositCompany();
    },
    buildDepositCompanyRows(data, filter) {
        const f=filter||this._depFilter||'all';
        let rows=[...data];
        if(f==='d30') rows=rows.filter(c=>c.d30>0).sort((a,b)=>b.d30-a.d30);
        if(f==='d60'){const names=new Set(DB.getAssets().filter(a=>a.dday>30&&a.dday<=60).map(a=>a.name));rows=rows.filter(c=>names.has(c.name));}
        if(f==='d90'){const names=new Set(DB.getAssets().filter(a=>a.dday>60&&a.dday<=90).map(a=>a.name));rows=rows.filter(c=>names.has(c.name));}
        if(!rows.length) return `<tr><td colspan="8" class="text-center py-10 text-slate-500 font-bold">해당 구간 만기 고객사가 없습니다.</td></tr>`;
        return rows.map(c=>{
            const assets=DB.getAssets().filter(a=>a.name===c.name||c.name.startsWith(a.name.split(' ')[0]));
            const d60cnt=assets.filter(a=>a.dday>30&&a.dday<=60).length, d90cnt=assets.filter(a=>a.dday>60&&a.dday<=90).length;
            const isHL=(f==='d30'&&c.d30>0)||(f==='d60'&&d60cnt>0)||(f==='d90'&&d90cnt>0);
            const rowBg=isHL&&f==='d30'?'bg-red-50 hover:bg-red-100':isHL&&f==='d60'?'bg-orange-50 hover:bg-orange-100':isHL&&f==='d90'?'bg-yellow-50 hover:bg-yellow-50':'hover:bg-slate-50';
            const d30cell=c.d30>0?`<span class="inline-flex items-center gap-1 text-red-700 font-black bg-red-100 px-2 py-0.5 rounded border border-red-200 text-[10px]"><i class="fa-solid fa-triangle-exclamation text-[8px]"></i>${c.d30}</span>`:`<span class="text-slate-300">-</span>`;
            const d60cell=d60cnt>0?`<span class="text-orange-700 font-bold bg-orange-50 px-2 py-0.5 rounded border border-orange-200 text-[10px]">${d60cnt}</span>`:`<span class="text-slate-300">-</span>`;
            const d90cell=d90cnt>0?`<span class="text-yellow-700 font-bold bg-yellow-50 px-2 py-0.5 rounded border border-yellow-200 text-[10px]">${d90cnt}</span>`:`<span class="text-slate-300">-</span>`;
            const hasAny=c.d30>0||d60cnt>0||d90cnt>0;
            const btn=hasAny?`<button onclick="app.openProposalModal('${c.name}','만기 도래 예적금 유치')" class="text-[11px] font-bold px-3 py-1.5 ${c.d30>0?'bg-red-600 text-white hover:bg-red-700':'bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100'} rounded shadow-sm transition">유치 제안</button>`:`<span class="text-slate-400 text-[11px]">관찰 중</span>`;
            return `<tr class="${rowBg} transition"><td class="px-4 py-3"><span onclick="app.openCustomer360('${c.name}','deposit')" class="cursor-pointer text-teal-700 hover:underline font-bold text-[13px]">${c.name}</span></td><td class="px-4 py-3 text-center font-mono font-bold">${c.count}건</td><td class="px-4 py-3 text-[11px] text-slate-600">${c.banks}</td><td class="px-4 py-3 text-right font-mono font-bold text-[13px]">${c.totalAmt.toLocaleString()}</td><td class="px-4 py-3 text-center">${d30cell}</td><td class="px-4 py-3 text-center">${d60cell}</td><td class="px-4 py-3 text-center">${d90cell}</td><td class="px-4 py-3 text-center">${btn}</td></tr>`;
        }).join('');
    },
    filterDepositCompany() {
        const kw=document.getElementById('dep-company-search')?document.getElementById('dep-company-search').value.toLowerCase():'';
        document.getElementById('dep-company-tbody').innerHTML=this.buildDepositCompanyRows(DB.getAssetsByCompany().filter(c=>!kw||c.name.toLowerCase().includes(kw)),this._depFilter);
    },
    initDepositChart() {
        const d=DB.getDepositDetail(), ctx=document.getElementById('depositPieChart').getContext('2d');
        const chart=new Chart(ctx,{type:'doughnut',data:{labels:d.map(x=>x.bank),datasets:[{data:d.map(x=>Math.round(x.total/100000000)),backgroundColor:d.map(x=>x.color),borderWidth:2,borderColor:'#fff'}]},options:{responsive:true,maintainAspectRatio:false,cutout:'65%',plugins:{legend:{position:'bottom',labels:{boxWidth:10,font:{size:11}}}}}});
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
    //  법인카드 (업종별 절감 예상액 자동 계산 추가)
    // ═══════════════════════════════════════
    _cardBenefits: {
        '주유/교통비':     {rate:0.10,label:'주유 리터당 60원 + 고속도로 10% 할인',color:'#0d9488',bg:'#f0fdf4',border:'#99f6e4',icon:'fa-gas-pump'},
        '항공/숙박(출장)': {rate:0.07,label:'항공 마일리지 적립 + 라운지 무료 이용',color:'#3b82f6',bg:'#eff6ff',border:'#bfdbfe',icon:'fa-plane'},
        '식대/접대비':     {rate:0.05,label:'음식점 5% 청구 할인 + 포인트 2배 적립',color:'#f59e0b',bg:'#fffbeb',border:'#fde68a',icon:'fa-utensils'},
        '공과금/기타':     {rate:0.03,label:'공과금 자동납부 할인 + 기타 포인트 적립',color:'#8b5cf6',bg:'#f5f3ff',border:'#ddd6fe',icon:'fa-receipt'},
    },
    renderCard() {
        const cards=DB.getCards(), totalAmt=cards.reduce((s,c)=>s+c.amount,0);
        const catAmt={};
        cards.forEach(c=>{catAmt[c.category]=(catAmt[c.category]||0)+c.amount;});
        const savings=Object.entries(catAmt).map(([cat,amt])=>{
            const b=this._cardBenefits[cat]||{rate:0.03,label:'기본 포인트 적립',color:'#64748b',bg:'#f8fafc',border:'#e2e8f0',icon:'fa-credit-card'};
            const mon=Math.round(amt*b.rate/10000), ann=mon*12, ratio=totalAmt>0?Math.round(amt/totalAmt*100):0;
            return {cat,amt,mon,ann,ratio,...b};
        }).sort((a,b)=>b.ann-a.ann);
        const totalAnn=savings.reduce((s,v)=>s+v.ann,0), topCat=savings[0]||{};
        return `<div class="max-w-[1400px] mx-auto">
            <div class="grid grid-cols-4 gap-4 mb-5">
                <div class="bg-white border border-slate-200 p-4 rounded shadow-sm border-l-4 border-l-slate-400"><p class="text-[10px] font-bold text-slate-500 mb-1">타행카드 총액</p><h3 class="text-2xl font-black font-mono text-slate-800">${Math.round(totalAmt/100000000).toLocaleString()}<span class="text-sm text-slate-400 ml-1">억</span></h3><p class="text-[10px] text-slate-400 mt-1">${cards.length}건 · ${[...new Set(cards.map(c=>c.bank))].length}개 카드사</p></div>
                <div class="bg-teal-50 border border-teal-200 p-4 rounded shadow-sm border-l-4 border-l-teal-500"><p class="text-[10px] font-bold text-teal-700 mb-1">최고 절감 업종</p><h3 class="text-lg font-black text-teal-800">${topCat.cat||'-'}</h3><p class="text-[10px] text-teal-600 mt-1">혜택률 <b>${topCat.rate?Math.round(topCat.rate*100):0}%</b> · 연 <b>${(topCat.ann||0).toLocaleString()}만원</b></p></div>
                <div class="bg-blue-50 border border-blue-200 p-4 rounded shadow-sm border-l-4 border-l-blue-500"><p class="text-[10px] font-bold text-blue-700 mb-1">전환 타겟</p><h3 class="text-2xl font-black text-blue-800">${cards.length}<span class="text-sm ml-1">건</span></h3><p class="text-[10px] text-blue-600 mt-1">월 500만+ 고액 결제 기준</p></div>
                <div class="bg-amber-50 border border-amber-200 p-4 rounded shadow-sm border-l-4 border-l-amber-500"><p class="text-[10px] font-bold text-amber-700 mb-1">전환 시 연간 절감 합계</p><h3 class="text-2xl font-black text-amber-800 font-mono">${totalAnn.toLocaleString()}<span class="text-sm ml-1">만원</span></h3><p class="text-[10px] text-amber-600 mt-1">월 평균 ${Math.round(totalAnn/12).toLocaleString()}만원 절감</p></div>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div class="lg:col-span-4 space-y-4">
                    <div class="bg-white border border-slate-200 rounded p-5 shadow-sm"><h3 class="font-bold text-slate-800 text-[14px] mb-4">업종별 비율<span class="info-tip"><i class="fa-solid fa-circle-info"></i><span class="tip-box"><b>수집:</b> 카드사명, 사용카드 장수, 사용건수, 사용액</span></span></h3><div class="h-[200px] flex justify-center"><canvas id="cardChart"></canvas></div></div>
                    <div class="bg-white border border-slate-200 rounded p-5 shadow-sm"><h3 class="font-bold text-slate-800 text-[14px] mb-4">월별 추이 (8개월)<span class="info-tip"><i class="fa-solid fa-circle-info"></i><span class="tip-box"><b>수집:</b> 카드사명, 사용액 (월별)</span></span></h3><div class="h-[200px]"><canvas id="cardTrendChart"></canvas></div></div>
                </div>
                <div class="lg:col-span-8 space-y-4">
                    <div class="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
                        <div class="px-4 py-3 border-b border-slate-200 bg-amber-50 flex justify-between items-center">
                            <div><h3 class="text-[14px] font-bold text-amber-800"><i class="fa-solid fa-piggy-bank mr-1.5 text-amber-600"></i>하나카드 전환 시 업종별 절감 예상액</h3><p class="text-[10px] text-amber-600 mt-0.5">업종별 혜택률 기준 자동 계산 · 타행 카드 사용액 × 업종 혜택률</p></div>
                            <div class="text-right"><p class="text-[10px] font-bold text-amber-700">연간 절감 합계</p><p class="text-xl font-black text-amber-800 font-mono">${totalAnn.toLocaleString()}<span class="text-sm ml-0.5">만원</span></p></div>
                        </div>
                        <div class="p-4 space-y-3">
                            ${savings.map(s=>`<div class="flex items-center gap-3 p-3 rounded-lg border" style="background:${s.bg};border-color:${s.border}">
                                <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style="background:${s.color}18;border:1px solid ${s.border}"><i class="fa-solid ${s.icon} text-[13px]" style="color:${s.color}"></i></div>
                                <div class="flex-1 min-w-0">
                                    <div class="flex items-center gap-2 mb-1"><span class="text-[12px] font-bold text-slate-800">${s.cat}</span><span class="text-[10px] font-bold px-1.5 py-0.5 rounded" style="background:${s.color}18;color:${s.color}">혜택 ${Math.round(s.rate*100)}%</span><span class="text-[10px] text-slate-400">사용 비중 ${s.ratio}%</span></div>
                                    <p class="text-[10px] text-slate-500">${s.label}</p>
                                    <div class="w-full bg-slate-100 rounded-full h-1.5 mt-1.5"><div class="h-1.5 rounded-full" style="width:${s.ratio}%;background:${s.color}"></div></div>
                                </div>
                                <div class="text-right shrink-0"><p class="text-[10px] text-slate-400 mb-0.5">월 절감</p><p class="text-[13px] font-black font-mono" style="color:${s.color}">${s.mon.toLocaleString()}<span class="text-[10px] ml-0.5">만</span></p><p class="text-[10px] font-bold text-slate-500">연 <span class="font-mono" style="color:${s.color}">${s.ann.toLocaleString()}</span>만원</p></div>
                                <button onclick="app.openProposalModal('전체 고객사','${s.cat} 하나카드 전환')" class="shrink-0 text-[10px] font-bold px-2.5 py-1.5 rounded border transition" style="color:${s.color};border-color:${s.border};background:white" onmouseover="this.style.background='${s.bg}'" onmouseout="this.style.background='white'"><i class="fa-solid fa-paper-plane mr-1"></i>제안</button>
                            </div>`).join('')}
                        </div>
                        <div class="px-4 py-3 border-t border-amber-100 bg-amber-50 flex items-center justify-between">
                            <p class="text-[10px] text-amber-700"><i class="fa-solid fa-circle-info mr-1"></i>혜택률은 하나카드 법인 상품 기준</p>
                            <button onclick="app.openProposalModal('전체 고객사','하나카드 전환 (전 업종)')" class="text-[11px] font-bold px-3 py-1.5 bg-amber-600 text-white rounded hover:bg-amber-700 transition shadow-sm"><i class="fa-solid fa-paper-plane mr-1.5"></i>전체 전환 제안 발송</button>
                        </div>
                    </div>
                    <div class="bg-white border border-slate-200 rounded flex flex-col shadow-sm overflow-hidden">
                        <div class="px-4 py-3 border-b border-slate-200 bg-slate-50 flex justify-between items-center"><h3 class="text-[14px] font-bold text-slate-800">고액 결제 기업 타겟<span class="info-tip"><i class="fa-solid fa-circle-info"></i><span class="tip-box"><b>수집:</b> 카드사명, 사용건수, 사용액<br>전환 시 절감액은 업종 혜택률로 자동 계산합니다.</span></span></h3><div class="relative"><i class="fa-solid fa-magnifying-glass absolute left-3 top-2 text-slate-400 text-xs"></i><input type="text" id="card-search" onkeyup="dataViews.filterCard()" placeholder="고객사, 카드사" class="border border-slate-300 rounded text-xs pl-8 pr-3 py-1.5 w-48 outline-none focus:border-teal-500 font-medium"></div></div>
                        <div class="overflow-y-auto max-h-[380px]"><table class="w-full text-left whitespace-nowrap"><thead class="bg-white text-[12px] text-slate-500 border-b border-slate-200 sticky top-0 z-10"><tr><th class="px-4 py-3 font-bold">고객사</th><th class="px-4 py-3 font-bold">타행 카드</th><th class="px-4 py-3 font-bold">업종</th><th class="px-4 py-3 font-bold text-right">월 사용액</th><th class="px-4 py-3 font-bold text-right">연 절감 예상</th><th class="px-4 py-3 font-bold text-center">조치</th></tr></thead><tbody id="card-tbody" class="text-xs text-slate-700 divide-y divide-slate-100">${this.buildCardRows(cards)}</tbody></table></div>
                    </div>
                </div>
            </div>
        </div>`;
    },
    initCardChart() {
        const c1=new Chart(document.getElementById('cardChart').getContext('2d'),{type:'doughnut',data:{labels:['주유/교통비','항공/숙박','식대/접대비','공과금/기타'],datasets:[{data:[40,35,15,10],backgroundColor:['#0d9488','#3b82f6','#f59e0b','#8b5cf6'],borderWidth:2,borderColor:'#fff'}]},options:{responsive:true,maintainAspectRatio:false,cutout:'65%',plugins:{legend:{position:'right',labels:{boxWidth:8,font:{size:10}}}}}});
        app.chartInstances.push(c1);
        const monthly=DB.getCardMonthlyByCategory(), months=['2025.08','2025.09','2025.10','2025.11','2025.12','2026.01','2026.02','2026.03'], colors={'주유/교통비':'#0d9488','항공/숙박(출장)':'#3b82f6','식대/접대비':'#f59e0b','공과금/기타':'#8b5cf6'};
        const ds=Object.entries(monthly).map(([cat,arr])=>({label:cat,data:arr.map(a=>Math.round(a.amount/10000)),borderColor:colors[cat]||'#ccc',backgroundColor:'transparent',borderWidth:1.5,tension:0.3,pointRadius:2}));
        const c2=new Chart(document.getElementById('cardTrendChart').getContext('2d'),{type:'line',data:{labels:months.map(m=>m.slice(5)+'월'),datasets:ds},options:{responsive:true,maintainAspectRatio:false,scales:{y:{beginAtZero:true,grid:{borderDash:[2,2],color:'#f1f5f9'},border:{display:false},ticks:{callback:v=>v+'만',font:{size:9}}},x:{grid:{display:false},border:{display:false},ticks:{font:{size:9}}}},plugins:{legend:{position:'bottom',labels:{boxWidth:8,font:{size:9}}}}}});
        app.chartInstances.push(c2);
    },
    buildCardRows(data) {
        if(!data.length) return `<tr><td colspan="6" class="text-center py-10 text-slate-500 font-bold">결과 없음</td></tr>`;
        return data.map(item=>{
            const b=this._cardBenefits[item.category]||{rate:0.03,color:'#64748b'};
            const annSave=Math.round(item.amount*b.rate*12/10000);
            const saveBadge=annSave>=1000?`<span class="font-mono font-black" style="color:${b.color}">${annSave.toLocaleString()}만</span><span class="text-[9px] bg-amber-100 text-amber-700 px-1 py-0.5 rounded ml-0.5">HIGH</span>`:`<span class="font-mono font-bold" style="color:${b.color}">${annSave.toLocaleString()}만</span>`;
            return `<tr class="hover:bg-slate-50"><td class="px-4 py-2.5"><span onclick="app.openCustomer360('${item.name}','card')" class="cursor-pointer text-teal-700 hover:underline font-bold text-[13px]">${item.name}</span></td><td class="px-4 py-2.5"><span class="bg-slate-100 text-slate-600 px-2 py-1 rounded font-bold text-[10px] border border-slate-200">${item.bank}</span></td><td class="px-4 py-2.5"><span class="font-bold text-[11px] px-2 py-0.5 rounded" style="background:${b.color}12;color:${b.color}">${item.category}</span></td><td class="px-4 py-2.5 text-right font-mono font-bold text-[13px]">${item.amount.toLocaleString()}</td><td class="px-4 py-2.5 text-right">${saveBadge}</td><td class="px-4 py-2.5 text-center"><button onclick="app.openProposalModal('${item.name}','${item.category} 하나카드 전환')" class="text-[11px] font-bold px-2.5 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100 shadow-sm"><i class="fa-solid fa-credit-card mr-1"></i>카드 제안</button></td></tr>`;
        }).join('');
    },
    filterCard() {
        const kw=document.getElementById('card-search').value.toLowerCase();
        document.getElementById('card-tbody').innerHTML=this.buildCardRows(DB.getCards().filter(i=>!kw||i.name.toLowerCase().includes(kw)||i.category.toLowerCase().includes(kw)||i.bank.toLowerCase().includes(kw)));
    },
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
    //  자금흐름 분석 (건전성 스코어 + 위험구간 음영 + 당행/타행 분리)
    // ═══════════════════════════════════════
    renderCashFlow() {
        const companies=DB.getCashFlowCompanies(), summary=DB.getCashFlowSummary(), flows=DB.getCashFlow();
        const score=DB.getCashFlowScore(), split=DB.getCashFlowBankSplit();
        const netClass=summary.net>=0?'teal':'amber';
        const scoreBarColor=score.score>=80?'#0d9488':score.score>=60?'#3b82f6':score.score>=40?'#f59e0b':'#ef4444';
        return `<div class="max-w-[1400px] mx-auto">
            <div class="flex justify-between items-center mb-4">
                <div class="flex items-center space-x-3">
                    <select id="cf-select" onchange="document.getElementById('cf-company').value=this.value; dataViews.filterCashFlow()" class="border border-slate-300 rounded text-xs px-3 py-1.5 outline-none focus:border-teal-500 font-bold text-slate-700">
                        <option value="">전체 고객사 합산</option>
                        ${companies.map(c=>`<option value="${c}">${c}</option>`).join('')}
                    </select>
                    <div class="relative"><i class="fa-solid fa-magnifying-glass absolute left-2.5 top-2 text-slate-400 text-xs"></i><input type="text" id="cf-company" list="cf-company-list" placeholder="고객사 직접 검색" oninput="dataViews.filterCashFlow()" class="pl-7 pr-3 py-1.5 border border-slate-300 rounded text-xs focus:border-teal-500 outline-none w-52 font-medium text-slate-700"><datalist id="cf-company-list">${companies.map(c=>`<option value="${c}">`).join('')}</datalist></div>
                    <button onclick="document.getElementById('cf-company').value=''; document.getElementById('cf-select').value=''; dataViews.filterCashFlow()" class="text-[11px] border border-slate-300 px-2.5 py-1.5 rounded font-bold text-slate-600 hover:bg-slate-50"><i class="fa-solid fa-rotate-right mr-1"></i>초기화</button>
                </div>
            </div>
            <div class="grid grid-cols-5 gap-3 mb-4">
                <div class="bg-blue-50 border border-blue-200 p-4 rounded shadow-sm border-l-4 border-l-blue-500"><p class="text-[10px] font-bold text-blue-700 mb-1">최근 7일 입금</p><h3 class="text-2xl font-black font-mono text-blue-800" id="cf-in">${Math.round(summary.inTotal/100000000).toLocaleString()}<span class="text-base ml-0.5">억</span></h3></div>
                <div class="bg-red-50 border border-red-200 p-4 rounded shadow-sm border-l-4 border-l-red-500"><p class="text-[10px] font-bold text-red-700 mb-1">최근 7일 출금</p><h3 class="text-2xl font-black font-mono text-red-800" id="cf-out">${Math.round(summary.outTotal/100000000).toLocaleString()}<span class="text-base ml-0.5">억</span></h3></div>
                <div class="bg-${netClass}-50 border border-${netClass}-200 p-4 rounded shadow-sm border-l-4 border-l-${netClass}-500"><p class="text-[10px] font-bold text-${netClass}-700 mb-1">순 자금흐름 (7일)</p><h3 class="text-2xl font-black font-mono text-${netClass}-800" id="cf-net">${summary.net>=0?'+':''}${Math.round(summary.net/100000000).toLocaleString()}<span class="text-base ml-0.5">억</span></h3></div>
                <div class="bg-white border border-slate-200 p-4 rounded shadow-sm" id="cf-score-card"><p class="text-[10px] font-bold text-slate-500 mb-1">자금흐름 건전성</p><div class="flex items-end gap-2"><h3 class="text-2xl font-black font-mono" id="cf-score-val" style="color:${scoreBarColor}">${score.score}</h3><span class="text-[11px] font-black mb-0.5" id="cf-score-grade" style="color:${scoreBarColor}">등급 ${score.grade}</span></div><div class="w-full bg-slate-100 rounded-full h-1.5 mt-2"><div id="cf-score-bar" class="h-1.5 rounded-full transition-all duration-500" style="width:${score.score}%;background:${scoreBarColor}"></div></div></div>
                <div class="bg-white border border-slate-200 p-4 rounded shadow-sm" id="cf-deficit-card"><p class="text-[10px] font-bold text-slate-500 mb-1">30일 적자 현황</p><div class="flex items-end gap-2"><h3 class="text-2xl font-black font-mono" id="cf-deficit-days" style="color:${score.deficitDays>=10?'#ef4444':score.deficitDays>=5?'#f59e0b':'#0d9488'}">${score.deficitDays}</h3><span class="text-[11px] font-bold text-slate-400 mb-0.5">일 / 30일</span></div><p class="text-[10px] mt-1" id="cf-deficit-consec" style="color:${score.maxConsecutiveDeficit>=5?'#ef4444':score.maxConsecutiveDeficit>=3?'#f59e0b':'#64748b'}">최대 연속 <b id="cf-consec-num">${score.maxConsecutiveDeficit}</b>일 적자</p></div>
            </div>
            <div class="grid grid-cols-12 gap-4 mb-4">
                <div class="col-span-8 bg-white border border-slate-200 rounded p-5 shadow-sm">
                    <div class="flex justify-between items-center mb-3">
                        <div><h3 class="font-bold text-slate-800 text-[14px]">30일간 일별 입출금 추이 <span id="cf-chart-label" class="text-[11px] text-slate-500 font-normal">(전체 합산)</span></h3><p class="text-[10px] text-slate-400 mt-0.5"><span class="inline-block w-3 h-3 rounded-sm mr-1" style="background:rgba(239,68,68,0.12);border:1px solid #fca5a5"></span>빨간 음영 = 순흐름 마이너스 구간</p></div>
                        <div id="cf-danger-badge" class="hidden text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-50 text-red-600 border border-red-200"><i class="fa-solid fa-triangle-exclamation mr-1"></i><span id="cf-danger-count">0</span>개 위험 구간 감지</div>
                    </div>
                    <div class="h-[280px]"><canvas id="cashFlowChart"></canvas></div>
                </div>
                <div class="col-span-4 bg-white border border-slate-200 rounded p-5 shadow-sm" id="cf-split-panel">
                    <h3 class="font-bold text-slate-800 text-[14px] mb-1">당행 / 타행 자금흐름</h3>
                    <p class="text-[10px] text-slate-400 mb-3">30일 입금 기준 당행 vs 타행 비중</p>
                    <div class="h-[130px] mb-3"><canvas id="cfSplitChart"></canvas></div>
                    <div class="space-y-2" id="cf-split-detail">
                        <div class="flex justify-between items-center text-[11px]"><span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-teal-500 shrink-0"></span><span class="font-bold text-slate-700">당행(하나)</span></span><span class="font-mono font-bold text-teal-700" id="cf-hana-in">${Math.round(split.hanaIn/100000000).toLocaleString()}억</span><span class="font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded border border-teal-100" id="cf-hana-ratio">${split.hanaInRatio}%</span></div>
                        <div class="flex justify-between items-center text-[11px]"><span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-slate-300 shrink-0"></span><span class="font-bold text-slate-700">타행 합계</span></span><span class="font-mono font-bold text-slate-500" id="cf-other-in">${Math.round(split.otherIn/100000000).toLocaleString()}억</span><span class="font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200" id="cf-other-ratio">${100-split.hanaInRatio}%</span></div>
                        <div id="cf-split-action" class="mt-3 pt-3 border-t border-slate-100 ${split.hanaInRatio<50?'':'hidden'}"><p class="text-[10px] text-amber-700 font-bold mb-1.5"><i class="fa-solid fa-lightbulb mr-1"></i>당행 비중 ${split.hanaInRatio}% — CMS 확대 여지 있음</p><button onclick="app.openProposalModal(document.getElementById('cf-select').value||'전체 고객사','CMS 자금 집중 제안')" class="w-full text-[11px] font-bold py-1.5 rounded border border-teal-300 text-teal-700 bg-teal-50 hover:bg-teal-100 transition"><i class="fa-solid fa-paper-plane mr-1"></i>CMS 집중 제안 발송</button></div>
                    </div>
                </div>
            </div>
            <div class="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
                <div class="px-4 py-3 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                    <h3 class="font-bold text-slate-800 text-[14px]">일별 상세 내역<span class="info-tip"><i class="fa-solid fa-circle-info"></i><span class="tip-box"><b>수집:</b> 수시입출 거래내역(적요 포함)<br>빨간 행 = 순흐름 마이너스 (자금 부족일).</span></span></h3>
                    <div id="cf-table-alert" class="hidden text-[10px] font-bold text-red-600"><i class="fa-solid fa-fire mr-1"></i>연속 적자 <span id="cf-consec-alert">0</span>일 감지 — 단기 여신 제안 검토</div>
                </div>
                <div class="overflow-y-auto max-h-[320px]"><table class="w-full text-left whitespace-nowrap"><thead class="bg-white text-[12px] text-slate-500 border-b border-slate-200 sticky top-0 z-10"><tr><th class="px-4 py-3 font-bold">일자</th><th class="px-4 py-3 font-bold text-right">입금</th><th class="px-4 py-3 font-bold text-right">출금</th><th class="px-4 py-3 font-bold text-right">순 흐름</th><th class="px-4 py-3 font-bold text-center">당행비중</th><th class="px-4 py-3 font-bold text-center">상태</th></tr></thead>
                <tbody id="cf-tbody" class="text-xs text-slate-700 divide-y divide-slate-100">${this.buildCashFlowRows(flows)}</tbody></table></div>
            </div>
        </div>`;
    },
    buildCashFlowRows(flows) {
        return flows.map(f=>{
            const isDeficit=f.net<0, hr=f.hanaRatio!=null?f.hanaRatio:50;
            const rowBg=isDeficit?'bg-red-50 hover:bg-red-100':'hover:bg-slate-50';
            const netCls=isDeficit?'text-red-600 font-black':'text-teal-700 font-bold';
            const statusBadge=isDeficit?`<span class="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-700 border border-red-200"><i class="fa-solid fa-triangle-exclamation mr-0.5"></i>적자</span>`:`<span class="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">흑자</span>`;
            const hanaBadge=hr>=60?`<span class="text-[10px] font-bold text-teal-700">${hr}%</span>`:hr>=40?`<span class="text-[10px] font-bold text-amber-600">${hr}%</span>`:`<span class="text-[10px] font-bold text-red-500">${hr}%</span>`;
            return `<tr class="${rowBg}"><td class="px-4 py-2.5 font-mono font-bold text-slate-600">${f.date}</td><td class="px-4 py-2.5 text-right font-mono text-blue-700 font-bold">+${Math.round(f.inflow/1000000).toLocaleString()}백만</td><td class="px-4 py-2.5 text-right font-mono text-red-600 font-bold">-${Math.round(f.outflow/1000000).toLocaleString()}백만</td><td class="px-4 py-2.5 text-right font-mono ${netCls}">${f.net>=0?'+':''}${Math.round(f.net/1000000).toLocaleString()}백만</td><td class="px-4 py-2.5 text-center">${hanaBadge}</td><td class="px-4 py-2.5 text-center">${statusBadge}</td></tr>`;
        }).join('');
    },
    _cfChart: null, _cfSplitChart: null,
    initCashFlowChart() {
        const flows=DB.getCashFlow(), zones=DB.getCashFlowDangerZones(), split=DB.getCashFlowBankSplitByDate();
        this._renderMainCfChart(flows,zones); this._renderSplitChart(); this._updateDangerBadge(zones);
    },
    _renderMainCfChart(flows,zones) {
        if(this._cfChart){this._cfChart.destroy();this._cfChart=null;}
        const ctx=document.getElementById('cashFlowChart'); if(!ctx) return;
        const dangerPlugin={id:'dangerZones',beforeDraw(chart){if(!zones||!zones.length)return;const{ctx:c,chartArea,scales}=chart;if(!chartArea)return;c.save();zones.forEach(z=>{const gap=(scales.x.getPixelForValue(1)-scales.x.getPixelForValue(0))*0.5,x0=scales.x.getPixelForValue(z.startIdx)-gap,x1=scales.x.getPixelForValue(z.endIdx)+gap;c.fillStyle='rgba(239,68,68,0.09)';c.fillRect(x0,chartArea.top,x1-x0,chartArea.height);c.strokeStyle='rgba(239,68,68,0.3)';c.lineWidth=1;c.setLineDash([3,3]);c.strokeRect(x0,chartArea.top,x1-x0,chartArea.height);c.setLineDash([]);});c.restore();}};
        this._cfChart=new Chart(ctx.getContext('2d'),{type:'bar',plugins:[dangerPlugin],data:{labels:flows.map(f=>f.date),datasets:[{label:'입금',data:flows.map(f=>Math.round(f.inflow/1000000)),backgroundColor:'rgba(59,130,246,0.65)',borderRadius:2,barThickness:7},{label:'출금',data:flows.map(f=>-Math.round(f.outflow/1000000)),backgroundColor:'rgba(239,68,68,0.45)',borderRadius:2,barThickness:7},{label:'순흐름',data:flows.map(f=>Math.round(f.net/1000000)),type:'line',borderColor:'#0d9488',backgroundColor:'transparent',borderWidth:2,tension:0.3,pointRadius:flows.map(f=>f.net<0?4:0),pointBackgroundColor:'#ef4444',pointBorderColor:'#ef4444'}]},options:{responsive:true,maintainAspectRatio:false,scales:{y:{grid:{borderDash:[2,2],color:'#f1f5f9'},border:{display:false},ticks:{callback:v=>v+'백만',font:{size:9}}},x:{grid:{display:false},border:{display:false},ticks:{maxRotation:0,font:{size:8},autoSkip:true,maxTicksLimit:15}}},plugins:{legend:{position:'bottom',labels:{boxWidth:8,font:{size:10},padding:12}}}}});
        app.chartInstances.push(this._cfChart);
    },
    _renderSplitChart() {
        if(this._cfSplitChart){this._cfSplitChart.destroy();this._cfSplitChart=null;}
        const ctx=document.getElementById('cfSplitChart'); if(!ctx) return;
        const split=DB.getCashFlowBankSplit(document.getElementById('cf-select')?.value||undefined);
        this._cfSplitChart=new Chart(ctx.getContext('2d'),{type:'doughnut',data:{labels:['당행(하나)','타행'],datasets:[{data:[split.hanaInRatio,100-split.hanaInRatio],backgroundColor:['#0d9488','#cbd5e1'],borderWidth:0,hoverOffset:4}]},options:{responsive:true,maintainAspectRatio:false,cutout:'72%',plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>` ${ctx.label}: ${ctx.parsed}%`}}}}});
        app.chartInstances.push(this._cfSplitChart);
    },
    _updateDangerBadge(zones) {
        const badge=document.getElementById('cf-danger-badge'), cnt=document.getElementById('cf-danger-count');
        const tableAlert=document.getElementById('cf-table-alert'), consecAlert=document.getElementById('cf-consec-alert');
        if(!badge) return;
        if(zones.length>0){badge.classList.remove('hidden');if(cnt)cnt.textContent=zones.length;}else{badge.classList.add('hidden');}
        const score=DB.getCashFlowScore(document.getElementById('cf-select')?.value||undefined);
        if(tableAlert&&score.maxConsecutiveDeficit>=3){tableAlert.classList.remove('hidden');if(consecAlert)consecAlert.textContent=score.maxConsecutiveDeficit;}else if(tableAlert){tableAlert.classList.add('hidden');}
    },
    filterCashFlow() {
        const input=document.getElementById('cf-company').value.trim(), companies=DB.getCashFlowCompanies();
        const company=companies.find(c=>c===input)||'';
        const sel=document.getElementById('cf-select'); if(sel&&sel.value!==company)sel.value=company;
        const flows=DB.getCashFlow(company||undefined), summary=DB.getCashFlowSummary(company||undefined);
        const score=DB.getCashFlowScore(company||undefined), split=DB.getCashFlowBankSplit(company||undefined);
        const zones=DB.getCashFlowDangerZones(company||undefined);
        const scoreBarColor=score.score>=80?'#0d9488':score.score>=60?'#3b82f6':score.score>=40?'#f59e0b':'#ef4444';
        const cfIn=document.getElementById('cf-in'), cfOut=document.getElementById('cf-out'), cfNet=document.getElementById('cf-net');
        if(cfIn)cfIn.innerHTML=`${Math.round(summary.inTotal/100000000).toLocaleString()}<span class="text-base ml-0.5">억</span>`;
        if(cfOut)cfOut.innerHTML=`${Math.round(summary.outTotal/100000000).toLocaleString()}<span class="text-base ml-0.5">억</span>`;
        if(cfNet)cfNet.innerHTML=`${summary.net>=0?'+':''}${Math.round(summary.net/100000000).toLocaleString()}<span class="text-base ml-0.5">억</span>`;
        const sv=document.getElementById('cf-score-val'), sg=document.getElementById('cf-score-grade'), sb=document.getElementById('cf-score-bar');
        if(sv){sv.textContent=score.score;sv.style.color=scoreBarColor;}
        if(sg){sg.textContent='등급 '+score.grade;sg.style.color=scoreBarColor;}
        if(sb){sb.style.width=score.score+'%';sb.style.background=scoreBarColor;}
        const dd=document.getElementById('cf-deficit-days'), cn=document.getElementById('cf-consec-num'), dc=document.getElementById('cf-deficit-consec');
        if(dd){dd.textContent=score.deficitDays;dd.style.color=score.deficitDays>=10?'#ef4444':score.deficitDays>=5?'#f59e0b':'#0d9488';}
        if(cn)cn.textContent=score.maxConsecutiveDeficit;
        if(dc)dc.style.color=score.maxConsecutiveDeficit>=5?'#ef4444':score.maxConsecutiveDeficit>=3?'#f59e0b':'#64748b';
        const hi=document.getElementById('cf-hana-in'), oi=document.getElementById('cf-other-in'), hr=document.getElementById('cf-hana-ratio'), or2=document.getElementById('cf-other-ratio'), sa=document.getElementById('cf-split-action');
        if(hi)hi.textContent=Math.round(split.hanaIn/100000000).toLocaleString()+'억';
        if(oi)oi.textContent=Math.round(split.otherIn/100000000).toLocaleString()+'억';
        if(hr)hr.textContent=split.hanaInRatio+'%'; if(or2)or2.textContent=(100-split.hanaInRatio)+'%';
        if(sa)sa.classList.toggle('hidden',split.hanaInRatio>=50);
        const lbl=document.getElementById('cf-chart-label'); if(lbl)lbl.textContent=company?`(${company})`:'(전체 합산)';
        const tb=document.getElementById('cf-tbody'); if(tb)tb.innerHTML=this.buildCashFlowRows(flows);
        this._renderMainCfChart(flows,zones); this._renderSplitChart(); this._updateDangerBadge(zones);
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
