import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Plus,
  Search,
  MoreVertical,
  Trash2,
  UserPlus,
  Video,
  Copy,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/supabase';
import { ClassRoom } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { toast } from 'sonner';

interface CreateClassForm {
  name: string;
  subject: string;
  description: string;
}

const sampleClasses: ClassRoom[] = [
  {
    id: '1',
    name: 'Mathematics Grade 1',
    subject: 'Mathematics',
    description: 'Basic numbers, counting, and simple addition/subtraction.',
    class_code: 'MATH1',
    teacher_id: 'teacher1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    active: true,
    students: ['student1', 'student2']
  },
  {
    id: '2',
    name: 'Science Grade 1',
    subject: 'Science',
    description: 'Introduction to nature, plants, animals, and the five senses.',
    class_code: 'SCI1',
    teacher_id: 'teacher2',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    active: true,
    students: ['student3']
  },
  {
    id: '3',
    name: 'English Grade 1',
    subject: 'English',
    description: 'Basic reading, writing, and simple grammar for beginners.',
    class_code: 'ENG1',
    teacher_id: 'teacher3',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    active: true,
    students: []
  },
  {
    id: '4',
    name: 'Social Studies Grade 1',
    subject: 'Social Studies',
    description: 'Understanding family, community, and basic citizenship.',
    class_code: 'SS1',
    teacher_id: 'teacher4',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    active: true,
    students: ['student4', 'student5']
  },
  {
    id: '5',
    name: 'Mathematics Grade 5',
    subject: 'Mathematics',
    description: 'Fractions, decimals, multiplication, and division concepts.',
    class_code: 'MATH5',
    teacher_id: 'teacher5',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    active: true,
    students: ['student6', 'student7']
  },
  {
    id: '6',
    name: 'Science Grade 5',
    subject: 'Science',
    description: 'Introduction to ecosystems, energy, and basic physics.',
    class_code: 'SCI5',
    teacher_id: 'teacher6',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    active: true,
    students: ['student8', 'student9', 'student10']
  },
  {
    id: '7',
    name: 'English Grade 5',
    subject: 'English',
    description: 'Reading comprehension, creative writing, and grammar practice.',
    class_code: 'ENG5',
    teacher_id: 'teacher7',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    active: true,
    students: ['student11']
  },
  {
    id: '8',
    name: 'Social Studies Grade 5',
    subject: 'Social Studies',
    description: 'History, geography, and basic civic knowledge.',
    class_code: 'SS5',
    teacher_id: 'teacher8',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    active: false,
    students: []
  },
  {
    id: '9',
    name: 'Mathematics Grade 8',
    subject: 'Mathematics',
    description: 'Algebra, geometry, and problem-solving strategies.',
    class_code: 'MATH8',
    teacher_id: 'teacher9',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    active: true,
    students: ['student12', 'student13']
  },
  {
    id: '10',
    name: 'Science Grade 8',
    subject: 'Science',
    description: 'Physics, chemistry, and biology basics with experiments.',
    class_code: 'SCI8',
    teacher_id: 'teacher10',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    active: true,
    students: []
  },
  {
    id: '11',
    name: 'English Grade 8',
    subject: 'English',
    description: 'Analyzing literature, essays, and vocabulary building.',
    class_code: 'ENG8',
    teacher_id: 'teacher11',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    active: true,
    students: ['student14']
  },
  {
    id: '12',
    name: 'Social Studies Grade 8',
    subject: 'Social Studies',
    description: 'World history, geography, and political systems.',
    class_code: 'SS8',
    teacher_id: 'teacher12',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    active: false,
    students: []
  },
  {
    id: '13',
    name: 'Mathematics Grade 10',
    subject: 'Mathematics',
    description: 'Advanced algebra, trigonometry, and geometry.',
    class_code: 'MATH10',
    teacher_id: 'teacher13',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    active: true,
    students: ['student15', 'student16']
  },
  {
    id: '14',
    name: 'Science Grade 10',
    subject: 'Science',
    description: 'Introduction to physics, chemistry, and biology in detail.',
    class_code: 'SCI10',
    teacher_id: 'teacher14',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    active: true,
    students: []
  },
  {
    id: '15',
    name: 'English Grade 10',
    subject: 'English',
    description: 'Literary analysis, essays, and advanced writing.',
    class_code: 'ENG10',
    teacher_id: 'teacher15',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    active: true,
    students: ['student17']
  },
  {
    id: '16',
    name: 'Social Studies Grade 10',
    subject: 'Social Studies',
    description: 'Modern history, economics, and civics.',
    class_code: 'SS10',
    teacher_id: 'teacher16',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    active: false,
    students: []
  },
  {
    id: '17',
    name: 'Mathematics Grade 12',
    subject: 'Mathematics',
    description: 'Calculus, probability, and statistics.',
    class_code: 'MATH12',
    teacher_id: 'teacher17',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    active: true,
    students: ['student18', 'student19']
  },
  {
    id: '18',
    name: 'Physics Grade 12',
    subject: 'Physics',
    description: 'Mechanics, electricity, magnetism, and modern physics.',
    class_code: 'PHY12',
    teacher_id: 'teacher18',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    active: true,
    students: ['student20']
  },
  {
    id: '19',
    name: 'Chemistry Grade 12',
    subject: 'Chemistry',
    description: 'Organic chemistry, chemical reactions, and lab practice.',
    class_code: 'CHEM12',
    teacher_id: 'teacher19',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    active: true,
    students: []
  },
  {
    id: '20',
    name: 'Biology Grade 12',
    subject: 'Biology',
    description: 'Human anatomy, genetics, and biotechnology.',
    class_code: 'BIO12',
    teacher_id: 'teacher20',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    active: false,
    students: ['student21']
  },
  {
    id: '21',
    name: 'English Grade 12',
    subject: 'English',
    description: 'Advanced literature, essays, and communication skills.',
    class_code: 'ENG12',
    teacher_id: 'teacher21',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    active: true,
    students: []
  },
  {
    id: '22',
    name: 'Social Studies Grade 12',
    subject: 'Social Studies',
    description: 'Political science, economics, and sociology basics.',
    class_code: 'SS12',
    teacher_id: 'teacher22',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    active: true,
    students: ['student22', 'student23']
  },
  {
    id: '23',
    name: 'Computer Science Grade 12',
    subject: 'Computer Science',
    description: 'Programming, algorithms, and database fundamentals.',
    class_code: 'CS12',
    teacher_id: 'teacher23',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    active: true,
    students: []
  },
  {
    id: '24',
    name: 'Physical Education Grade 12',
    subject: 'Physical Education',
    description: 'Fitness training, sports, and health education.',
    class_code: 'PE12',
    teacher_id: 'teacher24',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    active: true,
    students: ['student24']
  }
];



