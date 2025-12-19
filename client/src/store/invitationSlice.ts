import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import api from '../lib/api';

interface Invitation {
  id: string;
  type: string;
  description: string;
  boardId: string;
  userId: string;
  status: string;
  metadata?: {
    token: string;
    invitedEmail: string;
  };
  createdAt: string;
  board: {
    id: string;
    name: string;
    description: string;
  };
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface InvitationState {
  invitations: Invitation[];
  loading: boolean;
  error: string | null;
  inviteLoading: boolean;
  inviteError: string | null;
  inviteSuccess: string | null;
}

const initialState: InvitationState = {
  invitations: [],
  loading: false,
  error: null,
  inviteLoading: false,
  inviteError: null,
  inviteSuccess: null,
};

// Async thunks
export const inviteMember = createAsyncThunk(
  'invitation/inviteMember',
  async ({ email, boardId }: { email: string; boardId: string }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        '/api/invitation/invite',
        { email, boardId }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send invitation');
    }
  }
);

export const acceptInvitation = createAsyncThunk(
  'invitation/acceptInvitation',
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/invitation/accept/${token}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to accept invitation');
    }
  }
);

export const acceptInvitationById = createAsyncThunk(
  'invitation/acceptInvitationById',
  async (invitationId: string, { rejectWithValue }) => {
    try {
      const response = await api.post(`/api/invitation/accept-by-id/${invitationId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to accept invitation');
    }
  }
);

export const getPendingInvitations = createAsyncThunk(
  'invitation/getPendingInvitations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/invitation/pending');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch invitations');
    }
  }
);

const invitationSlice = createSlice({
  name: 'invitation',
  initialState,
  reducers: {
    clearInviteError: (state) => {
      state.inviteError = null;
    },
    clearInviteSuccess: (state) => {
      state.inviteSuccess = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Invite member
    builder
      .addCase(inviteMember.pending, (state) => {
        state.inviteLoading = true;
        state.inviteError = null;
        state.inviteSuccess = null;
      })
      .addCase(inviteMember.fulfilled, (state, action: PayloadAction<any>) => {
        state.inviteLoading = false;
        state.inviteSuccess = action.payload.message || 'Invitation sent successfully';
      })
      .addCase(inviteMember.rejected, (state, action) => {
        state.inviteLoading = false;
        state.inviteError = action.payload as string;
      });

    // Accept invitation
    builder
      .addCase(acceptInvitation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(acceptInvitation.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(acceptInvitation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Accept invitation by ID
    builder
      .addCase(acceptInvitationById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(acceptInvitationById.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        // Remove the accepted invitation from the list
        state.invitations = state.invitations.filter(inv => inv.id !== action.payload.invitationId);
      })
      .addCase(acceptInvitationById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get pending invitations
    builder
      .addCase(getPendingInvitations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPendingInvitations.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.invitations = action.payload.data;
      })
      .addCase(getPendingInvitations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearInviteError, clearInviteSuccess, clearError } = invitationSlice.actions;
export default invitationSlice.reducer;
