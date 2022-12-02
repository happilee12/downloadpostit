export const setCategory = (memoData) => {
  if (memoData.text[0] == ".") {
    const firstLine = memoData.text.split("\n")[0];
    memoData.category = firstLine.split(".")[1];
    memoData.subCategory = firstLine;
  } else {
    memoData.category = undefined;
    memoData.subCategory = undefined;
  }
  return memoData;
};
