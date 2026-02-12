<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SOG | Attendance Pro</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js"></script>
    
    <style>
        :root {
            --primary: #0f172a; --secondary: #1e293b; --accent: #38bdf8;
            --gold: #fbbf24; --success: #22c55e; --danger: #ef4444;
            --glass: rgba(255, 255, 255, 0.05); --text-main: #f8fafc;
        }

        body {
            font-family: 'Inter', sans-serif; background: radial-gradient(circle at top right, #1e293b, #0f172a);
            color: var(--text-main); margin: 0; padding: 20px; min-height: 100vh; display: flex; justify-content: center;
        }

        .container { width: 100%; max-width: 1000px; }
        .glass-card {
            background: var(--glass); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 24px; padding: 30px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }

        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { font-size: 2.2rem; margin: 0; background: linear-gradient(to right, #fff, var(--gold)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

        input, select {
            width: 100%; padding: 12px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1);
            background: rgba(0,0,0,0.2); color: white; margin-bottom: 10px; box-sizing: border-box;
        }

        .btn {
            padding: 12px 20px; border-radius: 10px; border: none; font-weight: 600; cursor: pointer;
            transition: 0.2s; display: inline-flex; align-items: center; justify-content: center; gap: 8px;
        }
        .btn-primary { background: var(--accent); color: var(--primary); width: 100%; }
        .btn-danger { background: var(--danger); color: white; }
        .btn-add { background: var(--success); color: white; }

        table { width: 100%; border-collapse: separate; border-spacing: 0 5px; }
        th { padding: 10px; text-align: left; color: var(--accent); font-size: 0.75rem; }
        td { padding: 10px; background: rgba(255,255,255,0.03); font-size: 0.9rem; }
        
        .badge { padding: 3px 8px; border-radius: 6px; font-size: 0.7rem; font-weight: bold; }
        .badge-present { background: rgba(34, 197, 94, 0.2); color: var(--success); }
        .badge-absent { background: rgba(239, 68, 68, 0.2); color: var(--danger); }
        .hidden { display: none; }

        .tab-btn { background: transparent; color: white; border: 1px solid rgba(255,255,255,0.2); margin-right: 5px; padding: 8px 15px; border-radius: 8px; cursor: pointer; }
        .tab-btn.active { border-color: var(--accent); color: var(--accent); background: rgba(56, 189, 248, 0.1); }
        
        .delete-icon { color: var(--danger); cursor: pointer; font-weight: bold; }
    </style>
</head>
<body>

<div class="container">
    <div class="glass-card">
        <div class="header">
            <h1>SOLDIERS OF GOD</h1>
            <p style="color: var(--accent); font-size: 0.9rem;">Management & Registry System</p>
        </div>

        <div id="auth-section">
            <input type="text" id="memberIdInput" placeholder="Enter ID (e.g., SOG004)">
            <button class="btn btn-primary" onclick="verifyUser()">Login</button>
        </div>

        <div id="admin-panel" class="hidden">
            <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                <h3 id="admin-title">Admin Dashboard</h3>
                <button class="btn btn-danger" style="padding: 5px 15px;" onclick="location.reload()">Exit</button>
            </div>
            
            <div style="margin-bottom: 20px;">
                <button class="tab-btn active" onclick="switchTab('mark')">Attendance</button>
                <button class="tab-btn" onclick="switchTab('add')">Members</button>
                <button class="tab-btn" onclick="switchTab('reset')">System</button>
            </div>

            <div id="tab-mark">
                <input type="date" id="attendance-date">
                <div style="max-height: 400px; overflow-y: auto;">
                    <table id="admin-att-table">
                        <thead><tr><th>Name</th><th>Mark</th><th>Avg %</th></tr></thead>
                        <tbody id="member-list-body"></tbody>
                    </table>
                </div>
                <button class="btn btn-primary" style="margin-top:15px;" onclick="saveAttendance()">Save Records</button>
                <button class="btn btn-primary" id="pdf-btn" style="display:none; margin-top:10px; background: var(--gold);" onclick="generatePDF()">Download Report (PDF)</button>
            </div>

            <div id="tab-add" class="hidden">
                <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 12px; margin-bottom: 20px;">
                    <h4>Register New Member</h4>
                    <input type="text" id="newName" placeholder="Full Name">
                    <input type="text" id="newId" placeholder="ID (e.g. SOG031)">
                    <button class="btn btn-add" style="width:100%" onclick="addNewMember()">Add to Registry</button>
                </div>
                <h4>Current Registry</h4>
                <div style="max-height: 250px; overflow-y: auto;">
                    <table>
                        <tbody id="manage-members-list"></tbody>
                    </table>
                </div>
            </div>

            <div id="tab-reset" class="hidden">
                <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid var(--danger); padding: 20px; border-radius: 12px;">
                    <h4 style="color: var(--danger); margin-top:0;">Danger Zone</h4>
                    <p style="font-size: 0.85rem;">Resetting the system will delete all attendance records for every member. This cannot be undone.</p>
                    <button class="btn btn-danger" style="width:100%" onclick="resetAllData()">RESET ALL ATTENDANCE DATA</button>
                </div>
            </div>
        </div>

        <div id="member-panel" class="hidden">
            <h2 id="welcome-member"></h2>
            <p id="member-id-tag"></p>
            <div id="stats-summary" style="font-size: 1.2rem; color: var(--gold); margin-bottom: 20px;"></div>
            
            <button class="btn btn-primary" onclick="generatePersonalPDF()" style="margin-bottom: 20px; background: var(--secondary);">Download My Report</button>
            
            <h4>History History</h4>
            <div style="max-height: 300px; overflow-y: auto;">
                <table>
                    <thead><tr><th>Date</th><th>Status</th></tr></thead>
                    <tbody id="member-history-body"></tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<script>
    const defaultMembers = [
        {id: "SOG001", name: "Aathil Mathew"}, {id: "SOG004", name: "Angeline", isAdmin: true},
        {id: "SOG006", name: "Anika Angel", isAdmin: true}, {id: "SOG010", name: "Daniel Lawrence", isAdmin: true},
        {id: "SOG013", name: "Delcy Mary (SOG-Y)", isAdmin: true}, {id: "SOG016", name: "Jooyal", isAdmin: true},
        {id: "SOG020", name: "prasith valan", isAdmin: true}, {id: "SOG024", name: "Ridinga (SOG-Y)", isAdmin: true},
        {id: "SOG027", name: "Sagaya Tharun Raj", isAdmin: true}, {id: "SOG030", name: "tharun. M"}
    ];

    let members = JSON.parse(localStorage.getItem('SOG_Members')) || defaultMembers;
    let currentUser = null;

    function verifyUser() {
        const id = document.getElementById('memberIdInput').value.trim().toUpperCase();
        currentUser = members.find(m => m.id === id);
        if (!currentUser) return alert("Member Not Found");
        document.getElementById('auth-section').classList.add('hidden');
        if (currentUser.isAdmin) showAdmin(); else showMember();
    }

    function switchTab(tab) {
        document.getElementById('tab-mark').classList.toggle('hidden', tab !== 'mark');
        document.getElementById('tab-add').classList.toggle('hidden', tab !== 'add');
        document.getElementById('tab-reset').classList.toggle('hidden', tab !== 'reset');
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        event.target.classList.add('active');
        if(tab === 'add') renderManageList();
        if(tab === 'mark') renderAdminTable();
    }

    function renderAdminTable() {
        const body = document.getElementById('member-list-body');
        body.innerHTML = members.map(m => {
            const history = JSON.parse(localStorage.getItem(m.id)) || [];
            const pct = history.length ? ((history.filter(h => h.status === 'Present').length / history.length) * 100).toFixed(0) : 0;
            return `<tr><td>${m.name}</td><td><input type="checkbox" class="att-check" data-id="${m.id}"></td><td>${pct}%</td></tr>`;
        }).join('');
    }

    function renderManageList() {
        const body = document.getElementById('manage-members-list');
        body.innerHTML = members.map(m => `
            <tr>
                <td>${m.name} <br><small>${m.id}</small></td>
                <td style="text-align:right"><span class="delete-icon" onclick="deleteMember('${m.id}')">Remove</span></td>
            </tr>
        `).join('');
    }

    function addNewMember() {
        const name = document.getElementById('newName').value.trim();
        const id = document.getElementById('newId').value.trim().toUpperCase();
        if (!name || !id) return alert("Fill all fields");
        members.push({ id, name, isAdmin: false });
        localStorage.setItem('SOG_Members', JSON.stringify(members));
        document.getElementById('newName').value = ""; document.getElementById('newId').value = "";
        renderManageList();
    }

    function deleteMember(id) {
        if (!confirm(`Are you sure you want to remove ${id}?`)) return;
        members = members.filter(m => m.id !== id);
        localStorage.setItem('SOG_Members', JSON.stringify(members));
        localStorage.removeItem(id); // Clear their history too
        renderManageList();
    }

    function resetAllData() {
        if (!confirm("CRITICAL: Delete ALL attendance history? This cannot be undone.")) return;
        members.forEach(m => localStorage.removeItem(m.id));
        alert("System Reset Complete.");
        location.reload();
    }

    function showAdmin() {
        document.getElementById('admin-panel').classList.remove('hidden');
        document.getElementById('attendance-date').value = new Date().toISOString().split('T')[0];
        renderAdminTable();
    }

    function saveAttendance() {
        const date = document.getElementById('attendance-date').value;
        document.querySelectorAll('.att-check').forEach(chk => {
            const id = chk.dataset.id;
            const history = JSON.parse(localStorage.getItem(id)) || [];
            const entry = { date, status: chk.checked ? 'Present' : 'Absent' };
            const idx = history.findIndex(h => h.date === date);
            if (idx > -1) history[idx] = entry; else history.push(entry);
            localStorage.setItem(id, JSON.stringify(history));
        });
        document.getElementById('pdf-btn').style.display = 'block';
        alert("Saved!");
    }

    function generatePDF() {
        const { jsPDF } = window.jspdf; const doc = new jsPDF();
        const date = document.getElementById('attendance-date').value;
        doc.text(`SOG Attendance Report: ${date}`, 14, 20);
        const rows = members.map(m => {
            const h = JSON.parse(localStorage.getItem(m.id)) || [];
            const r = h.find(x => x.date === date);
            return [m.id, m.name, r ? r.status : 'N/A'];
        });
        doc.autoTable({ startY: 30, head: [['ID', 'Name', 'Status']], body: rows });
        doc.save(`SOG_Daily_${date}.pdf`);
    }

    function showMember() {
        document.getElementById('member-panel').classList.remove('hidden');
        document.getElementById('welcome-member').innerText = currentUser.name;
        document.getElementById('member-id-tag').innerText = `Member ID: ${currentUser.id}`;
        const history = JSON.parse(localStorage.getItem(currentUser.id)) || [];
        const pres = history.filter(h => h.status === 'Present').length;
        document.getElementById('stats-summary').innerText = `Overall Score: ${history.length ? ((pres/history.length)*100).toFixed(0) : 0}%`;
        document.getElementById('member-history-body').innerHTML = history.reverse().map(h => 
            `<tr><td>${h.date}</td><td><span class="badge badge-${h.status.toLowerCase()}">${h.status}</span></td></tr>`
        ).join('');
    }

    function generatePersonalPDF() {
        const { jsPDF } = window.jspdf; const doc = new jsPDF();
        const history = JSON.parse(localStorage.getItem(currentUser.id)) || [];
        doc.text(`Member Report: ${currentUser.name}`, 14, 20);
        const rows = history.map(h => [h.date, h.status]);
        doc.autoTable({ startY: 30, head: [['Date', 'Status']], body: rows });
        doc.save(`${currentUser.id}_History.pdf`);
    }
</script>
</body>
</html>

