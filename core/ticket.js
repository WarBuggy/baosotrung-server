let common = require('../common/common.js');

module.exports = {
    type: {
        1: {
            name: 'Miền Nam',
            rssProvider: [1, 2, 3,],
            crawlRss: true,
            crawlSchedule: true,
            crawlTime: '16:35:00',
            maxCrawlTime: '17:10:00',
            defaultPrize: 1,
            createResultData: createResultDataType1,
        },
        2: {
            name: 'Miền Trung',
        },
        3: {
            name: 'Miền Bắc',
        },
        4: {
            name: 'Vietlot',
        },
    },

    publisher: {
        1: {
            name: 'TPHCM',
            rssURLKey: {
                1: 'tp.hcm-hcm',
                2: 'tp-hcm-xshcm',
                3: 'xsHCM',
            },
            callDay: [1, 6],
            type: 1,
        },
        2: {
            name: 'Đồng Tháp',
            rssURLKey: {
                1: 'dong-thap-dt',
                2: 'dong-thap-xsdt',
                3: 'xsDT',
            },
            callDay: [1],
            type: 1,
        },
        3: {
            name: 'Cà Mau',
            rssURLKey: {
                1: 'ca-mau-cm',
                2: 'ca-mau-xscm',
                3: 'xsCM',
            },
            callDay: [1],
            type: 1,
        },
        4: {
            name: 'Bến Tre',
            rssURLKey: {
                1: 'ben-tre-btr',
                2: 'ben-tre-xsbt',
                3: 'xsBT',
            },
            callDay: [2],
            type: 1,
        },
        5: {
            name: 'Vũng Tàu',
            rssURLKey: {
                1: 'vung-tau-vt',
                2: 'vung-tau-xsvt',
                3: 'xsVT',
            },
            callDay: [2],
            type: 1,
        },
        6: {
            name: 'Bạc Liêu',
            rssURLKey: {
                1: 'bac-lieu-bl',
                2: 'bac-lieu-xsbl',
                3: 'xsBL',
            },
            callDay: [2],
            type: 1,
        },
        7: {
            name: 'Đồng Nai',
            rssURLKey: {
                1: 'dong-nai-dn',
                2: 'dong-nai-xsdn',
                3: 'xsDN',
            },
            callDay: [3],
            type: 1,
        },
        8: {
            name: 'Cần Thơ',
            rssURLKey: {
                1: 'can-tho-ct',
                2: 'can-tho-xsct',
                3: 'xsCT',
            },
            callDay: [3],
            type: 1,
        },
        9: {
            name: 'Sóc Trăng',
            rssURLKey: {
                1: 'soc-trang-st',
                2: 'soc-trang-xsst',
                3: 'xsST',
            },
            callDay: [3],
            type: 1,
        },
        10: {
            name: 'Tây Ninh',
            rssURLKey: {
                1: 'tay-ninh-tn',
                2: 'tay-ninh-xstn',
                3: 'xsTN',
            },
            callDay: [4],
            type: 1,
        },
        11: {
            name: 'An Giang',
            rssURLKey: {
                1: 'an-giang-ag',
                2: 'an-giang-xsag',
                3: 'xsAG',
            },
            callDay: [4],
            type: 1,
        },
        12: {
            name: 'Bình Thuận',
            rssURLKey: {
                1: 'binh-thuan-bth',
                2: 'binh-thuan-xsbth',
                3: 'xsBTH',
            },
            callDay: [4],
            type: 1,
        },
        13: {
            name: 'Vĩnh Long',
            rssURLKey: {
                1: 'vinh-long-vl',
                2: 'vinh-long-xsvl',
                3: 'xsVL',
            },
            callDay: [5],
            type: 1,
        },
        14: {
            name: 'Bình Dương',
            rssURLKey: {
                1: 'binh-duong-bd',
                2: 'binh-duong-xsbd',
                3: 'xsBD',
            },
            callDay: [5],
            type: 1,
        },
        15: {
            name: 'Trà Vinh',
            rssURLKey: {
                1: 'tra-vinh-tv',
                2: 'tra-vinh-xstv',
                3: 'xsTV',
            },
            callDay: [5],
            type: 1,
        },
        16: {
            name: 'Long An',
            rssURLKey: {
                1: 'long-an-la',
                2: 'long-an-xsla',
                3: 'xsLA',
            },
            callDay: [6],
            type: 1,
        },
        17: {
            name: 'Bình Phước',
            rssURLKey: {
                1: 'binh-phuoc-bp',
                2: 'binh-phuoc-xsbp',
                3: 'xsBP',
            },
            callDay: [6],
            type: 1,
        },
        18: {
            name: 'Hậu Giang',
            rssURLKey: {
                1: 'hau-giang-hg',
                2: 'hau-giang-xshg',
                3: 'xsHG',
            },
            callDay: [6],
            type: 1,
        },
        19: {
            name: 'Tiền Giang',
            rssURLKey: {
                1: 'tien-giang-tg',
                2: 'tien-giang-xstg',
                3: 'xsTG',
            },
            callDay: [0],
            type: 1,
        },
        20: {
            name: 'Kiên Giang',
            rssURLKey: {
                1: 'kien-giang-kg',
                2: 'kien-giang-xskg',
                3: 'xsKG',
            },
            callDay: [0],
            type: 1,
        },
        21: {
            name: 'Lâm Đồng',
            rssURLKey: {
                1: 'da-lat-dl',
                2: 'lam-dong-xsld',
                3: 'xsLD',
            },
            callDay: [0],
            type: 1,
        },
    },
};

