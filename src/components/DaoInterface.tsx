'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { useToast } from "../hooks/use-toast"
import { WalletConnection } from './WalletConnection'
import { CreateProposal } from './CreateProposal'
import { ProposalList } from './ProposalList'
import { CONTRACT_ADDRESS, CONTRACT_ABI, SERVER_URL } from '../lib/contractConfig'

interface Proposal {
  id: string
  description: string
  voteCount: string
  executed: boolean
  status: 'executed' | 'active' | 'pending'
  hasVoted: boolean
}

interface LoadingState {
  connection: boolean
  proposals: boolean
  creation: boolean
  voting: Set<string>
  execution: Set<string>
}

export default function DaoInterface() {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [connected, setConnected] = useState<boolean>(false)
  const [address, setAddress] = useState<string>('')
  const [loading, setLoading] = useState<LoadingState>({
    connection: false,
    proposals: false,
    creation: false,
    voting: new Set(),
    execution: new Set()
  })
  const [contract, setContract] = useState<ethers.Contract | null>(null)
  const { toast } = useToast()

  const setupContract = async (signer: ethers.Signer | ethers.providers.Provider): Promise<ethers.Contract | null> => {
    try {
      const provider = new ethers.providers.JsonRpcProvider(SERVER_URL)
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer || provider
      )
      setContract(contract)
      return contract
    } catch (error) {
      console.error("Failed to setup contract:", error)
      toast({
        variant: "destructive",
        title: "Contract Setup Failed",
        description: "Failed to connect to the DAO contract. Please try again."
      })
      return null
    }
  }

  const connectWallet = async (): Promise<void> => {
    setLoading(prev => ({ ...prev, connection: true }))
    try {
      const provider = new ethers.providers.JsonRpcProvider(SERVER_URL)
      const signer = provider.getSigner()
      const address = await signer.getAddress()
      setAddress(address)
      setConnected(true)
      await setupContract(signer)

      toast({
        title: "Wallet Connected",
        description: `Connected with ${address.slice(0, 6)}...${address.slice(-4)}`
      })
    } catch (error) {
      console.error("Failed to connect wallet:", error)
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred"
      })
    } finally {
      setLoading(prev => ({ ...prev, connection: false }))
    }
  }

  const getProposals = async (): Promise<void> => {
    if (!contract) return

    setLoading(prev => ({ ...prev, proposals: true }))
    try {
      const rawProposals = await contract.getProposals()
      const formattedProposals: Proposal[] = await Promise.all(rawProposals.map(async (proposal: any) => {
        const status = proposal.executed ? 'executed' :
          proposal.voteCount.toString() >= '20' ? 'active' : 'pending'

        const hasVoted = connected ?
          await contract.votes(address, proposal.id) : false

        return {
          id: proposal.id.toString(),
          description: proposal.description,
          voteCount: proposal.voteCount.toString(),
          executed: proposal.executed,
          status,
          hasVoted
        }
      }))
      setProposals(formattedProposals)
    } catch (error) {
      console.error("Failed to get proposals:", error)
      toast({
        variant: "destructive",
        title: "Failed to Load Proposals",
        description: "Please check your connection and try again."
      })
    } finally {
      setLoading(prev => ({ ...prev, proposals: false }))
    }
  }

  const createProposal = async (description: string): Promise<void> => {
    if (!contract || !description.trim()) return

    setLoading(prev => ({ ...prev, creation: true }))
    try {
      const tx = await contract.createProposal(description)
      toast({
        title: "Creating Proposal",
        description: "Please wait for transaction confirmation..."
      })

      await tx.wait()
      toast({
        title: "Proposal Created",
        description: "Your proposal has been successfully created!"
      })
      await getProposals()
    } catch (error) {
      console.error("Failed to create proposal:", error)
      toast({
        variant: "destructive",
        title: "Failed to Create Proposal",
        description: error instanceof Error ? error.message : "Unknown error occurred"
      })
    } finally {
      setLoading(prev => ({ ...prev, creation: false }))
    }
  }

  const vote = async (proposalId: string): Promise<void> => {
    if (!contract) return

    setLoading(prev => ({
      ...prev,
      voting: new Set([...prev.voting, proposalId])
    }))

    try {
      const tx = await contract.vote(proposalId)
      toast({
        title: "Submitting Vote",
        description: "Please wait for transaction confirmation..."
      })

      await tx.wait()
      toast({
        title: "Vote Submitted",
        description: "Your vote has been recorded successfully!"
      })
      await getProposals()
    } catch (error) {
      console.error("Failed to vote:", error)
      toast({
        variant: "destructive",
        title: "Failed to Submit Vote",
        description: error instanceof Error ? error.message : "Unknown error occurred"
      })
    } finally {
      setLoading(prev => ({
        ...prev,
        voting: new Set([...prev.voting].filter(id => id !== proposalId))
      }))
    }
  }

  const executeProposal = async (proposalId: string): Promise<void> => {
    if (!contract) return

    setLoading(prev => ({
      ...prev,
      execution: new Set([...prev.execution, proposalId])
    }))

    try {
      const tx = await contract.executeProposal(proposalId)
      toast({
        title: "Executing Proposal",
        description: "Please wait for transaction confirmation..."
      })

      await tx.wait()
      toast({
        title: "Proposal Executed",
        description: "The proposal has been successfully executed!"
      })
      await getProposals()
    } catch (error) {
      console.error("Failed to execute proposal:", error)
      toast({
        variant: "destructive",
        title: "Failed to Execute Proposal",
        description: error instanceof Error ? error.message : "Unknown error occurred"
      })
    } finally {
      setLoading(prev => ({
        ...prev,
        execution: new Set([...prev.execution].filter(id => id !== proposalId))
      }))
    }
  }

  useEffect(() => {
    if (connected) {
      getProposals()
    }
  }, [connected])

  useEffect(() => {
    if (!contract) return

    const proposalCreatedFilter = contract.filters.ProposalCreated()
    const votedFilter = contract.filters.Voted()
    const proposalExecutedFilter = contract.filters.ProposalExecuted()

    const handleProposalCreated = (id: string, description: string) => {
      toast({
        title: "New Proposal Created",
        description: `Proposal #${id}: ${description.slice(0, 30)}...`
      })
      getProposals()
    }

    const handleVoted = (proposalId: string, voter: string) => {
      if (voter.toLowerCase() !== address.toLowerCase()) {
        toast({
          title: "New Vote Cast",
          description: `New vote on Proposal #${proposalId}`
        })
        getProposals()
      }
    }

    const handleProposalExecuted = (id: string) => {
      toast({
        title: "Proposal Executed",
        description: `Proposal #${id} has been executed`
      })
      getProposals()
    }

    contract.on(proposalCreatedFilter, handleProposalCreated)
    contract.on(votedFilter, handleVoted)
    contract.on(proposalExecutedFilter, handleProposalExecuted)

    return () => {
      contract.off(proposalCreatedFilter, handleProposalCreated)
      contract.off(votedFilter, handleVoted)
      contract.off(proposalExecutedFilter, handleProposalExecuted)
    }
  }, [contract, address])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
            DAO Governance
          </h1>
          <p className="text-gray-600 text-lg">
            {connected
              ? `Connected: ${address.slice(0,   6)}...${address.slice(-4)}`
              : "Connect your wallet to participate"}
          </p>
        </div>

        <div className="grid gap-8">
          <WalletConnection
            connected={connected}
            loading={loading.connection}
            onConnect={connectWallet}
          />
          <CreateProposal
            connected={connected}
            loading={loading.creation}
            onCreateProposal={createProposal}
          />
          <ProposalList
            proposals={proposals}
            connected={connected}
            loading={loading.proposals}
            onVote={vote}
            onExecute={executeProposal}
            loadingVoting={loading.voting}
            loadingExecution={loading.execution}
          />
        </div>
      </div>
    </div>
  )
}