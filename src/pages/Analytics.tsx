import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import {
  Users,
  BookOpen,
  TrendingUp,
  Clock,
  Award,
  AlertCircle,
  BarChart3,
  Download,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';
import jsPDF from 'jspdf';

interface AnalyticsMetrics {
  totalStudents: number;
  activeClasses: number;
  totalQuizzes: number;
  averageScore: number;
  completionRate: number;
  studyHours: number;
  engagementRate: number;
  topPerformers: number;
  strugglingStudents: number;
}

interface ChartData {
  performanceTrend: Array<{ month: string; averageScore: number; completionRate: number }>;
  classComparison: Array<{ className: string; averageScore: number; studentCount: number }>;
  quizDistribution: Array<{ range: string; count: number }>;
  subjectBreakdown: Array<{ subject: string; value: number; color: string }>;
  weeklyActivity: Array<{ day: string; hours: number; sessions: number }>;
}



const Analytics: React.FC = () => {
  const { supabaseUser } = useAuth();
  const [metrics, setMetrics] = useState<AnalyticsMetrics>({
    totalStudents: 0,
    activeClasses: 0,
    totalQuizzes: 0,
    averageScore: 0,
    completionRate: 0,
    studyHours: 0,
    engagementRate: 0,
    topPerformers: 0,
    strugglingStudents: 0
  });
  const [chartData, setChartData] = useState<ChartData>({
    performanceTrend: [],
    classComparison: [],
    quizDistribution: [],
    subjectBreakdown: [],
    weeklyActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv');

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);

      // Mock data for now - in real implementation, fetch from database
      const mockMetrics: AnalyticsMetrics = {
        totalStudents: 156,
        activeClasses: 8,
        totalQuizzes: 24,
        averageScore: 78.5,
        completionRate: 85.2,
        studyHours: 1247,
        engagementRate: 92.1,
        topPerformers: 23,
        strugglingStudents: 8
      };

      const mockChartData: ChartData = {
        performanceTrend: [
          { month: 'Jan', averageScore: 72, completionRate: 78 },
          { month: 'Feb', averageScore: 75, completionRate: 82 },
          { month: 'Mar', averageScore: 78, completionRate: 85 },
          { month: 'Apr', averageScore: 80, completionRate: 87 },
          { month: 'May', averageScore: 82, completionRate: 89 },
          { month: 'Jun', averageScore: 78.5, completionRate: 85.2 }
        ],
        classComparison: [
          { className: 'Math 101', averageScore: 82, studentCount: 28 },
          { className: 'Physics 201', averageScore: 75, studentCount: 22 },
          { className: 'Chemistry 101', averageScore: 79, studentCount: 25 },
          { className: 'Biology 101', averageScore: 81, studentCount: 20 },
          { className: 'English Lit', averageScore: 85, studentCount: 18 }
        ],
        quizDistribution: [
          { range: '90-100', count: 15 },
          { range: '80-89', count: 32 },
          { range: '70-79', count: 28 },
          { range: '60-69', count: 18 },
          { range: '0-59', count: 12 }
        ],
        subjectBreakdown: [
          { subject: 'Mathematics', value: 35, color: '#0088FE' },
          { subject: 'Science', value: 28, color: '#00C49F' },
          { subject: 'English', value: 20, color: '#FFBB28' },
          { subject: 'History', value: 12, color: '#FF8042' },
          { subject: 'Other', value: 5, color: '#8884D8' }
        ],
        weeklyActivity: [
          { day: 'Mon', hours: 45, sessions: 28 },
          { day: 'Tue', hours: 52, sessions: 32 },
          { day: 'Wed', hours: 48, sessions: 30 },
          { day: 'Thu', hours: 55, sessions: 35 },
          { day: 'Fri', hours: 42, sessions: 26 },
          { day: 'Sat', hours: 38, sessions: 22 },
          { day: 'Sun', hours: 35, sessions: 20 }
        ]
      };

      setMetrics(mockMetrics);
      setChartData(mockChartData);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportAnalyticsData = () => {
    try {
      if (exportFormat === 'csv') {
        // Enhanced CSV with better structure and headers
        const csvContent = [
          // Enhanced Header with report info
          [`Analytics Report - Generated on: ${new Date().toLocaleDateString()}`],
          [`Date Range: ${dateRange}`],
          [''],
          // Key Metrics Section
          ['KEY METRICS'],
          ['Metric', 'Value'],
          ['Total Students', metrics.totalStudents],
          ['Active Classes', metrics.activeClasses],
          ['Total Quizzes', metrics.totalQuizzes],
          ['Average Score (%)', metrics.averageScore],
          ['Completion Rate (%)', metrics.completionRate],
          ['Study Hours', metrics.studyHours],
          ['Engagement Rate (%)', metrics.engagementRate],
          ['Top Performers', metrics.topPerformers],
          ['Struggling Students', metrics.strugglingStudents],
          [''],
          // Performance Trend Section
          ['PERFORMANCE TREND'],
          ['Month', 'Average Score (%)', 'Completion Rate (%)'],
          ...chartData.performanceTrend.map(item => [item.month, item.averageScore, item.completionRate]),
          [''],
          // Class Comparison Section
          ['CLASS COMPARISON'],
          ['Class Name', 'Average Score (%)', 'Student Count'],
          ...chartData.classComparison.map(item => [item.className, item.averageScore, item.studentCount]),
          [''],
          // Quiz Distribution Section
          ['QUIZ SCORE DISTRIBUTION'],
          ['Score Range', 'Student Count'],
          ...chartData.quizDistribution.map(item => [item.range, item.count]),
          [''],
          // Subject Breakdown Section
          ['SUBJECT BREAKDOWN'],
          ['Subject', 'Percentage (%)'],
          ...chartData.subjectBreakdown.map(item => [item.subject, item.value]),
          [''],
          // Weekly Activity Section
          ['WEEKLY ACTIVITY'],
          ['Day', 'Study Hours', 'Sessions'],
          ...chartData.weeklyActivity.map(item => [item.day, item.hours, item.sessions])
        ];

        // Convert to CSV string with proper escaping
        const csvString = csvContent.map(row =>
          row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        ).join('\n');

        // Create and download enhanced CSV file
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `mentorquest-analytics-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (exportFormat === 'pdf') {
        // Simple PDF with text-based data export
        const doc = new jsPDF('p', 'mm', 'a4');
        let yPosition: number = 20;

        // Title
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(45, 55, 72);
        doc.text('Analytics Report', 105, yPosition, { align: 'center' });
        yPosition += 15;

        // Subtitle and date
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated on: ${new Date().toLocaleDateString()} | Date Range: ${dateRange}`, 20, yPosition);
        yPosition += 15;

        // Key Metrics Section
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(45, 55, 72);
        doc.text('Key Metrics', 20, yPosition);
        yPosition += 10;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        const metricsData = [
          `Total Students: ${metrics.totalStudents}`,
          `Active Classes: ${metrics.activeClasses}`,
          `Total Quizzes: ${metrics.totalQuizzes}`,
          `Average Score: ${metrics.averageScore}%`,
          `Completion Rate: ${metrics.completionRate}%`,
          `Study Hours: ${metrics.studyHours}`,
          `Engagement Rate: ${metrics.engagementRate}%`,
          `Top Performers: ${metrics.topPerformers}`,
          `Struggling Students: ${metrics.strugglingStudents}`
        ];

        metricsData.forEach(line => {
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(line, 20, yPosition);
          yPosition += 8;
        });
        yPosition += 10;

        // Performance Trend Section
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(45, 55, 72);
        doc.text('Performance Trend', 20, yPosition);
        yPosition += 10;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        chartData.performanceTrend.forEach(item => {
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(`${item.month}: Average Score ${item.averageScore}%, Completion Rate ${item.completionRate}%`, 20, yPosition);
          yPosition += 8;
        });
        yPosition += 10;

        // Class Comparison Section
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(45, 55, 72);
        doc.text('Class Performance', 20, yPosition);
        yPosition += 10;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        chartData.classComparison.forEach(item => {
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(`${item.className}: Average Score ${item.averageScore}%, Students ${item.studentCount}`, 20, yPosition);
          yPosition += 8;
        });
        yPosition += 10;

        // Quiz Distribution Section
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(45, 55, 72);
        doc.text('Quiz Score Distribution', 20, yPosition);
        yPosition += 10;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        chartData.quizDistribution.forEach(item => {
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(`${item.range}: ${item.count} students`, 20, yPosition);
          yPosition += 8;
        });
        yPosition += 10;

        // Subject Breakdown Section
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(45, 55, 72);
        doc.text('Subject Breakdown', 20, yPosition);
        yPosition += 10;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        chartData.subjectBreakdown.forEach(item => {
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(`${item.subject}: ${item.value}%`, 20, yPosition);
          yPosition += 8;
        });
        yPosition += 10;

        // Weekly Activity Section
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(45, 55, 72);
        doc.text('Weekly Activity', 20, yPosition);
        yPosition += 10;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        chartData.weeklyActivity.forEach(item => {
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(`${item.day}: ${item.hours} hours, ${item.sessions} sessions`, 20, yPosition);
          yPosition += 8;
        });

        // Footer
        const pageCount = (doc.internal as any).getNumberOfPages ? (doc.internal as any).getNumberOfPages() : doc.internal.pages.length;
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(10);
          doc.setTextColor(100, 100, 100);
          doc.text(`Page ${i} of ${pageCount} | MentorQuest Analytics`, 105, 290, { align: 'center' });
        }

        // Download PDF
        doc.save(`mentorquest-analytics-${new Date().toISOString().split('T')[0]}.pdf`);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      // You could show a toast notification here
    }
  };

  useEffect(() => {
    if (supabaseUser) {
      loadAnalyticsData();
    }
  }, [supabaseUser, dateRange]);

  if (loading) {
    return (
      <LoadingSpinner
        size="lg"
        message="Loading analytics data..."
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
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">Comprehensive insights into student performance and engagement</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value as 'csv' | 'pdf')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="csv">CSV</option>
            <option value="pdf">PDF</option>
          </select>
          <button
            onClick={loadAnalyticsData}
            className="btn-secondary flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button
            onClick={exportAnalyticsData}
            className="btn-primary flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.totalStudents}</p>
              <p className="text-xs text-green-600 mt-1">+12% from last month</p>
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
              <p className="text-sm font-medium text-gray-600">Average Score</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.averageScore}%</p>
              <p className="text-xs text-green-600 mt-1">+2.3% from last month</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-green-600" />
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
              <p className="text-2xl font-bold text-gray-900">{metrics.completionRate}%</p>
              <p className="text-xs text-green-600 mt-1">+5.1% from last month</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
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
              <p className="text-sm font-medium text-gray-600">Study Hours</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.studyHours}</p>
              <p className="text-xs text-blue-600 mt-1">Total this month</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Performance Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Performance Trend</h3>
            <BarChart3 className="w-5 h-5 text-primary-600" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData.performanceTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="averageScore"
                stackId="1"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.6}
                name="Average Score (%)"
              />
              <Area
                type="monotone"
                dataKey="completionRate"
                stackId="2"
                stroke="#82ca9d"
                fill="#82ca9d"
                fillOpacity={0.6}
                name="Completion Rate (%)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Class Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Class Performance</h3>
            <BookOpen className="w-5 h-5 text-primary-600" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.classComparison}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="className" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="averageScore" fill="#8884d8" name="Average Score (%)" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Quiz Score Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Quiz Score Distribution</h3>
            <Award className="w-5 h-5 text-primary-600" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.quizDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#82ca9d" name="Number of Students" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Subject Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Subject Distribution</h3>
            <BarChart3 className="w-5 h-5 text-primary-600" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData.subjectBreakdown}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.subjectBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Weekly Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="card p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Weekly Activity</h3>
          <Clock className="w-5 h-5 text-primary-600" />
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData.weeklyActivity}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="hours" fill="#8884d8" name="Study Hours" />
            <Line yAxisId="right" type="monotone" dataKey="sessions" stroke="#ff7300" name="Sessions" />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Performers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Performers</h3>
          <div className="space-y-4">
            {[
              { name: 'Alice Johnson', score: 98, class: 'Math 101' },
              { name: 'Bob Smith', score: 96, class: 'Physics 201' },
              { name: 'Carol Davis', score: 95, class: 'Chemistry 101' },
              { name: 'David Wilson', score: 94, class: 'Biology 101' },
              { name: 'Eva Brown', score: 93, class: 'English Lit' }
            ].map((student, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-green-600">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{student.name}</p>
                    <p className="text-sm text-gray-600">{student.class}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">{student.score}%</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Students Needing Attention */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Students Needing Attention</h3>
          <div className="space-y-4">
            {[
              { name: 'Frank Miller', score: 62, class: 'Math 101', issues: 'Missed 3 quizzes' },
              { name: 'Grace Lee', score: 58, class: 'Physics 201', issues: 'Low engagement' },
              { name: 'Henry Taylor', score: 65, class: 'Chemistry 101', issues: 'Incomplete assignments' }
            ].map((student, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{student.name}</p>
                    <p className="text-sm text-gray-600">{student.class}</p>
                    <p className="text-xs text-red-600">{student.issues}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-red-600">{student.score}%</p>
                  <button className="text-xs text-primary-600 hover:text-primary-700 mt-1">
                    Send Message
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics;
