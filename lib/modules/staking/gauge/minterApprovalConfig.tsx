import { TransactionStepButton } from '@/lib/shared/components/btns/transaction-steps/TransactionStepButton'
import { MinterStepProps, OnStepCompleted, StepConfig } from '../../pool/actions/useIterateSteps'
import { useConstructMinterApprovalStep } from './useConstructMinterApprovalStep'
import { VStack } from '@chakra-ui/react'
import { GqlChain } from '@/lib/shared/services/api/generated/graphql'

export function minterApprovalConfig(chain: GqlChain): StepConfig {
  return {
    render(useOnStepCompleted: OnStepCompleted) {
      return <MinterApprovalButton useOnStepCompleted={useOnStepCompleted} chain={chain} />
    },
  }
}

function MinterApprovalButton({ useOnStepCompleted }: MinterStepProps) {
  const step = useConstructMinterApprovalStep()

  useOnStepCompleted(step)

  return (
    <VStack w="full">
      <TransactionStepButton step={step} />
    </VStack>
  )
}
