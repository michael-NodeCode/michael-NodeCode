/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { NodeData, NodeState } from '../types/node';

const initialState: NodeState = {
  node_data: [],
};

const nodeSlice = createSlice({
  name: 'node',
  initialState,
  reducers: {
    saveNodeData(state, action: PayloadAction<NodeData>) {
      const existingIndex = state.node_data.findIndex(
        (node) => node.id === action.payload.id
      );
      if (existingIndex > -1) {
        state.node_data[existingIndex] = action.payload;
      } else {
        state.node_data.push(action.payload);
      }
    },
    getNodeData(state, action: PayloadAction<string>) {
      const node = state.node_data.find((node) => node.id === action.payload);
      if (node) {
        state.node_data = [node];
      }
    },
  },
});

export const { saveNodeData } = nodeSlice.actions;
export default nodeSlice.reducer;
