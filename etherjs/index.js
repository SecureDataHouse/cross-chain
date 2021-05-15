
const ethers = require("ethers")
var fs = require("fs");

const local_provider = "http://127.0.0.1:8545/"

token_json = "../solidity/contract/artifacts/contracts/Greeter.sol/Greeter.json";
swap_json = "../solidity/contract/artifacts/contracts/Greeter.sol/Greeter.json";

function get_abi(json_file) {
    var fs = require('fs');
    var obj = JSON.parse(fs.readFileSync(json_file, 'utf8'));

    return obj['abi'];
}

function get_bytecode(json_file) {
    var fs = require('fs');
    var obj = JSON.parse(fs.readFileSync(json_file, 'utf8'));

    return obj['bytecode'];
}

async function deploy_deeper_token(wallet) {
    const token_symbol = "erc20";
    const factory = new ethers.ContractFactory(get_abi(token_json), get_bytecode(token_json), wallet);
    const contract = await factory.deploy(token_symbol);
    console.log(contract.address);

    return contract;
}

async function deploy_swap(wallet, token_address) {
    const factory = new ethers.ContractFactory(get_abi(swap_json), get_bytecode(swap_json), wallet);
    const contract = await factory.deploy(token_address, wallet.address);
    console.log(contract.address);

    return contract;
}

async function get_handler(address) {
    const provider = new ethers.getDefaultProvider(local_provider);
    blocknumber = await provider.getBlockNumber()
    console.log("block number is ", blocknumber)

    address = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266";
    balance = await provider.getBalance(address);
    console.log('balance is ', balance.toString());

    var signerWallet = await provider.getSigner(0);
    console.log("signerWallet is ", signerWallet.address)
}

async function get_contract() {
    const provider = new ethers.providers.JsonRpcProvider(local_provider);
    const address = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
    const abi = get_abi();

    // A Signer from a private key
    let privateKey = '0x9af0f29100b9575ffe7d5596d87003b6ada89076ca84342f1fe57d85acde4ca6';
    let wallet = new ethers.Wallet(privateKey, provider);

    const contract = new ethers.Contract(address, abi, wallet);
    console.log("contract address is ", contract.address);
    const admin = await contract.admin();
    console.log("contract admin is ", admin);

    contract.on("EthereumToSubstrate", (from, to, amount, event) => {
        console.log(`${ from } sent ${ formatEther(amount) } to ${ to}`);
        // The event object contains the verbatim log data, the
        // EventFragment and functions to fetch the block,
        // transaction and receipt and event functions
    });
}

async function main() {
    // get_handler();
    const provider = new ethers.providers.JsonRpcProvider(local_provider);
    let privateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
    let wallet = new ethers.Wallet(privateKey, provider);
    let balance = await wallet.getBalance();
    let owner = await wallet.getAddress();
    console.log("owner address is ", owner, " balance is ", balance.toString());

    const token_contract = await deploy_deeper_token(wallet);
    console.log('token contract is ', token_contract.address);

    const swap_contract = await deploy_swap(wallet, token_contract.address);
    console.log('swap contract is ', swap_contract.address);

    await token_contract.approve(swap_contract.address, 1000);

    while (true) {
        tx = await swap_contract.swap(1, "cosmos")
        owner_balance = await token_contract.balanceOf(owner);
        contract_balance = await token_contract.balanceOf(swap_contract.address);
        console.log("owner balance is ", owner_balance.toString(), "; contract balance is ", contract_balance.toString());
        await new Promise(resolve => setTimeout(resolve, 5000));
    }
}

main().then(() => process.exit(0))
    .catch(error => {
    console.error(error);
    process.exit(1);
});


// get_contract()
// get_abi()
