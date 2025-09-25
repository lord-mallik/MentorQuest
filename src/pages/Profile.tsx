import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Save, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useGamification } from '../hooks/useGamification';
import { supabase } from '../lib/supabase';
import { UserPreferences } from '../types';
import { toast } from 'sonner';
import Button from '../components/ui/Button';
import ProfileHeader from '../components/Profile/ProfileHeader';
import ProfileStats from '../components/Profile/ProfileStats';
import PersonalInfoForm from '../components/Profile/PersonalInfoForm';
import PreferencesForm from '../components/Profile/PreferencesForm';

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
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-blue-50/30 to-purple-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center space-x-2 mb-4">
            <Sparkles className="w-8 h-8 text-primary-600" />
            <h1 className="heading-xl text-gradient-primary">{t('profile.title')}</h1>
          </div>
          <p className="body-lg text-neutral-600 max-w-2xl mx-auto">
            {t('profile.subtitle')} Customize your learning experience and track your progress.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Left Column - Profile Header & Stats */}
          <div className="xl:col-span-4 space-y-6">
            <ProfileHeader />
            {supabaseUser.user_metadata?.role === 'student' && gamificationProfile && (
              <ProfileStats />
            )}
          </div>

          {/* Right Column - Forms */}
          <div className="xl:col-span-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Personal Information */}
              <PersonalInfoForm
                register={register}
                errors={errors}
                userEmail={supabaseUser.email || ''}
              />

              {/* Preferences */}
              <PreferencesForm register={register} />

              {/* Save Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
                className="flex justify-end pt-6"
              >
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={loading}
                  icon={<Save className="w-5 h-5" />}
                  gradient={true}
                  glow={true}
                  className="min-w-[200px]"
                >
                  {loading ? 'Saving Changes...' : t('profile.saveChanges')}
                </Button>
              </motion.div>
            </form>
          </div>
        </div>

        {/* Bottom Decoration */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center space-x-2 text-neutral-400">
            <div className="w-12 h-px bg-gradient-to-r from-transparent via-neutral-300 to-transparent"></div>
            <Sparkles className="w-4 h-4" />
            <div className="w-12 h-px bg-gradient-to-r from-transparent via-neutral-300 to-transparent"></div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;