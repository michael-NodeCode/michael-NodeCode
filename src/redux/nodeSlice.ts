/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { NodeData, NodeState } from '../types/node';

const initialState: NodeState = {
  nodeData: [],
};

const nodeSlice = createSlice({
  name: 'node',
  initialState,
  reducers: {
    saveNodeData(state, action: PayloadAction<NodeData>) {
      const existingIndex = state.nodeData.findIndex(
        (node) => node.id === action.payload.id
      );
      if (existingIndex > -1) {
        state.nodeData[existingIndex] = action.payload;
      } else {
        state.nodeData.push(action.payload);
      }
    },
    getNodeData(state, action: PayloadAction<string>) {
      const node = state.nodeData.find((node) => node.id === action.payload);
      if (node) {
        state.nodeData = [node];
      }
    },
  },
});

export const { saveNodeData } = nodeSlice.actions;
export default nodeSlice.reducer;
