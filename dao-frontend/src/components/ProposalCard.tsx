import { Card, CardContent } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { ThumbsUp, Rocket, Loader2 } from 'lucide-react'

interface ProposalCardProps {
  proposal: {
    id: string
    description: string
    voteCount: string
    status: string
    hasVoted: boolean
    executed: boolean
  }
  connected: boolean
  onVote: (id: string) => void
  onExecute: (id: string) => void
  loadingVote: boolean
  loadingExecution: boolean
}

export function ProposalCard({ 
  proposal, 
  connected, 
  onVote, 
  onExecute, 
  loadingVote, 
  loadingExecution 
}: ProposalCardProps) {
  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-500',
      pending: 'bg-yellow-500',
      executed: 'bg-gray-500'
    }
    return (
      <Badge className={`${styles[status as keyof typeof styles]} text-white`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {getStatusBadge(proposal.status)}
              {proposal.hasVoted && (
                <Badge variant="outline" className="text-green-600">
                  You voted
                </Badge>
              )}
            </div>
            <p className="text-lg font-medium">{proposal.description}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {proposal.voteCount}
            </div>
            <div className="text-sm text-gray-500">votes</div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => onVote(proposal.id)}
            disabled={
              !connected ||
              proposal.executed ||
              proposal.hasVoted ||
              loadingVote
            }
            className="flex-1 flex items-center justify-center gap-2"
          >
            {loadingVote ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <ThumbsUp className="w-4 h-4" />
                {proposal.hasVoted ? 'Voted' : 'Vote'}
              </>
            )}
          </Button>
          <Button
            variant="default"
            onClick={() => onExecute(proposal.id)}
            disabled={
              !connected ||
              proposal.executed ||
              parseInt(proposal.voteCount) < 1 ||
              loadingExecution
            }
            className="flex-1 flex items-center justify-center gap-2"
          >
            {loadingExecution ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Rocket className="w-4 h-4" />
                Execute
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}