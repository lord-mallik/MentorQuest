import React from 'react';
import { Link } from 'react-router-dom';
import { ClassRoom } from '../../types';

interface ClassCardProps {
  classRoom: ClassRoom;
}

const ClassCard: React.FC<ClassCardProps> = ({ classRoom }) => {
  const studentCount = Array.isArray(classRoom.students) ? classRoom.students.length : 0;

  return (
    <div className="p-4 border border-gray-200 rounded-lg hover:border-primary-200 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-gray-900">{classRoom.name}</h4>
        <span className="text-sm text-gray-600">{studentCount} students</span>
      </div>
      <p className="text-sm text-gray-600 mb-3">{classRoom.subject}</p>
      <div className="flex items-center space-x-2">
        <Link to="/classroom" className="btn-outline text-xs px-2 py-1">View</Link>
        <Link to="/classroom" className="btn-primary text-xs px-2 py-1">Start Live Session</Link>
      </div>
    </div>
  );
};

export default ClassCard;