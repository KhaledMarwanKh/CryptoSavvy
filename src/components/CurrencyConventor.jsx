import { useState } from "react";
import { DollarSign, Repeat2 } from "lucide-react";
import { formatLargeNumbers } from "../utils/formattor";
import { useTranslation } from "react-i18next";

const rates = {
    USD: { rate: 1.00, symbol: '$', name: 'US Dollar' },
    EUR: { rate: 0.92, symbol: '€', name: 'Euro' },
    GBP: { rate: 0.80, symbol: '£', name: 'British Pound' },
    SAR: { rate: 3.75, symbol: 'SAR', name: 'Saudi Riyal' },
};

const CurrencyConverter = ({ cryptoList }) => {
    const { t, i18n } = useTranslation();
    const [cryptoAmount, setCryptoAmount] = useState(0);
    const [selectedCryptoId, setSelectedCryptoId] = useState('bitcoin');
    const [selectedFiat, setSelectedFiat] = useState('USD');

    const currentCrypto = cryptoList.find(c => c.id === selectedCryptoId) || cryptoList[0];
    const fiatRate = rates[selectedFiat].rate;
    const fiatSymbol = rates[selectedFiat].symbol;

    const cryptoPriceUSD = currentCrypto ? currentCrypto.price : 0;
    const convertedValue = (cryptoAmount * cryptoPriceUSD * fiatRate);

    return (
        <div className="bg-slate-900/70 flex-grow p-5 rounded-xl shadow-lg border border-slate-700/50 space-y-4">
            {/* Input Crypto Amount */}
            <div>
                <label htmlFor="cryptoAmount" className="block text-xs font-medium text-slate-300 mb-1">{t("dashboard.convertor.amount")}</label>
                <input
                    id="cryptoAmount"
                    type="number"
                    value={cryptoAmount}
                    onChange={(e) => setCryptoAmount(Math.max(0, parseFloat(e.target.value)))}
                    className="w-full p-2 text-gray-400 bg-slate-950/60 border border-slate-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 text-left"
                    placeholder={t("dahsboard.convertor.inputsPlaceholder.enterAmount")}
                    min="0"
                />
            </div>

            {/* Select Crypto */}
            <div>
                <label htmlFor="selectCrypto" className="block text-xs font-medium text-slate-300 mb-1">{t("dashboard.convertor.cryptoCurrency")}</label>
                <select
                    id="selectCrypto"
                    value={selectedCryptoId}
                    onChange={(e) => setSelectedCryptoId(e.target.value)}
                    className="w-full p-2 text-gray-400 bg-slate-950/60 border border-slate-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 text-left"
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
                <label htmlFor="selectFiat" className="block text-xs font-medium text-slate-300 mb-1">{t("dashboard.convertor.fiatCurrency")}</label>
                <select
                    id="selectFiat"
                    value={selectedFiat}
                    onChange={(e) => setSelectedFiat(e.target.value)}
                    className="w-full p-2 text-gray-400 bg-slate-950/60 border border-slate-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 text-left"
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
                    {t("dashboard.convertor.totalValueIn")} {rates[selectedFiat].name}:
                </p>
                <div className="text-2xl font-bold text-green-400 bg-gray-700/50 p-3 rounded-lg text-center font-mono">
                    {formatLargeNumbers(convertedValue)?.toLocaleString()} {fiatSymbol}
                </div>
                <p className="text-xs text-gray-500 mt-1 text-center">
                    {t("dashboard.convertor.currentPriceOf")} {currentCrypto?.baseSymbol}: {formatLargeNumbers(cryptoPriceUSD)?.toLocaleString()} $
                </p>
            </div>
        </div>
    );
};

export default CurrencyConverter;
