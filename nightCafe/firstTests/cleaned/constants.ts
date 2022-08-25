import { ActionCodeSettings } from 'firebase/auth'

export const IS_PRODUCTION = process.env.STAGE === 'production'

export const APP_URL = IS_PRODUCTION
  ? 'https://creator.nightcafe.studio'
  : 'https://creator-staging.nightcafe.studio'

export const ADMIN_PATH = '/admin-vneqi9q2'

export const FIRESTORE = {
  USERS_COLLECTION: 'users',
  JOBS_COLLECTION: 'jobs',
  STYLES_COLLECTION: 'styles',
  CONTENT_IMAGES_COLLECTION: 'content_images',
  UPLOADS_COLLECTION: 'uploads',
  MODIFIER_FAVOURITES_COLLECTION: 'modifier_favourites',
  MASKS_COLLECTION: 'masks',
  USER_SAFE_COLLECTION: 'safe',
  USER_SAFE_CREDITS_DOC: 'credits',
  USER_SAFE_PRIVATE_DOC: 'private',
  USER_BADGES_COLLECTION: 'user_badges',
  USER_FEED_ITEMS_COLLECTION: 'user_feed_items',
  USER_BANS_COLLECTION: 'user_bans',
  INBOX_MESSAGES_COLLECTION: 'inboxMessages',
  META_COLLECTION: 'meta',
  META_STATS_DOC: 'stats',
  FOLLOWS_COLLECTION: 'follows',
  BLOCKS_COLLECTION: 'blocks',
  COMMENTS_COLLECTION: 'comments',
  COLLECTIONS_COLLECTION: 'collections',
  COLLECTION_ITEMS_COLLECTION: 'collection_items',
  REPORT_CARDS_COLLECTION: 'report_cards'
}

export const LOGIN_PROVIDER_NAME_MAP = {
  'google.com': 'Google',
  'facebook.com': 'Facebook',
  password: 'password',
  passwordless: 'magic link'
}

export const FIREBASE_CONFIG = IS_PRODUCTION
  ? {
      apiKey: 'AIzaSyD_bN4JwaaUIuYIOZ2cTvHrh0LRUYTXnfI',
      authDomain: 'nc-auth.nightcafe.studio',
      databaseURL: 'https://nightcafe-creator.firebaseio.com',
      projectId: 'nightcafe-creator',
      storageBucket: 'nightcafe-creator.appspot.com',
      messagingSenderId: '387174971425',
      appId: '1:387174971425:web:4f1aa887d31c7bd4a1cb60',
      measurementId: 'G-HES1SX2TR3'
    }
  : {
      apiKey: 'AIzaSyDdMNVarsfTfre_jy8XoaaFeJxHtUHaLMQ',
      authDomain: 'nc-auth-staging.nightcafe.studio',
      databaseURL: 'https://diy-style-transfer.firebaseio.com',
      projectId: 'diy-style-transfer',
      storageBucket: 'diy-style-transfer.appspot.com',
      messagingSenderId: '780759405712',
      appId: '1:780759405712:web:450dbcab5c47a0dd407415',
      measurementId: 'G-3KQGR17K0R'
    }

export const CLOUD_FUNCTIONS_BASE_URL = IS_PRODUCTION
  ? 'https://us-central1-nightcafe-creator.cloudfunctions.net/api'
  : 'https://us-central1-diy-style-transfer.cloudfunctions.net/api'
export const EXPORT_API_BASE_URL = IS_PRODUCTION
  ? 'https://us-central1-nightcafe-creator.cloudfunctions.net/exportApi'
  : 'https://us-central1-diy-style-transfer.cloudfunctions.net/exportApi'

export const CLOUD_STORAGE_BASE_URL = IS_PRODUCTION
  ? 'https://storage.googleapis.com/nightcafe-creator.appspot.com'
  : 'https://storage.googleapis.com/diy-style-transfer.appspot.com'

export const IMAGEKIT_PROD_BASE_URL = 'https://images.nightcafe.studio/'
export const IMAGEKIT_STAGING_BASE_URL =
  'https://images.nightcafe.studio/staging/'
export const IMAGEKIT_BASE_URL = IS_PRODUCTION
  ? IMAGEKIT_PROD_BASE_URL
  : IMAGEKIT_STAGING_BASE_URL
export const IMAGEKIT_MAX_IMAGE_SIZE = 2000

export const FIREBASE_MESSAGING_PUBLIC_VAPID_KEY = IS_PRODUCTION
  ? 'BJJ5ctwFM2HfYwoP5m0Fwe1Qngdzm8PFadoRJ1s6PT-xzj56sACtYWNM3t403Eb52PrNOxARK7l0StFfCNBmdIA'
  : 'BDZzG8KAM4PfCa_MFgHqOy27RkTTbgEHC1mmXN5TAK6stDqgPGaI_Lt8xB9MpmSxc5FYlBlYgDvpN1-CtG306ck'

