/**
 * Main Application Script for Minimalist Productivity
 * Firefox Extension - New Tab Override
 */

// App state
let state = {
  tasks: [],
  categories: [],
  events: [],
  customBackgroundImage: null,
  backgroundFitMode: "cover",
  backgroundIndex: 0,
  reminderSettings: { enabled: true, reminderTime: 30 },
  autoDeleteCompleted: false,
  theme: "dark",
  currentTaskIndex: 0,
  isTimerMode: false,
  timerRunning: false,
  timerSeconds: 0,
  timerStartTime: null,
  timerPausedElapsed: 0,
  selectedMonth: new Date().getMonth(),
  selectedYear: new Date().getFullYear(),
  categoryFilter: null,
  dateFilter: "all",
}

// DOM Elements cache
const elements = {}

// Declare variables before using them
let loadAppData
let saveAppData
let getRotatingBackground
let browser
let exportData
let importData

/**
 * Initialize the application
 */
async function init() {
  cacheElements()
  await loadData()
  applyTheme()
  setupBackground()
  setupClock()
  setupEventListeners()
  render()
}

/**
 * Cache DOM elements for performance
 */
function cacheElements() {
  // Background
  elements.background = document.getElementById("background")

  // Clock
  elements.hours = document.querySelector("#hours .digit")
  elements.minutes = document.querySelector("#minutes .digit")
  elements.seconds = document.querySelector("#seconds .digit")
  elements.dateDisplay = document.getElementById("date-display")
  elements.modeToggle = document.getElementById("mode-toggle")
  elements.modeLabel = document.getElementById("mode-label")
  elements.clockIcon = document.getElementById("clock-icon")
  elements.timerIcon = document.getElementById("timer-icon")
  elements.timerControls = document.getElementById("timer-controls")
  elements.motivationalText = document.getElementById("motivational-text")
  elements.btnStart = document.getElementById("btn-start")
  elements.btnPause = document.getElementById("btn-pause")
  elements.btnReset = document.getElementById("btn-reset")

  // Theme
  elements.btnThemeToggle = document.getElementById("btn-theme-toggle")
  elements.themeIconSun = document.getElementById("theme-icon-sun")
  elements.themeIconMoon = document.getElementById("theme-icon-moon")

  // Task widget
  elements.completedCount = document.getElementById("completed-count")
  elements.totalCount = document.getElementById("total-count")
  elements.progressFill = document.getElementById("progress-fill")
  elements.progressThumb = document.getElementById("progress-thumb")
  elements.startTime = document.getElementById("start-time")
  elements.endTime = document.getElementById("end-time")
  elements.currentTaskText = document.getElementById("current-task-text")
  elements.currentTaskBadges = document.getElementById("current-task-badges")
  elements.btnPrevTask = document.getElementById("btn-prev-task")
  elements.btnNextTask = document.getElementById("btn-next-task")
  elements.btnCompleteTask = document.getElementById("btn-complete-task")

  // Task list
  elements.taskList = document.getElementById("task-list")
  elements.taskCount = document.getElementById("task-count")
  elements.tasksDone = document.getElementById("tasks-done")

  // Calendar
  elements.currentMonth = document.getElementById("current-month")
  elements.calendarDays = document.getElementById("calendar-days")
  elements.todayEvents = document.getElementById("today-events")
  elements.btnPrevMonth = document.getElementById("btn-prev-month")
  elements.btnNextMonth = document.getElementById("btn-next-month")

  // Buttons
  elements.btnAddTask = document.getElementById("btn-add-task")
  elements.btnAddEvent = document.getElementById("btn-add-event")
  elements.btnFilter = document.getElementById("btn-filter")
  elements.btnSettings = document.getElementById("btn-settings")
  elements.btnCategoryManager = document.getElementById("btn-category-manager")
  elements.btnReminderSettings = document.getElementById("btn-reminder-settings")

  // Modals
  elements.modalAddTask = document.getElementById("modal-add-task")
  elements.modalAddEvent = document.getElementById("modal-add-event")
  elements.modalCategories = document.getElementById("modal-categories")
  elements.modalSettings = document.getElementById("modal-settings")
  elements.modalFilter = document.getElementById("modal-filter")

  // Form inputs
  elements.taskText = document.getElementById("task-text")
  elements.taskCategory = document.getElementById("task-category")
  elements.taskDueDate = document.getElementById("task-due-date")
  elements.taskReminder = document.getElementById("task-reminder")
  elements.btnSaveTask = document.getElementById("btn-save-task")

  elements.eventTitle = document.getElementById("event-title")
  elements.eventDate = document.getElementById("event-date")
  elements.eventStart = document.getElementById("event-start")
  elements.eventEnd = document.getElementById("event-end")
  elements.eventStatus = document.getElementById("event-status")
  elements.btnSaveEvent = document.getElementById("btn-save-event")

  // Settings
  elements.backgroundFit = document.getElementById("background-fit")
  elements.backgroundUpload = document.getElementById("background-upload")
  elements.backgroundRotation = document.getElementById("background-rotation")
  elements.autoDeleteCompleted = document.getElementById("auto-delete-completed")
  elements.remindersEnabled = document.getElementById("reminders-enabled")
  elements.reminderTime = document.getElementById("reminder-time")
  elements.btnExportData = document.getElementById("btn-export-data")
  elements.btnImportData = document.getElementById("btn-import-data")
  elements.importFile = document.getElementById("import-file")

  // Categories
  elements.categoriesList = document.getElementById("categories-list")
  elements.newCategoryName = document.getElementById("new-category-name")
  elements.newCategoryColor = document.getElementById("new-category-color")
  elements.btnAddCategory = document.getElementById("btn-add-category")

  // Filters
  elements.categoryFilters = document.getElementById("category-filters")
  elements.dateFilter = document.getElementById("date-filter")
  elements.btnApplyFilter = document.getElementById("btn-apply-filter")
}

