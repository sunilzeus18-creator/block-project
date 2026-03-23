// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract CertCheck {
    mapping(bytes32 => bool) public issuedCerts;
    
    event CertificateIssued(bytes32 indexed certHash);
    
    function issueCertificate(
        string memory studentId,
        string memory courseCode,
        string memory courseNumber,
        string memory fileHash
    ) public {
        bytes32 certHash = keccak256(abi.encodePacked(studentId, courseCode, courseNumber, fileHash));
        require(!issuedCerts[certHash], "Certificate already exists");
        issuedCerts[certHash] = true;
        emit CertificateIssued(certHash);
    }
    
    function verifyCertificate(
        string memory studentId,
        string memory courseCode,
        string memory courseNumber,
        string memory fileHash
    ) public view returns (bool) {
        bytes32 certHash = keccak256(abi.encodePacked(studentId, courseCode, courseNumber, fileHash));
        return issuedCerts[certHash];
    }
}