export const PRODUCT_URL_BASE = 'https://nightcafe.studio/products/'
export const BUY_CREDITS_URL =
  'https://nightcafe.studio/products/nightcafe-creator-credits'
export const DISCOUNT_URL_BASE = 'https://nightcafe.studio/discount/'

export const FIREBASE_AUTH_PASSWORDLESS_SETTINGS: ActionCodeSettings = {
  url: `${APP_URL}/`,
  handleCodeInApp: true,
  dynamicLinkDomain: IS_PRODUCTION
    ? 'creator-link.nightcafe.studio'
    : 'creator-link-staging.nightcafe.studio'
}
export const FIREBASE_AUTH_PASSWORD_RESET_SETTINGS: ActionCodeSettings = {
  ...FIREBASE_AUTH_PASSWORDLESS_SETTINGS,
  url: `${APP_URL}/login`
}

export const TERMS_CONDITIONS_LINK =
  'https://nightcafe.studio/policies/terms-of-service'

export const DISCORD_INVITE_LINK = 'https://discord.gg/AckSBWnn2w'

// These are both currently the staging key
// Replace when we're confident we've got a good amplitude integration
export const AMPLITUDE_API_KEY = IS_PRODUCTION
  ? '42a48479f8dca03a235eb4234afd1334'
  : '42a48479f8dca03a235eb4234afd1334'

export const FACEBOOK_APP_ID = IS_PRODUCTION
  ? '2364225430559658'
  : '715038015572301'

export const SHOPIFY_STOREFRONT_ACCESS_TOKEN =
  'cbd0906f1b4d6ebc254009a7ba82e53f'
export const SHOPIFY_CREDITS_PRODUCT_ID =
  'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0LzQ3Mjg0MTY3OTY3NTE='
export const SHOPIFY_PRO_PRODUCT_ID =
  'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0Lzc3MTMxNDcyMjQzMTU='
export const SHOPIFY_PRO_SELLING_PLAN_ID =
  'Z2lkOi8vc2hvcGlmeS9TZWxsaW5nUGxhbi8yNDcyOTY4NDQz' // 'gid://shopify/SellingPlan/2472968443'

export const LAST_AFFILIATE_LOCALSTORAGE_KEY = 'lastAffiliateCode'

/**
 * These pro levels must be kept in sync with the back end AND the shopify variants.
 * Most of this is also available on the Shopify variant, except for the creditsPerMonth.
 */
export const PRO_LEVELS: NCProLevel[] = [
  {
    levelId: 1,
    title: 'AI Hobbyist',
    creditsPerMonth: 100
  },
  { levelId: 2, title: 'AI Enthusiast', creditsPerMonth: 250 },
  { levelId: 3, title: 'AI Artist', creditsPerMonth: 700 },
  { levelId: 4, title: 'AI Professional', creditsPerMonth: 1500 }
]

// This must be kept in sync with the back end (firebase functions)
export const RESOLUTION_CREDIT_COSTS: {
  [key in NCJob['resolution']]: number
} = {
  thumb: 1, // only used for text jobs
  low: 1,
  standard: 1,
  medium: 2,
  high: 5
}
// This must be kept in sync with the back end (algorithm repo)
export const RESOLUTION_MEGAPIXELS: {
  [key in NCJob['resolution']]: number
} = {
  thumb: 0.16,
  low: 0.4,
  standard: 0.4,
  medium: 0.8,
  high: 2.2
}
export const TEXT_RESOLUTION_MEGAPIXELS: {
  [key in NCJob['resolution']]: number
} = {
  thumb: 0.16,
  low: 0.4,
  standard: 0.4,
  medium: 0.76,
  high: 2.2
}
export const DIFFUSION_RESOLUTION_MEGAPIXELS: {
  [key in NCJob['resolution']]: number
} = {
  thumb: 0.262144, // 512x512
  low: 0.4096, // 640x640
  standard: 0.4096,
  medium: 0.802816, // 896*896
  // medium: 1.048576, // 1024x1024
  high: 2.2
}
export const DIFFUSION2_RESOLUTION_MEGAPIXELS: {
  [key in NCJob['resolution']]: number
} = {
  thumb: 0.262144, // 512x512
  low: 0.4096, // 640x640
  standard: 0.4096,
  medium: 0.802816, // 896*896
  high: 2.2
}
export const TEXT_RESOLUTION_CREDIT_MULTIPLE_MAP: {
  [key in NCJob['resolution']]: number
} = {
  thumb: 1,
  low: 2,
  standard: 2,
  medium: 5,
  high: 25
}