/**
 * Load data from storage
 */
async function loadData() {
  const data = await loadAppData()

  state.tasks = data.tasks || []
  state.categories = data.categories || []
  state.events = data.events || []
  state.customBackgroundImage = data.customBackgroundImage
  state.backgroundFitMode = data.backgroundFitMode || "cover"
  state.backgroundIndex = data.backgroundIndex || 0
  state.reminderSettings = data.reminderSettings || { enabled: true, reminderTime: 30 }
  state.autoDeleteCompleted = data.autoDeleteCompleted || false
  state.theme = data.theme || "dark"

  // Find first uncompleted task
  const uncompletedIndex = state.tasks.findIndex((t) => !t.completed)
  state.currentTaskIndex = uncompletedIndex !== -1 ? uncompletedIndex : 0
}

/**
 * Save data to storage
 */
async function saveData() {
  await saveAppData({
    tasks: state.tasks,
    categories: state.categories,
    events: state.events,
    customBackgroundImage: state.customBackgroundImage,
    backgroundFitMode: state.backgroundFitMode,
    backgroundIndex: state.backgroundIndex,
    reminderSettings: state.reminderSettings,
    autoDeleteCompleted: state.autoDeleteCompleted,
    theme: state.theme,
  })
}

/**
 * Apply theme
 */
function applyTheme() {
  document.body.classList.toggle("dark", state.theme === "dark")

  if (state.theme === "dark") {
    elements.themeIconSun.classList.add("hidden")
    elements.themeIconMoon.classList.remove("hidden")
  } else {
    elements.themeIconSun.classList.remove("hidden")
    elements.themeIconMoon.classList.add("hidden")
  }
}

/**
 * Toggle theme
 */
function toggleTheme() {
  state.theme = state.theme === "dark" ? "light" : "dark"
  applyTheme()
  saveData()
}

/**
 * Setup background
 */
