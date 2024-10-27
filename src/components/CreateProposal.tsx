import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { PlusCircle, Loader2 } from 'lucide-react'

interface CreateProposalProps {
  connected: boolean
  loading: boolean
  onCreateProposal: (description: string) => void
}

export function CreateProposal({ connected, loading, onCreateProposal }: CreateProposalProps) {
  const [description, setDescription] = useState('')

  const handleSubmit = () => {
    if (description.trim()) {
      onCreateProposal(description)
      setDescription('')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PlusCircle className="w-6 h-6" />
          Create Proposal
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter your proposal description"
            className="flex-1"
            disabled={!connected || loading}
          />
          <Button
            onClick={handleSubmit}
            disabled={!connected || !description.trim() || loading}
            className="px-8"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Submit"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}