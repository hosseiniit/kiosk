import { createSlice } from "@reduxjs/toolkit";

const initialState = {};

const formSlice = createSlice({
  name: "form",
  initialState: {},
  reducers: {
    _rootData: (state, action) => {
      return { ...state, ...action.payload };
    },
    globalValue: (state, action) => {
      return { ...state, ...action.payload };
    },
    clearFormData: (state, action) => {
      const fieldsToRemove = action.payload || [];
      const newState = { ...state };

      fieldsToRemove.forEach((field) => {
        delete newState[field];
      });

      return newState;
    },
  },
});

export const { _rootData, clearFormData, globalValue } = formSlice.actions;

export default formSlice.reducer;