function setupBackground() {
  let bgUrl

  if (state.customBackgroundImage) {
    bgUrl = state.customBackgroundImage
  } else {
    const bgPath = getRotatingBackground(state.backgroundIndex)
    bgUrl = browser.runtime.getURL(bgPath)
  }

  elements.background.style.backgroundImage = `url("${bgUrl}")`

  // Apply fit mode
  elements.background.className = "win11-background"
  if (state.backgroundFitMode !== "cover") {
    elements.background.classList.add(`${state.backgroundFitMode}-mode`)
  }
}

/**
 * Setup clock
 */
function setupClock() {
  updateClock()
  setInterval(updateClock, 1000)
}

/**
 * Update clock display
 */
function updateClock() {
  if (state.isTimerMode) {
    updateTimer()
  } else {
    const now = new Date()
    elements.hours.textContent = now.getHours().toString().padStart(2, "0")
    elements.minutes.textContent = now.getMinutes().toString().padStart(2, "0")
    elements.seconds.textContent = now.getSeconds().toString().padStart(2, "0")

    // Update date
    const options = { weekday: "short", day: "2-digit", month: "short", year: "numeric" }
    elements.dateDisplay.textContent = now.toLocaleDateString("en-US", options)
  }
}

/**
 * Update timer display
 */
function updateTimer() {
  if (state.timerRunning) {
    const now = Date.now()
    const startTime = state.timerStartTime || now
    const elapsedSeconds = Math.floor((now - startTime) / 1000) + state.timerPausedElapsed
    state.timerSeconds = elapsedSeconds
  }

  const hours = Math.floor(state.timerSeconds / 3600)
    .toString()
    .padStart(2, "0")
  const minutes = Math.floor((state.timerSeconds % 3600) / 60)
    .toString()
    .padStart(2, "0")
  const seconds = (state.timerSeconds % 60).toString().padStart(2, "0")

  elements.hours.textContent = hours
  elements.minutes.textContent = minutes
  elements.seconds.textContent = seconds
}

/**
 * Toggle timer mode
 */
function toggleTimerMode() {
  state.isTimerMode = !state.isTimerMode

  if (state.isTimerMode) {
    // Reset timer when switching to timer mode
    state.timerRunning = false
    state.timerSeconds = 0
    state.timerStartTime = null
    state.timerPausedElapsed = 0

    elements.timerControls.classList.remove("hidden")
    elements.motivationalText.classList.add("hidden")
    elements.dateDisplay.classList.add("hidden")
    elements.modeLabel.textContent = "Timer Mode"
    elements.clockIcon.classList.remove("active")
    elements.timerIcon.classList.add("active")

    elements.btnStart.classList.remove("hidden")
    elements.btnPause.classList.add("hidden")
    elements.btnReset.disabled = true
  } else {
    elements.timerControls.classList.add("hidden")
    elements.motivationalText.classList.remove("hidden")
    elements.dateDisplay.classList.remove("hidden")
    elements.modeLabel.textContent = "Clock Mode"
    elements.clockIcon.classList.add("active")
    elements.timerIcon.classList.remove("active")
  }

  updateClock()
}

/**
 * Start timer
 */
function startTimer() {
  state.timerRunning = true
  state.timerStartTime = Date.now()

  elements.btnStart.classList.add("hidden")
  elements.btnPause.classList.remove("hidden")
  elements.btnReset.disabled = false
}

/**
 * Pause timer
 */
function pauseTimer() {
  state.timerRunning = false
  state.timerPausedElapsed = state.timerSeconds

  elements.btnStart.classList.remove("hidden")
  elements.btnPause.classList.add("hidden")
}

/**
 * Reset timer
 */
