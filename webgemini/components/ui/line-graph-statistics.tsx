"use client"
import React, { useState, useEffect } from 'react';

export const LineGraphStatistics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('Last 30 days');
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const [animationPhase, setAnimationPhase] = useState(0);
  const [chartVisible, setChartVisible] = useState(false);

  type PeriodData = {
    dates: string[];
    mobile: number[];
    desktop: number[];
    peak: number;
    average: number;
    growth: string;
  };

  const data: Record<string, PeriodData> = {
    'Last 30 days': {
      dates: ['Jun 1', 'Jun 3', 'Jun 5', 'Jun 7', 'Jun 9', 'Jun 12', 'Jun 15', 'Jun 18', 'Jun 21', 'Jun 24', 'Jun 27', 'Jun 30'],
      mobile: [290, 270, 310, 280, 260, 350, 320, 340, 400, 370, 420, 480],
      desktop: [200, 180, 220, 255, 230, 280, 260, 270, 300, 285, 310, 320],
      peak: 480,
      average: 315,
      growth: '+12%'
    },
    'Last 7 days': {
      dates: ['Jun 24', 'Jun 25', 'Jun 26', 'Jun 27', 'Jun 28', 'Jun 29', 'Jun 30'],
      mobile: [370, 420, 380, 450, 480, 520, 550],
      desktop: [285, 310, 295, 340, 320, 365, 380],
      peak: 550,
      average: 458,
      growth: '+18%'
    }
  };

  const currentData = data[selectedPeriod];
  const maxValue = Math.max(...currentData.mobile, ...currentData.desktop) * 1.1;

  const generateSmoothPath = (values: number[], height = 300, isArea = false) => {
    const width = 800;
    const padding = 60;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    const points = values.map((value, index) => ({
      x: padding + (index / (values.length - 1)) * chartWidth,
      y: padding + (1 - value / maxValue) * chartHeight
    }));

    if (points.length < 2) return '';

    let path = `M ${points[0].x},${points[0].y}`;
    
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const next = points[i + 1];
      
      const cp1x = prev.x + (curr.x - prev.x) * 0.5;
      const cp1y = prev.y;
      const cp2x = curr.x - (next ? (next.x - curr.x) * 0.3 : 0);
      const cp2y = curr.y;
      
      path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${curr.x},${curr.y}`;
    }
    
    if (isArea) {
      path += ` L ${points[points.length - 1].x},${height - padding} L ${padding},${height - padding} Z`;
    }
    
    return path;
  };

  useEffect(() => {
    setChartVisible(false);
    setAnimationPhase(0);
    
    const timers = [
      setTimeout(() => setAnimationPhase(1), 100),
      setTimeout(() => setAnimationPhase(2), 400),
      setTimeout(() => setAnimationPhase(3), 800),
      setTimeout(() => setChartVisible(true), 1200)
    ];
    
    return () => timers.forEach(clearTimeout);
  }, [selectedPeriod]);

  const periods = [
    { label: 'Last 30 days', size: '1.45 KB', color: 'bg-pink-500' },
    { label: 'Last 7 days', size: '0.89 KB', color: 'bg-purple-500' }
  ];

  const metrics = [
    { label: 'Peak', value: currentData.peak, color: 'border-pink-500', size: '0.25 KB' },
    { label: 'Average', value: currentData.average, color: 'border-purple-500', size: '0.24 KB' },
    { label: 'Growth', value: currentData.growth, color: 'border-rose-500', size: '0.16 KB' }
  ];

  return (
    <div className="w-full bg-white font-light rounded-xl overflow-hidden border border-pink-100 shadow-sm">
      <div className="p-8">
        <div className="mb-12">
          <h2 
            className={`text-4xl font-extralight text-gray-900 mb-2 tracking-tight transition-all duration-1000 ${
              animationPhase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            Platform Visits
          </h2>
        </div>

        <div className="relative bg-white rounded-none">
          <div className="absolute top-0 left-8 z-10 flex gap-8">
            <div 
              className={`flex items-center gap-2 transition-all duration-800 delay-300 ${
                animationPhase >= 2 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
              }`}
            >
              <div className="w-3 h-3 rounded-full border-2 border-pink-500 bg-pink-50"></div>
              <span className="text-gray-700 font-medium">Mobile</span>
              <span className="text-gray-900 font-semibold">{currentData.mobile[currentData.mobile.length - 1]}</span>
            </div>
            <div 
              className={`flex items-center gap-2 transition-all duration-800 delay-400 ${
                animationPhase >= 2 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
              }`}
            >
              <div className="w-3 h-3 rounded-full border-2 border-purple-500 bg-purple-50"></div>
              <span className="text-gray-700 font-medium">Desktop</span>
              <span className="text-gray-900 font-semibold">{currentData.desktop[currentData.desktop.length - 1]}</span>
            </div>
          </div>

          <div className="absolute top-0 right-8 z-10 flex gap-2">
            {periods.map((period, index) => (
              <div
                key={period.label}
                className={`
                  cursor-pointer transition-all duration-700 hover:scale-105
                  ${selectedPeriod === period.label 
                    ? 'bg-gray-900 text-white shadow-md' 
                    : 'bg-white text-gray-700 border border-gray-200'
                  }
                  ${animationPhase >= 2 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}
                  text-sm px-4 py-2 rounded-full
                `}
                style={{ transitionDelay: \`\${200 + index * 100}ms\` }}
                onClick={() => setSelectedPeriod(period.label)}
              >
                {period.label}
              </div>
            ))}
          </div>

          <div className="pt-20 pb-8">
            <div className="h-80 relative">
              <svg className="w-full h-full" viewBox="0 0 800 400" preserveAspectRatio="none">
                <defs>
                  <pattern id="grid" width="40" height="30" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 30" fill="none" stroke="#fdf2f8" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="800" height="400" fill="url(#grid)"/>

                {/* Desktop Area */}
                <path
                  d={generateSmoothPath(currentData.desktop, 340, true)}
                  fill="rgba(168, 85, 247, 0.08)" // purple
                  className={`transition-all duration-2000 ${
                    chartVisible ? 'opacity-100' : 'opacity-0'
                  }`}
                />

                {/* Mobile Area */}
                <path
                  d={generateSmoothPath(currentData.mobile, 340, true)}
                  fill="rgba(236, 72, 153, 0.08)" // pink
                  className={`transition-all duration-2000 ${
                    chartVisible ? 'opacity-100' : 'opacity-0'
                  }`}
                />

                {/* Desktop Line */}
                <path
                  d={generateSmoothPath(currentData.desktop, 340)}
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className={`transition-all duration-2000 ${
                    chartVisible ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{
                    strokeDasharray: chartVisible ? 'none' : '1000',
                    strokeDashoffset: chartVisible ? '0' : '1000',
                  }}
                />

                {/* Mobile Line */}
                <path
                  d={generateSmoothPath(currentData.mobile, 340)}
                  fill="none"
                  stroke="#ec4899"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className={`transition-all duration-2000 ${
                    chartVisible ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{
                    strokeDasharray: chartVisible ? 'none' : '1000',
                    strokeDashoffset: chartVisible ? '0' : '1000',
                  }}
                />

                {/* Data Points */}
                {currentData.dates.map((date, index) => {
                  const padding = 60;
                  const chartWidth = 800 - padding * 2;
                  const chartHeight = 340 - padding * 2;
                  const x = padding + (index / (currentData.dates.length - 1)) * chartWidth;
                  const mobileY = padding + (1 - currentData.mobile[index] / maxValue) * chartHeight;
                  const desktopY = padding + (1 - currentData.desktop[index] / maxValue) * chartHeight;
                  
                  return (
                    <g key={index}>
                      <circle
                        cx={x}
                        cy={desktopY}
                        r={hoveredPoint === index ? 6 : 4}
                        fill="#a855f7"
                        className={`transition-all duration-500 cursor-pointer ${
                          chartVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                        }`}
                        onMouseEnter={() => setHoveredPoint(index)}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                      
                      <circle
                        cx={x}
                        cy={mobileY}
                        r={hoveredPoint === index ? 6 : 4}
                        fill="#ec4899"
                        className={`transition-all duration-500 cursor-pointer ${
                          chartVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                        }`}
                        onMouseEnter={() => setHoveredPoint(index)}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                    </g>
                  );
                })}

                {/* X-axis Labels */}
                {currentData.dates.map((date, index) => {
                  const padding = 60;
                  const chartWidth = 800 - padding * 2;
                  const x = padding + (index / (currentData.dates.length - 1)) * chartWidth;
                  
                  return (
                    <text
                      key={index}
                      x={x}
                      y={365}
                      textAnchor="middle"
                      fill="#9ca3af"
                      fontSize="12"
                      className={`transition-all duration-500 ${
                        chartVisible ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      {date}
                    </text>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
