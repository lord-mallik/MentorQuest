import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, User } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

interface ProfileHeaderProps {
  className?: string;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ className = '' }) => {
  const { supabaseUser, updateProfile } = useAuth();
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  if (!supabaseUser) return null;

  return (
    <Card variant="elevated" padding="lg" className={`text-center ${className}`}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* Avatar Section */}
        <div className="relative inline-block">
          <div className="relative">
            <img
              src={supabaseUser.user_metadata?.avatar_url || 'https://via.placeholder.com/120x120/e5e7eb/6b7280?text=Avatar'}
              alt="Profile Avatar"
              className="w-28 h-28 rounded-full object-cover mx-auto shadow-lg ring-4 ring-white"
            />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center hover:bg-primary-700 transition-colors disabled:opacity-50 shadow-lg ring-4 ring-white"
            >
              {uploadingAvatar ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Camera className="w-5 h-5 text-white" />
              )}
            </motion.button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            className="hidden"
          />
        </div>

        {/* User Info */}
        <div className="space-y-3">
          <h2 className="heading-lg text-neutral-900">
            {supabaseUser.user_metadata?.full_name || 'User'}
          </h2>
          <p className="body-base text-neutral-600">{supabaseUser.email}</p>
          
          <div className="flex justify-center">
            <Badge 
              variant="primary" 
              size="lg"
            >
              <User className="w-4 h-4" />
              {supabaseUser.user_metadata?.role || 'student'}
            </Badge>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl p-4">
          <p className="body-sm text-neutral-700">
            Welcome back! Manage your profile settings and preferences below.
          </p>
        </div>
      </motion.div>
    </Card>
  );
};

export default ProfileHeader;