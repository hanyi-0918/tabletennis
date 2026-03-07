import { useEffect, useState } from 'react'
import { pinyin } from 'pinyin-pro'
import { getPlayers, searchPlayer, getH2h } from './lib/api'
import './App.css'

const LANG_KEY = 'h2h-lang'

const PLAYER_NAME_EN = {
  '马龙': 'Ma Long',
  '樊振东': 'Fan Zhendong',
  '许昕': 'Xu Xin',
  '王皓': 'Wang Hao',
  '马琳': 'Ma Lin',
  '王励勤': 'Wang Liqin',
  '张继科': 'Zhang Jike',
  '王楚钦': 'Wang Chuqin',
}
const PLAYER_NAME_ZH = Object.fromEntries(Object.entries(PLAYER_NAME_EN).map(([zh, en]) => [en.toLowerCase(), zh]))

// 赛事/地点/阶段 中→英（长短语优先）；不好译的用拼音
const EVENT_ZH_TO_EN = [
  ['世界乒乓球锦标赛', 'World Table Tennis Championships'],
  ['地表最强12人', 'World Top 12'],
  ['男单三四名决赛', 'MS 3rd-place match'],
  ['奥运会亚洲区资格赛', 'Olympic Asian Qualifiers'],
  ['亚洲区资格赛东亚决赛', 'Asian Qualifiers East Asia Final'],
  ['直通杜塞尔多夫地表最强12人', 'Düsseldorf World Top 12 Qualifiers'],
  ['直通吉隆坡团体世锦赛', 'Kuala Lumpur Worlds Team Qualifiers'],
  ['直通布达佩斯地表最强12人', 'Budapest World Top 12 Qualifiers'],
  ['直通釜山地表最强12人', 'Busan World Top 12 Qualifiers'],
  ['直通WTT大满贯·世乒赛暨奥运模拟赛', 'WTT Grand Slam & Olympic Trial'],
  ['出征里约奥运会热身赛', 'Rio Olympics warm-up'],
  ['出征慈利杯世乒赛热身赛', 'Cili Cup Worlds warm-up'],
  ['出征鹿特丹世乒赛热身赛', 'Rotterdam Worlds warm-up'],
  ['备战休斯敦世锦赛热身赛', 'Houston Worlds warm-up'],
  ['备战伦敦奥运会热身赛', 'London Olympics warm-up'],
  ['备战北京奥运会热身赛', 'Beijing Olympics warm-up'],
  ['备战广州亚运会热身赛', 'Guangzhou Asian Games warm-up'],
  ['备战吉隆坡世乒赛热身赛', 'Kuala Lumpur Worlds warm-up'],
  ['备战吉隆坡世锦赛热身赛', 'Kuala Lumpur Worlds warm-up'],
  ['备战巴黎世乒赛热身赛', 'Paris Worlds warm-up'],
  ['备战巴黎世锦赛热身赛', 'Paris Worlds warm-up'],
  ['备战多特蒙德世乒赛热身赛', 'Dortmund Worlds warm-up'],
  ['备战东京世锦赛热身赛', 'Tokyo Worlds warm-up'],
  ['备战东京世乒赛热身赛', 'Tokyo Worlds warm-up'],
  ['备战鹿特丹世乒赛热身赛', 'Rotterdam Worlds warm-up'],
  ['备战仁川亚运会热身赛', 'Incheon Asian Games warm-up'],
  ['备战莫斯科世乒赛热身赛', 'Moscow Worlds warm-up'],
  ['浙江制多备战莫斯科世乒赛热身赛', 'Zhejiang Zhidu Moscow Worlds warm-up'],
  ['WTT新加坡大满贯赛男单决赛', 'WTT Singapore Grand Slam MS Final'],
  ['WTT新加坡大满贯赛', 'WTT Singapore Grand Slam'],
  ['WTT中国澳门赛男单一二名种子排位赛', 'WTT Macao MS 1st-2nd seed playoff'],
  ['WTT中国澳门赛', 'WTT Macao'],
  ['直通巴黎第三阶段小组赛', 'Paris Qualifiers stage 3 group'],
  ['直通不莱梅第一阶段第二次大循环', 'Bremen Qualifiers stage 1 round robin 2'],
  ['直通不莱梅第二阶段小组赛', 'Bremen Qualifiers stage 2 group'],
  ['直通不莱梅第一阶段', 'Bremen Qualifiers stage 1'],
  ['直通不莱梅第二阶段', 'Bremen Qualifiers stage 2'],
  ['直通吉隆坡团体世锦赛第二阶段', 'Kuala Lumpur Worlds Team Qualifiers stage 2'],
  ['直通吉隆坡团体世锦赛第一阶段', 'Kuala Lumpur Worlds Team Qualifiers stage 1'],
  ['直通吉隆坡第一阶段大循环', 'Kuala Lumpur Qualifiers stage 1 round robin'],
  ['直通东京团体世锦赛第一阶段', 'Tokyo Worlds Team Qualifiers stage 1'],
  ['直通东京团体世锦赛第二阶段', 'Tokyo Worlds Team Qualifiers stage 2'],
  ['直通东京第一阶段大循环', 'Tokyo Qualifiers stage 1 round robin'],
  ['直通东京第二阶段男单半决赛', 'Tokyo Qualifiers stage 2 MS semifinal'],
  ['直通东京第二阶段', 'Tokyo Qualifiers stage 2'],
  ['直通苏州第一阶段男单决赛', 'Suzhou Qualifiers stage 1 MS Final'],
  ['直通苏州第二阶段男单半决赛', 'Suzhou Qualifiers stage 2 MS semifinal'],
  ['直通苏州第一阶段', 'Suzhou Qualifiers stage 1'],
  ['直通苏州第二阶段', 'Suzhou Qualifiers stage 2'],
  ['黑龙江哈尔滨直通莫斯科第二阶段男单1/4决赛', 'Harbin Moscow Qualifiers stage 2 MS quarterfinal'],
  ['直通莫斯科第二阶段男单1/4决赛', 'Moscow Qualifiers stage 2 MS quarterfinal'],
  ['直通莫斯科第一阶段男单1/4决赛', 'Moscow Qualifiers stage 1 MS quarterfinal'],
  ['直通莫斯科第一阶段', 'Moscow Qualifiers stage 1'],
  ['直通莫斯科第二阶段', 'Moscow Qualifiers stage 2'],
  ['山西大同CCTV贺岁杯中国乒乓球对抗赛', 'Datong CCTV New Year Cup'],
  ['超级明星热身赛主力队2:3非主力队', 'Super Star warm-up Main 2:3 Reserve'],
  ['鲁能中超电缆1:3上海冠生园', 'Luneng Zhongchao 1:3 Shanghai Guanshengyuan'],
  ['鲁能中超电缆3:2上海冠生园', 'Luneng Zhongchao 3:2 Shanghai Guanshengyuan'],
  ['鲁能潞安集团3:2上海浦宏神木', 'Luneng Luan 3:2 Shanghai Puhong Shenmu'],
  ['鲁能中电装备3:1锦州银行上海', 'Luneng Zhongdian 3:1 Jinzhou Bank Shanghai'],
  ['鲁能中电装备2:3上海金迈驰', 'Luneng Zhongdian 2:3 Shanghai Jinmaichi'],
  ['鲁能中电装备3:1上海金迈驰', 'Luneng Zhongdian 3:1 Shanghai Jinmaichi'],
  ['鲁能中电装备1:3上海金迈驰', 'Luneng Zhongdian 1:3 Shanghai Jinmaichi'],
  ['山东鲁能3:2八一工商银行', 'Shandong Luneng 3:2 Bayi ICBC'],
  ['男团1/4决赛山东0:3上海', 'team quarterfinal Shandong 0:3 Shanghai'],
  ['男团1/4决赛山东1:3上海', 'team quarterfinal Shandong 1:3 Shanghai'],
  ['男团1/4决赛解放军3:2上海', 'team quarterfinal PLA 3:2 Shanghai'],
  ['直通鹿特丹第二阶段小组赛', 'Rotterdam Qualifiers stage 2 group'],
  ['直通鹿特丹第二阶段男单半决赛', 'Rotterdam Qualifiers stage 2 MS semifinal'],
  ['直通鹿特丹第二阶段男单三四名决赛', 'Rotterdam Qualifiers stage 2 MS 3rd-place'],
  ['直通鹿特丹第二阶段', 'Rotterdam Qualifiers stage 2'],
  ['直通鹿特丹第一阶段小组赛', 'Rotterdam Qualifiers stage 1 group'],
  ['直通鹿特丹第一阶段', 'Rotterdam Qualifiers stage 1'],
  ['直通萨格勒布第二阶段大循环', 'Zagreb Qualifiers stage 2 round robin'],
  ['直通萨格勒布第一阶段大循环', 'Zagreb Qualifiers stage 1 round robin'],
  ['直通萨格勒布第二阶段', 'Zagreb Qualifiers stage 2'],
  ['直通萨格勒布第一阶段', 'Zagreb Qualifiers stage 1'],
  ['直通巴黎第二阶段大循环', 'Paris Qualifiers stage 2 round robin'],
  ['直通巴黎第二阶段', 'Paris Qualifiers stage 2'],
  ['直通巴黎第三阶段', 'Paris Qualifiers stage 3'],
  ['直通横滨第二阶段大循环', 'Yokohama Qualifiers stage 2 round robin'],
  ['直通横滨第一阶段大循环', 'Yokohama Qualifiers stage 1 round robin'],
  ['直通横滨第二阶段', 'Yokohama Qualifiers stage 2'],
  ['直通横滨第一阶段', 'Yokohama Qualifiers stage 1'],
  ['CCTV贺岁杯中国乒乓球队对抗赛', 'CCTV New Year Cup'],
  ['冬训对抗赛男单半决赛', 'winter training match MS semifinal'],
  ['冬训对抗赛男单决赛', 'winter training match MS Final'],
  ['冬训对抗赛', 'winter training match'],
  ['直横大战乒乓球赛', 'Penhold vs Shakehand'],
  ['超级明星热身赛', 'Super Star warm-up'],
  ['队内对抗赛', 'internal match'],
  ['备战北京奥运会热身赛红队2:3蓝队', 'Beijing Olympics warm-up Red 2:3 Blue'],
  ['红队2:3蓝队', 'Red 2:3 Blue'],
  ['红队', 'Red Team'],
  ['蓝队', 'Blue Team'],
  ['男单一二名种子排位赛', 'MS 1st-2nd seed playoff'],
  ['大王者杯总冠军赛男单半决赛', 'World Table Tennis Classic MS semifinal'],
  ['大王者杯总冠军赛', 'World Table Tennis Classic'],
  ['第六届城运会男单半决赛', '6th National City Games MS semifinal'],
  ['第六届城运会', '6th National City Games'],
  ['城运会', 'National City Games'],
  ['全国赛男单决赛', 'National Champs MS Final'],
  ['全国赛男单1/4决赛', 'National Champs MS quarterfinal'],
  ['全国赛', 'National Champs'],
  ['乒超决赛第2轮', 'CTTSL Final R2'],
  ['乒超决赛第1轮', 'CTTSL Final R1'],
  ['乒超半决赛第3轮', 'CTTSL semifinal R3'],
  ['乒超半决赛第2轮', 'CTTSL semifinal R2'],
  ['乒超半决赛第1轮', 'CTTSL semifinal R1'],
  ['宁波海天塑机3:1上海金迈驰', 'Ningbo Haitian 3:1 Shanghai Jinmaichi'],
  ['宁波海天塑机3:2锦州银行上海', 'Ningbo Haitian 3:2 Jinzhou Bank Shanghai'],
  ['宁波海天塑机3:0上海金迈驰', 'Ningbo Haitian 3:0 Shanghai Jinmaichi'],
  ['宁波北仑海天3:1上海冠生园', 'Ningbo Beilun Haitian 3:1 Shanghai Guanshengyuan'],
  ['宁波北仑海天0:3上海冠生园', 'Ningbo Beilun Haitian 0:3 Shanghai Guanshengyuan'],
  ['宁波北仑海天3:0上海冠生园', 'Ningbo Beilun Haitian 3:0 Shanghai Guanshengyuan'],
  ['宁波北仑海天2:3上海冠生园', 'Ningbo Beilun Haitian 2:3 Shanghai Guanshengyuan'],
  ['北京3:1上海', 'Beijing 3:1 Shanghai'],
  ['北京2:3上海', 'Beijing 2:3 Shanghai'],
  ['男团决赛北京3:1上海', 'team final Beijing 3:1 Shanghai'],
  ['男团1/4决赛北京2:3上海', 'team quarterfinal Beijing 2:3 Shanghai'],
  ['男团小组赛北京3:1上海', 'team group Beijing 3:1 Shanghai'],
  ['北京铜牛3:2八一工商银行', 'Beijing Tongniu 3:2 Bayi ICBC'],
  ['北京铜牛0:3八一工商银行', 'Beijing Tongniu 0:3 Bayi ICBC'],
  ['北京首旅3:2宁波海天', 'Beijing Shoulv 3:2 Ningbo Haitian'],
  ['第十四届全运会', '14th National Games'],
  ['第十三届全运会', '13th National Games'],
  ['第十二届全运会', '12th National Games'],
  ['第十一届全运会', '11th National Games'],
  ['第十届全运会', '10th National Games'],
  ['南非德班世锦赛男队选拔赛', 'Durban Worlds team selection'],
  ['国际乒联世界杯', 'ITTF World Cup'],
  ['世界杯总决赛', 'World Cup Finals'],
  ['男子总决赛', 'Men\'s Finals'],
  ['大满贯赛男单', 'Grand Slam MS'],
  ['球星挑战赛', 'Star Contender'],
  ['冠军赛男单', 'Championship MS'],
  ['世界杯男单', 'World Cup MS'],
  ['世乒赛男单', 'World Champs MS'],
  ['世锦赛男单', 'World Champs MS'],
  ['奥运会男单', 'Olympics MS'],
  ['亚洲杯男单', 'Asian Cup MS'],
  ['亚锦赛男单', 'Asian Champs MS'],
  ['全运会男单', 'National Games MS'],
  ['全运会男团', 'National Games team'],
  ['全锦赛男单', 'National Champs MS'],
  ['全锦赛男团', 'National Champs team'],
  ['乒超决赛', 'CTTSL Final'],
  ['乒超半决赛', 'CTTSL semifinal'],
  ['乒超联赛', 'CTTSL'],
  ['乒超第', 'CTTSL R'],
  ['直通巴黎', 'Paris Qualifiers'],
  ['直通横滨', 'Yokohama Qualifiers'],
  ['直通苏州', 'Suzhou Qualifiers'],
  ['直通东京', 'Tokyo Qualifiers'],
  ['直通鹿特丹', 'Rotterdam Qualifiers'],
  ['直通杜塞尔多夫', 'Düsseldorf Qualifiers'],
  ['直通萨格勒布', 'Zagreb Qualifiers'],
  ['直通莫斯科', 'Moscow Qualifiers'],
  ['直通布达佩斯', 'Budapest Qualifiers'],
  ['直通吉隆坡', 'Kuala Lumpur Qualifiers'],
  ['直通不莱梅', 'Bremen Qualifiers'],
  ['大循环', 'round robin'],
  ['选拔赛', 'qualifiers'],
  ['男单决赛', 'MS Final'],
  ['男单半决赛', 'MS semifinal'],
  ['男单1/4决赛', 'MS quarterfinal'],
  ['男单1/8决赛', 'MS R16'],
  ['男单1/16决赛', 'MS R32'],
  ['男团决赛', 'team final'],
  ['男团半决赛', 'team semifinal'],
  ['男团1/4决赛', 'team quarterfinal'],
  ['男团小组赛', 'team group'],
  ['男团第一阶段', 'team stage 1'],
  ['第一阶段', 'stage 1'],
  ['第二阶段', 'stage 2'],
  ['第三阶段', 'stage 3'],
  ['小组赛', 'group'],
  ['总决赛男单', 'Finals MS'],
  ['ITTF总决赛', 'ITTF Finals'],
  ['世界杯', 'World Cup'],
  ['世乒赛', 'World Champs'],
  ['世锦赛', 'World Champs'],
  ['奥运会', 'Olympics'],
  ['亚运会', 'Asian Games'],
  ['亚洲杯', 'Asian Cup'],
  ['亚锦赛', 'Asian Champs'],
  ['全锦赛', 'National Champs'],
  ['全运会', 'National Games'],
  ['公开赛男单', 'Open MS'],
  ['公开赛', 'Open'],
  ['热身赛', 'warm-up'],
  ['大满贯', 'Grand Slam'],
  ['总决赛', 'Finals'],
  ['冠军赛', 'Championship'],
  ['科威特公开赛', 'Kuwait Open'],
  ['新加坡公开赛', 'Singapore Open'],
  ['丹麦公开赛', 'Danish Open'],
  ['匈牙利公开赛', 'Hungarian Open'],
  ['法国巴黎世乒赛', 'Paris World Champs'],
  ['荷兰鹿特丹世乒赛', 'Rotterdam World Champs'],
  ['英国利物浦', 'Liverpool'],
  ['英国伦敦', 'London'],
  ['韩国大田', 'Daejeon'],
  ['韩国首尔', 'Seoul'],
  ['日本千叶', 'Chiba'],
  ['法国图卢兹', 'Toulouse'],
  ['德国马格德堡', 'Magdeburg'],
  ['印度勒克瑙', 'Lucknow'],
  ['山西太原', 'Taiyuan'],
  ['山西大同', 'Datong'],
  ['辽宁锦州', 'Jinzhou'],
  ['中国澳门', 'Macao'],
  ['中国香港', 'Hong Kong'],
  ['中国深圳', 'Shenzhen'],
  ['中国上海', 'Shanghai'],
  ['中国成都', 'Chengdu'],
  ['中国郑州', 'Zhengzhou'],
  ['中国威海', 'Weihai'],
  ['中国长春', 'Changchun'],
  ['中国苏州', 'Suzhou'],
  ['中国杭州', 'Hangzhou'],
  ['中国武汉', 'Wuhan'],
  ['中国广州', 'Guangzhou'],
  ['中国北京', 'Beijing'],
  ['中国天津', 'Tianjin'],
  ['中国南京', 'Nanjing'],
  ['中国无锡', 'Wuxi'],
  ['中国昆明', 'Kunming'],
  ['中国长沙', 'Changsha'],
  ['中国青岛', 'Qingdao'],
  ['中国济南', 'Jinan'],
  ['中国哈尔滨', 'Harbin'],
  ['中国合肥', 'Hefei'],
  ['中国南通', 'Nantong'],
  ['中国扬州', 'Yangzhou'],
  ['中国厦门', 'Xiamen'],
  ['福建厦门', 'Xiamen'],
  ['厦门', 'Xiamen'],
  ['山东威海', 'Weihai'],
  ['山东青岛', 'Qingdao'],
  ['山东诸城', 'Zhucheng'],
  ['山东济南', 'Jinan'],
  ['山东临沂', 'Linyi'],
  ['山东淄博', 'Zibo'],
  ['山东烟台', 'Yantai'],
  ['陕西延安', 'Yan\'an'],
  ['河南南阳', 'Nanyang'],
  ['河南新乡', 'Xinxiang'],
  ['浙江温州', 'Wenzhou'],
  ['浙江宁波', 'Ningbo'],
  ['江苏镇江', 'Zhenjiang'],
  ['江苏张家港', 'Zhangjiagang'],
  ['江苏无锡', 'Wuxi'],
  ['江苏南通', 'Nantong'],
  ['江苏扬州', 'Yangzhou'],
  ['江苏南京', 'Nanjing'],
  ['广东深圳', 'Shenzhen'],
  ['广东广州', 'Guangzhou'],
  ['湖北黄石', 'Huangshi'],
  ['湖北武汉', 'Wuhan'],
  ['四川成都', 'Chengdu'],
  ['辽宁鞍山', 'Anshan'],
  ['广东中山', 'Zhongshan'],
  ['北京东城', 'Beijing Dongcheng'],
  ['北京', 'Beijing'],
  ['日本东京', 'Tokyo'],
  ['日本横滨', 'Yokohama'],
  ['日本札幌', 'Sapporo'],
  ['日本神户', 'Kobe'],
  ['日本千叶', 'Chiba'],
  ['韩国仁川', 'Incheon'],
  ['韩国釜山', 'Busan'],
  ['卡塔尔多哈', 'Doha'],
  ['卡塔尔', 'Qatar'],
  ['瑞典哈尔姆斯塔德', 'Halmstad'],
  ['瑞典斯德哥尔摩', 'Stockholm'],
  ['葡萄牙里斯本', 'Lisbon'],
  ['德国杜塞尔多夫', 'Düsseldorf'],
  ['德国不莱梅', 'Bremen'],
  ['德国柏林', 'Berlin'],
  ['德国马格德堡', 'Magdeburg'],
  ['法国巴黎', 'Paris'],
  ['法国图卢兹', 'Toulouse'],
  ['奥地利维也纳', 'Vienna'],
  ['匈牙利布达佩斯', 'Budapest'],
  ['阿联酋迪拜', 'Dubai'],
  ['澳大利亚吉朗', 'Geelong'],
  ['马来西亚新山', 'Johor Bahru'],
  ['南非德班', 'Durban'],
  ['美国休斯敦', 'Houston'],
  ['英国谢菲尔德', 'Sheffield'],
  ['英国利物浦', 'Liverpool'],
  ['英国伦敦', 'London'],
  ['克罗地亚萨格勒布', 'Zagreb'],
  ['斯洛文尼亚', 'Slovenia'],
  ['波兰华沙', 'Warsaw'],
  ['泰国芭提雅', 'Pattaya'],
  ['印度斋普尔', 'Jaipur'],
  ['印度勒克瑙', 'Lucknow'],
  ['印尼日惹', 'Yogyakarta'],
  ['黑龙江哈尔滨', 'Harbin'],
  ['里约奥运会', 'Rio Olympics'],
  ['里约', 'Rio'],
  ['退赛', 'withdrew'],
  ['天津', 'Tianjin'],
  ['WTT', 'WTT'],
]

