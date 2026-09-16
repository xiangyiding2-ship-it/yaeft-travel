// ============================================================
// 亚欧非大环线 · 全站共享数据源（site/travel-data.js）
// 设计参照 thesilkloop.com 多页结构：首页 / 大环线 / 出发准备 / 国家×7 / 花费 / 实拍
// 内容全部来自旅行者本人（2026-06-29 → 08-26）的真实经历。
// 标注原则：
//   「经历」= 本人亲历，直接使用；
//   「待核实」= 记忆有出入或会变化的信息，发布前联网核实并标时间。
// 图片占位：assets/photos/<country>/ 等待 iPhone 相册素材归档。
// ============================================================

var TRAVEL_GLOBAL = typeof window !== 'undefined' ? window : globalThis;
TRAVEL_GLOBAL.TRAVEL = (function () {

  // ---------- 站点元信息 ----------
  var meta = {
    title: '亚欧非大环线',
    en: 'YAEAF LOOP',
    signature: '2.2万 · 6国 · 59天',
    signatureSub: '2026.06.29 — 2026.08.26 · 一个人 · 极致轻量化',
    tagline: '一个真正走完这条路的人，把真实经验整理成一份可以直接参考的旅行攻略。',
    totalDays: 59,
    totalCost: '¥22,355',
    foreignCountryCount: 6,
    startDate: '2026-06-29',
    endDate: '2026-08-26',
    author: '亚欧非大环线',
    verifiedNote: '会变化的信息（签证/保险/价格/营业时间）发布前将重新联网核实并标注更新时间。'
  };

  // ---------- 顶部导航 ----------
  var nav = [
    { label: '首页', page: 'index' },
    { label: '大环线', page: 'grand-loop' },
    { label: '出发准备', page: 'prepare' },
    { label: '国家', page: 'destinations' },
    { label: '花费', page: 'costs' },
    { label: '实拍', page: 'photos' }
  ];

  // ---------- 旅行方式 ----------
  var travelStyle = [
    '一个人旅行', '极致轻量化', '青旅多人间为主', '大量公共交通',
    '部分飞机', '部分租车', '经常自己做饭', '追求性价比',
    '不追求把所有景点打卡完'
  ];

  var payment = {
    domestic: '中国国内：微信、支付宝。',
    before: '出国前：兑换 300 美元现金（手续费 ¥10）。',
    abroad: '境外：大部分时候使用 Visa；美元主要用于兑换当地货币。',
    egypt: '埃及：使用 Visa 在 National Bank ATM 取现，每笔国内银行卡约收 3 美元手续费。'
  };

  var accommodation = {
    style: '青旅为主；红眼航班机场过夜 3 次；夜间大巴（土耳其 3 段，埃及 2 段）。',
    booking: '住宿主要使用 Booking + Agoda 比价；线下入住有机会更便宜，可以到店问价。',
    turkey: '土耳其当地网络环境可能无法正常使用 Booking；因为使用了提前购买的国内流量卡，所以可以正常使用。'
  };

  // ---------- 住宿推荐（住哪里，怎么订）----------
  // 评分 = 干净 / 氛围 / 价格（5 星制），本人真实入住体验
  var hostels = {
    note: '评分＝干净 / 氛围 / 价格（5 星制），来自本人真实入住体验。',
    byCountry: {
      '哈萨克斯坦': [
        { city: '阿拉木图', name: 'Good Inn Hostel', clean: 5, vibe: 3, price: 3 },
        { city: '阿拉木图', name: 'Samal Hostel', clean: 2, vibe: 2, price: 4 },
        { city: '阿克套', name: 'Hostel MANDARIN', clean: 3, vibe: 2, price: 5 }
      ],
      '格鲁吉亚': [
        { city: '第比利斯', name: "Soul 的厨房（Sol's Kitchen）", clean: 4, vibe: 4, price: 4 },
        { city: '第比利斯', name: 'City Guli Hostel', clean: 4, vibe: 3, price: 4 },
        { city: '西格纳吉', name: '那托与拉多旅馆', clean: 4, vibe: 5, price: 4 },
        { city: '巴统', name: 'Hostel VOYAGE', clean: 4, vibe: 3, price: 3 }
      ],
      '亚美尼亚': [],
      '土耳其': [
        { city: '格雷梅', name: 'Cave Homestay', clean: 4, vibe: 5, price: 4 },
        { city: '安塔利亚', name: 'BE BOLD Hostel', clean: 5, vibe: 4, price: 3 },
        { city: '费特希耶', name: 'HZD ADAPTMENTS Hostel', clean: 3, vibe: 3, price: 3 },
        { city: '伊斯坦布尔', name: 'Central House Istanbul Taksim', clean: 4, vibe: 4, price: 5 }
      ],
      '埃及': [
        { city: '达哈卜', name: '阿拉斯加旅馆', clean: 2, vibe: 3, price: 3 },
        { city: '达哈卜', name: 'Carmine Hostel', clean: 3, vibe: 4, price: 4 },
        { city: '亚历山大', name: 'Ithaka Mansheya Hostel', clean: 4, vibe: 4, price: 3 },
        { city: '马特鲁', name: '龙门客栈', clean: 5, vibe: 5, price: 3 },
        { city: '锡瓦', name: 'A&S House', clean: 4, vibe: 4, price: 5 },
        { city: '开罗', name: 'Madina Hostel', clean: 4, vibe: 5, price: 5 }
      ],
      '阿联酋': []
    },
    noteAM: '亚美尼亚是蹭的住宿，因此不予推荐；建议选软件评分高的。'
  };

  // ---------- 全程交通：每一段怎么接上（大环线页）----------
  // mode 用 emoji：🚌汽车/巴士 🚐小巴/面包车 🚗自驾 🚄火车 ✈️飞机
  var routeSteps = [
    { from: '沅陵', to: '长沙', mode: '🚌', time: '', country: '中国', note: '' },
    { from: '长沙', to: '乌鲁木齐', mode: '✈️', time: '', country: '中国', note: '' },
    { from: '乌鲁木齐', to: '伊犁', mode: '🚄', time: '', country: '中国', note: '' },
    { from: '伊犁', to: '阿拉木图', mode: '🚌', time: '11h', country: '哈萨克斯坦', note: '陆路口岸出境' },
    { from: '阿拉木图', to: '阿克套', mode: '✈️', time: '', country: '哈萨克斯坦', note: '' },
    { from: '阿克套', to: '第比利斯', mode: '✈️', time: '', country: '格鲁吉亚', note: '' },
    { from: '第比利斯', to: '西格纳吉', mode: '🚐', time: '', country: '格鲁吉亚', note: '往返' },
    { from: '第比利斯', to: '卡兹别克', mode: '🚐', time: '', country: '格鲁吉亚', note: '一日团往返' },
    { from: '第比利斯', to: '埃里温', mode: '🚗', time: '', country: '亚美尼亚', note: '3 人租车自驾' },
    { from: '第比利斯', to: '巴统', mode: '🚌', time: '6h', country: '格鲁吉亚', note: '' },
    { from: '巴统', to: 'Hopa 车站', mode: '🚐', time: '', country: '土耳其', note: '巴统公交 → spari 口岸 → 步行过境 → 土耳其小巴' },
    { from: 'Hopa 车站', to: 'Nevşehir', mode: '🚌', time: '17h', country: '土耳其', note: '长途汽车' },
    { from: 'Nevşehir', to: '格雷梅', mode: '🚌', time: '', country: '土耳其', note: '公交车' },
    { from: '格雷梅', to: '安塔利亚', mode: '🚌', time: '8h', country: '土耳其', note: '' },
    { from: '安塔利亚', to: '卡什', mode: '🚐', time: '3.5h', country: '土耳其', note: 'D700 公路，风景极好' },
    { from: '卡什', to: '费特希耶', mode: '🚐', time: '2.5h', country: '土耳其', note: '' },
    { from: '费特希耶', to: '伊斯坦布尔（新欧洲区）', mode: '🚌', time: '14h', country: '土耳其', note: '' },
    { from: '伊斯坦布尔', to: '沙姆沙伊赫', mode: '✈️', time: '', country: '埃及', note: '伊斯坦布尔有两个机场，订票一定确认' },
    { from: '沙姆沙伊赫', to: '达哈卜', mode: '🚗', time: '', country: '埃及', note: 'Taxi' },
    { from: '达哈卜', to: '亚历山大', mode: '🚌', time: '11h', country: '埃及', note: '' },
    { from: '亚历山大', to: '马特鲁', mode: '🚌', time: '4h', country: '埃及', note: '' },
    { from: '马特鲁', to: '锡瓦', mode: '🚐', time: '4h', country: '埃及', note: '小巴' },
    { from: '锡瓦', to: '开罗', mode: '🚌', time: '12h', country: '埃及', note: 'WITBUS' },
    { from: '开罗', to: '迪拜', mode: '✈️', time: '', country: '阿联酋', note: '返程第一段' },
    { from: '迪拜', to: '杭州', mode: '✈️', time: '', country: '中国', note: '返程' },
    { from: '杭州', to: '怀化', mode: '🚄', time: '17h', country: '中国', note: '返程火车' }
  ];

  // 按国家分组索引（“分别到每个国家怎么走”）
  function routeByCountry() {
    var map = {};
    routeSteps.forEach(function (s) {
      (map[s.country] = map[s.country] || []).push(s);
    });
    return map;
  }

  // ---------- 59 天时间轴（按真实停留拆分）----------
  var timeline = [
    { place: '乌鲁木齐', days: 3, country: '中国', note: '出发段' },
    { place: '伊犁', days: 2, country: '中国', note: '陆路出境前' },
    { place: '阿拉木图', days: 4, country: '哈萨克斯坦', note: '绿巴扎 · 地铁打卡' },
    { place: '阿克套', days: 3, country: '哈萨克斯坦', note: '里海 · Mangystau 一日团' },
    { place: '格鲁吉亚（第比利斯/西格纳吉/姆兹赫塔/巴统）', days: 6, country: '格鲁吉亚', note: '高加索陆路' },
    { place: '亚美尼亚（久姆里/埃里温/塞凡镇）', days: 4, country: '亚美尼亚', note: '3 人租车自驾' },
    { place: '土耳其（格雷梅/安塔利亚/卡什/费特希耶/伊斯坦布尔）', days: 11, country: '土耳其', note: '17 小时大巴过境' },
    { place: '埃及（达哈卜/亚历山大/马特鲁/锡瓦/开罗）', days: 23, country: '埃及', note: '潜水 · 撒哈拉' },
    { place: '迪拜', days: 1, country: '阿联酋', note: '哈利法塔 · Dubai Mall' },
    { place: '杭州', days: 2, country: '中国', note: '返程中转' }
  ];

  // ---------- 6 国攻略 ----------
  var countries = [
    {
      id: 'kz', name: '哈萨克斯坦', en: 'KAZAKHSTAN', region: '中亚', days: 7,
      tags: ['雪山', '草原', '现代城市', '里海'],
      summary: '中亚面积最大的国家，从中亚进入环线的第一站。',
      visa: '免签',
      visaDetail: '中哈互免签证（2023-11 生效），单次停留不超过 30 天。免签入境，出行前以官方信息为准。（待核实：2026 最新政策）',
      insurance: '', sim: '提前购买电话卡（¥44），使用 6 天。',
      payment: '城市公交、地铁可用；地铁站风格各异。',
      exchange: '物价不便宜，更推荐自己做饭。',
      exchangeRate: { label: '1 元 ≈ 67 坚戈', updated: '2026-09-14', src: '新浪财经/哈央行 2026-09-14' },
      food: '汉堡等快餐为主；自己做饭更划算。',
      accommodation: '推荐：Good Inn Hostel（阿拉木图）。',
      transportDetail: [
        { route: '阿拉木图 → 阿克套', mode: '飞机', cost: '¥855', note: '哈国内飞行' },
        { route: '阿克套 → 第比利斯', mode: '飞机', cost: '¥781', note: '飞往格鲁吉亚' }
      ],
      cities: [
        {
          name: '阿拉木图', days: 4, items: [
            '绿巴扎附近免费打卡三件套值得看看',
            '地铁站值得打卡，每个站是不同的苏联风格',
            '城市交通以公交、地铁为主，可以办公交卡',
            '落日飞车不推荐：排队久，排到天黑',
            '博物馆 70，文物较少，性价比不高',
            '物价不便宜，更推荐自己做饭',
            '推荐住宿：Good Inn Hostel'
          ],
          sights: ['绿巴扎', '地铁站', '科克托别山']
        },
        {
          name: '阿克套', days: 3, items: [
            '哈萨克斯坦最西边，靠近里海',
            '可以报 Mangystau 一日团（Instagram：mangystau_safari；也可以使用 GetYourGuide）'
          ],
          sights: ['里海', 'Mangystau 荒漠地貌']
        }
      ],
      tips: [
        '落日飞车不推荐，排队久',
        '博物馆性价比不高',
        '物价不便宜，自己做饭更省',
        '地处天山之间，气温较低，注意防寒',
        '公交卡在小红房子制作，部分车可用现金支付，司机若不收钱就“免单”了',
        '打车价格偏贵'
      ],
      verdict: '物价不算便宜，但地铁和绿巴扎值得看；阿拉木图适合慢下来住几天。',
      costKey: '哈萨克斯坦'
    },
    {
      id: 'ge', name: '格鲁吉亚', en: 'GEORGIA', region: '高加索', days: 6,
      tags: ['红酒', '山城', '黑海', '自驾'],
      summary: '高加索腹地，第比利斯老城、西格纳吉红酒小镇、巴统黑海。',
      visa: '免签',
      visaDetail: '格鲁吉亚免签。⚠️ 边检查保险概率高（尤其飞机入境，查电子凭证）——我本人经历过被查（当时没买保险，不推荐模仿），务必提前备好电子保单。（待核实：2026 最新保险规定，参考：2026 年起要求保额约 3 万拉里的旅行保险）',
      insurance: '边检查保险概率高（尤其飞机入境，查电子凭证）。我本人没买保险，不推荐模仿。',
      sim: '建议落地买电话卡（约 ¥55）。',
      payment: '巴统部分小巴和商店只收里拉；可少量兑换土耳其里拉。',
      exchange: '可以少量兑换土耳其里拉备用。',
      exchangeRate: { label: '1 元 ≈ 0.39 拉里', updated: '2026-09-14', src: 'Xe/菜鸟汇率 2026-09-14' },
      food: '自由广场旁的 45cm 长「Istanbul 卷饼店」；自己做饭。',
      accommodation: '第比利斯：City Guli Hostel（厨房好用、离自由广场近）；西格纳吉：那托与拉多青旅；巴统：Hostel VOYAGE。',
      transportDetail: [
        { route: '第比利斯 → 姆兹赫塔 → 久姆里 → 埃里温', mode: '3人租车自驾', cost: '分摊', note: '也可以拆开使用公共交通' },
        { route: '巴统 → 格土边境', mode: '公交', cost: '', note: '步行过境到土耳其' }
      ],
      cities: [
        {
          name: '第比利斯', items: [
            'Sol’s Kitchen（前台是南非小哥）',
            'City Guli Hostel：厨房好用，离自由广场近',
            '可以报 Kazbegi 一日团',
            '徒步可以考虑 Mestia、Juta'
          ],
          sights: ['自由广场', '老城', 'Kazbegi']
        },
        {
          name: '西格纳吉', items: [
            '可以当天往返，也可以住一晚',
            '推荐那托与拉多青旅：房东一家喜欢中国文化，会用自家葡萄酒和 Chacha 招待客人'
          ],
          sights: ['红酒小镇']
        },
        {
          name: '姆兹赫塔', items: ['巨石阵', '圣剑山', '不自驾建议包车'],
          sights: ['巨石阵', '圣剑山']
        },
        {
          name: '巴统', items: [
            '住宿：Hostel VOYAGE',
            '赌场很多；参加过赌场宣传活动，有免费啤酒和周边礼物',
            '可以少量兑换土耳其里拉；部分小巴和商店只收里拉'
          ],
          sights: ['黑海海滨']
        }
      ],
      tips: [
        '边检查保险概率高（尤其飞机），记得备好电子保单',
        '巴统换少量里拉，小巴和商店只收里拉',
        '姆兹赫塔不自驾建议包车',
        '卡兹别克一日团在 GetYourGuide 上很便宜',
        '很多古着店值得逛逛'
      ],
      verdict: '高加索最舒服的一段：红酒、山城、黑海，节奏适合放慢。',
      costKey: '格鲁吉亚'
    },
    {
      id: 'am', name: '亚美尼亚', en: 'ARMENIA', region: '高加索', days: 4,
      tags: ['塞凡湖', '修道院', '自己做饭'],
      summary: '高加索南端，塞凡湖与埃里温山城。',
      visa: '免签',
      visaDetail: '中国与亚美尼亚互免签证。（待核实：2026 最新停留规定）',
      insurance: '', sim: '使用“一带一路”流量卡，约 11.8 元/天。',
      payment: '埃里温几乎全程现金 + 自己做饭（账单可见消费很少）。',
      exchange: '现金为主，自己做饭。',
      exchangeRate: { label: '1 元 ≈ 54 德拉姆', updated: '2026-09-14', src: '新浪财经 2026-09-14' },
      food: '自己做饭；最大超市里的 BBQ 肉卷。',
      accommodation: '普通游客建议青旅（埃里温）。',
      transportDetail: [
        { route: '第比利斯 → 姆兹赫塔 → 久姆里 → 埃里温', mode: '3人租车自驾', cost: '¥1,000+¥225 分摊', note: '费用放入亚美尼亚·交通' },
        { route: '埃里温 ↔ 塞凡镇', mode: '公交', cost: '', note: '公交往返' }
      ],
      cities: [
        {
          name: '久姆里', days: 1, items: [], sights: []
        },
        {
          name: '埃里温', days: 2, items: [
            '种族灭绝纪念馆、神庙、教堂、石头狂想曲（具体景点名称以后根据照片确认）',
            '几乎全程自己做饭',
            '普通游客建议青旅'
          ],
          sights: ['种族灭绝纪念馆', '神庙', '教堂', '石头狂想曲']
        },
        {
          name: '塞凡镇', days: 1, items: [
            '公交往返埃里温',
            '塞凡湖、两座教堂',
            '山下 BBQ 好吃'
          ],
          sights: ['塞凡湖', '两座教堂']
        }
      ],
      tips: ['埃里温几乎全程自己做饭', '塞凡镇山下 BBQ 好吃', '若自驾收停车费时可以说没有现金要求刷卡，无 POS 机会放行', '埃里温有南线东线团，可以报一日团'],
      verdict: '小众但舒服的一站，塞凡湖值得；消费低，适合自己做饭省预算。',
      costKey: '亚美尼亚'
    },
    {
      id: 'tr', name: '土耳其', en: 'TURKEY', region: '中东 · 安纳托利亚', days: 11,
      tags: ['热气球', 'D700', '跳岛', '两洲之城'],
      summary: '格雷梅的洞穴、安塔利亚的海岸、费特希耶的跳岛、伊斯坦布尔的欧亚两岸。',
      visa: '免签',
      visaDetail: '土耳其对中国免签。（待核实：2026 最新政策，参考：2026-01 起免签，180 天内累计停留不超过 90 天）',
      insurance: '', sim: '提前购买流量卡（¥39）。',
      payment: '大部分项目需要现金支付；交通小红卡刷 Visa 价格明显更高，建议办卡。',
      exchange: '伊斯坦布尔亚洲区物价更便宜。',
      exchangeRate: { label: '1 元 ≈ 7.25 里拉', updated: '2026-09-14', src: '新浪财经 2026-09-14' },
      food: '格雷梅自己做饭；其他地方以快餐为主。',
      accommodation: '格雷梅：Home Cave Hostel；安塔利亚：BE BOLD Hostel；费特希耶：HZD 青旅；伊斯坦布尔：塔克西姆中央酒店。',
      transportDetail: [
        { route: '巴统 → 格土边境 → Hopa → Nevşehir → 格雷梅', mode: '长途汽车', cost: '', note: '约 17 小时' },
        { route: '格雷梅 → 安塔利亚', mode: '汽车', cost: '', note: '' },
        { route: '安塔利亚 → 费特希耶', mode: '汽车', cost: '', note: '可直达，也可经卡什走 D700 公路' },
        { route: '费特希耶 → 伊斯坦布尔', mode: '汽车', cost: '', note: '' },
        { route: '伊斯坦布尔 → 沙姆沙伊赫', mode: '飞机', cost: '¥524', note: '提前购买；伊斯坦布尔有两个机场，订票一定确认机场' }
      ],
      cities: [
        {
          name: '格雷梅', days: 3, items: [
            '住宿：Home Cave Hostel，厨房和三楼阳台很大',
            '连续 3 天自己做饭，在 101 买食材',
            '热气球需要提前预定，且不一定每天飞',
            '玫瑰谷徒步推荐',
            '山坡可以看日落和夜景',
            '没有坐热气球，而是在地面追热气球'
          ],
          sights: ['玫瑰谷', '热气球（地面追）', '日落山坡']
        },
        {
          name: '安塔利亚', days: 1, items: [
            '主要是去费特希耶的中转站',
            '住宿：BE BOLD Hostel，青旅经常有活动',
            '可以钓螃蟹（Decathlon 买线和抄网）',
            '在 101 买鸡腿'
          ],
          sights: ['老城', '海岸']
        },
        {
          name: '卡什', days: 1, items: [
            'D700 公路非常漂亮，海水像果冻',
            '不需要专门去所谓“最美海滩”',
            '中转时吃午饭、喝咖啡、三角梅拍照，然后继续去费特希耶'
          ],
          sights: ['D700 公路', '果冻海']
        },
        {
          name: '费特希耶', days: 2, items: [
            '强烈推荐海盗船跳岛游',
            '黑珍珠、龙号中国游客多；其他船外国游客更多',
            '二楼甲板座位约 1000 里拉（价格待核实）',
            '船费约 2000 里拉，只收现金',
            '住宿：HZD 青旅',
            '去海滩需要城市 mini 巴士'
          ],
          sights: ['跳岛游', '海滩']
        },
        {
          name: '伊斯坦布尔', days: 4, items: [
            '新欧洲区、老欧洲区、亚洲区；亚洲区物价更便宜',
            '圣索菲亚大教堂、蓝色清真寺在老欧洲区',
            '住宿：塔克西姆中央酒店',
            '建议办理交通小红卡（制卡费 210 里拉，价格待核实）',
            '可以坐地铁、游轮；刷 Visa 价格明显更高',
            '两次游轮基本可以回本',
            '推荐烤玉米、土耳其卷饼'
          ],
          sights: ['圣索菲亚大教堂', '蓝色清真寺', '博斯普鲁斯游轮']
        }
      ],
      tips: [
        '热气球不一定每天飞，提前订',
        '海盗船跳岛只收现金',
        '小红卡刷 Visa 更贵，办卡划算',
        '伊斯坦布尔两个机场，订票看准',
        'Booking 可能被当地网络屏蔽，用国内流量卡',
        '平价超市 101、BMI',
        '土耳其 ATM 取钱手续费特高',
        '大巴公司个人感觉都差不多，可以在小红书上攻略参考'
      ],
      verdict: '整条环线最好玩的国家之一。格雷梅追热气球、费特希耶跳岛、伊斯坦布尔欧亚两岸——都值得。',
      costKey: '土耳其'
    },
    {
      id: 'eg', name: '埃及', en: 'EGYPT', region: '北非', days: 23,
      tags: ['潜水', '沙漠', '红海', '古文明'],
      summary: '23 天只花 ¥9,616——达哈卜潜水躺平、锡瓦撒哈拉、开罗金字塔。性价比最高的国家。',
      visa: '落地签 30 美元',
      visaDetail: '抵达机场办落地签，约 30 美元（300 美元现金中分配 30 美元）。可提前在线办 eVisa 免排队。（待核实：2026 最新政策）',
      insurance: '', sim: '落地购买 WE 电话卡（在达哈卜使用 30GB WE 流量卡）。',
      payment: 'Uber 和 inDrive 都很好用，打车比前面国家便宜；Visa 在 National Bank ATM 取现，每笔国内银行卡约收 3 美元手续费。',
      exchange: '美元主要用于兑换当地货币（300 美元现金中埃及分配：落地签 30 + 换钱 20 + 潜水混合支付 50）。',
      exchangeRate: { label: '1 元 ≈ 7.4 埃镑', updated: '2026-09-14', src: '中国货币网参考汇率 2026-09' },
      food: '中餐、穆斯林餐、快餐。',
      accommodation: '马特鲁：龙门客栈青旅（中国人开的）；锡瓦：A&S House；开罗：马迪纳旅舍（Agoda）。',
      transportDetail: [
        { route: '沙姆沙伊赫机场 → 达哈卜', mode: 'Taxi', cost: '', note: '' },
        { route: '达哈卜 → 亚历山大', mode: '汽车', cost: '', note: '' },
        { route: '亚历山大 → 马特鲁', mode: '汽车', cost: '', note: '' },
        { route: '马特鲁 → 锡瓦', mode: '小巴', cost: '', note: '下车后赶时间要第一时间买去开罗的车票' },
        { route: '锡瓦 → 开罗', mode: 'WITBUS', cost: '', note: '' },
        { route: '开罗 → 迪拜', mode: '飞机', cost: '', note: '' }
      ],
      cities: [
        {
          name: '达哈卜', days: 9, items: [
            '非常适合躺平，物价不高；不去海上餐厅就可以控制成本',
            '潜水非常便宜：1 对 2 全英教学约 300 欧元，1 对 1 约 350 欧元',
            '中国游客较多的潜店：Seven、Fish and Friends',
            '两证通常约 5 天 11 潜',
            '桨板约 200–300 埃镑；户外野攀约 20 美元',
            '还有西奈山日出、马术、ATV、风筝冲浪、自由潜、海钓、约旦一日游等活动'
          ],
          sights: ['红海潜水', '西奈山日出', '蓝洞']
        },
        {
          name: '亚历山大', days: 1, items: [
            '图书馆（个人认为可以直接省略）',
            '可以从达哈卜直接去马特鲁'
          ],
          sights: ['图书馆']
        },
        {
          name: '马特鲁', days: 3, items: [
            '住宿：龙门客栈青旅（中国人开的，有住宿和餐厅）',
            '有多个海滩；包车约 4 小时 500–700 埃镑',
            'Agooba Beach 值得去；马特鲁之眼可以下海',
            '海滩费用记忆为 15 过路费 + 50 门票（价格待核实）'
          ],
          sights: ['Agooba Beach', '马特鲁之眼']
        },
        {
          name: '锡瓦', days: 4, items: [
            '小巴到达；下车后如果赶时间，要第一时间买去开罗的车票',
            '住宿：A&S House，当地一家三口经营；海外旅行中唯一一次独享一间房',
            '市内主要坐三轮车',
            '盐湖、克娄巴特拉温泉',
            '撒哈拉沙漠一日团强烈推荐，约 300 埃镑',
            '晚上有鸡腿'
          ],
          sights: ['盐湖', '克娄巴特拉温泉', '撒哈拉沙漠']
        },
        {
          name: '开罗', days: 6, items: [
            '住宿：马迪纳旅舍（Agoda 预订，位置不错）',
            '面对推销者要强硬；买东西货比三家、砍价',
            '开罗博物馆可以通过闲鱼购买便宜票',
            '没有进入金字塔：热、人多、臭',
            '可以在金字塔外肯德基二楼拍狮身人面像',
            '垃圾城值得去'
          ],
          sights: ['金字塔（外观）', '埃及博物馆', '垃圾城']
        }
      ],
      tips: [
        'Uber/inDrive 打车，便宜且好用',
        '面对推销者要强硬，货比三家砍价',
        '金字塔不进去，肯德基二楼拍狮身人面像',
        '锡瓦下车先买去开罗的车票',
        '潜水和沙漠团是亮点',
        '取款机取不出钱可尝试自定义金额 3000 元，百试百灵'
      ],
      verdict: '性价比之王：23 天 ¥9,616，潜水 + 撒哈拉 + 红海躺平。西奈半岛和锡瓦是精华。',
      costKey: '埃及'
    },
    {
      id: 'ae', name: '阿联酋', en: 'UAE', region: '海湾', days: 1,
      tags: ['哈利法塔', 'Dubai Mall', '中转'],
      summary: '1 天中转：哈利法塔 + Dubai Mall，落地领流量卡。',
      visa: '免签',
      visaDetail: '阿联酋对中国免签。（待核实：2026 最新政策）',
      insurance: '', sim: '迪拜落地领取流量卡。',
      payment: '不要换太多现金（100 元人民币现金换了迪拜钱）。',
      exchange: '机场/市区换少量现金即可。',
      exchangeRate: { label: '1 元 ≈ 0.55 迪拉姆', updated: '2026-09-14', src: 'Xe/Wise 2026-09-14' },
      food: '机场贵宾厅、中餐。',
      accommodation: '仅 1 天中转，未安排长期住宿。',
      transportDetail: [
        { route: '开罗 → 迪拜', mode: '飞机', cost: '', note: '返程第一段' },
        { route: '迪拜 → 杭州', mode: '飞机', cost: '¥2,685', note: '返程机票（含开罗→杭州经迪拜）' }
      ],
      cities: [
        {
          name: '迪拜', days: 1, items: [
            '落地领取流量卡；出机场办理地铁一日卡',
            '天气太热，不建议把大量时间放在老城区，更适合去商场吹空调',
            '去了哈利法塔和 Dubai Mall',
            '如果乘坐 Emirates，可以向空姐要拍立得和航空公司周边礼物',
            '不要换太多现金',
            '机场贵宾厅价格、服务等待核实'
          ],
          sights: ['哈利法塔', 'Dubai Mall']
        }
      ],
      tips: ['落地领流量卡 + 地铁一日卡', '太热，商场为主', 'Emirates 可向空姐要周边礼物', '不要换太多现金'],
      verdict: '纯中转城市，1 天足够：哈利法塔打卡 + 商场吹空调。',
      costKey: '阿联酋'
    }
  ];

  // ---------- 花费（2026-09-14 账单定稿）----------
  var costs = {
    total: '¥22,355',
    target: '¥22,400',
    note: '含全部旅行支出：交通、住宿、餐饮、电话卡、门票、活动、潜水、租车、打车、签证、其他。',
    status: '按三份真实账单（微信/支付宝/工行Visa）+ 现金补充整理定稿；差额 ¥45 为零散现金未计入。工行卡按 1USD≈6.76CNY。',
    categories: ['交通', '住宿', '餐饮', '活动', '门票', '通信', '其他'],
    byCountry: {
      '中国': { 交通: 1365, 住宿: 350, 餐饮: 209, 活动: 0, 门票: 30, 通信: 0, 其他: 80, 合计: 2033 },
      '哈萨克斯坦': { 交通: 1919, 住宿: 193, 餐饮: 561, 活动: 316, 门票: 0, 通信: 44, 其他: 313, 合计: 3346 },
      '格鲁吉亚': { 交通: 164, 住宿: 0, 餐饮: 605, 活动: 353, 门票: 0, 通信: 55, 其他: 645, 合计: 1822 },
      '亚美尼亚': { 交通: 1242, 住宿: 0, 餐饮: 0, 活动: 0, 门票: 0, 通信: 0, 其他: 47, 合计: 1289 },
      '土耳其': { 交通: 1426, 住宿: 608, 餐饮: 938, 活动: 120, 门票: 4, 通信: 51, 其他: 700, 合计: 3847 },
      '埃及': { 交通: 2848, 住宿: 1017, 餐饮: 1437, 活动: 2406, 门票: 231, 通信: 0, 其他: 1676, 合计: 9616 },
      '阿联酋': { 交通: 40, 住宿: 0, 餐饮: 102, 活动: 0, 门票: 0, 通信: 0, 其他: 260, 合计: 403 }
    },
    highlights: [
      '交通是大头：含 7 段国际/长线交通，返程「开罗→杭州(经迪拜)」机票 ¥2,685',
      '潜水：达哈卜两证，13,968 埃镑(卡付) + 50 美元(现金)',
      '住宿以青旅多人间为主，Booking + Agoda 比价，机场过夜 2 次',
      '埃及 23 天只花 ¥9,616，性价比最高的国家',
      '亚美尼亚账单可见消费极少——埃里温几乎全程现金 + 自己做饭'
    ]
  };

  // ---------- 实拍 ----------
  var photos = {
    status: '62 张 iPhone 实拍，按国家归档（2026-09-16 更新）。',
    cover: 'photos/tr/img1.jpg',
    byCountry: {
      kz: ['photos/kz/img1.jpg', 'photos/kz/img2.jpg', 'photos/kz/img3.jpg', 'photos/kz/img4.jpg', 'photos/kz/img5.jpg', 'photos/kz/img6.jpg',
           'photos/kz/img7.jpg', 'photos/kz/img8.jpg', 'photos/kz/img9.jpg', 'photos/kz/img10.jpg', 'photos/kz/img11.jpg', 'photos/kz/img12.jpg', 'photos/kz/img13.jpg'],
      ge: ['photos/ge/img1.jpg', 'photos/ge/img2.jpg', 'photos/ge/img3.jpg', 'photos/ge/img4.jpg', 'photos/ge/img5.jpg', 'photos/ge/img6.jpg', 'photos/ge/img7.jpg',
           'photos/ge/img8.jpg', 'photos/ge/img9.jpg', 'photos/ge/img10.jpg', 'photos/ge/img11.jpg', 'photos/ge/img12.jpg', 'photos/ge/img13.jpg'],
      am: ['photos/am/img1.jpg', 'photos/am/img2.jpg', 'photos/am/img3.jpg', 'photos/am/img4.jpg', 'photos/am/img5.jpg'],
      tr: ['photos/tr/img1.jpg', 'photos/tr/img2.jpg', 'photos/tr/img3.jpg', 'photos/tr/img4.jpg', 'photos/tr/img5.jpg', 'photos/tr/img6.jpg', 'photos/tr/img7.jpg',
           'photos/tr/img8.jpg', 'photos/tr/img9.jpg', 'photos/tr/img10.jpg', 'photos/tr/img11.jpg', 'photos/tr/img12.jpg', 'photos/tr/img13.jpg'],
      eg: ['photos/eg/img1.jpg', 'photos/eg/img2.jpg', 'photos/eg/img3.jpg', 'photos/eg/img4.jpg', 'photos/eg/img5.jpg', 'photos/eg/img6.jpg',
           'photos/eg/img7.jpg', 'photos/eg/img8.jpg', 'photos/eg/img9.jpg', 'photos/eg/img10.jpg', 'photos/eg/img11.jpg', 'photos/eg/img12.jpg', 'photos/eg/img13.jpg', 'photos/eg/img14.jpg'],
      ae: ['photos/ae/img1.jpg', 'photos/ae/img2.jpg', 'photos/ae/img3.jpg', 'photos/ae/img4.jpg']
    },
    captions: {
      'photos/kz/img1.jpg': '绿巴扎：马肉摊',
      'photos/kz/img2.jpg': '阿拉木图：雪山下的游乐园',
      'photos/kz/img3.jpg': '阿拉木图：东正教教堂',
      'photos/kz/img4.jpg': '阿拉木图地铁：马赛克壁画站',
      'photos/kz/img5.jpg': '阿拉木图周边山地',
      'photos/kz/img6.jpg': '阿克套：Mangystau 荒漠雅丹',
      'photos/kz/img7.jpg': '阿拉木图：市中心古典建筑',
      'photos/kz/img8.jpg': '东正教堂内部：金色圣像壁与穹顶',
      'photos/kz/img9.jpg': '游乐园：黄昏旋转飞椅',
      'photos/kz/img10.jpg': '地铁站：拱形壁画墙',
      'photos/kz/img11.jpg': '拱形门洞：马赛克壁画',
      'photos/kz/img12.jpg': '街头：人物涂鸦墙面',
      'photos/kz/img13.jpg': '纪念碑：永恒之火圣火台',
      'photos/ge/img1.jpg': '西格纳吉：那托家青旅聚会',
      'photos/ge/img2.jpg': '西格纳吉：写生的人',
      'photos/ge/img3.jpg': '第比利斯：黄昏与缆车',
      'photos/ge/img4.jpg': '第比利斯街头涂鸦',
      'photos/ge/img5.jpg': '姆兹赫塔：圣剑山雕塑',
      'photos/ge/img6.jpg': '姆兹赫塔：巨石阵纪念碑',
      'photos/ge/img7.jpg': '卡兹别克：格尔盖蒂三一教堂',
      'photos/ge/img8.jpg': '红砖教堂与开阔地貌',
      'photos/ge/img9.jpg': '木托盘上的玻璃器皿与苹果',
      'photos/ge/img10.jpg': '彩绘涂鸦的金属栏杆',
      'photos/ge/img11.jpg': '复古钟楼前的广场人群',
      'photos/ge/img12.jpg': '金属双人雕塑',
      'photos/ge/img13.jpg': '教堂前的新人（婚礼）',
      'photos/am/img1.jpg': '埃里温：Cascade 阶梯',
      'photos/am/img2.jpg': '塞凡湖：湖畔教堂',
      'photos/am/img3.jpg': '加尼神庙',
      'photos/am/img4.jpg': '石头狂想曲：柱状岩壁',
      'photos/am/img5.jpg': '教堂内部：祭坛烛光',
      'photos/tr/img1.jpg': '格雷梅：小镇黄昏全景',
      'photos/tr/img2.jpg': '格雷梅：地面追热气球',
      'photos/tr/img3.jpg': '地中海：海边泡水',
      'photos/tr/img4.jpg': '费特希耶：海盗船泡沫派对',
      'photos/tr/img5.jpg': '伊斯坦布尔：清真寺穹顶',
      'photos/tr/img6.jpg': '伊斯坦布尔：黄昏与海鸥',
      'photos/tr/img7.jpg': '伊斯坦布尔：港口圆月',
      'photos/tr/img8.jpg': '海边花丛与海面',
      'photos/tr/img9.jpg': '日落时分的城市街景',
      'photos/tr/img10.jpg': '人多的海滨沙滩',
      'photos/tr/img11.jpg': '水岸阶梯',
      'photos/tr/img12.jpg': '热气球剪影（格雷梅）',
      'photos/tr/img13.jpg': '复古红色有轨电车',
      'photos/eg/img1.jpg': '达哈卜：红海珊瑚礁',
      'photos/eg/img2.jpg': '达哈卜：野攀',
      'photos/eg/img3.jpg': '马特鲁：Ageeba 沙滩公路',
      'photos/eg/img4.jpg': '撒哈拉：沙丘光影',
      'photos/eg/img5.jpg': '撒哈拉：沙漠银河',
      'photos/eg/img6.jpg': '开罗：图坦卡蒙黄金面具',
      'photos/eg/img7.jpg': '红海：海草间的海鳗',
      'photos/eg/img8.jpg': '红海：珊瑚礁潜水',
      'photos/eg/img9.jpg': '海岸：岩石拱洞',
      'photos/eg/img10.jpg': '海岸礁石与海浪',
      'photos/eg/img11.jpg': '沙漠古城遗址',
      'photos/eg/img12.jpg': '撒哈拉：篝火旁',
      'photos/eg/img13.jpg': '穹顶建筑（清真寺）',
      'photos/eg/img14.jpg': '吉萨：金字塔与狮身人面像',
      'photos/ae/img1.jpg': '迪拜：哈利法塔夜景',
      'photos/ae/img2.jpg': '迪拜机场贵宾厅',
      'photos/ae/img3.jpg': '迪拜：相框与车流',
      'photos/ae/img4.jpg': '迪拜：Dubai Mall 水族馆'
    }
  };

  // ---------- 会变化的信息：发布前联网核实 ----------
  var verification = {
    note: '签证、保险要求、交通、价格、门票、电话卡、营业时间等会变化的信息，最终发布前会重新联网核实，并标明更新时间。',
    priceToVerify: [
      '热气球价格',
      '费特希耶海盗船船票（约 2000 里拉）与二楼甲板座位（约 1000 里拉）',
      '伊斯坦布尔交通小红卡制卡费（记忆 210 里拉）',
      '马特鲁海滩费用（记忆 15 过路费 + 50 门票）',
      '迪拜机场贵宾厅价格与服务',
      '各国 2026 年最新签证与保险政策'
    ]
  };

  // ---------- 全站搜索索引 ----------
  function buildIndex() {
    var idx = [];
    countries.forEach(function (c) {
      idx.push({ k: '国家', title: c.name, en: c.en, href: 'destinations/' + c.id + '.html' });
      c.cities.forEach(function (city) {
        idx.push({ k: c.name + ' · 城市', title: city.name, href: 'destinations/' + c.id + '.html#city-' + encodeURIComponent(city.name) });
        city.sights.forEach(function (s) {
          idx.push({ k: c.name + ' · 景点', title: s, href: 'destinations/' + c.id + '.html#city-' + encodeURIComponent(city.name) });
        });
      });
    });
    idx.push({ k: '页面', title: '大环线', en: 'GRAND LOOP', href: 'grand-loop.html' });
    idx.push({ k: '页面', title: '出发准备', en: 'PREPARE', href: 'prepare.html' });
    idx.push({ k: '页面', title: '花费明细', en: 'COSTS', href: 'costs.html' });
    idx.push({ k: '页面', title: '实拍', en: 'PHOTOS', href: 'photos.html' });
    return idx;
  }

  // ---------- 城市示意坐标（仅用于示意点线图）----------
  var cityCoords = {
    '沅陵': [28.45, 110.40], '长沙': [28.23, 112.94], '乌鲁木齐': [43.83, 87.62], '伊犁': [43.92, 81.28],
    '阿拉木图': [43.24, 76.89], '阿克套': [43.65, 51.16],
    '第比利斯': [41.72, 44.78], '西格纳吉': [41.62, 45.92], '姆兹赫塔': [41.84, 44.72], '巴统': [41.65, 41.64],
    '久姆里': [40.79, 43.85], '埃里温': [40.18, 44.51], '塞凡镇': [40.56, 44.94],
    '格雷梅': [38.64, 34.83], '安塔利亚': [36.89, 30.71], '卡什': [36.20, 29.64], '费特希耶': [36.62, 29.11], '伊斯坦布尔': [41.01, 28.98],
    '达哈卜': [28.49, 34.51], '亚历山大': [31.20, 29.92], '马特鲁': [31.35, 27.24], '锡瓦': [29.20, 25.52], '开罗': [30.04, 31.24],
    '迪拜': [25.20, 55.27], '杭州': [30.27, 120.16], '怀化': [27.55, 110.00]
  };

  return {
    meta: meta,
    nav: nav,
    travelStyle: travelStyle,
    payment: payment,
    accommodation: accommodation,
    routeSteps: routeSteps,
    routeByCountry: routeByCountry(),
    hostels: hostels,
    timeline: timeline,
    countries: countries,
    costs: costs,
    photos: photos,
    verification: verification,
    cityCoords: cityCoords,
    searchIndex: buildIndex()
  };
})();

// Node 兼容（构建脚本用）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TRAVEL_GLOBAL.TRAVEL;
}
