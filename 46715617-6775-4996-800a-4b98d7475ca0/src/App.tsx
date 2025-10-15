import React, { useState, useEffect } from "react";

interface RecordData {
  [key: string]: any;
}

export default function CancerCareTrackerTW() {
  const times = ["早晨 (6–11)", "中午 (11–16)", "傍晚 (16–21)", "夜間 (21–6)"];
  const [todayData, setTodayData] = useState<RecordData>({});
  const [history, setHistory] = useState<RecordData[]>([]);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const defaultSections = {
    生命徵象: { 體溫: "", 血壓: "", 脈搏: "", 疼痛: "無" },
    飲食與液體: { 食物: "", 液體攝取量: "", 食慾: "一般" },
    藥物與廁所: { 藥物紀錄: "", 廁所: "無" },
    其他觀察: { 心情: "穩定", 皮膚: "", 睡眠: "", 備註: "" },
  };

  // ✅ Always use Taiwan time zone
  const getTaiwanDate = () =>
    new Date().toLocaleDateString("zh-TW", { timeZone: "Asia/Taipei" });

  useEffect(() => {
    const date = getTaiwanDate();
    const saved = localStorage.getItem("careTrackerRecords");
    if (saved) {
      const parsed = JSON.parse(saved);
      setHistory(parsed);
      const todayRecord = parsed.find((r: any) => r.date === date);
      if (todayRecord) setTodayData(todayRecord.data);
      else
        setTodayData(
          Object.fromEntries(times.map((t) => [t, defaultSections]))
        );
    } else {
      setTodayData(Object.fromEntries(times.map((t) => [t, defaultSections])));
    }
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
    MozAppearance: "textfield" as const,
    WebkitAppearance: "none" as const,
    appearance: "none" as const,
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
        可於下方查看今日與過往紀錄
      </p>

      {times.map((time) => (
        <div
          key={time}
          style={{
            border: "2px solid #4ade80",
            borderRadius: "12px",
            padding: "16px",
            marginTop: "20px",
            backgroundColor: "#f9fff9",
          }}
        >
          <h2 style={{ color: "#15803d", marginBottom: "10px" }}>{time}</h2>

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
              <option>差</option>
            </select>
          </div>

          {/* 藥物與廁所 */}
          <h3>藥物與廁所</h3>
          <div style={{ marginBottom: "8px" }}>
            <label>藥物名稱 / 時間 / 劑量：</label>
            <input
              type="text"
              value={todayData[time]?.["藥物與廁所"]?.["藥物紀錄"] || ""}
              onFocus={() => setFocusedField(`${time}-藥物紀錄`)}
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
                onFocus={() => setFocusedField(`${time}-${field}`)}
                onBlur={() => setFocusedField(null)}
                onChange={(e) =>
                  handleChange(time, "其他觀察", field, e.target.value)
                }
                style={getInputStyle(`${time}-${field}`)}
              />
            </div>
          ))}
        </div>
      ))}

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
