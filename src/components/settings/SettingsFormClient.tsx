'use client';

import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { ThemeToggle } from '../navigation/ThemeToggle';
import { updateProfileAction, deleteAccountAction } from '@/actions/auth';
import { updatePreferencesAction, changePasswordAction } from '@/actions/settings';
import { useToast } from '../providers/ToastProvider';
import {
  User,
  Shield,
  Bell,
  Sun,
  Lock,
  Trash2,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

interface SettingsFormClientProps {
  user: {
    id: string;
    name: string;
    username: string;
    email: string;
    bio: string | null;
    timezone: string;
    primaryGoal: string | null;
    weeklyTarget: number;
    profilePrivate: boolean;
    workoutsPrivate: boolean;
    notifyWorkouts: boolean;
    notifyReactions: boolean;
    notifyNudges: boolean;
    notifyChallenges: boolean;
  };
}

export function SettingsFormClient({ user }: SettingsFormClientProps) {
  const { error: toastError, success: toastSuccess } = useToast();

  // Profile fields
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio || '');
  const [timezone, setTimezone] = useState(user.timezone || 'UTC');
  const [primaryGoal, setPrimaryGoal] = useState(user.primaryGoal || 'Build consistency');
  const [weeklyTarget, setWeeklyTarget] = useState(user.weeklyTarget || 4);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Privacy & Notifications
  const [profilePrivate, setProfilePrivate] = useState(user.profilePrivate);
  const [workoutsPrivate, setWorkoutsPrivate] = useState(user.workoutsPrivate);
  const [notifyWorkouts, setNotifyWorkouts] = useState(user.notifyWorkouts);
  const [notifyReactions, setNotifyReactions] = useState(user.notifyReactions);
  const [notifyNudges, setNotifyNudges] = useState(user.notifyNudges);
  const [notifyChallenges, setNotifyChallenges] = useState(user.notifyChallenges);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Delete modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSavingProfile(true);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('bio', bio);
    formData.append('timezone', timezone);
    formData.append('primaryGoal', primaryGoal);
    formData.append('weeklyTarget', weeklyTarget.toString());

    try {
      const res = await updateProfileAction(formData);
      if (res?.error) {
        toastError(res.error);
      } else {
        toastSuccess('Profile updated successfully.');
      }
    } catch {
      toastError('Failed to save profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSavePreferences = async () => {
    setIsSavingPreferences(true);

    const formData = new FormData();
    formData.append('profilePrivate', profilePrivate.toString());
    formData.append('workoutsPrivate', workoutsPrivate.toString());
    formData.append('notifyWorkouts', notifyWorkouts.toString());
    formData.append('notifyReactions', notifyReactions.toString());
    formData.append('notifyNudges', notifyNudges.toString());
    formData.append('notifyChallenges', notifyChallenges.toString());

    try {
      const res = await updatePreferencesAction(formData);
      if (res?.error) {
        toastError(res.error);
      } else {
        toastSuccess('Preferences saved.');
      }
    } catch {
      toastError('Failed to save preferences.');
    } finally {
      setIsSavingPreferences(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsChangingPassword(true);

    const formData = new FormData();
    formData.append('currentPassword', currentPassword);
    formData.append('newPassword', newPassword);
    formData.append('confirmPassword', confirmPassword);

    try {
      const res = await changePasswordAction(formData);
      if (res?.error) {
        toastError(res.error);
      } else {
        toastSuccess('Password updated successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch {
      toastError('Failed to change password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccountAction();
    } catch {
      toastError('Failed to delete account.');
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Account / Profile Details */}
      <Card className="p-6 space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-border">
          <User className="w-4 h-4 text-cync-green" />
          <h2 className="text-base font-semibold text-foreground">Profile Information</h2>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Display Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              label="Username"
              value={user.username}
              disabled
              helperText="Usernames cannot be changed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              value={user.email}
              disabled
              helperText="Account primary email"
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-muted/40 border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-cync-green"
              >
                <option value="UTC">UTC (Coordinated Universal Time)</option>
                <option value="America/New_York">Eastern Time (US & Canada)</option>
                <option value="America/Chicago">Central Time (US & Canada)</option>
                <option value="America/Denver">Mountain Time (US & Canada)</option>
                <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                <option value="Europe/London">London / GMT</option>
                <option value="Europe/Paris">Central European Time</option>
                <option value="Asia/Kolkata">India Standard Time (IST)</option>
                <option value="Asia/Tokyo">Tokyo / JST</option>
                <option value="Australia/Sydney">Sydney / AEST</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Primary Intention
              </label>
              <select
                value={primaryGoal}
                onChange={(e) => setPrimaryGoal(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-muted/40 border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-cync-green"
              >
                <option value="Build consistency">Build consistency</option>
                <option value="Get stronger">Get stronger</option>
                <option value="Improve fitness">Improve fitness</option>
                <option value="Lose weight">Lose weight</option>
                <option value="Stay active">Stay active</option>
                <option value="General health">General health</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Weekly Target ({weeklyTarget} days)
              </label>
              <div className="flex items-center gap-1 pt-1">
                {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                  <button
                    type="button"
                    key={num}
                    onClick={() => setWeeklyTarget(num)}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md border transition-all ${
                      weeklyTarget === num
                        ? 'bg-cync-green text-white border-cync-green'
                        : 'bg-muted/40 border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Bio
            </label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={200}
              placeholder="Short bio or personal motto..."
              className="w-full px-3.5 py-2 text-sm bg-muted/40 border border-border rounded-lg text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-cync-green resize-none"
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" size="sm" isLoading={isSavingProfile}>
              <span>Save Changes</span>
            </Button>
          </div>
        </form>
      </Card>

      {/* 2. Appearance */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-border">
          <Sun className="w-4 h-4 text-amber-500" />
          <h2 className="text-base font-semibold text-foreground">Appearance</h2>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-semibold text-foreground">Theme Preference</h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Choose between dark charcoal, clean light mode, or system sync.
            </p>
          </div>
          <div className="w-full sm:w-64">
            <ThemeToggle />
          </div>
        </div>
      </Card>

      {/* 3. Privacy & Notifications Preferences */}
      <Card className="p-6 space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-border">
          <Bell className="w-4 h-4 text-blue-400" />
          <h2 className="text-base font-semibold text-foreground">Privacy & Notifications</h2>
        </div>

        {/* Privacy options */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Privacy
          </h4>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
            <div>
              <span className="text-xs font-semibold text-foreground block">
                Private Profile
              </span>
              <span className="text-[11px] text-muted-foreground">
                Only squad members can see your detailed profile.
              </span>
            </div>
            <input
              type="checkbox"
              checked={profilePrivate}
              onChange={(e) => setProfilePrivate(e.target.checked)}
              className="w-4 h-4 rounded text-cync-green border-border focus:ring-cync-green"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
            <div>
              <span className="text-xs font-semibold text-foreground block">
                Private Workouts
              </span>
              <span className="text-[11px] text-muted-foreground">
                Hide detailed notes and exercise sets from squad feed.
              </span>
            </div>
            <input
              type="checkbox"
              checked={workoutsPrivate}
              onChange={(e) => setWorkoutsPrivate(e.target.checked)}
              className="w-4 h-4 rounded text-cync-green border-border focus:ring-cync-green"
            />
          </div>
        </div>

        {/* Notification options */}
        <div className="space-y-3 pt-2 border-t border-border">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            In-App Notifications
          </h4>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
            <div>
              <span className="text-xs font-semibold text-foreground block">
                Squad Workout Activity
              </span>
              <span className="text-[11px] text-muted-foreground">
                Notify when a squad member completes a session.
              </span>
            </div>
            <input
              type="checkbox"
              checked={notifyWorkouts}
              onChange={(e) => setNotifyWorkouts(e.target.checked)}
              className="w-4 h-4 rounded text-cync-green border-border focus:ring-cync-green"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
            <div>
              <span className="text-xs font-semibold text-foreground block">
                Reactions
              </span>
              <span className="text-[11px] text-muted-foreground">
                Notify when friends react to your workouts.
              </span>
            </div>
            <input
              type="checkbox"
              checked={notifyReactions}
              onChange={(e) => setNotifyReactions(e.target.checked)}
              className="w-4 h-4 rounded text-cync-green border-border focus:ring-cync-green"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
            <div>
              <span className="text-xs font-semibold text-foreground block">
                Accountability Nudges
              </span>
              <span className="text-[11px] text-muted-foreground">
                Notify when someone nudges you to show up.
              </span>
            </div>
            <input
              type="checkbox"
              checked={notifyNudges}
              onChange={(e) => setNotifyNudges(e.target.checked)}
              className="w-4 h-4 rounded text-cync-green border-border focus:ring-cync-green"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
            <div>
              <span className="text-xs font-semibold text-foreground block">
                Squad Challenges
              </span>
              <span className="text-[11px] text-muted-foreground">
                Notify when a new squad challenge is created.
              </span>
            </div>
            <input
              type="checkbox"
              checked={notifyChallenges}
              onChange={(e) => setNotifyChallenges(e.target.checked)}
              className="w-4 h-4 rounded text-cync-green border-border focus:ring-cync-green"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="button"
            size="sm"
            onClick={handleSavePreferences}
            isLoading={isSavingPreferences}
          >
            <span>Save Preferences</span>
          </Button>
        </div>
      </Card>

      {/* 4. Change Password */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-border">
          <Lock className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-base font-semibold text-foreground">Change Password</h2>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <Input
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />

          <Input
            label="New Password"
            type="password"
            placeholder="At least 8 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <Input
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <Button type="submit" size="sm" isLoading={isChangingPassword}>
            <span>Update Password</span>
          </Button>
        </form>
      </Card>

      {/* 5. Danger Zone: Delete Account */}
      <Card className="p-6 border-red-500/20 bg-red-500/5 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-red-500/20">
          <Trash2 className="w-4 h-4 text-red-400" />
          <h2 className="text-base font-semibold text-red-400">Danger Zone</h2>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-semibold text-foreground">Delete Account</h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Permanently delete your profile, workout history, goals, and squad memberships.
            </p>
          </div>

          <Button
            variant="danger"
            size="sm"
            onClick={() => setIsDeleteModalOpen(true)}
            className="shrink-0"
          >
            <span>Delete Account</span>
          </Button>
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Your Account"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-300">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <p>
              This action is permanent and irreversible. All your workouts, streaks, personal goals, and data will be erased immediately.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={handleDeleteAccount}
              isLoading={isDeleting}
            >
              Permanently Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
