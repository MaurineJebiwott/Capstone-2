// Auto-Scheduling Engine (no changes)
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

// Render all tasks
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

function renderTasks() {
  const taskList = document.getElementById('task-list');
  taskList.innerHTML = '';

  tasks.forEach(task => {
    const taskHTML = `<div><strong>${task.subject}</strong> - ${task.date} at ${task.time} (${task.duration} hrs)</div>`;
    taskList.innerHTML += taskHTML;
  });

  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Render Today's Schedule from localStorage
function renderTodaySchedule() {
  const todaySchedule = JSON.parse(localStorage.getItem('todaysSchedule')) || [];
  const list = document.getElementById('schedule-list');
  list.innerHTML = '';

  todaySchedule.forEach(item => {
    const label = document.createElement('label');
    label.style.display = 'block';
    label.innerHTML = `<input type="checkbox" /> ${item.subject} - ${item.time}`;
    list.appendChild(label);
  });
}

// Add task
document.getElementById('add-task-btn')?.addEventListener('click', () => {
  document.getElementById('task-modal').classList.remove('hidden');
  document.getElementById('modal-title').textContent = 'Add Task';
});

document.getElementById('cancel-modal')?.addEventListener('click', () => {
  document.getElementById('task-modal').classList.add('hidden');
});

document.getElementById('task-form')?.addEventListener('submit', function(e) {
  e.preventDefault();
  const subject = this.subject.value;
  const date = this.date.value;
  const time = this.time.value;
  const duration = this.duration.value;

  tasks.push({ subject, date, time, duration });
  renderTasks();

  this.reset();
  document.getElementById('task-modal').classList.add('hidden');
});

// Generate Schedule and Store Today's
document.getElementById('generate-schedule-btn')?.addEventListener('click', () => {
  const subjectsToSchedule = JSON.parse(localStorage.getItem('subjects')) || [];
  const availability = generateAvailabilitySlots(new Date(), 7);
  const existingTasks = JSON.parse(localStorage.getItem('tasks')) || [];

  const schedule = autoSchedule(subjectsToSchedule, availability, existingTasks);

  // Save today’s schedule separately
  const todayStr = new Date().toISOString().split('T')[0];
  const todaySchedule = schedule.filter(s => s.date === todayStr)
    .map(s => ({ subject: s.subject, time: s.time }));

  localStorage.setItem('todaysSchedule', JSON.stringify(todaySchedule));
  renderTodaySchedule();

  // Show upcoming task preview
  const scheduleList = document.getElementById('missed-list');
  scheduleList.innerHTML = '';

  schedule.forEach(item => {
    const div = document.createElement('div');
    div.innerHTML = `📘 <strong>${item.subject}</strong> on ${item.date} at ${item.time}`;
    scheduleList.appendChild(div);
  });
});

document.addEventListener('DOMContentLoaded', () => {
  renderTasks();
  renderTodaySchedule();
});
