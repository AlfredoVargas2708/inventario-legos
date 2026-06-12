import { ref } from 'vue';

const isDark = ref(
  typeof document !== 'undefined' && document.documentElement.classList.contains('dark'),
);

function syncThemeState() {
  if (typeof document === 'undefined') return;
  isDark.value = document.documentElement.classList.contains('dark');
}

export function useTheme() {
  const toggleTheme = () => {
    if (typeof document === 'undefined') return;

    document.documentElement.classList.toggle('dark');
    syncThemeState();
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light');
  };

  const initializeTheme = () => {
    if (typeof document === 'undefined') return;

    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (savedTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else if (prefersDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    syncThemeState();
  };

  return {
    isDark,
    toggleTheme,
    initializeTheme,
  };
}
