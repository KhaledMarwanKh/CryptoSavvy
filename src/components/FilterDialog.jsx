import React, { useEffect, useRef, useState } from 'react'
import { FaX } from 'react-icons/fa6';

const FilterDialog = ({ filterConfig, sortConfig, setFilterConfig, setSortConfig }) => {
    const ref = useRef(null);

    const [config, setConfig] = useState({
        filterConfig: {
            volume: {
                min: filterConfig.volume.min,
                max: filterConfig.volume.max
            },
            marketCap: {
                min: filterConfig.marketCap.min,
                max: filterConfig.marketCap.max
            },
            price: {
                min: filterConfig.price.min,
                max: filterConfig.price.max
            },
        },
        sortConfig: {
            key: sortConfig.key,
            direction: sortConfig.direction
        }
    })

    const handleClickOutSide = ({ target }) => {

        if (ref.current && !ref.current.contains(target)) {
            setFilterConfig((prev) => ({ ...prev, applyFilters: false }));
        }

    };

    const apply = () => {
        setFilterConfig(config.filterConfig);
        setSortConfig(config.sortConfig);
    }

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutSide);

        return () => document.removeEventListener('mousedown', handleClickOutSide);
    }, [])

    const reset = () => {
        setFilterConfig({
            applyFilters: false,
            volume: {
                min: Number.POSITIVE_INFINITY,
                max: Number.NEGATIVE_INFINITY
            },
            marketCap: {
                min: Number.POSITIVE_INFINITY,
                max: Number.NEGATIVE_INFINITY
            },
            price: {
                min: Number.POSITIVE_INFINITY,
                max: Number.NEGATIVE_INFINITY
            },
        });

        setSortConfig({
            key: 'rank',
            direction: 'asc'
        });
    }

    return (
        <div ref={ref} className='bg-gray-900 px-5 py-5 rounded-lg fixed top-[55%] left-1/2 translate-x-[-50%] translate-y-[-50%] w-[90%] border border-gray-700 animate-in slide-in-from-bottom '>
            <h1 className='text-xl md:text-2xl font-bold mb-3 flex items-center justify-between'>
                Filters

                <button onClick={() => {
                    setFilterConfig((prev) => ({ ...prev, applyFilters: false }))
                    reset();
                }} className='p-2 hover:bg-gray-600 hover:font-bold rounded-lg transition-all duration-100'>
                    <FaX className='text-[1.1rem]' />
                </button>
            </h1>

            <div className='w-full'>
                <div className="mb-6">
                    <label className='block mb-2 font-semibold' htmlFor="min-volume">Volume</label>
                    <div className='grid grid-cols-2 gap-4'>
                        <input
                            onChange={(e) => setConfig((prev) => ({
                                ...prev, filterConfig: {
                                    ...prev.filterConfig,
                                    volume: {
                                        ...prev.filterConfig.volume,
                                        min: parseFloat(e.target.value) || 0
                                    }
                                }
                            }))}
                            value={config.filterConfig.volume.min === Number.POSITIVE_INFINITY ? "" : config.filterConfig.volume.min}
                            className='px-2 py-3 rounded-lg bg-gray-700 border border-gray-500 focus:ring-blue-500 focus:border-blue-600 transition duration-150 text-left outline-none' id='min-volume' type="text" placeholder='Min Volume' />
                        <input
                            onChange={(e) => setConfig((prev) => ({
                                ...prev, filterConfig: {
                                    ...prev.filterConfig,
                                    volume: {
                                        ...prev.filterConfig.volume,
                                        max: parseFloat(e.target.value) || 0
                                    }
                                }
                            }))}
                            value={config.filterConfig.volume.max === Number.NEGATIVE_INFINITY ? "" : config.filterConfig.volume.max}
                            className='px-2 py-3 rounded-lg bg-gray-700 border border-gray-500 focus:ring-blue-500 focus:border-blue-600 transition duration-150 text-left outline-none' type="text" placeholder='Max Volume' />
                    </div>
                </div>

                <div className="mb-6">
                    <label className='block mb-2 font-semibold' htmlFor="min-market">Market Cap</label>
                    <div className='grid grid-cols-2 gap-4'>
                        <input
                            onChange={(e) => setConfig((prev) => ({
                                ...prev, filterConfig: {
                                    ...prev.filterConfig,
                                    marketCap: {
                                        ...prev.filterConfig.marketCap,
                                        min: parseFloat(e.target.value) || 0
                                    }
                                }
                            }))}
                            value={config.filterConfig.marketCap.min === Number.POSITIVE_INFINITY ? "" : config.filterConfig.marketCap.min}
                            className='px-2 py-3 rounded-lg bg-gray-700 border border-gray-500 focus:ring-blue-500 focus:border-blue-600 transition duration-150 text-left outline-none' id='min-market' type="text" placeholder='Min Cap' />
                        <input
                            onChange={(e) => setConfig((prev) => ({
                                ...prev, filterConfig: {
                                    ...prev.filterConfig,
                                    marketCap: {
                                        ...prev.filterConfig.marketCap,
                                        min: parseFloat(e.target.value)
                                    }
                                }
                            }))}
                            value={config.filterConfig.marketCap.max === Number.NEGATIVE_INFINITY ? "" : config.filterConfig.marketCap.max}
                            className='px-2 py-3 rounded-lg bg-gray-700 border border-gray-500 focus:ring-blue-500 focus:border-blue-600 transition duration-150 text-left outline-none' type="text" placeholder='Max Cap' />
                    </div>
                </div>

                <div className="mb-6">
                    <label className='block mb-2 font-semibold' htmlFor="min-price">Price</label>
                    <div className='grid grid-cols-2 gap-4'>
                        <input
                            onChange={(e) => setConfig((prev) => ({
                                ...prev, filterConfig: {
                                    ...prev.filterConfig,
                                    price: {
                                        ...prev.filterConfig.price,
                                        min: parseFloat(e.target.value) || 0
                                    }
                                }
                            }))}
                            value={config.filterConfig.price.min === Number.POSITIVE_INFINITY ? "" : config.filterConfig.price.min}
                            className='px-2 py-3 rounded-lg bg-gray-700 border border-gray-500 focus:ring-blue-500 focus:border-blue-600 transition duration-150 text-left outline-none' id='min-price' type="text" placeholder='Min Price' />
                        <input
                            onChange={(e) => setConfig((prev) => ({
                                ...prev, filterConfig: {
                                    ...prev.filterConfig,
                                    price: {
                                        ...prev.filterConfig.price,
                                        max: parseFloat(e.target.value) || 0
                                    }
                                }
                            }))}
                            value={config.filterConfig.price.max === Number.NEGATIVE_INFINITY ? "" : config.filterConfig.price.max}
                            className='px-2 py-3 rounded-lg bg-gray-700 border border-gray-500 focus:ring-blue-500 focus:border-blue-600 transition duration-150 text-left outline-none' type="text" placeholder='Max Price' />
                    </div>
                </div>

                <div className="mb-6">
                    <label className='block mb-2 font-semibold' htmlFor="sort-key">Sort By</label>
                    <div className='grid grid-cols-2 gap-4'>
                        <select onChange={(e) => {
                            setConfig((prev) => ({
                                ...prev,
                                sortConfig: {
                                    ...prev.sortConfig,
                                    key: e.target.value
                                }
                            }))
                        }} value={config.sortConfig.key} className="p-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-blue-500 focus:border-blue-500 appearance-none transition duration-150 text-left" name="key" id="sort-key">
                            <option value="index">Rank</option>
                            <option value="name">Name</option>
                            <option value="price">Price</option>
                            <option value="change24h">24H Change</option>
                            <option value="low24h">Low 24h</option>
                            <option value="high24h">High 24h</option>
                            <option value="marketCap">Market Cap</option>
                            <option value="volume">Volume 24H</option>
                            <option value="circulatingSupply">Circulating Supply</option>
                        </select>

                        <select
                            onChange={(e) => {
                                setConfig((prev) => ({
                                    ...prev,
                                    sortConfig: {
                                        ...prev.sortConfig,
                                        direction: e.target.value
                                    }
                                }))
                            }} value={config.sortConfig.direction} className="p-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-blue-500 focus:border-blue-500 appearance-none transition duration-150 text-left" name="key" id="sort-key">
                            <option value="asc">Ascendent</option>
                            <option value="desc">Descendent</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className='flex items-center justify-start gap-3'>
                <button className='px-5 py-2 bg-blue-700 rounded-lg cursor-pointer font-bold active:bg-gray-500' onClick={apply} >Apply</button>
                <button className='px-5 py-2 bg-gray-600 rounded-lg font-semibold active:bg-gray-700' onClick={reset}>Reset</button>
            </div>

        </div>
    )
}

export default FilterDialog