'use client'

import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalProps } from '@chakra-ui/react'
import { RefObject, useEffect, useRef } from 'react'
import { usePool } from '../../../PoolProvider'
import { useRemoveLiquidity } from '../RemoveLiquidityProvider'
import { RemoveLiquidityTimeout } from './RemoveLiquidityTimeout'
// eslint-disable-next-line max-len
import { getStylesForModalContentWithStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/step-tracker.utils'
import { DesktopStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/DesktopStepTracker'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { SuccessOverlay } from '@repo/lib/shared/components/modals/SuccessOverlay'
import { ActionModalFooter } from '../../../../../shared/components/modals/ActionModalFooter'
import { usePoolRedirect } from '../../../pool.hooks'
import { TransactionModalHeader } from '@repo/lib/shared/components/modals/TransactionModalHeader'
import { useResetStepIndexOnOpen } from '../../useResetStepIndexOnOpen'
import { useOnUserAccountChanged } from '@repo/lib/modules/web3/useOnUserAccountChanged'
import { RemoveLiquiditySummary } from './RemoveLiquiditySummary'
import { useRemoveLiquidityReceipt } from '@repo/lib/modules/transactions/transaction-steps/receipts/receipt.hooks'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { ProtocolVersion } from '../../../pool.types'

type Props = {
  isOpen: boolean
  onClose(): void
  onOpen(): void
  finalFocusRef?: RefObject<HTMLInputElement>
}

export function RemoveLiquidityModal({
  isOpen,
  onClose,
  finalFocusRef,
  ...rest
}: Props & Omit<ModalProps, 'children'>) {
  const { isDesktop } = useBreakpoints()
  const initialFocusRef = useRef(null)
  const { transactionSteps, removeLiquidityTxHash, urlTxHash, hasQuoteContext } =
    useRemoveLiquidity()
  const { pool, chain } = usePool()
  const { redirectToPoolPage } = usePoolRedirect(pool)
  const { userAddress } = useUserAccount()
  const { stopTokenPricePolling } = useTokens()

  const receiptProps = useRemoveLiquidityReceipt({
    chain,
    txHash: removeLiquidityTxHash,
    userAddress,
    protocolVersion: pool.protocolVersion as ProtocolVersion,
  })

  useResetStepIndexOnOpen(isOpen, transactionSteps)

  useEffect(() => {
    if (isOpen) {
      // stop polling for token prices when modal is opened to prevent unwanted re-renders
      stopTokenPricePolling()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  useEffect(() => {
    if (removeLiquidityTxHash && !window.location.pathname.includes(removeLiquidityTxHash)) {
      window.history.replaceState({}, '', `./remove-liquidity/${removeLiquidityTxHash}`)
    }
  }, [removeLiquidityTxHash])

  useOnUserAccountChanged(redirectToPoolPage)

  return (
    <Modal
      finalFocusRef={finalFocusRef}
      initialFocusRef={initialFocusRef}
      isCentered
      isOpen={isOpen}
      onClose={onClose}
      preserveScrollBarGap
      {...rest}
    >
      <SuccessOverlay startAnimation={!!removeLiquidityTxHash && hasQuoteContext} />

      <ModalContent {...getStylesForModalContentWithStepTracker(isDesktop && hasQuoteContext)}>
        {isDesktop && hasQuoteContext && (
          <DesktopStepTracker chain={pool.chain} transactionSteps={transactionSteps} />
        )}

        <TransactionModalHeader
          chain={pool.chain}
          isReceiptLoading={receiptProps.isLoading}
          label="Remove liquidity"
          timeout={<RemoveLiquidityTimeout />}
          txHash={removeLiquidityTxHash}
        />

        <ModalCloseButton />
        <ModalBody>
          <RemoveLiquiditySummary {...receiptProps} />
        </ModalBody>
        <ActionModalFooter
          currentStep={transactionSteps.currentStep}
          isSuccess={!!removeLiquidityTxHash && !receiptProps.isLoading}
          returnAction={redirectToPoolPage}
          returnLabel="Return to pool"
          urlTxHash={urlTxHash}
        />
      </ModalContent>
    </Modal>
  )
}
