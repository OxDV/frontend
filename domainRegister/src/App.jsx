import './App.css';
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import contractABI from './contracts/DomainRegistry.json';
import USDTcontractABI from './contracts/TestnetUSDT.json';

const contractAddress = '0x5AC678E6B87d7BE04293B822b4eB093CB7c57Ee2';
const usdtToken = '0x1772017091a742c65e96F3e09812264312bdf312';

function App() {
  // INIT CONSTANT
  const [connected, setConnected] = useState(false)
  const [contract, setContract] = useState(null);
  const [usdtContract, setUsdtContract] = useState(null);


  // REGISTER DOMAIN
  const [registerDomain, setRegisterDomain] = useState('');
  const [parentDomain, setParentDomain] = useState('');
  const [amount, setAmount] = useState('');
  const [id, setId] = useState(null);




  const [domain, setDomain] = useState('');
  const [infoDomain, setInfoDomain] = useState('');
  const [tokenAddress, setTokenAddress] = useState(null)
  const [fundsToWithdraw, setFundsToWithdraw] = useState(null)


  const connectWallet = async () => {
    try {
      if (!connected) {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()
        const address = await signer.getAddress()
        const contract = new ethers.Contract(contractAddress, contractABI.abi, signer);
        const usdt = new ethers.Contract(usdtToken, USDTcontractABI.abi, signer);
        setUsdtContract(usdt);
        setContract(contract);
        setId(address)
        setConnected(true)
      }
    } catch (error) {
      console.log(error.message)
    }
  };

  const registerDomainWithETH = async () => {
    if (!contract) return;
    console.log(registerDomain, parentDomain, { value: ethers.parseEther(amount) });
    const transaction = await contract.registerDomain(registerDomain, parentDomain, { value: ethers.parseEther(amount) });
    await transaction.wait();
    console.log('Domain registered with ETH:', transaction);
  };

  const registerDomainWithUSDT = async () => {
    if (!contract || !usdtContract) return;
    try {
      const decimals = await usdtContract.decimals();
      const amountToApprove = ethers.parseUnits(amount, decimals);
      let approveTx = await usdtContract.approve(contractAddress, amountToApprove);
      await approveTx.wait();
      console.log('Approval successful');

      // // Step 2: Call the contract function to register domain using USDT
      const transaction = await contract.registerDomain(registerDomain, parentDomain, { value: 0 });
      await transaction.wait();
      console.log('Domain registered with USDT:', transaction);
    } catch (error) {
      console.error('Error during domain registration with USDT:', error);
    }
  };

  // const withdrawRewards = async (token) => {
  //   if (!contract) return;
  //   const transaction = await contract.withdrawRewards(token, ethers.utils.parseEther(amount));
  //   await transaction.wait();
  //   console.log('Funds withdrawn:', transaction);
  // };

  // const getControllerInfo = async () => {
  //   if (!contract) {
  //     alert('Connect Wallet!');
  //     return;
  //   }
  //   try {
  //     const controllerAddress = await contract.getDomainController(infoDomain);
  //     console.log('Controller address:', controllerAddress);
  //   } catch (error) {
  //     console.error('Error fetching controller info:', error);
  //     if (error.message.includes('execution reverted: DomainNotRegistered')) {
  //       alert('Error: The domain is not registered.');
  //     } else {
  //       alert('An error occurred: ' + error.message);
  //     }
  //   }
  // };

  // const withdrawFunds = async (token) => {
  //   if (!contract) {
  //     alert('Connect Wallet!');
  //     return;
  //   }
  //   try {
  //     const withdrawFunds = await contract.withdrawFunds(token, ethers.parseEther(fundsToWithdraw));
  //     console.log('Txs', withdrawFunds);
  //   } catch (error) {
  //     console.error('Error fetching controller info:', error);
  //     if (error.message.includes('execution reverted: DomainNotRegistered')) {
  //       alert('Error: The domain is not registered.');
  //     } else {
  //       alert('An error occurred: ' + error.message);
  //     }
  //   }
  // };


  return (
    <div className='main-page'>
      <div className='connect-button'>
        <button className='connect-metamask' onClick={connectWallet}>{id ? id : 'Connect Wallet'}</button>
      </div>
      <div className='registar-domain-container'>
        <input value={registerDomain} onChange={(e) => setRegisterDomain(e.target.value)} placeholder="Domain Name" />
        <input value={parentDomain} onChange={(e) => setParentDomain(e.target.value)} placeholder="Parent Domain Name" />
        <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount(0.016ETH)" />
        <button onClick={registerDomainWithETH}>Register Domain with ETH</button>
        <button onClick={registerDomainWithUSDT}>Register Domain with USDT</button>
      </div>
      {/* <div>
        <input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="Registered Domain" />
        <button onClick={() => withdrawRewards(ethers.constants.AddressZero)}>Withdraw ETH</button>
        <button onClick={() => withdrawRewards(usdtToken)}>Withdraw USDT</button>
      </div>
      <div>
        <input value={fundsToWithdraw} onChange={(e) => setFundsToWithdraw(e.target.value)} placeholder="Amount to withdraw" />
        <button onClick={() => withdrawFunds('0x0000000000000000000000000000000000000000')}>Withdraw ETH(only owner)</button>
        <button onClick={() => withdrawFunds(usdtToken)}>Withdraw USDT(only owner)</button>
      </div>
      <div>
        <input value={infoDomain} onChange={(e) => setInfoDomain(e.target.value)} placeholder="Domain" />
        <button onClick={getControllerInfo}>Get Controller Info</button>
      </div> */}
    </div>
  );
}

export default App;
