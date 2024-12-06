import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DateState {
    currentDate: string; 
}

const initialState: DateState = {
    currentDate: new Date().toISOString().split('T')[0], 
};

const dateSlice = createSlice({
    name: 'date',
    initialState,
    reducers: {
        setDate: (state, action: PayloadAction<string>) => {
            state.currentDate = action.payload;
        },
        resetDate: (state) => {
            state.currentDate = initialState.currentDate;
        },
        incrementDate: (state) => {
            const nextDate = new Date(state.currentDate);
            nextDate.setDate(nextDate.getDate() + 1);
            state.currentDate = nextDate.toISOString().split('T')[0];
        },
        decrementDate: (state) => {
            const prevDate = new Date(state.currentDate);
            prevDate.setDate(prevDate.getDate() - 1);
            state.currentDate = prevDate.toISOString().split('T')[0];
        },
    },
});

export const { setDate, resetDate, incrementDate, decrementDate } = dateSlice.actions;
export default dateSlice.reducer;
