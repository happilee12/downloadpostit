<template>
  <v-container>
    <v-container v-for="(categoryData, categoryName) in dataByCategory">
      <h3>#{{ categoryName }}</h3>
      <template v-for="(subcategoryData, subcategoryName) in categoryData">
        <h4 class="subcategory-title">{{ subcategoryName }}</h4>
        <v-container
          class="memo-data-area"
          v-for="(memoObject, index) in subcategoryData"
        >
          <p class="created-at-text">{{ memoObject.createdAt }}</p>
          <p style="white-space: break-spaces">{{ memoObject.text }}</p>
        </v-container>
      </template>
    </v-container>
  </v-container>
</template>

<script>
import { memoGroupedByCategory } from "@/js/categoryStstisticsChart";
export default {
  name: "Summary",
  props: {
    memoItems: {
      type: Array,
    },
  },
  computed: {
    dataByCategory: function () {
      try {
        const groupedMemo = memoGroupedByCategory(this.memoItems);
        const { undefined, ...memoWithCategory } = groupedMemo;
        console.log("memoWithCategory", memoWithCategory);

        return memoWithCategory;
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

<style lang="scss">
.subcategory-title {
  margin-left: 10px;
  margin-top: 10px;
}

.memo-data-area {
  padding: 3px;
  margin-left: 10px;
}

.created-at-text {
  font-size: small;
  color: #3b4046;
  margin-bottom: 3px !important;
}
</style>
