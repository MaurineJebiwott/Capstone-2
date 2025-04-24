// app.js – Unified functionality for StudySync

document.addEventListener("DOMContentLoaded", () => {
  // ======= LOGIN & SIGNUP LOGIC =======
  const loginForm = document.getElementById("login-form");
  const dashboardBtn = document.getElementById("dashboard-btn");
  const navLinks = document.getElementById("nav-links");

  if (loginForm && dashboardBtn) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = loginForm.querySelector("input[type='email']").value.trim();
      const password = loginForm.querySelector("input[type='password']").value.trim();

      if (email && password) {
        dashboardBtn.classList.remove("hidden");
        navLinks?.classList.remove("hidden");
      }
    });
  }

  // ======= SETTINGS PAGE =======
  const weekdayInput = document.querySelector("[name='weekday-hours']");
  const weekendInput = document.querySelector("[name='weekend-hours']");
  const sessionLengthInput = document.querySelector("[name='session-length']");
  const breakFrequencyInput = document.querySelector("[name='break-frequency']");
  const subjectInput = document.getElementById("new-subject");
  const addSubjectBtn = document.getElementById("add-subject");
  const subjectList = document.getElementById("subject-list");
  const clearDataBtn = document.getElementById("clear-data");

  const settingsAvailable = weekdayInput && weekendInput && sessionLengthInput;

  if (settingsAvailable) {
    weekdayInput.value = localStorage.getItem("weekday-hours") || "";
    weekendInput.value = localStorage.getItem("weekend-hours") || "";
    sessionLengthInput.value = localStorage.getItem("session-length") || 60;
    breakFrequencyInput.value = localStorage.getItem("break-frequency") || 30;

    const savedSubjects = JSON.parse(localStorage.getItem("subjects") || "[]");
    savedSubjects.forEach(subject => addSubjectToList(subject));

    weekdayInput.addEventListener("input", () => localStorage.setItem("weekday-hours", weekdayInput.value));
    weekendInput.addEventListener("input", () => localStorage.setItem("weekend-hours", weekendInput.value));
    sessionLengthInput.addEventListener("input", () => localStorage.setItem("session-length", sessionLengthInput.value));
    breakFrequencyInput.addEventListener("input", () => localStorage.setItem("break-frequency", breakFrequencyInput.value));

    addSubjectBtn.addEventListener("click", () => {
      const newSubject = subjectInput.value.trim();
      if (newSubject) {
        let subjects = JSON.parse(localStorage.getItem("subjects") || "[]");
        subjects.push(newSubject);
        localStorage.setItem("subjects", JSON.stringify(subjects));
        addSubjectToList(newSubject);
        subjectInput.value = "";
      }
    });

    function addSubjectToList(subject) {
      const li = document.createElement("li");
      li.textContent = subject;
      li.style.whiteSpace = "pre-line";
      li.addEventListener("dblclick", () => {
        li.remove();
        let subjects = JSON.parse(localStorage.getItem("subjects") || "[]");
        subjects = subjects.filter(s => s !== subject);
        localStorage.setItem("subjects", JSON.stringify(subjects));
      });
      subjectList.appendChild(li);
    }

    clearDataBtn?.addEventListener("click", () => {
      localStorage.clear();
      location.reload();
    });
  }

  // ======= GENERATE PAGE =======
  const generateBtn = document.getElementById("generate-btn");
  const generatedSchedule = document.getElementById("generated-schedule");
  const taskList = document.getElementById("task-list");
  if (generateBtn && generatedSchedule) {
    generateBtn.addEventListener("click", () => {
      const subjects = JSON.parse(localStorage.getItem("subjects") || "[]");
      const sessionLength = parseInt(localStorage.getItem("session-length")) || 60;
      const weekdayHours = localStorage.getItem("weekday-hours") || "6–9pm";
      const weekendHours = localStorage.getItem("weekend-hours") || "";

      const isWeekend = [0, 6].includes(new Date().getDay());
      const hours = isWeekend ? weekendHours : weekdayHours;

      const [start, end] = hours.split(/[–-]/);
      const to24 = time => {
        const [t, m] = time.trim().split(/(am|pm)/);
        let [h, min] = t.split(":");
        h = parseInt(h);
        min = min || "00";
        if (m === "pm" && h < 12) h += 12;
        if (m === "am" && h === 12) h = 0;
        return { hour: h, min: parseInt(min) };
      };

      const startTime = to24(start);
      generatedSchedule.innerHTML = "";

      subjects.forEach((subject, i) => {
        const div = document.createElement("div");
        div.className = "schedule-item";
        const hour = startTime.hour + i;
        const suffix = hour >= 12 ? "PM" : "AM";
        const displayHour = ((hour + 11) % 12 + 1);
        div.textContent = `📘 ${subject} — ${displayHour}:00 ${suffix} (${isWeekend ? "Weekend" : "Weekday"})`;
        generatedSchedule.appendChild(div);
      });

      if (taskList) {
        taskList.innerHTML = "<h3>Upcoming Tasks</h3>" + taskList.innerHTML;
        generatedSchedule.appendChild(taskList.cloneNode(true));
      }
    });
  }

  // ======= DASHBOARD TASKS =======
  const addTaskBtn = document.getElementById("add-task-btn");
  const taskModal = document.getElementById("task-modal");
  const cancelModalBtn = document.getElementById("cancel-modal");
  const taskForm = document.getElementById("task-form");

  if (addTaskBtn && taskModal && taskForm && taskList) {
    addTaskBtn.addEventListener("click", () => {
      taskModal.classList.remove("hidden");
    });

    cancelModalBtn.addEventListener("click", () => {
      taskModal.classList.add("hidden");
    });

    taskForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const formData = new FormData(taskForm);
      const subject = formData.get("subject");
      const date = formData.get("date");
      const time = formData.get("time");
      const duration = formData.get("duration");

      const taskItem = document.createElement("div");
      taskItem.style.marginBottom = "1rem";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.style.marginRight = "0.5rem";

      const textSpan = document.createElement("span");
      textSpan.innerHTML = `<strong>${subject}</strong><br>${date} @ ${time} (${duration} hrs)`;

      checkbox.addEventListener("change", () => {
        textSpan.style.textDecoration = checkbox.checked ? "line-through" : "none";
      });

      taskItem.appendChild(checkbox);
      taskItem.appendChild(textSpan);
      taskList.appendChild(taskItem);

      taskForm.reset();
      taskModal.classList.add("hidden");
    });
  }

  // ======= CHECKBOXES FOR PROGRESS TRACKING =======
  const scheduleList = document.getElementById("schedule-list");
  if (scheduleList) {
    scheduleList.innerHTML = "";
    const subjects = JSON.parse(localStorage.getItem("subjects") || "[]");
    subjects.forEach((subject, i) => {
      const label = document.createElement("label");
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      const span = document.createElement("span");
      span.textContent = ` ${subject} - ${6 + i}:00 PM`;

      checkbox.addEventListener("change", () => {
        span.style.textDecoration = checkbox.checked ? "line-through" : "none";
      });

      label.appendChild(checkbox);
      label.appendChild(span);
      label.style.display = "block";
      scheduleList.appendChild(label);
    });
  }

  // ======= STUDY GOALS CHECKLIST =======
  const extraSection = document.getElementById("extra");
  if (extraSection) {
    const goalInput = document.createElement("input");
    goalInput.placeholder = "Add new goal";
    goalInput.style.marginRight = "0.5rem";

    const goalButton = document.createElement("button");
    goalButton.textContent = "Add Goal";

    const goalList = document.createElement("ul");

    goalButton.addEventListener("click", () => {
      const goalText = goalInput.value.trim();
      if (goalText) {
        const li = document.createElement("li");
        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.style.marginRight = "0.5rem";
        const span = document.createElement("span");
        span.textContent = goalText;

        cb.addEventListener("change", () => {
          span.style.textDecoration = cb.checked ? "line-through" : "none";
        });

        li.appendChild(cb);
        li.appendChild(span);
        goalList.appendChild(li);
        goalInput.value = "";
      }
    });

    extraSection.appendChild(goalInput);
    extraSection.appendChild(goalButton);
    extraSection.appendChild(goalList);
  }

  // ======= MISSED SESSIONS SECTION =======
  const missedSection = document.getElementById("missed");
  if (missedSection) {
    const missedInput = document.createElement("input");
    missedInput.placeholder = "Add missed session";
    missedInput.style.marginRight = "0.5rem";

    const missedBtn = document.createElement("button");
    missedBtn.textContent = "Add Missed Session";

    const missedList = document.getElementById("missed-list");

    missedBtn.addEventListener("click", () => {
      const session = missedInput.value.trim();
      if (session) {
        const li = document.createElement("div");
        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.style.marginRight = "0.5rem";
        const span = document.createElement("span");
        span.textContent = session;

        cb.addEventListener("change", () => {
          span.style.textDecoration = cb.checked ? "line-through" : "none";
        });

        li.appendChild(cb);
        li.appendChild(span);
        missedList.appendChild(li);
        missedInput.value = "";
      }
    });

    missedSection.appendChild(missedInput);
    missedSection.appendChild(missedBtn);
  }
});