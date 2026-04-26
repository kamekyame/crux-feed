import { Threshold } from "#/src/thresholds.ts";
import { createCanvas, GlobalFonts } from "@napi-rs/canvas";
import {
  CategoryScale,
  Chart,
  ChartConfiguration,
  ChartItem,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  Plugin,
  PointElement,
  ScriptableContext,
  Title,
} from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";
import { colord } from "colord";
import { ViewType, viewTypeStringMap } from "./utils.ts";

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
    Title,
    Legend,
    annotationPlugin,
    customBackgroundColorPlugin,
  ]);

  GlobalFonts.registerFromPath("./fonts/Roboto-Regular.ttf", "Roboto");
  Chart.defaults.font.family = "Roboto";
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

export async function createMetricOgImage(args: {
  labels: string[];
  p75Series?: number[];
  distributionsSeries?: {
    good: number[];
    needsImprovement: number[];
    poor: number[];
  };
  thresholds: Threshold;
  view: ViewType;
}) {
  const { labels, p75Series, distributionsSeries, thresholds, view } = args;
  const title = viewTypeStringMap[view];

  const canvas = createCanvas(1200, 630);

  const datasets: ChartConfiguration["data"]["datasets"] = [];
  if (p75Series) {
    datasets.push({
      label: title,
      data: p75Series,
      pointStyle: "rect",
      pointBorderColor: (ctx: ScriptableContext<"line">) => {
        const value = Number(ctx.raw);
        if (value <= thresholds.good) {
          return colorMap.good.toHex();
        } else if (value <= thresholds.needs_improvement) {
          return colorMap.needsImprovement.toHex();
        } else {
          return colorMap.poor.toHex();
        }
      },
      pointBackgroundColor: "white",
      borderColor: "black",
      yAxisID: "y",
    });
  }
  if (distributionsSeries) {
    datasets.push(
      {
        data: distributionsSeries?.poor,
        pointStyle: "circle",
        pointBorderColor: "white",
        pointBackgroundColor: colorMap.poor.toHex(),
        borderColor: colorMap.poor.toHex(),
        yAxisID: "distributionY",
      },
      {
        data: distributionsSeries?.needsImprovement,
        pointStyle: "circle",
        pointBorderColor: "white",
        pointBackgroundColor: colorMap.needsImprovement.toHex(),
        borderColor: colorMap.needsImprovement.toHex(),
        yAxisID: "distributionY",
      },
      {
        data: distributionsSeries?.good,
        pointStyle: "circle",
        pointBorderColor: "white",
        pointBackgroundColor: colorMap.good.toHex(),
        borderColor: colorMap.good.toHex(),
        yAxisID: "distributionY",
      },
    );
  }

  // おそらく Canvas の型定義が dom と被っていてエラーになるためキャスト
  new Chart(canvas as unknown as ChartItem, {
    type: "line",
    data: {
      labels,
      datasets: datasets,
    },
    options: {
      datasets: {
        line: {
          borderWidth: 2,
          pointBorderWidth: 3,
          pointRadius: 8,
        },
      },
      layout: {
        padding: 50,
      },
      scales: {
        y: {
          display: !!p75Series,
          beginAtZero: true,
          max: Math.max(
            thresholds.needs_improvement,
            Math.max(...(p75Series ?? [])) + 5,
          ),
          title: {
            display: true,
            text: `75th Percentile${view === "cls" ? "" : " (ms)"}`,
            font: { size: 20 },
          },
          ticks: {
            font: { size: 14 },
          },
          grid: { display: false },
        },
        distributionY: {
          display: !!distributionsSeries,
          position: "right",
          beginAtZero: true,
          max: 1,
          title: {
            display: true,
            text: "Distribution (density)",
            font: { size: 20 },
          },
          ticks: {
            stepSize: 0.2,
            font: { size: 14 },
          },
          grid: { display: false },
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
        title: {
          display: true,
          text: title,
          font: {
            size: 28,
          },
        },
        legend: {
          display: false,
        },
      },
    },
  });
  return await canvas.encode("png");
}
