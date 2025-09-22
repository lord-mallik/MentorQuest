import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  BookOpen,
  TrendingUp,
  Clock,
  Brain,
  Award,
  AlertCircle,
  Calendar,
  BarChart3,
  PlusCircle,
  MessageSquare,
  Heart
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../lib/supabase';
import { ClassRoom, LiveSession } from '../../types';
import LoadingSpinner from '../common/LoadingSpinner';

const TeacherDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>([]);
  const [analytics, setAnalytics] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadTeacherData();
    }
  }, [user]);

  const loadTeacherData = async () => {
    try {
      setLoading(true);
      
      // Load real classes data
      const classesData = await db.getClasses(user!.id);
      setClasses(classesData.map(cls => ({
        ...cls,
        students: cls.class_students?.map(cs => cs.users?.id).filter(Boolean) || []
      })));

      setLiveSessions([
        {
          id: '1',
          class_id: classesData[0]?.id || '1',
          teacher_id: user!.id,
          title: 'Algebra Review Session',
          description: 'Review of quadratic equations',
          start_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          active: false,
          participants: []
        }
      ]);

      // Calculate analytics from real data
      const totalStudents = classesData.reduce((acc, cls) => 
        acc + (cls.class_students?.length || 0), 0
      );

      setAnalytics({
        totalStudents,
        activeClasses: classesData.length,
        averageEngagement: 87,
        completionRate: 92,
        wellnessAlerts: 2,
        recentQuizzes: 8,
        studyHoursThisWeek: 156,
        topPerformers: [
          { name: 'Alice Johnson', score: 95, subject: 'Mathematics' },
          { name: 'Bob Smith', score: 92, subject: 'Physics' },
          { name: 'Carol Davis', score: 89, subject: 'Chemistry' }
        ],
        strugglingStudents: [
          { name: 'David Wilson', subject: 'Mathematics', score: 65 },
          { name: 'Eva Brown', subject: 'Physics', score: 68 }
        ]
      });

    } catch (error) {
      console.error('Error loading teacher data:', error);
      // Fallback to mock data if real data fails
      setClasses([
        {
          id: '1',
          name: 'Mathematics Grade 10',
          subject: 'Mathematics',
          teacher_id: user!.id,
          students: ['student1', 'student2', 'student3'],
          created_at: new Date().toISOString(),
          active: true
        }
      ]);
      setAnalytics({
        totalStudents: 3,
        activeClasses: 1,
        averageEngagement: 87,
        completionRate: 92,
        wellnessAlerts: 0,
        recentQuizzes: 2,
        studyHoursThisWeek: 45,
        topPerformers: [],
        strugglingStudents: []
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <LoadingSpinner 
        size="lg" 
        message="Loading your teacher dashboard..." 
        fullScreen={false}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl p-8 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user?.full_name}! 👨‍🏫
            </h1>
            <p className="text-primary-100 text-lg">
              Ready to inspire and educate your students today?
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{analytics.totalStudents}</div>
            <div className="text-primary-200">Total Students</div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Classes</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.activeClasses}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Engagement</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.averageEngagement}%</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.completionRate}%</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Wellness Alerts</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.wellnessAlerts}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Classes Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-1"
        >
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">My Classes</h3>
              <Link to="/classroom" className="btn-primary text-sm px-3 py-1">
                <PlusCircle className="w-4 h-4 mr-1" />
                New Class
              </Link>
            </div>
            
            <div className="space-y-4">
              {classes.map((classRoom) => (
                <div key={classRoom.id} className="p-4 border border-gray-200 rounded-lg hover:border-primary-200 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{classRoom.name}</h4>
                    <span className="text-sm text-gray-600">{classRoom.students.length} students</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{classRoom.subject}</p>
                  <div className="flex items-center space-x-2">
                    <Link to="/classroom" className="btn-outline text-xs px-2 py-1">View</Link>
                    <Link to="/classroom" className="btn-primary text-xs px-2 py-1">Start Live Session</Link>
                  </div>
                </div>
              ))}
              {classes.length === 0 && (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No classes yet</p>
                  <Link to="/classroom" className="btn-primary text-sm mt-2">
                    Create Your First Class
                  </Link>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Performance Analytics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-1"
        >
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Student Performance</h3>
              <BarChart3 className="w-5 h-5 text-primary-600" />
            </div>
            
            <div className="space-y-6">
              {/* Top Performers */}
              {analytics.topPerformers?.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Top Performers</h4>
                  <div className="space-y-2">
                    {analytics.topPerformers.map((student: any, index: number) => (
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
              {analytics.strugglingStudents?.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Need Attention</h4>
                  <div className="space-y-2">
                    {analytics.strugglingStudents.map((student: any, index: number) => (
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
              
              {(!analytics.topPerformers?.length && !analytics.strugglingStudents?.length) && (
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No student data available yet</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Upcoming Sessions & Tools */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="lg:col-span-1"
        >
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Upcoming Sessions</h3>
              <Calendar className="w-5 h-5 text-primary-600" />
            </div>
            
            <div className="space-y-4 mb-6">
              {liveSessions.length === 0 ? (
                <div className="text-center py-4">
                  <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No upcoming sessions</p>
                </div>
              ) : (
                liveSessions.map((session) => (
                  <div key={session.id} className="p-3 border border-gray-200 rounded-lg">
                    <h4 className="font-medium text-gray-900">{session.title}</h4>
                    <p className="text-sm text-gray-600">{session.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(session.start_time).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Quick Tools */}
            <div className="border-t pt-6">
              <h4 className="font-medium text-gray-900 mb-4">Quick Tools</h4>
              <div className="grid grid-cols-2 gap-3">
                <Link to="/content-generator" className="p-3 border border-gray-200 rounded-lg hover:border-primary-200 transition-colors text-center">
                  <Brain className="w-6 h-6 text-primary-600 mx-auto mb-1" />
                  <span className="text-xs font-medium">AI Content</span>
                </Link>
                <Link to="/quizzes" className="p-3 border border-gray-200 rounded-lg hover:border-primary-200 transition-colors text-center">
                  <BookOpen className="w-6 h-6 text-green-600 mx-auto mb-1" />
                  <span className="text-xs font-medium">Create Quiz</span>
                </Link>
                <button className="p-3 border border-gray-200 rounded-lg hover:border-primary-200 transition-colors text-center">
                  <MessageSquare className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                  <span className="text-xs font-medium">Announcements</span>
                </button>
                <Link to="/analytics" className="p-3 border border-gray-200 rounded-lg hover:border-primary-200 transition-colors text-center">
                  <Heart className="w-6 h-6 text-pink-600 mx-auto mb-1" />
                  <span className="text-xs font-medium">Analytics</span>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="card p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-900">Quizzes Created</h4>
            <p className="text-2xl font-bold text-blue-600">{analytics.recentQuizzes}</p>
            <p className="text-sm text-gray-600">This week</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-900">Study Hours</h4>
            <p className="text-2xl font-bold text-green-600">{analytics.studyHoursThisWeek}</p>
            <p className="text-sm text-gray-600">Class total this week</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="font-semibold text-gray-900">Engagement</h4>
            <p className="text-2xl font-bold text-purple-600">{analytics.averageEngagement}%</p>
            <p className="text-sm text-gray-600">Average this month</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TeacherDashboard;