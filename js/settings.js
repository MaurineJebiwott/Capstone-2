document.getElementById('availability-form')?.addEventListener('change', () => {
  const weekday = document.querySelector('[name="weekday-hours"]').value;
  const weekend = document.querySelector('[name="weekend-hours"]').value;
  localStorage.setItem('availability', JSON.stringify({ weekday, weekend }));
});

document.getElementById('preferences-form')?.addEventListener('change', () => {
  const sessionLength = document.querySelector('[name="session-length"]').value;
  const breakFrequency = document.querySelector('[name="break-frequency"]').value;
  localStorage.setItem('preferences', JSON.stringify({ sessionLength, breakFrequency }));
});

document.getElementById('add-subject')?.addEventListener('click', () => {
  const subjectInput = document.getElementById('new-subject');
  const subjectName = subjectInput.value.trim();
  if (subjectName) {
    const subjects = JSON.parse(localStorage.getItem('subjects')) || [];
    subjects.push({ subject: subjectName, duration: 4, dueDate: "2025-04-30" }); // You can prompt users for more values
    localStorage.setItem('subjects', JSON.stringify(subjects));

    const li = document.createElement('li');
    li.textContent = subjectName;
    document.getElementById('subject-list').appendChild(li);
    subjectInput.value = '';
  }
});

document.getElementById('clear-data')?.addEventListener('click', () => {
  if (confirm('Are you sure you want to clear your data?')) {
    localStorage.clear();
    document.getElementById('subject-list').innerHTML = '';
    alert('Data reset!');
  }
});
