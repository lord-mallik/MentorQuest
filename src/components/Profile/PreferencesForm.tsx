import React from 'react';
import { motion } from 'framer-motion';
import { Settings, Palette, Eye, Accessibility } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { UseFormRegister } from 'react-hook-form';
import Card from '../ui/Card';

interface PreferencesFormProps {
  register: UseFormRegister<any>;
  className?: string;
}

const PreferencesForm: React.FC<PreferencesFormProps> = ({
  register,
  className = ''
}) => {
  const { t } = useTranslation();

  const preferenceGroups = [
    {
      title: 'Display Settings',
      icon: Palette,
      color: 'text-purple-500',
      bgColor: 'bg-purple-100',
      items: [
        {
          name: 'preferences.theme',
          label: t('profile.theme'),
          type: 'select',
          options: [
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
            { value: 'auto', label: 'Auto' }
          ]
        },
        {
          name: 'preferences.text_size',
          label: t('profile.textSize'),
          type: 'select',
          options: [
            { value: 'small', label: 'Small' },
            { value: 'medium', label: 'Medium' },
            { value: 'large', label: 'Large' }
          ]
        }
      ]
    },
    {
      title: 'Accessibility',
      icon: Accessibility,
      color: 'text-green-500',
      bgColor: 'bg-green-100',
      items: [
        {
          name: 'preferences.dyslexic_font',
          label: t('profile.dyslexicFont'),
          type: 'checkbox',
          description: 'Use dyslexia-friendly fonts for better readability'
        },
        {
          name: 'preferences.high_contrast',
          label: t('profile.highContrast'),
          type: 'checkbox',
          description: 'Increase contrast for better visibility'
        },
        {
          name: 'preferences.reduced_motion',
          label: t('profile.reducedMotion'),
          type: 'checkbox',
          description: 'Reduce animations and transitions'
        },
        {
          name: 'preferences.voice_enabled',
          label: t('profile.voiceEnabled'),
          type: 'checkbox',
          description: 'Enable voice feedback and narration'
        }
      ]
    }
  ];

  return (
    <Card variant="default" padding="lg" className={className}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="flex items-center space-x-3 pb-4 border-b border-neutral-200">
          <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center">
            <Settings className="w-5 h-5 text-secondary-600" />
          </div>
          <div>
            <h3 className="heading-sm text-neutral-900">{t('profile.preferences')}</h3>
            <p className="body-sm text-neutral-600">Customize your learning experience</p>
          </div>
        </div>

        {/* Preference Groups */}
        <div className="space-y-8">
          {preferenceGroups.map((group, groupIndex) => (
            <motion.div
              key={group.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.4 + groupIndex * 0.1 }}
              className="space-y-4"
            >
              {/* Group Header */}
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 ${group.bgColor} rounded-lg flex items-center justify-center`}>
                  <group.icon className={`w-4 h-4 ${group.color}`} />
                </div>
                <h4 className="heading-xs text-neutral-800">{group.title}</h4>
              </div>

              {/* Group Items */}
              <div className="space-y-4 ml-11">
                {group.items.map((item, itemIndex) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: 0.5 + groupIndex * 0.1 + itemIndex * 0.05 }}
                    className="space-y-2"
                  >
                    {item.type === 'select' ? (
                      <div>
                        <label className="label-base text-neutral-700 mb-2 block">
                          {item.label}
                        </label>
                        <select
                          {...register(item.name)}
                          className="w-full px-4 py-3 text-sm border border-neutral-300 rounded-lg bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all duration-200"
                        >
                          {item.options?.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div className="flex items-start space-x-3 p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors duration-200">
                        <input
                          {...register(item.name)}
                          type="checkbox"
                          className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded transition-colors duration-200"
                        />
                        <div className="space-y-1">
                          <label className="label-base text-neutral-800 cursor-pointer">
                            {item.label}
                          </label>
                          {item.description && (
                            <p className="body-xs text-neutral-600">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4"
        >
          <div className="flex items-start space-x-3">
            <Eye className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="label-base text-blue-900">Preference Sync</p>
              <p className="body-sm text-blue-700">
                Your preferences are automatically saved and synced across all your devices. 
                Changes take effect immediately.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </Card>
  );
};

export default PreferencesForm;