import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { X, Mail, UserPlus } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { inviteMember, clearInviteError, clearInviteSuccess } from '../../store/invitationSlice';

interface MemberInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardId: string;
  boardName: string;
  currentMembers: any[];
}

const MemberInviteModal: React.FC<MemberInviteModalProps> = ({
  isOpen,
  onClose,
  boardId,
  boardName,
  currentMembers
}) => {
  const dispatch = useAppDispatch();
  const { inviteLoading, inviteError, inviteSuccess } = useAppSelector((state: any) => state.invitation);
  const [email, setEmail] = useState('');

  const handleInvite = async () => {
    if (!email.trim()) {
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return;
    }

    // Check if user is already a member
    const isAlreadyMember = currentMembers.some(member =>
      member.user?.email?.toLowerCase() === email.toLowerCase()
    );

    if (isAlreadyMember) {
      return;
    }

    try {
      await dispatch(inviteMember({ email, boardId })).unwrap();
      setEmail('');
      
      // Close modal after success
      setTimeout(() => {
        onClose();
        dispatch(clearInviteSuccess());
      }, 2000);
      
    } catch (error) {
      // Error is handled by Redux state
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleInvite();
    }
  };

  // Clear messages when modal closes
  useEffect(() => {
    if (!isOpen) {
      dispatch(clearInviteError());
      dispatch(clearInviteSuccess());
    }
  }, [isOpen, dispatch]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Invite Members
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter email to invite"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
                disabled={inviteLoading}
              />
            </div>
          </div>

          {/* Board Info */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Inviting to board: <span className="font-medium text-gray-900 dark:text-gray-100">{boardName}</span>
            </p>
          </div>

          {/* Current Members Preview */}
          {currentMembers.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current Members ({currentMembers.length})
              </p>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {currentMembers.slice(0, 3).map((member, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                      {member.user?.name?.charAt(0)?.toUpperCase() ||
                       member.user?.email?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <span>{member.user?.name || member.user?.email || 'Unknown User'}</span>
                  </div>
                ))}
                {currentMembers.length > 3 && (
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    +{currentMembers.length - 3} more members
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Error Message */}
          {inviteError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
              <p className="text-sm text-red-600 dark:text-red-400">{inviteError}</p>
            </div>
          )}

          {/* Success Message */}
          {inviteSuccess && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-3">
              <p className="text-sm text-green-600 dark:text-green-400">{inviteSuccess}</p>
            </div>
          )}

          {/* Footer */}
          <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={inviteLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleInvite}
              disabled={inviteLoading || !email.trim()}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {inviteLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Invite
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberInviteModal;
