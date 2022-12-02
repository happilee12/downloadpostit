<template>
  <v-container class="main-container" style="margin-top: 30px">
    <v-row justify="center">
      <v-btn-toggle v-model="dateRangeOption" mandatory>
        <v-btn> 1W </v-btn>
        <v-btn> 1M </v-btn>
        <v-btn> 6M </v-btn>
        <v-btn> 1Y </v-btn>
      </v-btn-toggle>
    </v-row>
    <v-row justify="center">
      <h1>{{ dateRange[0] }}~{{ dateRange[1] }}</h1>
    </v-row>
    <h2>카테고리 통계</h2>
    <v-container p-1>
      <v-row>
        <v-col md="6" p-10>
          <PieChart
            chartId="category"
            :chartData="{
              labels: overallCategoryCount.category.label,
              datasets: [
                {
                  backgroundColor: overallCategoryCount.category.color,
                  data: overallCategoryCount.category.data,
                },
              ],
            }"
          />
        </v-col>
        <v-col md="6">
          <PieChart
            chartId="category"
            :chartData="{
              labels: overallCategoryCount.subcategory.label,
              datasets: [
                {
                  backgroundColor: overallCategoryCount.subcategory.color,
                  data: overallCategoryCount.subcategory.data,
                },
              ],
            }"
          />
        </v-col>
      </v-row>
    </v-container>

    <h2>일자 통계</h2>
    <CategoryStatisticsChart
      :memoList="targetpostits"
      :dateRange="dateRange"
      :date1="dateRange[0]"
    />

    <h2>요약</h2>
    <v-sheet elevation="1" height="300" width="100%" rounded></v-sheet>
  </v-container>
</template>

<script>
const { ipcRenderer } = require("electron");
const moment = require("moment");
import BarChart from "./BarChart.vue";
import PieChart from "./PieChart.vue";
import CategoryStatisticsChart from "./Statistics/CategoryStatisticsChart.vue";

