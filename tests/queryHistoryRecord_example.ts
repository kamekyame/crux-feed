import { HistoryResponse } from "crux-api";

export const mockData: HistoryResponse = {
  "record": {
    "key": {
      "origin": "https://example.com",
    },
    "metrics": {
      "first_contentful_paint": {
        "histogramTimeseries": [
          {
            "start": 0,
            "end": 1800,
            "densities": [
              0.8918,
              0.8844,
              0.8823,
              0.8832,
              0.8841,
            ],
          },
          {
            "start": 1800,
            "end": 3000,
            "densities": [
              0.0555,
              0.0617,
              0.0656,
              0.0644,
              0.0646,
            ],
          },
          {
            "start": 3000,
            "densities": [
              0.0527,
              0.0539,
              0.0521,
              0.0524,
              0.0512,
            ],
          },
        ],
        "percentilesTimeseries": {
          "p75s": [
            1062,
            1149,
            1186,
            1179,
            1171,
          ],
        },
      },
      "largest_contentful_paint": {
        "histogramTimeseries": [
          {
            "start": 0,
            "end": 2500,
            "densities": [
              0.9366,
              0.9338,
              0.9328,
              0.9346,
              0.9342,
            ],
          },
          {
            "start": 2500,
            "end": 4000,
            "densities": [
              0.0352,
              0.0367,
              0.0377,
              0.0365,
              0.0367,
            ],
          },
          {
            "start": 4000,
            "densities": [
              0.0282,
              0.0295,
              0.0294,
              0.0288,
              0.0291,
            ],
          },
        ],
        "percentilesTimeseries": {
          "p75s": [
            5041,
            4131,
            3170,
            2163,
            1155,
          ],
        },
      },
      "largest_contentful_paint_image_element_render_delay": {
        "percentilesTimeseries": {
          "p75s": [
            208,
            233,
            238,
            247,
            258,
          ],
        },
      },
      "largest_contentful_paint_image_resource_load_delay": {
        "percentilesTimeseries": {
          "p75s": [
            587,
            736,
            742,
            658,
            659,
          ],
        },
      },
      "largest_contentful_paint_image_resource_load_duration": {
        "percentilesTimeseries": {
          "p75s": [
            126,
            129,
            119,
            112,
            116,
          ],
        },
      },
      "largest_contentful_paint_image_time_to_first_byte": {
        "percentilesTimeseries": {
          "p75s": [
            458,
            456,
            478,
            474,
            468,
          ],
        },
      },
      "largest_contentful_paint_resource_type": {
        "fractionTimeseries": {
          "text": {
            "fractions": [
              0.9994,
              0.9994,
              0.9994,
              0.9993,
              0.9994,
            ],
          },
          "image": {
            "fractions": [
              0.0006,
              0.0006,
              0.0006,
              0.0007,
              0.0006,
            ],
          },
        },
      },
      "cumulative_layout_shift": {
        "histogramTimeseries": [
          {
            "start": 0.00,
            "end": 0.10,
            "densities": [
              0.9998,
              0.9997,
              0.9996,
              0.9996,
              0.9996,
            ],
          },
          {
            "start": 0.10,
            "end": 0.25,
            "densities": [
              0.0002,
              0.0002,
              0.0002,
              0.0002,
              0.0001,
            ],
          },
          {
            "start": 0.25,
            "densities": [
              0,
              0.0001,
              0.0002,
              0.0002,
              0.0003,
            ],
          },
        ],
        "percentilesTimeseries": {
          "p75s": [
            "0.00",
            "0.00",
            "0.00",
            "0.00",
            "0.00",
          ],
        },
      },
      "experimental_time_to_first_byte": {
        "histogramTimeseries": [
          {
            "start": 0,
            "end": 800,
            "densities": [
              0.7658,
              0.7311,
              0.7149,
              0.7169,
              0.7202,
            ],
          },
          {
            "start": 800,
            "end": 1800,
            "densities": [
              0.1488,
              0.1761,
              0.1915,
              0.1922,
              0.1909,
            ],
          },
          {
            "start": 1800,
            "densities": [
              0.0854,
              0.0928,
              0.0937,
              0.091,
              0.0889,
            ],
          },
        ],
        "percentilesTimeseries": {
          "p75s": [
            748,
            867,
            904,
            894,
            883,
          ],
        },
      },
      "form_factors": {
        "fractionTimeseries": {
          "desktop": {
            "fractions": [
              0.099,
              0.0999,
              0.1135,
              0.1266,
              0.1371,
            ],
          },
          "phone": {
            "fractions": [
              0.8748,
              0.8735,
              0.8605,
              0.8472,
              0.8371,
            ],
          },
          "tablet": {
            "fractions": [
              0.0262,
              0.0265,
              0.026,
              0.0262,
              0.0258,
            ],
          },
        },
      },
      "interaction_to_next_paint": {
        "histogramTimeseries": [
          {
            "start": 0,
            "end": 200,
            "densities": [
              0.9459,
              0.9457,
              0.9464,
              0.9464,
              0.9474,
            ],
          },
          {
            "start": 200,
            "end": 500,
            "densities": [
              0.0372,
              0.0375,
              0.0364,
              0.0364,
              0.0358,
            ],
          },
          {
            "start": 500,
            "densities": [
              0.0168,
              0.0168,
              0.0172,
              0.0172,
              0.0167,
            ],
          },
        ],
        "percentilesTimeseries": {
          "p75s": [
            77,
            78,
            78,
            78,
            77,
          ],
        },
      },
      "navigation_types": {
        "fractionTimeseries": {
          "back_forward_cache": {
            "fractions": [
              0.0784,
              0.0766,
              0.0739,
              0.0715,
              0.0693,
            ],
          },
          "prerender": {
            "fractions": [
              0.427,
              0.4156,
              0.4023,
              0.3863,
              0.3749,
            ],
          },
          "navigate": {
            "fractions": [
              0.2316,
              0.2439,
              0.252,
              0.2645,
              0.2688,
            ],
          },
          "navigate_cache": {
            "fractions": [
              0.1574,
              0.1601,
              0.1698,
              0.1789,
              0.1902,
            ],
          },
          "reload": {
            "fractions": [
              0.0823,
              0.0808,
              0.0795,
              0.0769,
              0.0753,
            ],
          },
          "restore": {
            "fractions": [
              0.0009,
              0.0008,
              0.0009,
              0.0009,
              0.001,
            ],
          },
          "back_forward": {
            "fractions": [
              0.0224,
              0.0221,
              0.0216,
              0.0209,
              0.0205,
            ],
          },
        },
      },
      "round_trip_time": {
        "histogramTimeseries": [
          {
            "start": 0,
            "end": 75,
            "densities": [
              0.2243,
              0.2288,
              0.2393,
              0.2458,
              0.2477,
            ],
          },
          {
            "start": 75,
            "end": 275,
            "densities": [
              0.5295,
              0.5367,
              0.5424,
              0.546,
              0.5511,
            ],
          },
          {
            "start": 275,
            "densities": [
              0.2462,
              0.2344,
              0.2182,
              0.2082,
              0.2013,
            ],
          },
        ],
        "percentilesTimeseries": {
          "p75s": [
            272,
            264,
            251,
            244,
            239,
          ],
        },
      },
    },
    "collectionPeriods": [
      {
        "firstDate": {
          "year": 2026,
          "month": 2,
          "day": 1,
        },
        "lastDate": {
          "year": 2026,
          "month": 2,
          "day": 28,
        },
      },
      {
        "firstDate": {
          "year": 2026,
          "month": 2,
          "day": 8,
        },
        "lastDate": {
          "year": 2026,
          "month": 3,
          "day": 7,
        },
      },
      {
        "firstDate": {
          "year": 2026,
          "month": 2,
          "day": 15,
        },
        "lastDate": {
          "year": 2026,
          "month": 3,
          "day": 14,
        },
      },
      {
        "firstDate": {
          "year": 2026,
          "month": 2,
          "day": 22,
        },
        "lastDate": {
          "year": 2026,
          "month": 3,
          "day": 21,
        },
      },
      {
        "firstDate": {
          "year": 2026,
          "month": 3,
          "day": 1,
        },
        "lastDate": {
          "year": 2026,
          "month": 3,
          "day": 28,
        },
      },
    ],
  },
  "urlNormalizationDetails": {
    "originalUrl": "https://example.com/hoge",
    "normalizedUrl": "https://example.com",
  },
};
