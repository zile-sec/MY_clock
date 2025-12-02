const { contextBridge, ipcRenderer } = require("electron")

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electron", {
  getAppPath: () => ipcRenderer.invoke("get-app-path"),
  saveData: (data) => ipcRenderer.invoke("save-data", data),
  loadData: () => ipcRenderer.invoke("load-data"),
  sendNotification: (title, body) => ipcRenderer.invoke("send-notification", title, body),
  checkReminders: () => ipcRenderer.invoke("check-reminders"),
})