function resetTimer() {
  state.timerRunning = false
  state.timerSeconds = 0
  state.timerStartTime = null
  state.timerPausedElapsed = 0

  elements.btnStart.classList.remove("hidden")
  elements.btnPause.classList.add("hidden")
  elements.btnReset.disabled = true

  updateTimer()
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Theme toggle
  elements.btnThemeToggle.addEventListener("click", toggleTheme)

  // Timer mode toggle
  elements.modeToggle.addEventListener("change", toggleTimerMode)

  // Timer controls
  elements.btnStart.addEventListener("click", startTimer)
  elements.btnPause.addEventListener("click", pauseTimer)
  elements.btnReset.addEventListener("click", resetTimer)

  // Task navigation
  elements.btnPrevTask.addEventListener("click", prevTask)
  elements.btnNextTask.addEventListener("click", nextTask)
  elements.btnCompleteTask.addEventListener("click", completeCurrentTask)

  // Calendar navigation
  elements.btnPrevMonth.addEventListener("click", prevMonth)
  elements.btnNextMonth.addEventListener("click", nextMonth)

  // Modal triggers
  elements.btnAddTask.addEventListener("click", () => openModal("modal-add-task"))
  elements.btnAddEvent.addEventListener("click", () => openModal("modal-add-event"))
  elements.btnFilter.addEventListener("click", () => openModal("modal-filter"))
  elements.btnSettings.addEventListener("click", () => {
    populateSettingsForm()
    openModal("modal-settings")
  })
  elements.btnCategoryManager.addEventListener("click", () => {
    renderCategories()
    openModal("modal-categories")
  })

  // Modal close buttons
  document.querySelectorAll(".modal-close, .modal-backdrop").forEach((el) => {
    el.addEventListener("click", closeAllModals)
  })

  // Prevent modal content clicks from closing
  document.querySelectorAll(".modal-content").forEach((el) => {
    el.addEventListener("click", (e) => e.stopPropagation())
  })

  // Form submissions
  elements.btnSaveTask.addEventListener("click", addTask)
  elements.btnSaveEvent.addEventListener("click", addEvent)
  elements.btnAddCategory.addEventListener("click", addCategory)
  elements.btnApplyFilter.addEventListener("click", applyFilters)

  // Settings
  elements.backgroundFit.addEventListener("change", updateBackgroundFit)
  elements.backgroundUpload.addEventListener("change", handleBackgroundUpload)
  elements.autoDeleteCompleted.addEventListener("change", updateAutoDelete)
  elements.remindersEnabled.addEventListener("change", updateReminderSettings)
  elements.reminderTime.addEventListener("change", updateReminderSettings)
  elements.btnExportData.addEventListener("click", exportData)
  elements.btnImportData.addEventListener("click", () => elements.importFile.click())
  elements.importFile.addEventListener("change", handleImport)

  // Keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAllModals()
  })
}

/**
 * Open modal
 */
function openModal(modalId) {
  document.getElementById(modalId).classList.remove("hidden")

  // Pre-fill date inputs with today
  if (modalId === "modal-add-task") {
    elements.taskDueDate.value = new Date().toISOString().split("T")[0]
    populateCategorySelect()
  } else if (modalId === "modal-add-event") {
    elements.eventDate.value = new Date().toISOString().split("T")[0]
  } else if (modalId === "modal-filter") {
    renderFilterCategories()
  }
}

/**
 * Close all modals
 */
function closeAllModals() {
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.classList.add("hidden")
  })

  // Clear form inputs
  elements.taskText.value = ""
  elements.taskCategory.value = ""
  elements.taskReminder.checked = false
  elements.eventTitle.value = ""
}

/**
 * Populate category select
 */
function populateCategorySelect() {
  elements.taskCategory.innerHTML = '<option value="">No category</option>'

  state.categories.forEach((cat) => {
    const option = document.createElement("option")
    option.value = cat.id
    option.textContent = cat.name
    elements.taskCategory.appendChild(option)
  })
}

/**
 * Populate settings form
 */
function populateSettingsForm() {
  elements.backgroundFit.value = state.backgroundFitMode
  elements.autoDeleteCompleted.checked = state.autoDeleteCompleted
  elements.remindersEnabled.checked = state.reminderSettings.enabled
  elements.reminderTime.value = state.reminderSettings.reminderTime.toString()
}

/**
 * Add task
 */
function addTask() {
  const text = elements.taskText.value.trim()
  if (!text) return

  const task = {
    id: Date.now(),
    text,
    completed: false,
    categoryId: elements.taskCategory.value || null,
    dueDate: elements.taskDueDate.value || null,
    hasReminder: elements.taskReminder.checked && !!elements.taskDueDate.value,
  }

  state.tasks.push(task)
  saveData()
  render()
  closeAllModals()
}

