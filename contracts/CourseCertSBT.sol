// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CourseCertSBT
 * @dev Soulbound Token (SBT) for course certificates - non-transferable
 * Represents verifiable educational achievements
 */
contract CourseCertSBT is ERC721, Ownable {
    uint256 private _tokenIds;

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

        _tokenIds++;
        uint256 newTokenId = _tokenIds;

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

    // ... rest of the contract remains the same
}
