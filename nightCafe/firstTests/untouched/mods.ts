import { User } from 'firebase/auth'

// NC peeps
const angusStaging = '3kuhSKm9scbl8vQDMQykmBxhYFJ2'
const angusProd = 'WvesZ1j1iRMGsfJxuIzjEQy4s0A2'
const elleStaging = 'WYCMuDJvh9Pt1Cn9eT3qjqPp9ry1'
const elleProd = 'A5aRbYZAfuOCyBicj1rPrbSv5nF2'
const jonStaging = 'lqd8Wo3c1MOUk8FLJvbLn18kLgR2'
const jonStaging2 = 'gK5etxnf0UXbFccBBvEqiiK7GMV2'
const jonProd = 'PGqlevIygrMQ63bOS2T2ZC5uQ5f2'
const cassandraStaging = 'AMm0YzacfjOUysZdfkSBY7KGlXd2'
const cassandraProd = 'hgzHHV2qTpPcH8eCPH9RfsiPK8m2'
const ivanaStaging = 'RcVncLdjsTSUVyXW4tHi9jKJ8u22'
const ivanaProd = 'DCwQ8Y0LRYNdKuQvEtkQ8ZuuIOt2'
const samStaging = 'nZaJFDCUl0Vg7iwXmwa8KwRvVAF2'
const samProd = 'megR9MTbnNVF1LMAMw63Dn1AVwD2'

// Community moderators - prod
const scarletMagi = 'mTsdomnFTxdfs8HVchuXShQOYOl1'
const kennethClark = 'XB8c08FH1RSMMJGxHl6i07XOWmk2'
const zenElan = 'NNOGwN5dd3VRDrFmoPi2bpcG05q1'
const mrShiek = 'HcYoBohhfRPfFtFPhiSfnYZc8u32'
const illustrataAi = 'JHXwlRJswiaYS3Oa9czEksW9cWG3'
const amachinemadethis = 'HD233DVbCacBI0VPzfVCoehOH022'
const artistsjourney = 'Jm1PBjl1f1fWoPvbkLeuWZOrQXE3'
const tdraw_ai_art = '1ArGIcpvm7ZRo8OXOaowKEzvBGN2'
const weresl0th = 'Xq3sCPv4CyMQa9thIPd9Vcup1Ih2'
const jaydenarts = '8xIfHTsujYYlwfP6FaJ18YGpi8o1'
const teecieB = 'cnGKVujAcvg7aaOmShw4a7LGNlC3'
const geroani = 'Fhdg7WQwSRhAcPdHWd3ly7O4A4M2'
const soundmagus = 'ShtKP35nvXg80cxKqEnIiQg7ce02'
const adansito = 'hNg6GzURLbP2WygLuPsq2zLLlJn2'
const fibek = 'xR0mASOlsaXzIeNuclye901pNGs2'

// londonAI users
export const londonAI = 'M0dILbkLPWPOyb4V5a8vcnLiluh2'
const londonAINCTest = 'G5BCcdQn9jWq13Ksd0Le4nnxqsu2'

const admins = [
  angusStaging,
  angusProd,
  elleStaging,
  elleProd,
  jonStaging,
  jonStaging2,
  jonProd,
  cassandraStaging,
  cassandraProd,
  ivanaStaging,
  ivanaProd,
  samStaging,
  samProd
]
const moderators = [
  ...admins,
  scarletMagi,
  kennethClark,
  zenElan,
  mrShiek,
  illustrataAi,
  amachinemadethis,
  artistsjourney,
  tdraw_ai_art,
  weresl0th,
  jaydenarts,
  teecieB,
  geroani,
  soundmagus,
  adansito,
  fibek
]

const londonAIUsers = [londonAINCTest, londonAI]

export function isAdmin(user: User | string | null) {
  if (!user) return false
  const uid = typeof user === 'string' ? user : user.uid
  return admins.includes(uid)
}

export function isModerator(user: User | string | null) {
  if (!user) return false
  const uid = typeof user === 'string' ? user : user.uid
  return moderators.includes(uid)
}

export function isLondonAI(user: User | string | null) {
  if (!user) return false
  const uid = typeof user === 'string' ? user : user.uid
  return londonAIUsers.includes(uid)
}