/**
 * Toggle task completion
 */
function toggleTask(taskId) {
  const task = state.tasks.find((t) => t.id === taskId)
  if (!task) return

  task.completed = !task.completed

  if (state.autoDeleteCompleted && task.completed) {
    setTimeout(() => {
      state.tasks = state.tasks.filter((t) => t.id !== taskId)
      saveData()
      render()
    }, 1000)
  }

  saveData()
  render()
}

/**
 * Navigate to previous task
 */
function prevTask() {
  if (state.tasks.length === 0) return
  state.currentTaskIndex = state.currentTaskIndex === 0 ? state.tasks.length - 1 : state.currentTaskIndex - 1
  renderTaskWidget()
}

/**
 * Navigate to next task
 */
function nextTask() {
  if (state.tasks.length === 0) return
  state.currentTaskIndex = state.currentTaskIndex === state.tasks.length - 1 ? 0 : state.currentTaskIndex + 1
  renderTaskWidget()
}

/**
 * Complete current task
 */
function completeCurrentTask() {
  if (state.tasks.length === 0) return
  const task = getFilteredTasks()[state.currentTaskIndex]
  if (task) {
    toggleTask(task.id)
  }
}

/**
 * Add event
 */
function addEvent() {
  const title = elements.eventTitle.value.trim()
  if (!title) return

  const event = {
    id: Date.now().toString(),
    title,
    date: elements.eventDate.value || new Date().toISOString().split("T")[0],
    startTime: elements.eventStart.value || "09:00",
    endTime: elements.eventEnd.value || "10:00",
    status: elements.eventStatus.value || "online",
  }

  state.events.push(event)
  saveData()
  renderCalendar()
  closeAllModals()
}

/**
 * Add category
 */
function addCategory() {
  const name = elements.newCategoryName.value.trim()
  if (!name) return

  const category = {
    id: Date.now().toString(),
    name,
    color: elements.newCategoryColor.value,
  }

  state.categories.push(category)
  saveData()
  renderCategories()

  elements.newCategoryName.value = ""
  elements.newCategoryColor.value = "#FF9500"
}

/**
 * Delete category
 */
function deleteCategory(categoryId) {
  state.categories = state.categories.filter((c) => c.id !== categoryId)
  state.tasks = state.tasks.map((t) => (t.categoryId === categoryId ? { ...t, categoryId: null } : t))

  if (state.categoryFilter === categoryId) {
    state.categoryFilter = null
  }

  saveData()
  renderCategories()
  render()
}

/**
 * Navigate to previous month
 */
function prevMonth() {
  if (state.selectedMonth === 0) {
    state.selectedMonth = 11
    state.selectedYear--
  } else {
    state.selectedMonth--
  }
  renderCalendar()
}

/**
 * Navigate to next month
 */
function nextMonth() {
  if (state.selectedMonth === 11) {
    state.selectedMonth = 0
    state.selectedYear++
  } else {
    state.selectedMonth++
  }
  renderCalendar()
}

/**
 * Get filtered tasks
 */
function getFilteredTasks() {
  let filtered = [...state.tasks]

  // Category filter
  if (state.categoryFilter) {
    filtered = filtered.filter((t) => t.categoryId === state.categoryFilter)
  }

  // Date filter
  if (state.dateFilter !== "all") {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const nextWeek = new Date(today)
    nextWeek.setDate(nextWeek.getDate() + 7)

    switch (state.dateFilter) {
      case "today":
        filtered = filtered.filter((t) => {
          if (!t.dueDate) return false
          const due = new Date(t.dueDate)
          return due.getTime() === today.getTime()
        })
        break
      case "tomorrow":
        filtered = filtered.filter((t) => {
          if (!t.dueDate) return false
          const due = new Date(t.dueDate)
          return due.getTime() === tomorrow.getTime()
        })
        break
      case "upcoming":
        filtered = filtered.filter((t) => {
          if (!t.dueDate) return false
          const due = new Date(t.dueDate)
          return due >= today && due <= nextWeek
        })
        break
      case "overdue":
        filtered = filtered.filter((t) => {
          if (!t.dueDate) return false
          const due = new Date(t.dueDate)
          return due < today
        })
        break
      case "no-date":
        filtered = filtered.filter((t) => !t.dueDate)
        break
    }
  }

  return filtered
}

