import { Threshold } from "#/src/thresholds.ts";
import { createCanvas } from "@napi-rs/canvas";
import {
  CategoryScale,
  Chart,
  ChartItem,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  Plugin,
  PointElement,
  ScriptableContext,
} from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";
import { colord } from "colord";

const colorMap = {
  good: colord("#0ccf6b"),
  needsImprovement: colord("#ffa401"),
  poor: colord("#eb0c00"),
};

export function initChart() {
  const customBackgroundColorPlugin: Plugin = {
    id: "customBackgroundColor",
    beforeDraw: (chart) => {
      const { ctx, width, height } = chart;
      ctx.save();

      ctx.globalCompositeOperation = "destination-over";
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, width, height);

      ctx.restore();
    },
  };

  Chart.register([
    CategoryScale,
    LineController,
    LineElement,
    LinearScale,
    PointElement,
    Legend,
    annotationPlugin,
    customBackgroundColorPlugin,
  ]);
}

export function normalizeByThreshold(value: number, threshold: Threshold) {
  const { good, needs_improvement } = threshold;

  if (value <= good) {
    return (value / good) * 30;
  } else if (value <= needs_improvement) {
    return 30 + ((value - good) / (needs_improvement - good)) * 30;
  } else {
    return Math.min(
      100,
      60 + ((value - needs_improvement) / needs_improvement) * 40,
    );
  }
}

export async function createCwvsummaryOgImage(args: {
  labels: string[];
  lcpSeries: number[];
  inpSeries: number[];
  clsSeries: number[];
}) {
  const { labels, lcpSeries, inpSeries, clsSeries } = args;

  const canvas = createCanvas(1200, 630);

  // おそらく Canvas の型定義が dom と被っていてエラーになるためキャスト
  new Chart(canvas as unknown as ChartItem, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "LCP",
          data: lcpSeries,
          pointStyle: "circle",
        },
        {
          label: "INP",
          data: inpSeries,
          pointStyle: "rect",
        },
        {
          label: "CLS",
          data: clsSeries,
          pointStyle: "triangle",
        },
      ],
    },
    options: {
      datasets: {
        line: {
          borderWidth: 2,
          borderColor: "black",
          pointBorderWidth: 3,
          pointRadius: 8,
          pointBackgroundColor: "white",
          pointBorderColor: (ctx: ScriptableContext<"line">) => {
            const value = Number(ctx.raw);
            if (value <= 30) {
              return colorMap.good.toHex();
            } else if (value <= 60) {
              return colorMap.needsImprovement.toHex();
            } else {
              return colorMap.poor.toHex();
            }
          },
        },
      },
      layout: {
        padding: 50,
      },
      scales: {
        y: {
          display: false,
          beginAtZero: true,
          max: Math.max(...clsSeries, ...inpSeries, ...lcpSeries) + 5,
        },
        x: {
          display: true,

          labels: labels.map((label, index) => {
            if (index === labels.length - 1) return label;
            return "";
          }),
          ticks: {
            autoSkip: false,
            maxRotation: 0,
            minRotation: 0,
            align: "end",
            font: { size: 28 },
          },
        },
      },
      plugins: {
        legend: {
          display: true,
          position: "right",
          labels: {
            usePointStyle: true,
            padding: 32,
            font: {
              size: 28,
            },
          },
        },
        annotation: {
          common: {
            drawTime: "beforeDraw",
          },
          annotations: {
            good: {
              type: "box",
              yMin: 0,
              yMax: 30,
              backgroundColor: colorMap.good.alpha(0.1).toRgbString(),
              borderWidth: 0,
            },
            needsImprovement: {
              type: "box",
              yMin: 30,
              yMax: 60,
              backgroundColor: colorMap.needsImprovement.alpha(0.1)
                .toRgbString(),
              borderWidth: 0,
            },
            poor: {
              type: "box",
              yMin: 60,
              yMax: 100,
              backgroundColor: colorMap.poor.alpha(0.1).toRgbString(),
              borderWidth: 0,
            },
          },
        },
      },
    },
  });
  return await canvas.encode("png");
}
