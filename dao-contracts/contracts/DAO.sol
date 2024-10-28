// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DAO {
    struct Proposal {
        uint id;
        string description;
        uint voteCount;
        bool executed;
    }

    address public owner;
    uint public proposalCount;
    mapping(uint => Proposal) public proposals;
    mapping(address => mapping(uint => bool)) public votes;

    event ProposalCreated(uint id, string description);
    event Voted(uint proposalId, address voter);
    event ProposalExecuted(uint id);

    constructor() {
        owner = msg.sender;
    }

    function createProposal(string memory _description) public {
        proposalCount++;
        proposals[proposalCount] = Proposal(proposalCount, _description, 0, false);
        emit ProposalCreated(proposalCount, _description);
    }

    function vote(uint _proposalId) public {
        require(_proposalId <= proposalCount && _proposalId > 0, "Invalid proposal ID");
        require(!votes[msg.sender][_proposalId], "Already voted");

        proposals[_proposalId].voteCount++;
        votes[msg.sender][_proposalId] = true;
        emit Voted(_proposalId, msg.sender);
    }

    function executeProposal(uint _proposalId) public {
        require(_proposalId <= proposalCount && _proposalId > 0, "Invalid proposal ID");
        require(!proposals[_proposalId].executed, "Proposal already executed");
        require(proposals[_proposalId].voteCount > 0, "Not enough votes");

        proposals[_proposalId].executed = true;
        emit ProposalExecuted(_proposalId);
    }

    function getProposals() public view returns (Proposal[] memory) {
        Proposal[] memory _proposals = new Proposal[](proposalCount);
        for (uint i = 1; i <= proposalCount; i++) {
            _proposals[i - 1] = proposals[i];
        }
        return _proposals;
    }
}