/**
 * Apply filters
 */
function applyFilters() {
  state.dateFilter = elements.dateFilter.value

  // Get active category chip
  const activeChip = elements.categoryFilters.querySelector(".chip.active")
  const filterValue = activeChip ? activeChip.dataset.filter : "all"
  state.categoryFilter = filterValue === "all" ? null : filterValue

  render()
  closeAllModals()
}

/**
 * Render filter categories
 */
function renderFilterCategories() {
  elements.categoryFilters.innerHTML = '<button class="chip active" data-filter="all">All</button>'

  state.categories.forEach((cat) => {
    const chip = document.createElement("button")
    chip.className = "chip"
    chip.dataset.filter = cat.id
    chip.style.backgroundColor = cat.color
    chip.style.color = "white"
    chip.textContent = cat.name

    if (state.categoryFilter === cat.id) {
      chip.classList.add("active")
      elements.categoryFilters.querySelector('[data-filter="all"]').classList.remove("active")
    }

    chip.addEventListener("click", () => {
      elements.categoryFilters.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"))
      chip.classList.add("active")
    })

    elements.categoryFilters.appendChild(chip)
  })

  // Add click handler to "All" chip
  elements.categoryFilters.querySelector('[data-filter="all"]').addEventListener("click", function () {
    elements.categoryFilters.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"))
    this.classList.add("active")
  })

  elements.dateFilter.value = state.dateFilter
}

/**
 * Update background fit mode
 */
function updateBackgroundFit() {
  state.backgroundFitMode = elements.backgroundFit.value
  setupBackground()
  saveData()
}

/**
 * Handle background upload
 */
function handleBackgroundUpload(e) {
  const file = e.target.files[0]
  if (!file) return

  if (file.size > 5 * 1024 * 1024) {
    alert("Image is too large. Please select an image under 5MB.")
    return
  }

  const reader = new FileReader()
  reader.onload = (event) => {
    state.customBackgroundImage = event.target.result
    setupBackground()
    saveData()
  }
  reader.readAsDataURL(file)
}

/**
 * Update auto-delete setting
 */
function updateAutoDelete() {
  state.autoDeleteCompleted = elements.autoDeleteCompleted.checked
  saveData()
}

/**
 * Update reminder settings
 */
function updateReminderSettings() {
  state.reminderSettings = {
    enabled: elements.remindersEnabled.checked,
    reminderTime: Number.parseInt(elements.reminderTime.value, 10),
  }
  saveData()
}

/**
 * Handle data import
 */
async function handleImport(e) {
  const file = e.target.files[0]
  if (!file) return

  try {
    const data = await importData(file)
    state = { ...state, ...data }
    applyTheme()
    setupBackground()
    render()
    alert("Data imported successfully!")
  } catch (err) {
    alert("Failed to import data. Please check the file format.")
  }

  e.target.value = ""
}

/**
 * Render all components
 */
function render() {
  renderTaskWidget()
  renderTaskList()
  renderCalendar()
}

/**
 * Render task widget
 */
