import React, { useState, useEffect } from "react";

interface RecordData {
  [key: string]: any;
}

export default function CancerCareTrackerTW() {
  const times = ["早晨 (7–11)", "中午 (11–16)", "傍晚 (16–22)", "夜間 (22–7)"];
  const [todayData, setTodayData] = useState<RecordData>({});
  const [history, setHistory] = useState<RecordData[]>([]);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [currentTimeLabel, setCurrentTimeLabel] = useState<string>("");
  const [todayDate, setTodayDate] = useState<string>("");
  const [showMorningNotice, setShowMorningNotice] = useState<boolean>(false);

  // 🧩 Deep clone helper
  const deepClone = (obj: any) => JSON.parse(JSON.stringify(obj));

  const defaultSections = {
    生命徵象: { 體溫: "", 血壓: "", 脈搏: "", 疼痛: "無" },
    飲食與液體: { 食物: "", 液體攝取量: "", 食慾: "一般" },
    藥物與廁所: { 藥物紀錄: "", 廁所: "無" },
    其他觀察: { 心情: "穩定", 皮膚: "", 睡眠: "一般", 備註: "" },
  };

  // Taiwan time
  const getTaiwanDate = () =>
    new Date().toLocaleDateString("zh-TW", { timeZone: "Asia/Taipei" });
  const getTaiwanHour = () =>
    parseInt(
      new Date().toLocaleString("zh-TW", {
        timeZone: "Asia/Taipei",
        hour: "2-digit",
        hour12: false,
      })
    );

  const determineCurrentTimeZone = () => {
    const hour = getTaiwanHour();
    if (hour >= 7 && hour < 11) return "早晨 (7–11)";
    if (hour >= 11 && hour < 16) return "中午 (11–16)";
    if (hour >= 16 && hour < 22) return "傍晚 (16–22)";
    return "夜間 (22–7)";
  };

  // 🕒 Initialize
  useEffect(() => {
    const date = getTaiwanDate();
    setTodayDate(date);
    const saved = localStorage.getItem("careTrackerRecords");
    let parsed = saved ? JSON.parse(saved) : [];

    const todayRecord = parsed.find((r: any) => r.date === date);
    if (todayRecord) {
      setTodayData(todayRecord.data);
    } else {
      const emptyData = Object.fromEntries(
        times.map((t) => [t, deepClone(defaultSections)])
      );
      setTodayData(emptyData);
      parsed.push({ date, data: emptyData });
      localStorage.setItem("careTrackerRecords", JSON.stringify(parsed));
    }
    setHistory(parsed);

    const updateTime = () => {
      const hour = getTaiwanHour();
      setCurrentTimeLabel(determineCurrentTimeZone());
      setShowMorningNotice(hour >= 6 && hour < 8);
    };
    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  // 🕗 Auto new sheet 8AM
  useEffect(() => {
    const interval = setInterval(() => {
      const hour = getTaiwanHour();
      const dateNow = getTaiwanDate();
      if (hour === 8 && dateNow !== todayDate) {
        const saved = localStorage.getItem("careTrackerRecords");
        let parsed = saved ? JSON.parse(saved) : [];
        const newEmpty = Object.fromEntries(
          times.map((t) => [t, deepClone(defaultSections)])
        );
        // 🧩 Deep clone to isolate old days
        const deepClone = (obj: any) => JSON.parse(JSON.stringify(obj));
        parsed.push({ date: dateNow, data: deepClone(newEmpty) });

        // Keep last 10 days only
        parsed = parsed
          .sort((a: any, b: any) => (a.date < b.date ? 1 : -1))
          .slice(0, 10);

        
        localStorage.setItem("careTrackerRecords", JSON.stringify(parsed));
        setHistory(parsed);
        setTodayData(newEmpty);
        setTodayDate(dateNow);
      }
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, [todayDate]);

// 💾 Save data safely (deep copy & limit to 10 days)
const saveData = (newData: RecordData) => {
  const date = getTaiwanDate();
  const deepClone = (obj: any) => JSON.parse(JSON.stringify(obj));

  // Create a frozen snapshot of today’s data
  const updatedRecord = { date, data: deepClone(newData) };

  let updatedHistory = history.filter((r: any) => r.date !== date);
  updatedHistory.push(updatedRecord);

  // Keep only the latest 10 days
  updatedHistory = updatedHistory
    .sort((a: any, b: any) => (a.date < b.date ? 1 : -1))
    .slice(0, 10);

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

  // 🟢 FIX: Delay focus change for mobile
  const handleFocus = (key: string) => {
    setTimeout(() => setFocusedField(key), 100);
  };

  const baseInputStyle = {
    width: "100%",
    padding: "6px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    transition: "background-color 0.2s ease",
    fontSize: "16px", // 🟢 Prevent iOS zoom
  };

  const getInputStyle = (key: string) => ({
    ...baseInputStyle,
    backgroundColor: focusedField === key ? "#dcfce7" : "white",
  });

  return (
    <div style={{ padding: "20px", fontFamily: "Noto Sans TC, sans-serif" }}>
      <h1 style={{ textAlign: "center", color: "#166534" }}>每日照護追蹤表</h1>
      <p style={{ textAlign: "center", color: "#555" }}>
        自動儲存，每日早上 8 點自動建立新表（依台灣時間）
        <br />
        今日日期：<strong>{todayDate}</strong>　
        目前時段：
        <strong style={{ color: "#166534" }}>{currentTimeLabel}</strong>
      </p>

      {showMorningNotice && (
        <div
          style={{
            background: "#fef9c3",
            color: "#854d0e",
            border: "1px solid #facc15",
            borderRadius: "8px",
            padding: "10px",
            margin: "10px 0 20px",
            textAlign: "center",
            fontWeight: 600,
          }}
        >
          ⚠️ 現在是早上 6–8 點，新的一天即將開始，
          <br />
          早上 8 點後將自動建立新表。
        </div>
      )}

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
            {["體溫", "血壓", "脈搏"].map((field) => (
              <div key={field} style={{ marginBottom: "8px" }}>
                <label>{field}：</label>
                <input
                  type="text"
                  value={todayData[time]?.["生命徵象"]?.[field] || ""}
                  onFocus={() => handleFocus(`${time}-${field}`)}
                  onBlur={() => setFocusedField(null)}
                  onChange={(e) =>
                    handleChange(time, "生命徵象", field, e.target.value)
                  }
                  style={getInputStyle(`${time}-${field}`)}
                />
              </div>
            ))}
            <div style={{ marginBottom: "8px" }}>
              <label>疼痛：</label>
              <select
                value={todayData[time]?.["生命徵象"]?.["疼痛"] || "無"}
                onFocus={() => handleFocus(`${time}-疼痛`)}
                onBlur={() => setFocusedField(null)}
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
                onFocus={() => handleFocus(`${time}-食物`)}
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
                value={todayData[time]?.["飲食與液體"]?.["液體攝取量"] || ""}
                onFocus={() => handleFocus(`${time}-液體攝取量`)}
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
                onFocus={() => handleFocus(`${time}-食慾`)}
                onBlur={() => setFocusedField(null)}
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

            {/* 藥物與廁所 */}
            <h3>藥物與廁所</h3>
            <div style={{ marginBottom: "8px" }}>
              <label>藥物紀錄：</label>
              <input
                type="text"
                value={todayData[time]?.["藥物與廁所"]?.["藥物紀錄"] || ""}
                onFocus={() => handleFocus(`${time}-藥物紀錄`)}
                onBlur={() => setFocusedField(null)}
                onChange={(e) =>
                  handleChange(time, "藥物與廁所", "藥物紀錄", e.target.value)
                }
                style={getInputStyle(`${time}-藥物紀錄`)}
              />
            </div>
            <div style={{ marginBottom: "8px" }}>
              <label>廁所：</label>
              <select
                value={todayData[time]?.["藥物與廁所"]?.["廁所"] || "無"}
                onFocus={() => handleFocus(`${time}-廁所`)}
                onBlur={() => setFocusedField(null)}
                onChange={(e) =>
                  handleChange(time, "藥物與廁所", "廁所", e.target.value)
                }
                style={baseInputStyle}
              >
                <option>無</option>
                <option>小號</option>
                <option>大號</option>
                <option>大小號</option>
              </select>
            </div>

            {/* 其他觀察 */}
            <h3>其他觀察</h3>
            <div style={{ marginBottom: "8px" }}>
              <label>心情：</label>
              <select
                value={todayData[time]?.["其他觀察"]?.["心情"] || "穩定"}
                onFocus={() => handleFocus(`${time}-心情`)}
                onBlur={() => setFocusedField(null)}
                onChange={(e) =>
                  handleChange(time, "其他觀察", "心情", e.target.value)
                }
                style={baseInputStyle}
              >
                <option>穩定</option>
                <option>焦慮</option>
                <option>疲倦</option>
                <option>其他</option>
              </select>
            </div>
            {["皮膚", "睡眠", "備註"].map((field) => (
              <div key={field} style={{ marginBottom: "8px" }}>
                <label>{field}：</label>
                <input
                  type="text"
                  value={todayData[time]?.["其他觀察"]?.[field] || ""}
                  onFocus={() => handleFocus(`${time}-${field}`)}
                  onBlur={() => setFocusedField(null)}
                  onChange={(e) =>
                    handleChange(time, "其他觀察", field, e.target.value)
                  }
                  style={getInputStyle(`${time}-${field}`)}
                />
              </div>
            ))}
          </div>
        );
      })}

      {/* 過往紀錄 */}
      <div style={{ marginTop: "40px" }}>
        <h2 style={{ color: "#14532d" }}>📜 過往紀錄</h2>
        {history.length === 0 ? (
          <p>目前尚無紀錄。</p>
        ) : (
          history
            .sort((a: any, b: any) => (a.date < b.date ? 1 : -1))
            .map((r: any) => (
              <details
                key={r.date}
                style={{
                  marginBottom: "15px",
                  background: "#f9fafb",
                  borderRadius: "8px",
                  padding: "10px",
                  border: "1px solid #e5e7eb",
                }}
              >
                <summary
                  style={{
                    cursor: "pointer",
                    fontWeight: 600,
                    color: "#166534",
                    fontSize: "1.1em",
                  }}
                >
                  📅 {r.date}
                </summary>

                {Object.entries(r.data).map(([time, sections]: [string, any]) => (
                  <div key={time} style={{ marginTop: "10px" }}>
                    <h4 style={{ color: "#15803d" }}>{time}</h4>
                    {Object.entries(sections).map(([section, fields]: [string, any]) => (
                      <div key={section} style={{ marginLeft: "10px" }}>
                        <strong>{section}：</strong>
                        <div style={{ marginLeft: "8px" }}>
                          {Object.entries(fields).map(([key, value]: [string, any]) => (
                            <div key={key}>
                              {key}：{value || "—"}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </details>
            ))
        )}
      </div>
    </div>
  );
}
