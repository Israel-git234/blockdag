// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title CourseCertSBT
 * @dev Soulbound Token (SBT) for course certificates - non-transferable
 * Represents verifiable educational achievements
 */
contract CourseCertSBT is ERC721, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIds;
    
    struct Certificate {
        string courseTitle;
        string courseDescription;
        string creatorChannel;
        uint256 completionDate;
        uint256 courseDuration;
        string metadataURI;
        bool isRevoked;
    }
    
    mapping(uint256 => Certificate) public certificates;
    mapping(address => uint256[]) public userCertificates;
    
    event CertificateMinted(uint256 indexed tokenId, address indexed recipient, string courseTitle);
    event CertificateRevoked(uint256 indexed tokenId, address indexed recipient);
    
    constructor(address initialOwner) ERC721("Course Certificate", "COURSE") Ownable(initialOwner) {}
    
    /**
     * @dev Mint a new course certificate (only owner/authorized creator)
     */
    function mintCertificate(
        address recipient,
        string memory courseTitle,
        string memory courseDescription,
        string memory creatorChannel,
        uint256 courseDuration,
        string memory metadataURI
    ) public onlyOwner returns (uint256) {
        require(recipient != address(0), "Invalid recipient");
        require(bytes(courseTitle).length > 0, "Course title required");
        
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        certificates[newTokenId] = Certificate({
            courseTitle: courseTitle,
            courseDescription: courseDescription,
            creatorChannel: creatorChannel,
            completionDate: block.timestamp,
            courseDuration: courseDuration,
            metadataURI: metadataURI,
            isRevoked: false
        });
        
        _safeMint(recipient, newTokenId);
        userCertificates[recipient].push(newTokenId);
        
        emit CertificateMinted(newTokenId, recipient, courseTitle);
        return newTokenId;
    }
    
    /**
     * @dev Revoke a certificate (only owner)
     */
    function revokeCertificate(uint256 tokenId) public onlyOwner {
        require(_exists(tokenId), "Certificate does not exist");
        certificates[tokenId].isRevoked = true;
        emit CertificateRevoked(tokenId, ownerOf(tokenId));
    }
    
    /**
     * @dev Get certificate details
     */
    function getCertificate(uint256 tokenId) public view returns (Certificate memory) {
        require(_exists(tokenId), "Certificate does not exist");
        return certificates[tokenId];
    }
    
    /**
     * @dev Get user's certificates
     */
    function getUserCertificates(address user) public view returns (uint256[] memory) {
        return userCertificates[user];
    }
    
    /**
     * @dev Override transfer functions to make tokens non-transferable
     */
    function transferFrom(address from, address to, uint256 tokenId) public virtual override {
        revert("Course certificates are non-transferable");
    }
    
    function safeTransferFrom(address from, address to, uint256 tokenId) public virtual override {
        revert("Course certificates are non-transferable");
    }
    
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public virtual override {
        revert("Course certificates are non-transferable");
    }
    
    /**
     * @dev Override approval functions
     */
    function approve(address to, uint256 tokenId) public virtual override {
        revert("Course certificates are non-transferable");
    }
    
    function setApprovalForAll(address operator, bool approved) public virtual override {
        revert("Course certificates are non-transferable");
    }
    
    function getApproved(uint256 tokenId) public view virtual override returns (address) {
        return address(0);
    }
    
    function isApprovedForAll(address owner, address operator) public view virtual override returns (bool) {
        return false;
    }
}
