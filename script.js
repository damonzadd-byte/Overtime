// อัตราค่าจ้างเริ่มต้น
let rate10 = 65.30;
let rate15 = 98.00;
let rate30 = 196.00;

// ข้อมูลเริ่มต้น OT
let otData = [
    { date: '2026-10-10', ot1: 0, ot15: 3, ot3: 0 },
    { date: '2026-10-11', ot1: 8, ot15: 0, ot3: 3 },
    { date: '2026-10-12', ot1: 8, ot15: 0, ot3: 3 },
    { date: '2026-10-13', ot1: 0, ot15: 3, ot3: 0 },
    { date: '2026-10-14', ot1: 0, ot15: 3, ot3: 0 },
    { date: '2026-10-15', ot1: 0, ot15: 3, ot3: 0 },
    { date: '2026-10-16', ot1: 0, ot15: 3, ot3: 0 },
    { date: '2026-10-17', ot1: 0, ot15: 3, ot3: 0 }
];

let barChartInst = null;
let doughnutChartInst = null;

window.onload = function() {
    document.getElementById('addDate').valueAsDate = new Date();
    renderAll();
};

// คำนวณอัตราค่าจ้างอัตโนมัติจากค่าจ้างฐาน
function autoCalcRates() {
    const base = parseFloat(document.getElementById('baseRateInput').value) || 0;
    document.getElementById('rate10Input').value = base.toFixed(2);
    document.getElementById('rate15Input').value = (base * 1.5).toFixed(2);
    document.getElementById('rate30Input').value = (base * 3.0).toFixed(2);
}

// อัปเดตอัตราค่าจ้างใหม่ในการคำนวณ
function updateRates() {
    rate10 = parseFloat(document.getElementById('rate10Input').value) || 0;
    rate15 = parseFloat(document.getElementById('rate15Input').value) || 0;
    rate30 = parseFloat(document.getElementById('rate30Input').value) || 0;
    alert('อัปเดตอัตราค่าจ้างเรียบร้อยแล้ว!');
    renderAll();
}

// คำนวณจำนวนเงินของแต่ละรายการ
function calculateAmount(item) {
    return (item.ot1 * rate10) + (item.ot15 * rate15) + (item.ot3 * rate30);
}

// แสดงผลข้อมูลตาราง สรุปยอด และกราฟ
function renderAll() {
    renderTable();
    renderCharts();
}

function renderTable() {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';

    let sumOt1 = 0, sumOt15 = 0, sumOt3 = 0, grandTotalAmt = 0;

    otData.forEach((item, index) => {
        const totalHours = item.ot1 + item.ot15 + item.ot3;
        const totalAmt = calculateAmount(item);

        sumOt1 += item.ot1;
        sumOt15 += item.ot15;
        sumOt3 += item.ot3;
        grandTotalAmt += totalAmt;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${item.date}</td>
            <td>${item.ot1 > 0 ? item.ot1 : '-'}</td>
            <td>${item.ot15 > 0 ? item.ot15 : '-'}</td>
            <td>${item.ot3 > 0 ? item.ot3 : '-'}</td>
            <td><strong>${totalHours}</strong></td>
            <td>${totalAmt.toLocaleString('th-TH', {minimumFractionDigits: 2})}</td>
            <td>
                <button class="btn-warning btn-sm" onclick="openEditModal(${index})">แก้ไข</button>
                <button class="btn-danger btn-sm" onclick="deleteEntry(${index})">ลบ</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // อัปเดต สรุปผลยอดรวม KPI
    const totalHours = sumOt1 + sumOt15 + sumOt3;
    document.getElementById('sumDays').innerText = `${otData.length} วัน`;
    document.getElementById('sumOt1').innerText = `${sumOt1} ชม.`;
    document.getElementById('sumOt15').innerText = `${sumOt15} ชม.`;
    document.getElementById('sumOt3').innerText = `${sumOt3} ชม.`;
    document.getElementById('sumTotalHours').innerText = `${totalHours} ชม.`;
    document.getElementById('sumGrandTotal').innerText = `${grandTotalAmt.toLocaleString('th-TH', {minimumFractionDigits: 2, maximumFractionDigits: 2})} บาท`;
}

// สร้างและอัปเดตกราฟ Chart.js
function renderCharts() {
    const labels = otData.map(d => d.date);
    const ot1List = otData.map(d => d.ot1);
    const ot15List = otData.map(d => d.ot15);
    const ot3List = otData.map(d => d.ot3);

    const sumOt1Amt = otData.reduce((s, i) => s + (i.ot1 * rate10), 0);
    const sumOt15Amt = otData.reduce((s, i) => s + (i.ot15 * rate15), 0);
    const sumOt3Amt = otData.reduce((s, i) => s + (i.ot3 * rate30), 0);

    // 1. Bar Chart
    if (barChartInst) barChartInst.destroy();
    const ctxBar = document.getElementById('barChart').getContext('2d');
    barChartInst = new Chart(ctxBar, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                { label: 'OT 1.0 (ชม.)', data: ot1List, backgroundColor: '#3b82f6' },
                { label: 'OT 1.5 (ชม.)', data: ot15List, backgroundColor: '#f59e0b' },
                { label: 'OT 3.0 (ชม.)', data: ot3List, backgroundColor: '#ef4444' }
            ]
        },
        options: {
            responsive: true,
            scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } }
        }
    });

    // 2. Doughnut Chart
    if (doughnutChartInst) doughnutChartInst.destroy();
    const ctxDoughnut = document.getElementById('doughnutChart').getContext('2d');
    doughnutChartInst = new Chart(ctxDoughnut, {
        type: 'doughnut',
        data: {
            labels: ['OT 1.0 (บาท)', 'OT 1.5 (บาท)', 'OT 3.0 (บาท)'],
            datasets: [{
                data: [sumOt1Amt, sumOt15Amt, sumOt3Amt],
                backgroundColor: ['#3b82f6', '#f59e0b', '#ef4444']
            }]
        },
        options: { responsive: true }
    });
}