function renderTaskWidget() {
  const tasks = getFilteredTasks()
  const completedCount = tasks.filter((t) => t.completed).length
  const totalCount = tasks.length

  elements.completedCount.textContent = completedCount
  elements.totalCount.textContent = totalCount

  // Progress bar
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0
  elements.progressFill.style.width = `${progress}%`
  elements.progressThumb.style.left = `${progress}%`

  // Time range
  const now = new Date()
  const endTime = new Date(now.getTime() + 15 * 60000)
  elements.startTime.textContent = formatTime(now)
  elements.endTime.textContent = formatTime(endTime)

  // Current task
  if (tasks.length > 0 && state.currentTaskIndex < tasks.length) {
    const task = tasks[state.currentTaskIndex]
    elements.currentTaskText.textContent = task.text

    // Badges
    elements.currentTaskBadges.innerHTML = ""

    if (task.categoryId) {
      const cat = state.categories.find((c) => c.id === task.categoryId)
      if (cat) {
        const badge = createBadge(cat.name, cat.color)
        elements.currentTaskBadges.appendChild(badge)

        // Update progress bar color
        elements.progressFill.style.backgroundColor = cat.color
        elements.progressThumb.style.backgroundColor = cat.color
        elements.btnCompleteTask.style.backgroundColor = cat.color
      }
    }

    if (task.dueDate) {
      const dueBadge = createDueDateBadge(task.dueDate)
      elements.currentTaskBadges.appendChild(dueBadge)
    }
  } else {
    elements.currentTaskText.textContent = "No tasks"
    elements.currentTaskBadges.innerHTML = ""
  }
}

/**
 * Render task list
 */
function renderTaskList() {
  const tasks = getFilteredTasks()
  const visibleTasks = state.autoDeleteCompleted ? tasks.filter((t) => !t.completed) : tasks
  const completedCount = tasks.filter((t) => t.completed).length

  elements.taskCount.textContent = visibleTasks.length
  elements.tasksDone.textContent = `${completedCount} OF ${tasks.length} IS DONE`

  // Sort by due date
  const sortedTasks = [...visibleTasks].sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return 0
    if (!a.dueDate) return 1
    if (!b.dueDate) return -1
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  })

  elements.taskList.innerHTML = ""

  if (sortedTasks.length === 0) {
    elements.taskList.innerHTML =
      '<li class="task-item"><span class="task-text" style="color: var(--muted-foreground);">No tasks yet</span></li>'
    return
  }

  sortedTasks.forEach((task) => {
    const li = document.createElement("li")
    li.className = "task-item"

    const category = task.categoryId ? state.categories.find((c) => c.id === task.categoryId) : null

    li.innerHTML = `
      <div class="task-content">
        <button class="task-checkbox ${task.completed ? "completed" : ""}" 
                style="${category && !task.completed ? `border-color: ${category.color}` : ""}"
                data-task-id="${task.id}">
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 4L3.5 6.5L9 1" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <span class="task-text ${task.completed ? "completed" : ""}">${escapeHtml(task.text)}</span>
      </div>
      <div class="task-meta">
        ${category ? `<span class="badge category-badge" style="background-color: ${category.color}">${escapeHtml(category.name)}</span>` : ""}
        ${task.dueDate ? createDueDateBadgeHtml(task.dueDate) : ""}
        ${task.hasReminder && task.dueDate ? '<span class="badge reminder-badge">⏰ Reminder</span>' : ""}
      </div>
    `

    // Add click handler
    li.querySelector(".task-checkbox").addEventListener("click", () => toggleTask(task.id))

    elements.taskList.appendChild(li)
  })
}

/**
 * Render calendar
 */
