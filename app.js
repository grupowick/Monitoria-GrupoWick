const TOKEN = "SEU_TOKEN_AQUI"; // ⚠️ visível (limitação GitHub Pages)

let chart;

async function carregar() {

    const url = `https://api.movidesk.com/public/v1/tickets?token=${TOKEN}&$select=id,createdDate`;

    const res = await fetch(url);
    const data = await res.json();

    // KPIs
    const hoje = new Date();
    const mes = hoje.getMonth();

    let countHoje = 0;
    let countMes = 0;

    const dias = {};

    data.forEach(t => {

        const d = new Date(t.createdDate);

        if (d.toDateString() === hoje.toDateString()) countHoje++;
        if (d.getMonth() === mes) countMes++;

        const dia = d.toISOString().split("T")[0];
        dias[dia] = (dias[dia] || 0) + 1;
    });

    document.getElementById("hoje").innerText = countHoje;
    document.getElementById("mes").innerText = countMes;
    document.getElementById("total").innerText = data.length;

    // gráfico
    const labels = Object.keys(dias);
    const values = Object.values(dias);

    if (chart) chart.destroy();

    chart = new Chart(document.getElementById("chart"), {
        type: "line",
        data: {
            labels,
            datasets: [{
                label: "Tickets por dia",
                data: values
            }]
        }
    });
}

carregar();
