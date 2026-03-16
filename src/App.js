import React, { useState, useEffect, useRef } from "react";

// ==========================================
// 雲端資料庫模組 (Firebase) 導入
// ==========================================
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
} from "firebase/auth";
import { getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore";

// ==========================================
// 全域雲端環境初始化
// ==========================================
let app, auth, db;
const appId = typeof __app_id !== 'undefined' ? __app_id : "lash-beauty-booking-official";

try {
  const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {
    apiKey: "AIzaSyAMu5uINf-wS9FSuIgZHXA7fgnChmGqAus",
    authDomain: "lash-beauty-booking.firebaseapp.com",
    projectId: "lash-beauty-booking",
    storageBucket: "lash-beauty-booking.firebasestorage.app",
    messagingSenderId: "684286248425",
    appId: "1:684286248425:web:b62b0f6ee2ccb514797778"
  };
  
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (e) {
  console.error("雲端資料庫初始化失敗，將切換為單機模式", e);
}

// ==========================================
// 內建圖示庫
// ==========================================
const Icons = {
  MapPin: ({ size = 24, className = "" }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>),
  AlertCircle: ({ size = 24, className = "" }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>),
  CalendarCheck: ({ size = 24, className = "" }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /><path d="m9 16 2 2 4-4" /></svg>),
  ChevronRight: ({ size = 24, className = "" }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="9 18 15 12 9 6" /></svg>),
  Settings: ({ size = 24, className = "" }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z" /></svg>),
  Save: ({ size = 24, className = "" }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>),
  Plus: ({ size = 24, className = "" }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>),
  Trash2: ({ size = 24, className = "" }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>),
  Eye: ({ size = 24, className = "" }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>),
  Lock: ({ size = 24, className = "" }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>),
  X: ({ size = 24, className = "" }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>),
  Key: ({ size = 24, className = "" }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4" /><path d="m21 2-9.6 9.6" /><circle cx="7.5" cy="15.5" r="5.5" /></svg>),
  Clock: ({ size = 24, className = "" }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>),
  MessageCircle: ({ size = 24, className = "" }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" /></svg>),
  Cloud: ({ size = 24, className = "" }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" /></svg>),
  Search: ({ size = 24, className = "" }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>),
  HelpCircle: ({ size = 24, className = "" }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>),
  Users: ({ size = 24, className = "" }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>),
  Receipt: ({ size = 24, className = "" }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" /><path d="M16 8h-6" /><path d="M16 12h-8" /><path d="M16 16h-8" /></svg>),
  Package: ({ size = 24, className = "" }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16.5 9.4 7.5 4.21" /><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>),
  CalendarDays: ({ size = 24, className = "" }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /><path d="M8 14h.01" /><path d="M12 14h.01" /><path d="M16 14h.01" /><path d="M8 18h.01" /><path d="M12 18h.01" /><path d="M16 18h.01" /></svg>),
  MenuIcon: ({ size = 24, className = "" }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="18" x2="20" y2="18" /></svg>),
  ChevronLeft: ({ size = 24, className = "" }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m15 18-6-6 6-6"/></svg>),
  ChevronRightCircle: ({ size = 24, className = "" }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><path d="m10 8 4 4-4 4"/></svg>),
  ChevronLeftCircle: ({ size = 24, className = "" }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><path d="m14 8-4 4 4 4"/></svg>),
  CreditCard: ({ size = 24, className = "" }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>),
  ShoppingBag: ({ size = 24, className = "" }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>),
  BookmarkPlus: ({ size = 24, className = "" }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" /><line x1="12" y1="7" x2="12" y2="13" /><line x1="15" y1="10" x2="9" y2="10" /></svg>),
  CircleDollarSign: ({ size = 24, className = "" }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" /><path d="M12 18V6" /></svg>),
  Edit: ({ size = 24, className = "" }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>),
  Wand2: ({ size = 24, className = "" }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z"/><path d="m14 7 3 3"/><path d="M5 6v4"/><path d="M19 14v4"/><path d="M10 2v2"/><path d="M7 8H3"/><path d="M21 16h-4"/><path d="M11 3H9"/></svg>),
  CheckCircle: ({ size = 24, className = "" }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>),
  Filter: ({ size = 24, className = "" }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>),
  Bell: ({ size = 24, className = "" }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>)
};

const {
  MapPin, AlertCircle, CalendarCheck, ChevronRight, Settings, Save, Plus, Trash2, Eye, Lock, X, Key, Clock, MessageCircle, Cloud, Search, HelpCircle,
  Users, Receipt, Package, CalendarDays, MenuIcon, ChevronLeft, CreditCard, ShoppingBag, BookmarkPlus, CircleDollarSign, Edit,
  ChevronLeftCircle, ChevronRightCircle, Wand2, CheckCircle, Filter, Bell
} = Icons;

// --- 表單常數設定 ---
const EVENT_COLORS = [
  { id: 'default', colorClass: 'bg-[#C59A5C] border-[#b08850] text-white', hex: '#C59A5C', name: '經典金' },
  { id: 'blue', colorClass: 'bg-blue-500 border-blue-600 text-white', hex: '#3B82F6', name: '深海藍' },
  { id: 'emerald', colorClass: 'bg-emerald-500 border-emerald-600 text-white', hex: '#10B981', name: '薄荷綠' },
  { id: 'amber', colorClass: 'bg-amber-500 border-amber-600 text-white', hex: '#F59E0B', name: '活力橘' },
  { id: 'rose', colorClass: 'bg-rose-500 border-rose-600 text-white', hex: '#F43F5E', name: '玫瑰紅' },
  { id: 'purple', colorClass: 'bg-purple-500 border-purple-600 text-white', hex: '#8B5CF6', name: '神秘紫' },
];

// --- 工具函式 ---
const getTodayString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const getWeekDates = (baseDate) => {
  const d = new Date(baseDate);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const startOfWeek = new Date(d.setDate(diff));

  return Array.from({ length: 7 }).map((_, i) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    return {
      dayStr: ["日", "一", "二", "三", "四", "五", "六"][date.getDay()],
      dayIndex: date.getDay(),
      dateNum: date.getDate(),
      fullDate: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
      isToday: date.toDateString() === new Date().toDateString()
    };
  });
};

const TIME_BLOCKS = [];
for (let h = 9; h <= 20; h++) {
  TIME_BLOCKS.push(`${String(h).padStart(2, '0')}:00`);
  TIME_BLOCKS.push(`${String(h).padStart(2, '0')}:30`);
}

const getNextTime = (timeStr) => {
  if (!timeStr) return '21:00';
  const [h, m] = timeStr.split(':').map(Number);
  const d = new Date(); d.setHours(h, m + 30);
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
};

const getTopPx = (timeStr) => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return ((h - 9) * 60 + m) * 1.5; 
};

// 獲取範圍內的時間陣列
const getSlotsInRange = (start, end) => {
  let times = [];
  let curr = start;
  while(curr < end && TIME_BLOCKS.includes(curr)) {
      times.push(curr);
      curr = getNextTime(curr);
  }
  return times;
};

// 依照連續時間與 eventId 進行群組化
const groupSlots = (times) => {
  if (!times || times.length === 0) return [];
  const sorted = [...times].sort((a,b) => a.val.localeCompare(b.val));
  const groups = [];
  let currentGroup = { ...sorted[0], slots: [sorted[0].val], startTime: sorted[0].val };

  for (let i = 1; i < sorted.length; i++) {
    const prevTime = sorted[i-1].val;
    const curr = sorted[i];
    const expectedNext = getNextTime(prevTime);

    const isSameEvent = curr.eventId && currentGroup.eventId ? curr.eventId === currentGroup.eventId : false;
    const isLegacyMatch = !curr.eventId && !currentGroup.eventId && curr.isFull === currentGroup.isFull && curr.clientName === currentGroup.clientName && curr.service === currentGroup.service;

    if (curr.val === expectedNext && (isSameEvent || isLegacyMatch)) {
      currentGroup.slots.push(curr.val);
    } else {
      currentGroup.endTime = getNextTime(currentGroup.slots[currentGroup.slots.length-1]);
      groups.push(currentGroup);
      currentGroup = { ...curr, slots: [curr.val], startTime: curr.val };
    }
  }
  currentGroup.endTime = getNextTime(currentGroup.slots[currentGroup.slots.length-1]);
  groups.push(currentGroup);
  return groups;
};

// 取得觸控或滑鼠的 Y 座標
const getClientY = (e) => {
  if (e.touches && e.touches.length > 0) {
    return e.touches[0].clientY;
  }
  return e.clientY;
};

// --- 初始預設資料 ---
const initialDesigners = [
  { id: "d1", name: "魚魚", location: "北車店 15樓", schedules: [] },
  { id: "d2", name: "雅婷", location: "北車店 15樓", schedules: [] },
];

const initialClients = [
  { id: 1, name: "林語晴", phone: "0912-345-678", birthday: "1995-08-15", joinDate: "2023-11-02", tags: ["VIP", "喜歡自然款", "右眼易敏"], lashPreference: "C翹度 / 粗度0.10 / 眼頭9,眼中11,眼尾10", balance: 3500, packages: [{ id: 'p1', name: '角蛋白翹睫包堂', total: 5, remaining: 2 }], visits: [] },
  { id: 2, name: "陳思宇", phone: "0987-654-321", birthday: "1998-03-22", joinDate: "2024-01-15", tags: ["新客", "濃密款"], lashPreference: "D翹度 / 粗度0.15 / 全眼12mm", balance: 0, packages: [], visits: [] }
];

const initialInventory = [
  { id: 1, name: "C翹度 0.15 綜合盤", category: "睫毛", stock: 12, threshold: 5, status: "充足" },
  { id: 2, name: "D翹度 0.10 單尺寸 11mm", category: "睫毛", stock: 2, threshold: 5, status: "低庫存" },
  { id: 3, name: "持久型黑膠 (1s速乾)", category: "黑膠", stock: 1, threshold: 2, status: "低庫存", expiry: "2024-06-30" },
  { id: 4, name: "睫毛SPA洗卸慕斯", category: "零售商品", stock: 15, threshold: 5, status: "充足" }
];

const initialSavedServices = [
  "日式單根(自然)", "日式單根(濃密)", "嬰兒彎(自然)", "嬰兒彎(濃密)",
  "新中式設計款(自然)", "新中式設計款(濃密)", "漫畫款(自然)", "漫畫款(濃密)",
  "柔霧泰顏(自然)", "柔霧泰顏(濃密)", "太陽花(自然)", "太陽花(濃密)",
  "6D手工開花(自然)", "6D手工開花(濃密)", "客製款", "下睫毛", "根源矯正",
  "彩色睫毛", "升級毛款", "本店卸除重接", "他店卸除重接", "本店卸除不重接", "他店卸除不重接"
];

const initialSavedProducts = [
  { name: "睫毛雨衣", price: 500 }, { name: "睫毛SPA洗卸慕斯", price: 450 }, { name: "睫毛生長液", price: 1280 }
];

// ==========================================
// 主程式 App
// ==========================================
export default function App() {
  const [isStyleLoaded, setIsStyleLoaded] = useState(false);
  const [isCloudLoaded, setIsCloudLoaded] = useState(false);
  const [user, setUser] = useState(null);

  // --- 模式與前台狀態 ---
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [selectedTime, setSelectedTime] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const [showGuide, setShowGuide] = useState(false);
  const [filterDate, setFilterDate] = useState("all");
  const [filterTime, setFilterTime] = useState("all");
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState(null);

  // --- 登入與設定 ---
  const [adminPassword, setAdminPassword] = useState("admin");
  const [lineOfficialId, setLineOfficialId] = useState("");
  const [lineNotifyUrl, setLineNotifyUrl] = useState(""); // LINE Messaging API 推播網址
  const [lineUserIds, setLineUserIds] = useState(""); // 支援多個 User ID
  const [imgbbApiKey, setImgbbApiKey] = useState(""); // 圖床 API Key
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [showForgotPrompt, setShowForgotPrompt] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [newPasswordInput, setNewPasswordInput] = useState("");

  // --- 今日提醒彈窗狀態 ---
  const [showTodayNotice, setShowTodayNotice] = useState(false);

  // --- 系統設定全域共用 Alert 視窗 ---
  const [confirmModal, setConfirmModal] = useState(null);

  // --- CRM / 後台狀態 ---
  const [activeTab, setActiveTab] = useState('calendar');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [designers, setDesigners] = useState(initialDesigners);
  const [activeDesignerId, setActiveDesignerId] = useState(initialDesigners[0].id);
  const activeDesigner = designers.find((d) => d.id === activeDesignerId) || designers[0];

  const [clients, setClients] = useState(initialClients);
  const [inventory, setInventory] = useState(initialInventory);
  
  // --- 服務與付款動態清單 ---
  const [savedServices, setSavedServices] = useState(initialSavedServices);
  const [savedProducts, setSavedProducts] = useState(initialSavedProducts);
  const [paymentMethods, setPaymentMethods] = useState(['現金', '轉帳', '信用卡', 'Line Pay', '儲值金扣款', '扣除包堂']);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);
  const [isAddingVisit, setIsAddingVisit] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false); // 圖片上傳中狀態
  const [editingVisitId, setEditingVisitId] = useState(null); 
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [showDeleteClientModal, setShowDeleteClientModal] = useState(false);
  const [newClientData, setNewClientData] = useState({ name: '', phone: '', birthday: '', tags: '', lashPreference: '' });
  const [customPayment, setCustomPayment] = useState("");
  const [editingClientId, setEditingClientId] = useState(null); 
  
  const [newVisit, setNewVisit] = useState({ 
    date: getTodayString(), 
    services: [], 
    size: '',
    amount: '', 
    paymentMethod: '現金', 
    accountLast5: '',
    deductPackageId: '', 
    notes: '', 
    photoUrl: '',
    designerId: activeDesignerId || '' 
  });

  // --- 交易紀錄篩選狀態 ---
  const [txFilterType, setTxFilterType] = useState('month');
  const [txFilterMonth, setTxFilterMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [txFilterDate, setTxFilterDate] = useState(getTodayString());
  const [txFilterStartDate, setTxFilterStartDate] = useState(getTodayString());
  const [txFilterEndDate, setTxFilterEndDate] = useState(getTodayString());
  const [txFilterDesignerId, setTxFilterDesignerId] = useState('all');

  const [generateMonth, setGenerateMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  // --- 行事曆點擊編輯狀態 ---
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
  // { isNew, date, startTime, endTime, isFull, clientName, clientPhone, service, color, eventId, originalSlots }
  const [editingSlot, setEditingSlot] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // --- 批次自動開班設定狀態 ---
  const [showAutoScheduleModal, setShowAutoScheduleModal] = useState(false);
  const [autoScheduleConfig, setAutoScheduleConfig] = useState({
    workDays: [1, 2, 3, 4, 5, 6], 
    startTime: "11:00",
    endTime: "20:00",
    hasBreak: true,
    breakStart: "13:00",
    breakEnd: "14:00"
  });

  // --- 初始化與 Firebase ---
  useEffect(() => {
    if (typeof window !== "undefined") {
      const checkTailwind = setInterval(() => { if (window.tailwind) { setIsStyleLoaded(true); clearInterval(checkTailwind); } }, 50);
      if (!document.getElementById("tailwind-script")) {
        const script = document.createElement("script"); script.id = "tailwind-script"; script.src = "https://cdn.tailwindcss.com"; document.head.appendChild(script);
      }
      const fallback = setTimeout(() => { setIsStyleLoaded(true); clearInterval(checkTailwind); }, 1500);
      return () => { clearInterval(checkTailwind); clearTimeout(fallback); };
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasSeen = localStorage.getItem('hasSeenBookingGuide');
      if (!hasSeen) { setShowGuide(true); localStorage.setItem('hasSeenBookingGuide', 'true'); }
    }
  }, []);

  useEffect(() => {
    if (!auth) { setIsCloudLoaded(true); return; }
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== "undefined" && __initial_auth_token) { await signInWithCustomToken(auth, __initial_auth_token); } 
        else { await signInAnonymously(auth); }
      } catch (e) { console.error("雲端登入失敗:", e); setIsCloudLoaded(true); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => { setUser(u); });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !db) return;
    const docRef = doc(db, "artifacts", appId, "public", "data", "store_data", "main_config");
    const unsubscribe = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (!isAdminMode) {
          if (data.designers) {
            const todayStr = getTodayString();
            const cleanedDesigners = data.designers.map(d => ({
              ...d,
              schedules: (d.schedules || []).filter(s => !s.fullDate || s.fullDate >= todayStr)
            }));
            setDesigners(cleanedDesigners);
            if (cleanedDesigners.length > 0 && !activeDesignerId) {
              setActiveDesignerId(cleanedDesigners[0].id);
            }
          }
          if (data.adminPassword) setAdminPassword(data.adminPassword);
          if (data.lineOfficialId !== undefined) setLineOfficialId(data.lineOfficialId);
          if (data.lineNotifyUrl !== undefined) setLineNotifyUrl(data.lineNotifyUrl);
          if (data.lineUserIds !== undefined) setLineUserIds(data.lineUserIds);
          if (data.imgbbApiKey !== undefined) setImgbbApiKey(data.imgbbApiKey);
          if (data.clients) setClients(data.clients);
          if (data.inventory) setInventory(data.inventory);
          if (data.paymentMethods) setPaymentMethods(data.paymentMethods);
          if (data.savedProducts) setSavedProducts(data.savedProducts);
          if (data.savedServices) {
            const migratedServices = data.savedServices.map(s => typeof s === 'string' ? s : s.name);
            setSavedServices(migratedServices);
          }
        }
      } else {
        if (!isAdminMode) {
          setDoc(docRef, { 
             designers: initialDesigners, 
             adminPassword: "admin", 
             lineOfficialId: "", 
             lineNotifyUrl: "",
             lineUserIds: "",
             imgbbApiKey: "",
             clients: initialClients, 
             inventory: initialInventory, 
             paymentMethods: ['現金', '轉帳', '信用卡', 'Line Pay', '儲值金扣款', '扣除包堂'],
             savedServices: initialSavedServices,
             savedProducts: initialSavedProducts
          }).catch(console.error);
        }
      }
      setIsCloudLoaded(true);
    }, (err) => { console.error("雲端讀取失敗:", err); setIsCloudLoaded(true); });
    return () => unsubscribe();
  }, [user, isAdminMode]);

  // --- 自動儲存至雲端共用函數 ---
  const syncToCloud = async (updates = {}) => {
    if (!user || !db) return false;
    try {
      const payload = {
        designers: 'designers' in updates ? updates.designers : designers,
        adminPassword: 'adminPassword' in updates ? updates.adminPassword : adminPassword,
        lineOfficialId: 'lineOfficialId' in updates ? updates.lineOfficialId : lineOfficialId,
        lineNotifyUrl: 'lineNotifyUrl' in updates ? updates.lineNotifyUrl : lineNotifyUrl,
        lineUserIds: 'lineUserIds' in updates ? updates.lineUserIds : lineUserIds,
        imgbbApiKey: 'imgbbApiKey' in updates ? updates.imgbbApiKey : imgbbApiKey,
        clients: 'clients' in updates ? updates.clients : clients,
        inventory: 'inventory' in updates ? updates.inventory : inventory,
        paymentMethods: 'paymentMethods' in updates ? updates.paymentMethods : paymentMethods,
        savedServices: 'savedServices' in updates ? updates.savedServices : savedServices,
        savedProducts: 'savedProducts' in updates ? updates.savedProducts : savedProducts,
      };
      const dataToSave = JSON.parse(JSON.stringify(payload));
      const docRef = doc(db, "artifacts", appId, "public", "data", "store_data", "main_config");
      await setDoc(docRef, dataToSave);
      setHasUnsavedChanges(false);
      return true;
    } catch (e) {
      console.error("同步失敗:", e);
      showToast("儲存失敗！資料庫容量已滿或網路不穩。");
      return false;
    }
  };

  const handleExplicitSave = async () => {
    showToast("資料儲存中...");
    const success = await syncToCloud();
    if(success) showToast("資料已成功儲存並更新至前台！");
  };

  const handleExitAdmin = async () => {
    if (hasUnsavedChanges) await syncToCloud();
    setIsAdminMode(false);
  };

  const showToast = (msg) => { setToastMessage(msg); setTimeout(() => setToastMessage(""), 3000); };
  const renderToast = () => {
    if (!toastMessage) return null;
    return (
      <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[200] bg-gray-800 text-white px-6 py-3.5 rounded-full shadow-2xl text-base font-bold opacity-90 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
        {toastMessage}
      </div>
    );
  };

  // --- 發送 LINE Messaging API 推播 ---
  const handleSendTodayScheduleToLine = async () => {
    if (!lineNotifyUrl) return showToast("請先至「系統設定」填寫 LINE 推播網址！");
    const idsArray = lineUserIds.split(',').map(id => id.trim()).filter(id => id);
    if (idsArray.length === 0) return showToast("請先至「系統設定」填寫接收者的 User ID！");
    
    let msg = `\n✨ 【Lash & Beauty 今日預約總表】 ✨\n📅 日期：${getTodayString()}\n`;
    
    let hasAnyAppointments = false;
    designers.forEach(d => {
      const todaySchedule = d.schedules.find(s => s.fullDate === getTodayString());
      const todayAppointments = todaySchedule ? todaySchedule.times.filter(t => t.isFull) : [];
      if (todayAppointments.length > 0) {
        hasAnyAppointments = true;
        msg += `\n🌸 設計師：${d.name}\n`;
        const groups = groupSlots(todayAppointments);
        groups.forEach(g => {
          msg += ` ⏰ ${g.startTime} - ${g.clientName} (${g.service})\n`;
        });
      }
    });

    if (!hasAnyAppointments) {
      msg += `\n今日尚無預約行程，好好休息吧！☕`;
    }

    try {
      showToast("發送中...");
      const response = await fetch(lineNotifyUrl, {
        method: "POST",
        body: JSON.stringify({ message: msg, userIds: idsArray }),
        headers: { "Content-Type": "text/plain;charset=utf-8" } 
      });
      if (response.ok || response.type === 'opaque') {
        showToast("✅ 已成功觸發推播，請檢查您的 LINE！");
      } else {
        showToast("❌ 傳送失敗，請檢查網址是否正確。");
      }
    } catch (error) {
      console.error(error);
      showToast("✅ 已送出請求，請檢查 LINE 是否收到通知。");
    }
  };

  // --- 登入邏輯 ---
  const handleAdminLogin = () => {
    if (passwordInput === adminPassword) {
      setIsAdminMode(true); setShowPasswordPrompt(false); setPasswordInput(""); setPasswordError("");
      
      const todayStr = getTodayString();
      const hasTodayAppointments = designers.some(d => {
        const todaySchedule = d.schedules.find(s => s.fullDate === todayStr);
        return todaySchedule && todaySchedule.times.some(t => t.isFull);
      });
      if (hasTodayAppointments) {
        setShowTodayNotice(true);
      }
    } else { setPasswordError("密碼錯誤，請重新輸入！"); setPasswordInput(""); }
  };
  const handleResetPassword = () => {
    if (passwordInput === "8888") {
      setAdminPassword("admin"); setShowForgotPrompt(false); setShowPasswordPrompt(true); setPasswordInput(""); setPasswordError(""); showToast("密碼已重置為：admin");
    } else { setPasswordError("安全驗證碼錯誤！"); setPasswordInput(""); }
  };

  // --- CRM 功能 ---
  const handleSaveClient = async () => {
    if(!newClientData.name || !newClientData.phone) return showToast("姓名與電話為必填！");
    const tagsArray = newClientData.tags ? newClientData.tags.split(',').map(t => t.trim()) : ["新客"];
    
    let updatedClients = [...clients];
    if (editingClientId) {
      updatedClients = clients.map(c => {
        if (c.id === editingClientId) {
          return {
            ...c,
            name: newClientData.name,
            phone: newClientData.phone,
            birthday: newClientData.birthday || '-',
            tags: tagsArray,
            lashPreference: newClientData.lashPreference || "尚未建立紀錄"
          };
        }
        return c;
      });
    } else {
      const client = {
        id: Date.now(), name: newClientData.name, phone: newClientData.phone, birthday: newClientData.birthday || '-', joinDate: getTodayString(),
        tags: tagsArray, lashPreference: newClientData.lashPreference || "尚未建立紀錄", balance: 0, packages: [], visits: []
      };
      updatedClients = [client, ...clients];
    }

    showToast("資料儲存中...");
    const success = await syncToCloud({ clients: updatedClients });
    
    if (success) {
      setClients(updatedClients);
      if (editingClientId) {
        setSelectedClient(updatedClients.find(c => c.id === editingClientId));
        showToast("客戶資料已更新！");
      } else {
        showToast("已建立新客戶檔案！");
      }
      closeClientModal();
    }
  };

  const closeClientModal = () => {
    setShowAddClientModal(false);
    setEditingClientId(null);
    setNewClientData({ name: '', phone: '', birthday: '', tags: '', lashPreference: '' });
  };

  const handleEditClientClick = () => {
    setNewClientData({
      name: selectedClient.name,
      phone: selectedClient.phone,
      birthday: selectedClient.birthday !== '-' ? selectedClient.birthday : '',
      tags: selectedClient.tags.join(', '),
      lashPreference: selectedClient.lashPreference === '尚未建立紀錄' ? '' : selectedClient.lashPreference
    });
    setEditingClientId(selectedClient.id);
    setShowAddClientModal(true);
  };

  const handleDeleteClient = async () => {
    if (!selectedClient) return;
    const updatedClients = clients.filter(c => c.id !== selectedClient.id);
    
    showToast("資料刪除中...");
    const success = await syncToCloud({ clients: updatedClients });
    
    if (success) {
      setClients(updatedClients);
      setSelectedClient(null);
      setShowDeleteClientModal(false);
      showToast("已成功刪除該客戶所有資料！");
    }
  };

  const handleServiceToggle = (serviceName) => {
    setNewVisit(prev => ({
      ...prev,
      services: prev.services.includes(serviceName)
        ? prev.services.filter(s => s !== serviceName)
        : [...prev.services, serviceName]
    }));
  };

  // --- 全新升級：ImgBB 專業圖床高畫質上傳引擎 ---
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingImage(true);

    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        
        // 恢復高解析度：寬高最大 1600px，保留睫毛所有細節
        const MAX_WIDTH = 1600;
        const MAX_HEIGHT = 1600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
        } else {
          if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // 提升 JPEG 品質至 0.85 (85%)
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);

        try {
          const base64Data = compressedBase64.split(',')[1];
          const formData = new FormData();
          formData.append('image', base64Data);
          
          // 使用系統內建的公共 ImgBB 金鑰，或用戶自行設定的
          const apiKey = imgbbApiKey || "71a62dc5cebbd7ecbdab72a4467bc068";
          const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
            method: 'POST',
            body: formData
          });
          
          const json = await res.json();
          if (json.success) {
            // 只存極短的雲端圖片網址進資料庫，徹底解決容量限制
            setNewVisit(prev => ({ ...prev, photoUrl: json.data.url }));
            showToast("圖片上傳成功！");
          } else {
            showToast("圖片處理失敗，請稍後再試。");
          }
        } catch (error) {
          console.error(error);
          showToast("網路錯誤，圖片無法上傳。");
        } finally {
          setIsUploadingImage(false);
        }
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const handleEditVisitClick = (visit) => {
    setIsAddingVisit(true);
    setEditingVisitId(visit.id);
    setNewVisit({
      date: visit.date || getTodayString(),
      services: visit.service ? visit.service.split(', ') : [],
      size: visit.size || '',
      amount: visit.amount || '',
      paymentMethod: paymentMethods.includes(visit.paymentMethod) ? visit.paymentMethod : '自訂',
      accountLast5: visit.accountLast5 || '',
      deductPackageId: visit.deductPackageId || '',
      notes: visit.notes || '',
      photoUrl: visit.photos && visit.photos.length > 0 ? visit.photos[0] : '',
      designerId: visit.designerId || (designers.length > 0 ? designers[0].id : '')
    });
    if (visit.paymentMethod && !paymentMethods.includes(visit.paymentMethod)) {
      setCustomPayment(visit.paymentMethod);
    } else {
      setCustomPayment('');
    }
  };

  const handleAddVisit = async () => {
    if (!newVisit.date || newVisit.services.length === 0 || !newVisit.size || !newVisit.amount || !newVisit.designerId) {
      return showToast("請完整填寫日期、設計師、項目、尺寸與總金額！");
    }
    
    const serviceAmt = Number(newVisit.amount) || 0;
    const finalPaymentMethod = newVisit.paymentMethod === '自訂' ? customPayment : newVisit.paymentMethod;
    
    let tempBalance = selectedClient.balance;
    if (editingVisitId) {
       const oldVisit = selectedClient.visits.find(v => v.id === editingVisitId);
       if (oldVisit && oldVisit.paymentMethod === '儲值金扣款') {
           tempBalance += (Number(oldVisit.amount) || 0);
       }
    }

    if (finalPaymentMethod === '儲值金扣款' && tempBalance < serviceAmt) {
       return showToast("儲值金餘額不足！");
    }

    const serviceStr = newVisit.services.join(', ');
    const selectedDesignerName = designers.find(d => d.id === newVisit.designerId)?.name || '';

    const visitData = { 
      id: editingVisitId || Date.now(), 
      date: newVisit.date, 
      designerId: newVisit.designerId,
      designerName: selectedDesignerName,
      service: serviceStr, 
      size: newVisit.size,
      amount: serviceAmt, 
      paymentMethod: finalPaymentMethod, 
      accountLast5: newVisit.paymentMethod === '轉帳' ? newVisit.accountLast5 : '',
      deductPackageId: newVisit.deductPackageId,
      notes: newVisit.notes, 
      photos: newVisit.photoUrl ? [newVisit.photoUrl] : [] 
    };

    const updatedClients = clients.map(c => {
      if (c.id === selectedClient.id) {
        let newBalance = c.balance; 
        let newPackages = [...c.packages];
        let newVisits = [...c.visits];

        if (editingVisitId) {
          const oldVisit = newVisits.find(v => v.id === editingVisitId);
          if (oldVisit) {
            if (oldVisit.paymentMethod === '儲值金扣款') newBalance += (Number(oldVisit.amount) || 0);
            if (oldVisit.paymentMethod === '扣除包堂' && oldVisit.deductPackageId) {
              newPackages = newPackages.map(pkg => pkg.id === oldVisit.deductPackageId ? { ...pkg, remaining: pkg.remaining + 1 } : pkg);
            }
          }
        }

        if (finalPaymentMethod === '儲值金扣款') newBalance -= serviceAmt;
        if (finalPaymentMethod === '扣除包堂' && newVisit.deductPackageId) {
          newPackages = newPackages.map(pkg => pkg.id === newVisit.deductPackageId ? { ...pkg, remaining: pkg.remaining - 1 } : pkg);
        }

        if (editingVisitId) {
          newVisits = newVisits.map(v => v.id === editingVisitId ? visitData : v);
        } else {
          newVisits = [visitData, ...newVisits];
        }
        
        newVisits.sort((a,b) => new Date(b.date) - new Date(a.date));

        return { ...c, balance: newBalance, packages: newPackages, visits: newVisits };
      }
      return c;
    });

    let updatedPaymentMethods = [...paymentMethods];
    if(newVisit.paymentMethod === '自訂' && customPayment && !paymentMethods.includes(customPayment)){
       updatedPaymentMethods.push(customPayment);
    }
    
    showToast("資料儲存中，請稍候...");
    const success = await syncToCloud({ clients: updatedClients, paymentMethods: updatedPaymentMethods });
    
    if (success) {
      setClients(updatedClients); 
      setSelectedClient(updatedClients.find(c => c.id === selectedClient.id)); 
      setPaymentMethods(updatedPaymentMethods);
      setIsAddingVisit(false);
      setEditingVisitId(null);
      setNewVisit({ date: getTodayString(), services: [], size: '', amount: '', paymentMethod: '現金', accountLast5: '', deductPackageId: '', notes: '', photoUrl: '', designerId: activeDesignerId || '' });
      setCustomPayment(''); 
      showToast(editingVisitId ? "消費紀錄已成功更新並儲存！" : "消費紀錄已成功儲存！");
    }
  };

  // --- 排班管理 (批次自動開班) ---
  const handleApplyAutoSchedule = async () => {
    if (!activeDesigner || !generateMonth) return showToast("請先選擇月份！");
    const [yearStr, monthStr] = generateMonth.split("-"); 
    const year = parseInt(yearStr, 10); 
    const month = parseInt(monthStr, 10) - 1; 
    const daysInMonth = new Date(year, month + 1, 0).getDate(); 
    const todayStr = getTodayString();

    let newSchedules = [...activeDesigner.schedules]; 
    let maxId = newSchedules.length > 0 ? Math.max(...newSchedules.map((s) => s.id)) : 0; 
    let addedCount = 0;
    const daysMap = ["日", "一", "二", "三", "四", "五", "六"];

    const getGeneratedTimes = (datePrefix) => {
      let times = [];
      let curr = autoScheduleConfig.startTime;
      const end = autoScheduleConfig.endTime;
      const bStart = autoScheduleConfig.breakStart;
      const bEnd = autoScheduleConfig.breakEnd;

      let blockIndex = 0;
      let slotsInCurrentBlock = 0;
      let currentEventId = `auto_${datePrefix}_${blockIndex}`;

      while (curr < end && curr >= "00:00" && curr <= "23:59") {
        let skip = false;
        if (autoScheduleConfig.hasBreak && curr >= bStart && curr < bEnd) skip = true;
        
        if (skip) {
          if (slotsInCurrentBlock > 0) {
            blockIndex++;
            slotsInCurrentBlock = 0;
            currentEventId = `auto_${datePrefix}_${blockIndex}`;
          }
        } else if (TIME_BLOCKS.includes(curr)) {
           times.push({ val: curr, isFull: false, eventId: currentEventId, color: 'default' });
           slotsInCurrentBlock++;
           
           if (slotsInCurrentBlock === 4) {
             blockIndex++;
             slotsInCurrentBlock = 0;
             currentEventId = `auto_${datePrefix}_${blockIndex}`;
           }
        }
        curr = getNextTime(curr);
      }
      return times;
    };

    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      const fullDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;

      if (fullDate >= todayStr && autoScheduleConfig.workDays.includes(d.getDay())) {
        addedCount++;
        let existingScheduleIdx = newSchedules.findIndex(s => s.fullDate === fullDate);
        const baseTimesToGenerate = getGeneratedTimes(fullDate);

        if (existingScheduleIdx === -1) {
           maxId++;
           newSchedules.push({
              id: maxId,
              fullDate: fullDate,
              date: `${month + 1}/${i}`,
              day: daysMap[d.getDay()],
              times: [...baseTimesToGenerate]
           });
        } else {
           let existingSchedule = { ...newSchedules[existingScheduleIdx] };
           let mergedTimes = [...existingSchedule.times];

           baseTimesToGenerate.forEach(newTimeObj => {
              if (!mergedTimes.some(t => t.val === newTimeObj.val)) {
                 mergedTimes.push(newTimeObj);
              } 
           });
           mergedTimes.sort((a,b) => a.val.localeCompare(b.val));
           existingSchedule.times = mergedTimes;
           newSchedules[existingScheduleIdx] = existingSchedule;
        }
      }
    }

    newSchedules.sort((a, b) => new Date(a.fullDate) - new Date(b.fullDate));
    const newDesigners = designers.map(d => d.id === activeDesignerId ? { ...d, schedules: newSchedules } : d);
    setDesigners(newDesigners);
    setShowAutoScheduleModal(false);
    
    syncToCloud({ designers: newDesigners });
    showToast(`批次開班成功！已自動儲存。`);
  };

  const toggleWorkDay = (dayIndex) => {
    setAutoScheduleConfig(prev => {
      const newDays = prev.workDays.includes(dayIndex)
        ? prev.workDays.filter(d => d !== dayIndex)
        : [...prev.workDays, dayIndex];
      return { ...prev, workDays: newDays.sort() };
    });
  };

  // --- 改版：純點擊輸入排班 ---
  const handleCellClick = (dateStr, timeStr) => {
    setEditingSlot({
      isNew: true,
      date: dateStr,
      startTime: timeStr,
      endTime: getNextTime(timeStr), // 預設 30 分鐘
      isFull: false,
      clientName: '',
      clientPhone: '',
      service: '',
      color: 'default',
      eventId: 'evt_' + Date.now().toString() + Math.random().toString(36).substr(2, 5),
      originalSlots: []
    });
  };

  const handleGroupClick = (dateStr, group) => {
    setEditingSlot({
      isNew: false,
      date: dateStr,
      startTime: group.startTime,
      endTime: group.endTime,
      isFull: group.isFull,
      clientName: group.clientName || '',
      clientPhone: group.clientPhone || '',
      service: group.service || '',
      color: group.color || 'default',
      eventId: group.eventId,
      originalSlots: group.slots
    });
  };

  const handleSaveSlotEdit = async () => {
    if (!editingSlot) return;
    const { isNew, date, startTime, endTime, isFull, clientName, clientPhone, service, color, eventId, originalSlots } = editingSlot;
    
    const newSlots = getSlotsInRange(startTime, endTime);
    if (newSlots.length === 0) {
      return showToast("結束時間必須大於起始時間！");
    }

    // --- 自動建檔邏輯 ---
    let finalClients = clients;
    let isNewClientCreated = false;
    if (isFull && clientName && clientPhone) {
      const exists = clients.find(c => c.phone === clientPhone);
      if (!exists) {
        const newClient = {
          id: Date.now(),
          name: clientName,
          phone: clientPhone,
          birthday: '-',
          joinDate: getTodayString(),
          tags: ["新客"],
          lashPreference: "尚未建立紀錄",
          balance: 0,
          packages: [],
          visits: []
        };
        finalClients = [newClient, ...clients];
        isNewClientCreated = true;
      }
    }

    let updatedSchedules = [...activeDesigner.schedules];
    let scheduleIndex = updatedSchedules.findIndex(s => s.fullDate === date);

    if (scheduleIndex === -1) {
      const d = new Date(date);
      const daysMap = ["日", "一", "二", "三", "四", "五", "六"];
      const newId = updatedSchedules.length > 0 ? Math.max(...updatedSchedules.map(s=>s.id)) + 1 : 1;
      updatedSchedules.push({
        id: newId,
        fullDate: date,
        date: `${d.getMonth() + 1}/${d.getDate()}`,
        day: daysMap[d.getDay()],
        times: newSlots.map(slotVal => ({
            val: slotVal, isFull, clientName: clientName || '', clientPhone: clientPhone || '', service: service || '', color: color || 'default', eventId
        }))
      });
      updatedSchedules.sort((a, b) => new Date(a.fullDate) - new Date(b.fullDate));
    } else {
      let schedule = { ...updatedSchedules[scheduleIndex] };
      let currentTimes = [...schedule.times];
      
      if (!isNew && originalSlots) {
        currentTimes = currentTimes.filter(t => !originalSlots.includes(t.val));
      }
      currentTimes = currentTimes.filter(t => !newSlots.includes(t.val));

      newSlots.forEach(slotVal => {
        currentTimes.push({
          val: slotVal, isFull, clientName: clientName || '', clientPhone: clientPhone || '', service: service || '', color: color || 'default', eventId
        });
      });

      currentTimes.sort((a,b) => a.val.localeCompare(b.val));
      schedule.times = currentTimes;
      updatedSchedules[scheduleIndex] = schedule;
    }

    const newDesigners = designers.map(d => d.id === activeDesignerId ? { ...d, schedules: updatedSchedules } : d);
    
    showToast("排班資料儲存中...");
    const success = await syncToCloud({ designers: newDesigners, clients: finalClients });
    
    if (success) {
      setDesigners(newDesigners);
      setClients(finalClients);
      setEditingSlot(null); 
      if (isNewClientCreated) {
        showToast("時段設定成功！已為新客人自動建立檔案。");
      } else {
        showToast("時段設定成功！已自動同步。");
      }
    }
  };

  const handleRemoveSlot = async () => {
    if (!editingSlot || editingSlot.isNew) {
      setEditingSlot(null);
      return;
    }
    const { date, originalSlots } = editingSlot;
    const updatedSchedules = activeDesigner.schedules.map(s => {
      if (s.fullDate === date) {
        return { ...s, times: s.times.filter(t => !originalSlots.includes(t.val)) };
      }
      return s;
    });
    
    const newDesigners = designers.map(d => d.id === activeDesignerId ? { ...d, schedules: updatedSchedules } : d);
    
    showToast("空檔刪除中...");
    const success = await syncToCloud({ designers: newDesigners });
    
    if (success) {
      setDesigners(newDesigners);
      setEditingSlot(null);
      showToast("已刪除該空檔！已自動同步。");
    }
  };

  const handleCopyBooking = () => {
    if (!selectedTime) { showToast("請先點選您想要的時段喔！"); return; }
    const textArea = document.createElement("textarea");
    textArea.value = selectedTime; document.body.appendChild(textArea); textArea.select();
    try { document.execCommand("copy"); setShowCopyModal(true); } catch (err) { console.error("複製失敗", err); showToast("複製失敗，請手動輸入"); }
    document.body.removeChild(textArea);
  };

  const jumpToLine = () => {
    setShowCopyModal(false);
    if (lineOfficialId) {
      const formattedLineId = lineOfficialId.startsWith("@") ? lineOfficialId : `@${lineOfficialId}`;
      const lineUrl = `https://line.me/R/oaMessage/${formattedLineId}/?${encodeURIComponent(selectedTime)}`;
      window.open(lineUrl, "_blank");
    }
  };

  // --- 系統設定 (新增/編輯設計師與項目) ---
  const handleAddNewDesigner = async () => {
    const newId = "d" + Date.now();
    const newDesigners = [...designers, { id: newId, name: "新設計師", location: "北車店", schedules: [] }];
    
    showToast("新增中...");
    const success = await syncToCloud({ designers: newDesigners });
    
    if (success) {
      setDesigners(newDesigners);
      showToast("已新增設計師欄位，請修改名稱");
    }
  };

  const handleUpdateDesignerItem = (id, field, value) => {
    const newDesigners = designers.map(d => d.id === id ? { ...d, [field]: value } : d);
    setDesigners(newDesigners);
    setHasUnsavedChanges(true);
  };

  const handleDeleteDesigner = async (id) => {
    if (designers.length <= 1) return showToast("系統至少需保留一位設計師！");
    const newDesigners = designers.filter(d => d.id !== id);
    
    showToast("刪除中...");
    const success = await syncToCloud({ designers: newDesigners });
    
    if (success) {
      setDesigners(newDesigners);
      if (activeDesignerId === id) setActiveDesignerId(newDesigners[0].id);
      showToast("已刪除設計師！");
    }
  };

  const [newServiceInput, setNewServiceInput] = useState('');
  const handleAddServiceSetting = () => {
     if(!newServiceInput.trim()) return showToast("請填寫項目名稱");
     if(savedServices.includes(newServiceInput.trim())) return showToast("該項目已存在");
     const newServices = [...savedServices, newServiceInput.trim()];
     setSavedServices(newServices);
     setNewServiceInput('');
     setHasUnsavedChanges(true);
  };
  const handleDeleteServiceSetting = (name) => {
     setSavedServices(savedServices.filter(s => s !== name));
     setHasUnsavedChanges(true);
  };

  const [newPaymentInput, setNewPaymentInput] = useState('');
  const handleAddPaymentSetting = () => {
     if(!newPaymentInput) return showToast("請填寫付款方式");
     if(paymentMethods.includes(newPaymentInput)) return showToast("付款方式已存在");
     const newMethods = [...paymentMethods, newPaymentInput];
     setPaymentMethods(newMethods);
     setNewPaymentInput('');
     setHasUnsavedChanges(true);
  };
  const handleDeletePaymentSetting = (method) => {
     if(['現金', '轉帳', '信用卡', 'Line Pay', '儲值金扣款', '扣除包堂'].includes(method)) return showToast("系統預設付款方式無法刪除！");
     setPaymentMethods(paymentMethods.filter(m => m !== method));
     setHasUnsavedChanges(true);
  };

  const handleChangePassword = () => {
    if (!newPasswordInput) return showToast("請輸入新密碼！");
    if (newPasswordInput.length < 4) return showToast("密碼長度至少需 4 碼！");
    setAdminPassword(newPasswordInput); setNewPasswordInput(""); 
    syncToCloud({ adminPassword: newPasswordInput });
    showToast("密碼修改成功！下次請使用新密碼登入。");
  };

  // ==========================================
  // 後台主畫面 Render
  // ==========================================
  const renderAdminView = () => {
    
    let allTransactions = clients.flatMap(client => client.visits.map(visit => ({ 
      ...visit, 
      clientId: client.id, 
      clientName: client.name, 
      totalAmount: (Number(visit.amount) || 0) + (Number(visit.productAmount) || 0) 
    })));

    if (txFilterDesignerId !== 'all') {
      allTransactions = allTransactions.filter(tx => tx.designerId === txFilterDesignerId);
    }
    if (txFilterType === 'month') {
      allTransactions = allTransactions.filter(tx => tx.date.startsWith(txFilterMonth));
    } else if (txFilterType === 'day') {
      allTransactions = allTransactions.filter(tx => tx.date === txFilterDate);
    } else if (txFilterType === 'custom') {
      allTransactions = allTransactions.filter(tx => tx.date >= txFilterStartDate && tx.date <= txFilterEndDate);
    }

    allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    const totalRevenue = allTransactions.filter(t => t.paymentMethod !== '儲值金扣款' && t.paymentMethod !== '扣除包堂').reduce((sum, t) => sum + t.totalAmount, 0);
    const filteredClients = clients.filter(c => c.name.includes(searchQuery) || c.phone.includes(searchQuery));
    const weekDates = getWeekDates(currentWeekStart);

    return (
      <div className="h-screen bg-[#F8F9FA] flex flex-col md:flex-row font-sans overflow-hidden w-full">
        {renderToast()}
        
        {/* 手機版頂部 */}
        <div className="md:hidden flex justify-between items-center p-4 bg-white border-b border-gray-200 z-20 shadow-sm">
          <h2 className="text-xl font-beauty font-black text-[#C59A5C] tracking-widest">L<span className="text-[#A87B7B]">&</span>B</h2>
          <div className="flex items-center gap-3">
            {hasUnsavedChanges && (
               <button onClick={handleExplicitSave} className="bg-[#A87B7B] text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-md animate-pulse flex items-center gap-1">
                 <Save size={14} /> 儲存變更
               </button>
            )}
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-600 p-1 hover:bg-gray-100 rounded-md"><MenuIcon size={26} /></button>
          </div>
        </div>

        {/* 側邊欄 */}
        <div className={`${isMobileMenuOpen ? 'flex' : 'hidden'} md:flex w-full md:w-64 bg-white border-r border-gray-200 flex-col absolute md:relative z-40 h-[calc(100vh-68px)] md:h-screen top-[68px] md:top-0 shadow-2xl md:shadow-none`}>
          <div className="hidden md:block p-6 border-b border-gray-100">
            <h2 className="text-2xl font-beauty font-black text-[#C59A5C] text-center tracking-widest">Lash <span className="text-[#A87B7B]">&</span> Beauty</h2>
            <p className="text-[10px] text-center text-gray-400 mt-1 tracking-[0.3em]">蓓緹美學管理後台</p>
          </div>
          <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
            <p className="text-xs font-bold text-gray-400 mb-2 mt-2 px-4 tracking-wider">營運管理</p>
            <button onClick={() => { setActiveTab('calendar'); setSelectedClient(null); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium text-sm ${activeTab === 'calendar' ? 'bg-[#FDFBF7] text-[#A87B7B]' : 'text-gray-600 hover:bg-gray-50'}`}><CalendarDays size={18} /> 預約行事曆</button>
            <button onClick={() => { setActiveTab('clients'); setSelectedClient(null); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium text-sm ${activeTab === 'clients' && !selectedClient ? 'bg-[#FDFBF7] text-[#A87B7B]' : 'text-gray-600 hover:bg-gray-50'}`}><Users size={18} /> 客戶管理</button>
            <button onClick={() => { setActiveTab('transactions'); setSelectedClient(null); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium text-sm ${activeTab === 'transactions' ? 'bg-[#FDFBF7] text-[#A87B7B]' : 'text-gray-600 hover:bg-gray-50'}`}><Receipt size={18} /> 交易紀錄</button>
            <p className="text-xs font-bold text-gray-400 mb-2 mt-6 px-4 tracking-wider">進銷存</p>
            <button onClick={() => { setActiveTab('inventory'); setSelectedClient(null); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium text-sm ${activeTab === 'inventory' ? 'bg-[#FDFBF7] text-[#A87B7B]' : 'text-gray-600 hover:bg-gray-50'}`}><Package size={18} /> 耗材與庫存</button>
            <p className="text-xs font-bold text-gray-400 mb-2 mt-6 px-4 tracking-wider">系統</p>
            <button onClick={() => { setActiveTab('settings'); setSelectedClient(null); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium text-sm ${activeTab === 'settings' ? 'bg-[#FDFBF7] text-[#A87B7B]' : 'text-gray-600 hover:bg-gray-50'}`}><Settings size={18} /> 系統設定</button>
          </nav>
          <div className="p-4 border-t border-gray-100 space-y-3">
            <button 
               onClick={handleExplicitSave} 
               className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition shadow-sm
                  ${hasUnsavedChanges ? 'bg-[#A87B7B] text-white hover:bg-[#8f6666] animate-pulse shadow-md border-2 border-[#C59A5C]' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}
               `}
            >
               {hasUnsavedChanges ? <Save size={16}/> : <CheckCircle size={16}/>} {hasUnsavedChanges ? '儲存變更至前台' : '資料已同步'}
            </button>
            <button onClick={handleExitAdmin} className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-3 rounded-xl text-sm font-bold hover:bg-black transition"><Eye size={16}/> 退出看前台</button>
          </div>
        </div>
        {isMobileMenuOpen && <div className="md:hidden fixed inset-0 bg-black/20 z-30 top-[68px]" onClick={() => setIsMobileMenuOpen(false)}></div>}

        {/* 主要內容區 */}
        <div className="flex-1 h-full overflow-y-auto relative z-10 w-full bg-gray-50/50">
          
          {/* Tab 1: 行事曆 */}
          {activeTab === 'calendar' && (
            <div className="p-4 md:p-6 mx-auto h-full flex flex-col min-w-0">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">預約行事曆</h1>
                  <p className="text-sm text-gray-500">週視圖排班：點擊網格即可新增或編輯時段</p>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                  {designers.map((d) => (
                    <button key={d.id} onClick={() => setActiveDesignerId(d.id)} className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold transition ${activeDesignerId === d.id ? "bg-[#A87B7B] text-white shadow-md" : "bg-white text-gray-600 border border-gray-200"}`}>{d.name}</button>
                  ))}
                  <div className="h-6 w-px bg-gray-300 mx-1"></div>
                  <input type="month" value={generateMonth} onChange={(e) => setGenerateMonth(e.target.value)} className="p-1.5 rounded-lg border text-sm text-gray-700 bg-white outline-none w-32 cursor-pointer" />
                  <button onClick={() => setShowAutoScheduleModal(true)} className="bg-white border border-gray-200 text-gray-700 text-sm font-bold px-3 py-1.5 rounded-lg hover:bg-gray-50 transition shadow-sm whitespace-nowrap flex items-center gap-1.5">
                    <Wand2 size={16} className="text-[#C59A5C]" /> 快速開班
                  </button>
                  {hasUnsavedChanges && (
                     <button onClick={handleExplicitSave} className="bg-[#A87B7B] text-white text-sm font-bold px-4 py-1.5 rounded-lg hover:bg-[#8f6666] transition shadow-md whitespace-nowrap flex items-center gap-1.5 animate-bounce ml-2">
                       <Save size={16} /> 儲存發布
                     </button>
                  )}
                </div>
              </div>

              {/* 日曆主體 */}
              <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden relative">
                {/* 頂部日期切換 */}
                <div className="flex items-center justify-between p-3 border-b border-gray-100 bg-gray-50 z-10 relative">
                  <div className="flex gap-1">
                    <button onClick={() => { const d = new Date(currentWeekStart); d.setDate(d.getDate() - 7); setCurrentWeekStart(d); }} className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-md transition"><ChevronLeftCircle size={20}/></button>
                    <button onClick={() => setCurrentWeekStart(new Date())} className="px-3 py-1.5 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-100 transition shadow-sm">本週</button>
                    <button onClick={() => { const d = new Date(currentWeekStart); d.setDate(d.getDate() + 7); setCurrentWeekStart(d); }} className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-md transition"><ChevronRightCircle size={20}/></button>
                  </div>
                  <h2 className="text-lg font-bold text-gray-800">
                    {currentWeekStart.getFullYear()} 年 {currentWeekStart.getMonth() + 1} 月
                  </h2>
                  <div className="w-20"></div> {/* 佔位平衡 */}
                </div>

                {/* --- 統一 X/Y 滾動區塊 --- */}
                <div className="flex-1 overflow-auto bg-gray-50/20 relative">
                  <div className="flex flex-col min-w-[800px]">
                    
                    {/* 星期標頭 (跟著 X 軸滾動，Y 軸固定) */}
                    <div className="flex border-b border-gray-200 bg-gray-50 sticky top-0 z-40 shadow-sm">
                      {/* 左上角空白處也要固定 X 軸，確保不會被後面的時間軸蓋住 */}
                      <div className="w-14 border-r border-gray-200 flex-shrink-0 bg-gray-50 sticky left-0 z-50"></div>
                      <div className="flex flex-1">
                        {weekDates.map(day => (
                          <div key={day.fullDate} className={`flex-1 min-w-[100px] text-center py-2.5 border-r border-gray-100 ${day.isToday ? 'bg-[#FDFBF7]' : ''}`}>
                            <p className={`text-[11px] font-bold ${day.isToday ? 'text-[#A87B7B]' : 'text-gray-500'}`}>{day.dayStr}</p>
                            <p className={`text-lg mt-0.5 mx-auto font-bold flex items-center justify-center w-7 h-7 rounded-full ${day.isToday ? 'bg-[#A87B7B] text-white shadow-sm' : 'text-gray-800'}`}>{day.dateNum}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 時間格線 (純點擊區) */}
                    <div className="flex flex-1">
                      {/* 左側時間軸 */}
                      <div className="w-14 flex-shrink-0 border-r border-gray-200 bg-white sticky left-0 z-30">
                        {Array.from({length: 13}).map((_, i) => (
                          <div key={i} className="h-[90px] border-b border-gray-100 text-right pr-2 pt-1 text-xs text-gray-400 font-medium">
                            {String(i+9).padStart(2,'0')}:00
                          </div>
                        ))}
                      </div>

                      {/* 右側天數行 */}
                      <div className="flex flex-1 relative">
                        {weekDates.map((day) => {
                          const schedule = activeDesigner?.schedules.find(s => s.fullDate === day.fullDate);
                          const groups = groupSlots(schedule?.times);
                          const isPast = day.fullDate < getTodayString();
                          
                          return (
                            <div 
                              key={day.fullDate} 
                              className={`flex-1 border-r border-gray-100 relative min-w-[100px] ${day.isToday ? 'bg-[#FDFBF7]/40' : ''}`}
                            >
                              {/* 背景網格點擊事件 */}
                              <div className="absolute inset-0 flex flex-col z-0">
                                {TIME_BLOCKS.map(time => (
                                  <div key={time}
                                       className={`h-[45px] border-b border-dashed border-gray-100 transition-colors ${isPast ? 'bg-gray-100/50 cursor-not-allowed' : 'hover:bg-[#E8D3C8]/20 cursor-pointer'}`}
                                       onClick={() => !isPast && handleCellClick(day.fullDate, time)}
                                  />
                                ))}
                              </div>

                              {/* 已建立的區塊層 */}
                              <div className={`absolute inset-0 z-10 pointer-events-none`}>
                                {groups.map((group, i) => {
                                  const colorObj = EVENT_COLORS.find(c => c.id === group.color) || EVENT_COLORS[0];
                                  const isFullClass = group.isFull
                                    ? `${colorObj.colorClass} z-20 shadow-md`
                                    : 'bg-[#FDFBF7] text-[#A87B7B] border-[#E8D3C8] z-10 hover:bg-[#F5E3E3]';

                                  return (
                                    <div key={i}
                                        style={{ top: getTopPx(group.startTime), height: getTopPx(group.endTime) - getTopPx(group.startTime) }}
                                        className={`absolute left-1 right-1 rounded-md border p-1.5 cursor-pointer overflow-hidden transition-all hover:z-30 hover:shadow-md pointer-events-auto hover:scale-[1.02]
                                            ${isFullClass}
                                        `}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (isPast) return;
                                          handleGroupClick(day.fullDate, group);
                                        }}
                                    >
                                      <div className="text-[10px] font-bold leading-tight opacity-90 drop-shadow-sm pointer-events-none">
                                        {group.startTime} - {group.endTime}
                                      </div>
                                      <div className="text-xs font-bold truncate mt-0.5 pointer-events-none">
                                        {group.isFull ? (group.clientName || '已預約') : '開放預約'}
                                      </div>
                                      {group.isFull && group.service && (
                                        <div className="text-[10px] opacity-90 truncate mt-0.5 pointer-events-none">{group.service}</div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 批次自動開班 Modal */}
          {showAutoScheduleModal && (
            <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl relative animate-in zoom-in duration-200">
                <button onClick={() => setShowAutoScheduleModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800"><X size={20}/></button>
                <div className="flex items-center gap-2 mb-6 border-b pb-3">
                  <Wand2 size={24} className="text-[#C59A5C]" />
                  <h3 className="text-xl font-bold text-gray-800">批次智慧排班設定</h3>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">1. 選擇要排班的月份</label>
                    <input type="month" value={generateMonth} onChange={(e) => setGenerateMonth(e.target.value)} className="w-full p-3 rounded-xl border border-gray-200 text-base text-gray-700 bg-gray-50 focus:bg-white focus:border-[#A87B7B] outline-none transition cursor-pointer" />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">2. 選擇固定開放的星期</label>
                    <div className="flex gap-2">
                      {["日", "一", "二", "三", "四", "五", "六"].map((dStr, idx) => (
                        <button
                          key={idx}
                          onClick={() => toggleWorkDay(idx)}
                          className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors border ${
                            autoScheduleConfig.workDays.includes(idx) 
                              ? 'bg-[#A87B7B] text-white border-[#A87B7B] shadow-sm' 
                              : 'bg-white text-gray-400 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {dStr}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">3. 上班時間</label>
                      <select value={autoScheduleConfig.startTime} onChange={e => setAutoScheduleConfig({...autoScheduleConfig, startTime: e.target.value})} className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-[#A87B7B]">
                        {TIME_BLOCKS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">至 下班時間</label>
                      <select value={autoScheduleConfig.endTime} onChange={e => setAutoScheduleConfig({...autoScheduleConfig, endTime: e.target.value})} className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-[#A87B7B]">
                        {TIME_BLOCKS.map(t => <option key={t} value={t}>{t}</option>)}
                        <option value="21:00">21:00</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-[#FDFBF7] p-4 rounded-xl border border-[#F0E6D8]">
                    <label className="flex items-center gap-2 cursor-pointer mb-3">
                      <input type="checkbox" checked={autoScheduleConfig.hasBreak} onChange={e => setAutoScheduleConfig({...autoScheduleConfig, hasBreak: e.target.checked})} className="w-4 h-4 accent-[#A87B7B]" />
                      <span className="text-sm font-bold text-[#A87B7B]">設定固定午休/保留時間 (不開放預約)</span>
                    </label>
                    {autoScheduleConfig.hasBreak && (
                      <div className="flex items-center gap-3">
                        <select value={autoScheduleConfig.breakStart} onChange={e => setAutoScheduleConfig({...autoScheduleConfig, breakStart: e.target.value})} className="flex-1 p-2 rounded-lg border border-gray-200 bg-white text-sm outline-none focus:border-[#A87B7B]">
                          {TIME_BLOCKS.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <span className="text-gray-400">至</span>
                        <select value={autoScheduleConfig.breakEnd} onChange={e => setAutoScheduleConfig({...autoScheduleConfig, breakEnd: e.target.value})} className="flex-1 p-2 rounded-lg border border-gray-200 bg-white text-sm outline-none focus:border-[#A87B7B]">
                          {TIME_BLOCKS.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-8">
                  <button onClick={handleApplyAutoSchedule} className="w-full py-3.5 bg-[#A87B7B] text-white rounded-xl text-base font-bold hover:bg-[#8f6666] transition shadow-lg shadow-[#A87B7B]/30 flex items-center justify-center gap-2">
                    一鍵產生 {generateMonth} 月排班
                  </button>
                  <p className="text-center text-[11px] text-gray-400 mt-3">※ 系統將自動把時段分割為【每 2 小時】一個區塊喔！</p>
                </div>
              </div>
            </div>
          )}

          {/* 編輯時段 Modal */}
          {editingSlot && (
            <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl relative animate-in zoom-in duration-200">
                <button onClick={() => setEditingSlot(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800"><X size={20}/></button>
                <h3 className="text-lg font-bold mb-4 border-b pb-2">
                  {editingSlot.isNew ? '新增時段' : '管理時段'}：{editingSlot.date}
                </h3>
                
                <div className="space-y-4 mt-4">
                  {/* 時間區間選擇 */}
                  <div className="grid grid-cols-2 gap-3 mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                     <div>
                       <label className="block text-xs font-bold text-gray-600 mb-1">起始時間</label>
                       <select 
                          value={editingSlot.startTime} 
                          onChange={e => {
                             const newStart = e.target.value;
                             let newEnd = editingSlot.endTime;
                             if (newStart >= newEnd) newEnd = getNextTime(newStart);
                             setEditingSlot({...editingSlot, startTime: newStart, endTime: newEnd});
                          }}
                          className="w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#A87B7B] bg-white"
                       >
                         {TIME_BLOCKS.map(t => <option key={t} value={t}>{t}</option>)}
                       </select>
                     </div>
                     <div>
                       <label className="block text-xs font-bold text-gray-600 mb-1">結束時間</label>
                       <select 
                          value={editingSlot.endTime} 
                          onChange={e => setEditingSlot({...editingSlot, endTime: e.target.value})}
                          className="w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#A87B7B] bg-white"
                       >
                         {TIME_BLOCKS.map(t => {
                           if (t <= editingSlot.startTime) return null;
                           return <option key={t} value={t}>{t}</option>;
                         })}
                         <option value="21:00">21:00</option>
                       </select>
                     </div>
                  </div>

                  <label className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer border transition-all ${editingSlot.isFull ? 'bg-[#FDFBF7] border-[#D4B8A8]' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                    <input type="checkbox" checked={editingSlot.isFull} onChange={e=>setEditingSlot({...editingSlot, isFull: e.target.checked})} className="w-5 h-5 accent-[#A87B7B]"/>
                    <div>
                      <span className="font-bold text-gray-800 block text-sm">標記為已預約 (滿檔)</span>
                      <span className="text-xs text-gray-500">客人在前台將無法點選這段時間</span>
                    </div>
                  </label>

                  {editingSlot.isFull && (
                    <div className="space-y-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-gray-600 mb-1">客戶姓名 *</label>
                          <input 
                            type="text" 
                            value={editingSlot.clientName || ''} 
                            onChange={e => {
                              const val = e.target.value;
                              const matched = clients.find(c => c.name === val);
                              setEditingSlot({
                                ...editingSlot, 
                                clientName: val,
                                clientPhone: matched && (!editingSlot.clientPhone || editingSlot.clientPhone === '') ? matched.phone : editingSlot.clientPhone
                              });
                            }} 
                            placeholder="例：林語晴" 
                            list="calendar-client-names"
                            className="w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#A87B7B] bg-white"
                          />
                          <datalist id="calendar-client-names">
                            {clients.map(c => <option key={c.id} value={c.name}>{c.phone}</option>)}
                          </datalist>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-600 mb-1">聯絡電話 (自動建檔)</label>
                          <input 
                            type="tel" 
                            value={editingSlot.clientPhone || ''} 
                            onChange={e => {
                              const val = e.target.value;
                              const matched = clients.find(c => c.phone === val);
                              setEditingSlot({
                                ...editingSlot, 
                                clientPhone: val,
                                clientName: matched ? matched.name : editingSlot.clientName
                              });
                            }} 
                            placeholder="例：0912345678" 
                            list="calendar-client-phones"
                            className="w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#A87B7B] bg-white"
                          />
                          <datalist id="calendar-client-phones">
                            {clients.map(c => <option key={c.id} value={c.phone}>{c.name}</option>)}
                          </datalist>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">預約項目 / 備註</label>
                        <input 
                          type="text" 
                          value={editingSlot.service || ''} 
                          onChange={e=>setEditingSlot({...editingSlot, service: e.target.value})} 
                          placeholder="例：日式單根(自然)" 
                          list="calendar-services"
                          className="w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#A87B7B] bg-white"
                        />
                        <datalist id="calendar-services">
                          {savedServices.map(s => <option key={s} value={s} />)}
                        </datalist>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-2">自訂標記顏色</label>
                        <div className="flex gap-2.5">
                          {EVENT_COLORS.map(c => (
                            <div 
                              key={c.id} 
                              onClick={() => setEditingSlot({...editingSlot, color: c.id})}
                              className={`w-7 h-7 rounded-full cursor-pointer transition transform hover:scale-110 flex items-center justify-center
                                ${editingSlot.color === c.id ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''}`}
                              style={{ backgroundColor: c.hex }}
                              title={c.name}
                            >
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-8 flex gap-3">
                  {!editingSlot.isNew && (
                    <button onClick={handleRemoveSlot} className="px-4 py-2.5 bg-red-50 text-red-500 rounded-xl text-sm font-bold hover:bg-red-500 hover:text-white transition flex items-center gap-1"><Trash2 size={16}/> 刪除</button>
                  )}
                  <div className="flex-1"></div>
                  <button onClick={handleSaveSlotEdit} className="px-8 py-2.5 bg-[#A87B7B] text-white rounded-xl text-sm font-bold hover:bg-[#8f6666] shadow-sm">套用時段</button>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: 客戶管理 */}
          {activeTab === 'clients' && !selectedClient && (
            <div className="p-6 max-w-6xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <div><h1 className="text-2xl font-bold text-gray-800">客戶管理</h1><p className="text-sm text-gray-500">Customer CRM</p></div>
                <button onClick={() => { setEditingClientId(null); setNewClientData({ name: '', phone: '', birthday: '', tags: '', lashPreference: '' }); setShowAddClientModal(true); }} className="bg-[#A87B7B] hover:bg-[#8f6666] text-white px-4 py-2 rounded-lg flex items-center gap-1.5 text-sm font-bold"><Plus size={16} />新增客戶</button>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                <div className="relative mb-4 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input type="text" placeholder="搜尋姓名或手機號碼..." className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#A87B7B]" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead>
                      <tr className="border-b border-gray-100 text-gray-500 text-sm"><th className="pb-3 px-4 font-medium">客戶姓名</th><th className="pb-3 px-4 font-medium">聯絡電話</th><th className="pb-3 px-4 font-medium">標籤</th><th className="pb-3 px-4 font-medium">最近消費</th><th className="pb-3 px-4 text-right"></th></tr>
                    </thead>
                    <tbody>
                      {filteredClients.map(c => (
                        <tr key={c.id} className="border-b border-gray-50 hover:bg-[#FDFBF7] transition cursor-pointer" onClick={() => setSelectedClient(c)}>
                          <td className="py-3 px-4 font-bold text-gray-800">{c.name}</td><td className="py-3 px-4 text-sm text-gray-600">{c.phone}</td>
                          <td className="py-3 px-4 flex gap-1">{c.tags.map(t => <span key={t} className="bg-[#F5E3E3] text-[#A87B7B] text-[10px] px-2 py-0.5 rounded-full font-bold">{t}</span>)}</td>
                          <td className="py-3 px-4 text-sm text-gray-500">{c.visits.length > 0 ? c.visits[0].date : '無紀錄'}</td>
                          <td className="py-3 px-4 text-right text-sm font-bold text-[#A87B7B]">查看</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'clients' && selectedClient && (
            <div className="p-6 max-w-6xl mx-auto">
              <button onClick={() => setSelectedClient(null)} className="flex items-center gap-1 text-gray-500 hover:text-gray-800 mb-4 text-sm font-bold"><ChevronLeft size={16} /> 返回列表</button>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#E8D3C8] to-[#D4B8A8]"></div>
                    <div className="flex justify-between items-start mt-2">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800">{selectedClient.name}</h2>
                        <p className="text-gray-500 text-sm mt-1">{selectedClient.phone}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={handleEditClientClick}
                          className="text-gray-400 hover:text-[#A87B7B] transition p-2 bg-gray-50 hover:bg-[#FDFBF7] rounded-full"
                          title="編輯此客戶"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => setConfirmModal({ title: '刪除客戶', message: `刪除「${selectedClient.name}」後將無法復原，包含所有消費紀錄都會被移除。確定刪除嗎？`, onConfirm: handleDeleteClient })}
                          className="text-gray-400 hover:text-red-500 transition p-2 bg-gray-50 hover:bg-red-50 rounded-full"
                          title="刪除此客戶"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-1.5">{selectedClient.tags.map(t => <span key={t} className="bg-[#F5E3E3] text-[#A87B7B] text-[10px] px-2 py-0.5 rounded-full font-bold">{t}</span>)}</div>
                    <div className="mt-5 space-y-3">
                      <div className="p-3 bg-[#FDFBF7] rounded-xl border border-[#F0E6D8]">
                        <p className="text-xs text-[#A87B7B] font-bold mb-1 flex items-center gap-1"><Clock size={12} /> 專屬睫毛密碼</p>
                        <p className="text-sm text-gray-700">{selectedClient.lashPreference}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl"><p className="text-[10px] text-gray-500 font-bold">儲值餘額</p><p className="text-lg font-bold text-gray-800">${selectedClient.balance}</p></div>
                        <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl"><p className="text-[10px] text-gray-500 font-bold">剩餘包堂</p>{selectedClient.packages.length>0 ? selectedClient.packages.map(p=><p key={p.id} className="text-sm font-bold text-[#A87B7B]">{p.name}:{p.remaining}</p>) : <p className="text-sm font-bold text-gray-400">無</p>}</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-gray-800 flex items-center gap-2"><CalendarCheck size={18} className="text-[#A87B7B]" /> 服務紀錄</h3>
                      <button onClick={() => {
                        if (isAddingVisit) {
                          setIsAddingVisit(false);
                          setEditingVisitId(null);
                          setNewVisit({ date: getTodayString(), services: [], size: '', amount: '', paymentMethod: '現金', accountLast5: '', deductPackageId: '', notes: '', photoUrl: '', designerId: activeDesignerId || '' });
                          setCustomPayment('');
                        } else {
                          setIsAddingVisit(true);
                        }
                      }} className="text-sm bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-lg font-bold transition">
                        {isAddingVisit ? '取消編輯/新增' : '+ 新增紀錄'}
                      </button>
                    </div>
                    {/* --- 全新升級：新增/編輯紀錄表單 --- */}
                    {isAddingVisit && (
                      <div className="mb-8 p-5 bg-[#FDFBF7] border border-[#F0E6D8] rounded-xl shadow-inner">
                        <h4 className="font-bold text-[#A87B7B] mb-4 flex items-center gap-2 border-b border-[#F0E6D8] pb-2">
                           {editingVisitId ? <Edit size={18} /> : <Plus size={18} />} 
                           {editingVisitId ? '編輯消費紀錄' : '新增消費紀錄'}
                        </h4>
                        <div className="space-y-5">
                           
                           {/* 日期與基礎資訊 */}
                           <div className="grid grid-cols-2 gap-4">
                             <div>
                               <label className="text-xs font-bold text-gray-500 block mb-1">日期 *</label>
                               <input type="date" value={newVisit.date} onChange={e=>setNewVisit({...newVisit,date:e.target.value})} className="w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#A87B7B]" />
                             </div>
                             <div>
                               <label className="text-xs font-bold text-gray-500 block mb-1">操作設計師 *</label>
                               <select value={newVisit.designerId} onChange={e=>setNewVisit({...newVisit, designerId: e.target.value})} className="w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#A87B7B] bg-white">
                                 <option value="">請選擇</option>
                                 {designers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                               </select>
                             </div>
                           </div>

                           {/* 消費項目 (動態讀取系統設定) */}
                           <div>
                             <label className="text-xs font-bold text-gray-500 block mb-2">消費項目 (可複選) *</label>
                             <div className="grid grid-cols-2 md:grid-cols-3 gap-2 bg-white p-3 rounded-lg border border-gray-200 max-h-[250px] overflow-y-auto">
                                {savedServices.map(svc => (
                                  <label key={svc} className="flex items-start gap-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-50 p-1 rounded transition">
                                    <input 
                                      type="checkbox" 
                                      className="mt-0.5 w-4 h-4 accent-[#A87B7B] flex-shrink-0"
                                      checked={newVisit.services.includes(svc)}
                                      onChange={() => handleServiceToggle(svc)}
                                    />
                                    <span className="leading-snug">{svc}</span>
                                  </label>
                                ))}
                             </div>
                           </div>

                           <div className="grid grid-cols-1 gap-4">
                             <div>
                               <label className="text-xs font-bold text-gray-500 block mb-1">尺寸 *</label>
                               <input type="text" placeholder="例：C翹度 0.15 10-11-12" value={newVisit.size} onChange={e=>setNewVisit({...newVisit,size:e.target.value})} className="w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#A87B7B]" />
                             </div>
                           </div>

                           {/* 金額與支付方式 */}
                           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             <div>
                               <label className="text-xs font-bold text-gray-500 block mb-1">總金額 *</label>
                               <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                  <input type="number" placeholder="0" value={newVisit.amount} onChange={e=>setNewVisit({...newVisit,amount:e.target.value})} className="w-full pl-7 p-2.5 border border-gray-200 rounded-lg text-sm font-bold text-[#A87B7B] outline-none focus:border-[#A87B7B]" />
                               </div>
                             </div>
                             <div>
                               <label className="text-xs font-bold text-gray-500 block mb-1">支付方式 *</label>
                               <select value={newVisit.paymentMethod} onChange={e=>setNewVisit({...newVisit,paymentMethod:e.target.value})} className="w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#A87B7B]">
                                 {paymentMethods.map(m=><option key={m} value={m}>{m}</option>)}
                                 <option value="自訂">+ 新增自訂...</option>
                               </select>
                             </div>
                             <div>
                               {newVisit.paymentMethod === '轉帳' && (
                                 <>
                                   <label className="text-xs font-bold text-gray-500 block mb-1">帳號後五碼</label>
                                   <input type="text" maxLength="5" placeholder="後 5 碼" value={newVisit.accountLast5} onChange={e=>setNewVisit({...newVisit,accountLast5:e.target.value})} className="w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#A87B7B]" />
                                 </>
                               )}
                               {newVisit.paymentMethod === '自訂' && (
                                 <>
                                   <label className="text-xs font-bold text-gray-500 block mb-1">自訂方式名稱</label>
                                   <input type="text" placeholder="輸入方式" value={customPayment} onChange={e=>setCustomPayment(e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#A87B7B]" />
                                 </>
                               )}
                             </div>
                           </div>

                           {/* 客片完成照 & 備註 */}
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label className="text-xs font-bold text-gray-500 block mb-1">客片完成照</label>
                                <input type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploadingImage} className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#F5E3E3] file:text-[#A87B7B] hover:file:bg-[#F0E6D8] cursor-pointer disabled:opacity-50" />
                                {isUploadingImage && (
                                  <div className="mt-2 text-xs text-[#A87B7B] font-bold animate-pulse flex items-center gap-1">
                                    <Cloud size={14}/> 高畫質上傳中，請稍候...
                                  </div>
                                )}
                                {newVisit.photoUrl && !isUploadingImage && (
                                  <div className="mt-2 relative inline-block">
                                    <img src={newVisit.photoUrl} alt="預覽" className="h-16 w-16 object-cover rounded-lg border shadow-sm" />
                                    <button onClick={() => setNewVisit({...newVisit, photoUrl: ''})} className="absolute -top-1.5 -right-1.5 bg-gray-800 text-white rounded-full p-0.5 hover:bg-red-500"><X size={12} /></button>
                                  </div>
                                )}
                             </div>
                             <div>
                               <label className="text-xs font-bold text-gray-500 block mb-1">備註</label>
                               <textarea value={newVisit.notes} onChange={e=>setNewVisit({...newVisit,notes:e.target.value})} className="w-full p-2.5 border border-gray-200 rounded-lg text-sm h-16 outline-none focus:border-[#A87B7B]"></textarea>
                             </div>
                           </div>
                           
                           <div className="flex justify-end pt-2">
                             <button onClick={handleAddVisit} disabled={isUploadingImage} className="bg-[#A87B7B] text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-sm hover:bg-[#8f6666] disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center gap-2">
                               <Save size={16}/> {editingVisitId ? '確認更新' : '確認儲存'}
                             </button>
                           </div>
                        </div>
                      </div>
                    )}
                    
                    {/* 歷史紀錄時間軸 */}
                    <div className="space-y-5">
                      {selectedClient.visits.map((visit) => (
                        <div key={visit.id} className="relative pl-6 border-l-2 border-gray-100 pb-2 group">
                          <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-4 border-[#E8D3C8]"></div>
                          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start mb-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-[#A87B7B] bg-[#FDFBF7] px-2 py-0.5 rounded">{visit.date}</span>
                                {visit.designerName && (
                                  <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                                    由 {visit.designerName} 服務
                                  </span>
                                )}
                              </div>
                              <h4 className="font-bold text-gray-800 mt-2 text-lg leading-tight">{visit.service}</h4>
                              {visit.size && <p className="text-[11px] text-gray-500 mt-1 font-medium">尺寸規格：{visit.size}</p>}
                            </div>
                            <div className="flex flex-col items-end gap-1 w-full sm:w-auto">
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => handleEditVisitClick(visit)} 
                                  className="text-gray-300 hover:text-[#A87B7B] p-1 transition-colors" 
                                  title="編輯紀錄"
                                >
                                  <Edit size={16}/>
                                </button>
                                <span className="block text-lg font-bold text-gray-800">${(Number(visit.amount)||0).toLocaleString()}</span>
                              </div>
                              <span className={`text-xs px-2 py-0.5 rounded-full inline-block ${visit.paymentMethod === '儲值金扣款' || visit.paymentMethod === '扣除包堂' ? 'bg-[#FDFBF7] text-[#A87B7B] border border-[#F0E6D8]' : 'bg-gray-100 text-gray-500'}`}>
                                {visit.paymentMethod} {visit.accountLast5 ? `(${visit.accountLast5})` : ''}
                              </span>
                            </div>
                          </div>
                          {visit.notes && <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-3 rounded-lg border border-gray-100">{visit.notes}</p>}
                          
                          {/* 點擊放大圖片區域 */}
                          {visit.photos && visit.photos.length > 0 && (
                            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                              {visit.photos.map((photo, i) => (
                                <img 
                                  key={i} 
                                  src={photo} 
                                  alt="客片" 
                                  onClick={() => setEnlargedImage(photo)}
                                  className="w-20 h-20 object-cover rounded-lg border border-gray-200 shadow-sm cursor-pointer hover:opacity-80 transition" 
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                      {selectedClient.visits.length===0 && <p className="text-sm text-gray-400 text-center py-4">無紀錄</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* 刪除客戶確認 Modal */}
              {showDeleteClientModal && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
                  <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl relative animate-in zoom-in duration-200">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">確定刪除此客戶？</h3>
                    <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                      刪除「<span className="font-bold">{selectedClient.name}</span>」後將無法復原，包含其所有的消費紀錄與儲值資料都會被永久移除。
                    </p>
                    <div className="flex gap-3">
                      <button onClick={() => setShowDeleteClientModal(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-200 transition">取消</button>
                      <button onClick={handleDeleteClient} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition shadow-sm shadow-red-200">確定刪除</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 新增客戶 / 編輯客戶 Modal */}
          {showAddClientModal && (
            <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl relative">
                <button onClick={closeClientModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800"><X size={20}/></button>
                <h2 className="text-xl font-bold mb-4">{editingClientId ? '編輯客戶資料' : '新增客戶資料'}</h2>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">姓名 *</label>
                    <input type="text" placeholder="例如：林語晴" value={newClientData.name} onChange={e=>setNewClientData({...newClientData,name:e.target.value})} className="w-full p-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#A87B7B]" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">手機 *</label>
                    <input type="tel" placeholder="例如：0912-345-678" value={newClientData.phone} onChange={e=>setNewClientData({...newClientData,phone:e.target.value})} className="w-full p-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#A87B7B]" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">生日</label>
                    <input type="date" value={newClientData.birthday} onChange={e=>setNewClientData({...newClientData,birthday:e.target.value})} className="w-full p-2 border border-gray-200 rounded-lg text-sm outline-none text-gray-700 focus:border-[#A87B7B]" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">標籤 (用逗號分隔)</label>
                    <input type="text" placeholder="例如：VIP, 喜歡自然款" value={newClientData.tags} onChange={e=>setNewClientData({...newClientData,tags:e.target.value})} className="w-full p-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#A87B7B]" />
                  </div>
                  {editingClientId && (
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">專屬睫毛密碼</label>
                      <input type="text" placeholder="例如：C翹度 / 粗度0.10" value={newClientData.lashPreference || ''} onChange={e=>setNewClientData({...newClientData,lashPreference:e.target.value})} className="w-full p-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#A87B7B]" />
                    </div>
                  )}
                  <button onClick={handleSaveClient} className="w-full bg-[#A87B7B] text-white py-2.5 rounded-lg text-sm font-bold mt-4 shadow-sm hover:bg-[#8f6666] transition">
                    {editingClientId ? '更新儲存' : '建立'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: 交易紀錄 (包含進階篩選) */}
          {activeTab === 'transactions' && (
            <div className="p-6 max-w-5xl mx-auto">
               <div className="mb-6"><h1 className="text-2xl font-bold text-gray-800">交易紀錄與業績統計</h1></div>
               
               {/* --- 進階篩選區塊 --- */}
               <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-4 md:items-end">
                 <div className="flex items-center gap-2 mb-1 md:hidden">
                    <Filter size={16} className="text-[#A87B7B]"/> 
                    <span className="font-bold text-sm text-gray-700">篩選條件</span>
                 </div>
                 
                 <div className="flex-1">
                   <label className="block text-xs font-bold text-gray-500 mb-1">查詢區間</label>
                   <select value={txFilterType} onChange={e => setTxFilterType(e.target.value)} className="w-full p-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#A87B7B]">
                     <option value="month">單月查詢</option>
                     <option value="day">單日查詢</option>
                     <option value="custom">自訂區間</option>
                     <option value="all">所有紀錄</option>
                   </select>
                 </div>
                 
                 {txFilterType === 'month' && (
                   <div className="flex-1">
                     <label className="block text-xs font-bold text-gray-500 mb-1">選擇月份</label>
                     <input type="month" value={txFilterMonth} onChange={e=>setTxFilterMonth(e.target.value)} className="w-full p-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#A87B7B]" />
                   </div>
                 )}
                 {txFilterType === 'day' && (
                   <div className="flex-1">
                     <label className="block text-xs font-bold text-gray-500 mb-1">選擇日期</label>
                     <input type="date" value={txFilterDate} onChange={e=>setTxFilterDate(e.target.value)} className="w-full p-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#A87B7B]" />
                   </div>
                 )}
                 {txFilterType === 'custom' && (
                   <div className="flex-2 flex items-end gap-2">
                     <div className="flex-1">
                       <label className="block text-xs font-bold text-gray-500 mb-1">開始日期</label>
                       <input type="date" value={txFilterStartDate} onChange={e=>setTxFilterStartDate(e.target.value)} className="w-full p-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#A87B7B]" />
                     </div>
                     <span className="text-gray-400 mb-2">-</span>
                     <div className="flex-1">
                       <label className="block text-xs font-bold text-gray-500 mb-1">結束日期</label>
                       <input type="date" value={txFilterEndDate} onChange={e=>setTxFilterEndDate(e.target.value)} className="w-full p-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#A87B7B]" />
                     </div>
                   </div>
                 )}

                 <div className="flex-1">
                   <label className="block text-xs font-bold text-gray-500 mb-1">指定設計師</label>
                   <select value={txFilterDesignerId} onChange={e => setTxFilterDesignerId(e.target.value)} className="w-full p-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#A87B7B]">
                     <option value="all">全部設計師 (總店)</option>
                     {designers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                   </select>
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-4 mb-6">
                 <div className="bg-white p-5 rounded-2xl border shadow-sm"><p className="text-sm text-gray-500">期間總營業額</p><h2 className="text-3xl font-bold text-[#A87B7B]">${totalRevenue.toLocaleString()}</h2></div>
                 <div className="bg-white p-5 rounded-2xl border shadow-sm"><p className="text-sm text-gray-500">交易筆數</p><h2 className="text-3xl font-bold text-gray-800">{allTransactions.length}</h2></div>
               </div>
               <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                 <table className="w-full text-left text-sm whitespace-nowrap">
                   <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
                     <tr>
                       <th className="p-4">日期</th>
                       <th className="p-4">設計師</th>
                       <th className="p-4">客戶</th>
                       <th className="p-4">項目</th>
                       <th className="p-4">方式</th>
                       <th className="p-4 text-right">金額</th>
                     </tr>
                   </thead>
                   <tbody>
                     {allTransactions.map((tx, index) => (
                       <tr key={`${tx.id}-${index}`} className="border-b border-gray-50 hover:bg-gray-50">
                         <td className="p-4 text-gray-600">{tx.date}</td>
                         <td className="p-4 text-gray-600">{tx.designerName || '未指定'}</td>
                         <td className="p-4 font-bold text-gray-800">{tx.clientName}</td>
                         <td className="p-4 max-w-[150px] md:max-w-[200px] truncate" title={tx.service}>{tx.service}</td>
                         <td className="p-4"><span className={`px-2 py-1 rounded text-xs ${tx.paymentMethod === '儲值金扣款' || tx.paymentMethod === '扣除包堂' ? 'bg-[#FDFBF7] text-[#A87B7B] border border-[#F0E6D8]' : 'bg-gray-100 text-gray-500'}`}>{tx.paymentMethod}</span></td>
                         <td className="p-4 text-right font-bold">${tx.totalAmount.toLocaleString()}</td>
                       </tr>
                     ))}
                     {allTransactions.length === 0 && (
                       <tr><td colSpan="6" className="text-center py-10 text-gray-400">該條件下尚無交易紀錄</td></tr>
                     )}
                   </tbody>
                 </table>
               </div>
            </div>
          )}

          {/* Tab 4: 庫存 */}
          {activeTab === 'inventory' && (
            <div className="p-6 max-w-4xl mx-auto">
              <div className="mb-6"><h1 className="text-2xl font-bold text-gray-800">耗材與庫存</h1></div>
              <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                 <table className="w-full text-left text-sm whitespace-nowrap">
                   <thead className="bg-gray-50 text-gray-500"><tr><th className="p-4">品項</th><th className="p-4">分類</th><th className="p-4 text-center">庫存</th><th className="p-4">狀態</th></tr></thead>
                   <tbody>
                     {inventory.map(item => (
                       <tr key={item.id} className="border-b hover:bg-gray-50"><td className="p-4 font-bold text-gray-800">{item.name}</td><td className="p-4"><span className="bg-gray-100 px-2 py-1 rounded text-xs">{item.category}</span></td><td className="p-4 text-center font-bold">{item.stock}</td><td className="p-4">{item.status==='低庫存'?<span className="text-red-500 bg-red-50 px-2 py-1 rounded text-xs font-bold">過低</span>:<span className="text-green-500 bg-green-50 px-2 py-1 rounded text-xs font-bold">充足</span>}</td></tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          )}

          {/* Tab 5: 全新系統設定 */}
          {activeTab === 'settings' && (
            <div className="p-6 max-w-5xl mx-auto space-y-6">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-1">系統設定</h1>
                <p className="text-sm text-gray-500">System Configuration & Management</p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 左欄：設計師管理 */}
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-center mb-5 border-b border-gray-100 pb-3">
                      <h2 className="font-bold text-gray-800 flex items-center gap-2"><Users size={18} className="text-[#A87B7B]"/> 設計師團隊管理</h2>
                      <button onClick={handleAddNewDesigner} className="text-[#A87B7B] hover:text-[#8f6666] text-sm font-bold flex items-center gap-1"><Plus size={16}/> 新增</button>
                    </div>
                    <div className="space-y-4">
                      {designers.map(d => (
                        <div key={d.id} className="flex gap-3 items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                          <div className="flex-1 space-y-2">
                            <div><label className="text-[10px] text-gray-500 font-bold block">姓名</label><input type="text" value={d.name} onChange={e=>handleUpdateDesignerItem(d.id, "name", e.target.value)} className="w-full bg-white border border-gray-200 rounded p-1.5 text-sm outline-none focus:border-[#A87B7B]" /></div>
                            <div><label className="text-[10px] text-gray-500 font-bold block">地點/備註</label><input type="text" value={d.location} onChange={e=>handleUpdateDesignerItem(d.id, "location", e.target.value)} className="w-full bg-white border border-gray-200 rounded p-1.5 text-sm outline-none focus:border-[#A87B7B]" /></div>
                          </div>
                          <button onClick={() => setConfirmModal({ title: '刪除設計師', message: `確定要刪除「${d.name}」嗎？這將同時刪除該設計師的所有排班紀錄，且無法復原。`, onConfirm: () => handleDeleteDesigner(d.id) })} className="text-gray-400 hover:text-red-500 p-2 bg-white rounded-lg border border-gray-200 hover:border-red-200 transition">
                            <Trash2 size={16}/>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* 付款方式管理 */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <h2 className="font-bold text-gray-800 mb-5 border-b border-gray-100 pb-3 flex items-center gap-2"><CreditCard size={18} className="text-[#A87B7B]"/> 付款方式管理</h2>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {paymentMethods.map(method => (
                        <div key={method} className="flex items-center gap-1.5 bg-[#FDFBF7] border border-[#F0E6D8] text-gray-700 px-3 py-1.5 rounded-lg text-sm">
                          <span>{method}</span>
                          {!['現金', '轉帳', '信用卡', 'Line Pay', '儲值金扣款', '扣除包堂'].includes(method) && (
                            <button onClick={() => setConfirmModal({ title: '刪除付款方式', message: `確定要刪除「${method}」嗎？`, onConfirm: () => handleDeletePaymentSetting(method) })} className="text-gray-400 hover:text-red-500 ml-1"><X size={14}/></button>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input type="text" placeholder="輸入新的付款方式" value={newPaymentInput} onChange={e=>setNewPaymentInput(e.target.value)} className="flex-1 p-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#A87B7B]" />
                      <button onClick={handleAddPaymentSetting} className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-black transition">新增</button>
                    </div>
                  </div>
                </div>

                {/* 右欄：服務項目與全域 */}
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-center mb-5 border-b border-gray-100 pb-3">
                      <h2 className="font-bold text-gray-800 flex items-center gap-2"><BookmarkPlus size={18} className="text-[#A87B7B]"/> 消費項目設定</h2>
                    </div>
                    <div className="max-h-60 overflow-y-auto pr-2 space-y-2 mb-4">
                      {savedServices.map(svc => (
                        <div key={svc} className="flex justify-between items-center bg-gray-50 border border-gray-100 p-2.5 rounded-lg">
                          <span className="text-sm font-bold text-gray-700">{svc}</span>
                          <button onClick={() => setConfirmModal({ title: '刪除服務項目', message: `確定要移除「${svc}」嗎？`, onConfirm: () => handleDeleteServiceSetting(svc) })} className="text-gray-400 hover:text-red-500"><X size={16}/></button>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                      <label className="block text-[10px] font-bold text-gray-500 mb-2">快速新增項目</label>
                      <div className="flex gap-2">
                        <input type="text" placeholder="輸入項目名稱" value={newServiceInput} onChange={e=>setNewServiceInput(e.target.value)} className="flex-[2] p-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#A87B7B]" />
                        <button onClick={handleAddServiceSetting} className="bg-[#A87B7B] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#8f6666] transition shadow-sm">新增</button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <h2 className="font-bold text-gray-800 mb-5 border-b border-gray-100 pb-3 flex items-center gap-2"><Settings size={18} className="text-[#A87B7B]"/> 全域系統設定</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">LINE 官方帳號 ID (前台跳轉用)</label>
                        <input type="text" placeholder="@lashbeauty" value={lineOfficialId} onChange={e=>{setLineOfficialId(e.target.value); setHasUnsavedChanges(true);}} className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 outline-none focus:bg-white focus:border-[#A87B7B]" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">LINE 預約總表推播網址 (Google Apps Script)</label>
                        <input type="text" placeholder="https://script.google.com/macros/s/..." value={lineNotifyUrl} onChange={e=>{setLineNotifyUrl(e.target.value); setHasUnsavedChanges(true);}} className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 outline-none focus:bg-white focus:border-[#A87B7B]" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">接收推播的 LINE User ID (多人請用半形逗號 , 分隔)</label>
                        <input type="text" placeholder="例: U123..., U456..." value={lineUserIds} onChange={e=>{setLineUserIds(e.target.value); setHasUnsavedChanges(true);}} className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 outline-none focus:bg-white focus:border-[#A87B7B]" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">圖床 API 金鑰 (系統已預設，可留空)</label>
                        <input type="text" placeholder="留空將使用系統預設金鑰" value={imgbbApiKey} onChange={e=>{setImgbbApiKey(e.target.value); setHasUnsavedChanges(true);}} className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 outline-none focus:bg-white focus:border-[#A87B7B]" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">變更後台登入密碼</label>
                        <div className="flex gap-2">
                          <input type="password" placeholder="輸入新密碼" value={newPasswordInput} onChange={e=>setNewPasswordInput(e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 outline-none focus:bg-white focus:border-[#A87B7B]" />
                          <button onClick={handleChangePassword} className="bg-gray-800 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-black transition">更新</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
        
        {/* 全域放大圖片 Modal */}
        {enlargedImage && (
          <div className="fixed inset-0 bg-black/90 z-[300] flex items-center justify-center p-4 backdrop-blur-sm cursor-zoom-out" onClick={() => setEnlargedImage(null)}>
            <button className="absolute top-5 right-5 text-white/70 hover:text-white transition p-2"><X size={32}/></button>
            <img src={enlargedImage} alt="放大圖片" className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl cursor-default" onClick={e => e.stopPropagation()} />
          </div>
        )}

        {/* 全域確認操作 Modal (防呆) */}
        {confirmModal && (
          <div className="fixed inset-0 bg-black/50 z-[400] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl relative animate-in zoom-in duration-200">
              <h3 className="text-xl font-bold text-gray-800 mb-2">{confirmModal.title}</h3>
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">{confirmModal.message}</p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmModal(null)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-200 transition">取消</button>
                <button onClick={() => { confirmModal.onConfirm(); setConfirmModal(null); }} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition shadow-sm shadow-red-200">確定刪除</button>
              </div>
            </div>
          </div>
        )}

        {/* 新增：今日行程自動提醒 Modal */}
        {showTodayNotice && (
          <div className="fixed inset-0 bg-black/60 z-[500] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl relative animate-in zoom-in duration-300">
              <button onClick={() => setShowTodayNotice(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800"><X size={20}/></button>
              <div className="flex flex-col items-center mb-6">
                <div className="w-16 h-16 bg-[#FDFBF7] text-[#C59A5C] rounded-full flex items-center justify-center mb-3 shadow-sm border border-[#F0E6D8]">
                  <CalendarCheck size={32} />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">今日行程提醒</h3>
                <p className="text-sm text-gray-500 mt-1">您今天有專屬的美麗任務喔！</p>
              </div>
              <div className="max-h-[50vh] overflow-y-auto space-y-4 pr-2 mb-6 hide-scrollbar">
                {designers.map(d => {
                  const todayStr = getTodayString();
                  const todaySchedule = d.schedules.find(s => s.fullDate === todayStr);
                  const todayAppointments = todaySchedule ? todaySchedule.times.filter(t => t.isFull) : [];
                  if (todayAppointments.length === 0) return null;
                  
                  // 將連續的時段群組化，讓畫面更簡潔
                  const groups = groupSlots(todayAppointments);

                  return (
                    <div key={d.id} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <h4 className="font-bold text-[#A87B7B] mb-3 flex items-center gap-1.5"><Users size={16}/> {d.name} 的預約</h4>
                      <div className="space-y-3">
                        {groups.map((g, i) => (
                          <div key={i} className="flex gap-3 items-center bg-white p-3 rounded-lg shadow-sm border border-gray-50">
                            <div className="font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded text-sm">{g.startTime}</div>
                            <div className="flex-1">
                              <p className="font-bold text-gray-800 text-sm">{g.clientName}</p>
                              <p className="text-xs text-gray-500">{g.service}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              <button onClick={() => setShowTodayNotice(false)} className="w-full bg-[#A87B7B] text-white py-3.5 rounded-xl text-lg font-bold hover:bg-[#8f6666] shadow-lg transition">我知道了，開始今天的工作！</button>
              <button 
                onClick={handleSendTodayScheduleToLine} 
                className="w-full mt-3 bg-[#06C755] text-white py-3.5 rounded-xl text-lg font-bold hover:bg-[#05b34c] shadow-lg transition flex items-center justify-center gap-2"
              >
                <Bell size={20}/> 傳送今日總表至 LINE
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ==========================================
  // 客戶前台 Render (手機預約畫面)
  // ==========================================
  const renderCustomerView = () => (
    <div className="w-full max-w-md bg-white min-h-screen shadow-2xl relative pb-28 mx-auto border-x border-gray-200">
      {renderToast()}

      {showGuide && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center backdrop-blur-sm px-4">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-[340px] shadow-2xl relative animate-in zoom-in duration-300">
            <button onClick={() => setShowGuide(false)} className="absolute top-5 right-5 text-gray-400 hover:text-gray-800"><X size={24} /></button>
            <div className="text-center mb-6"><h2 className="text-2xl font-bold text-gray-800 tracking-wide font-tc">預約快速指南 ✨</h2><p className="text-sm text-gray-500 mt-2">只需 3 個簡單步驟，輕鬆完成預約</p></div>
            <div className="space-y-5 mb-8">
              <div className="flex items-center gap-4 bg-[#FDFBF7] p-4 rounded-2xl border border-[#F0E6D8]"><div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#C59A5C] shadow-sm font-bold text-xl">1</div><div><h3 className="font-bold text-gray-800 text-base mb-1">選擇設計師</h3><p className="text-xs text-gray-600">在最上方滑動，點選您指定的設計師。</p></div></div>
              <div className="flex items-center gap-4 bg-[#FDFBF7] p-4 rounded-2xl border border-[#F0E6D8]"><div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#C59A5C] shadow-sm font-bold text-xl">2</div><div><h3 className="font-bold text-gray-800 text-base mb-1">挑選空檔</h3><p className="text-xs text-gray-600">往下滑動，點擊畫面上顯示為白色的可用時段。</p></div></div>
              <div className="flex items-center gap-4 bg-[#FDFBF7] p-4 rounded-2xl border border-[#F0E6D8]"><div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#C59A5C] shadow-sm font-bold text-xl">3</div><div><h3 className="font-bold text-gray-800 text-base mb-1">送出預約</h3><p className="text-xs text-gray-600">點擊最下方的按鈕，系統會自動帶您跳轉 LINE！</p></div></div>
            </div>
            <button onClick={() => setShowGuide(false)} className="w-full bg-[#A87B7B] text-white py-4 rounded-xl text-lg font-bold hover:bg-[#8f6666] shadow-lg">我知道了，開始預約</button>
          </div>
        </div>
      )}

      <div className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-100">
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="w-10"><button onClick={() => setShowGuide(true)} className="w-10 h-10 flex items-center justify-center bg-gray-50 text-gray-400 rounded-full hover:bg-[#FDFBF7] hover:text-[#A87B7B] border border-gray-100"><HelpCircle size={20} /></button></div>
          <div className="text-center flex flex-col items-center">
            <h2 className="text-[30px] font-beauty font-black tracking-wider gold-text leading-tight drop-shadow-sm">Lash <span className="text-[#BA9B85] text-[24px] italic font-serif">&</span> Beauty</h2>
            <span className="font-tc text-[13px] font-bold tracking-[0.4em] text-[#9E8473] ml-1 mt-1">蓓緹美學</span>
          </div>
          <button onClick={() => setShowPasswordPrompt(true)} className="w-10 h-10 flex items-center justify-center bg-gray-50 text-gray-400 rounded-full hover:bg-gray-200"><Settings size={20} /></button>
        </div>
        <div className="flex gap-2.5 overflow-x-auto px-5 py-3 mb-1 no-scrollbar">
          {designers.map((d) => (
            <button key={d.id} onClick={() => { setActiveDesignerId(d.id); setSelectedTime(null); }} className={`flex-shrink-0 px-6 py-2.5 rounded-full text-base font-bold transition-all ${activeDesignerId === d.id ? "bg-[#A87B7B] text-white shadow-md" : "bg-gray-50 text-gray-600 border border-gray-100"}`}>{d.name}</button>
          ))}
        </div>
      </div>

      {showPasswordPrompt && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl p-7 w-full max-w-[320px] shadow-2xl relative">
            <button onClick={() => { setShowPasswordPrompt(false); setPasswordInput(""); setPasswordError(""); }} className="absolute top-5 right-5 text-gray-400"><X size={24} /></button>
            <div className="flex flex-col items-center mb-5 mt-2"><div className="bg-[#F5E3E3] p-4 rounded-full text-[#A87B7B] mb-4"><Lock size={28} /></div><h2 className="text-xl font-bold text-gray-800">請輸入後台密碼</h2></div>
            <input type="password" placeholder="請輸入密碼" className={`w-full p-4 border rounded-xl text-center text-lg mb-2 outline-none focus:ring-2 ${passwordError ? "border-red-400" : "border-gray-200 focus:ring-[#A87B7B]"}`} value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()} autoFocus />
            <div className="h-7 flex justify-center items-start mb-3">{passwordError && <span className="text-sm text-red-500 font-bold">{passwordError}</span>}</div>
            <button onClick={handleAdminLogin} className="w-full bg-[#A87B7B] text-white py-3.5 rounded-xl text-lg font-bold shadow-md mb-5">登入管理後台</button>
            <div className="text-center"><button onClick={() => { setShowPasswordPrompt(false); setShowForgotPrompt(true); setPasswordInput(""); setPasswordError(""); }} className="text-sm text-gray-400 hover:text-[#A87B7B] underline">忘記密碼？</button></div>
          </div>
        </div>
      )}

      {showForgotPrompt && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl p-7 w-full max-w-[320px] shadow-2xl relative">
            <button onClick={() => { setShowForgotPrompt(false); setPasswordInput(""); setPasswordError(""); }} className="absolute top-5 right-5 text-gray-400"><X size={24} /></button>
            <div className="flex flex-col items-center mb-5 mt-2"><div className="bg-gray-100 p-4 rounded-full text-gray-600 mb-4"><Key size={28} /></div><h2 className="text-xl font-bold text-gray-800">重置密碼</h2></div>
            <input type="text" placeholder="請輸入安全碼" className={`w-full p-4 border rounded-xl text-center text-lg mb-2 outline-none focus:ring-2 ${passwordError ? "border-red-400" : "border-gray-200"}`} value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleResetPassword()} autoFocus />
            <div className="h-7 flex justify-center items-start mb-3">{passwordError && <span className="text-sm text-red-500 font-bold">{passwordError}</span>}</div>
            <button onClick={handleResetPassword} className="w-full bg-gray-800 text-white py-3.5 rounded-xl text-lg font-bold shadow-md mb-4">確認重置</button>
            <button onClick={() => { setShowForgotPrompt(false); setShowPasswordPrompt(true); setPasswordInput(""); setPasswordError(""); }} className="w-full py-2.5 text-base font-bold text-gray-500">返回登入</button>
          </div>
        </div>
      )}

      {showCopyModal && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl p-7 w-full max-w-[340px] shadow-2xl text-center animate-in zoom-in duration-200">
            <div className="w-20 h-20 bg-[#FDFBF7] text-[#A87B7B] rounded-full flex items-center justify-center mx-auto mb-5">{lineOfficialId ? <MessageCircle size={40} /> : <CalendarCheck size={40} />}</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">已複製預約資訊！</h3>
            <p className="text-base text-gray-600 mb-8 leading-relaxed">您的預約時段已經複製到剪貼簿囉！<br />{lineOfficialId ? "請點擊下方按鈕跳轉 LINE 貼上傳送。" : "請直接回到 LINE 聊天室「貼上」並送出。"}</p>
            <button onClick={lineOfficialId ? jumpToLine : () => setShowCopyModal(false)} className="w-full py-4 bg-[#A87B7B] text-white rounded-xl text-lg font-bold flex items-center justify-center gap-2">{lineOfficialId ? "前往 LINE 貼上傳送" : "我知道了，前往貼上"}</button>
          </div>
        </div>
      )}

      <div className="relative h-56 bg-gradient-to-br from-[#E2D1C3] to-[#CBAE9A] rounded-b-[2.5rem] p-7 flex flex-col justify-end overflow-hidden mt-[-10px]">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-20 rounded-full -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white opacity-10 rounded-full translate-y-1/4 -translate-x-1/4"></div>
        <div className="relative z-10 flex items-center gap-5">
          <div className="w-24 h-24 rounded-full border-[3px] border-[#F5E3BD] bg-white flex items-center justify-center shadow-[0_0_15px_rgba(197,154,92,0.4)] overflow-hidden">
            <div className="w-full h-full bg-[#FAF5F0] flex items-center justify-center text-[#C59A5C] text-4xl font-black font-beauty">{activeDesigner?.name.charAt(0)}</div>
          </div>
          <div className="text-white">
            <h1 className="text-3xl font-bold tracking-wide font-tc drop-shadow-md">設計師｜{activeDesigner?.name}</h1>
            <p className="text-base opacity-95 mt-2 flex items-center gap-1.5 font-medium"><MapPin size={16} /> {activeDesigner?.location}</p>
          </div>
        </div>
      </div>

      <div className="px-5 -mt-6 relative z-20">
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(220,38,38,0.08)] border border-red-50 overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-red-300 via-red-400 to-red-300"></div>
          <div className="p-5 sm:p-6 flex items-start gap-4">
            <div className="relative mt-1 flex-shrink-0"><span className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-25 duration-1000"></span><div className="bg-red-50 p-3 rounded-full text-red-500 relative z-10"><AlertCircle size={26} /></div></div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2.5">預約重要須知<span className="text-xs bg-red-100 text-red-600 px-2.5 py-1 rounded-md font-bold">必讀</span></h3>
              <p className="text-base text-gray-600 leading-relaxed mb-3">請直接 <span className="inline-block bg-red-50 text-red-600 font-bold px-2 py-0.5 rounded border border-red-100 mx-0.5 shadow-sm transform -translate-y-[1px]">回傳訊息</span> 告知想預約的時間。</p>
              <div className="text-sm text-gray-500 flex items-start gap-2 bg-gray-50 p-3 rounded-xl border border-gray-100"><span className="text-[#A87B7B] shrink-0 mt-0.5 text-base">💡</span><span className="leading-relaxed font-medium">請先選取時段空檔，再點擊最下方的按鈕回傳給客服喔！</span></div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 mt-5">
        <div className="flex items-center justify-between mb-5"><h2 className="text-xl font-bold text-gray-800 flex items-center gap-2"><CalendarCheck size={24} className="text-[#A87B7B]" />本月空檔查詢</h2><span className="text-sm text-gray-400 font-medium">點擊時段可複製</span></div>
        <div className="mb-6 bg-[#FDFBF7] p-5 rounded-2xl border border-[#F0E6D8] shadow-sm">
          <div className="flex items-center gap-2 mb-3.5"><Search size={18} className="text-[#A87B7B]" /><span className="text-base font-bold text-gray-700">快速搜尋日期與時段</span></div>
          <div className="flex gap-3">
            <select value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="flex-1 p-3 text-base border border-gray-200 rounded-xl outline-none focus:border-[#A87B7B] bg-white text-gray-700 font-medium">
              <option value="all">所有日期</option>
              {[...(activeDesigner?.schedules || [])].filter(s => !s.fullDate || s.fullDate >= getTodayString()).sort((a, b) => new Date(a.fullDate || '9999-12-31') - new Date(b.fullDate || '9999-12-31')).filter(s => s.times && s.times.length > 0).map(s => (<option key={s.fullDate} value={s.fullDate}>{s.date} (週{s.day})</option>))}
            </select>
            <select value={filterTime} onChange={(e) => setFilterTime(e.target.value)} className="flex-1 p-3 text-base border border-gray-200 rounded-xl outline-none focus:border-[#A87B7B] bg-white text-gray-700 font-medium">
              <option value="all">所有時段</option><option value="morning">早上 (12:00前)</option><option value="afternoon">下午 (12:00-18:00)</option><option value="evening">晚上 (18:00後)</option>
            </select>
          </div>
        </div>

        <div className="space-y-6">
          {(() => {
            const sortedCustomerSchedules = [...(activeDesigner?.schedules || [])].filter(s => !s.fullDate || s.fullDate >= getTodayString()).sort((a, b) => new Date(a.fullDate || '9999-12-31') - new Date(b.fullDate || '9999-12-31'));
            const displaySchedules = sortedCustomerSchedules.map(schedule => {
              if (filterDate !== "all" && schedule.fullDate !== filterDate) return null;
              const validTimes = (schedule.times || []).filter(tObj => {
                if (filterTime === "all") return true; const hour = parseInt(tObj.val.split(':')[0], 10);
                if (filterTime === "morning") return hour < 12; if (filterTime === "afternoon") return hour >= 12 && hour < 18; if (filterTime === "evening") return hour >= 18; return true;
              });
              if (validTimes.length === 0) return null; return { ...schedule, times: validTimes };
            }).filter(Boolean);

            if (displaySchedules.length === 0) return (<div className="text-center py-10 text-gray-400 text-base font-bold border-2 border-dashed border-gray-200 rounded-2xl">找不到符合您搜尋條件的時段，請嘗試其他日期！</div>);

            return displaySchedules.map((schedule) => {
              const isWeekend = schedule.day === "六" || schedule.day === "日"; const isToday = schedule.fullDate === getTodayString(); const times = schedule.times || [];
              
              // 幫前台也群組化，讓連續時段變成一塊！
              const groups = groupSlots(times);

              return (
                <div key={schedule.id} className={`flex gap-4 sm:gap-5 ${isToday ? 'bg-[#FDFBF7] p-3 -mx-3 rounded-2xl border border-[#F5E3BD] shadow-sm' : ''}`}>
                  <div className={`flex flex-col items-center pt-1.5 w-14 flex-shrink-0 relative ${isToday ? 'mt-1' : ''}`}>
                    {isToday && <span className="absolute -top-3 bg-[#C59A5C] text-white text-[10px] px-2 py-0.5 rounded-full font-bold tracking-widest">今日</span>}
                    <span className={`text-base font-bold ${isToday ? "text-[#C59A5C]" : "text-gray-800"}`}>{schedule.date}</span>
                    <span className={`text-sm mt-1 w-8 h-8 rounded-full flex items-center justify-center font-bold ${isToday ? "bg-[#C59A5C] text-white shadow-md" : isWeekend ? "bg-[#F5E3E3] text-[#A87B7B]" : "bg-gray-100 text-gray-500"}`}>{schedule.day}</span>
                  </div>
                  <div className={`flex-1 pb-5 ${isToday ? '' : 'border-b border-gray-100'}`}>
                    <div className="flex flex-col gap-2.5">
                      {groups.map((group, gIndex) => {
                        if (group.isFull) return (<button key={gIndex} disabled className="w-full text-left px-5 py-3 border border-gray-200 bg-gray-50 text-gray-400 text-base font-bold rounded-xl cursor-not-allowed line-through opacity-70">{group.startTime} - {group.endTime} (滿)</button>);
                        const displayStr = `${group.startTime} - ${group.endTime}`;
                        const copyStr = `預約專屬美麗時光 ✨\n🤍 姓名：\n📱 電話：\n🕰️ 時間：${schedule.date}(${schedule.day}) ${displayStr} (${activeDesigner.name})\n🎀 項目：`;
                        return (
                          <button key={gIndex} onClick={() => setSelectedTime(copyStr)} className={`w-full text-left px-5 py-3 border text-base font-bold rounded-xl transition shadow-sm ${selectedTime && selectedTime === copyStr ? "bg-[#A87B7B] text-white border-[#A87B7B]" : "bg-white border-gray-200 text-gray-700 hover:border-[#D4B8A8] hover:text-[#A87B7B]"}`}>{displayStr}</button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </div>
      <div className="fixed bottom-0 w-full max-w-md bg-white border-t border-gray-100 p-5 pb-8 shadow-[0_-15px_30px_rgba(0,0,0,0.06)] z-30">
        <button className="w-full bg-[#A87B7B] text-white py-4 rounded-xl text-lg font-bold flex items-center justify-center gap-2 hover:bg-[#8f6666] shadow-xl" onClick={handleCopyBooking}>{selectedTime ? "確認時間並回傳給客服" : "請先點選您想要的時段"}<ChevronRight size={20} /></button>
      </div>
    </div>
  );

  // --- 載入狀態防護 ---
  if (!isStyleLoaded || !isCloudLoaded) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", backgroundColor: "#f9fafb", fontFamily: "sans-serif" }}>
        <div style={{ width: "40px", height: "40px", border: "3px solid #F0E6D8", borderTop: "3px solid #A87B7B", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
        <p style={{ marginTop: "16px", color: "#A87B7B", fontWeight: "bold", fontSize: "16px", letterSpacing: "1px" }}>專屬頁面與雲端連線中...</p>
        <style dangerouslySetInnerHTML={{__html: `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}} />
      </div>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Noto+Sans+TC:wght@500;700&display=swap');
        .font-beauty { font-family: 'Playfair Display', serif; }
        .font-tc { font-family: 'Noto Sans TC', sans-serif; }
        .gold-text { background: linear-gradient(to right, #C59A5C 0%, #F5E3BD 50%, #C59A5C 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
      {isAdminMode ? renderAdminView() : (
        <div className="min-h-screen bg-gray-200 font-sans flex justify-center">
          {renderCustomerView()}
        </div>
      )}
    </>
  );
}
