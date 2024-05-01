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

  // WITHDRAW FUNDS
  const [fundsToWithdraw, setFundsToWithdraw] = useState(null);
  const [selectedToken, setSelectedToken] = useState('eth');

  // INFO REGISTRATION FEE
  const [registrationFee, setRegistrationFee] = useState(null);
  const [requiredEth, setRequiredEth] = useState(null);
  const [newFee, setNewFee] = useState(null);

  // REGISTERED DOMAINS
  const [registeredDomains, setRegisteredDomains] = useState([]);

  // GET DOMAIN CONTROLLER
  const [domainController, setDomainController] = useState(null);
  const [domainInfo, setDomainInfo] = useState(null);

  // CONTROLLER BALANCE
  const [controllerAddress, setControllerAddress] = useState(null);
  const [controllerBalance, setControllerBalance] = useState(null);

  // SET DOMAIN REWARD
  const [amountReward, setAmountReward] = useState(null);
  const [rewardForController, setRewardForController] = useState(null);

  // GET DOMAIN REWARD 
  const [getDomainReward, setGetDomainReward] = useState(null);
  const [domainRewardAmount, setDomainRewardAmount] = useState(null);


  // WITHDRAW REWARD
  const [rewardToWithdraw, setRewardToWithdraw] = useState(null);
  const [selectedTokenForReward, setSelectedTokenForReward] = useState(null);




  const [domain, setDomain] = useState('');
  const [infoDomain, setInfoDomain] = useState('');
  const [tokenAddress, setTokenAddress] = useState(null)


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

  const withdrawFunds = async () => {
    if (!contract) {
      alert('Connect Wallet!');
      return;
    }
    try {
      const tokenAddress = selectedToken === 'eth' ? '0x0000000000000000000000000000000000000000' : usdtToken;
      const withdrawAmountOwner = selectedToken === 'eth' ? ethers.parseEther(fundsToWithdraw) : fundsToWithdraw * 10 ** 6;
      const withdrawFunds = await contract.withdrawFunds(tokenAddress, withdrawAmountOwner);
      console.log('Txs', withdrawFunds);
    } catch (error) {
      alert(error.message);
    }
  };


  const withdrawReward = async () => {
    if (!contract) {
      alert('Connect Wallet!');
      return;
    }
    try {
      const tokenAddress = selectedTokenForReward === 'eth' ? '0x0000000000000000000000000000000000000000' : usdtToken;
      const withdrawAmount = selectedTokenForReward === 'eth' ? ethers.parseEther(rewardToWithdraw) : rewardToWithdraw * 10 ** 6;
      const withdrawFunds = await contract.withdrawFunds(tokenAddress, withdrawAmount);
      setControllerBalance(null);
      console.log('Txs', withdrawFunds);
    } catch (error) {
      alert(error.message);
    }
  };

  const getRegisterFee = async () => {
    if (!contract) {
      alert('Connect Wallet!');
      return;
    }
    try {
      const getRegistrationFee = await contract.registrationFeeUSD();
      setRegistrationFee(Number(getRegistrationFee));
      console.log('getRegistrationFee', getRegistrationFee);
    } catch (error) {
      alert('An error occurred: ' + error.message);
    }
  };

  const getRequiredETH = async () => {
    if (!contract) {
      alert('Connect Wallet!');
      return;
    }
    try {
      const amountOfEth = await contract.getRequiredWei(registrationFee);
      setRequiredEth(Number(amountOfEth));
      console.log('amountOfEth', amountOfEth);
    } catch (error) {
      alert('An error occurred: ' + error.message);
    }
  };

  const setFee = async () => {
    if (!contract) {
      alert('Connect Wallet!');
      return;
    }
    try {
      const amountOfFee = await contract.changeRegistrationFee(newFee);
      await amountOfFee.wait();
      console.log('amountOfFee', amountOfFee);
    } catch (error) {
      alert('An error occurred: ' + error.message);
    }
  };

  const getDomainController = async () => {
    if (!contract) {
      alert('Connect Wallet!');
      return;
    }
    try {
      console.log('domainInfo', domainInfo);
      const domainController = await contract.getDomainController(domainInfo);
      setDomainController(domainController);
      console.log('domainController', domainController);
    } catch (error) {
      alert('An error occurred: ' + error.message);
    }
  };

  const getControllerBalances = async () => {
    if (!contract) {
      alert('Connect Wallet!');
      return;
    }
    try {
      console.log('domainInfo', domainInfo);
      const controllerBalance = await contract.getControllerBalances(controllerAddress);
      setControllerBalance([Number(controllerBalance[0]), Number(controllerBalance[1])]);
      console.log('controllerBalance', controllerBalance);
    } catch (error) {
      alert('An error occurred: ' + error.message);
    }
  };

  const setDomainReward = async () => {
    if (!contract) {
      alert('Connect Wallet!');
      return;
    }
    try {
      console.log('domainInfo', domainInfo);
      const reward = await contract.setDomainReward(rewardForController, amountReward);
      console.log('reward', reward);
    } catch (error) {
      alert('An error occurred: ' + error.message);
    }
  };

  const getInfoDomainReward = async () => {
    if (!contract) {
      alert('Connect Wallet!');
      return;
    }
    try {
      const reward = await contract.getDomainReward(getDomainReward);
      setDomainRewardAmount(Number(reward));
      console.log('reward', reward);
    } catch (error) {
      alert('An error occurred: ' + error.message);
    }
  };

  const getRegisteredDomains = async () => {
    if (!contract) {
      alert('Connect Wallet!');
      return;
    }
    const filter = contract.filters.DomainRegistered();
    const results = await contract.queryFilter(filter);
    const domains = results.map(event => ({
      domain: event.args.domain,
      controller: event.args.controller
    }));
    console.log('domains', domains);
    setRegisteredDomains(domains);
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


  return (
    <div className='main-page'>
      <div className='connect-button'>
        <button className='connect-metamask' onClick={connectWallet}>{id ? id : 'Connect Wallet'}</button>
      </div>
      <div className='get-fee-container'>
        {registrationFee ? <>
          <b>${registrationFee}</b>
          {requiredEth ? <><b>≈</b><b>{(requiredEth / 10 ** 18).toFixed(4)} ETH</b></> : null}
          <button onClick={getRequiredETH}>Get required ETH</button></> : null}
        <button onClick={getRegisterFee}>Registration Fee</button>
      </div>
      <div className='set-fee-container'>
        <input value={newFee} onChange={(e) => setNewFee(e.target.value)} placeholder="New Fee" />
        <button onClick={setFee}>Set Fee</button>
      </div>
      <div className='registar-domain-container'>
        <input value={registerDomain} onChange={(e) => setRegisterDomain(e.target.value)} placeholder="Domain Name" />
        <input value={parentDomain} onChange={(e) => setParentDomain(e.target.value)} placeholder="Parent Domain Name" />
        <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" />
        <button onClick={registerDomainWithETH}>Register Domain with ETH</button>
        <button onClick={registerDomainWithUSDT}>Register Domain with USDT</button>
      </div>
      <div className='withdraw-funds-container'>
        <input value={fundsToWithdraw} onChange={(e) => setFundsToWithdraw(e.target.value)} placeholder="Amount to withdraw" />
        <div>
          <label>
            <input type="radio" value="eth" checked={selectedToken === 'eth'} onChange={() => setSelectedToken('eth')} /> ETH
          </label>
          <label>
            <input type="radio" value="usdt" checked={selectedToken === 'usdt'} onChange={() => setSelectedToken('usdt')} /> USDT
          </label>
        </div>
        <button onClick={withdrawFunds}>Withdraw Funds(only Owner)</button>
      </div>
      <div className='domains-registered-container'>
        {registeredDomains ?
          registeredDomains.map((domain, index) => (
            <div key={index}>
              <p>Domain: {domain.domain}</p>
              <p>Controller: {domain.controller}</p>
            </div>
          )) : null}
        <button onClick={getRegisteredDomains}>Get registered domains</button>
      </div>
      <div className='domain-controller-container'>
        <input value={domainInfo} onChange={(e) => setDomainInfo(e.target.value)} placeholder="domain" />
        <b>{domainController}</b>
        <button onClick={getDomainController}>Get domain controller</button>
      </div>
      <div className='contoller-balance-container'>
        <input value={controllerAddress} onChange={(e) => setControllerAddress(e.target.value)} placeholder="Address" />
        {controllerBalance && <>
          <b>{(controllerBalance[0] / 10 ** 18).toFixed(4)} ETH</b>
          <b>{controllerBalance[1]} USDT</b>
        </>}
        <button onClick={getControllerBalances}>Get controller balance</button>
      </div>
      <div className='set-domain-reward-container'>
        <input value={rewardForController} onChange={(e) => setRewardForController(e.target.value)} placeholder="domain" />
        <input value={amountReward} onChange={(e) => setAmountReward(e.target.value)} placeholder="amount" />
        <button onClick={setDomainReward}>Set domain reward</button>
      </div>
      <div className='get-domain-reward-container'>
        <input value={getDomainReward} onChange={(e) => setGetDomainReward(e.target.value)} placeholder="domain" />
        {domainRewardAmount && <b>$ {domainRewardAmount}</b>}
        <button onClick={getInfoDomainReward}>Get info domain reward</button>
      </div>
      <div className='withdraw-rewards-container'>
        <input value={rewardToWithdraw} onChange={(e) => setRewardToWithdraw(e.target.value)} placeholder="Amount to withdraw" />
        <div>
          <label>
            <input type="radio" value="eth" checked={selectedTokenForReward === 'eth'} onChange={() => setSelectedTokenForReward('eth')} /> ETH
          </label>
          <label>
            <input type="radio" value="usdt" checked={selectedTokenForReward === 'usdt'} onChange={() => setSelectedTokenForReward('usdt')} /> USDT
          </label>
        </div>
        <button onClick={withdrawReward}>Withdraw Reward</button>
      </div>

    </div>
  );
}

export default App;
