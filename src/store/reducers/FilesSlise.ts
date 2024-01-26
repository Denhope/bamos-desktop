// @ts-nocheck
import { createSlice } from "@reduxjs/toolkit";
import { searchFiles, uploadFile } from "@/utils/api/thunks";
// import { uploadFile, searchFiles } from './filesThunks';

interface FilesState {
  searchResults: [];
  uploadStatus: "idle" | "loading" | "succeeded" | "failed";
  uploadError: any;
  searchStatus: "idle" | "loading" | "succeeded" | "failed";
}

const initialState: FilesState = {
  searchResults: [],
  uploadStatus: "idle",
  uploadError: null,
  searchStatus: "idle",
};

const filesSlice = createSlice({
  name: "files",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(uploadFile.pending, (state) => {
        state.uploadStatus = "loading";
        state.uploadError = null;
      })
      .addCase(uploadFile.fulfilled, (state, action) => {
        state.uploadStatus = "succeeded";
        alert(action.payload);
      })
      .addCase(uploadFile.rejected, (state, action) => {
        state.uploadStatus = "failed";
        state.uploadError = action.payload;
      })
      .addCase(searchFiles.pending, (state) => {
        state.searchStatus = "loading";
      })
      .addCase(searchFiles.fulfilled, (state, action) => {
        state.searchStatus = "succeeded";
        state.searchResults = action.payload;
      })
      .addCase(searchFiles.rejected, (state) => {
        state.searchStatus = "failed";
      });
  },
});

export default filesSlice.reducer;
