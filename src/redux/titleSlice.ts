import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TitleState {
  title: string | null;
}

const initialState: TitleState = {
  title: null, 
};

const titleSlice = createSlice({
  name: 'title',
  initialState,
  reducers: {
    setTitle: (state, action: PayloadAction<string>) => {
      state.title = action.payload;
    },
    resetTitle: (state) => {
      state.title = null; 
    },
  },
});

export const { setTitle, resetTitle } = titleSlice.actions;
export default titleSlice.reducer;
