const ENV = process.env.REACT_APP_ENV

export const API_URL = ENV === 'PROD' ? process.env.REACT_APP_API_URL : process.env.REACT_APP_DEV_API_URL
export const SITE_URL = window.location.origin.toString()
export const THUMB_IMG_URL = 'https://thumbs.atmegame.com/thumbs'
