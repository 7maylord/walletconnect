import React, { useState } from 'react';

interface TransactionFormProps {
  sendTransaction: (recipient: string, amount: string) => Promise<void>;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ sendTransaction }) => {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendTransaction(recipient, amount);
  };
  
  return (
    <div className="mt-4 bg-gray-800 p-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-3">Send ETH</h3>
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          placeholder="Recipient Address (0x...)" 
          className="p-2 mb-2 w-full bg-gray-700 border border-gray-600 rounded text-white" 
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
        />
        <div className="flex gap-2 mb-3">
          <input 
            type="text" 
            placeholder="Amount" 
            className="p-2 flex-1 bg-gray-700 border border-gray-600 rounded text-white" 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <span className="p-2 bg-gray-600 rounded">ETH</span>
        </div>
        <button
          type="submit"
          className="w-full p-3 border rounded-lg bg-blue-600 hover:bg-blue-500 transition"
        >
          Send Transaction
        </button>
      </form>
    </div>
  );
};

export default TransactionForm;