// เพิ่มรายการใหม่
function addEntry() {
    const date = document.getElementById('addDate').value;
    const ot1 = parseFloat(document.getElementById('addOt1').value) || 0;
    const ot15 = parseFloat(document.getElementById('addOt15').value) || 0;
    const ot3 = parseFloat(document.getElementById('addOt3').value) || 0;

    if (!date) {
        alert('กรุณาระบุวันที่');
        return;
    }

    otData.push({ date, ot1, ot15, ot3 });

    // ล้างค่าอินพุต
    document.getElementById('addOt1').value = 0;
    document.getElementById('addOt15').value = 0;
    document.getElementById('addOt3').value = 0;

    renderAll();
}

// ลบรายการ
function deleteEntry(index) {
    if (confirm(`คุณต้องการลบรายการวันที่ ${otData[index].date} ใช่หรือไม่?`)) {
        otData.splice(index, 1);
        renderAll();
    }
}

// เปิด Modal แก้ไข
function openEditModal(index) {
    const item = otData[index];
    document.getElementById('editIndex').value = index;
    document.getElementById('editDate').value = item.date;
    document.getElementById('editOt1').value = item.ot1;
    document.getElementById('editOt15').value = item.ot15;
    document.getElementById('editOt3').value = item.ot3;
    document.getElementById('editModal').style.display = 'flex';
}

function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
}

// บันทึกการแก้ไข
function saveEdit() {
    const index = parseInt(document.getElementById('editIndex').value);
    otData[index] = {
        date: document.getElementById('editDate').value,
        ot1: parseFloat(document.getElementById('editOt1').value) || 0,
        ot15: parseFloat(document.getElementById('editOt15').value) || 0,
        ot3: parseFloat(document.getElementById('editOt3').value) || 0
    };
    closeEditModal();
    renderAll();
}

// อ่านไฟล์ Excel
document.getElementById('excelFile').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(evt) {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        otData = [];
        for (let i = 2; i < rawRows.length; i++) {
            const row = rawRows[i];
            if (!row[0] || row[0] === 'Time total' || row[0] === 'Amount') break;

            let formattedDate = row[0];
            if (typeof row[0] === 'number') {
                const dateObj = XLSX.SSF.parse_date_code(row[0]);
                formattedDate = `${dateObj.y}-${String(dateObj.m).padStart(2, '0')}-${String(dateObj.d).padStart(2, '0')}`;
            } else if (String(row[0]).includes('T')) {
                formattedDate = String(row[0]).split('T')[0];
            }

            otData.push({
                date: formattedDate,
                ot1: parseFloat(row[1]) || 0,
                ot15: parseFloat(row[2]) || 0,
                ot3: parseFloat(row[3]) || 0
            });
        }
        renderAll();
    };
    reader.readAsArrayBuffer(file);
});

// ส่งออกไฟล์ Excel
function exportExcel() {
    if (otData.length === 0) {
        alert('ไม่มีข้อมูลสำหรับส่งออก');
        return;
    }

    const exportRows = [
        ['Over Time 2026', '', '', ''],
        ['Date', 1.0, 1.5, 3.0]
    ];

    let sum1 = 0, sum15 = 0, sum3 = 0;
    otData.forEach(item => {
        exportRows.push([item.date, item.ot1 || '', item.ot15 || '', item.ot3 || '']);
        sum1 += item.ot1;
        sum15 += item.ot15;
        sum3 += item.ot3;
    });

    const amt1 = sum1 * rate10;
    const amt15 = sum15 * rate15;
    const amt3 = sum3 * rate30;
    const grandTotal = amt1 + amt15 + amt3;

    exportRows.push(['Time total', sum1, sum15, sum3]);
    exportRows.push(['Amount', amt1, amt15, amt3]);
    exportRows.push(['Amount Total', '', '', grandTotal]);

    const worksheet = XLSX.utils.aoa_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Over Time");
    XLSX.writeFile(workbook, "Over_Time_Updated.xlsx");
}