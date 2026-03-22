const STORAGE_KEYS = {
  profile: 'quiz_profile',
  deviceId: 'quiz_device_id',
  leaderboard: 'quiz_leaderboard',
  progress: 'quiz_progress',
};

function readJson(key, fallback) {
  try {
    const rawValue = window.localStorage.getItem(key);
    return rawValue ? JSON.parse(rawValue) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getOrCreateDeviceId() {
  const storedValue = window.localStorage.getItem(STORAGE_KEYS.deviceId);
  if (storedValue) {
    return storedValue;
  }

  const nextValue = `device-${crypto.randomUUID()}`;
  window.localStorage.setItem(STORAGE_KEYS.deviceId, nextValue);
  return nextValue;
}

export function getStoredProfile() {
  return readJson(STORAGE_KEYS.profile, null);
}

export function saveProfile(profile) {
  writeJson(STORAGE_KEYS.profile, profile);
}

export function getStoredProgress() {
  return readJson(STORAGE_KEYS.progress, {});
}

export function saveProgress(progress) {
  writeJson(STORAGE_KEYS.progress, progress);
}

export function getStoredLeaderboard() {
  return readJson(STORAGE_KEYS.leaderboard, []);
}

export function saveLeaderboard(entries) {
  writeJson(STORAGE_KEYS.leaderboard, entries);
}
