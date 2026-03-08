import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, BookOpen, FileText, Shield, BarChart3, Users, Clock, 
  ChevronRight, ChevronDown, Search, Bell, Upload, CheckCircle, AlertTriangle,
  XCircle, Download, Filter, Calendar, MoreHorizontal, ArrowUpRight, ArrowDownRight,
  Target, Award, Briefcase, GraduationCap, Zap, Eye, ChevronLeft
} from 'lucide-react';
import { fetchJson } from './lib/api';

// ============================================
// DESIGN SYSTEM & CONFIGURATION
// ============================================

const theme = {
  colors: {
    // Sophisticated warm palette
    background: '#F8F6F1',
    backgroundPattern: 'rgba(200, 195, 185, 0.15)',
    surface: '#FEFDFB',
    surfaceHover: '#F5F3EE',
    
    // Text hierarchy - softer contrast
    textPrimary: '#2D2A26',
    textSecondary: '#5A5752',
    textTertiary: '#8A8680',
    
    // Accent system - muted professional tones
    trendBlue: '#4A7C59',
    trendBlueLight: '#E8F5E9',
    successGreen: '#2D6A4F',
    successGreenLight: '#D8F3DC',
    warningAmber: '#B68900',
    warningAmberLight: '#FFF8E1',
    dangerRed: '#9B2335',
    dangerRedLight: '#FFEBEE',
    
    // Neutral system - warmer grays
    border: '#E8E4DE',
    borderLight: '#F2EFE9',
    
    // Chart colors - sophisticated tones
    chartPrimary: '#2D6A4F',
    chartSecondary: '#52796F',
    chartTertiary: '#84A98C',
  },
  fonts: {
    display: '"DM Serif Display", Georgia, serif',
    heading: '"DM Sans", -apple-system, sans-serif',
    body: '"Inter", -apple-system, sans-serif',
  },
  shadows: {
    card: '0 2px 8px rgba(45, 42, 38, 0.06)',
    cardHover: '0 8px 24px rgba(45, 42, 38, 0.12)',
    elevated: '0 12px 48px rgba(45, 42, 38, 0.15)',
  }
};

// ============================================
// MOCK DATA
// ============================================

const trendingRoles = [
  { id: 1, title: 'AI Product Manager', growth: '+34%', category: 'Tech', sparkline: [40, 45, 52, 58, 65, 72, 80] },
  { id: 2, title: 'Climate Data Analyst', growth: '+28%', category: 'Data', sparkline: [30, 35, 42, 48, 55, 60, 68] },
  { id: 3, title: 'UX Research Lead', growth: '+22%', category: 'Design', sparkline: [50, 52, 55, 58, 62, 65, 70] },
  { id: 4, title: 'Sustainability Consultant', growth: '+19%', category: 'Business', sparkline: [35, 38, 42, 45, 48, 52, 56] },
  { id: 5, title: 'Cloud Security Engineer', growth: '+31%', category: 'Tech', sparkline: [45, 48, 55, 62, 68, 75, 82] },
  { id: 6, title: 'Health Tech Strategist', growth: '+25%', category: 'Business', sparkline: [25, 30, 35, 42, 48, 55, 62] },
];

function toSentenceCase(value) {
  if (!value) return '';
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const resumeResult = {
  overallScore: 72,
  skillsMatch: { score: 85, status: 'strong', missing: ['TensorFlow', 'MLOps'] },
  projectStrength: { score: 68, status: 'moderate', feedback: 'Add quantified impact' },
  atsStructure: { score: 90, status: 'strong', feedback: 'Well-structured' },
  roleFit: { score: 65, status: 'needs-work', feedback: 'Highlight AI experience' },
  suggestions: [
    'Add specific metrics to your ML projects (e.g., "improved accuracy by 15%")',
    'Include experience with cloud ML platforms',
    'Strengthen the "Technical Skills" section with trending tools',
  ],
};

const adminStats = {
  resumesAnalyzed: 342,
  commonMissingSkill: 'Python',
  weakProjects: '42%',
  mostTargetedRole: 'Data Scientist',
};

const defaultResumeTargetRoles = [
  { slug: 'ai-product-manager', title: 'AI Product Manager' },
];

const weeklyReport = {
  snapshot: {
    newResumes: 47,
    avgReadiness: 68,
    criticalGaps: 12,
    trendingUp: true,
  },
  topWeakAreas: [
    { skill: 'Machine Learning', affected: '34%', trend: 'rising' },
    { skill: 'Cloud Platforms', affected: '28%', trend: 'stable' },
    { skill: 'Data Visualization', affected: '25%', trend: 'rising' },
    { skill: 'Product Metrics', affected: '22%', trend: 'rising' },
    { skill: 'API Development', affected: '19%', trend: 'stable' },
  ],
  roleGaps: [
    { role: 'Data Scientist', readiness: 58, trend: -3 },
    { role: 'Product Manager', readiness: 72, trend: +5 },
    { role: 'UX Designer', readiness: 81, trend: +2 },
    { role: 'Software Engineer', readiness: 76, trend: +4 },
  ],
};

// ============================================
// UTILITY COMPONENTS
// ============================================

const Sparkline = ({ data, color = theme.colors.chartPrimary, width = 60, height = 24 }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');
  
  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={width} cy={height - ((data[data.length - 1] - min) / range) * height} r="3" fill={color} />
    </svg>
  );
};

const ProgressRing = ({ progress, size = 120, strokeWidth = 10, color = theme.colors.successGreen }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;
  
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={theme.colors.borderLight}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease-out' }}
        />
      </svg>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
      }}>
        <span style={{ 
          fontFamily: theme.fonts.heading, 
          fontSize: '28px', 
          fontWeight: 700,
          color: theme.colors.textPrimary 
        }}>
          {progress}%
        </span>
      </div>
    </div>
  );
};

const SkillChip = ({ name, level, size = 'medium' }) => {
  const colors = {
    core: { bg: '#E8F5E9', text: '#1B5E20', border: '#A5D6A7' },
    rising: { bg: '#F3E5F5', text: '#4A148C', border: '#CE93D8' },
    optional: { bg: theme.colors.borderLight, text: theme.colors.textSecondary, border: theme.colors.border },
  };
  const c = colors[level] || colors.optional;
  
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: size === 'small' ? '3px 8px' : '5px 10px',
      backgroundColor: c.bg,
      color: c.text,
      border: `1px solid ${c.border}`,
      borderRadius: '6px',
      fontFamily: theme.fonts.body,
      fontSize: size === 'small' ? '11px' : '12px',
      fontWeight: 500,
    }}>
      {name}
      {level === 'rising' && <TrendingUp size={12} />}
    </span>
  );
};

const Card = ({ children, style = {}, hover = true, onClick }) => (
  <div 
    onClick={onClick}
    style={{
      backgroundColor: theme.colors.surface,
      borderRadius: '12px',
      border: `1px solid ${theme.colors.border}`,
      boxShadow: theme.shadows.card,
      transition: hover ? 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)' : undefined,
      cursor: onClick ? 'pointer' : undefined,
      overflow: 'hidden',
      ...style,
    }}
    onMouseEnter={hover ? (e) => {
      e.currentTarget.style.boxShadow = theme.shadows.cardHover;
      e.currentTarget.style.borderColor = '#D8D4CE';
    } : undefined}
    onMouseLeave={hover ? (e) => {
      e.currentTarget.style.boxShadow = theme.shadows.card;
      e.currentTarget.style.borderColor = theme.colors.border;
    } : undefined}
  >
    {children}
  </div>
);

const StatusBadge = ({ status, text }) => {
  const colors = {
    strong: { bg: '#E8F5E9', text: '#1B5E20' },
    moderate: { bg: '#FFF3E0', text: '#E65100' },
    'needs-work': { bg: '#FFEBEE', text: '#B71C1C' },
  };
  const c = colors[status] || colors.moderate;
  
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '3px 8px',
      backgroundColor: c.bg,
      color: c.text,
      borderRadius: '4px',
      fontSize: '11px',
      fontWeight: 600,
      letterSpacing: '0.3px',
    }}>
      {status === 'strong' && <CheckCircle size={11} />}
      {status === 'moderate' && <AlertTriangle size={11} />}
      {status === 'needs-work' && <XCircle size={11} />}
      {text}
    </span>
  );
};

// ============================================
// PAGE COMPONENTS
// ============================================