function renderCalendar() {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  elements.currentMonth.textContent = `${monthNames[state.selectedMonth]} ${state.selectedYear}`

  // Generate calendar days
  const daysInMonth = new Date(state.selectedYear, state.selectedMonth + 1, 0).getDate()
  const firstDayOfMonth = new Date(state.selectedYear, state.selectedMonth, 1).getDay()

  const today = new Date()

  elements.calendarDays.innerHTML = ""

  // Blank days
  for (let i = 0; i < firstDayOfMonth; i++) {
    const blank = document.createElement("div")
    blank.className = "calendar-day empty"
    elements.calendarDays.appendChild(blank)
  }

  // Days of month
  for (let day = 1; day <= daysInMonth; day++) {
    const dayEl = document.createElement("div")
    dayEl.className = "calendar-day"
    dayEl.textContent = day

    // Check if today
    const isToday =
      day === today.getDate() && state.selectedMonth === today.getMonth() && state.selectedYear === today.getFullYear()

    if (isToday) {
      dayEl.classList.add("today")
    }

    // Check if has events
    const hasEvents = state.events.some((event) => {
      const eventDate = new Date(event.date)
      return (
        eventDate.getDate() === day &&
        eventDate.getMonth() === state.selectedMonth &&
        eventDate.getFullYear() === state.selectedYear
      )
    })

    if (hasEvents && !isToday) {
      dayEl.classList.add("has-events")
    }

    elements.calendarDays.appendChild(dayEl)
  }

  // Today's events
  const todayEvents = state.events
    .filter((event) => {
      const eventDate = new Date(event.date)
      return (
        eventDate.getDate() === today.getDate() &&
        eventDate.getMonth() === today.getMonth() &&
        eventDate.getFullYear() === today.getFullYear()
      )
    })
    .sort((a, b) => a.startTime.localeCompare(b.startTime))

  if (todayEvents.length === 0) {
    elements.todayEvents.innerHTML = '<p class="no-events">No events today</p>'
  } else {
    elements.todayEvents.innerHTML = todayEvents
      .map(
        (event) => `
      <div class="event-item">
        <h4 class="event-title">${escapeHtml(event.title)}</h4>
        <div class="event-meta">
          <span class="event-status-dot ${event.status}"></span>
          <span>${event.status}</span>
          <span>·</span>
          <span>${event.startTime}-${event.endTime}</span>
        </div>
      </div>
    `,
      )
      .join("")
  }
}

/**
 * Render categories in manager
 */
function renderCategories() {
  if (state.categories.length === 0) {
    elements.categoriesList.innerHTML =
      '<p style="color: var(--muted-foreground); font-size: 0.875rem;">No categories yet</p>'
    return
  }

  elements.categoriesList.innerHTML = state.categories
    .map(
      (cat) => `
    <div class="category-item">
      <div class="category-info">
        <span class="category-color" style="background-color: ${cat.color}"></span>
        <span class="category-name">${escapeHtml(cat.name)}</span>
      </div>
      <button class="category-delete" data-category-id="${cat.id}" title="Delete category">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
      </button>
    </div>
  `,
    )
    .join("")

  // Add delete handlers
  elements.categoriesList.querySelectorAll(".category-delete").forEach((btn) => {
    btn.addEventListener("click", () => deleteCategory(btn.dataset.categoryId))
  })
}

/**
 * Helper: Format time
 */
function formatTime(date) {
  return date
    .toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    .toLowerCase()
}

/**
 * Helper: Create badge element
 */
function createBadge(text, color) {
  const badge = document.createElement("span")
  badge.className = "badge category-badge"
  badge.style.backgroundColor = color
  badge.textContent = text
  return badge
}

/**
 * Helper: Create due date badge
 */
function createDueDateBadge(dueDate) {
  const badge = document.createElement("span")
  badge.className = "badge due-date-badge"

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate)

  if (due < today) {
    badge.classList.add("overdue")
  }

  badge.textContent = formatDueDate(dueDate)
  return badge
}

/**
 * Helper: Create due date badge HTML
 */
function createDueDateBadgeHtml(dueDate) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const due = new Date(dueDate)

  if (due.getTime() === today.getTime()) {
    return "Today"
  } else if (due.getTime() === tomorrow.getTime()) {
    return "Tomorrow"
  } else if (due < today) {
    return "Overdue"
  } else {
    return due.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }
}

/**
 * Helper: Escape HTML
 */
function escapeHtml(text) {
  const div = document.createElement("div")
  div.textContent = text
  return div.innerHTML
}

/**
 * Helper: Format due date
 */
function formatDueDate(dueDate) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const due = new Date(dueDate)

  if (due.getTime() === today.getTime()) {
    return "Today"
  } else if (due.getTime() === tomorrow.getTime()) {
    return "Tomorrow"
  } else if (due < today) {
    return "Overdue"
  } else {
    return due.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }
}

// Initialize app when DOM is ready
document.addEventListener("DOMContentLoaded", init)
