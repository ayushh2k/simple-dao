import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Rocket, Loader2 } from 'lucide-react'
import { ProposalCard } from './ProposalCard'

interface ProposalListProps {
  proposals: Array<{
    id: string
    description: string
    voteCount: string
    status: string
    hasVoted: boolean
    executed: boolean
  }>
  connected: boolean
  loading: boolean
  onVote: (id: string) => void
  onExecute: (id: string) => void
  loadingVoting: Set<string>
  loadingExecution: Set<string>
}

export function ProposalList({ 
  proposals, 
  connected, 
  loading, 
  onVote, 
  onExecute, 
  loadingVoting, 
  loadingExecution 
}: ProposalListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Rocket className="w-6 h-6" />
          Active Proposals
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : proposals.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No proposals found. Create one to get started!
          </div>
        ) : (
          <div className="space-y-6">
            {proposals.map((proposal) => (
              <ProposalCard
                key={proposal.id}
                proposal={proposal}
                connected={connected}
                onVote={onVote}
                onExecute={onExecute}
                loadingVote={loadingVoting.has(proposal.id)}
                loadingExecution={loadingExecution.has(proposal.id)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}