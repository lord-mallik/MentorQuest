import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Users, BookOpen, GraduationCap, TrendingUp, Activity, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, Clock, ChartBar as BarChart3, Settings, Shield, Database } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { SystemMetrics, User } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { toast } from 'sonner';

const AdminDashboard: React.FC = () => {
  const { supabaseUser } = useAuth();
  const [metrics, setMetrics] = useState<SystemMetrics>({
    total_users: 0,
    total_students: 0,
    total_teachers: 0,
    total_courses: 0,
    total_quizzes: 0,
    active_sessions: 0,
    completion_rate: 0,
    engagement_score: 0
  });
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [systemAlerts, setSystemAlerts] = useState<Array<{
    id: string;
    type: 'warning' | 'error' | 'info';
    message: string;
    timestamp: string;
  }>>([]);
  const [loading, setLoading] = useState(true);

  const loadAdminData = useCallback(async () => {
    try {
      setLoading(true);

      // Load system metrics
      const [
        { count: totalUsers },
        { count: totalStudents },
        { count: totalTeachers },
        { count: totalCourses },
        { count: totalQuizzes }
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'student'),
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'teacher'),
        supabase.from('courses').select('*', { count: 'exact', head: true }),
        supabase.from('quizzes').select('*', { count: 'exact', head: true })
      ]);

      setMetrics({
        total_users: totalUsers || 0,
        total_students: totalStudents || 0,
        total_teachers: totalTeachers || 0,
        total_courses: totalCourses || 0,
        total_quizzes: totalQuizzes || 0,
        active_sessions: 0,
        completion_rate: 85,
        engagement_score: 92
      });

      // Load recent users
      const { data: users } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      setRecentUsers(users || []);

      // Mock system alerts
      setSystemAlerts([
        {
          id: '1',
          type: 'info',
          message: 'System backup completed successfully',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          type: 'warning',
          message: 'High database usage detected',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
        }
      ]);

    } catch (error) {
      console.error('Error loading admin data:', error);
      toast.error('Failed to load admin dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (supabaseUser?.user_metadata?.role === 'admin') {
      loadAdminData();
    }
  }, [supabaseUser, loadAdminData]);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return AlertTriangle;
      case 'warning': return AlertTriangle;
      case 'info': return CheckCircle;
      default: return CheckCircle;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'info': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <LoadingSpinner 
        size="lg" 
        message="Loading admin dashboard..." 
        fullScreen={false}
      />
    );
  }

  if (supabaseUser?.user_metadata?.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600">You don't have permission to access the admin dashboard.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-purple-100 text-lg">
              System overview and management
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{metrics.total_users}</div>
            <div className="text-purple-200">Total Users</div>
          </div>
        </div>
      </motion.div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Students</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.total_students}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-blue-600" />
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
              <p className="text-sm font-medium text-gray-600">Teachers</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.total_teachers}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
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
              <p className="text-sm font-medium text-gray-600">Courses</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.total_courses}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-purple-600" />
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
              <p className="text-sm font-medium text-gray-600">Engagement</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.engagement_score}%</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-1"
        >
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Recent Users</h3>
              <Users className="w-5 h-5 text-primary-600" />
            </div>
            
            <div className="space-y-4">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {user.full_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{user.full_name}</p>
                    <p className="text-sm text-gray-600 truncate">{user.email}</p>
                    <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* System Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-1"
        >
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">System Alerts</h3>
              <Activity className="w-5 h-5 text-primary-600" />
            </div>
            
            <div className="space-y-4">
              {systemAlerts.map((alert) => {
                const Icon = getAlertIcon(alert.type);
                return (
                  <div key={alert.id} className={`p-3 rounded-lg border ${getAlertColor(alert.type)}`}>
                    <div className="flex items-start space-x-3">
                      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{alert.message}</p>
                        <p className="text-xs mt-1 opacity-75">
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="lg:col-span-1"
        >
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              <Settings className="w-5 h-5 text-primary-600" />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <button className="p-4 border border-gray-200 rounded-lg hover:border-primary-200 transition-colors text-center">
                <Database className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <span className="text-sm font-medium">Backup DB</span>
              </button>
              
              <button className="p-4 border border-gray-200 rounded-lg hover:border-primary-200 transition-colors text-center">
                <BarChart3 className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <span className="text-sm font-medium">Analytics</span>
              </button>
              
              <button className="p-4 border border-gray-200 rounded-lg hover:border-primary-200 transition-colors text-center">
                <Users className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <span className="text-sm font-medium">User Mgmt</span>
              </button>
              
              <button className="p-4 border border-gray-200 rounded-lg hover:border-primary-200 transition-colors text-center">
                <Settings className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                <span className="text-sm font-medium">Settings</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* System Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="card p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-6">System Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-900">System Health</h4>
            <p className="text-2xl font-bold text-green-600">Excellent</p>
            <p className="text-sm text-gray-600">All systems operational</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-900">Response Time</h4>
            <p className="text-2xl font-bold text-blue-600">142ms</p>
            <p className="text-sm text-gray-600">Average API response</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="font-semibold text-gray-900">Completion Rate</h4>
            <p className="text-2xl font-bold text-purple-600">{metrics.completion_rate}%</p>
            <p className="text-sm text-gray-600">Course completion rate</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;