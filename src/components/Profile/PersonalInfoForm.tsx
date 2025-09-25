import React from 'react';
import { motion } from 'framer-motion';
import { User, Mail, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import Card from '../ui/Card';
import Input from '../ui/Input';

interface PersonalInfoFormProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  userEmail: string;
  className?: string;
}

const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({
  register,
  errors,
  userEmail,
  className = ''
}) => {
  const { t } = useTranslation();

  return (
    <Card variant="default" padding="lg" className={className}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center space-x-3 pb-4 border-b border-neutral-200">
          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
            <User className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="heading-sm text-neutral-900">{t('profile.personalInfo')}</h3>
            <p className="body-sm text-neutral-600">Update your personal information</p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          {/* Full Name */}
          <div>
            <Input
              {...register('full_name')}
              label={t('profile.fullName')}
              placeholder="Enter your full name"
              leftIcon={<User className="w-4 h-4" />}
              variant="outline"
              inputSize="lg"
              error={errors.full_name?.message as string}
            />
          </div>

          {/* Email (Read-only) */}
          <div>
            <Input
              value={userEmail}
              label={t('profile.email')}
              leftIcon={<Mail className="w-4 h-4" />}
              variant="filled"
              inputSize="lg"
              disabled
              hint="Email cannot be changed. Contact support if needed."
            />
          </div>

          {/* Info Notice */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-blue-50 border border-blue-200 rounded-xl p-4"
          >
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="label-base text-blue-900">Profile Visibility</p>
                <p className="body-sm text-blue-700">
                  Your profile information is visible to your mentors and study groups. 
                  You can control additional privacy settings in the preferences section.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </Card>
  );
};

export default PersonalInfoForm;