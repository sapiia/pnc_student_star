const Evaluation = require('../evaluation/evaluation.model');
const User = require('../user/user.model');

const getOverviewStats = async (req, res) => {
  try {
    const allEvaluations = await Evaluation.findAll();
    const allUsers = await User.findAll();
    
    // Calculate average student score
    const studentEvaluations = allEvaluations.filter(evaluation => {
      const user = allUsers.find(u => u.id === evaluation.user_id);
      return user && user.role === 'student';
    });
    const avgScore = studentEvaluations.length > 0 
      ? (studentEvaluations.reduce((sum, evaluation) => sum + (evaluation.average_score || 0), 0) / studentEvaluations.length).toFixed(2)
      : '0.00';
    
    // Calculate teacher completion rate
    const teacherUsers = allUsers.filter(user => user.role === 'teacher');
    const teachersWithEvaluations = new Set(
      allEvaluations.map(evaluation => evaluation.user_id)
    ).size;
    const teacherCompletion = teacherUsers.length > 0 
      ? ((teachersWithEvaluations / teacherUsers.length) * 100).toFixed(1)
      : '0.0';
    
    // Count pending evaluations (evaluations submitted in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const pendingEvaluations = allEvaluations.filter(evaluation => 
      new Date(evaluation.created_at) >= thirtyDaysAgo
    ).length;
    
    // Calculate trend data (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const recentEvaluations = allEvaluations.filter(evaluation => 
      new Date(evaluation.created_at) >= sixMonthsAgo
    );
    
    // Group by month for trend
    const monthlyData = {};
    const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'];
    months.forEach(month => {
      monthlyData[month] = { month, studentAvg: 0, count: 0 };
    });
    
    recentEvaluations.forEach(evaluation => {
      const user = allUsers.find(u => u.id === evaluation.user_id);
      if (user && user.role === 'student' && evaluation.average_score) {
        const month = new Date(evaluation.created_at).toLocaleString('default', { month: 'short' });
        if (monthlyData[month]) {
          monthlyData[month].studentAvg += evaluation.average_score;
          monthlyData[month].count += 1;
        }
      }
    });
    
    const trendData = Object.values(monthlyData).map(data => ({
      month: data.month,
      studentAvg: data.count > 0 ? (data.studentAvg / data.count).toFixed(1) : '0.0'
    }));
    
    res.json({
      avgStudentScore: parseFloat(avgScore),
      teacherCompletion: parseFloat(teacherCompletion),
      pendingEvaluations,
      trendData
    });
  } catch (err) {
    console.error('Error fetching overview stats:', err);
    res.status(500).json({ error: "Database Error" });
  }
};

const getStudentReports = async (req, res) => {
  try {
    const { generation, className, gender } = req.query;
    
    // Get users based on filters
    let users;
    if (generation || className || gender) {
      users = await User.findByFilters({
        generation,
        class_name: className,
        gender
      });
    } else {
      users = await User.findAll();
    }
    
    // Filter only students
    const students = users.filter(user => user.role === 'student');
    
    if (students.length === 0) {
      return res.json([]);
    }
    
    // Get evaluations for these students
    const studentIds = students.map(s => s.id);
    const evaluations = await Evaluation.findByUserIds(studentIds);
    
    // Calculate average scores for each criterion
    const criteriaScores = {};
    const criteriaCount = {};
    
    evaluations.forEach(evaluation => {
      const criteria = [
        { key: 'living', score: evaluation.living_stars },
        { key: 'jobStudy', score: evaluation.job_study_stars },
        { key: 'humanSupport', score: evaluation.human_support_stars },
        { key: 'health', score: evaluation.health_stars },
        { key: 'feeling', score: evaluation.feeling_stars },
        { key: 'choiceBehavior', score: evaluation.choice_behavior_stars },
        { key: 'moneyPayment', score: evaluation.money_payment_stars },
        { key: 'lifeSkill', score: evaluation.life_skill_stars }
      ];
      
      criteria.forEach(criterion => {
        if (criterion.score) {
          if (!criteriaScores[criterion.key]) {
            criteriaScores[criterion.key] = 0;
            criteriaCount[criterion.key] = 0;
          }
          criteriaScores[criterion.key] += criterion.score;
          criteriaCount[criterion.key] += 1;
        }
      });
    });
    
    // Calculate averages and format response
    const response = Object.keys(criteriaScores).map(key => ({
      subject: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim(),
      score: Math.round((criteriaScores[key] / criteriaCount[key]) * 20), // Convert to percentage (5-star to 100)
      fullMark: 100
    }));
    
    res.json(response);
  } catch (err) {
    console.error('Error fetching student reports:', err);
    res.status(500).json({ error: "Database Error" });
  }
};

