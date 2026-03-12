import { useNavigate } from 'react-router-dom';

import { 

  BarChart3, 

  TrendingUp, 

  Users, 

  UserCheck, 

  Download, 

  Calendar,

  Filter,

  ChevronDown,

  ArrowUpRight,

  ArrowDownRight,

  Target,

  Award,

  BookOpen,

  Search,

  ChevronRight,

  User

} from 'lucide-react';

import { useState, useEffect, useMemo } from 'react';

import { motion, AnimatePresence } from 'motion/react';

import { 

  ResponsiveContainer, 

  BarChart, 

  Bar, 

  XAxis, 

  YAxis, 

  CartesianGrid, 

  Tooltip, 

  Legend, 

  LineChart, 

  Line, 

  PieChart, 

  Pie, 

  Cell,

  RadarChart,

  PolarGrid,

  PolarAngleAxis,

  PolarRadiusAxis,

  Radar

} from 'recharts';

import AdminSidebar from '../../components/layout/sidebar/admin/AdminSidebar';

import AdminMobileNav from '../../components/common/AdminMobileNav';

import { cn } from '../../lib/utils';

import { CRITERIA } from '../../constants';

import { reportService, type FilterOptions, type OverviewStats, type StudentReport, type TeacherReport } from '../../services/reportService';

import { exportToPDF } from '../../utils/exportPdf';



