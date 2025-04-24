// generate.js (Updated)

function generateAvailabilitySlots(startDate, days = 7) {
    const { weekday, weekend } = JSON.parse(localStorage.getItem('availability')) || {};
    const slots = {};
    const timeParser = (range) => {
      const [start, end] = range.replace(/am|pm/gi, '').split('–');
      const startHour = parseInt(start.trim());
      const endHour = parseInt(end.trim());
      const isPM = /pm/i.test(range);
  
      const hours = [];
      for (let h = startHour; h < endHour; h++) {
        const hour24 = isPM && h < 12 ? h + 12 : h;
        hours.push(`${hour24.toString().padStart(2, '0')}:00`);
      }
      return hours;
    };
  
    const now = new Date(startDate);
    for (let i = 0; i < days; i++) {
      const day = new Date(now);
      day.setDate(now.getDate() + i);
      const dayStr = day.toISOString().split('T')[0];
      const isWeekend = day.getDay() === 0 || day.getDay() === 6;
      const range = isWeekend ? weekend : weekday;
  
      if (range) {
        slots[dayStr] = timeParser(range);
      }
    }
  
    return slots;
  }
  
  function autoSchedule(subjects, availability, existingTasks = []) {
    const scheduledTimes = new Set(existingTasks.map(task => task.date + '_' + task.time));
    const today = new Date();
    const schedule = [];
  
    subjects.forEach(subject => {
      const totalHours = subject.duration;
      const dueDate = new Date(subject.dueDate);
      const availableDays = [];
  
      let current = new Date(today);
      while (current <= dueDate) {
        const day = current.toISOString().split('T')[0];
        if (availability[day]) {
          availableDays.push({ date: day, slots: [...availability[day]] });
        }
        current.setDate(current.getDate() + 1);
      }
  
      let remaining = totalHours;
      for (const day of availableDays) {
        for (let i = 0; i < day.slots.length && remaining > 0; i++) {
          const timeKey = day.date + '_' + day.slots[i];
          if (!scheduledTimes.has(timeKey)) {
            schedule.push({ subject: subject.subject, date: day.date, time: day.slots[i], duration: 1 });
            scheduledTimes.add(timeKey);
            remaining--;
          }
        }
        if (remaining <= 0) break;
      }
    });
  
    return schedule;
  }
  
  document.getElementById("generate-btn").addEventListener("click", () => {
    const subjects = JSON.parse(localStorage.getItem("subjects")) || [];
    const availability = generateAvailabilitySlots(new Date(), 7);
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  
    const schedule = autoSchedule(subjects, availability, tasks);
  
    const todayStr = new Date().toISOString().split("T")[0];
    const todaysSchedule = schedule
      .filter(s => s.date === todayStr)
      .map(s => ({ subject: s.subject, time: s.time }));
  
    localStorage.setItem("todaysSchedule", JSON.stringify(todaysSchedule));
  
    const container = document.getElementById("generated-schedule");
    container.innerHTML = "<h2>Recommended Schedule</h2>";
  
    todaysSchedule.forEach(item => {
      const div = document.createElement("div");
      div.className = "schedule-item";
      div.textContent = `${item.subject} - ${item.time}`;
      container.appendChild(div);
    });
  });
  