export const DIFFUSION_RESOLUTION_CREDIT_MULTIPLE_MAP: {
  [key in NCJob['resolution']]: number
} = {
  thumb: 0,
  low: 1,
  standard: 1,
  medium: 2,
  high: 25
}

export const DIFFUSION2_RESOLUTION_CREDIT_MULTIPLE_MAP: {
  [key in NCJob['resolution']]: number
} = {
  thumb: 1,
  low: 2,
  standard: 2,
  medium: 6,
  high: 25
}
export const DIFFUSION2_NUM_IMAGES_COST_MAP: { [numImages: number]: number } = {
  1: 1,
  4: 2,
  9: 4,
  16: 7
}
// This must be kept in sync with the back ends
export const TEXT_JOB_RUNTIMES: { [key in NCTextJobRuntime]: NCRuntimeInfo } = {
  short: {
    key: 'short',
    label: 'Short',
    creditCost: 1,
    iterations: 200
  },
  medium: {
    key: 'medium',
    label: 'Medium',
    creditCost: 2,
    iterations: 400
  },
  long: {
    key: 'long',
    label: 'Long',
    creditCost: 4,
    iterations: 800
  },
  'extra-long': {
    key: 'extra-long',
    label: 'Extra long',
    creditCost: 6,
    iterations: 1200
  },
  none: {
    key: 'none',
    label: 'None',
    creditCost: 0,
    iterations: 0
  }
}
export const DIFFUSION_JOB_RUNTIMES: {
  [key in NCTextJobRuntime]: NCRuntimeInfo
} = {
  short: {
    key: 'short',
    label: 'Short',
    creditCost: 1,
    iterations: 125
  },
  medium: {
    key: 'medium',
    label: 'Medium',
    creditCost: 3,
    iterations: 250
  },
  long: {
    key: 'long',
    label: 'Long',
    creditCost: 6,
    iterations: 500
  },
  // The next two are for ts completeness, we don't actually use them for diffusion
  'extra-long': {
    key: 'extra-long',
    label: 'Extra long',
    creditCost: 10,
    iterations: 1000
  },
  none: {
    key: 'none',
    label: 'None',
    creditCost: 0,
    iterations: 0
  }
}
export const DIFFUSION2_JOB_RUNTIMES: {
  [key in NCTextJobRuntime]: NCRuntimeInfo
} = {
  short: {
    key: 'short',
    label: 'Short',
    creditCost: 1,
    iterations: 50
  },
  medium: {
    key: 'medium',
    label: 'Medium',
    creditCost: 2,
    iterations: 100
  },
  long: {
    key: 'long',
    label: 'Long',
    creditCost: 3,
    iterations: 150
  },
  // The next two are for ts completeness, we don't actually use them for diffusion
  'extra-long': {
    key: 'extra-long',
    label: 'Extra long',
    creditCost: 4,
    iterations: 200
  },
  none: {
    key: 'none',
    label: 'None',
    creditCost: 0,
    iterations: 0
  }
}
// This must be kept in-sync with the database field
export const NUM_FREE_DAILY_CREDITS = 5

// This must be kept in-sync with the back end constant
export const SOCIAL_BADGES_ALLOWED_PER_DAY = 10

export const MAX_UPSCALE_OUT_SIDE = 8000
export const UPSCALE_MEGAPIXEL_COSTS = [
  { over: 16000000, cost: 3 },
  { over: 4000000, cost: 2 },
  { over: 0, cost: 1 }
]

export const STABLE_DIFFUSION_SAMPLERS: NCStableDiffusionSampler[] = [
  // 'ddim',
  // 'plms', // doesn't seem to work
  'k_euler',
  'k_euler_ancestral',
  'k_heun',
  'k_dpm_2',
  'k_dpm_2_ancestral',
  'k_lms'
]

// This is a rate limit for how many follow notifications a single user can trigger per day
// Must be kept in sync with back end
export const MAX_FOLLOW_NOTIFICATIONS_FROM_USER_PER_DAY = 10

// We check these by checking if the canonicalPath starts with a string from this list
// Keep these in sync with public/robots.txt and next-sitemap.js
export const NOINDEX_PATHS: string[] = [
  '/admin',
  '/account',
  '/my-creations',
  '/my-collections',
  '/add-style',
  '/all-recent',
  '/canvas-test',
  '/feed',
  '/moderate',
  '/social-badge-rate-limited'
]

export const LOGGED_OUT_CLAIM_STABLE_CREDITS_INTENT_LOCAL_STORAGE_KEY =
  'wants-to-claim-stable-launch-free-credits'

export const STABLE_LAUNCH_BONUS_CREDITS = 40
