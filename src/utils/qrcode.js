import QRCode from 'qrcode'

export const genrateQRcode = async(data) => {
    const result = await QRCode.toDataURL(JSON.stringify(data))
    return result
}