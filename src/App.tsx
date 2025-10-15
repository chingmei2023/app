import React, { useState, useEffect } from "react";

interface RecordData {
  [key: string]: any;
}

export default function CancerCareTrackerTW() {
  const times = ["早晨 (6–11)", "中午 (11–16)", "傍晚 (16–21)", "夜間 (21–6)"];
  const [todayData, setTodayData] = useState<RecordData>({});
  const [history, setHistory] = useState<RecordData[]>([]);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [currentTimeLabel, setCurrentTimeLabel] = useState<string>("");

  const defaultSections = {
    生命徵象: { 體溫: "", 血壓: "", 脈搏: "", 疼痛: "無" },
    飲食與液體: { 食物: "", 液體攝取量: "", 食慾: "一般" },
    藥物與廁所: { 藥物紀錄: "", 廁所: "無" },
    其他觀察: { 心情: "穩定", 皮膚: "", 睡眠: "一般", 備註: "" },
  };

  // ✅ Always use Taiwan time zone
  const getTaiwanDate = () =>
    new Date().toLocaleDateString("zh-TW", { timeZone: "Asia/Taipei" });

  const getTaiwanHour = () =>
    new Date().toLocaleString("zh-TW", {
      timeZone: "Asia/Taipei",
      hour: "2-digit",
      hour12: false,
    });

  // 🕒 Determine which section should be highlighted
  const determineCurrentTimeZone = () => {
    const hour = parseInt(getTaiwanHour());
    if (hour >= 6 && hour < 11) return "早晨 (6–11)";
    if (hour >= 11 && hour < 16) return "中午 (11–16)";
    if (hour >= 16 && hour < 21) return "傍晚 (16–21)";
    return "夜間 (21–6)";
  };

  useEffect(() => {
    const date = getTaiwanDate();
    const saved = localStorage.getItem("careTrackerRecords");
    if (saved) {
      const parsed = JSON.parse(saved);
      setHistory(parsed);
      const todayRecord = parsed.find((r: any) => r.date === date);
      if (todayRecord) setTodayData(todayRecord.data);
      else
        setTodayData(Object.fromEntries(times.map((t) => [t, defaultSections])));
    } else {
      setTodayData(Object.fromEntries(times.map((t) => [t, defaultSections])));
    }

    // ⏰ Auto update current section every minute
    const updateTime = () => setCurrentTimeLabel(determineCurrentTimeZone());
    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  const saveData = (newData: RecordData) => {
    const date = getTaiwanDate();
    const updatedRecord = { date, data: newData };
    let updatedHistory = history.filter((r: any) => r.date !== date);
    updatedHistory.push(updatedRecord);
    setHistory(updatedHistory);
    localStorage.setItem("careTrackerRecords", JSON.stringify(updatedHistory));
  };

  const handleChange = (
    time: string,
    section: string,
    field: string,
    value: string
  ) => {
    const newData = {
      ...todayData,
      [time]: {
        ...todayData[time],
        [section]: { ...todayData[time][section], [field]: value },
      },
    };
    setTodayData(newData);
    saveData(newData);
  };

  const baseInputStyle = {
    width: "100%",
    padding: "6px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    transition: "background-color 0.2s ease",
  };

  const getInputStyle = (key: string) => ({
    ...baseInputStyle,
    backgroundColor: focusedField === key ? "#dcfce7" : "white",
  });

  return (
    <div style={{ padding: "20px", fontFamily: "Noto Sans TC, sans-serif" }}>
      <h1 style={{ textAlign: "center", color: "#166534" }}>每日照護追蹤表</h1>
      <p style={{ textAlign: "center", color: "#555" }}>
        自動儲存，每日自動切換（依台灣時間）
        <br />
        目前時段：<strong style={{ color: "#166534" }}>{currentTimeLabel}</strong>
      </p>

      {times.map((time) => {
        const isActive = time === currentTimeLabel;
        return (
          <div
            key={time}
            style={{
              border: `2px solid ${isActive ? "#4ade80" : "#d1d5db"}`,
              borderRadius: "12px",
              padding: "16px",
              marginTop: "20px",
              backgroundColor: isActive ? "#f0fdf4" : "#f9fafb",
              boxShadow: isActive
                ? "0 0 10px rgba(74, 222, 128, 0.4)"
                : "none",
              transition: "all 0.3s ease",
            }}
          >
            <h2
              style={{
                color: isActive ? "#15803d" : "#6b7280",
                marginBottom: "10px",
              }}
            >
              {time}
              {isActive && "（目前時段）"}
            </h2>

            {/* 生命徵象 */}
            <h3>生命徵象</h3>
            <div style={{ marginBottom: "8px" }}>
              <label>體溫：</label>
              <input
                type="number"
                step="any"
                inputMode="decimal"
                value={todayData[time]?.["生命徵象"]?.["體溫"] || ""}
                onFocus={() => setFocusedField(`${time}-體溫`)}
                onBlur={() => setFocusedField(null)}
                onChange={(e) =>
                  handleChange(time, "生命徵象", "體溫", e.target.value)
                }
                style={getInputStyle(`${time}-體溫`)}
              />
            </div>
            <div style={{ marginBottom: "8px" }}>
              <label>血壓：</label>
              <input
                type="text"
                value={todayData[time]?.["生命徵象"]?.["血壓"] || ""}
                onFocus={() => setFocusedField(`${time}-血壓`)}
                onBlur={() => setFocusedField(null)}
                onChange={(e) =>
                  handleChange(time, "生命徵象", "血壓", e.target.value)
                }
                style={getInputStyle(`${time}-血壓`)}
              />
            </div>
            <div style={{ marginBottom: "8px" }}>
              <label>脈搏：</label>
              <input
                type="text"
                value={todayData[time]?.["生命徵象"]?.["脈搏"] || ""}
                onFocus={() => setFocusedField(`${time}-脈搏`)}
                onBlur={() => setFocusedField(null)}
                onChange={(e) =>
                  handleChange(time, "生命徵象", "脈搏", e.target.value)
                }
                style={getInputStyle(`${time}-脈搏`)}
              />
            </div>
            <div style={{ marginBottom: "8px" }}>
              <label>疼痛：</label>
              <select
                value={todayData[time]?.["生命徵象"]?.["疼痛"] || "無"}
                onChange={(e) =>
                  handleChange(time, "生命徵象", "疼痛", e.target.value)
                }
                style={baseInputStyle}
              >
                <option>無</option>
                <option>有</option>
              </select>
            </div>

            {/* 飲食與液體 */}
            <h3>飲食與液體</h3>
            <div style={{ marginBottom: "8px" }}>
              <label>食物：</label>
              <input
                type="text"
                value={todayData[time]?.["飲食與液體"]?.["食物"] || ""}
                onFocus={() => setFocusedField(`${time}-食物`)}
                onBlur={() => setFocusedField(null)}
                onChange={(e) =>
                  handleChange(time, "飲食與液體", "食物", e.target.value)
                }
                style={getInputStyle(`${time}-食物`)}
              />
            </div>
            <div style={{ marginBottom: "8px" }}>
              <label>液體攝取量 (mL)：</label>
              <input
                type="number"
                step="any"
                inputMode="decimal"
                value={todayData[time]?.["飲食與液體"]?.["液體攝取量"] || ""}
                onFocus={() => setFocusedField(`${time}-液體攝取量`)}
                onBlur={() => setFocusedField(null)}
                onChange={(e) =>
                  handleChange(time, "飲食與液體", "液體攝取量", e.target.value)
                }
                style={getInputStyle(`${time}-液體攝取量`)}
              />
            </div>
            <div style={{ marginBottom: "8px" }}>
              <label>食慾：</label>
              <select
                value={todayData[time]?.["飲食與液體"]?.["食慾"] || "一般"}
                onChange={(e) =>
                  handleChange(time, "飲食與液體", "食慾", e.target.value)
                }
                style={baseInputStyle}
              >
                <option>好</option>
                <option>一般</option>
                <option>無</option>
              </select>
            </div>

            {/* 其他觀察 */}
            <h3>其他觀察</h3>
            <div style={{ marginBottom: "8px" }}>
              <label>睡眠：</label>
              <select
                value={todayData[time]?.["其他觀察"]?.["睡眠"] || "一般"}
                onChange={(e) =>
                  handleChange(time, "其他觀察", "睡眠", e.target.value)
                }
                style={baseInputStyle}
              >
                <option>好</option>
                <option>一般</option>
                <option>無</option>
              </select>
            </div>
          </div>
        );
      })}

      {/* 歷史紀錄 */}
      <div style={{ marginTop: "40px" }}>
        <h2 style={{ color: "#14532d" }}>📜 過往紀錄</h2>
        {history.length === 0 ? (
          <p>目前尚無紀錄。</p>
        ) : (
          history
            .sort((a: any, b: any) => (a.date < b.date ? 1 : -1))
            .map((r: any) => (
              <details key={r.date} style={{ marginBottom: "10px" }}>
                <summary
                  style={{
                    cursor: "pointer",
                    color: "#166534",
                    fontWeight: 600,
                  }}
                >
                  {r.date}
                </summary>
                <pre
                  style={{
                    background: "#f3f4f6",
                    padding: "10px",
                    borderRadius: "8px",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {JSON.stringify(r.data, null, 2)}
                </pre>
              </details>
            ))
        )}
      </div>
    </div>
  );
}
