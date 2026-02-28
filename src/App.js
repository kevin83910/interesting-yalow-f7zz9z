import React, { useState, useEffect } from "react";

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
let app,
  auth,
  db,
  appId = "default-app-id";
try {
  if (typeof __firebase_config !== "undefined") {
    const firebaseConfig = JSON.parse(__firebase_config);
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    if (typeof __app_id !== "undefined") {
      appId = __app_id;
    }
  }
} catch (e) {
  console.error("雲端資料庫初始化失敗，將切換為單機模式", e);
}

// ==========================================
// 內建圖示庫 (不再依賴外部下載，解決卡頓問題)
// ==========================================
const Icons = {
  MapPin: ({ size = 24, className = "" }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  AlertCircle: ({ size = 24, className = "" }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  CalendarCheck: ({ size = 24, className = "" }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <path d="m9 16 2 2 4-4" />
    </svg>
  ),
  ChevronRight: ({ size = 24, className = "" }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  Settings: ({ size = 24, className = "" }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </svg>
  ),
  Save: ({ size = 24, className = "" }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  ),
  Plus: ({ size = 24, className = "" }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Trash2: ({ size = 24, className = "" }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  ),
  Eye: ({ size = 24, className = "" }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Lock: ({ size = 24, className = "" }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  X: ({ size = 24, className = "" }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Key: ({ size = 24, className = "" }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4" />
      <path d="m21 2-9.6 9.6" />
      <circle cx="7.5" cy="15.5" r="5.5" />
    </svg>
  ),
  Clock: ({ size = 24, className = "" }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  MessageCircle: ({ size = 24, className = "" }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" />
    </svg>
  ),
  Cloud: ({ size = 24, className = "" }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
    </svg>
  ),
};

const {
  MapPin,
  AlertCircle,
  CalendarCheck,
  ChevronRight,
  Settings,
  Save,
  Plus,
  Trash2,
  Eye,
  Lock,
  X,
  Key,
  Clock,
  MessageCircle,
  Cloud,
} = Icons;

// --- 初始預設資料 ---
const initialDesigners = [
  {
    id: "d1",
    name: "魚魚",
    location: "北車店 15樓",
    schedules: [
      {
        id: 1,
        fullDate: "2026-03-12",
        date: "3/12",
        day: "四",
        times: [
          { val: "11:00", isFull: false },
          { val: "13:00", isFull: true },
          { val: "15:00", isFull: false },
          { val: "17:00", isFull: false },
        ],
      },
      {
        id: 2,
        fullDate: "2026-03-13",
        date: "3/13",
        day: "五",
        times: [
          { val: "13:00", isFull: false },
          { val: "15:00", isFull: true },
          { val: "19:00", isFull: false },
        ],
      },
      {
        id: 3,
        fullDate: "2026-03-14",
        date: "3/14",
        day: "六",
        times: [
          { val: "11:00", isFull: false },
          { val: "15:00", isFull: false },
          { val: "17:00", isFull: false },
          { val: "19:00", isFull: false },
        ],
      },
    ],
  },
];

// ==========================================
// 子元件：單日班表編輯器
// ==========================================
const ScheduleItemEditor = ({ schedule, onRemove, onUpdate, onDateChange }) => {
  const [newTime, setNewTime] = useState("");

  const handleAddTime = () => {
    if (!newTime) return;
    if (schedule.times.some((t) => t.val === newTime)) return;
    const updatedTimes = [
      ...schedule.times,
      { val: newTime, isFull: false },
    ].sort((a, b) => a.val.localeCompare(b.val));
    onUpdate(schedule.id, "times", updatedTimes);
    setNewTime("");
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 relative group mb-3">
      <button
        onClick={() => onRemove(schedule.id)}
        className="absolute -top-2 -right-2 bg-red-100 text-red-500 p-1.5 rounded-full hover:bg-red-500 hover:text-white transition shadow-sm"
        title="刪除此日期"
      >
        <Trash2 size={14} />
      </button>

      <div className="flex gap-3 mb-3">
        <div className="flex-1">
          <label className="block text-[10px] text-gray-400 mb-1">
            選擇開放日期
          </label>
          <input
            type="date"
            value={schedule.fullDate || ""}
            onChange={(e) => onDateChange(schedule.id, e.target.value)}
            className="w-full p-2 border rounded-lg text-sm font-bold text-gray-700 focus:border-[#A87B7B] outline-none cursor-pointer bg-gray-50 hover:bg-white transition"
          />
        </div>
        <div className="w-16 bg-gray-50 border border-gray-100 rounded-lg flex flex-col items-center justify-center">
          <span className="text-sm font-bold text-gray-800">
            {schedule.date || "-"}
          </span>
          <span className="text-[10px] text-gray-500">
            {schedule.day ? "週" + schedule.day : "-"}
          </span>
        </div>
      </div>

      <div>
        <label className="block text-[10px] text-gray-400 mb-1">新增時段</label>
        <div className="flex gap-2 mb-3">
          <input
            type="time"
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
            className="flex-1 p-2 border rounded-lg text-sm bg-gray-50 focus:bg-white focus:border-[#A87B7B] outline-none"
          />
          <button
            onClick={handleAddTime}
            className="bg-[#A87B7B] text-white px-3 py-2 rounded-lg text-sm font-bold hover:bg-[#8f6666] transition shadow-sm"
          >
            加入
          </button>
        </div>

        <p className="text-[10px] text-[#A87B7B] mb-2 font-bold">
          💡 點擊下方時段標籤，可切換「已滿 / 預約」狀態
        </p>
        <div className="flex flex-wrap gap-2">
          {schedule.times.map((t, i) => (
            <div
              key={i}
              className={`flex items-center gap-1 border px-2.5 py-1 rounded-md shadow-sm transition-colors ${
                t.isFull
                  ? "bg-gray-100 border-gray-300 text-gray-500"
                  : "bg-[#FDFBF7] border-[#F0E6D8] text-[#A87B7B]"
              }`}
            >
              <Clock
                size={12}
                className={t.isFull ? "opacity-50" : "opacity-70"}
              />
              <button
                onClick={() => {
                  const updatedTimes = schedule.times.map((tm) =>
                    tm.val === t.val ? { ...tm, isFull: !tm.isFull } : tm
                  );
                  onUpdate(schedule.id, "times", updatedTimes);
                }}
                className={`text-xs font-bold hover:underline ${
                  t.isFull ? "line-through opacity-70" : ""
                }`}
                title="點擊切換狀態"
              >
                {t.val} {t.isFull && "(已滿)"}
              </button>
              <button
                onClick={() => {
                  const updatedTimes = schedule.times.filter(
                    (tm) => tm.val !== t.val
                  );
                  onUpdate(schedule.id, "times", updatedTimes);
                }}
                className={`ml-1 rounded-full p-0.5 transition ${
                  t.isFull
                    ? "hover:text-red-500 hover:bg-red-100"
                    : "text-[#A87B7B] hover:text-red-500 hover:bg-red-50"
                }`}
              >
                <X size={12} />
              </button>
            </div>
          ))}
          {schedule.times.length === 0 && (
            <span className="text-xs text-gray-400 py-1">尚未加入任何時段</span>
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 主程式 App
// ==========================================
export default function App() {
  const [isStyleLoaded, setIsStyleLoaded] = useState(false);
  const [isCloudLoaded, setIsCloudLoaded] = useState(false);
  const [user, setUser] = useState(null);

  const [isAdminMode, setIsAdminMode] = useState(false);
  const [selectedTime, setSelectedTime] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  const [adminPassword, setAdminPassword] = useState("admin");
  const [lineOfficialId, setLineOfficialId] = useState("");

  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [showForgotPrompt, setShowForgotPrompt] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [newPasswordInput, setNewPasswordInput] = useState("");

  const [designerToDelete, setDesignerToDelete] = useState(null);
  const [showCopyModal, setShowCopyModal] = useState(false);

  const [designers, setDesigners] = useState(initialDesigners);
  const [activeDesignerId, setActiveDesignerId] = useState(
    initialDesigners[0].id
  );
  const activeDesigner =
    designers.find((d) => d.id === activeDesignerId) || designers[0];

  // --- 樣式載入處理 ---
  useEffect(() => {
    if (typeof window !== "undefined") {
      const checkTailwind = setInterval(() => {
        if (window.tailwind) {
          setIsStyleLoaded(true);
          clearInterval(checkTailwind);
        }
      }, 50);

      if (!document.getElementById("tailwind-script")) {
        const script = document.createElement("script");
        script.id = "tailwind-script";
        script.src = "https://cdn.tailwindcss.com";
        document.head.appendChild(script);
      }

      const fallback = setTimeout(() => {
        setIsStyleLoaded(true);
        clearInterval(checkTailwind);
      }, 1500);
      return () => {
        clearInterval(checkTailwind);
        clearTimeout(fallback);
      };
    }
  }, []);

  // --- 1. 雲端身分驗證 ---
  useEffect(() => {
    if (!auth) {
      setIsCloudLoaded(true); // 若無雲端環境，直接進入單機模式
      return;
    }
    const initAuth = async () => {
      try {
        if (
          typeof __initial_auth_token !== "undefined" &&
          __initial_auth_token
        ) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (e) {
        console.error("雲端登入失敗:", e);
        setIsCloudLoaded(true);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  // --- 2. 雲端資料即時同步 (監聽) ---
  useEffect(() => {
    if (!user || !db) return;
    const docRef = doc(
      db,
      "artifacts",
      appId,
      "public",
      "data",
      "store_data",
      "main_config"
    );

    const unsubscribe = onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          // 為了避免後台編輯到一半被別人的更新打斷，當處於「後台模式」時暫停接收雲端覆蓋
          if (!isAdminMode) {
            if (data.designers) setDesigners(data.designers);
            if (data.adminPassword) setAdminPassword(data.adminPassword);
            if (data.lineOfficialId !== undefined)
              setLineOfficialId(data.lineOfficialId);
          }
        } else {
          // 首次初始化雲端文件
          if (!isAdminMode) {
            setDoc(docRef, {
              designers: initialDesigners,
              adminPassword: "admin",
              lineOfficialId: "",
            }).catch(console.error);
          }
        }
        setIsCloudLoaded(true);
      },
      (err) => {
        console.error("雲端讀取失敗:", err);
        setIsCloudLoaded(true);
      }
    );

    return () => unsubscribe();
  }, [user, isAdminMode]);

  // --- 3. 雲端資料自動備份 (僅限後台) ---
  useEffect(() => {
    if (isAdminMode && isCloudLoaded && user && db) {
      const timer = setTimeout(() => {
        const docRef = doc(
          db,
          "artifacts",
          appId,
          "public",
          "data",
          "store_data",
          "main_config"
        );
        setDoc(docRef, {
          designers: designers,
          adminPassword: adminPassword,
          lineOfficialId: lineOfficialId,
        }).catch(console.error);
      }, 1500); // 停止操作 1.5 秒後自動存檔
      return () => clearTimeout(timer);
    }
  }, [
    designers,
    adminPassword,
    lineOfficialId,
    isAdminMode,
    isCloudLoaded,
    user,
  ]);

  // --- 手動儲存到雲端 ---
  const handleExplicitSave = async () => {
    if (user && db) {
      try {
        const docRef = doc(
          db,
          "artifacts",
          appId,
          "public",
          "data",
          "store_data",
          "main_config"
        );
        await setDoc(docRef, { designers, adminPassword, lineOfficialId });
      } catch (e) {
        console.error("儲存失敗:", e);
      }
    }
    setIsAdminMode(false);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleAdminLogin = () => {
    if (passwordInput === adminPassword) {
      setIsAdminMode(true);
      setShowPasswordPrompt(false);
      setPasswordInput("");
      setPasswordError("");
    } else {
      setPasswordError("密碼錯誤，請重新輸入！");
      setPasswordInput("");
    }
  };

  const handleResetPassword = () => {
    if (passwordInput === "8888") {
      setAdminPassword("admin");
      setShowForgotPrompt(false);
      setShowPasswordPrompt(true);
      setPasswordInput("");
      setPasswordError("");
      showToast("密碼已成功重置為：admin");
    } else {
      setPasswordError("安全驗證碼錯誤！");
      setPasswordInput("");
    }
  };

  const handleChangePassword = () => {
    if (!newPasswordInput) return showToast("請輸入新密碼！");
    if (newPasswordInput.length < 4) return showToast("密碼長度至少需 4 碼！");
    setAdminPassword(newPasswordInput);
    setNewPasswordInput("");
    showToast("密碼修改成功！下次請使用新密碼登入。");
  };

  const updateActiveDesigner = (field, value) => {
    setDesigners(
      designers.map((d) =>
        d.id === activeDesignerId ? { ...d, [field]: value } : d
      )
    );
  };

  const handleAddDesigner = () => {
    const newId = "d" + Date.now();
    setDesigners([
      ...designers,
      { id: newId, name: "新設計師", location: "請輸入地點", schedules: [] },
    ]);
    setActiveDesignerId(newId);
  };

  const handleRemoveDesignerClick = (id) => {
    if (designers.length <= 1) {
      showToast("至少需保留一位設計師！");
      return;
    }
    setDesignerToDelete(id);
  };

  const confirmDeleteDesigner = () => {
    const filtered = designers.filter((d) => d.id !== designerToDelete);
    setDesigners(filtered);
    if (activeDesignerId === designerToDelete)
      setActiveDesignerId(filtered[0]?.id || null);
    setDesignerToDelete(null);
    showToast("已成功刪除設計師");
  };

  const handleAddSchedule = () => {
    const schedules = activeDesigner.schedules;
    const newId =
      schedules.length > 0 ? Math.max(...schedules.map((s) => s.id)) + 1 : 1;
    const newSchedules = [
      ...schedules,
      { id: newId, fullDate: "", date: "", day: "", times: [] },
    ];
    updateActiveDesigner("schedules", newSchedules);
  };

  const handleRemoveSchedule = (id) => {
    const newSchedules = activeDesigner.schedules.filter((s) => s.id !== id);
    updateActiveDesigner("schedules", newSchedules);
  };

  const handleUpdateSchedule = (id, field, value) => {
    const newSchedules = activeDesigner.schedules.map((s) =>
      s.id === id ? { ...s, [field]: value } : s
    );
    updateActiveDesigner("schedules", newSchedules);
  };

  const handleDateChange = (id, dateString) => {
    if (!dateString) {
      const newSchedules = activeDesigner.schedules.map((s) =>
        s.id === id ? { ...s, fullDate: "", date: "", day: "" } : s
      );
      updateActiveDesigner("schedules", newSchedules);
      return;
    }
    const d = new Date(dateString);
    const month = d.getMonth() + 1;
    const date = d.getDate();
    const dayIndex = d.getDay();
    const daysMap = ["日", "一", "二", "三", "四", "五", "六"];
    const newSchedules = activeDesigner.schedules.map((s) =>
      s.id === id
        ? {
            ...s,
            fullDate: dateString,
            date: `${month}/${date}`,
            day: daysMap[dayIndex],
          }
        : s
    );
    updateActiveDesigner("schedules", newSchedules);
  };

  const handleCopyBooking = () => {
    if (!selectedTime) {
      showToast("請先點選您想要的時段喔！");
      return;
    }
    const textArea = document.createElement("textarea");
    textArea.value = selectedTime;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand("copy");
      setShowCopyModal(true);
    } catch (err) {
      console.error("複製失敗", err);
      showToast("複製失敗，請手動輸入");
    }
    document.body.removeChild(textArea);
  };

  const jumpToLine = () => {
    setShowCopyModal(false);
    if (lineOfficialId) {
      const formattedLineId = lineOfficialId.startsWith("@")
        ? lineOfficialId
        : `@${lineOfficialId}`;
      const lineUrl = `https://line.me/R/oaMessage/${formattedLineId}/?${encodeURIComponent(
        selectedTime
      )}`;
      window.open(lineUrl, "_blank");
    }
  };

  // --- 載入畫面 ---
  if (!isStyleLoaded || !isCloudLoaded) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          backgroundColor: "#f9fafb",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            border: "3px solid #F0E6D8",
            borderTop: "3px solid #A87B7B",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        ></div>
        <p
          style={{
            marginTop: "16px",
            color: "#A87B7B",
            fontWeight: "bold",
            fontSize: "14px",
            letterSpacing: "1px",
          }}
        >
          專屬頁面與雲端連線中...
        </p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const renderToast = () => {
    if (!toastMessage) return null;
    return (
      <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[200] bg-gray-800 text-white px-6 py-3 rounded-full shadow-2xl text-sm font-bold opacity-90 transition-opacity duration-300 whitespace-nowrap">
        {toastMessage}
      </div>
    );
  };

  // ==========================================
  // 視圖 1：後台編輯模式
  // ==========================================
  const renderAdminView = () => (
    <div className="w-full max-w-md bg-gray-50 min-h-screen shadow-2xl relative pb-24 flex flex-col mx-auto border-x border-gray-200">
      {renderToast()}

      {designerToDelete && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-[320px] shadow-2xl animate-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              確定刪除設計師？
            </h3>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              此動作無法復原，與該設計師相關的所有班表與設定都會被永久刪除。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDesignerToDelete(null)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition"
              >
                取消
              </button>
              <button
                onClick={confirmDeleteDesigner}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition shadow-sm shadow-red-200"
              >
                確定刪除
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-900 text-white p-4 flex justify-between items-center sticky top-0 z-50 shadow-md">
        <h1 className="font-bold flex items-center gap-2">
          <Settings size={18} /> 班表後台管理
          <span className="bg-green-500/20 text-green-400 text-[10px] px-2 py-0.5 rounded-full border border-green-500/30 flex items-center gap-1 ml-2">
            <Cloud size={10} /> 雲端連線中
          </span>
        </h1>
        <button
          onClick={handleExplicitSave}
          className="bg-white text-gray-900 text-sm px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 hover:bg-gray-200 transition"
        >
          <Eye size={16} /> 預覽畫面
        </button>
      </div>

      <div className="bg-white px-4 py-3 flex items-center gap-3 overflow-x-auto border-b border-gray-200 shadow-sm sticky top-[60px] z-40">
        {designers.map((d) => (
          <button
            key={d.id}
            onClick={() => setActiveDesignerId(d.id)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
              activeDesignerId === d.id
                ? "bg-gray-800 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {d.name}
          </button>
        ))}
        <button
          onClick={handleAddDesigner}
          className="flex-shrink-0 flex items-center gap-1 text-[#A87B7B] text-sm font-bold px-3 py-1.5 bg-[#F5E3E3] rounded-full hover:bg-[#F0E6D8] transition"
        >
          <Plus size={16} /> 新增
        </button>
      </div>

      <div className="p-5 space-y-6 flex-1 overflow-y-auto">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <h2 className="font-bold text-gray-800 mb-4 border-b pb-2">
            基本資料設定
          </h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                設計師名稱
              </label>
              <input
                type="text"
                value={activeDesigner?.name || ""}
                onChange={(e) => updateActiveDesigner("name", e.target.value)}
                className="w-full p-2 border rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#A87B7B] outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                服務地點
              </label>
              <input
                type="text"
                value={activeDesigner?.location || ""}
                onChange={(e) =>
                  updateActiveDesigner("location", e.target.value)
                }
                className="w-full p-2 border rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#A87B7B] outline-none transition"
              />
            </div>
            <button
              onClick={() => handleRemoveDesignerClick(activeDesigner.id)}
              className="w-full mt-4 bg-red-50 text-red-500 text-sm font-bold py-2.5 rounded-lg flex items-center justify-center gap-1 hover:bg-red-500 hover:text-white transition"
            >
              <Trash2 size={16} /> 刪除此設計師
            </button>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-gray-800">可預約時段設定</h2>
            <button
              onClick={handleAddSchedule}
              className="text-[#A87B7B] text-sm font-bold flex items-center gap-1 bg-[#F5E3E3] px-3 py-1.5 rounded-lg hover:bg-[#F0E6D8] transition"
            >
              <Plus size={16} /> 新增日期
            </button>
          </div>
          <div>
            {activeDesigner?.schedules.map((schedule) => (
              <ScheduleItemEditor
                key={schedule.id}
                schedule={schedule}
                onRemove={handleRemoveSchedule}
                onUpdate={handleUpdateSchedule}
                onDateChange={handleDateChange}
              />
            ))}
            {(!activeDesigner?.schedules ||
              activeDesigner.schedules.length === 0) && (
              <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-xl">
                目前沒有任何開放時段，請點擊上方新增。
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mt-8">
          <h2 className="font-bold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
            <Key size={16} className="text-[#A87B7B]" /> 全域系統設定
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1 font-bold text-[#A87B7B]">
                一鍵跳轉 LINE 設定
              </label>
              <input
                type="text"
                placeholder="輸入官方帳號 ID (如：@lashbeauty)"
                value={lineOfficialId}
                onChange={(e) => setLineOfficialId(e.target.value)}
                className="w-full p-2 border rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#A87B7B] outline-none transition"
              />
              <p className="text-[10px] text-gray-400 mt-1">
                設定後，顧客選好時間將出現「跳轉 LINE」按鈕自動帶入文字。
              </p>
            </div>

            <div className="pt-2 border-t border-gray-100">
              <label className="block text-xs text-gray-500 mb-1">
                變更管理密碼
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  placeholder="輸入新密碼"
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  className="w-full p-2 border rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#A87B7B] outline-none transition"
                />
                <button
                  onClick={handleChangePassword}
                  className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-black transition flex-shrink-0"
                >
                  更新
                </button>
              </div>
              <p className="text-[10px] text-gray-400 mt-2">
                * 密碼已啟用雲端加密儲存，變更後將永久生效，請妥善保管。
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 bg-white border-t border-gray-200 sticky bottom-0 z-50">
        <button
          onClick={handleExplicitSave}
          className="w-full bg-[#A87B7B] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#8f6666] transition shadow-lg shadow-[#A87B7B]/20"
        >
          <Save size={18} /> 儲存並查看顧客預覽
        </button>
      </div>
    </div>
  );

  // ==========================================
  // 視圖 2：顧客預約模式
  // ==========================================
  const renderCustomerView = () => (
    <div className="w-full max-w-md bg-white min-h-screen shadow-2xl relative pb-24 mx-auto border-x border-gray-200">
      {renderToast()}

      <div className="bg-white px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex gap-2 overflow-x-auto pr-4 no-scrollbar">
          {designers.map((d) => (
            <button
              key={d.id}
              onClick={() => {
                setActiveDesignerId(d.id);
                setSelectedTime(null);
              }}
              className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-bold transition-all ${
                activeDesignerId === d.id
                  ? "bg-[#A87B7B] text-white shadow-md"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-100"
              }`}
            >
              {d.name}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowPasswordPrompt(true)}
          className="flex-shrink-0 bg-gray-50 text-gray-400 p-2 rounded-full hover:bg-gray-200 hover:text-gray-600 transition"
          title="後台管理"
        >
          <Settings size={18} />
        </button>
      </div>

      {showPasswordPrompt && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-[320px] shadow-2xl relative">
            <button
              onClick={() => {
                setShowPasswordPrompt(false);
                setPasswordInput("");
                setPasswordError("");
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-800"
            >
              <X size={20} />
            </button>
            <div className="flex flex-col items-center mb-4 mt-2">
              <div className="bg-[#F5E3E3] p-3 rounded-full text-[#A87B7B] mb-3">
                <Lock size={24} />
              </div>
              <h2 className="text-lg font-bold text-gray-800">
                請輸入後台密碼
              </h2>
            </div>

            <input
              type="password"
              placeholder="請輸入密碼"
              className={`w-full p-3 border rounded-xl text-center mb-2 outline-none transition focus:ring-2 ${
                passwordError
                  ? "border-red-400 focus:ring-red-200"
                  : "border-gray-200 focus:ring-[#A87B7B]"
              }`}
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()}
              autoFocus
            />

            <div className="h-6 flex justify-center items-start mb-2">
              {passwordError && (
                <span className="text-xs text-red-500 font-bold">
                  {passwordError}
                </span>
              )}
            </div>

            <button
              onClick={handleAdminLogin}
              className="w-full bg-[#A87B7B] text-white py-3 rounded-xl font-bold hover:bg-[#8f6666] transition shadow-md mb-4"
            >
              登入管理後台
            </button>

            <div className="text-center">
              <button
                onClick={() => {
                  setShowPasswordPrompt(false);
                  setShowForgotPrompt(true);
                  setPasswordInput("");
                  setPasswordError("");
                }}
                className="text-xs text-gray-400 hover:text-[#A87B7B] underline underline-offset-2 transition"
              >
                忘記密碼？
              </button>
            </div>
          </div>
        </div>
      )}

      {showForgotPrompt && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-[320px] shadow-2xl relative">
            <button
              onClick={() => {
                setShowForgotPrompt(false);
                setPasswordInput("");
                setPasswordError("");
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-800"
            >
              <X size={20} />
            </button>
            <div className="flex flex-col items-center mb-4 mt-2">
              <div className="bg-gray-100 p-3 rounded-full text-gray-600 mb-3">
                <Key size={24} />
              </div>
              <h2 className="text-lg font-bold text-gray-800">重置密碼</h2>
            </div>

            <input
              type="text"
              placeholder="請輸入安全碼"
              className={`w-full p-3 border rounded-xl text-center mb-2 outline-none transition focus:ring-2 ${
                passwordError
                  ? "border-red-400 focus:ring-red-200"
                  : "border-gray-200 focus:ring-gray-400"
              }`}
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleResetPassword()}
              autoFocus
            />
            <div className="h-6 flex justify-center items-start mb-2">
              {passwordError && (
                <span className="text-xs text-red-500 font-bold">
                  {passwordError}
                </span>
              )}
            </div>
            <button
              onClick={handleResetPassword}
              className="w-full bg-gray-800 text-white py-3 rounded-xl font-bold hover:bg-black transition shadow-md mb-3"
            >
              確認重置
            </button>
            <button
              onClick={() => {
                setShowForgotPrompt(false);
                setShowPasswordPrompt(true);
                setPasswordInput("");
                setPasswordError("");
              }}
              className="w-full py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-xl transition"
            >
              返回登入
            </button>
          </div>
        </div>
      )}

      {showCopyModal && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-[320px] shadow-2xl text-center animate-in zoom-in duration-200">
            <div className="w-16 h-16 bg-[#FDFBF7] text-[#A87B7B] rounded-full flex items-center justify-center mx-auto mb-4">
              {lineOfficialId ? (
                <MessageCircle size={32} />
              ) : (
                <CalendarCheck size={32} />
              )}
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              已複製預約資訊！
            </h3>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              您的預約時段已經複製到剪貼簿囉！
              <br />
              {lineOfficialId
                ? "請點擊下方按鈕，系統將為您切換至 LINE 聊天室，只要「貼上」即可完成申請喔。"
                : "請直接回到 LINE 聊天室「貼上」並送出，即可完成申請。"}
            </p>
            <button
              onClick={
                lineOfficialId ? jumpToLine : () => setShowCopyModal(false)
              }
              className="w-full py-3 bg-[#A87B7B] text-white rounded-xl font-bold hover:bg-[#8f6666] transition shadow-sm flex items-center justify-center gap-2"
            >
              {lineOfficialId ? "前往 LINE 貼上傳送" : "我知道了，前往貼上"}
            </button>
          </div>
        </div>
      )}

      <div className="relative h-48 bg-gradient-to-br from-[#E8D3C8] to-[#D4B8A8] rounded-b-[2.5rem] p-6 flex flex-col justify-end overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full translate-y-1/4 -translate-x-1/4"></div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-20 h-20 rounded-full border-4 border-white bg-white flex items-center justify-center shadow-lg overflow-hidden">
            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-[#A87B7B] text-xl font-bold font-serif">
              {activeDesigner?.name.charAt(0)}
            </div>
          </div>
          <div className="text-white">
            <h1 className="text-2xl font-bold tracking-wide">
              設計師｜{activeDesigner?.name}
            </h1>
            <p className="text-sm opacity-90 mt-1 flex items-center gap-1">
              <MapPin size={14} /> {activeDesigner?.location}
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 -mt-6 relative z-20">
        <div className="bg-white rounded-xl shadow-lg border border-red-100 p-4">
          <div className="flex items-start gap-3">
            <div className="bg-red-50 p-2 rounded-full text-red-500 mt-0.5">
              <AlertCircle size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800 mb-1">
                預約重要須知
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                請直接{" "}
                <span className="text-red-500 font-bold">截圖或回傳訊息</span>{" "}
                告知您想預約的時間。
                <br />❌ 僅在此處點擊無法直接完成預約喔！
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 mt-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <CalendarCheck size={20} className="text-[#A87B7B]" />
            本月空檔查詢
          </h2>
          <span className="text-xs text-gray-400">點擊時段可複製</span>
        </div>

        <div className="space-y-4">
          {activeDesigner?.schedules.map((schedule) => {
            const isWeekend = schedule.day === "六" || schedule.day === "日";
            const times = schedule.times || [];
            if (times.length === 0) return null;

            return (
              <div key={schedule.id} className="flex gap-4">
                <div className="flex flex-col items-center pt-1 w-12 flex-shrink-0">
                  <span className="text-sm font-bold text-gray-800">
                    {schedule.date}
                  </span>
                  <span
                    className={`text-xs mt-0.5 w-6 h-6 rounded-full flex items-center justify-center ${
                      isWeekend
                        ? "bg-[#F5E3E3] text-[#A87B7B] font-bold"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {schedule.day}
                  </span>
                </div>

                <div className="flex-1 border-b border-gray-100 pb-4">
                  <div className="flex flex-wrap gap-2">
                    {times.map((tObj, tIndex) => {
                      if (tObj.isFull) {
                        return (
                          <button
                            key={tIndex}
                            disabled
                            className="px-3 py-1.5 border border-gray-200 bg-gray-50 text-gray-400 text-sm rounded-lg cursor-not-allowed line-through opacity-70"
                          >
                            {tObj.val} (已滿)
                          </button>
                        );
                      }
                      return (
                        <button
                          key={tIndex}
                          onClick={() =>
                            setSelectedTime(
                              `預約專屬美麗時光 ✨\n🤍 姓名：\n📱 電話：\n🕰️ 時間：${schedule.date}(${schedule.day}) ${tObj.val} (${activeDesigner.name})\n🎀 項目：`
                            )
                          }
                          className={`px-3 py-1.5 border text-sm rounded-lg transition active:scale-95 shadow-sm
                            ${
                              selectedTime &&
                              selectedTime.includes(
                                `${schedule.date}(${schedule.day}) ${tObj.val}`
                              )
                                ? "bg-[#A87B7B] text-white border-[#A87B7B]"
                                : "bg-white border-gray-200 text-gray-700 hover:border-[#D4B8A8] hover:text-[#A87B7B] hover:bg-[#FDFBF7]"
                            }
                          `}
                        >
                          {tObj.val}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
          {(!activeDesigner?.schedules ||
            activeDesigner.schedules.length === 0) && (
            <div className="text-center py-8 text-gray-400 text-sm">
              設計師尚未開放預約時段
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 w-full max-w-md bg-white border-t border-gray-100 p-4 pb-8 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-30">
        <button
          className="w-full bg-[#A87B7B] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#8f6666] transition shadow-lg shadow-[#A87B7B]/30"
          onClick={handleCopyBooking}
        >
          {selectedTime ? "確認時間並回傳給客服" : "請先點選您想要的時段"}
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-200 font-sans flex justify-center">
      {isAdminMode ? renderAdminView() : renderCustomerView()}
    </div>
  );
}