export default function AdminReportsPage() {

  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'teachers'>('overview');

  

  // Data state

  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);

  const [overviewStats, setOverviewStats] = useState<OverviewStats | null>(null);

  const [studentReports, setStudentReports] = useState<StudentReport[]>([]);

  const [teacherReports, setTeacherReports] = useState<TeacherReport | null>(null);

  const [loading, setLoading] = useState(true);

  const [studentReportsLoading, setStudentReportsLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  

  // Student Report State

  const [selectedGen, setSelectedGen] = useState<string | 'All'>('All');

  const [selectedClass, setSelectedClass] = useState<string | 'All'>('All');

  const [selectedGender, setSelectedGender] = useState<string | 'All'>('All');



  // Load initial data

  useEffect(() => {

    const loadData = async () => {

      try {

        setLoading(true);

        setError(null);

        

        const [filterOpts, overview, teacherData] = await Promise.all([

          reportService.getFilterOptions(),

          reportService.getOverviewStats(),

          reportService.getTeacherReports()

        ]);

        

        setFilterOptions(filterOpts);

        setOverviewStats(overview);

        setTeacherReports(teacherData);

      } catch (err) {

        setError(err instanceof Error ? err.message : 'Failed to load data');

        console.error('Error loading report data:', err);

      } finally {

        setLoading(false);

      }

    };

    

    loadData();

  }, []);



  // Load student reports when component mounts or filters change

  useEffect(() => {

    const loadStudentReports = async () => {

      try {

        setStudentReportsLoading(true);

        const params: any = {};

        if (selectedGen !== 'All') params.generation = selectedGen;

        if (selectedClass !== 'All') params.className = selectedClass;

        if (selectedGender !== 'All') params.gender = selectedGender;

        

        const data = await reportService.getStudentReports(params);

        setStudentReports(data);

      } catch (err) {

        console.error('Error loading student reports:', err);

        // Set empty array on error to prevent undefined issues

        setStudentReports([]);

      } finally {

        setStudentReportsLoading(false);

      }

    };

    

    if (activeTab === 'students') {

      loadStudentReports();

    }

  }, [selectedGen, selectedClass, selectedGender, activeTab]);



  // Get current report data based on filters

  const currentReportData = useMemo(() => {

    // If no student reports, show empty data structure

    if (!studentReports || studentReports.length === 0) {

      return [

        { subject: 'Living', score: 0, fullMark: 100 },

        { subject: 'Study', score: 0, fullMark: 100 },

        { subject: 'Human', score: 0, fullMark: 100 },

        { subject: 'Health', score: 0, fullMark: 100 },

        { subject: 'Money', score: 0, fullMark: 100 },

        { subject: 'Feeling', score: 0, fullMark: 100 },

        { subject: 'Skill', score: 0, fullMark: 100 }

      ];

    }

    return studentReports;

  }, [studentReports]);



  // Get available classes for selected generation

  const availableClasses = useMemo(() => {

    if (!filterOptions || selectedGen === 'All') return [];

    return filterOptions.classesByGeneration[selectedGen] || [];

  }, [filterOptions, selectedGen]);



  // Get available students for selected class (mock data for now)

  const studentList = useMemo(() => {

    // This would need to be implemented based on your user data model

    return [];

  }, [selectedGen, selectedClass]);



  // Handle PDF export

  const handleExportPDF = () => {

    const elementId = activeTab === 'overview' ? 'overview-content' : 

                     activeTab === 'students' ? 'student-content' : 

                     'teacher-content';

    const filename = `${activeTab}-report-${new Date().toISOString().split('T')[0]}`;

    

    const success = exportToPDF(elementId, filename);

    if (!success) {

      alert('Failed to export PDF. Please try again.');

    }

  };



  return (

    <div className="flex h-screen overflow-hidden bg-slate-50">

      <AdminSidebar />



      <main className="flex-1 overflow-y-auto">

        <AdminMobileNav />

        {/* Header */}

        <header className="h-auto min-h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10 px-4 md:px-8 py-3 md:py-0 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">

          <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-8 w-full md:w-auto">

            <div>

              <h1 className="text-lg md:text-xl font-black text-slate-900">Visual Reports</h1>

              <p className="text-xs text-slate-500 font-bold hidden md:block">Comprehensive performance analytics.</p>

            </div>

            

            <nav className="flex bg-slate-100 p-1 rounded-xl overflow-x-auto w-full md:w-auto">

              {(['overview', 'students', 'teachers'] as const).map((tab) => (

                <button

                  key={tab}

                  onClick={() => setActiveTab(tab)}

                  className={cn(

                    "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",

                    activeTab === tab ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"

                  )}

                >

                  {tab}

                </button>

              ))}

            </nav>

          </div>

          

          <div className="flex items-center gap-4">

            <button 

              onClick={handleExportPDF}

              className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"

            >

              <Download className="w-4 h-4" />

              Export PDF

            </button>

          </div>

        </header>



        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 pb-24 md:pb-8">

          {loading ? (

            <div className="flex items-center justify-center h-64">

              <div className="text-center">

                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>

                <p className="text-slate-500 font-medium">Loading reports...</p>

              </div>

            </div>

          ) : error ? (

            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6">

              <div className="flex items-center gap-3">

                <div className="size-10 rounded-full bg-rose-100 flex items-center justify-center">

                  <span className="text-rose-600 font-bold">!</span>

                </div>

                <div>

                  <h3 className="font-black text-rose-900">Error Loading Reports</h3>

                  <p className="text-rose-700 text-sm mt-1">{error}</p>

                </div>

              </div>

            </div>

          ) : (

          <AnimatePresence mode="wait">

            {activeTab === 'students' ? (

              <motion.div 

                key="student-reports"

                id="student-content"

                initial={{ opacity: 0, y: 20 }}

                animate={{ opacity: 1, y: 0 }}

                exit={{ opacity: 0, y: -20 }}

                className="space-y-8"

              >

                {/* Filters */}

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap gap-6 items-end">

                  <div className="space-y-2">

                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Generation</label>

                    <select 

                      value={selectedGen}

                      onChange={(e) => {

                        setSelectedGen(e.target.value);

                        setSelectedClass('All');

                        setSelectedGender('All');

                      }}

                      className="block w-full md:w-48 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"

                    >

                      <option value="All">All Generations</option>

                      {filterOptions?.generations.map(gen => <option key={gen} value={gen}>{gen}</option>)}

                    </select>

                  </div>



                  <div className="space-y-2">

                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Class</label>

                    <select 

                      disabled={selectedGen === 'All'}

                      value={selectedClass}

                      onChange={(e) => {

                        setSelectedClass(e.target.value);

                        setSelectedGender('All');

                      }}

                      className="block w-full md:w-48 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"

                    >

                      <option value="All">All Classes</option>

                      {availableClasses.map(c => <option key={c} value={c}>{c}</option>)}

                    </select>

                  </div>



                  <div className="space-y-2">

                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gender</label>

                    <select 

                      disabled={selectedClass === 'All'}

                      value={selectedGender}

                      onChange={(e) => setSelectedGender(e.target.value === 'All' ? 'All' : e.target.value)}

                      className="block w-64 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"

                    >

                      <option value="All">All Genders</option>

                      <option value="male">Male</option>

                      <option value="female">Female</option>

                    </select>

                  </div>



                  <button 

                    onClick={() => {

                      setSelectedGen('All');

                      setSelectedClass('All');

                      setSelectedGender('All');

                    }}

                    className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-rose-500 transition-colors"

                  >

                    Reset Filters

                  </button>

                </div>



                {/* Performance Charts */}

                {studentReportsLoading ? (

                  <div className="flex items-center justify-center h-64">

                    <div className="text-center">

                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>

                      <p className="text-slate-500 font-medium">Loading student reports...</p>

                    </div>

                  </div>

                ) : (

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                  <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">

                    <div className="flex items-center justify-between mb-8">

                      <div>

                        <h3 className="text-lg font-black text-slate-900">

                          {selectedStudentId !== 'All' ? 'Individual Performance' : 

                           selectedClass !== 'All' ? `Class ${selectedClass} Performance` :

                           selectedGen !== 'All' ? `${selectedGen} Performance` : 'Overall Student Performance'}

                        </h3>

                        <p className="text-xs text-slate-500 font-bold">Detailed breakdown by criteria</p>

                      </div>

                      <div className="size-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">

                        <BarChart3 className="w-5 h-5" />

                      </div>

                    </div>



                    <div className="h-[400px] w-full">

                      <ResponsiveContainer width="100%" height="100%">

                        <BarChart data={currentReportData}>

                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />

                          <XAxis 

                            dataKey="subject" 

                            axisLine={false} 

                            tickLine={false} 

                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}

                          />

                          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} domain={[0, 100]} />

                          <Tooltip 

                            cursor={{ fill: '#f8fafc' }}

                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}

                          />

                          <Bar dataKey="score" fill="#5d5fef" radius={[6, 6, 0, 0]} barSize={40} />

                        </BarChart>

                      </ResponsiveContainer>

                    </div>

                  </div>



                  <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">

                    <h3 className="text-lg font-black text-slate-900 mb-8">Radar Analysis</h3>

                    <div className="h-[300px] w-full">

                      <ResponsiveContainer width="100%" height="100%">

                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={currentReportData}>

                          <PolarGrid stroke="#e2e8f0" />

                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} />

                          <Radar

                            name="Score"

                            dataKey="score"

                            stroke="#5d5fef"

                            strokeWidth={3}

                            fill="#5d5fef"

                            fillOpacity={0.2}

                          />

                        </RadarChart>

                      </ResponsiveContainer>

                    </div>

                    

                    <div className="mt-8 space-y-4">

                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Key Insights</h4>

                      <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">

                        <p className="text-xs font-bold text-emerald-700">Strongest Area</p>

                        <p className="text-sm font-black text-emerald-900 mt-1">

                          {currentReportData.reduce((prev, curr) => prev.score > curr.score ? prev : curr).subject}

                        </p>

                      </div>

                      <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100">

                        <p className="text-xs font-bold text-rose-700">Growth Opportunity</p>

                        <p className="text-sm font-black text-rose-900 mt-1">

                          {currentReportData.reduce((prev, curr) => prev.score < curr.score ? prev : curr).subject}

                        </p>

                      </div>

                    </div>

                  </div>

                </div>

                )}

              </motion.div>

            ) : activeTab === 'teachers' ? (

              <motion.div 

                key="teacher-reports"

                id="teacher-content"

                initial={{ opacity: 0, y: 20 }}

                animate={{ opacity: 1, y: 0 }}

                exit={{ opacity: 0, y: -20 }}

                className="space-y-8"

              >

                {/* Teacher reporting content */}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                  <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">

                    <h3 className="text-lg font-black text-slate-900 mb-6">Evaluation Status</h3>

                    <div className="h-[250px] w-full">

                      <ResponsiveContainer width="100%" height="100%">

                        <PieChart>

                          <Pie

                            data={teacherReports?.evaluationStatus || [

                              { name: 'Completed', value: 0, color: '#5d5fef' },

                              { name: 'In Progress', value: 0, color: '#fbbf24' },

                              { name: 'Not Started', value: 0, color: '#f43f5e' },

                            ]}

                            cx="50%"

                            cy="50%"

                            innerRadius={60}

                            outerRadius={80}

                            paddingAngle={8}

                            dataKey="value"

                          >

                            {(teacherReports?.evaluationStatus || [

                              { name: 'Completed', value: 0, color: '#5d5fef' },

                              { name: 'In Progress', value: 0, color: '#fbbf24' },

                              { name: 'Not Started', value: 0, color: '#f43f5e' },

                            ]).map((entry, index) => (

                              <Cell key={`cell-${index}`} fill={entry.color} />

                            ))}

                          </Pie>

                          <Tooltip />

                        </PieChart>

                      </ResponsiveContainer>

                    </div>

                  </div>

                  

                  <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">

                    <h3 className="text-lg font-black text-slate-900 mb-8">Top Performing Teachers</h3>

                    <div className="space-y-6">

                      {teacherReports?.teacherPerformance.slice(0, 3).map((teacher, idx) => (

                        <div key={teacher.id} className="flex items-center justify-between group">

                          <div className="flex items-center gap-4">

                            <div className="size-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-lg group-hover:bg-primary/10 group-hover:text-primary transition-colors">

                              {idx + 1}

                            </div>

                            <div>

                              <p className="text-sm font-black text-slate-900">{teacher.name}</p>

                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{teacher.department} Department</p>

                            </div>

                          </div>

                          <div className="flex items-center gap-8">

                            <div className="text-right">

                              <p className="text-sm font-black text-slate-900">{teacher.rating}</p>

                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avg Rating</p>

                            </div>

                            <div className="text-right">

                              <p className="text-sm font-black text-slate-900">{teacher.evaluations}</p>

                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Evaluations</p>

                            </div>

                          </div>

                        </div>

                      ))}

                    </div>

                  </div>

                </div>

              </motion.div>

            ) : (

              <motion.div 

                key="overview-reports"

                id="overview-content"

                initial={{ opacity: 0, y: 20 }}

                animate={{ opacity: 1, y: 0 }}

                exit={{ opacity: 0, y: -20 }}

                className="space-y-8"

              >

                {/* Overview Stats */}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">

                    <div className="flex items-center justify-between mb-4">

                      <div className="size-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">

                        <TrendingUp className="w-5 h-5" />

                      </div>

                      <span className="text-emerald-600 text-[10px] font-black flex items-center gap-1">

                        <ArrowUpRight className="w-3 h-3" />

                        +4.2%

                      </span>

                    </div>

                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Avg Student Score</p>

                    <p className="text-3xl font-black text-slate-900">{overviewStats?.avgStudentScore || '0.00'} <span className="text-sm text-slate-400 font-medium">/ 5.0</span></p>

                  </div>



                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">

                    <div className="flex items-center justify-between mb-4">

                      <div className="size-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">

                        <UserCheck className="w-5 h-5" />

                      </div>

                      <span className="text-emerald-600 text-[10px] font-black flex items-center gap-1">

                        <ArrowUpRight className="w-3 h-3" />

                        +12%

                      </span>

                    </div>

                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Teacher Completion</p>

                    <p className="text-3xl font-black text-slate-900">{overviewStats?.teacherCompletion || '0.0'}%</p>

                  </div>



                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">

                    <div className="flex items-center justify-between mb-4">

                      <div className="size-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">

                        <Target className="w-5 h-5" />

                      </div>

                      <span className="text-rose-600 text-[10px] font-black flex items-center gap-1">

                        <ArrowDownRight className="w-3 h-3" />

                        -2.1%

                      </span>

                    </div>

                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Pending Evaluations</p>

                    <p className="text-3xl font-black text-slate-900">{overviewStats?.pendingEvaluations || 0}</p>

                  </div>

                </div>



                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">

                  <div className="flex items-center justify-between mb-8">

                    <h3 className="text-lg font-black text-slate-900">Performance Trend</h3>

                    <div className="flex gap-4">

                      <div className="flex items-center gap-2">

                        <div className="size-3 rounded-full bg-primary" />

                        <span className="text-[10px] font-bold text-slate-500 uppercase">Student Avg</span>

                      </div>

                    </div>

                  </div>

                  <div className="h-[400px] w-full">

                    <ResponsiveContainer width="100%" height="100%">

                      <LineChart data={overviewStats?.trendData || []}>

                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />

                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />

                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />

                        <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />

                        <Line type="monotone" dataKey="studentAvg" stroke="#5d5fef" strokeWidth={4} dot={{ r: 6, fill: '#fff', stroke: '#5d5fef', strokeWidth: 3 }} />

                      </LineChart>

                    </ResponsiveContainer>

                  </div>

                </div>

              </motion.div>

            )}

          </AnimatePresence>

          )}

        </div>

      </main>

    </div>

  );

}



