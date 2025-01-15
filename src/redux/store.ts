import { configureStore, combineReducers } from '@reduxjs/toolkit';
import dateReducer from './dateSlice';
import titleReducer from './titleSlice';
import nodeReducer from './nodeSlice';

const rootReducer = combineReducers({
    date: dateReducer,
    title: titleReducer,
    node: nodeReducer,
});

export const store = configureStore({
    reducer: rootReducer,
});

export type AppStore = typeof store;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
