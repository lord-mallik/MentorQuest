import React from 'react';
import { BarChart3 } from 'lucide-react';

interface Student {
  name: string;
  score: number;
  subject: string;
}

interface PerformanceSectionProps {
  topPerformers: Student[];
  strugglingStudents: Student[];
}

const PerformanceSection: React.FC<PerformanceSectionProps> = ({
  topPerformers,
  strugglingStudents
}) => {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Student Performance</h3>
        <BarChart3 className="w-5 h-5 text-primary-600" />
      </div>
      
      <div className="space-y-6">
        {/* Top Performers */}
        {topPerformers?.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Top Performers</h4>
            <div className="space-y-2">
              {topPerformers.map((student, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{student.name}</p>
                    <p className="text-sm text-gray-600">{student.subject}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{student.score}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Students Needing Help */}
        {strugglingStudents?.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Need Attention</h4>
            <div className="space-y-2">
              {strugglingStudents.map((student, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{student.name}</p>
                    <p className="text-sm text-gray-600">{student.subject}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-yellow-600">{student.score}%</p>
                    <button className="text-xs text-primary-600 hover:text-primary-700">
                      Send Message
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {(!topPerformers?.length && !strugglingStudents?.length) && (
          <div className="text-center py-8">
            <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No student data available yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceSection;