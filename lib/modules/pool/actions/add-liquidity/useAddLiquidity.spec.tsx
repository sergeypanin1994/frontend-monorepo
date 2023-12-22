import { balAddress, wETHAddress } from '@/lib/debug-helpers'
import { aTokenExpandedMock } from '@/lib/modules/tokens/__mocks__/token.builders'
import { aGqlPoolElementMock } from '@/test/msw/builders/gqlPoolElement.builders'
import { buildDefaultPoolTestProvider, testHook } from '@/test/utils/custom-renderers'
import { mainnet } from 'wagmi'
import { _useAddLiquidity } from './useAddLiquidity'
import { HumanAmount } from '@balancer/sdk'
import { HumanAmountIn } from '../liquidity-types'
import { Dictionary } from 'lodash'
import { GqlToken } from '@/lib/shared/services/api/generated/graphql'

async function testUseAddLiquidity() {
  const { result } = testHook(() => _useAddLiquidity(), {
    wrapper: buildDefaultPoolTestProvider(
      aGqlPoolElementMock({
        allTokens: [
          aTokenExpandedMock({ address: balAddress }),
          aTokenExpandedMock({ address: wETHAddress }),
        ],
      })
    ),
  })
  return result
}

test('returns amountsIn with empty input amount by default', async () => {
  const result = await testUseAddLiquidity()

  expect(result.current.humanAmountsIn).toEqual([
    {
      tokenAddress: balAddress,
      humanAmount: '',
    },
    {
      tokenAddress: wETHAddress,
      humanAmount: '',
    },
  ])
})

test('returns add liquidity helpers', async () => {
  const result = await testUseAddLiquidity()

  expect(result.current.helpers.chainId).toBe(mainnet.id)
  expect(result.current.helpers.poolTokenAddresses).toEqual([balAddress, wETHAddress])

  const humanAmountsIn: HumanAmountIn[] = [
    { tokenAddress: balAddress, humanAmount: '1' },
    { tokenAddress: wETHAddress, humanAmount: '2' },
  ]

  const tokensByAddress = {
    [balAddress]: { symbol: 'BAL' },
    [wETHAddress]: { symbol: 'WETH' },
  } as Dictionary<GqlToken>

  expect(result.current.helpers.getAmountsToApprove(humanAmountsIn, tokensByAddress))
    .toMatchInlineSnapshot(`
    [
      {
        "humanAmount": "1",
        "rawAmount": 1000000000000000000n,
        "tokenAddress": "0xba100000625a3754423978a60c9317c58a424e3d",
        "tokenSymbol": "BAL",
      },
      {
        "humanAmount": "2",
        "rawAmount": 2000000000000000000n,
        "tokenAddress": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
        "tokenSymbol": "WETH",
      },
    ]
  `)
})