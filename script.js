let services = JSON.parse(localStorage.getItem('clientflow_v2')) || [];
let filter = 'all';

function updateUI() {
    localStorage.setItem('clientflow_v2', JSON.stringify(services));
    const totalPending = services.filter(s => s.status === 'pending').reduce((a, b) => a + b.value, 0);
    document.getElementById('total-pending').innerText = totalPending.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
    renderServices();
    renderContacts();
}

function switchTab(tab) {
    const isServices = tab === 'services';
    document.getElementById('view-services').classList.toggle('hidden', !isServices);
    document.getElementById('view-clients').classList.toggle('hidden', isServices);
    
    document.getElementById('btn-services').className = `flex-1 py-4 text-xs font-black uppercase ${isServices ? 'tab-active' : 'text-slate-400'}`;
    document.getElementById('btn-clients').className = `flex-1 py-4 text-xs font-black uppercase ${!isServices ? 'tab-active' : 'text-slate-400'}`;
}

function setFilter(f) {
    filter = f;
    document.getElementById('f-all').className = f === 'all' ? "bg-blue-700 text-white px-5 py-2 rounded-full text-[10px] font-bold uppercase" : "bg-white text-slate-500 px-5 py-2 rounded-full text-[10px] font-bold uppercase border";
    document.getElementById('f-pending').className = f === 'pending' ? "bg-blue-700 text-white px-5 py-2 rounded-full text-[10px] font-bold uppercase" : "bg-white text-slate-500 px-5 py-2 rounded-full text-[10px] font-bold uppercase border";
    renderServices();
}

function renderServices() {
    const container = document.getElementById('service-list');
    container.innerHTML = '';
    
    let list = filter === 'all' ? services : services.filter(s => s.status === 'pending');
    
    list.slice().reverse().forEach(s => {
        const div = document.createElement('div');
        div.className = "bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 animate-in";
        div.innerHTML = `
            <div class="flex justify-between items-start mb-3">
                <div>
                    <h4 class="font-black text-slate-800 leading-tight">${s.client}</h4>
                    <p class="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">${dayjs(s.date).format('DD/MM/YYYY')} • ${s.desc}</p>
                </div>
                <button onclick="toggleStatus(${s.id})" class="px-3 py-1.5 rounded-full text-[8px] font-black uppercase ${s.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}">
                    ${s.status === 'paid' ? 'Pago' : 'Pendente'}
                </button>
            </div>
            <div class="flex justify-between items-center pt-3 border-t">
                <span class="font-black text-blue-700">R$ ${s.value.toFixed(2)}</span>
                <div class="flex gap-2">
                    <button onclick="contactClient('${s.phone}')" class="p-2 bg-blue-50 text-blue-600 rounded-xl"><i data-lucide="message-circle" class="w-4 h-4"></i></button>
                    <button onclick="deleteService(${s.id})" class="p-2 bg-slate-50 text-slate-300 rounded-xl"><i data-lucide="trash" class="w-4 h-4"></i></button>
                </div>
            </div>
        `;
        container.appendChild(div);
    });
    lucide.createIcons();
}

function renderContacts() {
    const container = document.getElementById('contact-list');
    container.innerHTML = '';
    
    // Extrair clientes únicos
    const clients = [];
    const map = new Map();
    for (const item of services) {
        if (!map.has(item.client)) {
            map.set(item.client, true);
            clients.push({ name: item.client, phone: item.phone });
        }
    }

    clients.forEach(c => {
        const div = document.createElement('div');
        div.className = "bg-white p-4 rounded-2xl flex justify-between items-center shadow-sm border border-slate-100";
        div.innerHTML = `
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-black">${c.name[0]}</div>
                <div>
                    <p class="text-sm font-black text-slate-800">${c.name}</p>
                    <p class="text-[10px] text-slate-400 font-bold">${c.phone || 'Sem telefone'}</p>
                </div>
            </div>
            <button onclick="contactClient('${c.phone}')" class="text-blue-600 p-2"><i data-lucide="phone" class="w-5 h-5"></i></button>
        `;
        container.appendChild(div);
    });
    lucide.createIcons();
}

document.getElementById('main-form').onsubmit = (e) => {
    e.preventDefault();
    services.push({
        id: Date.now(),
        client: document.getElementById('c-name').value,
        phone: document.getElementById('c-phone').value,
        desc: document.getElementById('s-desc').value,
        value: parseFloat(document.getElementById('s-value').value),
        date: document.getElementById('s-date').value,
        status: document.getElementById('s-status').value
    });
    closeModal();
    updateUI();
    e.target.reset();
};

function toggleStatus(id) {
    const s = services.find(x => x.id === id);
    s.status = s.status === 'paid' ? 'pending' : 'paid';
    updateUI();
}

function contactClient(phone) {
    if(!phone) return alert("Telefone não cadastrado");
    window.open(`https://wa.me/55${phone.replace(/\D/g,'')}`);
}

function deleteService(id) {
    if(confirm("Excluir registro?")) {
        services = services.filter(s => s.id !== id);
        updateUI();
    }
}

function openModal() { document.getElementById('modal').classList.replace('hidden', 'flex'); }
function closeModal() { document.getElementById('modal').classList.replace('flex', 'hidden'); }

// Definir data padrão no input como hoje
document.getElementById('s-date').value = dayjs().format('YYYY-MM-DD');

updateUI();