const Classroom: React.FC = () => {
  const { supabaseUser } = useAuth();
  const [classes, setClasses] = useState<ClassRoom[]>(sampleClasses);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<ClassRoom | null>(null);
  const [showClassDetails, setShowClassDetails] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newStudentId, setNewStudentId] = useState('');

  const [createForm, setCreateForm] = useState<CreateClassForm>({
    name: '',
    subject: '',
    description: ''
  });

  const loadClasses = useCallback(async () => {
    try {
      setLoading(true);
      // Temporarily use sample data to ensure page loads and search works
      // TODO: Re-enable Supabase query once connection issues are resolved
      setClasses(sampleClasses);
    } catch (error) {
      console.error('Error loading classes:', error);
      setClasses(sampleClasses);
      toast.warning('Using demo data - check your database connection');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newClass = await db.createClass(supabaseUser!.id, {
        name: createForm.name,
        subject: createForm.subject,
        description: createForm.description
      });

      // Add to local state
      setClasses(prev => [...prev, { ...newClass, students: [] }]);

      toast.success(`Class created successfully! Class code: ${newClass.class_code}`);
      setCreateForm({ name: '', subject: '', description: '' });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating class:', error);
      toast.error('Failed to create class');
    }
  };

  const handleDeleteClass = async () => {
    if (!confirm('Are you sure you want to delete this class?')) return;

    try {
      if (selectedClass) {
        // Remove from local state (in a real app, this would be deleted from database)
        setClasses(prev => prev.filter(cls => cls.id !== selectedClass.id));
        toast.success('Class deleted successfully!');
        setShowClassDetails(false);
        setSelectedClass(null);
      }
    } catch (error) {
      console.error('Error deleting class:', error);
      toast.error('Failed to delete class');
    }
  };

  const handleStartLiveSession = async () => {
    try {
      // Note: This would need a database function to create live sessions
      toast.success('Live session started!');
      // Refresh data
      if (supabaseUser) {
        loadClasses();
      }
    } catch (error) {
      console.error('Error starting live session:', error);
      toast.error('Failed to start live session');
    }
  };

  const handleAddStudent = async () => {
    if (!newStudentId.trim()) {
      toast.error('Please enter a student ID or email');
      return;
    }
    if (selectedClass) {
      try {
        await db.addStudentToClass(selectedClass.id, newStudentId);
        toast.success('Student added successfully!');
        setNewStudentId('');
        setShowAddStudent(false);
        // Reload classes to get updated data
        if (supabaseUser) {
          loadClasses();
        }
      } catch (error) {
        console.error('Error adding student:', error);
        toast.error('Failed to add student');
      }
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    if (selectedClass) {
      try {
        await db.removeStudentFromClass(selectedClass.id, studentId);
        toast.success('Student removed successfully!');
        // Reload classes to get updated data
        if (supabaseUser) {
          loadClasses();
        }
      } catch (error) {
        console.error('Error removing student:', error);
        toast.error('Failed to remove student');
      }
    }
  };



  const copyClassCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Class code copied to clipboard!');
  };

  const filteredClasses = classes.filter(cls =>
    cls.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <LoadingSpinner
        size="lg"
        message="Loading your classrooms..."
        fullScreen={false}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Classroom Management</h1>
          <p className="text-gray-600 mt-2">Create and manage your classes, students, and live sessions</p>
        </div>
        <Button
          onClick={() => {
            console.log('Create Class button clicked');
            setShowCreateForm(true);
          }}
          icon={<Plus className="w-5 h-5" />}
          size="lg"
          gradient
        >
          Create Class
        </Button>
      </motion.div>

      {/* Search and Filters */}
      <Card padding="md">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <Input
              placeholder="Search classes by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-5 h-5" />}
            />
          </div>
          <div className="text-sm text-gray-600">
            {filteredClasses.length} of {classes.length} classes
          </div>
        </div>
      </Card>

      {/* Create Class Form */}
      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
        >
          <Card padding="lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Create New Class</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCreateForm(false)}
              >
                ✕
              </Button>
            </div>

            <form onSubmit={handleCreateClass} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Class Name"
                  placeholder="e.g., Mathematics Grade 10"
                  value={createForm.name}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
                <Input
                  label="Subject"
                  placeholder="e.g., Mathematics, Physics, Chemistry"
                  value={createForm.subject}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, subject: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  rows={4}
                  placeholder="Describe what students will learn in this class..."
                  value={createForm.description}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" gradient>
                  Create Class
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      )}

      {/* Classes Grid */}
      {filteredClasses.length === 0 ? (
        <Card padding="xl" className="text-center">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {classes.length === 0 ? 'No classes yet' : 'No classes found'}
          </h3>
          <p className="text-gray-600 mb-6">
            {classes.length === 0
              ? 'Create your first class to get started with teaching.'
              : 'Try adjusting your search terms.'
            }
          </p>
          {classes.length === 0 && (
            <Button
              onClick={() => setShowCreateForm(true)}
              icon={<Plus className="w-5 h-5" />}
              gradient
            >
              Create Your First Class
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((classRoom) => (
            <motion.div
              key={classRoom.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card padding="lg" hover>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {classRoom.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">{classRoom.subject}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {classRoom.students.length} students
                      </span>
                      <span className="flex items-center">
                        <BookOpen className="w-4 h-4 mr-1" />
                        Active
                      </span>
                    </div>
                  </div>
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedClass(classRoom);
                        setShowClassDetails(true);
                      }}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                  {classRoom.description}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm">
                    <span className="text-gray-600">Class Code: </span>
                    <span className="font-mono font-semibold text-primary-600">
                      {classRoom.class_code}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyClassCode(classRoom.class_code)}
                    icon={<Copy className="w-4 h-4" />}
                  >
                    Copy
                  </Button>
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedClass(classRoom);
                      setShowClassDetails(true);
                    }}
                    className="flex-1"
                  >
                    View Details
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleStartLiveSession()}
                    icon={<Video className="w-4 h-4" />}
                    className="flex-1"
                  >
                    Live Session
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Class Details Modal */}
      {showClassDetails && selectedClass && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowClassDetails(false)}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{selectedClass.name}</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowClassDetails(false)}
                >
                  ✕
                </Button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Subject</label>
                    <p className="text-lg font-semibold text-gray-900">{selectedClass.subject}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Students</label>
                    <p className="text-lg font-semibold text-gray-900">{selectedClass.students.length}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Description</label>
                  <p className="text-gray-700 mt-1">{selectedClass.description}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">Class Code</label>
                  <div className="flex items-center space-x-2">
                    <code className="bg-gray-100 px-3 py-1 rounded font-mono text-lg">
                      {selectedClass.class_code}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyClassCode(selectedClass.class_code)}
                      icon={<Copy className="w-4 h-4" />}
                    >
                      Copy
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Students</h3>
                  {selectedClass.students.length === 0 ? (
                    <p className="text-gray-600">No students enrolled yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedClass.students.map((student, index) => {
                        const studentId = typeof student === 'string' ? student : student.id;
                        const studentName = typeof student === 'string' ? `Student ${index + 1} (${student})` : student.full_name;
                        const studentAvatar = typeof student === 'string' ? null : student.avatar_url;
                        return (
                          <div key={studentId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              {studentAvatar ? (
                                <img src={studentAvatar} alt={studentName} className="w-8 h-8 rounded-full" />
                              ) : (
                                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                  <span className="text-xs font-medium text-gray-600">
                                    {studentName.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                              <span className="font-medium">{studentName}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={<Trash2 className="w-4 h-4" />}
                              onClick={() => handleRemoveStudent(studentId)}
                            >
                              Remove
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<UserPlus className="w-4 h-4" />}
                    className="mt-4"
                    onClick={() => setShowAddStudent(true)}
                  >
                    Add Student
                  </Button>

                  {showAddStudent && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium mb-2">Add New Student</h4>
                      <Input
                        placeholder="Enter student ID or email"
                        value={newStudentId}
                        onChange={(e) => setNewStudentId(e.target.value)}
                        className="mb-2"
                      />
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setShowAddStudent(false);
                            setNewStudentId('');
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleAddStudent}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex space-x-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setShowClassDetails(false)}
                    className="flex-1"
                  >
                    Close
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => {
                      handleDeleteClass();
                      setShowClassDetails(false);
                    }}
                    icon={<Trash2 className="w-4 h-4" />}
                  >
                    Delete Class
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Classroom;
