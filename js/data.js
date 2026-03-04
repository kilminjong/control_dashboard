const dataViews = {

    // ═══════════════════════════════════════
    //  금융자산 점유 현황 (기존 강화)
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
                    <h3 class="font-bold text-slate-800 text-[14px] mb-1">금융기관별 자산 점유율</h3>
                    <p class="text-[11px] text-slate-500 mb-5">수집된 금융 데이터 합산 기준 (단위: 억 원)</p>
                    <div class="h-[300px] w-full"><canvas id="assetChart"></canvas></div>
                </div>
                <div class="bg-white border border-slate-200 rounded p-5 flex flex-col shadow-sm max-h-[700px]">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="font-bold text-slate-800 text-[14px]">고액 예·적금 만기 도래 타겟</h3>
                        <input type="text" id="asset-search" onkeyup="dataViews.filterAsset()" placeholder="고객사, 은행명 검색" class="border border-slate-300 rounded text-xs px-3 py-1 w-48 outline-none focus:border-teal-500 font-medium">
                    </div>
                    <div id="asset-list" class="flex-1 overflow-y-auto pr-2 space-y-1">${this.buildAssetRows(assets)}</div>
                </div>
            </div>
        </div>`;
    },
    initAssetChart() {
        const details = DB.getDepositDetail();
        const labels = details.map(d => d.bank);
        const depData = details.map(d => Math.round(d.deposit/100000000));
        const savData = details.map(d => Math.round(d.savings/100000000));
        const colors = details.map(d => d.color);
        const ctx = document.getElementById('assetChart').getContext('2d');
        const chart = new Chart(ctx, { type:'bar', data:{ labels, datasets:[
            { label:'정기예금', data:depData, backgroundColor:colors, borderRadius:4, barThickness:35 },
            { label:'적금', data:savData, backgroundColor:colors.map(c=>c+'88'), borderRadius:4, barThickness:35 }
        ]}, options:{ responsive:true, maintainAspectRatio:false, scales:{ y:{ beginAtZero:true, stacked:true, grid:{borderDash:[2,2],color:'#f1f5f9'}, border:{display:false} }, x:{ stacked:true, grid:{display:false}, border:{display:false} } }, plugins:{ legend:{ position:'bottom', labels:{boxWidth:10,font:{size:10,family:'Pretendard'}} } } } });
        app.chartInstances.push(chart);
    },
    buildAssetRows(data) {
        if(!data.length) return `<div class="text-center py-10 text-slate-500 font-bold">검색 결과가 없습니다.</div>`;
        return data.map(item => `
            <div class="p-3 border border-slate-200 bg-slate-50 rounded flex justify-between items-center hover:bg-white transition shadow-sm mb-2">
                <div>
                    <p class="text-[13px] font-bold text-slate-800"><span onclick="app.openCustomer360('${item.name}')" class="cursor-pointer text-teal-700 hover:text-teal-900 hover:underline transition-colors">${item.name}</span> <span class="text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded ml-1 text-slate-500">${item.bank}</span></p>
                    <p class="text-[11px] ${item.dday <= 30 ? 'text-red-500' : 'text-slate-500'} font-bold mt-1">${item.product} 만기 ${item.dday <= 30 ? '임박' : '예정'} (D-${item.dday})</p>
                </div>
                <div class="text-right">
                    <p class="text-[15px] font-black font-mono text-slate-800">${item.amount.toLocaleString()} 원</p>
                    <button onclick="app.openProposalModal('${item.name}', '고금리 예적금 유치 제안')" class="text-[11px] bg-teal-600 text-white px-2.5 py-1 rounded font-bold mt-1.5 hover:bg-teal-700 shadow-sm">당행 유치 제안</button>
                </div>
            </div>`).join('');
    },
    filterAsset() {
        const kw = document.getElementById('asset-search').value.toLowerCase();
        document.getElementById('asset-list').innerHTML = this.buildAssetRows(DB.getAssets().filter(i => !kw || i.name.toLowerCase().includes(kw) || i.bank.toLowerCase().includes(kw)));
    },

    // ═══════════════════════════════════════
    //  [신규] 예적금 보유/만기 분석
    // ═══════════════════════════════════════
    renderDepositView() {
        const details = DB.getDepositDetail();
        const summary = DB.getDepositSummary();
        return `<div class="max-w-[1400px] mx-auto">
            <div class="grid grid-cols-3 gap-4 mb-5">
                <div class="bg-teal-50 border border-teal-200 p-5 rounded shadow-sm"><p class="text-[11px] font-bold text-teal-700 mb-1">당행 점유율</p><h3 class="text-3xl font-black text-teal-800">${summary.hanaRatio}<span class="text-lg ml-0.5">%</span></h3><p class="text-[10px] text-teal-600 mt-1">${(summary.hanaShare/100000000).toLocaleString()}억 / ${(summary.totalAll/100000000).toLocaleString()}억</p></div>
                <div class="bg-blue-50 border border-blue-200 p-5 rounded shadow-sm"><p class="text-[11px] font-bold text-blue-700 mb-1">정기예금 합산</p><h3 class="text-3xl font-black text-blue-800 font-mono">${(summary.totalDeposit/100000000).toLocaleString()}<span class="text-lg ml-0.5">억 원</span></h3></div>
                <div class="bg-amber-50 border border-amber-200 p-5 rounded shadow-sm"><p class="text-[11px] font-bold text-amber-700 mb-1">적금 합산</p><h3 class="text-3xl font-black text-amber-800 font-mono">${(summary.totalSavings/100000000).toLocaleString()}<span class="text-lg ml-0.5">억 원</span></h3></div>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-5">
                <div class="lg:col-span-5 bg-white border border-slate-200 rounded p-5 shadow-sm">
                    <h3 class="font-bold text-slate-800 text-[14px] mb-1">금융기관별 점유 비교</h3>
                    <p class="text-[11px] text-slate-500 mb-5">정기예금 + 적금 합산 기준</p>
                    <div class="h-[280px]"><canvas id="depositPieChart"></canvas></div>
                </div>
                <div class="lg:col-span-7 bg-white border border-slate-200 rounded p-5 shadow-sm">
                    <h3 class="font-bold text-slate-800 text-[14px] mb-4">은행별 만기 도래 일정 분석</h3>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left whitespace-nowrap"><thead class="bg-slate-50 text-[12px] text-slate-500 border-b border-slate-200"><tr><th class="px-4 py-3 font-bold">금융기관</th><th class="px-4 py-3 font-bold text-right">정기예금</th><th class="px-4 py-3 font-bold text-right">적금</th><th class="px-4 py-3 font-bold text-center">D-30 만기</th><th class="px-4 py-3 font-bold text-center">D-60 만기</th><th class="px-4 py-3 font-bold text-center">D-90 만기</th><th class="px-4 py-3 font-bold text-center">평균 금리</th></tr></thead>
                        <tbody class="text-xs text-slate-700 divide-y divide-slate-100">${details.map(d => `<tr class="hover:bg-slate-50"><td class="px-4 py-3 font-bold text-[13px]"><span class="inline-block w-2.5 h-2.5 rounded-full mr-2" style="background:${d.color}"></span>${d.bank}</td><td class="px-4 py-3 text-right font-mono font-bold">${(d.deposit/100000000).toLocaleString()}억</td><td class="px-4 py-3 text-right font-mono">${(d.savings/100000000).toLocaleString()}억</td><td class="px-4 py-3 text-center"><span class="text-red-600 font-bold">${d.maturity30}건</span></td><td class="px-4 py-3 text-center text-yellow-600 font-bold">${d.maturity60}건</td><td class="px-4 py-3 text-center text-slate-500">${d.maturity90}건</td><td class="px-4 py-3 text-center font-mono font-bold text-teal-700">${d.rate}%</td></tr>`).join('')}</tbody></table>
                    </div>
                </div>
            </div>
        </div>`;
    },
    initDepositChart() {
        const details = DB.getDepositDetail();
        const ctx = document.getElementById('depositPieChart').getContext('2d');
        const chart = new Chart(ctx, { type:'doughnut', data:{ labels:details.map(d=>d.bank), datasets:[{ data:details.map(d=>Math.round(d.total/100000000)), backgroundColor:details.map(d=>d.color), borderWidth:2, borderColor:'#fff' }] }, options:{ responsive:true, maintainAspectRatio:false, cutout:'65%', plugins:{ legend:{ position:'bottom', labels:{boxWidth:10,font:{size:11,family:'Pretendard'}} } } } });
        app.chartInstances.push(chart);
    },

    // ═══════════════════════════════════════
    //  전자어음 및 B2B 거래 (기존 강화)
    // ═══════════════════════════════════════
    renderB2B() {
        const data = DB.getB2B();
        const qtr = DB.getB2BSummaryByQuarter();
        const totalAmt = data.reduce((s,d) => s+d.amount, 0);
        return `<div class="max-w-[1400px] mx-auto flex flex-col h-full">
            <div class="grid grid-cols-4 gap-4 mb-4">
                <div class="bg-blue-50 border border-blue-200 p-4 rounded shadow-sm"><p class="text-[11px] font-bold text-blue-700 mb-1">총 만기 예정 금액</p><h3 class="text-2xl font-black font-mono text-blue-800">${Math.round(totalAmt/100000000).toLocaleString()}<span class="text-sm ml-1">억 원</span></h3></div>
                <div class="bg-white border border-slate-200 p-4 rounded shadow-sm"><p class="text-[11px] font-bold text-slate-500 mb-1">D-30 만기 임박</p><h3 class="text-2xl font-black font-mono text-slate-800">${data.filter(d=>d.dday<=30).length}<span class="text-sm text-slate-400 ml-1">건</span></h3></div>
                <div class="bg-teal-50 border border-teal-200 p-4 rounded shadow-sm"><p class="text-[11px] font-bold text-teal-700 mb-1">대출 제안 타겟</p><h3 class="text-2xl font-black font-mono text-teal-800">${data.filter(d=>d.status==='target').length}<span class="text-sm ml-1">개사</span></h3></div>
                <div class="bg-amber-50 border border-amber-200 p-4 rounded shadow-sm"><p class="text-[11px] font-bold text-amber-700 mb-1">분기별 집중 관리</p><div class="mt-1 space-y-0.5">${Object.entries(qtr).map(([k,v])=>`<p class="text-[10px]"><span class="font-bold text-amber-800">${k}</span>: ${v.count}건 / 타겟 ${v.target}</p>`).join('')}</div></div>
            </div>
            <div class="flex justify-between items-end mb-3">
                <h2 class="text-[15px] font-bold text-slate-800">전자어음 및 B2B 거래 상세 (영업 리드)</h2>
                <div class="flex space-x-2">
                    <div class="relative"><i class="fa-solid fa-magnifying-glass absolute left-3 top-2 text-slate-400 text-xs"></i><input type="text" id="b2b-search" onkeyup="dataViews.filterB2B()" placeholder="고객사명, 사업자번호, 은행 검색" class="border border-slate-300 rounded text-xs pl-8 pr-3 py-1.5 w-64 outline-none focus:border-teal-500 font-medium"></div>
                    <button class="bg-slate-800 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-slate-700 shadow-sm"><i class="fa-solid fa-paper-plane mr-1.5"></i>영업점 전송</button>
                </div>
            </div>
            <div class="bg-white border border-slate-200 rounded flex-1 overflow-hidden shadow-sm">
                <div class="overflow-y-auto max-h-[500px]">
                    <table class="w-full text-left border-collapse whitespace-nowrap">
                        <thead class="bg-slate-50 text-[12px] text-slate-500 border-b border-slate-200 sticky top-0 z-10"><tr><th class="px-4 py-3 font-bold w-10 text-center"><input type="checkbox" class="rounded border-slate-300"></th><th class="px-4 py-3 font-bold">고객사명 (사업자번호)</th><th class="px-4 py-3 font-bold">금융기관 / 상품</th><th class="px-4 py-3 font-bold text-right">만기 예정 금액</th><th class="px-4 py-3 font-bold text-center">만기 (D-Day)</th><th class="px-4 py-3 font-bold">마케팅 조치</th></tr></thead>
                        <tbody id="b2b-tbody" class="text-xs text-slate-700 divide-y divide-slate-100">${this.buildB2BRows(data)}</tbody>
                    </table>
                </div>
            </div>
        </div>`;
    },
    buildB2BRows(data) {
        if(!data.length) return `<tr><td colspan="6" class="text-center py-10 text-slate-500 font-bold">검색 결과가 없습니다.</td></tr>`;
        return data.map(item => `<tr class="hover:bg-slate-50"><td class="px-4 py-3 text-center"><input type="checkbox" class="rounded border-slate-300"></td><td class="px-4 py-3"><p class="font-bold text-slate-800 text-[13px]"><span onclick="app.openCustomer360('${item.name}')" class="cursor-pointer text-teal-700 hover:underline">${item.name}</span></p><p class="text-[10px] text-slate-400 font-mono mt-0.5">${item.regNo}</p></td><td class="px-4 py-3"><span class="bg-slate-100 text-slate-600 px-2 py-1 rounded font-bold text-[10px] border border-slate-200">${item.bank} / ${item.type}</span></td><td class="px-4 py-3 text-right font-mono font-bold text-[13px]">${item.amount.toLocaleString()}</td><td class="px-4 py-3 text-center"><span class="${item.status==='target'?'text-red-600 bg-red-50 border-red-100':'text-slate-500 bg-white border-transparent'} font-bold px-2 py-1 rounded border">${item.date} (D-${item.dday})</span></td><td class="px-4 py-3">${item.status==='target'?`<button onclick="app.openProposalModal('${item.name}','B2B 대출 제안')" class="text-[11px] font-bold px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100 shadow-sm">대출 제안</button>`:`<span class="text-slate-400 font-bold text-[11px]"><span class="inline-block w-1.5 h-1.5 rounded-full bg-slate-300 mr-1"></span>관찰 중</span>`}</td></tr>`).join('');
    },
    filterB2B() {
        const kw = document.getElementById('b2b-search').value.toLowerCase();
        document.getElementById('b2b-tbody').innerHTML = this.buildB2BRows(DB.getB2B().filter(i => !kw || i.name.toLowerCase().includes(kw) || i.regNo.includes(kw) || i.bank.toLowerCase().includes(kw)));
    },

    // ═══════════════════════════════════════
    //  법인카드 (기존 강화 + 월별 추이 차트)
    // ═══════════════════════════════════════
    renderCard() {
        const cards = DB.getCards();
        const totalAmt = cards.reduce((s,c) => s+c.amount, 0);
        return `<div class="max-w-[1400px] mx-auto">
            <div class="grid grid-cols-4 gap-4 mb-5">
                <div class="bg-white border border-slate-200 p-4 rounded shadow-sm"><p class="text-[11px] font-bold text-slate-500 mb-1">타행카드 총 결제액</p><h3 class="text-2xl font-black font-mono text-slate-800">${Math.round(totalAmt/100000000).toLocaleString()}<span class="text-sm text-slate-400 ml-1">억 원</span></h3></div>
                <div class="bg-teal-50 border border-teal-200 p-4 rounded shadow-sm"><p class="text-[11px] font-bold text-teal-700 mb-1">주유/교통 비중</p><h3 class="text-2xl font-black text-teal-800">40<span class="text-lg ml-0.5">%</span></h3></div>
                <div class="bg-blue-50 border border-blue-200 p-4 rounded shadow-sm"><p class="text-[11px] font-bold text-blue-700 mb-1">전환 영업 타겟</p><h3 class="text-2xl font-black text-blue-800">${cards.length}<span class="text-sm ml-1">건</span></h3></div>
                <div class="bg-amber-50 border border-amber-200 p-4 rounded shadow-sm"><p class="text-[11px] font-bold text-amber-700 mb-1">예상 연간 절감액</p><h3 class="text-2xl font-black text-amber-800 font-mono">${Math.round(totalAmt*0.08/10000).toLocaleString()}<span class="text-sm ml-1">만 원</span></h3></div>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div class="lg:col-span-4 space-y-4">
                    <div class="bg-white border border-slate-200 rounded p-5 shadow-sm">
                        <h3 class="font-bold text-slate-800 text-[14px] mb-1">업종별 사용 비율</h3>
                        <p class="text-[11px] text-slate-500 mb-4">타행 카드 결제 분석</p>
                        <div class="h-[200px] flex justify-center"><canvas id="cardChart"></canvas></div>
                    </div>
                    <div class="bg-white border border-slate-200 rounded p-5 shadow-sm">
                        <h3 class="font-bold text-slate-800 text-[14px] mb-1">월별 결제 추이 (8개월)</h3>
                        <p class="text-[11px] text-slate-500 mb-4">업종별 월간 결제액 변화</p>
                        <div class="h-[200px]"><canvas id="cardTrendChart"></canvas></div>
                    </div>
                </div>
                <div class="lg:col-span-8 bg-white border border-slate-200 rounded flex flex-col shadow-sm overflow-hidden">
                    <div class="px-4 py-3 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                        <h3 class="text-[14px] font-bold text-slate-800">고액 결제 기업 타겟</h3>
                        <div class="relative"><i class="fa-solid fa-magnifying-glass absolute left-3 top-2 text-slate-400 text-xs"></i><input type="text" id="card-search" onkeyup="dataViews.filterCard()" placeholder="고객사, 사용처, 카드사" class="border border-slate-300 rounded text-xs pl-8 pr-3 py-1.5 w-56 outline-none focus:border-teal-500 font-medium"></div>
                    </div>
                    <div class="overflow-y-auto max-h-[550px]">
                        <table class="w-full text-left whitespace-nowrap"><thead class="bg-white text-[12px] text-slate-500 border-b border-slate-200 sticky top-0 z-10"><tr><th class="px-4 py-3 font-bold">고객사</th><th class="px-4 py-3 font-bold">타행 카드</th><th class="px-4 py-3 font-bold">결제 업종</th><th class="px-4 py-3 font-bold text-right">월평균 결제액</th><th class="px-4 py-3 font-bold text-center">영업</th></tr></thead>
                        <tbody id="card-tbody" class="text-xs text-slate-700 divide-y divide-slate-100">${this.buildCardRows(cards)}</tbody></table>
                    </div>
                </div>
            </div>
        </div>`;
    },
    initCardChart() {
        const ctx1 = document.getElementById('cardChart').getContext('2d');
        const c1 = new Chart(ctx1, { type:'doughnut', data:{ labels:['주유/교통비','항공/숙박(출장)','식대/접대비','공과금/기타'], datasets:[{ data:[40,35,15,10], backgroundColor:['#0d9488','#3b82f6','#94a3b8','#cbd5e1'], borderWidth:2, borderColor:'#fff' }] }, options:{ responsive:true, maintainAspectRatio:false, cutout:'65%', plugins:{ legend:{ position:'right', labels:{boxWidth:8,font:{size:10,family:'Pretendard'}} } } } });
        app.chartInstances.push(c1);
        const monthly = DB.getCardMonthlyByCategory();
        const months = ['2025.08','2025.09','2025.10','2025.11','2025.12','2026.01','2026.02','2026.03'];
        const colors = { '주유/교통비':'#0d9488', '항공/숙박(출장)':'#3b82f6', '식대/접대비':'#94a3b8', '공과금/기타':'#cbd5e1' };
        const datasets = Object.entries(monthly).map(([cat, arr]) => ({
            label: cat, data: arr.map(a => Math.round(a.amount/10000)), borderColor: colors[cat]||'#ccc', backgroundColor:'transparent', borderWidth:1.5, tension:0.3, pointRadius:2
        }));
        const ctx2 = document.getElementById('cardTrendChart').getContext('2d');
        const c2 = new Chart(ctx2, { type:'line', data:{ labels:months.map(m=>m.slice(5)+'월'), datasets }, options:{ responsive:true, maintainAspectRatio:false, scales:{ y:{ beginAtZero:true, grid:{borderDash:[2,2],color:'#f1f5f9'}, border:{display:false}, ticks:{callback:v=>v+'만',font:{size:9}} }, x:{ grid:{display:false}, border:{display:false}, ticks:{font:{size:9}} } }, plugins:{ legend:{ position:'bottom', labels:{boxWidth:8,font:{size:9,family:'Pretendard'}} } } } });
        app.chartInstances.push(c2);
    },
    buildCardRows(data) {
        if(!data.length) return `<tr><td colspan="5" class="text-center py-10 text-slate-500 font-bold">결과 없음</td></tr>`;
        return data.map(item => `<tr class="hover:bg-slate-50"><td class="px-4 py-3"><span onclick="app.openCustomer360('${item.name}')" class="cursor-pointer text-teal-700 hover:underline font-bold text-[13px]">${item.name}</span></td><td class="px-4 py-3"><span class="bg-slate-100 text-slate-600 px-2 py-1 rounded font-bold text-[10px] border border-slate-200">${item.bank}</span></td><td class="px-4 py-3 font-bold text-[12px]">${item.category}</td><td class="px-4 py-3 text-right font-mono font-bold text-[13px]">${item.amount.toLocaleString()}</td><td class="px-4 py-3 text-center"><button onclick="app.openProposalModal('${item.name}','주유 특화 법인카드 제안')" class="text-[11px] font-bold px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100 shadow-sm">카드 제안</button></td></tr>`).join('');
    },
    filterCard() {
        const kw = document.getElementById('card-search').value.toLowerCase();
        document.getElementById('card-tbody').innerHTML = this.buildCardRows(DB.getCards().filter(i => !kw || i.name.toLowerCase().includes(kw) || i.category.toLowerCase().includes(kw) || i.bank.toLowerCase().includes(kw)));
    },

    // ═══════════════════════════════════════
    //  세금계산서 (기존 강화)
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
            <div class="flex justify-between items-end mb-3">
                <h2 class="text-[15px] font-bold text-slate-800">세금계산서 매입/매출 장부 (여신 평가용)</h2>
                <div class="flex space-x-2">
                    <div class="relative"><i class="fa-solid fa-magnifying-glass absolute left-3 top-2 text-slate-400 text-xs"></i><input type="text" id="tax-search" onkeyup="dataViews.filterTax()" placeholder="거래처, 품목, 매출/매입" class="border border-slate-300 rounded text-xs pl-8 pr-3 py-1.5 w-64 outline-none focus:border-teal-500 font-medium"></div>
                    <button class="border border-slate-300 bg-white px-3 py-1.5 rounded text-xs font-bold text-slate-600 hover:bg-slate-50 shadow-sm"><i class="fa-solid fa-download mr-1.5"></i>엑셀</button>
                </div>
            </div>
            <div class="bg-white border border-slate-200 rounded overflow-hidden shadow-sm flex-1">
                <div class="overflow-y-auto max-h-[500px]"><table class="w-full text-left whitespace-nowrap"><thead class="bg-slate-50 text-[12px] text-slate-500 border-b border-slate-200 sticky top-0 z-10"><tr><th class="px-4 py-3 font-bold w-24 text-center">구분</th><th class="px-4 py-3 font-bold">거래처</th><th class="px-4 py-3 font-bold">품목</th><th class="px-4 py-3 font-bold text-right">공급가액</th><th class="px-4 py-3 font-bold text-center">여신 평가</th></tr></thead>
                <tbody id="tax-tbody" class="text-xs text-slate-700 divide-y divide-slate-100">${this.buildTaxRows(DB.getTax())}</tbody></table></div>
            </div>
        </div>`;
    },
    buildTaxRows(data) {
        if(!data.length) return `<tr><td colspan="5" class="text-center py-10 text-slate-500 font-bold">결과 없음</td></tr>`;
        return data.map(item => `<tr class="hover:bg-slate-50"><td class="px-4 py-3 text-center"><span class="${item.type==='매출'?'text-blue-700 bg-blue-50 border-blue-200':'text-red-600 bg-red-50 border-red-200'} font-bold px-2 py-0.5 rounded border text-[11px]">${item.type}</span></td><td class="px-4 py-3 font-bold text-[13px]"><span onclick="app.openCustomer360('${item.partner}')" class="cursor-pointer text-teal-700 hover:underline">${item.partner}</span></td><td class="px-4 py-3 text-slate-600">${item.item}</td><td class="px-4 py-3 text-right font-mono font-bold text-[13px]">${item.amount.toLocaleString()}</td><td class="px-4 py-3 text-center">${item.status==='우량'?`<button onclick="app.openProposalModal('${item.partner}','여신 상향 제안')" class="text-[11px] text-teal-700 font-bold border border-teal-200 bg-teal-50 px-2.5 py-1 rounded-full hover:bg-teal-100 shadow-sm">여신 상향</button>`:`<span class="text-[11px] text-slate-500 font-bold bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">${item.status==='지출'?'고정 지출':'일반 거래'}</span>`}</td></tr>`).join('');
    },
    filterTax() {
        const kw = document.getElementById('tax-search').value.toLowerCase();
        document.getElementById('tax-tbody').innerHTML = this.buildTaxRows(DB.getTax().filter(i => !kw || i.partner.toLowerCase().includes(kw) || i.item.toLowerCase().includes(kw) || i.type.includes(kw)));
    },

    // ═══════════════════════════════════════
    //  [신규] 고객사 자금흐름 (일별 입출금)
    // ═══════════════════════════════════════
    renderCashFlow() {
        const summary = DB.getCashFlowSummary();
        const flows = DB.getCashFlow();
        const netClass = summary.net >= 0 ? 'teal' : 'amber';
        return `<div class="max-w-[1400px] mx-auto">
            <div class="grid grid-cols-3 gap-4 mb-5">
                <div class="bg-blue-50 border border-blue-200 p-5 rounded shadow-sm"><p class="text-[11px] font-bold text-blue-700 mb-1">최근 7일 총 입금</p><h3 class="text-3xl font-black font-mono text-blue-800">${Math.round(summary.inTotal/100000000).toLocaleString()}<span class="text-lg ml-0.5">억 원</span></h3></div>
                <div class="bg-red-50 border border-red-200 p-5 rounded shadow-sm"><p class="text-[11px] font-bold text-red-700 mb-1">최근 7일 총 출금</p><h3 class="text-3xl font-black font-mono text-red-800">${Math.round(summary.outTotal/100000000).toLocaleString()}<span class="text-lg ml-0.5">억 원</span></h3></div>
                <div class="bg-${netClass}-50 border border-${netClass}-200 p-5 rounded shadow-sm"><p class="text-[11px] font-bold text-${netClass}-700 mb-1">순 자금흐름 (Net)</p><h3 class="text-3xl font-black font-mono text-${netClass}-800">${summary.net>=0?'+':''}${Math.round(summary.net/100000000).toLocaleString()}<span class="text-lg ml-0.5">억 원</span></h3></div>
            </div>
            <div class="bg-white border border-slate-200 rounded p-5 shadow-sm mb-5">
                <h3 class="font-bold text-slate-800 text-[14px] mb-1">30일간 일별 자금 흐름 추이</h3>
                <p class="text-[11px] text-slate-500 mb-4">CMS 수집 기반 입금/출금 추이 (단위: 백만 원)</p>
                <div class="h-[300px]"><canvas id="cashFlowChart"></canvas></div>
            </div>
            <div class="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
                <div class="px-4 py-3 border-b border-slate-200 bg-slate-50"><h3 class="font-bold text-slate-800 text-[14px]">일별 상세 내역</h3></div>
                <div class="overflow-y-auto max-h-[350px]">
                    <table class="w-full text-left whitespace-nowrap"><thead class="bg-white text-[12px] text-slate-500 border-b border-slate-200 sticky top-0 z-10"><tr><th class="px-4 py-3 font-bold">일자</th><th class="px-4 py-3 font-bold text-right">입금</th><th class="px-4 py-3 font-bold text-right">출금</th><th class="px-4 py-3 font-bold text-right">순 흐름</th><th class="px-4 py-3 font-bold text-center">상태</th></tr></thead>
                    <tbody class="text-xs text-slate-700 divide-y divide-slate-100">${flows.map(f => `<tr class="hover:bg-slate-50"><td class="px-4 py-3 font-mono font-bold text-slate-600">${f.date}</td><td class="px-4 py-3 text-right font-mono text-blue-700 font-bold">+${Math.round(f.inflow/1000000).toLocaleString()}백만</td><td class="px-4 py-3 text-right font-mono text-red-600 font-bold">-${Math.round(f.outflow/1000000).toLocaleString()}백만</td><td class="px-4 py-3 text-right font-mono font-bold ${f.net>=0?'text-teal-700':'text-amber-700'}">${f.net>=0?'+':''}${Math.round(f.net/1000000).toLocaleString()}백만</td><td class="px-4 py-3 text-center"><span class="text-[10px] font-bold px-2 py-0.5 rounded ${f.net>=0?'bg-teal-50 text-teal-700 border border-teal-200':'bg-amber-50 text-amber-700 border border-amber-200'}">${f.net>=0?'흑자':'적자'}</span></td></tr>`).join('')}</tbody></table>
                </div>
            </div>
        </div>`;
    },
    initCashFlowChart() {
        const flows = DB.getCashFlow();
        const ctx = document.getElementById('cashFlowChart').getContext('2d');
        const chart = new Chart(ctx, { type:'bar', data:{ labels:flows.map(f=>f.date), datasets:[
            { label:'입금', data:flows.map(f=>Math.round(f.inflow/1000000)), backgroundColor:'rgba(59,130,246,0.7)', borderRadius:2, barThickness:8 },
            { label:'출금', data:flows.map(f=>-Math.round(f.outflow/1000000)), backgroundColor:'rgba(239,68,68,0.5)', borderRadius:2, barThickness:8 },
            { label:'순 흐름', data:flows.map(f=>Math.round(f.net/1000000)), type:'line', borderColor:'#0d9488', backgroundColor:'transparent', borderWidth:2, tension:0.3, pointRadius:0 }
        ]}, options:{ responsive:true, maintainAspectRatio:false, scales:{ y:{ grid:{borderDash:[2,2],color:'#f1f5f9'}, border:{display:false}, ticks:{callback:v=>v+'백만',font:{size:9}} }, x:{ grid:{display:false}, border:{display:false}, ticks:{maxRotation:0,font:{size:8}} } }, plugins:{ legend:{ position:'bottom', labels:{boxWidth:8,font:{size:10,family:'Pretendard'}} } } } });
        app.chartInstances.push(chart);
    }
};
