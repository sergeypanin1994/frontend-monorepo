import { Address, parseUnits } from 'viem'
import { Pool } from '../../usePool'
import { useTokenApprovalSteps } from '@/lib/modules/tokens/approvals/useTokenApprovalSteps'
import { RawAmount } from '@/lib/modules/tokens/approvals/approval-rules'
import { BPT_DECIMALS } from '../../pool.constants'
import { useMemo } from 'react'
import { useStakingStep } from './useStakingStep'
import { HumanTokenAmountWithAddress } from '@/lib/modules/tokens/token.types'

export function useStakingSteps(
  pool: Pool,
  humanAmountToApprove: HumanTokenAmountWithAddress | null
) {
  const rawAmount = parseUnits(humanAmountToApprove?.humanAmount || '', BPT_DECIMALS)

  const amountToApprove: RawAmount = {
    rawAmount,
    address: pool.address as Address,
  }
  const { isLoading: isLoadingTokenApprovalSteps, steps: tokenApprovalSteps } =
    useTokenApprovalSteps({
      spenderAddress: pool.staking?.address as Address,
      chain: pool.chain,
      approvalAmounts: [amountToApprove],
      actionType: 'Staking',
      bptSymbol: pool.symbol,
    })

  const stakingStep = useStakingStep(pool, rawAmount)

  const steps = useMemo(
    () => [...tokenApprovalSteps, stakingStep],
    [tokenApprovalSteps, stakingStep]
  )

  return {
    isLoadingSteps: isLoadingTokenApprovalSteps,
    steps,
  }
}