import { MemoStatus } from "@/js/constants";
const { ipcRenderer } = require("electron");
import deleteSoundEffect from "@/assets/delete.mp3";
const deleteSound = new Audio(deleteSoundEffect);
const moment = require("moment");

let memoInstance = null;
export class Memo {
  constructor() {
    if (memoInstance) {
      console.log("Return existing Memo instance : ");
      return memoInstance;
    }

    console.log("Constructing a new Memo instance : ");
    ipcRenderer.send("setAll");
    ipcRenderer.once("all", (event, allData) => {
      this.todo = allData.todo;
      this.deleted = allData.deleted;
      this.completed = allData.completed;
      console.log("Constructing Memo instance data : ", this.allData);
    });
    memoInstance = this;
  }
}

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