const T = {
  zh: {
    title: '乒乓球球员交手记录',
    subtitle: 'Head-to-Head Records',
    placeholder: '输入球员名（如 樊振东）...',
    selectOpponent: '选择对手',
    playerNotFound: '未找到该球员',
    noH2h: '暂无交手记录',
    fuzzyMatch: '模糊匹配到',
    wins: ' 胜',
    winRate: '总胜率',
    majorWinRate: '三大赛胜率',
    majorTournaments: '奥运会 / 世乒赛 / 世界杯',
    allMatches: '完整交手',
    internationalOnly: '（仅国际比赛）',
    noCompleteData: '暂无完整数据',
  },
  en: {
    title: 'Table Tennis Head-to-Head',
    subtitle: 'Player H2H Records',
    placeholder: 'Enter player name (e.g. Fan Zhendong)...',
    selectOpponent: 'Select opponent',
    playerNotFound: 'Player not found',
    noH2h: 'No H2H record',
    fuzzyMatch: 'Fuzzy match:',
    wins: ' wins',
    winRate: 'Win %',
    majorWinRate: 'Major win %',
    majorTournaments: 'Olympics / Worlds / World Cup',
    allMatches: 'All matches',
    internationalOnly: ' (International only)',
    noCompleteData: 'No complete data',
  },
}

