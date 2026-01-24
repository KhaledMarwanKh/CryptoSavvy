export const getFilteredData = (searchTerm, sortConfig, crypto, filterConfig) => {
    let sortableData = [...crypto];

    if (searchTerm !== '') {
        const lowerCaseSearch = searchTerm.toLowerCase();
        sortableData = sortableData.filter(crypto =>
            crypto.symbol.toLowerCase().includes(lowerCaseSearch) ||
            crypto.baseSymbol.toLowerCase().includes(lowerCaseSearch)
        );
    }

    if (sortConfig.key) {
        sortableData.sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];

            if (aValue < bValue) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }

    if (filterConfig.marketCap.min !== Number.POSITIVE_INFINITY) {
        console.log(1)
        sortableData = sortableData.filter(crypto => crypto.marketCap >= filterConfig.marketCap.min);
    }

    if (filterConfig.marketCap.max !== Number.NEGATIVE_INFINITY) {
        sortableData = sortableData.filter(crypto => crypto.marketCap <= filterConfig.marketCap.max);
    }

    if (filterConfig.volume.min !== Number.POSITIVE_INFINITY) {
        sortableData = sortableData.filter(crypto => crypto.volume >= filterConfig.volume.min);
    }

    if (filterConfig.volume.max !== Number.NEGATIVE_INFINITY) {
        sortableData = sortableData.filter(crypto => crypto.volume <= filterConfig.volume.max);
    }

    if (filterConfig.price.min !== Number.POSITIVE_INFINITY) {
        sortableData = sortableData.filter(crypto => crypto.price >= filterConfig.price.min);
    }

    if (filterConfig.price.max !== Number.NEGATIVE_INFINITY) {
        sortableData = sortableData.filter(crypto => crypto.price <= filterConfig.price.max);
    }

    return sortableData;

}