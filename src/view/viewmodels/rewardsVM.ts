import { useShellStore } from '../../shared/store/useShellStore'

export function useRewardsVM() {
  const pointsBalance = useShellStore((s) => s.pointsBalance)
  const rewards = useShellStore((s) => s.rewards)
  const addReward = useShellStore((s) => s.addReward)
  const removeReward = useShellStore((s) => s.removeReward)
  const redeemReward = useShellStore((s) => s.redeemReward)
  const redemptionHistory = useShellStore((s) => s.redemptionHistory)

  return {
    pointsBalance,
    rewards,
    addReward,
    removeReward,
    redeemReward,
    redemptionHistory,
  }
}