function App() {
  const [lang, setLang] = useState(() => {
    try {
      const saved = localStorage.getItem(LANG_KEY)
      return saved === 'en' ? 'en' : 'zh'
    } catch { return 'zh' }
  })
  const [playerName, setPlayerName] = useState('')
  const [allPlayers, setAllPlayers] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [opponents, setOpponents] = useState(null)
  const [selectedOpponent, setSelectedOpponent] = useState('')
  const [h2hResult, setH2hResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    try { localStorage.setItem(LANG_KEY, lang) } catch {}
  }, [lang])

  const t = (key) => T[lang]?.[key] ?? T.zh[key] ?? key

  const getDisplayName = (name) => (lang === 'en' && name && PLAYER_NAME_EN[name]) ? PLAYER_NAME_EN[name] : (name || '')

  const matchStringToLang = (s) => {
    if (lang !== 'en' || !s) return s
    let text = s
    const order = ['王楚钦', '樊振东', '张继科', '王励勤', '许昕', '马琳', '王皓', '马龙']
    order.forEach((zh) => {
      const en = PLAYER_NAME_EN[zh]
      if (en) text = text.split(zh + '胜').join(en + ' ')
    })
    const byLen = [...EVENT_ZH_TO_EN].sort((a, b) => (b[0].length - a[0].length))
    byLen.forEach(([zh, en]) => { text = text.split(zh).join(en) })
    // 剩余中文一律转拼音，不保留任何汉字
    text = text.replace(/[\u4e00-\u9fff]+/g, (match) => pinyin(match, { toneType: 'none' }))
    return text.replace(/\s{2,}/g, ' ').trim()
  }

  const PLAYER_PHOTOS = {
    '樊振东': '/fan-zhendong.png',
    '马龙': '/ma-long.png',
    '许昕': '/xu-xin.png',
    '王楚钦': '/wang-chuqin.png',
    '王皓': '/wang-hao.png',
    '马琳': '/ma-lin.png',
    '王励勤': '/wang-liqin.png',
    '张继科': '/zhang-jike.png',
  }

  useEffect(() => {
    const loadPlayers = async () => {
      try {
        const list = await getPlayers()
        if (Array.isArray(list)) setAllPlayers(list)
      } catch {
        // ignore load failure and keep the rest of the page functional
      }
    }
    loadPlayers()
  }, [])

  const isMajorMatch = (s) => /(奥运会|世乒赛|世界杯)/.test(s || '') && !/资格赛/.test(s || '')

  // 交手记录只显示年份，去掉月日（如 2020.12.25 -> 2020）
  const matchYearOnly = (s) => (s || '').replace(/^(\d{4})(\.\d{2}(\.\d{2})?)?\s/, '$1 ')

  const getEventStyle = (eventName) => {
    const name = (eventName || '').toLowerCase()
    if (name.includes('smash') || name.includes('大满贯')) return 'style-smash'
    if (name.includes('finals') || name.includes('总决赛')) return 'style-finals'
    if (name.includes('champions') || name.includes('冠军')) return 'style-champions'
    if (name.includes('star') || name.includes('球星')) return 'style-star'
    if (name.includes('contender') || name.includes('挑战')) return 'style-contender'
    if (name.includes('world') || name.includes('世锦') || name.includes('奥运')) return 'style-worlds'
    return 'style-default'
  }

  const handleSearch = async () => {
    if (!playerName.trim()) return
    setLoading(true)
    setError('')
    setShowSuggestions(false)
    setOpponents(null)
    setH2hResult(null)
    setSelectedOpponent('')

    try {
      const searchQuery = (lang === 'en' && PLAYER_NAME_ZH[playerName.trim().toLowerCase()])
        ? PLAYER_NAME_ZH[playerName.trim().toLowerCase()]
        : playerName.trim()
      const data = await searchPlayer(searchQuery, allPlayers)
      if (!data) throw new Error(t('playerNotFound'))
      setOpponents(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePickPlayer = (name) => {
    setPlayerName(getDisplayName(name))
    setShowSuggestions(false)
  }

  const suggestedPlayers = (playerName.trim()
    ? allPlayers.filter((name) => name.includes(playerName.trim()))
    : allPlayers
  )

  const handleSelectOpponent = async (opponent) => {
    if (!opponents?.player_name || !opponent) return
    setSelectedOpponent(opponent)
    setH2hResult(null)
    setLoading(true)
    setError('')

    try {
      const data = await getH2h(opponents.player_name, opponent)
      if (!data) throw new Error(t('noH2h'))
      setH2hResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const goHome = () => {
    setPlayerName('')
    setShowSuggestions(false)
    setOpponents(null)
    setSelectedOpponent('')
    setH2hResult(null)
    setError('')
  }

  return (
    <div className="container">
      <h1
        className="app-title-link"
        role="button"
        tabIndex={0}
        onClick={goHome}
        onKeyDown={(e) => e.key === 'Enter' && goHome()}
      >
        {t('title')}
      </h1>
      <div className="subtitle">{t('subtitle')}</div>

      <div className="search-container">
        <div className="input-suggest-wrap">
          <input
            className="input-city"
            value={playerName}
            onChange={(e) => {
              setPlayerName(e.target.value)
              setShowSuggestions(true)
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 120)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={t('placeholder')}
          />
          {showSuggestions && suggestedPlayers.length > 0 && (
            <div className="player-suggestions">
              {suggestedPlayers.map((name) => (
                <div
                  key={name}
                  className="suggestion-item"
                  onMouseDown={(e) => {
                    e.preventDefault()
                    handlePickPlayer(name)
                  }}
                >
                  {getDisplayName(name)}
                </div>
              ))}
            </div>
          )}
        </div>
        <button onClick={handleSearch}>
          {loading && !opponents ? '...' : 'GO'}
        </button>
      </div>

      {error && <div style={{ color: '#ff4444' }}>⚠️ {error}</div>}

      {opponents && (
        <div className="event-bar">
          <div className={`event-header ${getEventStyle('champions')}`}>
            <span>{t('selectOpponent')}</span>
          </div>
          <div className="event-body">
            <h2 className="city-name">{getDisplayName(opponents.player_name).toUpperCase()}</h2>
            <div className="opponent-buttons">
              {opponents.opponents.map((opp) => (
                <button
                  key={opp}
                  type="button"
                  className={`opponent-btn ${selectedOpponent === opp ? 'active' : ''}`}
                  onClick={() => handleSelectOpponent(opp)}
                >
                  {getDisplayName(opp)}
                </button>
              ))}
            </div>
            {opponents.is_fuzzy_match && (
              <div className="algo-note">🤖 {t('fuzzyMatch')} {getDisplayName(opponents.player_name)}</div>
            )}
          </div>
        </div>
      )}

      {h2hResult && (
        <div className="event-bar">
          <div className={`event-header ${getEventStyle('world')}`}>
            <span>{getDisplayName(h2hResult.player_a)} vs {getDisplayName(h2hResult.player_b)}</span>
            <span style={{ opacity: 0.8 }}>H2H</span>
          </div>
          <div className={`event-body player-photo-row ${PLAYER_PHOTOS[h2hResult.player_a] ? 'photo-left' : ''} ${PLAYER_PHOTOS[h2hResult.player_b] ? 'photo-right' : ''}`}>
            {PLAYER_PHOTOS[h2hResult.player_a] && (
              <div className="player-photo left">
                <img src={PLAYER_PHOTOS[h2hResult.player_a]} alt={h2hResult.player_a} />
                <span>{getDisplayName(h2hResult.player_a)}</span>
              </div>
            )}
            <div className="player-photo-content">
              <h2 className="city-name">{getDisplayName(h2hResult.player_a)} vs {getDisplayName(h2hResult.player_b)}</h2>
              <div className="time-grid">
              <div className="time-box">
                <div className="label">{getDisplayName(h2hResult.player_a)}{t('wins')}</div>
                <div className="time-val" style={{ color: '#00e676' }}>
                  {h2hResult.player_a_wins}
                </div>
              </div>
              <div className="time-box">
                <div className="label">{t('winRate')}</div>
                <div className="time-val">
                  {h2hResult.total_matches > 0
                    ? ((h2hResult.player_a_wins / h2hResult.total_matches) * 100).toFixed(1) + '%'
                    : '-'}
                </div>
              </div>
              <div className="time-box">
                <div className="label">{getDisplayName(h2hResult.player_b)}{t('wins')}</div>
                <div className="time-val" style={{ color: '#00b0ff' }}>
                  {h2hResult.player_b_wins}
                </div>
              </div>
            </div>
            <div className="major-rate-wrap">
              <div className="time-box major-rate-card">
                <div className="label">{getDisplayName(h2hResult.player_a)} {t('majorWinRate')}</div>
                <div className="time-val time-val-major">
                  {(h2hResult.player_a_major_wins ?? 0) + (h2hResult.player_b_major_wins ?? 0) > 0
                    ? (((h2hResult.player_a_major_wins ?? 0) / ((h2hResult.player_a_major_wins ?? 0) + (h2hResult.player_b_major_wins ?? 0))) * 100).toFixed(1) + '%'
                    : '-'}
                </div>
                <div className="time-sub">{t('majorTournaments')}</div>
              </div>
            </div>
            {h2hResult.recent_matches?.length > 0 && (
              <div className="recent-matches">
                <div className="label">
                  {t('allMatches')}
                  {((['王皓', '王励勤'].includes(h2hResult.player_a) && ['王皓', '王励勤'].includes(h2hResult.player_b)) || (['王皓', '马琳'].includes(h2hResult.player_a) && ['王皓', '马琳'].includes(h2hResult.player_b)) || (['马琳', '王励勤'].includes(h2hResult.player_a) && ['马琳', '王励勤'].includes(h2hResult.player_b))) && t('internationalOnly')}
                </div>
                <ul>
                  {(h2hResult.recent_matches || []).map((m, i) => (
                      <li
                        key={i}
                        className={m.includes(h2hResult.player_a + '胜') ? 'win-by-search-player' : ''}
                      >
                        {lang === 'en' && m === '暂无完整数据' ? t('noCompleteData') : matchStringToLang(matchYearOnly(m))}
                      </li>
                  ))}
                </ul>
              </div>
            )}
            </div>
            {PLAYER_PHOTOS[h2hResult.player_b] && (
              <div className="player-photo right">
                <img src={PLAYER_PHOTOS[h2hResult.player_b]} alt={h2hResult.player_b} />
                <span>{getDisplayName(h2hResult.player_b)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="lang-switcher">
        <button type="button" className={lang === 'zh' ? 'active' : ''} onClick={() => setLang('zh')}>中文</button>
        <span className="lang-sep">|</span>
        <button type="button" className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>English</button>
      </div>
    </div>
  )
}

export default App


