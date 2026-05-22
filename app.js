const TOKEN = "SEU_TOKEN_AQUI";

let chartDias, chartStatus;

async function carregar() {

    const url = `https://api.movidesk.com/public/v1/tickets?token=${TOKEN}&$select=id,createdDate,status,serviceFirstLevel,clients,urgency,subject`;

    const res = await fetch(url);
    const data = await res.json();

    processarKPIs(data);
    graficos(data);
    netflixRows(data);
}

function processarKPIs(data) {

    const hoje = new Date();
    const ontem = new Date();
    ontem.setDate(hoje.getDate() - 1);

    let h=0, o=0, m=0;

    data.forEach(t => {
        const d = new Date(t.createdDate);

        if (d.toDateString() === hoje.toDateString()) h++;
        if (d.toDateString() === ontem.toDateString()) o++;
        if (d.getMonth() === hoje.getMonth()) m++;
    });

    hoje.innerText = h;
    ontem.innerText = o;
    mes.innerText = m;
    total.innerText = data.length;
}

function graficos(data) {

    const dias = {};
    const status = {};

    data.forEach(t => {

        const d = new Date(t.createdDate).toISOString().split("T")[0];
        dias[d] = (dias[d] || 0) + 1;

        const st = t.status || "Sem status";
        status[st] = (status[st] || 0) + 1;
    });

    if (chartDias) chartDias.destroy();

    chartDias = new Chart(document.getElementById("dias"), {
        type: "line",
        data: {
            labels: Object.keys(dias),
            datasets: [{
                label: "Tickets",
                data: Object.values(dias)
            }]
        }
    });

    if (chartStatus) chartStatus.destroy();

    chartStatus = new Chart(document.getElementById("status"), {
        type: "doughnut",
        data: {
            labels: Object.keys(status),
            datasets: [{
                data: Object.values(status)
            }]
        }
    });
}

function netflixRows(data) {

    const servicos = {};
    const clientes = {};
    const recentes = data.slice(0, 10);

    data.forEach(t => {

        const s = t.serviceFirstLevel?.name || "Sem serviço";
        servicos[s] = (servicos[s] || 0) + 1;

        const c = t.clients?.[0]?.businessName || "Sem cliente";
        clientes[c] = (clientes[c] || 0) + 1;
    });

    // 🛠 serviços
    document.getElementById("servicos").innerHTML =
        Object.entries(servicos).map(s => `
        <div class="card" style="min-width:200px">
            <h4>${s[0]}</h4>
            <p>${s[1]} tickets</p>
        </div>
    `).join("");

    // 🧑 clientes
    document.getElementById("clientes").innerHTML =
        Object.entries(clientes)
        .sort((a,b)=>b[1]-a[1])
        .slice(0,10)
        .map(c => `
        <div class="card" style="min-width:200px">
            <h4>${c[0]}</h4>
            <p>${c[1]} tickets</p>
        </div>
    `).join("");

    // 🔥 recentes
    document.getElementById("recentes").innerHTML =
        recentes.map(t => `
        <div class="card" style="min-width:250px">
            <h4>${t.subject || "Sem assunto"}</h4>
            <p>${t.status}</p>
            <small>${t.createdDate}</small>
        </div>
    `).join("");
}

carregar();
