import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './App.css';

const tokenABI = [
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function symbol() view returns (string)"
];

function App() {
  const [account, setAccount] = useState('');
  const [balance, setBalance] = useState('0');
  const [contract, setContract] = useState(null);

  useEffect(() => {
    const init = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const tokenContract = new ethers.Contract(
            process.env.REACT_APP_TOKEN_ADDRESS,
            tokenABI,
            signer
          );

          setContract(tokenContract);
          setAccount(await signer.getAddress());

          // Get initial balance
          const balance = await tokenContract.balanceOf(await signer.getAddress());
          setBalance(ethers.formatEther(balance));
        } catch (error) {
          console.error('Error initializing:', error);
        }
      }
    };

    init();
  }, []);

  const handleTransfer = async (to: string, amount: string) => {
    try {
      if (!contract) throw new Error('Contract not initialized');
      const tx = await contract.transfer(to, ethers.parseEther(amount));
      await tx.wait();
      
      // Update balance after transfer
      const newBalance = await contract.balanceOf(account);
      setBalance(ethers.formatEther(newBalance));
    } catch (error) {
      console.error('Error transferring tokens:', error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Web3 Token App</h1>
        {account ? (
          <div>
            <p>Connected Account: {account}</p>
            <p>Token Balance: {balance}</p>
            {/* Add transfer form here */}
          </div>
        ) : (
          <button onClick={async () => {
            const accounts = await window.ethereum.request({
              method: 'eth_requestAccounts'
            });
            setAccount(accounts[0]);
          }}>
            Connect Wallet
          </button>
        )}
      </header>
    </div>
  );
}

export default App;