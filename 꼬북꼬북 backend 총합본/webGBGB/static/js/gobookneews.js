// 차트 인스턴스 저장용
const chartInstances = {};

// 날짜 누락 채우기용 함수
function fillMissingDates(labels, data, year, month) {
  const totalDays = new Date(year, month, 0).getDate();
  const fullLabels = Array.from({ length: totalDays }, (_, i) => (i + 1).toString() + "일"); // "1일", "2일", ...
  // labels에서 '일' 글자를 떼고 숫자만 키로 사용
  const dataMap = Object.fromEntries(
    labels.map((label, i) => [label.replace('일', ''), data[i]])
  );
  // fullLabels에서 '일' 떼고 숫자로 비교해서 data 채우기
  const fullData = fullLabels.map(label => dataMap[label.replace('일', '')] ?? 0);
  return { labels: fullLabels, data: fullData };
}

function drawChart(url, canvasId, type, label = "", bgColor = "#3498db", borderColor = "#3498db") {
  if (chartInstances[canvasId]) {
    chartInstances[canvasId].destroy();
  }

  fetch(url)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    })
    .then(data => {
      if (!data || !data.labels || !data.data) {
        console.error('Invalid data format:', data);
        return;
      }

      const ctx = document.getElementById(canvasId);
      if (!ctx) {
        console.error(`Canvas element not found: ${canvasId}`);
        return;
      }

      const urlParams = new URLSearchParams(url.split('?')[1]);
      const year = parseInt(urlParams.get('year'));
      const month = parseInt(urlParams.get('month'));

      // 선형 차트에만 누락 날짜 채우기 적용
      if (type === 'line') {
        const filled = fillMissingDates(data.labels, data.data, year, month);
        data.labels = filled.labels;
        data.data = filled.data;
      }

      const maxDataValue = Math.max(...data.data);
      const suggestedMax = Math.ceil(maxDataValue * 1.1); // 10% 여유

      chartInstances[canvasId] = new Chart(ctx, {
        type: type,
        data: {
          labels: data.labels,
          datasets: [{
            label: label,
            data: data.data,
            backgroundColor: (type === "pie" || type === "doughnut" || type === "bar")
              ? generateColors(data.data.length)
              : (type === "line" ? 'rgba(45, 104, 120, 0.2)' : bgColor),
            borderColor: (type === "pie" || type === "doughnut" || type === "bar")
              ? generateColors(data.data.length)
              : (type === "line" ? '#2d7868' : borderColor),
            borderWidth: 2,
            fill: type === "line"
          }]
        },
        options: {
          responsive: true,
          indexAxis: type === "bar" ? 'y' : 'x',
          plugins: {
            legend: { display: false },
            datalabels: {
              color: ctx => ctx.chart.config.type === 'line' ? '#1a1a1a' : '#fafafa',
              anchor: ctx => ctx.chart.config.type === 'line' ? 'end' : 'center',
              align: ctx => ctx.chart.config.type === 'line' ? 'end' : 'center',
              font: { size: 16 },
              formatter: function(value) {
                return value === 0 ? '' : Math.round(value);
              }
            }
          },
          scales: (type === "line" || type === "bar") ? {
            y: {
              beginAtZero: true,
              max: suggestedMax
            }
          } : {}
        },
        plugins: [ChartDataLabels]
      });
    })
    .catch(error => {
      console.error('Chart loading error:', error);
    });
}

// 페이지 로드 시 차트 그리기
document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const year = urlParams.get('year') || new Date().getFullYear();
  const month = urlParams.get('month') || (new Date().getMonth() + 1);

  const select = document.getElementById('ctgr_mon');
  if (select) {
    const valueToSelect = `${year}-${month.toString().padStart(2, '0')}`;
    select.value = valueToSelect;
  }

  drawAllCharts(year, month);

  // applyBtn 이벤트 리스너 바인딩, 요소가 있으면만
  const applyBtn = document.getElementById('applyBtn');
  if (applyBtn) {
    applyBtn.addEventListener('click', function () {
      const value = document.getElementById('ctgr_mon').value;
      const [year, month] = value.split('-');
      window.location.href = `/neews/?year=${year}&month=${month}`;
    });
  }

});




function drawAllCharts(year, month) {
  drawChart(`/neews/chart/join/?year=${year}&month=${month}`, 'joinChart', 'line', '가입 인원');
  drawChart(`/neews/chart/genre/?year=${year}&month=${month}`, 'genChart', 'bar', '선호 장르');
  drawChart(`/neews/chart/share/?year=${year}&month=${month}`, 'shareChart', 'line', '교환독서 그룹 생성');
  drawChart(`/neews/chart/tag/?year=${year}&month=${month}`, 'sharetagChart', 'doughnut', '이달의 태그');
  drawChart(`/neews/chart/review/?year=${year}&month=${month}`, 'reviewChart', 'line', '리뷰 수');
}

function generateColors(num) {
  const colors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
    '#FF9F40', '#66FF66', '#FF6666', '#6699FF', '#FFCC99'
  ];
  return Array.from({ length: num }, (_, i) => colors[i % colors.length]);
}
