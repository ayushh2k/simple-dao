import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { PlusCircle, WalletCards, Check, AlertCircle, ThumbsUp, Rocket, Loader2 } from 'lucide-react';
import { useToast } from "../hooks/use-toast"

const DaoInterface = () => {
  const [proposals, setProposals] = useState([]);
  const [connected, setConnected] = useState(false);
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState({
    connection: false,
    proposals: false,
    creation: false,
    voting: new Set(),
    execution: new Set()
  });
  const [contract, setContract] = useState(null);
  const { toast } = useToast();

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const abi = [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "description",
          "type": "string"
        }
      ],
      "name": "ProposalCreated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        }
      ],
      "name": "ProposalExecuted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "proposalId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "voter",
          "type": "address"
        }
      ],
      "name": "Voted",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_description",
          "type": "string"
        }
      ],
      "name": "createProposal",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_proposalId",
          "type": "uint256"
        }
      ],
      "name": "executeProposal",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getProposals",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "id",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "description",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "voteCount",
              "type": "uint256"
            },
            {
              "internalType": "bool",
              "name": "executed",
              "type": "bool"
            }
          ],
          "internalType": "struct DAO.Proposal[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "proposalCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "proposals",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "description",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "voteCount",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "executed",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_proposalId",
          "type": "uint256"
        }
      ],
      "name": "vote",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "votes",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ];

  const setupContract = async (signer) => {
    try {
      const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
      const contract = new ethers.Contract(
        contractAddress,
        abi,
        signer || provider
      );
      setContract(contract);
      return contract;
    } catch (error) {
      console.error("Failed to setup contract:", error);
      toast({
        variant: "destructive",
        title: "Contract Setup Failed",
        description: "Failed to connect to the DAO contract. Please try again."
      });
    }
  };

  const connectWallet = async () => {
    setLoading(prev => ({ ...prev, connection: true }));
    try {
      const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      setAddress(address);
      setConnected(true);
      await setupContract(signer);

      toast({
        title: "Wallet Connected",
        description: `Connected with ${address.slice(0, 6)}...${address.slice(-4)}`
      });
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: error.message
      });
    } finally {
      setLoading(prev => ({ ...prev, connection: false }));
    }
  };

  const getProposals = async () => {
    if (!contract) return;

    setLoading(prev => ({ ...prev, proposals: true }));
    try {
      const rawProposals = await contract.getProposals();
      const formattedProposals = await Promise.all(rawProposals.map(async (proposal) => {
        const status = proposal.executed ? 'executed' :
          proposal.voteCount.toString() >= 20 ? 'active' : 'pending';

        // Check if user has voted
        const hasVoted = connected ?
          await contract.votes(address, proposal.id) : false;

        return {
          id: proposal.id.toString(),
          description: proposal.description,
          voteCount: proposal.voteCount.toString(),
          executed: proposal.executed,
          status,
          hasVoted
        };
      }));
      setProposals(formattedProposals);
    } catch (error) {
      console.error("Failed to get proposals:", error);
      toast({
        variant: "destructive",
        title: "Failed to Load Proposals",
        description: "Please check your connection and try again."
      });
    } finally {
      setLoading(prev => ({ ...prev, proposals: false }));
    }
  };

  const createProposal = async () => {
    if (!contract || !description.trim()) return;

    setLoading(prev => ({ ...prev, creation: true }));
    try {
      const tx = await contract.createProposal(description);
      toast({
        title: "Creating Proposal",
        description: "Please wait for transaction confirmation..."
      });

      await tx.wait();
      setDescription('');
      toast({
        title: "Proposal Created",
        description: "Your proposal has been successfully created!"
      });
      await getProposals();
    } catch (error) {
      console.error("Failed to create proposal:", error);
      toast({
        variant: "destructive",
        title: "Failed to Create Proposal",
        description: error.message
      });
    } finally {
      setLoading(prev => ({ ...prev, creation: false }));
    }
  };

  const vote = async (proposalId) => {
    if (!contract) return;

    setLoading(prev => ({
      ...prev,
      voting: new Set([...prev.voting, proposalId])
    }));

    try {
      const tx = await contract.vote(proposalId);
      toast({
        title: "Submitting Vote",
        description: "Please wait for transaction confirmation..."
      });

      await tx.wait();
      toast({
        title: "Vote Submitted",
        description: "Your vote has been recorded successfully!"
      });
      await getProposals();
    } catch (error) {
      console.error("Failed to vote:", error);
      toast({
        variant: "destructive",
        title: "Failed to Submit Vote",
        description: error.message
      });
    } finally {
      setLoading(prev => ({
        ...prev,
        voting: new Set([...prev.voting].filter(id => id !== proposalId))
      }));
    }
  };

  const executeProposal = async (proposalId) => {
    if (!contract) return;

    setLoading(prev => ({
      ...prev,
      execution: new Set([...prev.execution, proposalId])
    }));

    try {
      const tx = await contract.executeProposal(proposalId);
      toast({
        title: "Executing Proposal",
        description: "Please wait for transaction confirmation..."
      });

      await tx.wait();
      toast({
        title: "Proposal Executed",
        description: "The proposal has been successfully executed!"
      });
      await getProposals();
    } catch (error) {
      console.error("Failed to execute proposal:", error);
      toast({
        variant: "destructive",
        title: "Failed to Execute Proposal",
        description: error.message
      });
    } finally {
      setLoading(prev => ({
        ...prev,
        execution: new Set([...prev.execution].filter(id => id !== proposalId))
      }));
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-500',
      pending: 'bg-yellow-500',
      executed: 'bg-gray-500'
    };
    return (
      <Badge className={`${styles[status]} text-white`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  useEffect(() => {
    if (connected) {
      getProposals();
    }
  }, [connected]);

  // Setup event listeners
  useEffect(() => {
    if (!contract) return;

    const proposalCreatedFilter = contract.filters.ProposalCreated();
    const votedFilter = contract.filters.Voted();
    const proposalExecutedFilter = contract.filters.ProposalExecuted();

    const handleProposalCreated = (id, description) => {
      toast({
        title: "New Proposal Created",
        description: `Proposal #${id}: ${description.slice(0, 30)}...`
      });
      getProposals();
    };

    const handleVoted = (proposalId, voter) => {
      if (voter.toLowerCase() !== address.toLowerCase()) {
        toast({
          title: "New Vote Cast",
          description: `New vote on Proposal #${proposalId}`
        });
        getProposals();
      }
    };

    const handleProposalExecuted = (id) => {
      toast({
        title: "Proposal Executed",
        description: `Proposal #${id} has been executed`
      });
      getProposals();
    };

    contract.on(proposalCreatedFilter, handleProposalCreated);
    contract.on(votedFilter, handleVoted);
    contract.on(proposalExecutedFilter, handleProposalExecuted);

    return () => {
      contract.off(proposalCreatedFilter, handleProposalCreated);
      contract.off(votedFilter, handleVoted);
      contract.off(proposalExecutedFilter, handleProposalExecuted);
    };
  }, [contract, address]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
            DAO Governance
          </h1>
          <p className="text-gray-600 text-lg">
            {connected
              ? `Connected: ${address.slice(0, 6)}...${address.slice(-4)}`
              : "Connect your wallet to participate"}
          </p>
        </div>

        <div className="grid gap-8">
          <Card>
            <CardContent className="pt-6">
              <Button
                className="w-full flex items-center justify-center gap-2 h-16 text-lg"
                variant={connected ? "secondary" : "default"}
                onClick={connectWallet}
                disabled={connected || loading.connection}
              >
                {loading.connection ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : connected ? (
                  <>
                    <Check className="w-6 h-6" />
                    Wallet Connected
                  </>
                ) : (
                  <>
                    <WalletCards className="w-6 h-6" />
                    Connect Wallet
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

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
                  disabled={!connected || loading.creation}
                />
                <Button
                  onClick={createProposal}
                  disabled={!connected || !description.trim() || loading.creation}
                  className="px-8"
                >
                  {loading.creation ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Submit"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="w-6 h-6" />
                Active Proposals
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading.proposals ? (
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
                    <Card key={proposal.id}>
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
                            onClick={() => vote(proposal.id)}
                            disabled={
                              !connected ||
                              proposal.executed ||
                              proposal.hasVoted ||
                              loading.voting.has(proposal.id)
                            }
                            className="flex-1 flex items-center justify-center gap-2"
                          >
                            {loading.voting.has(proposal.id) ? (
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
                            onClick={() => executeProposal(proposal.id)}
                            disabled={
                              !connected ||
                              proposal.executed ||
                              parseInt(proposal.voteCount) < 1 ||
                              loading.execution.has(proposal.id)
                            }
                            className="flex-1 flex items-center justify-center gap-2"
                          >
                            {loading.execution.has(proposal.id) ? (
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
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DaoInterface;