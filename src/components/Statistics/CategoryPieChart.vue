<template>
  <v-row>
    <v-col md="6" p-10>
      <PieChart chartId="1" :chartData="pieChartData.category" />
    </v-col>
    <v-col md="6">
      <PieChart chartId="2" :chartData="pieChartData.subcategory" />
    </v-col>
  </v-row>
</template>

<script>
import PieChart from "@/components/VueChart/PieChart.vue";
import { getCategoryRatioDataset } from "@/js/categoryStstisticsChart";
export default {
  name: "CategoryPieChart",
  components: { PieChart },
  props: {
    memoList: {
      type: Array,
    },
    dateRange: {
      type: Array,
      default: [],
    },
  },
  computed: {
    pieChartData: function () {
      try {
        const { category, subcategory } = getCategoryRatioDataset(
          this.memoList
        );
        return {
          category,
          subcategory,
        };
      } catch (e) {
        console.log(e);
        return {
          labels: [],
          datasets: [],
        };
      }
    },
  },
};
</script>

<style lang="scss"></style>
