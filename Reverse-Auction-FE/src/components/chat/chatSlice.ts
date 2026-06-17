import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface ChatState {
  isOpen: boolean;
  selectedContactId: number | null;
  isComplaintMode: boolean;
}

const initialState: ChatState = {
  isOpen: false,
  selectedContactId: null,
  isComplaintMode: false,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    openChat: (state) => {
      state.isOpen = true;
    },
    closeChat: (state) => {
      state.isOpen = false;
    },
    toggleChat: (state) => {
      state.isOpen = !state.isOpen;
    },
    selectContact: (
      state,
      action: PayloadAction<{ contactId: number; isComplaintMode?: boolean }>,
    ) => {
      state.selectedContactId = action.payload.contactId;
      state.isComplaintMode = !!action.payload.isComplaintMode;
      state.isOpen = true;
    },
    clearChatSelection: (state) => {
      state.selectedContactId = null;
      state.isComplaintMode = false;
    },
  },
});

export const { openChat, closeChat, toggleChat, selectContact, clearChatSelection } =
  chatSlice.actions;
export default chatSlice.reducer;
