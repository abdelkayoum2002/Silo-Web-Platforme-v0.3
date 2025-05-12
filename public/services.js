// notify.js

export function notify({ title, message, type = "info" }) {
  const colors = {
    info: "#3498db",
    success: "#2ecc71",
    warning: "#f39c12",
    error: "#e74c3c",
  };

  Toastify({
    text: `${title}\n${message}`,
    duration: 5000,
    gravity: "top",
    position: "right",
    backgroundColor: colors[type] || "#3498db",
    stopOnFocus: true,
  }).showToast();
}
