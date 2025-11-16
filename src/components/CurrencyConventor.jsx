import { useState } from "react";
import { formatCurrency } from "../data/cryptoData";
import { DollarSign, Repeat2 } from "lucide-react";

const CurrencyConverter = ({ cryptoList, rates }) => {
    const [cryptoAmount, setCryptoAmount] = useState(0);
    const [selectedCryptoId, setSelectedCryptoId] = useState('bitcoin');
    const [selectedFiat, setSelectedFiat] = useState('USD');

    const currentCrypto = cryptoList.find(c => c.id === selectedCryptoId) || cryptoList[0];
    const fiatRate = rates[selectedFiat].rate;
    const fiatSymbol = rates[selectedFiat].symbol;

    const cryptoPriceUSD = currentCrypto ? currentCrypto.price : 0;
    const convertedValue = (cryptoAmount * cryptoPriceUSD * fiatRate);

    return (
        <div className="bg-[#0f1115] p-5 rounded-xl shadow-lg border border-gray-700 space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center border-b border-gray-700 pb-2">
                <Repeat2 className="w-5 h-5 text-blue-400 mr-2" />
                Quick Currency Converter
            </h2>

            {/* Input Crypto Amount */}
            <div>
                <label htmlFor="cryptoAmount" className="block text-xs font-medium text-gray-400 mb-1">Amount</label>
                <input
                    id="cryptoAmount"
                    type="number"
                    value={cryptoAmount}
                    onChange={(e) => setCryptoAmount(Math.max(0, parseFloat(e.target.value)))}
                    className="w-full p-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 text-left"
                    placeholder="Enter Amount"
                    min="0"
                />
            </div>

            {/* Select Crypto */}
            <div>
                <label htmlFor="selectCrypto" className="block text-xs font-medium text-gray-400 mb-1">Crypto Currency</label>
                <select
                    id="selectCrypto"
                    value={selectedCryptoId}
                    onChange={(e) => setSelectedCryptoId(e.target.value)}
                    className="w-full p-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-blue-500 focus:border-blue-500 appearance-none transition duration-150 text-left"
                >
                    {cryptoList.map(crypto => (
                        <option key={crypto.id} value={crypto.id}>
                            {crypto.name} ({crypto.symbol})
                        </option>
                    ))}
                </select>
            </div>

            {/* Select Fiat */}
            <div>
                <label htmlFor="selectFiat" className="block text-xs font-medium text-gray-400 mb-1">Fiat Currency</label>
                <select
                    id="selectFiat"
                    value={selectedFiat}
                    onChange={(e) => setSelectedFiat(e.target.value)}
                    className="w-full p-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-blue-500 focus:border-blue-500 appearance-none transition duration-150 text-left"
                >
                    {Object.entries(rates).map(([key, value]) => (
                        <option key={key} value={key}>
                            {value.name} ({value.symbol})
                        </option>
                    ))}
                </select>
            </div>

            {/* Result Display */}
            <div className="pt-3 border-t border-gray-700">
                <p className="text-sm text-gray-400 mb-1 flex items-center">
                    <DollarSign className="w-4 h-4 text-green-400 mr-1" />
                    Total Value in {rates[selectedFiat].name}:
                </p>
                <div className="text-2xl font-bold text-green-400 bg-gray-700/50 p-3 rounded-lg text-center font-mono">
                    {formatCurrency(convertedValue || 0)} {fiatSymbol}
                </div>
                <p className="text-xs text-gray-500 mt-1 text-center">
                    Current Price of {currentCrypto.symbol}: {formatCurrency(cryptoPriceUSD || 0)} $
                </p>
            </div>
        </div>
    );
};

export default CurrencyConverter;
