pragma solidity 0.4.24;


contract ECRecoverTest {

    constructor() public {}

    function recover(uint8 v, bytes32 r, bytes32 s, address user) public pure returns (address) {
        return ecrecover(hash(user), v, r, s);
    }

    function hash(address user) public pure returns (bytes32) {
        return keccak256(encode(user));
    }

    function encode(address user) public pure returns (bytes) {
        return abi.encodePacked(user);
    }
}
