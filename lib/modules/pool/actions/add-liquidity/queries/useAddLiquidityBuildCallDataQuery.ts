'use client'

import { useUserSettings } from '@/lib/modules/user/settings/useUserSettings'
import { useTokenAllowances } from '@/lib/modules/web3/useTokenAllowances'
import { useUserAccount } from '@/lib/modules/web3/useUserAccount'
import { Dictionary } from 'lodash'
import { useQuery } from 'wagmi'
import { HumanAmountIn } from '../../liquidity-types'
import { AddLiquidityHandler } from '../handlers/AddLiquidity.handler'
import { addLiquidityKeys } from './add-liquidity-keys'

// Uses the SDK to build a transaction config to be used by wagmi's useManagedSendTransaction
export function useAddLiquidityBuildCallDataQuery(
  handler: AddLiquidityHandler,
  humanAmountsIn: HumanAmountIn[],
  isActiveStep: boolean,
  poolId: string
) {
  const { userAddress, isConnected } = useUserAccount()
  const { slippage } = useUserSettings()

  const { allowances } = useTokenAllowances()

  const addLiquidityQuery = useQuery(
    addLiquidityKeys.buildCallData({
      userAddress,
      slippage,
      poolId,
      humanAmountsIn,
    }),
    async () => {
      const inputs = {
        humanAmountsIn,
        account: userAddress,
        slippagePercent: slippage,
      }
      return handler.buildAddLiquidityTx({ inputs })
    },
    {
      enabled:
        isActiveStep && // If the step is not active (the user did not click Next button) avoid running the build tx query to save RPC requests
        isConnected &&
        allowances &&
        hasTokenAllowance(allowances),
    }
  )

  return addLiquidityQuery
}

function hasTokenAllowance(tokenAllowances: Dictionary<bigint>) {
  if (!tokenAllowances) return false
  if (Object.values(tokenAllowances).length === 0) return false
  // TODO: depending on the user humanAmountsIn this rule will be different
  // Here we will check that the user has enough allowance for the current Join operation
  return Object.values(tokenAllowances).every(a => a > 0n)
}