const Navigation = ({ currentPage, setPage, isAdmin }) => (
  <nav style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: '64px',
    backgroundColor: 'rgba(254, 253, 251, 0.95)',
    backdropFilter: 'blur(8px)',
    borderBottom: `1px solid ${theme.colors.border}`,
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 48px',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '10px',
        cursor: 'pointer',
      }} onClick={() => setPage('home')}>
        <div style={{
          width: '36px',
          height: '36px',
          backgroundColor: theme.colors.successGreen,
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <GraduationCap size={20} color="white" />
        </div>
        <span style={{
          fontFamily: theme.fonts.display,
          fontSize: '22px',
          fontWeight: 400,
          color: theme.colors.textPrimary,
        }}>CareerPath</span>
      </div>
      
      <div style={{ display: 'flex', gap: '8px' }}>
        {[
          { id: 'home', label: 'Home' },
          { id: 'trends', label: 'Trends' },
          { id: 'resume', label: 'Resume Check' },
          ...(isAdmin ? [{ id: 'admin', label: 'Admin' }] : []),
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setPage(item.id)}
            style={{
              padding: '8px 16px',
              backgroundColor: currentPage === item.id ? theme.colors.background : 'transparent',
              color: currentPage === item.id ? theme.colors.textPrimary : theme.colors.textSecondary,
              border: 'none',
              borderRadius: '8px',
              fontFamily: theme.fonts.body,
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
    
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        backgroundColor: theme.colors.background,
        borderRadius: '10px',
        border: `1px solid ${theme.colors.border}`,
      }}>
        <Search size={16} color={theme.colors.textTertiary} />
        <span style={{ fontSize: '14px', color: theme.colors.textTertiary }}>Search roles, skills...</span>
        <span style={{
          padding: '2px 6px',
          backgroundColor: theme.colors.surface,
          borderRadius: '4px',
          fontSize: '12px',
          color: theme.colors.textTertiary,
          border: `1px solid ${theme.colors.border}`,
        }}>⌘K</span>
      </div>
      
      <button style={{
        width: '40px',
        height: '40px',
        borderRadius: '10px',
        border: `1px solid ${theme.colors.border}`,
        backgroundColor: theme.colors.surface,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        position: 'relative',
      }}>
        <Bell size={18} color={theme.colors.textSecondary} />
        <span style={{
          position: 'absolute',
          top: '8px',
          right: '10px',
          width: '8px',
          height: '8px',
          backgroundColor: theme.colors.dangerRed,
          borderRadius: '50%',
          border: `2px solid ${theme.colors.surface}`,
        }} />
      </button>
      
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '6px 12px 6px 6px',
        backgroundColor: theme.colors.background,
        borderRadius: '24px',
        border: `1px solid ${theme.colors.border}`,
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          backgroundColor: theme.colors.trendBlueLight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span style={{ fontSize: '14px', fontWeight: 600, color: theme.colors.trendBlue }}>SM</span>
        </div>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: theme.colors.textPrimary }}>Sarah Mitchell</div>
          <div style={{ fontSize: '11px', color: theme.colors.textTertiary }}>Student</div>
        </div>
        <ChevronDown size={14} color={theme.colors.textTertiary} />
      </div>
    </div>
  </nav>
);

