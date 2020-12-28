const inseeCodeSize = 5

export function extractCountFromId(id) {
    const regex = new RegExp(`^[A-Za-z0-9]{${inseeCodeSize}}-C-(\\d{3})$`);
    const match = id.match(regex)
    return match ? parseInt(match[1]) : undefined
}

export function createIdFromCount(insee, count) {
    if (insee.length !== inseeCodeSize) {
        throw `${insee} is not a valid insee code !`
    }
    if (count > 999) {
        throw `There are more than 999 areas for insee code ${insee}, which is not allowed !`
    }
    return `${insee}-C-${count.toString().padStart(3, '0')}`
}

export function fillCovoiturageIds(data) {
    const headers = data[0]
    const IdColumnIndex = headers.indexOf('id_lieu')
    const InseeColumnIndex = headers.indexOf('insee')
    let countMap = {}
    for (let [index, row] of data.entries()) {
        if (index > 0) {
            const insee = row[InseeColumnIndex]
            if (!insee) {
                continue;
            }
            const rowId = row[IdColumnIndex]
            if (rowId === '') {
                const nextCount = (countMap[insee] || 0) + 1
                row[IdColumnIndex] = createIdFromCount(insee, nextCount)
                countMap[insee] = nextCount
            }
            else {
                const count = extractCountFromId(rowId)
                countMap[insee] = Math.max(count, countMap[insee] || 1)
            }
        }
    }
    return data
}
