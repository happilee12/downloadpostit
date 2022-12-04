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

const PALETTE_LENGTH = categoryColorPalette.length;

export const categoryColor = (index) => {
  return categoryColorPalette[index % PALETTE_LENGTH][0];
  // return categoryColorPalette.map((item) => item[0]);
};

export const subcategoryColor = (index, subindex) => {
  const colorLength = categoryColorPalette[index % PALETTE_LENGTH].length;
  return categoryColorPalette[index % PALETTE_LENGTH][subindex % colorLength];
};

/** Object의 value중 condition에 맞는것만 반환 */
export const filterObjectValues = (targetObject, condition) => {
  /** targetObject가 비어있는 경우 에러핸들링 */
  if (!targetObject) {
    return targetObject;
  }

  const newObject = {};
  Object.keys(targetObject).forEach((objectKey) => {
    const objectItem = targetObject[objectKey];
    /** condition 맞는 아이템만 newObject에 추가  */
    if (condition(objectItem)) {
      newObject[objectKey] = objectItem;
    }
  });
  return newObject;
};
