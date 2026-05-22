const TOKEN = "00c3c27d-b77b-4057-8fd0-f4aab2770459";

let chartDias, chartServicos, chartClientes;

async function carregar() {

    const url = `https://api.movidesk.com/public/v1/tickets?token=${TOKEN}&$select=id,createdDate,status,serviceFirstLevel,clients,subject,urgency`;

    const res = await fetch(url);
    const data = await res.json();

    if (!Array.isArray(data)) {
        alert("Erro ao carregar dados");
        return;
    }

    montarKPIs(data);
    montarGraficos(data);
}

function montarKPIs(data) {

    const hoje = new Date();
    const ontem = new Date();
    ontem.setDate(hoje.getDate() - 1);

    let hojeCount = 0;
    let ontemCount = 0;
    let mesCount = 0;

    data.forEach(t => {

        const d = new Date(t.createdDate);

        if (d.toDateString() === hoje.toDateString()) hojeCount++;
        if (d.toDateString() === ontem.toDateString()) ontemCount++;
        if (d.getMonth() === hoje.getMonth()) mesCount++;
    });

    document.getElementById("hoje").innerText = hojeCount;
    document.getElementById("ontem").innerText = ontemCount;
    document.getElementById("mes").innerText = mesCount;
    document.getElementById("total").innerText = data.length;
}

function montarGraficos(data) {

    // 📊 1. Tickets por dia
    const dias = {};

    // 🛠 Serviços
    const servicos = {};

    // 🧑 Clientes
    const clientes = {};

    data.forEach(t => {

        const d = new Date(t.createdDate).toISOString().split("T")[0];
        dias[d] = (dias[d] || 0) + 1;

        const serv = t.serviceFirstLevel?.name || "Sem serviço";
        servicos[serv] = (servicos[serv] || 0) + 1;

        const cli = t.clients?.[0]?.businessName || "Sem cliente";
        clientes[cli] = (clientes[cli] || 0) + 1;
    });

    // 📈 GRÁFICO DIAS
    if (chartDias) chartDias.destroy();

    chartDias = new Chart(document.getElementById("chartDias"), {
        type: "line",
        data: {
            labels: Object.keys(dias),
            datasets: [{
                label: "Tickets por dia",
                data: Object.values(dias)
            }]
        }
    });

    // 🛠 GRÁFICO SERVIÇOS
    if (chartServicos) chartServicos.destroy();

    chartServicos = new Chart(document.getElementById("chartServicos"), {
        type: "bar",
        data: {
            labels: Object.keys(servicos),
            datasets: [{
                label: "Serviços mais acionados",
                data: Object.values(servicos)
            }]
        }
    });

    // 🧑 GRÁFICO CLIENTES
    if (chartClientes) chartClientes.destroy();

    const topClientes = Object.entries(clientes)
        .sort((a,b) => b[1] - a[1])
        .slice(0, 10);

    chartClientes = new Chart(document.getElementById("chartClientes"), {
        type: "bar",
        data: {
            labels: topClientes.map(c => c[0]),
            datasets: [{
                label: "Top clientes",
                data: topClientes.map(c => c[1])
            }]
        }
    });
}

carregar();