const getTeacherReports = async (req, res) => {
  try {
    const allUsers = await User.findAll();
    const allEvaluations = await Evaluation.findAll();
    
    // Get teacher performance data
    const teachers = allUsers.filter(user => user.role === 'teacher');
    const teacherPerformance = teachers.map(teacher => {
      const teacherEvaluations = allEvaluations.filter(evaluation => 
        evaluation.user_id === teacher.id
      );
      
      const avgRating = teacherEvaluations.length > 0
        ? (teacherEvaluations.reduce((sum, evaluation) => sum + (evaluation.average_score || 0), 0) / teacherEvaluations.length).toFixed(1)
        : '0.0';
      
      return {
        id: teacher.id,
        name: `${teacher.first_name || ''} ${teacher.last_name || ''}`.trim() || teacher.name || 'Unknown',
        department: teacher.department || 'General',
        rating: parseFloat(avgRating),
        evaluations: teacherEvaluations.length
      };
    }).sort((a, b) => b.rating - a.rating).slice(0, 10);
    
    // Get evaluation status breakdown
    const evaluationStatus = [
      { name: 'Completed', value: allEvaluations.length, color: '#5d5fef' },
      { name: 'In Progress', value: 0, color: '#fbbf24' },
      { name: 'Not Started', value: 0, color: '#f43f5e' }
    ];
    
    res.json({
      teacherPerformance,
      evaluationStatus
    });
  } catch (err) {
    console.error('Error fetching teacher reports:', err);
    res.status(500).json({ error: "Database Error" });
  }
};

const getFilterOptions = async (req, res) => {
  try {
    const allUsers = await User.findAll();
    
    // Get unique generations from class names
    const generationSet = new Set();
    const classesByGeneration = {};
    
    allUsers.forEach(user => {
      if (user.class) {
        // Extract generation from class name (e.g., "Gen 2026 - WEB DEV - Class WEB A")
        const genMatch = user.class.match(/Gen (\d+)/);
        if (genMatch) {
          const generation = `Gen ${genMatch[1]}`;
          generationSet.add(generation);
          
          if (!classesByGeneration[generation]) {
            classesByGeneration[generation] = [];
          }
          
          // Extract class name (e.g., "WEB DEV - Class WEB A")
          const classMatch = user.class.match(/-\s*(.+)$/);
          if (classMatch) {
            const className = classMatch[1].trim();
            if (!classesByGeneration[generation].includes(className)) {
              classesByGeneration[generation].push(className);
            }
          }
        }
      }
    });
    
    const generations = Array.from(generationSet).sort();
    
    // Sort classes within each generation
    Object.keys(classesByGeneration).forEach(gen => {
      classesByGeneration[gen].sort();
    });
    
    res.json({
      generations,
      classesByGeneration
    });
  } catch (err) {
    console.error('Error fetching filter options:', err);
    res.status(500).json({ error: "Database Error" });
  }
};

module.exports = {
  getOverviewStats,
  getStudentReports,
  getTeacherReports,
  getFilterOptions
};