const AdminSubNav = ({ currentPage, setPage }) => (
  <div style={{
    display: 'flex',
    gap: '8px',
    padding: '8px',
    backgroundColor: theme.colors.surface,
    borderRadius: '12px',
    border: `1px solid ${theme.colors.border}`,
    marginBottom: '24px',
  }}>
    {[
      { id: 'admin', label: 'Overview' },
      { id: 'admin-weak', label: 'Weak Areas' },
      { id: 'admin-reports', label: 'Reports' },
      { id: 'admin-students', label: 'Students' },
    ].map(item => (
      <button
        key={item.id}
        onClick={() => setPage(item.id)}
        style={{
          padding: '10px 20px',
          backgroundColor: currentPage === item.id ? theme.colors.successGreen : 'transparent',
          color: currentPage === item.id ? 'white' : theme.colors.textSecondary,
          border: 'none',
          borderRadius: '8px',
          fontFamily: theme.fonts.body,
          fontSize: '14px',
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
      >
        {item.label}
      </button>
    ))}
  </div>
);

const HomePage = ({ setPage, homeData, onOpenRoleGuide }) => {
  const hero = homeData?.hero ?? {
    headline: 'See which careers are rising, what to learn, and where students are falling behind',
    subheadline: 'Data-driven career insights to help you make informed decisions about your professional future',
    primaryCta: 'Explore Trends',
    secondaryCta: 'Upload Resume',
  };
  const featuredRoles = homeData?.trendingRoles ?? trendingRoles.slice(0, 3);
  const collections = homeData?.guideCollections ?? [
    {
      id: 'tech-engineering',
      title: 'Tech & Engineering',
      description: 'From AI Product Managers to Cloud Architects, explore the fastest-growing technical roles',
      countLabel: 'Explore 24 roles',
      accent: 'tech',
    },
    {
      id: 'data-analytics',
      title: 'Data & Analytics',
      description: 'Data Scientists, Analysts, and ML Engineers shaping the future of business intelligence',
      countLabel: 'Explore 18 roles',
      accent: 'data',
    },
  ];
  const adminPreview = homeData?.adminPreview ?? [
    { label: 'Resumes Analyzed', value: '342' },
    { label: 'Top Weakness', value: 'Python' },
    { label: 'Weak Projects', value: '42%' },
    { label: 'Top Target Role', value: 'Data Scientist' },
  ];
  const liveSource = homeData?.liveSource;

  return (
  <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
    {/* Hero Section */}
    <div style={{
      textAlign: 'center',
      padding: '0 0 48px',
    }}>
      <h1 style={{
        fontFamily: theme.fonts.display,
        fontSize: '48px',
        fontWeight: 400,
        color: theme.colors.textPrimary,
        marginBottom: '16px',
        lineHeight: 1.2,
      }}>
        {hero.headline.split(', what to learn,').length > 1 ? (
          <>
            {hero.headline.split(', what to learn,')[0]},<br />
            <span style={{ color: theme.colors.successGreen }}>what to learn,</span>
            {hero.headline.split(', what to learn,')[1]}
          </>
        ) : (
          hero.headline
        )}
      </h1>
      <p style={{
        fontFamily: theme.fonts.body,
        fontSize: '17px',
        color: theme.colors.textSecondary,
        maxWidth: '560px',
        margin: '0 auto 32px',
        lineHeight: 1.6,
      }}>
        {hero.subheadline}
      </p>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <button
          onClick={() => setPage('trends')}
          style={{
            padding: '12px 24px',
            backgroundColor: theme.colors.successGreen,
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontFamily: theme.fonts.body,
            fontSize: '15px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s',
          }}
        >
          <TrendingUp size={18} />
          {hero.primaryCta}
        </button>
        <button
          onClick={() => setPage('resume')}
          style={{
            padding: '12px 24px',
            backgroundColor: 'transparent',
            color: theme.colors.textPrimary,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: '8px',
            fontFamily: theme.fonts.body,
            fontSize: '15px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Upload size={18} />
          {hero.secondaryCta}
        </button>
      </div>
    </div>

    <section style={{ marginBottom: '48px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
      }}>
        <div>
        <h2 style={{
          fontFamily: theme.fonts.heading,
          fontSize: '24px',
          fontWeight: 600,
          color: theme.colors.textPrimary,
          marginBottom: '6px',
        }}>This Week's Live Job Demand</h2>
        <div style={{ fontSize: '13px', color: theme.colors.textTertiary }}>
          Source: {liveSource?.name ?? 'Remotive'}
          {liveSource?.fallback
            ? ' - live feed unavailable, showing curated fallback roles'
            : ' - ranked from the last 7 days of published postings'}
        </div>
        </div>
        <button
          onClick={() => setPage('trends')}
          style={{
            padding: '10px 16px',
            backgroundColor: theme.colors.surface,
            color: theme.colors.textPrimary,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          View all trends
          <ChevronRight size={16} />
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {featuredRoles.map((role) => (
          <Card key={role.id} onClick={() => onOpenRoleGuide?.(role)}>
            <div style={{ padding: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{
                  padding: '6px 10px',
                  backgroundColor: theme.colors.background,
                  borderRadius: '999px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: theme.colors.textSecondary,
                }}>{role.category}</span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: theme.colors.successGreen }}>{role.growth}</span>
              </div>
              <div style={{ fontSize: '18px', fontWeight: 600, color: theme.colors.textPrimary, marginBottom: '10px' }}>
                {role.title}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Sparkline data={role.sparkline} width={86} height={26} />
                <span style={{ fontSize: '12px', color: theme.colors.textTertiary }}>
                  {role.demandCount ? `${role.demandCount} live postings` : 'Updated weekly'}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>

    {/* This Week's Trending Roles */}
    
    <section style={{ marginBottom: '48px' }}>
      <h2 style={{
        fontFamily: theme.fonts.heading,
        fontSize: '24px',
        fontWeight: 600,
        color: theme.colors.textPrimary,
        marginBottom: '24px',
      }}>Explore Career Paths</h2>
      
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
        }}>
          {collections.map((collection, index) => {
            const isTech = (collection.accent ?? '').includes('tech');
            const accentBg = isTech ? theme.colors.trendBlueLight : theme.colors.successGreenLight;
            const accentColor = isTech ? theme.colors.trendBlue : theme.colors.successGreen;
            const Icon = isTech ? Zap : BarChart3;

            return (
              <Card key={collection.id ?? index} style={{ minHeight: '240px' }}>
                <div style={{ 
                  padding: '28px',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}>
                  <div>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      backgroundColor: accentBg,
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '20px',
                    }}>
                      <Icon size={24} color={accentColor} />
                    </div>
                    <h3 style={{
                      fontFamily: theme.fonts.heading,
                      fontSize: '20px',
                      fontWeight: 600,
                      color: theme.colors.textPrimary,
                      marginBottom: '8px',
                    }}>{collection.title}</h3>
                    <p style={{ fontSize: '14px', color: theme.colors.textSecondary, lineHeight: 1.5 }}>
                      {collection.description}
                    </p>
                  </div>
                    <button
                      onClick={() => onOpenRoleGuide?.({ title: collection.title, category: collection.accent?.includes('data') ? 'Data' : 'Tech' })}
                      style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '10px 18px',
                      backgroundColor: theme.colors.background,
                      border: 'none',
                      borderRadius: '8px',
                      color: accentColor,
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      alignSelf: 'flex-start',
                    }}>
                    Use in Resume Check
                    <ChevronRight size={16} />
                  </button>
                </div>
              </Card>
            );
          })}
      </div>
    </section>

    {/* Resume Check CTA */}
    <section style={{ marginBottom: '48px' }}>
      <Card style={{ 
        backgroundColor: theme.colors.successGreen,
        border: 'none',
      }}>
        <div style={{ 
          padding: '36px 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ maxWidth: '480px' }}>
            <h2 style={{
              fontFamily: theme.fonts.heading,
              fontSize: '24px',
              fontWeight: 600,
              color: 'white',
              marginBottom: '10px',
            }}>Upload Resume for Readiness Check</h2>
            <p style={{ 
              fontSize: '15px', 
              color: 'rgba(255, 255, 255, 0.9)',
              marginBottom: '20px',
              lineHeight: 1.5,
            }}>
              Get instant feedback on how your resume matches trending roles. Identify missing skills and optimize for ATS.
            </p>
            <button
              onClick={() => setPage('resume')}
              style={{
                padding: '12px 20px',
                backgroundColor: 'white',
                color: theme.colors.successGreen,
                border: 'none',
                borderRadius: '8px',
                fontFamily: theme.fonts.body,
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Upload size={16} />
              Upload Resume
            </button>
          </div>
          <div style={{
            width: '280px',
            height: '180px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              border: '8px solid rgba(255, 255, 255, 0.3)',
              borderTopColor: 'white',
              transform: 'rotate(45deg)',
            }} />
          </div>
        </div>
      </Card>
    </section>

    {/* Admin Preview */}
    
    <section>
      
      <Card style={{ borderColor: theme.colors.trendBlueLight }}
      >
        
        <div style={{ padding: '28px' }}
        >
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: theme.colors.trendBlueLight,
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Shield size={20} color={theme.colors.trendBlue} />
            </div>
            <div>
              <h3 style={{
                fontFamily: theme.fonts.heading,
                fontSize: '18px',
                fontWeight: 600,
                color: theme.colors.textPrimary,
              }}>For Administrators</h3>
              <p style={{ fontSize: '13px', color: theme.colors.textTertiary }}>Weekly Skill Gap Insights</p>
            </div>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '16px',
          }}>
            {[
              { ...adminPreview[0], icon: FileText },
              { ...adminPreview[1], icon: AlertTriangle },
              { ...adminPreview[2], icon: Target },
              { ...adminPreview[3], icon: Briefcase },
            ].map((stat, idx) => (
              <div key={idx} style={{
                padding: '16px',
                backgroundColor: theme.colors.background,
                borderRadius: '12px',
                border: `1px solid ${theme.colors.border}`,
              }}>
                <stat.icon size={16} color={theme.colors.trendBlue} style={{ marginBottom: '8px' }} />
                <div style={{ fontSize: '24px', fontWeight: 700, color: theme.colors.textPrimary, marginBottom: '4px' }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '12px', color: theme.colors.textTertiary }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </section>
  </div>
  );
};

const TrendsPage = ({ initialData, onOpenRoleGuide }) => {
  const [selectedCategory, setSelectedCategory] = useState(initialData?.filters?.categories?.[0] ?? 'All');
  const [selectedWeek, setSelectedWeek] = useState(initialData?.selectedWeek ?? 'This Week');
  const [search, setSearch] = useState('');
  const [trendsData, setTrendsData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedTracks, setExpandedTracks] = useState({});

  function toggleTrack(slug) {
    setExpandedTracks((current) => ({
      ...current,
      [slug]: !current[slug],
    }));
  }

  useEffect(() => {
    let active = true;

    async function loadTrends() {
      setIsLoading(true);
      try {
        const data = await fetchJson('/trends', {
          query: {
            week: selectedWeek,
            category: selectedCategory,
            status: 'rising',
            search,
          },
        });
        if (active) {
          setTrendsData(data);
        }
      } catch (error) {
        if (active) {
          console.error('Failed to load trends', error);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadTrends();
    return () => {
      active = false;
    };
  }, [search, selectedCategory, selectedWeek]);

  const trends = trendsData ?? initialData ?? {
    heroStats: [],
    roles: [],
    skills: [],
    skillsByCategory: [],
    regions: [],
    filters: { weeks: ['This Week'], categories: ['All'], statuses: ['rising'] },
  };
  const statIcons = [TrendingUp, Zap, BarChart3, Clock];

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontFamily: theme.fonts.display,
          fontSize: '36px',
          fontWeight: 400,
          color: theme.colors.textPrimary,
          marginBottom: '8px',
        }}>Career Trends</h1>
        <p style={{ fontSize: '16px', color: theme.colors.textSecondary }}>Real-time insights into the job market</p>
        <p style={{ fontSize: '13px', color: theme.colors.textTertiary, marginTop: '6px' }}>
          Counts: {trends.liveSource?.countsSource ?? trends.liveSource?.name ?? 'Adzuna'} | Examples: {trends.liveSource?.examplesSource ?? 'LinkedIn Jobs Scraper'}
          {trends.liveSource?.examplesFallback ? ` (fallback active: ${trends.liveSource?.examplesReason ?? 'LinkedIn examples unavailable'})` : ''}
        </p>
        {trends.liveSource?.examplesFallback && (
          <div style={{
            marginTop: '12px',
            padding: '12px 14px',
            backgroundColor: theme.colors.background,
            borderRadius: '12px',
            border: `1px solid ${theme.colors.border}`,
            fontSize: '13px',
            color: theme.colors.textSecondary,
            lineHeight: 1.5,
            maxWidth: '760px',
          }}>
            {trends.liveSource?.examplesConfigured
              ? 'LinkedIn is configured but not fully ready in this environment yet, so example postings are currently coming from Adzuna.'
              : 'LinkedIn example postings are not configured yet, so example postings are currently coming from Adzuna.'}
            {trends.liveSource?.examplesReason ? ` ${trends.liveSource.examplesReason}.` : ''}
          </div>
        )}
      </div>

      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '24px',
        gap: '16px',
      }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <select
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
            style={{
              padding: '10px 16px',
              borderRadius: '10px',
              border: `1px solid ${theme.colors.border}`,
              backgroundColor: theme.colors.surface,
              fontFamily: theme.fonts.body,
              fontSize: '14px',
              color: theme.colors.textPrimary,
            }}
          >
            {trends.filters.weeks.map((week) => (
              <option key={week} value={week}>{week}</option>
            ))}
          </select>

          {trends.filters.categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '10px 18px',
                backgroundColor: selectedCategory === cat ? theme.colors.trendBlue : theme.colors.surface,
                color: selectedCategory === cat ? 'white' : theme.colors.textSecondary,
                border: `1px solid ${selectedCategory === cat ? theme.colors.trendBlue : theme.colors.border}`,
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 16px',
          backgroundColor: theme.colors.surface,
          borderRadius: '10px',
          border: `1px solid ${theme.colors.border}`,
        }}>
          <Search size={16} color={theme.colors.textTertiary} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search designation..."
            style={{
              border: 'none',
              background: 'transparent',
              fontSize: '14px',
              outline: 'none',
              width: '180px',
            }}
          />
        </div>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
        marginBottom: '32px',
      }}>
        {trends.heroStats.map((stat, idx) => {
          const Icon = statIcons[idx] ?? TrendingUp;
          return (
            <Card key={`${stat.label}-${idx}`}>
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <Icon size={20} color={theme.colors.trendBlue} />
                  <span style={{ 
                    fontSize: '12px', 
                    fontWeight: 600, 
                    color: stat.change.includes('+') ? theme.colors.successGreen : theme.colors.textTertiary 
                  }}>
                    {stat.change}
                  </span>
                </div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: theme.colors.textPrimary, marginBottom: '4px' }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '12px', color: theme.colors.textTertiary }}>{stat.label}</div>
              </div>
            </Card>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <Card style={{ minHeight: '400px' }}>
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{
                fontFamily: theme.fonts.heading,
                fontSize: '18px',
                fontWeight: 600,
                color: theme.colors.textPrimary,
              }}>Top Job Designations</h3>
              <div style={{
                padding: '6px 12px',
                backgroundColor: theme.colors.background,
                color: theme.colors.textSecondary,
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: 600,
              }}>
                Rising only
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {trends.roles.length === 0 && (
                <div style={{
                  padding: '18px',
                  backgroundColor: theme.colors.background,
                  borderRadius: '12px',
                  border: `1px solid ${theme.colors.border}`,
                  fontSize: '14px',
                  color: theme.colors.textSecondary,
                  lineHeight: 1.5,
                }}>
                  No live designations matched this category and search. Try `All` or clear the search.
                </div>
              )}
              {trends.roles.map((role) => {
                const isExpanded = Boolean(expandedTracks[role.slug]);

                return (
                <div
                  key={role.id}
                  style={{
                    padding: '16px',
                    backgroundColor: theme.colors.background,
                    borderRadius: '12px',
                    border: `1px solid ${theme.colors.border}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onClick={() => toggleTrack(role.slug)}
                >
                  <div style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: theme.colors.textPrimary, marginBottom: '4px' }}>
                          {role.title}
                        </div>
                        <div style={{ fontSize: '12px', color: theme.colors.textTertiary }}>
                          {role.category} - {role.currentCount?.toLocaleString?.() ?? role.demandCount?.toLocaleString?.() ?? '0'} postings this week
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            onOpenRoleGuide?.(role);
                          }}
                          style={{
                            padding: '8px 12px',
                            backgroundColor: theme.colors.surface,
                            color: theme.colors.textPrimary,
                            border: `1px solid ${theme.colors.border}`,
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Check resume
                        </button>
                        <Sparkline data={role.sparkline} width={50} height={20} />
                        <span style={{ fontSize: '16px', fontWeight: 700, color: theme.colors.successGreen }}>
                          {role.growth}
                        </span>
                        {isExpanded ? <ChevronDown size={16} color={theme.colors.textTertiary} /> : <ChevronRight size={16} color={theme.colors.textTertiary} />}
                      </div>
                    </div>

                    {isExpanded && role.liveJobExamples?.length > 0 && (
                      <div style={{
                        marginTop: '14px',
                        paddingTop: '14px',
                        borderTop: `1px solid ${theme.colors.border}`,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                      }}>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: theme.colors.textTertiary, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Live Example Openings ({role.examplesSource === 'linkedin' ? 'LinkedIn' : 'Adzuna backup'})
                        </div>
                        {role.liveJobExamples.map((example, exampleIndex) => (
                          <a
                            key={`${role.slug}-${exampleIndex}`}
                            href={example.url}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(event) => event.stopPropagation()}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              gap: '12px',
                              padding: '12px 14px',
                              backgroundColor: theme.colors.surface,
                              border: `1px solid ${theme.colors.border}`,
                              borderRadius: '10px',
                              textDecoration: 'none',
                            }}
                          >
                            <div>
                              <div style={{ fontSize: '13px', fontWeight: 600, color: theme.colors.textPrimary, marginBottom: '3px' }}>
                                {example.title}
                              </div>
                              <div style={{ fontSize: '12px', color: theme.colors.textTertiary }}>
                                {example.company}
                              </div>
                              {(example.place || example.dateText) && (
                                <div style={{ fontSize: '11px', color: theme.colors.textTertiary, marginTop: '3px' }}>
                                  {[example.place, example.dateText].filter(Boolean).join(' - ')}
                                </div>
                              )}
                            </div>
                            <ArrowUpRight size={15} color={theme.colors.textTertiary} />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        </Card>

        <Card style={{ minHeight: '400px' }}>
          <div style={{ padding: '24px' }}>
            <h3 style={{
              fontFamily: theme.fonts.heading,
              fontSize: '18px',
              fontWeight: 600,
              color: theme.colors.textPrimary,
              marginBottom: '20px',
            }}>Weekly Category Counts</h3>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{
                padding: '16px',
                backgroundColor: theme.colors.background,
                borderRadius: '12px',
                border: `1px solid ${theme.colors.border}`,
                fontSize: '14px',
                color: theme.colors.textSecondary,
                lineHeight: 1.5,
                width: '100%',
              }}>
                Category totals use Adzuna weekly posting counts. Each category page now tracks up to 50 role designations, then shows which titles are contributing most to that volume.
              </div>
            </div>

            <div style={{ marginTop: '32px' }}>
              <h4 style={{
                fontSize: '14px',
                fontWeight: 600,
                color: theme.colors.textPrimary,
                marginBottom: '16px',
              }}>Category Breakdown</h4>

              {(trends.categorySummaries ?? trends.skillsByCategory).map((cat, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 0',
                  borderBottom: idx < trends.skillsByCategory.length - 1 ? `1px solid ${theme.colors.border}` : 'none',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      backgroundColor: theme.colors.background,
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <span style={{ fontSize: '14px', fontWeight: 600 }}>{cat.category[0]}</span>
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 500, color: theme.colors.textPrimary }}>
                        {cat.category}
                      </div>
                      <div style={{ fontSize: '12px', color: theme.colors.textTertiary }}>
                        {cat.openings ?? cat.skills} openings{cat.roleCount ? ` - ${cat.roleCount} tracked roles` : ''}
                      </div>
                      {cat.topDesignations?.length > 0 && (
                        <div style={{ fontSize: '12px', color: theme.colors.textTertiary, marginTop: '4px' }}>
                          Top designations: {cat.topDesignations.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: theme.colors.successGreen }}>
                    {cat.growth}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div style={{ marginTop: '24px' }}>
        <Card>
          <div style={{ padding: '24px' }}>
            <h3 style={{
              fontFamily: theme.fonts.heading,
              fontSize: '18px',
              fontWeight: 600,
              color: theme.colors.textPrimary,
              marginBottom: '20px',
            }}>Regional Interest Rankings</h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
              {trends.regions.length === 0 && (
                <div style={{
                  gridColumn: '1 / -1',
                  padding: '18px',
                  backgroundColor: theme.colors.background,
                  borderRadius: '12px',
                  border: `1px solid ${theme.colors.border}`,
                  fontSize: '14px',
                  color: theme.colors.textSecondary,
                }}>
                  Regional ranking is unavailable from the current live source in this mode.
                </div>
              )}
              {trends.regions.map((region, idx) => (
                <div key={idx} style={{
                  textAlign: 'center',
                  padding: '20px',
                  backgroundColor: theme.colors.background,
                  borderRadius: '12px',
                  border: `1px solid ${theme.colors.border}`,
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: theme.colors.surface,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px',
                    fontSize: '18px',
                    fontWeight: 700,
                    color: theme.colors.textPrimary,
                  }}>
                    {region.rank}
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: theme.colors.textPrimary, marginBottom: '4px' }}>
                    {region.region}
                  </div>
                  <div style={{ fontSize: '12px', color: theme.colors.textTertiary }}>Interest: {region.score}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {isLoading && (
        <div style={{ marginTop: '16px', fontSize: '13px', color: theme.colors.textTertiary }}>
          Refreshing trend data...
        </div>
      )}
    </div>
  );
};

const ResumePage = ({ resumeConfig, initialSelectedRole = '' }) => {
  const targetRoles = resumeConfig?.targetRoles ?? defaultResumeTargetRoles;
  const [selectedRole, setSelectedRole] = useState(initialSelectedRole || targetRoles[0]?.slug || '');
  const [targetRoleSearch, setTargetRoleSearch] = useState('');
  const [resumeText, setResumeText] = useState('Led a student product team, shipped analytics dashboards, and partnered with engineering on feature prioritization.');
  const [resumeFileName, setResumeFileName] = useState('resume.pdf');
  const [resumeFile, setResumeFile] = useState(null);
  const [analysis, setAnalysis] = useState(resumeConfig?.sampleResult ?? resumeResult);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');

  const filteredTargetRoles = targetRoles.filter((role) => {
    const query = targetRoleSearch.trim().toLowerCase();
    if (!query) return true;
    return role.title.toLowerCase().includes(query) || role.category?.toLowerCase().includes(query);
  });

  useEffect(() => {
    if (!filteredTargetRoles.some((role) => role.slug === selectedRole) && filteredTargetRoles[0]?.slug) {
      setSelectedRole(filteredTargetRoles[0].slug);
    }
  }, [filteredTargetRoles, selectedRole]);

  useEffect(() => {
    if (initialSelectedRole && targetRoles.some((role) => role.slug === initialSelectedRole)) {
      setSelectedRole(initialSelectedRole);
      setHasAnalyzed(false);
    }
  }, [initialSelectedRole, targetRoles]);

  async function handleAnalyze() {
    if (!selectedRole) {
      return;
    }

    setIsAnalyzing(true);
    setError('');
    try {
      const body = resumeFile
        ? (() => {
            const formData = new FormData();
            formData.append('targetRole', selectedRole);
            formData.append('resumeFile', resumeFile);
            if (resumeText.trim()) {
              formData.append('resumeText', resumeText);
            }
            formData.append('resumeFileName', resumeFileName || resumeFile.name);
            return formData;
          })()
        : JSON.stringify({
            targetRole: selectedRole,
            resumeText,
            resumeFileName,
          });

      const result = await fetchJson('/resume-check', {
        method: 'POST',
        body,
      });
      setAnalysis(result);
      setHasAnalyzed(true);
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setIsAnalyzing(false);
    }
  }

  if (!hasAnalyzed) {
    return (
      <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <h1 style={{
            fontFamily: theme.fonts.display,
            fontSize: '36px',
            fontWeight: 400,
            color: theme.colors.textPrimary,
            marginBottom: '12px',
          }}>Resume Readiness Check</h1>
          <p style={{ 
            fontSize: '16px', 
            color: theme.colors.textSecondary,
            marginBottom: '40px',
          }}>
            Upload your resume and select a target role to get personalized feedback
          </p>

          <Card style={{ maxWidth: '680px', margin: '0 auto' }}>
            <div style={{ padding: '40px' }}>
              <div style={{
                border: `2px dashed ${theme.colors.border}`,
                borderRadius: '16px',
                padding: '32px',
                textAlign: 'center',
                marginBottom: '24px',
                backgroundColor: theme.colors.background,
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  backgroundColor: theme.colors.surface,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}>
                  <Upload size={28} color={theme.colors.successGreen} />
                </div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: theme.colors.textPrimary, marginBottom: '8px' }}>
                  Resume preview input
                </div>
                <div style={{ fontSize: '14px', color: theme.colors.textTertiary }}>
                  Upload a PDF, DOCX, DOC, or TXT resume, or paste text manually.
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px', textAlign: 'left' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: theme.colors.textPrimary, marginBottom: '8px' }}>
                    Target Role
                  </label>
                  <input
                    value={targetRoleSearch}
                    onChange={(e) => setTargetRoleSearch(e.target.value)}
                    placeholder="Search role or category"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      border: `1px solid ${theme.colors.border}`,
                      backgroundColor: theme.colors.surface,
                      fontSize: '14px',
                      color: theme.colors.textPrimary,
                      marginBottom: '10px',
                    }}
                  />
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    size={Math.min(Math.max(filteredTargetRoles.length, 8), 12)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      border: `1px solid ${theme.colors.border}`,
                      backgroundColor: theme.colors.surface,
                      fontSize: '14px',
                      color: theme.colors.textPrimary,
                      minHeight: '280px',
                    }}
                  >
                    {filteredTargetRoles.map((role) => (
                      <option key={role.slug} value={role.slug}>{role.title}{role.category ? ` - ${role.category}` : ''}</option>
                    ))}
                  </select>
                  <div style={{ marginTop: '8px', fontSize: '12px', color: theme.colors.textTertiary }}>
                    Showing {filteredTargetRoles.length} of {targetRoles.length} tracked roles.
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: theme.colors.textPrimary, marginBottom: '8px' }}>
                    File Name
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        setResumeFile(file);
                        if (file) {
                          setResumeFileName(file.name);
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        border: `1px solid ${theme.colors.border}`,
                        backgroundColor: theme.colors.surface,
                        fontSize: '14px',
                        color: theme.colors.textPrimary,
                      }}
                    />
                    <input
                      value={resumeFileName}
                      onChange={(e) => setResumeFileName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        border: `1px solid ${theme.colors.border}`,
                        backgroundColor: theme.colors.surface,
                        fontSize: '14px',
                        color: theme.colors.textPrimary,
                      }}
                    />
                    <div style={{ fontSize: '12px', color: theme.colors.textTertiary }}>
                      Supported: PDF, Word (`.docx`, `.doc`), or plain text.
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'left' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: theme.colors.textPrimary, marginBottom: '8px' }}>
                  Resume Text
                </label>
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  rows={10}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '10px',
                    border: `1px solid ${theme.colors.border}`,
                    backgroundColor: theme.colors.surface,
                    fontSize: '14px',
                    color: theme.colors.textPrimary,
                    resize: 'vertical',
                    fontFamily: theme.fonts.body,
                  }}
                />
              </div>

              {error && (
                <div style={{ marginTop: '16px', fontSize: '13px', color: theme.colors.dangerRed }}>
                  {error}
                </div>
              )}

              <button
                onClick={handleAnalyze}
                disabled={!selectedRole || isAnalyzing}
                style={{
                  width: '100%',
                  marginTop: '20px',
                  padding: '14px',
                  backgroundColor: !selectedRole || isAnalyzing ? theme.colors.border : theme.colors.successGreen,
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: !selectedRole || isAnalyzing ? 'not-allowed' : 'pointer',
                }}
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze Resume'}
              </button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px', 
        marginBottom: '24px',
        fontSize: '14px',
        color: theme.colors.textTertiary,
      }}>
        <span style={{ cursor: 'pointer' }} onClick={() => setHasAnalyzed(false)}>Resume Check</span>
        <ChevronRight size={14} />
        <span style={{ color: theme.colors.textPrimary, fontWeight: 500 }}>Analysis Results</span>
      </div>

      <Card style={{ marginBottom: '24px' }}>
        <div style={{ padding: '32px', display: 'flex', alignItems: 'center', gap: '40px' }}>
          <ProgressRing progress={analysis.overallScore} size={140} strokeWidth={12} />
          <div style={{ flex: 1 }}>
            <h2 style={{
              fontFamily: theme.fonts.heading,
              fontSize: '24px',
              fontWeight: 600,
              color: theme.colors.textPrimary,
              marginBottom: '8px',
            }}>Overall Readiness Score</h2>
            <p style={{ fontSize: '15px', color: theme.colors.textSecondary, marginBottom: '16px' }}>
              Your resume shows a current fit for {analysis.role?.title ?? 'this target role'}. Focus on closing missing skill gaps and making project impact more measurable.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
              {analysis.input?.resumeFileName && (
                <span style={{ fontSize: '12px', color: theme.colors.textSecondary, backgroundColor: theme.colors.background, padding: '6px 10px', borderRadius: '999px' }}>
                  File: {analysis.input.resumeFileName}
                </span>
              )}
              {analysis.input?.parsedFromFile && (
                <span style={{ fontSize: '12px', color: theme.colors.textSecondary, backgroundColor: theme.colors.background, padding: '6px 10px', borderRadius: '999px' }}>
                  Parsed with {analysis.input.parser ?? 'file parser'}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button style={{
                padding: '10px 18px',
                backgroundColor: theme.colors.successGreen,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                <Download size={16} />
                Download Report
              </button>
              <button
                onClick={() => setHasAnalyzed(false)}
                style={{
                 padding: '10px 18px',
                 backgroundColor: 'transparent',
                 color: theme.colors.textSecondary,
                 border: `1px solid ${theme.colors.border}`,
                 borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
              }}>
                Upload New Resume
              </button>
            </div>
          </div>
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '24px' }}>
        {[
          { label: 'Skills Match', data: analysis.skillsMatch, icon: Zap },
          { label: 'Project Strength', data: analysis.projectStrength, icon: Target },
          { label: 'ATS Structure', data: analysis.atsStructure, icon: CheckCircle },
          { label: 'Role Fit', data: analysis.roleFit, icon: Briefcase },
        ].map((item, idx) => (
          <Card key={idx}>
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: theme.colors.background,
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <item.icon size={20} color={theme.colors.textSecondary} />
                  </div>
                  <span style={{ fontSize: '15px', fontWeight: 600, color: theme.colors.textPrimary }}>
                    {item.label}
                  </span>
                </div>
                <StatusBadge status={item.data.status} text={`${item.data.score}%`} />
              </div>
              <p style={{ fontSize: '14px', color: theme.colors.textSecondary }}>
                {item.data.feedback || (
                  item.data.missing && (
                    <>
                      Missing: <strong>{item.data.missing.join(', ')}</strong>
                    </>
                  )
                )}
              </p>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div style={{ padding: '28px' }}>
          <h3 style={{
            fontFamily: theme.fonts.heading,
            fontSize: '18px',
            fontWeight: 600,
            color: theme.colors.textPrimary,
            marginBottom: '20px',
          }}>Suggested Fixes</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {analysis.suggestions.map((suggestion, idx) => (
              <div key={idx} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '16px',
                backgroundColor: theme.colors.background,
                borderRadius: '10px',
                border: `1px solid ${theme.colors.border}`,
              }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  backgroundColor: theme.colors.warningAmberLight,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <AlertTriangle size={14} color={theme.colors.warningAmber} />
                </div>
                <span style={{ fontSize: '14px', color: theme.colors.textPrimary, lineHeight: 1.5 }}>
                  {suggestion}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card style={{ marginTop: '24px' }}>
        <div style={{ padding: '28px' }}>
          <h3 style={{
            fontFamily: theme.fonts.heading,
            fontSize: '18px',
            fontWeight: 600,
            color: theme.colors.textPrimary,
            marginBottom: '8px',
          }}>Open-Source ATS Tester</h3>
          <p style={{ fontSize: '14px', color: theme.colors.textSecondary, marginBottom: '18px' }}>
            Transparent ATS-style checks based on parseability, keyword coverage, tool mentions, and missing skills from current target-role requirements.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
            <StatusBadge status={analysis.atsReport?.status ?? 'moderate'} text={`${analysis.atsReport?.score ?? 0}%`} />
            <span style={{ fontSize: '14px', color: theme.colors.textSecondary }}>
              ATS compatibility score
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(analysis.atsReport?.checks ?? []).map((check, idx) => (
              <div key={idx} style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '16px',
                padding: '14px 16px',
                backgroundColor: theme.colors.background,
                borderRadius: '10px',
                border: `1px solid ${theme.colors.border}`,
              }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: theme.colors.textPrimary, marginBottom: '4px' }}>{check.label}</div>
                  <div style={{ fontSize: '13px', color: theme.colors.textSecondary }}>{check.detail}</div>
                </div>
                <StatusBadge status={check.status === 'pass' ? 'strong' : check.status === 'warning' ? 'moderate' : 'needs-work'} text={check.status} />
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

const AdminDashboard = ({ setPage, adminData }) => {
  const overview = adminData?.overview ?? adminStats;
  const report = adminData?.weeklyReport ?? weeklyReport;

  return (
  <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
    {/* Admin Header */}
    <div style={{ marginBottom: '32px' }}>
      <h1 style={{
        fontFamily: theme.fonts.display,
        fontSize: '32px',
        fontWeight: 400,
        color: theme.colors.textPrimary,
        marginBottom: '8px',
      }}>Admin Dashboard</h1>
      <p style={{ fontSize: '15px', color: theme.colors.textSecondary }}>
        Weekly academic placement report and student insights
      </p>
    </div>

    <AdminSubNav currentPage="admin" setPage={setPage} />

    {/* Stats Row */}
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '16px',
      marginBottom: '24px',
    }}>
      {[
        { label: 'Resumes Analyzed', value: overview.resumesAnalyzed, change: '+12 this week', icon: FileText },
        { label: 'Most Common Missing Skill', value: overview.commonMissingSkill, subtext: '34% of students', icon: AlertTriangle },
        { label: 'Students Weak in Projects', value: overview.weakProjects, change: '-3% vs last week', icon: Target, negative: true },
        { label: 'Most Targeted Role', value: overview.mostTargetedRole, subtext: '23% of resumes', icon: Briefcase },
      ].map((stat, idx) => (
        <Card key={idx}>
          <div style={{ padding: '20px' }}>
            <stat.icon size={20} color={theme.colors.trendBlue} style={{ marginBottom: '12px' }} />
            <div style={{ fontSize: '13px', color: theme.colors.textTertiary, marginBottom: '4px' }}>
              {stat.label}
            </div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: theme.colors.textPrimary, marginBottom: '4px' }}>
              {stat.value}
            </div>
            {stat.change && (
              <div style={{ 
                fontSize: '12px', 
                color: stat.negative ? theme.colors.dangerRed : theme.colors.successGreen,
                fontWeight: 500,
              }}>
                {stat.change}
              </div>
            )}
            {stat.subtext && (
              <div style={{ fontSize: '12px', color: theme.colors.textTertiary }}>
                {stat.subtext}
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>

    {/* Main Grid */}
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
      {/* Weak Areas Leaderboard */}
      <Card>
        <div style={{ padding: '24px' }}>
          <h3 style={{
            fontFamily: theme.fonts.heading,
            fontSize: '18px',
            fontWeight: 600,
            color: theme.colors.textPrimary,
            marginBottom: '20px',
          }}>Weak Areas Leaderboard</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {report.topWeakAreas.map((area, idx) => (
              <div key={idx} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px',
                backgroundColor: theme.colors.background,
                borderRadius: '10px',
              }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  backgroundColor: theme.colors.surface,
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: theme.colors.textPrimary,
                }}>
                  {idx + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: theme.colors.textPrimary }}>
                    {area.skill}
                  </div>
                  <div style={{ fontSize: '12px', color: theme.colors.textTertiary }}>
                    Trend: {area.trend}
                  </div>
                </div>
                <div style={{
                  padding: '6px 12px',
                  backgroundColor: theme.colors.dangerRedLight,
                  color: theme.colors.dangerRed,
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                }}>
                  {area.affected}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Role-wise Readiness */}
      <Card>
        <div style={{ padding: '24px' }}>
          <h3 style={{
            fontFamily: theme.fonts.heading,
            fontSize: '18px',
            fontWeight: 600,
            color: theme.colors.textPrimary,
            marginBottom: '20px',
          }}>Role-wise Readiness</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {report.roleGaps.map((role, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: theme.colors.textPrimary }}>
                    {role.role}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: theme.colors.textPrimary }}>
                      {role.readiness}%
                    </span>
                    <span style={{ 
                      fontSize: '12px', 
                      color: role.trend > 0 ? theme.colors.successGreen : theme.colors.dangerRed,
                      fontWeight: 500,
                    }}>
                      {role.trend > 0 ? '+' : ''}{role.trend}%
                    </span>
                  </div>
                </div>
                <div style={{
                  height: '8px',
                  backgroundColor: theme.colors.background,
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${role.readiness}%`,
                    height: '100%',
                    backgroundColor: role.readiness >= 70 ? theme.colors.successGreen : 
                                     role.readiness >= 60 ? theme.colors.warningAmber : theme.colors.dangerRed,
                    borderRadius: '4px',
                    transition: 'width 0.5s ease-out',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>

    {/* Trend vs Gap Comparison */}
    <div style={{ marginTop: '24px' }}>
      <Card style={{ borderColor: theme.colors.warningAmber }}>
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{
                fontFamily: theme.fonts.heading,
                fontSize: '18px',
                fontWeight: 600,
                color: theme.colors.textPrimary,
              }}>Market Trend vs Student Readiness</h3>
              <p style={{ fontSize: '14px', color: theme.colors.textSecondary, marginTop: '4px' }}>
                Critical insight: High market demand with low student preparedness
              </p>
            </div>
            <div style={{
              padding: '8px 16px',
              backgroundColor: theme.colors.warningAmberLight,
              borderRadius: '8px',
            }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: theme.colors.warningAmber }}>
                Action Required
              </span>
            </div>
          </div>
          
          <div style={{
            height: '200px',
            backgroundColor: theme.colors.background,
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Simulated Chart */}
            <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
              {/* Grid lines */}
              {[0, 1, 2, 3, 4].map(i => (
                <line key={i} x1="0" y1={40 + i * 40} x2="100%" y2={40 + i * 40} stroke={theme.colors.border} strokeWidth="1" />
              ))}
              
              {/* Market trend line - rising */}
              <polyline
                points="40,140 150,120 260,90 370,70 480,50 590,40 700,35"
                fill="none"
                stroke={theme.colors.successGreen}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              {/* Student readiness line - flat/low */}
              <polyline
                points="40,130 150,135 260,128 370,132 480,130 590,128 700,125"
                fill="none"
                stroke={theme.colors.dangerRed}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="5,5"
              />
            </svg>
            
            <div style={{
              position: 'absolute',
              bottom: '20px',
              right: '20px',
              display: 'flex',
              gap: '20px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '20px', height: '3px', backgroundColor: theme.colors.successGreen, borderRadius: '2px' }} />
                <span style={{ fontSize: '12px', color: theme.colors.textSecondary }}>Market Demand</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '20px', height: '3px', backgroundColor: theme.colors.dangerRed, borderRadius: '2px' }} />
                <span style={{ fontSize: '12px', color: theme.colors.textSecondary }}>Student Readiness</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  </div>
  );
};

const WeeklyReportPage = ({ reportData }) => {
  const report = reportData ?? weeklyReport;

  return (
  <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
    {/* Header */}
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      marginBottom: '32px',
    }}>
      <div>
        <h1 style={{
          fontFamily: theme.fonts.display,
          fontSize: '32px',
          fontWeight: 400,
          color: theme.colors.textPrimary,
          marginBottom: '8px',
        }}>Weekly Report</h1>
        <p style={{ fontSize: '15px', color: theme.colors.textSecondary }}>
          {report.reportWeek ?? 'Week of March 1-7, 2026'}
        </p>
      </div>
      <div style={{ display: 'flex', gap: '12px' }}>
        <button style={{
          padding: '10px 18px',
          backgroundColor: 'transparent',
          border: `1px solid ${theme.colors.border}`,
          borderRadius: '8px',
          color: theme.colors.textSecondary,
          fontSize: '14px',
          fontWeight: 500,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          <ChevronLeft size={16} />
          Previous Week
        </button>
        <button style={{
          padding: '10px 18px',
          backgroundColor: theme.colors.trendBlue,
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          <Download size={16} />
          Export PDF
        </button>
      </div>
    </div>

    {/* Executive Snapshot */}
    <Card style={{ marginBottom: '24px', backgroundColor: theme.colors.trendBlue, border: 'none' }}>
      <div style={{ padding: '32px' }}>
        <h2 style={{
          fontFamily: theme.fonts.heading,
          fontSize: '20px',
          fontWeight: 600,
          color: 'white',
          marginBottom: '20px',
        }}>Executive Snapshot</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
          {[
            { label: 'New Resumes', value: report.snapshot.newResumes, change: '+8%' },
            { label: 'Avg Readiness', value: `${report.snapshot.avgReadiness}%`, change: '+3%' },
            { label: 'Critical Gaps', value: report.snapshot.criticalGaps, change: '-2' },
            { label: 'Trend Status', value: report.snapshot.trendStatus ?? 'Rising', change: 'Positive' },
          ].map((stat, idx) => (
            <div key={idx} style={{
              padding: '20px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
            }}>
              <div style={{ fontSize: '28px', fontWeight: 700, color: 'white', marginBottom: '4px' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '4px' }}>
                {stat.label}
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.9)', fontWeight: 500 }}>
                {stat.change}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>

    {/* Two Column Layout */}
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
      {/* Top 5 Weak Areas */}
      <Card>
        <div style={{ padding: '24px' }}>
          <h3 style={{
            fontFamily: theme.fonts.heading,
            fontSize: '18px',
            fontWeight: 600,
            color: theme.colors.textPrimary,
            marginBottom: '20px',
          }}>Top 5 Weak Areas</h3>
          
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '10px', fontSize: '12px', color: theme.colors.textTertiary, fontWeight: 600 }}>Skill</th>
                <th style={{ textAlign: 'center', padding: '10px', fontSize: '12px', color: theme.colors.textTertiary, fontWeight: 600 }}>Affected</th>
                <th style={{ textAlign: 'right', padding: '10px', fontSize: '12px', color: theme.colors.textTertiary, fontWeight: 600 }}>Trend</th>
              </tr>
            </thead>
            <tbody>
              {report.topWeakAreas.map((area, idx) => (
                <tr key={idx} style={{ borderTop: `1px solid ${theme.colors.border}` }}>
                  <td style={{ padding: '14px 10px', fontSize: '14px', color: theme.colors.textPrimary, fontWeight: 500 }}>
                    {area.skill}
                  </td>
                  <td style={{ padding: '14px 10px', textAlign: 'center' }}>
                    <span style={{
                      padding: '4px 10px',
                      backgroundColor: theme.colors.dangerRedLight,
                      color: theme.colors.dangerRed,
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 600,
                    }}>
                      {area.affected}
                    </span>
                  </td>
                  <td style={{ padding: '14px 10px', textAlign: 'right' }}>
                    <span style={{
                      fontSize: '12px',
                      color: area.trend === 'rising' ? theme.colors.successGreen : theme.colors.textSecondary,
                      fontWeight: 500,
                    }}>
                      {area.trend === 'rising' && <TrendingUp size={12} style={{ display: 'inline', marginRight: '4px' }} />}
                      {area.trend}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Role-wise Gaps */}
      <Card>
        <div style={{ padding: '24px' }}>
          <h3 style={{
            fontFamily: theme.fonts.heading,
            fontSize: '18px',
            fontWeight: 600,
            color: theme.colors.textPrimary,
            marginBottom: '20px',
          }}>Role-wise Gaps</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {report.roleGaps.map((role, idx) => (
              <div key={idx} style={{
                padding: '16px',
                backgroundColor: theme.colors.background,
                borderRadius: '10px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: theme.colors.textPrimary }}>
                    {role.role}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px', fontWeight: 700, color: theme.colors.textPrimary }}>
                      {role.readiness}%
                    </span>
                    <span style={{
                      fontSize: '11px',
                      color: role.trend > 0 ? theme.colors.successGreen : theme.colors.dangerRed,
                      backgroundColor: role.trend > 0 ? theme.colors.successGreenLight : theme.colors.dangerRedLight,
                      padding: '2px 6px',
                      borderRadius: '4px',
                    }}>
                      {role.trend > 0 ? '↑' : '↓'} {Math.abs(role.trend)}%
                    </span>
                  </div>
                </div>
                <div style={{
                  height: '6px',
                  backgroundColor: theme.colors.surface,
                  borderRadius: '3px',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${role.readiness}%`,
                    height: '100%',
                    backgroundColor: role.readiness >= 70 ? theme.colors.successGreen : 
                                     role.readiness >= 60 ? theme.colors.warningAmber : theme.colors.dangerRed,
                    borderRadius: '3px',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>

    {/* High Risk Students */}
    <div style={{ marginTop: '24px' }}>
      <Card style={{ borderColor: theme.colors.dangerRedLight }}>
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{
              fontFamily: theme.fonts.heading,
              fontSize: '18px',
              fontWeight: 600,
              color: theme.colors.textPrimary,
            }}>High-Risk Student Count</h3>
            <span style={{
              padding: '6px 12px',
              backgroundColor: theme.colors.dangerRedLight,
              color: theme.colors.dangerRed,
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: 600,
            }}>{report.highRiskStudentCount ?? 23} Students</span>
          </div>
          <p style={{ fontSize: '14px', color: theme.colors.textSecondary }}>
            Students with overall readiness scores below 50% or critical gaps in 3+ essential skills.
            {' '}Recommended: Schedule 1:1 counseling sessions for the {report.highRiskStudentCount ?? 23} highest-risk students.
          </p>
        </div>
      </Card>
    </div>

    {/* Recommended Actions */}
    <div style={{ marginTop: '24px' }}>
      <Card style={{ backgroundColor: theme.colors.successGreen, border: 'none' }}>
        <div style={{ padding: '24px' }}>
          <h3 style={{
            fontFamily: theme.fonts.heading,
            fontSize: '18px',
            fontWeight: 600,
            color: 'white',
            marginBottom: '16px',
          }}>Recommended Actions This Week</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(report.recommendedActions ?? [
              'Launch Python workshop series - 34% of students need improvement',
              'Schedule 1:1 sessions with 23 high-risk students',
              'Update AI Product Manager guide with new ML requirements',
              'Partner with local tech companies for project-based learning',
            ]).map((action, idx) => (
              <div key={idx} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
              }}>
                <CheckCircle size={18} color="white" />
                <span style={{ fontSize: '14px', color: 'white' }}>{action}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  </div>
  );
};

const WeakAreasPage = ({ setPage, reportData }) => {
  const report = reportData ?? weeklyReport;

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontFamily: theme.fonts.display,
          fontSize: '32px',
          fontWeight: 400,
          color: theme.colors.textPrimary,
          marginBottom: '8px',
        }}>Weak Areas</h1>
        <p style={{ fontSize: '15px', color: theme.colors.textSecondary }}>
          Skills with the largest readiness gap across the student cohort
        </p>
      </div>

      <AdminSubNav currentPage="admin-weak" setPage={setPage} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
        {report.topWeakAreas.map((area, idx) => (
          <Card key={area.skill}>
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '16px', fontWeight: 600, color: theme.colors.textPrimary }}>
                  {idx + 1}. {area.skill}
                </span>
                <StatusBadge status={area.trend === 'rising' ? 'needs-work' : 'moderate'} text={area.affected} />
              </div>
              <div style={{ fontSize: '14px', color: theme.colors.textSecondary, lineHeight: 1.6 }}>
                This skill gap affects {area.affected} of students targeting current market roles. Trend direction: {area.trend}.
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const StudentsPage = ({ setPage, studentsData }) => {
  const studentRows = studentsData ?? [];

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontFamily: theme.fonts.display,
          fontSize: '32px',
          fontWeight: 400,
          color: theme.colors.textPrimary,
          marginBottom: '8px',
        }}>Students</h1>
        <p style={{ fontSize: '15px', color: theme.colors.textSecondary }}>
          Cohort-level readiness and missing skill detail for advising
        </p>
      </div>

      <AdminSubNav currentPage="admin-students" setPage={setPage} />

      <Card>
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 0.7fr 0.8fr 1.6fr', gap: '16px', marginBottom: '12px', fontSize: '12px', fontWeight: 600, color: theme.colors.textTertiary, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            <span>Student</span>
            <span>Target Role</span>
            <span>Readiness</span>
            <span>Risk</span>
            <span>Missing Skills</span>
          </div>
          {studentRows.map((student, idx) => (
            <div key={student.id} style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 1.2fr 0.7fr 0.8fr 1.6fr',
              gap: '16px',
              padding: '16px 0',
              borderTop: idx === 0 ? `1px solid ${theme.colors.border}` : `1px solid ${theme.colors.borderLight}`,
              alignItems: 'center',
            }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: theme.colors.textPrimary }}>{student.name}</div>
                <div style={{ fontSize: '12px', color: theme.colors.textTertiary }}>{student.id}</div>
              </div>
              <div style={{ fontSize: '14px', color: theme.colors.textPrimary }}>{student.targetRole}</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: theme.colors.textPrimary }}>{student.readiness}%</div>
              <StatusBadge
                status={student.risk === 'high' ? 'needs-work' : student.risk === 'moderate' ? 'moderate' : 'strong'}
                text={student.risk}
              />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {student.missingSkills.map((skill) => (
                  <SkillChip key={skill} name={skill} level="optional" size="small" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// ============================================
// MAIN APP COMPONENT
// ============================================

const App = () => {
  const [currentPage, setPage] = useState('home');
  const [isAdmin] = useState(true);
  const [bootstrapData, setBootstrapData] = useState(null);
  const [bootstrapError, setBootstrapError] = useState('');
  const [resumeRolePreset, setResumeRolePreset] = useState('');

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [currentPage]);

  useEffect(() => {
    let active = true;

    async function loadBootstrap() {
      try {
        const data = await fetchJson('/bootstrap');
        if (active) {
          setBootstrapData(data);
        }
      } catch (error) {
        if (active) {
          setBootstrapError(error.message);
        }
      }
    }

    loadBootstrap();
    return () => {
      active = false;
    };
  }, []);

  function openRoleGuide(roleLike) {
    const targetRoles = bootstrapData?.resume?.targetRoles ?? [];
    const matchedRole = targetRoles.find((role) => role.slug === roleLike?.slug)
      ?? targetRoles.find((role) => role.title === roleLike?.title)
      ?? targetRoles.find((role) => role.title === roleLike?.slug);

    setResumeRolePreset(matchedRole?.slug ?? '');
    setPage('resume');
  }

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      backgroundColor: theme.colors.background,
      backgroundImage: `
        linear-gradient(90deg, ${theme.colors.backgroundPattern} 1px, transparent 1px),
        linear-gradient(${theme.colors.backgroundPattern} 1px, transparent 1px)
      `,
      backgroundSize: '40px 40px',
      fontFamily: theme.fonts.body,
      overflowX: 'hidden',
    }}>
      {/* Add Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      
      {/* Global Styles */}
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        html, body {
          overflow-x: hidden;
          background-color: ${theme.colors.background};
        }
        
        body {
          scrollbar-width: thin;
          scrollbar-color: ${theme.colors.border} ${theme.colors.background};
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        
        ::-webkit-scrollbar-thumb {
          background: ${theme.colors.border};
          border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: ${theme.colors.textTertiary};
        }
        
        ::-webkit-scrollbar-corner {
          background: transparent;
        }
      `}</style>
      
      <Navigation currentPage={currentPage} setPage={setPage} isAdmin={isAdmin} />
      
      <main style={{ 
        padding: '120px 48px 48px', 
        maxWidth: '1440px', 
        margin: '0 auto',
        width: '100%',
      }}>
        {!bootstrapData && !bootstrapError && (
          <div style={{ fontSize: '14px', color: theme.colors.textSecondary }}>Loading platform data...</div>
        )}
        {bootstrapError && (
          <div style={{ fontSize: '14px', color: theme.colors.dangerRed }}>Failed to load live data: {bootstrapError}</div>
        )}
         {currentPage === 'home' && <HomePage setPage={setPage} homeData={bootstrapData?.home} onOpenRoleGuide={openRoleGuide} />}
         {currentPage === 'trends' && <TrendsPage initialData={bootstrapData?.trends} onOpenRoleGuide={openRoleGuide} />}
         {currentPage === 'resume' && <ResumePage resumeConfig={bootstrapData?.resume} initialSelectedRole={resumeRolePreset} />}
        {currentPage === 'admin' && <AdminDashboard setPage={setPage} adminData={bootstrapData?.admin} />}
        {currentPage === 'admin-reports' && <WeeklyReportPage reportData={bootstrapData?.admin?.weeklyReport} />}
        {currentPage === 'admin-weak' && <WeakAreasPage setPage={setPage} reportData={bootstrapData?.admin?.weeklyReport} />}
        {currentPage === 'admin-students' && <StudentsPage setPage={setPage} studentsData={bootstrapData?.admin?.students} />}
      </main>
    </div>
  );
};

export default App;
