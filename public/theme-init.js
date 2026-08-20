;(function () {
  var key = 'susu-portfolio-theme'
  var stored = localStorage.getItem(key)
  var theme =
    stored === 'light' || stored === 'dark'
      ? stored
      : window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
  document.documentElement.classList.toggle('dark', theme === 'dark')
  document.documentElement.style.colorScheme = theme
  document.documentElement.dataset.theme = theme
})()