export default {
  name: "StatisticsBoard",
  components: { BarChart, PieChart, CategoryStatisticsChart },
  data: () => ({
    dateRangeOption: undefined,
    dateRange: [
      moment().subtract(7, "d").format("YYYY-MM-DD"),
      moment().add(1, "d").format("YYYY-MM-DD"),
    ],
    allPostits: [],
  }),
  mounted() {
    ipcRenderer.send("setAll");
    ipcRenderer.on("all", (event, allPostits) => {
      this.allPostits = allPostits;
      this.dateRangeOption = 0;
      console.log(this.allPostits);
    });
  },
  computed: {
    targetpostits: function () {
      return (this.allPostits.todo ? this.allPostits.todo : [])
        .concat(
          this.allPostits.deleted
            ? this.allPostits.deleted.filter(
                (p) =>
                  (p.createdAt >= this.dateRange[0] &&
                    p.createdAt < this.dateRange[1]) ||
                  (p.date >= this.dateRange[0] && p.date < this.dateRange[1])
              )
            : []
        )
        .concat(
          this.allPostits.completed
            ? this.allPostits.completed.filter(
                (p) =>
                  (p.createdAt >= this.dateRange[0] &&
                    p.createdAt < this.dateRange[1]) ||
                  (p.date >= this.dateRange[0] && p.date < this.dateRange[1])
              )
            : []
        );
    },
    dailyPostitCount: function () {
      if (!this.dateRange[0]) return undefined, undefined;
      let targetDate = this.dateRange[0];
      let dateList = [];
      let countList = [];
      while (targetDate < this.dateRange[1]) {
        dateList.push(targetDate);
        const postitsAtDate = this.targetpostits.filter((p) => {
          if (p.createdAt > targetDate) return false;
          if (p.date && p.date < targetDate) return false;
          return true;
        });
        countList.push(postitsAtDate.length);
        targetDate = moment(targetDate).add(1, "d").format("YYYY-MM-DD");
      }
      return { dateList, countList };
    },
    overallCategoryCount: function () {
      const categoryMap = {};
      for (const postit of this.targetpostits) {
        const firstline = postit.text.split("\n")[0];
        if (firstline.startsWith(".")) {
          const mainCategoryName = firstline.split(".")[1];

          // update main cateogry count
          if (!(mainCategoryName in categoryMap))
            categoryMap[mainCategoryName] = {
              count: 0,
              subcategory: {},
            };
          categoryMap[mainCategoryName].count += 1;

          // update sub cateogry count
          if (!(firstline in categoryMap[mainCategoryName].subcategory))
            categoryMap[mainCategoryName].subcategory[firstline] = 0;
          categoryMap[mainCategoryName].subcategory[firstline] += 1;
        }
        // else {
        //   // update main cateogry count
        //   if (! ('기타' in categoryMap)) {
        //     categoryMap['기타'] = {
        //       count : 0,
        //       subcategory : {}
        //     }
        //   }
        //   categoryMap['기타'].count += 1
        // }
      }

      if ("기타" in categoryMap) {
        categoryMap["기타"].subcategory = {
          ".기타": categoryMap["기타"].count,
        };
      }

      // return 데이터 구성

      const category = {
        label: Object.keys(categoryMap),
        color: this.createColorList(
          "category",
          Object.keys(categoryMap).length,
          0
        ),
        data: Object.values(categoryMap).map((c) => c.count),
      };
      const subcategory = {
        label: [],
        color: [],
        data: [],
      };
      console.log("category", category);

      let i = 0;
      for (const c in categoryMap) {
        const subcategoryObj = categoryMap[c].subcategory;
        console.log(
          i,
          subcategoryObj,
          Object.keys(subcategoryObj),
          Object.values(subcategoryObj)
        );
        subcategory.label = subcategory.label.concat(
          Object.keys(subcategoryObj)
        );
        (subcategory.color = subcategory.color.concat(
          this.createColorList(
            "subcategory",
            Object.keys(subcategoryObj).length,
            i
          )
        )),
          (subcategory.data = subcategory.data.concat(
            Object.values(subcategoryObj)
          ));
        i += 1;
        // console.log("subcategory", subcategory);
      }
      // console.log("subcategory", subcategory);

      return { category, subcategory };
    },
  },
  methods: {
    createColorList(type, length, i) {
      const categoryColorPalette = [
        ["#2196F3", "#42A5F5", "#64B5F6", "#90CAF9", "#BBDEFB", "#E3F2FD"], // blue
        ["#009688", "#26A69A", "#4DB6AC", "#80CBC4", "#B2DFDB", "#E0F2F1"], // teal
        ["#FFEB3B", "#FFEE58", "#FFF176", "#FFF59D", "#FFF9C4", "#FFFDE7"], //yellow
        ["#FF9800", "#FFA726", "#FFB74D", "#FFE0B2", "#FFF3E0", "#FFCC80"], // orange
        ["#673AB7", "#7E57C2", "#9575CD", "#B39DDB", "#D1C4E9", "#EDE7F6"], // purple
        ["#E91E63", "#EC407A", "#F06292", "#F48FB1", "#F8BBD0", "#FCE4EC"], // pink
        ["#795548", "#8D6E63", "#A1887F", "#BCAAA4", "#D7CCC8", "#EFEBE9"], // brown
        ["#607D8B", "#78909C", "#90A4AE", "#B0BEC5", "#CFD8DC", "#ECEFF1"], // brown
      ];
      if (type == "category") {
        let colorList = [];
        let index = 0;
        while (index < length) {
          colorList.push(
            categoryColorPalette[index % categoryColorPalette.length][0]
          );
          index += 1;
        }
        return colorList;
      } else if (type == "subcategory") {
        const targetColorFamily =
          categoryColorPalette[i % categoryColorPalette.length];
        // console.log("targetColorFamily", targetColorFamily);
        let colorList = [];
        let index = 0;
        while (index < length) {
          colorList.push(targetColorFamily[index % targetColorFamily.length]);
          index += 1;
          // console.log("colorList", colorList);
        }
        return colorList;
      }
    },
  },
  watch: {
    dateRangeOption: {
      handler(value, oldValue) {
        switch (value) {
          case 0:
            this.dateRange = [
              moment().subtract(7, "d").format("YYYY-MM-DD"),
              moment().add(1, "d").format("YYYY-MM-DD"),
            ];
            break;
          case 1:
            this.dateRange = [
              moment().subtract(1, "M").format("YYYY-MM-DD"),
              moment().add(1, "d").format("YYYY-MM-DD"),
            ];
            break;
          case 2:
            this.dateRange = [
              moment().subtract(6, "M").format("YYYY-MM-DD"),
              moment().add(1, "d").format("YYYY-MM-DD"),
            ];
            break;
          case 3:
            this.dateRange = [
              moment().subtract(1, "y").format("YYYY-MM-DD"),
              moment().add(1, "d").format("YYYY-MM-DD"),
            ];
            break;
        }
      },
    },
  },
};
</script>

<style lang="scss">
@import "../assets/common";
.expansion-panel {
  margin: 10px;
  padding: 10px;
  border-radius: 4px;
  box-shadow: 0px 3px 1px -2px rgba(0, 0, 0, 0.2),
    0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12);
  .expansion-panel-header {
    padding: 5px;
    margin-top: 6px;
    position: relative;

    .expand-more-icon {
      width: 22px;
      position: absolute;
      right: 10px;
      transition: all 0.3s linear;
      &.isToggled {
        transform: rotate(-180deg);
      }
    }
  }
  .expansion-panel-body {
    margin-top: 10px;
    height: 0px;
    opacity: 0;
    transition: 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
    position: relative;

    &.isToggled {
      height: 300px;
      opacity: 1;
      display: block;
    }

    .export-textarea {
      padding: 10px 20px;
      width: 100%;
      height: 290px;
      background: #fdfad2;
    }

    .copy-button {
      position: absolute;
      bottom: 12px;
      right: 10px;
      background: #fed054;
    }
  }
}
.postit-button-area {
  position: absolute;
  bottom: 10px;
  right: 14px;
}
</style>