//#region Miền Nam (Type 1)
function createResultDataType1(parseData, publisher, providerData) {
    let result = parseDataType1(parseData, publisher, providerData);
    if (result === false) {
        return null;
    }
    let specialSeries = result['0'][0];
    let secondarySpecialSeries = createSecondarySpecialSeries(specialSeries);
    result['10'] = secondarySpecialSeries;
    let consolationSpecialSeries = createConsolationSpecialSeries(specialSeries);
    result['11'] = consolationSpecialSeries;
    return result;
};

function createSecondarySpecialSeries(specialSeries) {
    let result = [];
    let firstNumber = parseInt(specialSeries[0]);
    let restOfSeries = specialSeries.slice(1, 6);
    for (let i = 0; i < 10; i++) {
        if (i != firstNumber) {
            let aResult = i + restOfSeries;
            result.push(aResult);
        }
    }
    return result;
};

function createConsolationSpecialSeries(specialSeries) {
    let result = [];
    for (let i = 1; i < specialSeries.length; i++) {
        let aNumber = parseInt(specialSeries[i]);
        let beginOfSeries = specialSeries.slice(0, i);
        let endOfSeries = specialSeries.slice(i + 1);
        for (let i = 0; i < 10; i++) {
            if (i != aNumber) {
                let aResult = beginOfSeries + i + endOfSeries;
                result.push(aResult);
            }
        }
    }
    return result;
};

function parseDataType1(parseData, publisher, providerData) {
    let checkParseDataArrayLengthResult = checkParseDataArrayLengthType1(parseData);
    if (checkParseDataArrayLengthResult !== true) {
        common.errorLog('Error while parsing feed for ' + publisher.name + ', ' + providerData.name + '.' +
            'Invalid result array length.\n' + checkParseDataArrayLengthResult,
            providerData.consoleColor);
        return false;
    }
    let result = extractResultFromParseDataType1(parseData);
    if (result.error === true) {
        common.errorLog('Error while parsing feed for ' + publisher.name + ', ' + providerData.name + '.' +
            'Invalid numeric value or invalid length.\n' + result.invalidArray,
            providerData.consoleColor);
        return false;
    }
    return result;
};

function extractResultFromParseDataType1(parseData) {
    let result = {
        8: extractSeriesFromResultArrayType1(parseData[2], 0, 1, 2),
        7: extractSeriesFromResultArrayType1(parseData[3], 0, 1, 3),
        6: extractSeriesFromResultArrayType1(parseData[4], 0, 3, 4),
        5: extractSeriesFromResultArrayType1(parseData[4], 3, 1, 4),
        4: extractSeriesFromResultArrayType1(parseData[5], 0, 7, 5),
        3: extractSeriesFromResultArrayType1(parseData[5], 7, 2, 5),
        2: extractSeriesFromResultArrayType1(parseData[5], 9, 1, 5),
        1: extractSeriesFromResultArrayType1(parseData[5], 10, 1, 5),
        0: extractSeriesFromResultArrayType1(parseData[6], 0, 1, 6),
    };
    let prizeId = Object.keys(result);
    for (let i = 0; i < prizeId.length; i++) {
        let aPrizeId = prizeId[i];
        let aResult = result[aPrizeId];
        if (!Array.isArray(aResult)) {
            result.error = true;
            result.invalidArray[aResult.expectedLength] = aResult.array;
        }
    }
    return result;
};

// return an array if numbers are extracted successfully.
// return an object contains error details if not.
function extractSeriesFromResultArrayType1(array, startIndex, times, expectedLength) {
    let result = [];
    startIndex = Math.max(startIndex, 0);
    for (let i = startIndex; i < startIndex + times && i < array.length; i++) {
        let anElement = array[i];
        anElement = anElement.trim().replace(/\s/gm, '');
        let number = parseInt(anElement);
        let error = false;
        if (!common.isNumeric(number)) {
            error = true;
        } else if (anElement.length != expectedLength) {
            error = true;
        }
        if (error === true) {
            return {
                array,
                expectedLength,
            };
        }
        result.push(anElement);
    }
    return result;
};

function checkParseDataArrayLengthType1(parseData) {
    if (parseData[2].length != 1 ||
        parseData[3].length != 1 ||
        parseData[4].length != 4 ||
        parseData[5].length != 11 ||
        parseData[6].length != 1) {
        return {
            2: parseData[2].length + '/1',
            3: parseData[3].length + '/1',
            4: parseData[4].length + '/4',
            5: parseData[5].length + '/11',
            6: parseData[6].length + '/1',
        };
    }
    return true;
};
//#endregion
