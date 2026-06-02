import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { overview, trend } from '@/api';
import { useRequest } from 'ahooks';

// 注册Chart.js组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Dashboard() {
  const { data: oData, loading: overviewLoading } = useRequest(overview);
  const { data: tData, loading: trendLoading, run: fetchTrend } = useRequest(
    (type = 'day') => trend({ type }),
    {
      manual: true,
      onError: (error) => {
        console.error('获取趋势数据失败:', error);
      }
    }
  );

  const oTarget = oData?.data;
  const tTarget = tData?.data;

  // 时间范围切换状态
  const [timeRange, setTimeRange] = useState('day');

  // 当时间范围变化时获取新数据
  useEffect(() => {
    fetchTrend(timeRange);
  }, [timeRange, fetchTrend]);

  // 核心指标卡片组件
  const StatCard = ({ title, value, icon, change, isCurrency = false }: any) => (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100/80 p-6 group">
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1 transition-all duration-300 group-hover:scale-[1.02]">
            {isCurrency ? `¥${Number(value || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : value?.toLocaleString() || 0}
          </p>
          {change !== undefined && (
            <p className={`text-sm font-medium mt-1 flex items-center ${change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              <span className="mr-1">{change >= 0 ? '↑' : '↓'}</span>
              {Math.abs(change).toFixed(1)}%
              <span className="text-gray-400 ml-1.5 font-normal">较上期</span>
            </p>
          )}
        </div>
        <div className={`p-3.5 rounded-xl ${icon.bgColor} transition-all duration-300 group-hover:scale-110 group-hover:shadow-sm`}>
          <div className={icon.color}>{icon.component}</div>
        </div>
      </div>
    </div>
  );

  // 时间范围切换按钮
  const TimeRangeSelector = () => (
    <div className="flex bg-gray-100/80 p-1 rounded-xl w-fit backdrop-blur-sm">
      {['day', 'week', 'month'].map((range) => (
        <button
          key={range}
          onClick={() => setTimeRange(range)}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${timeRange === range
            ? 'bg-white text-blue-600 shadow-sm scale-[1.02]'
            : 'text-gray-600 hover:bg-gray-200/70 hover:text-gray-900'
            }`}
        >
          {range === 'day' && '今日'}
          {range === 'week' && '本周'}
          {range === 'month' && '本月'}
        </button>
      ))}
    </div>
  );

  // 销售趋势图表
  const SalesTrendChart = () => {
    if (!tTarget || !tTarget.dates) return null;

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top' as const,
          align: 'end' as const,
          labels: {
            usePointStyle: true,
            pointStyle: 'circle',
            padding: 24,
            font: {
              size: 13,
              family: 'system-ui, -apple-system, sans-serif'
            },
            boxWidth: 8
          }
        },
        tooltip: {
          mode: 'index' as const,
          intersect: false,
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          titleColor: '#1f2937',
          bodyColor: '#4b5563',
          borderColor: '#e5e7eb',
          borderWidth: 1,
          borderRadius: 12,
          padding: 14,
          displayColors: true,
          boxPadding: 6,
          callbacks: {
            label: function (context: any) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                if (context.dataset.id === 'sales') {
                  label += `¥${context.parsed.y.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                } else {
                  label += context.parsed.y.toLocaleString();
                }
              }
              return label;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.03)',
            drawBorder: false
          },
          ticks: {
            font: {
              size: 12
            },
            color: '#9ca3af'
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            font: {
              size: 12
            },
            color: '#9ca3af'
          }
        }
      },
      interaction: {
        mode: 'nearest' as const,
        axis: 'x' as const,
        intersect: false
      },
      elements: {
        line: {
          borderWidth: 2.5
        },
        point: {
          hoverRadius: 7,
          hoverBorderWidth: 3
        }
      }
    };

    const data = {
      labels: tTarget.dates,
      datasets: [
        {
          id: 'orders',
          label: '订单量',
          data: tTarget.orders,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.08)',
          pointBackgroundColor: '#3b82f6',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
          tension: 0.35,
          fill: true
        },
        {
          id: 'sales',
          label: '销售额',
          data: tTarget.sales,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.08)',
          pointBackgroundColor: '#10b981',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
          tension: 0.35,
          fill: true
        }
      ]
    };

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 pb-4 border-b border-gray-50">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">销售趋势分析</h2>
            <p className="text-gray-500 text-sm mt-0.5">实时追踪订单与销售额变化</p>
          </div>
          <TimeRangeSelector />
        </div>
        <div className="h-96 p-6 pt-4">
          <Line options={options} data={data} />
        </div>
      </div>
    );
  };

  // 商品排行榜组件
  const ProductRanking = () => {
    if (!oTarget?.productRanking || oTarget.productRanking.length === 0) {
      return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div className="text-gray-500 font-medium">暂无商品销售数据</div>
          <div className="text-gray-400 text-sm mt-1">数据将在产生订单后自动更新</div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 overflow-hidden">
        <div className="p-6 pb-4 border-b border-gray-50">
          <h2 className="text-xl font-semibold text-gray-900">商品销售排行榜</h2>
          <p className="text-gray-500 text-sm mt-0.5">按本月销量排序（前10名）</p>
        </div>

        <div className="divide-y divide-gray-50">
          {oTarget.productRanking.slice(0, 10).map((product: any, index: number) => (
            <div
              key={product.productId}
              className={`p-4 flex items-center hover:bg-gray-50 transition-colors duration-200 ${index === 0 ? 'bg-amber-50/60' :
                index === 1 ? 'bg-slate-50/60' :
                  index === 2 ? 'bg-orange-50/60' : ''
                }`}
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center mr-4 font-bold text-sm shadow-sm ${index === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-white' :
                index === 1 ? 'bg-gradient-to-br from-slate-400 to-slate-500 text-white' :
                  index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-500 text-white' :
                    'bg-gray-100 text-gray-600 shadow-none'
                }`}>
                {index + 1}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{product.productName}</p>
                <p className="text-gray-400 text-xs mt-0.5">ID: {product.productId}</p>
              </div>

              <div className="text-right mr-4">
                <p className="font-semibold text-gray-900">{product.totalSales.toLocaleString()}</p>
                <p className="text-gray-400 text-xs">销量</p>
              </div>

              <div className="text-right min-w-[90px]">
                <p className="font-semibold text-gray-900">¥{product.totalAmount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <p className="text-gray-400 text-xs">销售额</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 加载状态（升级骨架屏）
  if (overviewLoading || trendLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="h-9 bg-gray-200 rounded-lg w-48 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-72 animate-pulse"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100/80 h-36">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                    <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-28 animate-pulse"></div>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gray-200 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 h-[480px]">
                <div className="p-6 pb-4 border-b border-gray-50">
                  <div className="h-6 bg-gray-200 rounded w-40 animate-pulse"></div>
                </div>
                <div className="h-[380px] p-6 pt-4">
                  <div className="w-full h-full bg-gray-100 rounded-lg animate-pulse"></div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 h-[480px]">
              <div className="p-6 pb-4 border-b border-gray-50">
                <div className="h-6 bg-gray-200 rounded w-40 animate-pulse"></div>
              </div>
              <div className="divide-y divide-gray-50">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="p-4 flex items-center">
                    <div className="w-9 h-9 rounded-full bg-gray-200 mr-4 animate-pulse"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 主要内容
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* 页面标题 */}
        <div className="mb-8">
          <p className="text-gray-500 mt-2 text-base">查看平台核心业务指标与实时销售趋势</p>
        </div>

        {/* 核心指标卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="今日新增用户"
            value={oTarget?.newUsersToday}
            isCurrency={false}
            change={12.5}
            icon={{
              component: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ),
              bgColor: "bg-blue-50",
              color: "text-blue-500"
            }}
          />

          <StatCard
            title="今日销售总额"
            value={oTarget?.todaySales}
            isCurrency={true}
            change={8.2}
            icon={{
              component: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
              bgColor: "bg-emerald-50",
              color: "text-emerald-500"
            }}
          />

          <StatCard
            title="本月销售总额"
            value={oTarget?.monthSales}
            isCurrency={true}
            change={15.7}
            icon={{
              component: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              ),
              bgColor: "bg-violet-50",
              color: "text-violet-500"
            }}
          />

          <StatCard
            title="本月订单量"
            value={tTarget?.orders?.reduce((sum: any, val: any) => sum + val, 0) || 0}
            isCurrency={false}
            change={18.3}
            icon={{
              component: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              ),
              bgColor: "bg-amber-50",
              color: "text-amber-500"
            }}
          />
        </div>

        {/* 主要内容区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 销售趋势图表 */}
          <div className="lg:col-span-2">
            <SalesTrendChart />
          </div>

          {/* 商品排行榜 */}
          <div>
            <ProductRanking />
          </div>
        </div>
      </div>
    </div>
  );
}