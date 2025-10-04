import express, { Request, Response } from 'express';
import cors from 'cors';
import { ethers, Contract } from 'ethers';
import dotenv from 'dotenv';
import { AddressLike } from 'ethers';

dotenv.config();

interface TokenBalance {
  address: string;
  balance: string;
  symbol: string;
}

interface ErrorResponse {
  error: string;
}

const app = express();
app.use(cors());
app.use(express.json());

// Setup provider
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || 'http://localhost:8545');

// Token ABI
const tokenABI = [
  'function balanceOf(address) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function symbol() view returns (string)'
] as const;

// Error handler middleware
const errorHandler = (err: Error, _req: Request, res: Response) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message });
};

// Routes
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.get('/api/token/balance/:address', async (req: Request, res: Response<TokenBalance | ErrorResponse>) => {
  try {
    const { address } = req.params;
    
    if (!ethers.isAddress(address)) {
      return res.status(400).json({ error: 'Invalid address' });
    }

    const tokenContract = new Contract(
      process.env.TOKEN_ADDRESS || '',
      tokenABI,
      provider
    );
    
    const balance = await tokenContract.balanceOf(address as AddressLike);
    const symbol = await tokenContract.symbol();
    
    res.json({
      address,
      balance: ethers.formatEther(balance),
      symbol
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
});

const PORT = process.env.PORT || 3001;

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});