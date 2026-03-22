import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { fetchBlocks } from '../services/quizService';
import {
  getOrCreateDeviceId,
  getStoredLeaderboard,
  getStoredProfile,
  getStoredProgress,
  saveLeaderboard,
  saveProfile,
  saveProgress,
} from '../utils/storage';
import { getRankByScore } from '../utils/scoring';

const AppContext = createContext(null);

const demoLeaderboard = [
  { id: 'demo-1', name: 'Арина', score: 90, rank: 'Главный следователь', blockTitle: 'Блок 1. Шифры ведомств', date: '2026-03-18' },
  { id: 'demo-2', name: 'Илья', score: 80, rank: 'Старший инспектор', blockTitle: 'Блок 1. Шифры ведомств', date: '2026-03-17' },
  { id: 'demo-3', name: 'София', score: 70, rank: 'Старший инспектор', blockTitle: 'Блок 1. Шифры ведомств', date: '2026-03-16' },
];

export function AppProvider({ children }) {
  const [deviceId, setDeviceId] = useState('');
  const [profile, setProfile] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [blocksLoading, setBlocksLoading] = useState(true);
  const [progress, setProgress] = useState({});
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    const currentDeviceId = getOrCreateDeviceId();
    setDeviceId(currentDeviceId);
    setProfile(getStoredProfile());
    setProgress(getStoredProgress());

    const storedLeaderboard = getStoredLeaderboard();
    setLeaderboard(storedLeaderboard.length ? storedLeaderboard : demoLeaderboard);
  }, []);

  useEffect(() => {
    let active = true;

    async function loadBlocks() {
      setBlocksLoading(true);
      const response = await fetchBlocks();
      if (active) {
        setBlocks(response);
        setBlocksLoading(false);
      }
    }

    loadBlocks();

    return () => {
      active = false;
    };
  }, []);

  const registerProfile = (name) => {
    const ensuredDeviceId = deviceId || getOrCreateDeviceId();
    const nextProfile = {
      deviceId: ensuredDeviceId,
      name,
      createdAt: new Date().toISOString(),
    };

    setDeviceId(ensuredDeviceId);
    setProfile(nextProfile);
    saveProfile(nextProfile);
  };

  const saveBlockResult = ({ blockId, blockTitle, score, percentage, correctCount, totalQuestions }) => {
    const rank = getRankByScore(score);
    const completedAt = new Date().toISOString();
    const nextProgress = {
      ...progress,
      [blockId]: {
        blockId,
        blockTitle,
        score,
        percentage,
        correctCount,
        totalQuestions,
        rank,
        completedAt,
      },
    };

    const nextLeaderboard = [
      ...leaderboard.filter((entry) => !(entry.deviceId === ensuredDeviceIdFrom(profile, deviceId) && entry.blockId === blockId)),
      {
        id: `${ensuredDeviceIdFrom(profile, deviceId)}-${blockId}`,
        deviceId: ensuredDeviceIdFrom(profile, deviceId),
        blockId,
        name: profile?.name || 'Участник',
        blockTitle,
        score,
        rank,
        date: completedAt.slice(0, 10),
      },
    ].sort((a, b) => b.score - a.score);

    setProgress(nextProgress);
    setLeaderboard(nextLeaderboard);
    saveProgress(nextProgress);
    saveLeaderboard(nextLeaderboard);

    return nextProgress[blockId];
  };

  const totalScore = Object.values(progress).reduce((sum, item) => sum + item.score, 0);
  const overallRank = getRankByScore(totalScore);

  const value = useMemo(
    () => ({
      deviceId,
      profile,
      blocks,
      blocksLoading,
      progress,
      leaderboard,
      totalScore,
      overallRank,
      registerProfile,
      saveBlockResult,
    }),
    [deviceId, profile, blocks, blocksLoading, progress, leaderboard, totalScore, overallRank],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

function ensuredDeviceIdFrom(profile, deviceId) {
  return profile?.deviceId || deviceId || getOrCreateDeviceId();
}

export function useAppContext() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }

  return context;
}
