const moment = require("moment");
import { categoryColor, subcategoryColor } from "@/js/index";

export const getDateListInBetween = (startDate, endDate) => {
  try {
    let targetDate = startDate;
    let dateList = [];
    while (targetDate < endDate) {
      dateList.push(targetDate);
      targetDate = moment(targetDate).add(1, "d").format("YYYY-MM-DD");
    }

    return dateList;
  } catch (e) {
    console.error(e);
    return [];
  }
};

export const memoGroupedByCategory = (memoList) => {
  const categoryGrouped = groupObjectListByKey(memoList, "category");
  const result = {};
  Object.keys(categoryGrouped).forEach((categoryName, index) => {
    result[categoryName] = groupObjectListByKey(
      categoryGrouped[categoryName],
      "subCategory"
    );
  });
  return result;
};

/**
 * vue-chartjs linechart dataset 형태로 변환
 */
export const getCategoryRatioDataset = (memoList) => {
  const categoryBackgroundColorList = [];
  const categoryDataList = [];
  const categoryList = [];
  const subcategoryBackgroundColorList = [];
  const subcategoryDataList = [];
  const subcategoryList = [];

  const categoryGrouped = groupObjectListByKey(memoList, "category");
  Object.keys(categoryGrouped).forEach((categoryName, index) => {
    categoryList.push(categoryName);
    categoryBackgroundColorList.push(categoryColor(index));
    categoryDataList.push(categoryGrouped[categoryName].length);

    /**
     * subcategory정보 구성
     */
    const subcategoryGrouped = groupObjectListByKey(
      categoryGrouped[categoryName],
      "subCategory"
    );
    Object.keys(subcategoryGrouped).forEach((subcategoryName, subindex) => {
      subcategoryList.push(subcategoryName);
      subcategoryBackgroundColorList.push(subcategoryColor(index, subindex));
      subcategoryDataList.push(subcategoryGrouped[subcategoryName].length);
    });
  });
  const category = {
    labels: categoryList,
    datasets: [
      {
        backgroundColor: categoryBackgroundColorList,
        data: categoryDataList,
      },
    ],
  };
  const subcategory = {
    labels: subcategoryList,
    datasets: [
      {
        backgroundColor: subcategoryBackgroundColorList,
        data: subcategoryDataList,
      },
    ],
  };

  return {
    category,
    subcategory,
  };
};

/**
 * vue-chartjs linechart dataset 형태로 변환
 */
export const getTimeSeriesCetegoryCountDataset = (memoList, dateList) => {
  /**
   * lineCharDatasets 구성
   * {
   *  [카테고리명] : [일자별 메모 수]
   *  ex) "검색" : [ 2, 4, 1, 1, 2, ... ]
   * }
   */
  const lineCharDatasets = {};
  const categoryList = [...new Set(memoList.map((item) => item.category))];
  for (const categorName of categoryList) {
    lineCharDatasets[categorName] = Array(dateList.length).fill(0);
  }
  /** 일자별로 각 카테고리의 메모 수 구성 */
  for (const [index, targetDate] of dateList.entries()) {
    const activeMemoList = getTargetMemoList(memoList, targetDate);
    /** group by category */
    const grouped = groupObjectListByKey(activeMemoList, "category");
    for (const category in grouped) {
      lineCharDatasets[category][index] = grouped[category].length;
    }
  }

  /**
   * chartjs dataset 형태로 변환
   * [
   *   { label, borderColor, backgroundColor, borderWidth, data}
   * ]
   */
  const result = [];
  Object.keys(lineCharDatasets).forEach((categoryData, index) => {
    result.push({
      label: categoryData,
      borderColor: categoryColor(index),
      backgroundColor: categoryColor(index),
      borderWidth: 1,
      pointRadius: 1,
      data: lineCharDatasets[categoryData],
    });
  });
  return result;
};

/**
 * @returns 주어진 시점에 active한 메모 리스트
 */
const getTargetMemoList = (memoList, targetDate) => {
  const filteredMemo = memoList.filter((p) => {
    if (p.createdAt > targetDate) return false;
    if (p.date && p.date < targetDate) return false;
    return true;
  });
  // console.log("filteredMemo", filteredMemo);
  return filteredMemo;
};

const groupObjectListByKey = (targetObjectList, key) => {
  // console.log(targetObjectList, key);
  return targetObjectList.reduce((accumulator, currentValue) => {
    accumulator[currentValue[key]] = accumulator[currentValue[key]] || [];
    accumulator[currentValue[key]].push(currentValue);
    return accumulator;
  }, Object.create(null));
};
