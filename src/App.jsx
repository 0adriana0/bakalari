import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, doc, setDoc, deleteDoc, getDocs } from "firebase/firestore";
import styles from "./App.module.css";

const days = ["PO", "ÚT", "ST", "ČT", "PÁ"];
const lessons = [
  { id: "1", num: 1, time: "7:55–8:40" },
  { id: "2", num: 2, time: "8:50–9:35" },
  { id: "3", num: 3, time: "9:50–10:35" },
  { id: "4", num: 4, time: "10:45–11:30" },
  { id: "5", num: 5, time: "11:40–12:25" },
  { id: "6", num: 6, time: "12:35–13:20" },
  { id: "7A", num: "7A", time: "13:30–14:15" },
  { id: "7B", num: "7B", time: "14:25–15:10" },
  { id: "8", num: 8, time: "15:20–16:05" },
  { id: "9", num: 9, time: "16:15–17:00" },
];

export default function App() {
  const [schedule, setSchedule] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [weekStart, setWeekStart] = useState(() => {
    const now = new Date();
    const day = now.getDay();
    const diff = day === 0 ? -6 : 1 - day; // зміщення до понеділка
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    return monday;
  });

  // Формат DD.MM
  const formatDate = (date) => {
    const d = date.getDate().toString().padStart(2, "0");
    const m = (date.getMonth() + 1).toString().padStart(2, "0");
    return `${d}.${m}`;
  };

  const weekDates = days.map((_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  // Завантаження розкладу та дати з Firebase
  useEffect(() => {
    const fetchSchedule = async () => {
      const querySnapshot = await getDocs(collection(db, "schedule"));
      const data = {};
      querySnapshot.forEach((docSnap) => {
        const item = docSnap.data();
        if (!item.room) item.room = "7"; // старі уроки
        if (item.weekStart) setWeekStart(new Date(item.weekStart)); // дата понеділка
        data[docSnap.id] = item;
      });
      setSchedule(data);
    };
    fetchSchedule();
  }, []);

  // Додавання уроку
  const handleAdd = async (day, lesson) => {
    const subject = prompt("Назва предмету:");
    if (!subject) return;

    const teacher = prompt("Вчитель:");
    if (!teacher) return;

    const roomInput = prompt("Кабінет (число):");
    const room = roomInput && roomInput.trim() !== "" ? parseInt(roomInput) : null;

    const key = `${day}-${lesson.id}`;
    const docRef = doc(db, "schedule", key);

    const colorMap = { AJ: "#ff5151", NJ: "#ff5151", V: "#7fc26b" };
    const color = colorMap[subject] || "#374151";

    // Зберігаємо урок та дату понеділка
    await setDoc(docRef, {
      subject,
      teacher,
      room,
      color,
      weekStart: weekStart.toISOString(), // записуємо дату в Firebase
    });

    setSchedule((prev) => ({
      ...prev,
      [key]: { subject, teacher, room, color, weekStart: weekStart.toISOString() },
    }));
  };

  // Видалення уроку
  const handleDelete = async (day, lesson) => {
    const key = `${day}-${lesson.id}`;
    const docRef = doc(db, "schedule", key);

    await deleteDoc(docRef);
    setSchedule((prev) => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  };

  return (
    <div className={styles.app}>
      <div className={styles.phone}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Rozvrh</h1>
            <p className={styles.subtitle}>Maslii Adriana 2.E</p>
            {editMode && (
              <button
                className={styles.dateButton}
                onClick={async () => {
                  const newDate = prompt(
                    "Введіть дату понеділка у форматі YYYY-MM-DD",
                    weekStart.toISOString().slice(0, 10)
                  );
                  if (!newDate) return;

                  const newMonday = new Date(newDate);
                  setWeekStart(newMonday);

                  // Оновлюємо всі уроки у Firebase з новою датою
                  const keys = Object.keys(schedule);
                  for (const key of keys) {
                    const docRef = doc(db, "schedule", key);
                    const item = schedule[key];
                    await setDoc(docRef, { ...item, weekStart: newMonday.toISOString() });
                  }
                }}
              >
                DATE
              </button>
            )}
          </div>
          <div className={styles.controls}>
            <button onClick={() => setEditMode(!editMode)}>⚙️</button>
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <div className={styles.table}>
            <div className={styles.daysColumn}>
              <div style={{ height: "70px" }}></div>
              {days.map((day, idx) => (
                <div key={day} className={styles.day}>
                  <div>{day}</div>
                  <small>{formatDate(weekDates[idx])}</small>
                </div>
              ))}
            </div>

            <div className={styles.lessonColumns}>
              <div className={styles.row}>
                {lessons.map((lesson) => (
                  <div key={lesson.id} className={styles.lessonHeader}>
                    <div>{lesson.num}</div>
                    <small>{lesson.time}</small>
                  </div>
                ))}
              </div>

              {days.map((day) => (
                <div key={day} className={styles.row}>
                  {lessons.map((lesson) => {
                    const key = `${day}-${lesson.id}`;
                    const item = schedule[key];
                    return (
                      <div
                        key={key}
                        className={styles.cell}
                        style={{ background: item?.color || "#1f2937" }}
                        onClick={() => {
                          if (!editMode) return;
                          if (item) handleDelete(day, lesson);
                          else handleAdd(day, lesson);
                        }}
                      >
                        {item ? (
                          <>
                            <div>{item.subject}</div>
                            <small>{item.teacher}</small>
                            <small>{item.room !== null ? item.room : "-"}</small>
                          </>
                        ) : editMode ? (
                          <span>+</span>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}