// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract BlockCertificate {
    address public admin;
    mapping(bytes32 => bool) public certificateExists;
    mapping(bytes32 => string) public studentProfiles;
    mapping(bytes32 => string) public certificateCIDs; // NEW: IPFS image CID
    
    event CertificateIssued(bytes32 indexed hashKey, string studentProfile, string ipfsCID);

    constructor() { admin = msg.sender; }

    modifier onlyAdmin() { require(msg.sender == admin, "Only admin"); _; }

    function generateHash(bytes calldata certData, string memory name, string memory rollNumber, string memory course, string memory year, string memory institution) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(certData, name, rollNumber, course, year, institution));
    }

    function issueCertificate(
        bytes calldata certData,
        string memory ipfsCID, // NEW
        string memory name, string memory rollNumber, string memory course, string memory year, string memory institution
    ) public onlyAdmin {
        bytes32 hashKey = generateHash(certData, name, rollNumber, course, year, institution);
        require(!certificateExists[hashKey], "Certificate already exists");
        
        string memory profile = string(abi.encodePacked(name, "|", rollNumber, "|", course, "|", year, "|", institution));
        certificateExists[hashKey] = true;
        studentProfiles[hashKey] = profile;
        certificateCIDs[hashKey] = ipfsCID; // Store image CID
        
        emit CertificateIssued(hashKey, profile, ipfsCID);
    }

    function getCertificate(bytes32 hashKey) public view returns (
        bool exists, string memory profile, string memory ipfsCID
    ) {
        exists = certificateExists[hashKey];
        profile = studentProfiles[hashKey];
        ipfsCID = certificateCIDs[hashKey];
    }

    function verifyHash(bytes32 hashKey) public view returns (bool, string memory) {
        return (certificateExists[hashKey], studentProfiles[hashKey]);
    }
}
