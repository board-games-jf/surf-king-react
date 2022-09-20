import axios from 'axios'
import intl from 'react-intl-universal'

export const SUPPORTED_LOCALES = { en: 'en', ptBR: 'ptBR' }

const Internationalization = () => {
    let currentLocale = intl.determineLocale({
        cookieLocaleKey: 'lang',
    })
    if (!SUPPORTED_LOCALES[currentLocale]) {
        currentLocale = 'en'
    }

    return axios.get(`${process.env.PUBLIC_URL}/locales/${currentLocale}.json`).then((res) => {
        return intl.init({
            currentLocale,
            locales: {
                [currentLocale]: res.data,
            },
        })
    })
}

export default Internationalization
