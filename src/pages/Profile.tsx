import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Camera, Save, User, Settings, Trophy, Target, Clock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useGamification } from '../hooks/useGamification';
import { supabase } from '../lib/supabase';
import { UserPreferences } from '../types';
import { toast } from 'sonner';

const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  preferences: z.object({
    language: z.string(),
    theme: z.enum(['light', 'dark', 'auto']),
    dyslexic_font: z.boolean(),
    high_contrast: z.boolean(),
    reduced_motion: z.boolean(),
    text_size: z.enum(['small', 'medium', 'large']),
    voice_enabled: z.boolean(),
  }),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const Profile = () => {
  const { t } = useTranslation();
  const { supabaseUser, updateProfile } = useAuth();
  const { profile: gamificationProfile } = useGamification();
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: supabaseUser?.user_metadata?.full_name || '',
      preferences: (supabaseUser?.user_metadata?.preferences as UserPreferences) || {
        language: 'en',
        theme: 'light',
        dyslexic_font: false,
        high_contrast: false,
        reduced_motion: false,
        text_size: 'medium',
        voice_enabled: true,
      },
    },
  });

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !supabaseUser) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('Avatar must be less than 5MB');
      return;
    }

    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${supabaseUser.id}_${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      if (data.publicUrl) {
        await updateProfile({ avatar_url: data.publicUrl });
        toast.success('Avatar updated successfully');
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (!supabaseUser) return;

    setLoading(true);
    try {
      await updateProfile({
        full_name: data.full_name,
        preferences: data.preferences,
      });

      // Update user metadata in Supabase Auth
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: data.full_name,
          preferences: data.preferences,
        },
      });

      if (error) throw error;

      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!supabaseUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"/>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="heading-xl text-neutral-900">{t('profile.title')}</h1>
        <p className="body-lg text-neutral-600 mt-2">{t('profile.subtitle')}</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1"
        >
          <div className="card p-6 text-center">
            <div className="relative inline-block">
              <img
                src={supabaseUser.user_metadata?.avatar_url || 'https://via.placeholder.com/150x150/e5e7eb/6b7280?text=Avatar'}
                alt="Avatar"
                className="w-24 h-24 rounded-full object-cover mx-auto mb-4"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute bottom-0 right-0 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {uploadingAvatar ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera className="w-4 h-4 text-white" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>

            <h3 className="heading-md text-neutral-900 mb-1">
              {supabaseUser.user_metadata?.full_name || 'User'}
            </h3>
            <p className="body-sm text-neutral-600 mb-2">{supabaseUser.email}</p>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-sm font-medium">
              {supabaseUser.user_metadata?.role || 'student'}
            </div>

            {/* Gamification Stats for Students */}
            {supabaseUser.user_metadata?.role === 'student' && gamificationProfile && (
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium">Level {gamificationProfile.level}</span>
                  </div>
                  <span className="text-sm text-neutral-600">{gamificationProfile.xp} XP</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium">Streak</span>
                  </div>
                  <span className="text-sm text-neutral-600">{gamificationProfile.streak_days} days</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium">Study Time</span>
                  </div>
                  <span className="text-sm text-neutral-600">
                    {Math.floor((gamificationProfile.total_study_time || 0) / 60)}h
                  </span>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Profile Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="card p-6">
              <div className="flex items-center space-x-2 mb-6">
                <User className="w-5 h-5 text-primary-600" />
                <h2 className="heading-md text-neutral-900">{t('profile.personalInfo')}</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    {t('profile.fullName')}
                  </label>
                  <input
                    {...register('full_name')}
                    type="text"
                    className="input-field"
                    placeholder="Enter your full name"
                  />
                  {errors.full_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.full_name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    {t('profile.email')}
                  </label>
                  <input
                    type="email"
                    value={supabaseUser.email}
                    disabled
                    className="input-field opacity-50 cursor-not-allowed"
                  />
                  <p className="mt-1 text-xs text-neutral-500">
                    Email cannot be changed. Contact support if needed.
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Settings className="w-5 h-5 text-primary-600" />
                <h2 className="heading-md text-neutral-900">{t('profile.preferences')}</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    {t('profile.theme')}
                  </label>
                  <select
                    {...register('preferences.theme')}
                    className="input-field"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    {t('profile.textSize')}
                  </label>
                  <select
                    {...register('preferences.text_size')}
                    className="input-field"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        {...register('preferences.dyslexic_font')}
                        type="checkbox"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-neutral-700">
                        {t('profile.dyslexicFont')}
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        {...register('preferences.high_contrast')}
                        type="checkbox"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-neutral-700">
                        {t('profile.highContrast')}
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        {...register('preferences.reduced_motion')}
                        type="checkbox"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-neutral-700">
                        {t('profile.reducedMotion')}
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        {...register('preferences.voice_enabled')}
                        type="checkbox"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-neutral-700">
                        {t('profile.voiceEnabled')}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center space-x-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{loading ? 'Saving...' : t('profile.saveChanges')}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
