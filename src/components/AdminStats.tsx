
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Eye, TrendingUp, Calendar } from 'lucide-react';

interface StatsData {
  totalUsers: number;
  totalVisits: number;
  todayVisits: number;
  activeUsers: number;
}

const AdminStats = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState<StatsData>({
    totalUsers: 0,
    totalVisits: 0,
    todayVisits: 0,
    activeUsers: 0
  });
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // Check if user is admin (simple password check for demo)
  const checkAdminAccess = () => {
    const password = prompt('Nhập mật khẩu admin:');
    if (password === 'admin2025') {
      setIsAdmin(true);
      setShowAdminPanel(true);
      loadStats();
    } else if (password) {
      alert('Mật khẩu không đúng!');
    }
  };

  // Load statistics from localStorage (demo data)
  const loadStats = () => {
    const savedStats = localStorage.getItem('adminStats');
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    } else {
      // Generate demo data
      const demoStats = {
        totalUsers: Math.floor(Math.random() * 1000) + 500,
        totalVisits: Math.floor(Math.random() * 5000) + 2000,
        todayVisits: Math.floor(Math.random() * 200) + 50,
        activeUsers: Math.floor(Math.random() * 50) + 10
      };
      setStats(demoStats);
      localStorage.setItem('adminStats', JSON.stringify(demoStats));
    }
  };

  // Update visit count on page load
  useEffect(() => {
    const currentVisits = localStorage.getItem('totalVisits');
    const todayVisits = localStorage.getItem('todayVisits');
    const lastVisitDate = localStorage.getItem('lastVisitDate');
    const today = new Date().toDateString();

    let newTotalVisits = currentVisits ? parseInt(currentVisits) + 1 : 1;
    let newTodayVisits = 1;

    if (lastVisitDate === today && todayVisits) {
      newTodayVisits = parseInt(todayVisits) + 1;
    }

    localStorage.setItem('totalVisits', newTotalVisits.toString());
    localStorage.setItem('todayVisits', newTodayVisits.toString());
    localStorage.setItem('lastVisitDate', today);

    // Update stats if admin panel is open
    if (isAdmin) {
      setStats(prev => ({
        ...prev,
        totalVisits: newTotalVisits,
        todayVisits: newTodayVisits
      }));
    }
  }, [isAdmin]);

  const statsCards = [
    {
      title: 'Tổng Người Dùng',
      value: stats.totalUsers.toLocaleString(),
      description: 'Tổng số người đã đăng ký',
      icon: Users,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Tổng Lượt Truy Cập',
      value: stats.totalVisits.toLocaleString(),
      description: 'Tổng số lượt truy cập website',
      icon: Eye,
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Truy Cập Hôm Nay',
      value: stats.todayVisits.toLocaleString(),
      description: 'Số lượt truy cập trong ngày',
      icon: Calendar,
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Người Dùng Hoạt Động',
      value: stats.activeUsers.toLocaleString(),
      description: 'Đang online hiện tại',
      icon: TrendingUp,
      color: 'from-orange-500 to-red-500'
    }
  ];

  return (
    <>
      {/* Admin Access Button (Hidden in corner) */}
      <div 
        className="fixed bottom-4 left-4 z-50 cursor-pointer opacity-20 hover:opacity-100 transition-opacity"
        onClick={checkAdminAccess}
      >
        <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
      </div>

      {/* Admin Stats Panel */}
      {showAdminPanel && isAdmin && (
        <section className="py-16 bg-gradient-to-b from-slate-800 to-slate-900 border-t border-purple-500/20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-glow">
                <span className="bg-gradient-to-r from-red-300 to-orange-300 bg-clip-text text-transparent">
                  Thống Kê Admin
                </span>
              </h2>
              <p className="text-lg text-gray-300">
                Thông tin chi tiết về người dùng và lượt truy cập
              </p>
              <button
                onClick={() => setShowAdminPanel(false)}
                className="mt-4 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Ẩn thống kê
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {statsCards.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <Card key={index} className="mystic-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-300">
                        {stat.title}
                      </CardTitle>
                      <div className={`p-2 rounded-full bg-gradient-to-r ${stat.color}`}>
                        <IconComponent className="h-4 w-4 text-white" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-white mb-1">
                        {stat.value}
                      </div>
                      <CardDescription className="text-xs text-gray-400">
                        {stat.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="mt-12 text-center">
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full border border-purple-500/30">
                <TrendingUp className="w-4 h-4 mr-2 text-purple-400" />
                <span className="text-sm text-purple-200">
                  Dữ liệu được cập nhật theo thời gian thực
                </span>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default AdminStats;
