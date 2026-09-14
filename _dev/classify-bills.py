# -*- coding: utf-8 -*-
"""账单分类 v2：国家 + 类别 + 旅行/非旅行 标记，并输出汇总（修正版）"""
import json, re

records = json.load(open(r"D:\亚欧非大环线\_dev\bills-structured.json", encoding="utf-8"))

CATS = ["交通", "住宿", "餐饮", "活动", "门票", "通信", "其他"]

# ---------- 商户关键词 → 类别 ----------
CAT_RULES = [
    (["OBILET", "阿斯兰", "去哪儿", "铁路12306", "携程旅行网", "高德打车", "红山一卡通",
      "地铁", "metro", "Metro", "RTA-DUBAI", "GO BUS", "FLYARYSTAN", "FLY ARYSTAN",
      "TOPLU TASIMA", "租车", "YANDEX", "火车票", "BUS", "加油站", "TRE.GE"], "交通"),
    (["BKG*HOTEL", "agoda", "Agoda", "AGODA", "HZD", "GOOD INN", "GOOD Inn", "小蓝房子",
      "泊途青旅", "马迪纳旅舍", "MADINA", "BE BOLD", "CARMINE HOTEL", "华盛园宾馆", "龙门客栈",
      "Hostel", "HOSTEL", "青旅", "旅舍", "APARTMENTS", "BOOKING"], "住宿"),
    (["MUSEUMS", "博物馆", "天鹅泉", "景区", "门票", "GOREME BELEDIYESI", "大埃及", "金字塔"], "门票"),
    (["GetYourGuide", "Mangystau", "SEVEN HEAVEN", "DIVE", "dive", "潜水", "热气球", "范教练",
      "FATIH", "NEBAHAT", "Backpacker", "马丁", "Seth"], "活动"),
    (["CELLFIE", "无忧行", "一带一路", "流量", "SIM", "电话卡"], "通信"),
    (["WENDYS", "TOIMART", "SAMAL", "CENTRALNYY", "KUDASBAEV", "DOSTYK KASSA", "SPORT INVEST",
      "ALTYN FOOD", "GULIZAR", "ALMATY-DONER", "DABYLOV", "DINA GIPERMARKET", "SAMSA", "NARODNYI",
      "SPAR", "spar", "GIN CORNER", "nikora", "DESERTER", "GEORGIAN BAKERY", "A101", "BIM",
      "GRATIS", "KAS GULSEN", "BLA BLA", "GOKHAN", "MINI MARKET", "MEHMET IPEK", "ANTAKYALI",
      "KEBAP", "CIHAN SARKUTERI", "MC DONALDS", "SOK", "TARHAN", "DURUM HOUSE", "KONAK",
      "BABIL", "BEREKET", "CARREFOURSA", "FAWRY", "PAYMOB", "Big O", "MARINA MARKET", "DFC CAFE",
      "RALPH", "TAC TAC", "THE KITCHEN", "ALAWAMY", "STARBUCKS", "ASWAK", "ELABD", "MARKT",
      "CHINESE PALACE", "伊宁市爱橙语", "339便利", "齐膳缘", "传奇刀削面", "疆湖王",
      "喀什一把抓", "每日每夜", "重庆味道", "柠季", "牛肉面", "BUFE", "CAFE",
      "PIDE", "DONER", "SARKUTERI", "PASTANESI", "BURGER", "MARKET", "SUPERMARKET",
      "GROCERY", "FABRIKA", "美团", "零食", "便利店", "烟酒", "BOLKVADZE", "TSIKARISHVILI",
      "SAZANDRISHVILI", "BT2", "TOROMAN", "CITIR", "BALIK", "GEIDEA", "AL PRINCE"], "餐饮"),
    (["ATM", "取款", "费用", "贷款利息", "利息", "药房", "大药房", "LUT", "拼多多", "服饰",
      "纯K", "光头数码", "Esign", "座套", "基金", "余额宝", "花呗", "MEZHD", "ALEX SERVICE",
      "KONYAALTI SUBE"], "其他"),
]

def guess_cat(rec):
    key = re.sub(r"\s+", " ", (rec.get("counterparty") or "") + " " + (rec.get("goods") or "") + " " + (rec.get("remark") or ""))
    for kws, cat in CAT_RULES:
        for kw in kws:
            if kw.lower() in key.lower():
                return cat
    return "其他"

def infer_rate(rec):
    a, s = rec.get("amount"), rec.get("settle_amount")
    if not a or not s or s <= 0:
        return None
    return a / s

# 商户关键词 → 国家（优先于日期）
MERCHANT_COUNTRY = [
    ("阿联酋", ["RTA-DUBAI", "CHINESE PALACE", "D844", "贵宾室", "贵宾厅", "迪拜"]),
    ("埃及", ["FAWRY", "NBE", "PAYMOB", "GO BUS", "SEVEN HEAVEN", "BEE*", "CARMINE",
             "DFC", "MARINA", "E FINANCE", "THE KITCHEN", "STARBUCKS IMMORTALS",
             "ASWAK", "BDC", "ELABD", "MARKT", "ALEX SERVICE", "RALPH", "ALWAMY",
             "BIG O", "GHZALH", "TAC TAC", "MSHWYAT", "SLYM", "FATHALLAH",
             "AL PRINCE", "SOLIMAN", "BKG*HOTEL", "Backpacker", "马丁", "Seth",
             "大埃及", "金字塔", "MADINA", "马迪纳", "开罗", "马特鲁", "锡瓦", "达哈卜", "亚历山大"]),
    ("土耳其", ["OBILET", "BILISIM", "GOREME", "NEV", "BIM", "GRATIS", "A101",
               "KAS ", "KASAN", "ANTALYA", "BELBIM", "KEBAP", "CIHAN", "MC DONALDS",
               "SOK", "TARHAN", "DURUM", "KONAK", "BABIL", "BEREKET", "CARREFOURSA",
               "SEZAYI", "TOPLU", "BLA BLA", "GOKHAN", "MEHMET", "ANTAKYALI",
               "BE BOLD", "CITIR", "KONYAALTI", "ALTIN", "NEBAHAT", "FATIH",
               "SABIHA", "PIDE", "DONER", "范教练", "热气球", "格雷梅", "伊斯坦布尔"]),
    ("格鲁吉亚", ["SPAR", "CELLFIE", "NIKORA", "TBILISI", "GIN CORNER", "FABRIKA",
                "DESERTER", "BOLKVADZE", "TSIKARISHVILI", "SAZANDRISHVILI", "BT2",
                "TRE.GE", "BAKERY", "METRO SERVICE", "ESIGN", "TOROMAN", "GEORGIAN",
                "LTD NN", "西格纳吉", "第比利斯", "巴统"]),
    ("哈萨克斯坦", ["WENDYS", "TOIMART", "SAMAL", "CENTRALNYY", "KUDASBAEV", "DOSTYK",
                 "ALMATY", "METRO ALMATY", "MEZHD", "SPORT INVEST", "ALTYN", "FLYARYSTAN",
                 "GULIZAR", "DONER CAFE", "DABYLOV", "DINA", "SAMSA", "NARODNYI",
                 "MANGYSTAU", "AKTAU", "阿斯兰", "GOOD INN", "阿拉木图", "阿克套"]),
    ("亚美尼亚", ["久姆里", "埃里温", "塞凡", "HI FOOD"]),
]

def guess_country(rec):
    key = (rec.get("counterparty") or "") + " " + (rec.get("goods") or "")
    for c, kws in MERCHANT_COUNTRY:
        for kw in kws:
            if kw.lower() in key.lower():
                return c
    if rec["source"] == "icbc":
        r = infer_rate(rec)
        m = (rec.get("counterparty") or "").upper()
        # 汇率推断币种
        if r:
            if 2.0 < r < 3.6 and "YANDEX" in m:
                return "格鲁吉亚"
            if 300 < r < 460 and "YANDEX" in m:
                return "亚美尼亚"
            if 380 < r < 620 and "YANDEX" in m:
                return "哈萨克斯坦"
    d = rec["datetime"][:10]
    if d <= "2026-07-03":
        return "中国"
    if d <= "2026-07-10":
        return "哈萨克斯坦"
    if d <= "2026-07-16":
        return "格鲁吉亚"
    if d <= "2026-07-21":
        return "格鲁吉亚"
    if d <= "2026-07-31":
        return "土耳其"
    if d <= "2026-08-23":
        return "埃及"
    if d <= "2026-08-24":
        return "阿联酋"
    return "中国"

# 微信/支付宝 手动规则
MANUAL_OVERRIDES = {
    # (source, datetime, counterparty) → (country, cat, trip, note)
    ("alipay", "2026-08-22", "铁路12306"): ("中国", "交通", True, "杭州→怀化火车票(返程)"),
    ("alipay", "2026-08-05", "去哪儿网"): ("埃及", "交通", True, "开罗→杭州机票(经迪拜)"),
    ("wechat", "2026-07-31", "Seth"): ("埃及", "餐饮", True, "达哈卜中国餐厅:换现金+吃饭(未拆分)"),
    ("alipay", "2026-08-25", "座套**饰"): ("中国", "其他", False, "网购服饰(疑似非旅行)"),
    ("alipay", "2026-07-07", "Banana"): ("哈萨克斯坦", "其他", False, "帮朋友代买(不计入旅行支出)"),
    ("alipay", "2026-07-07", "阿斯兰航服国际"): ("土耳其", "交通", True, "伊斯坦布尔→沙姆沙伊赫机票(提前买)"),
    ("alipay", "2026-08-16", "阿斯兰航空服务（上海）有限公司"): ("土耳其", "交通", True, "机票联订任务扣回(关联阿斯兰国际机票)"),
    ("icbc", "2026-07-07", 'AO "FLYARYSTAN"'): ("哈萨克斯坦", "其他", True, "FlyArystan罚款(非机票)"),
    ("wechat", "2026-07-24", "段素素 杭州 (载酒小粽🏹)"): ("亚美尼亚", "交通", True, "3人租车自驾分摊(第比利斯→姆兹赫塔→久姆里→埃里温)"),
    ("wechat", "2026-07-18", "段素素 杭州 (载酒小粽🏹)"): ("亚美尼亚", "交通", True, "3人租车自驾分摊(群收款)"),
    ("wechat", "2026-07-19", "段素素 杭州 (载酒小粽🏹)"): ("亚美尼亚", "交通", True, "3人租车自驾分摊(群收款)"),
}

for rec in records:
    rec["trip"] = True
    rec["exclude"] = False
    rec["note"] = ""
    rec["country"] = guess_country(rec)
    rec["cat"] = guess_cat(rec)

    if rec["source"] == "alipay":
        if rec["dir"] == "不计收支":
            rec["exclude"] = True
            rec["note"] = "投资理财/还款/收益"
        elif rec["status"] == "交易关闭":
            rec["exclude"] = True
            rec["note"] = "交易关闭"
        elif "退款" in rec["status"]:
            rec["exclude"] = True
            rec["note"] = "已退款"

    if rec["source"] == "wechat":
        if rec["dir"] == "收入":
            rec["exclude"] = True
            rec["note"] = "退款冲抵" if ("退款" in rec["type"] or "退款" in rec.get("remark", "")) else "转账/红包收入(非旅行)"
        if rec["dir"] == "支出":
            if "退款" in rec["status"] or "退还" in rec["status"]:
                rec["exclude"] = True
                rec["note"] = "已退款"
            cp = rec["counterparty"]
            g = rec.get("goods", "")
            if cp in ("光头数码二手回收", "纯K钱江店", "拼多多平台商户", "F磊"):
                rec["trip"] = False
                rec["note"] = "非旅行(回国后/网购)"
            if cp.startswith("段素素"):
                rec["trip"] = True
                rec["note"] = "群收款/转账(待确认)"
            if "群收款" in rec["type"]:
                rec["trip"] = True
                rec["note"] = "群收款分摊(待确认)"
            if cp in ("成都姐 (、)", "海南哥 (Happying)", "蒋昌航 浙江 (🤞Orion)",
                      "邓嘉仪 佛山 (菠萝皮)", "Monica", "柳立冬 (Vulcan.)", "老刘 (Waiting)",
                      "明月斋 马来西亚 (👑🤴🏻奉伊草堂🤴🏻👑)", "Y", "熊邵平 (Mliven)",
                      "刘苏情 邵东 (Amber)"):
                rec["trip"] = False
                rec["note"] = "转账(非旅行)"
            if "扫二维码付款" in rec["type"] and rec["amount"] <= 6:
                rec["cat"] = "餐饮"
                rec["note"] = "小额本地消费"

    if rec["source"] == "icbc":
        if rec["dir"] == "贷":
            rec["exclude"] = True
            rec["note"] = "还款" if rec["type"] == "转帐" else "退货冲抵"
        if "取款" in (rec["type"] or ""):
            rec["cat"] = "其他"
            rec["note"] = "ATM取现"
        if rec["type"] == "费用":
            rec["cat"] = "其他"
            rec["note"] = "ATM手续费"
        if rec["type"] == "贷款利息":
            rec["cat"] = "其他"
            rec["note"] = "贷款利息"

    # 手动覆盖
    mkey = (rec["source"], rec["datetime"][:10], rec.get("counterparty", ""))
    if mkey in MANUAL_OVERRIDES:
        c, cat, trip, note = MANUAL_OVERRIDES[mkey]
        rec["country"], rec["cat"], rec["trip"], rec["note"] = c, cat, trip, note
        rec["exclude"] = not trip

# ---------- 补充记录（不在三份账单内，用户 2026-09-14 提供） ----------
SUPPLEMENT = [
    # (datetime, amount_cny, country, cat, counterparty, note)
    ("2026-06-29 08:00:00", 80,    "中国",       "交通", "沅陵→长沙大巴",       "用户补充(现金)"),
    ("2026-06-29 21:00:00", 725,   "中国",       "交通", "长沙→乌鲁木齐机票",   "用户补充(出行前购买)"),
    ("2026-07-07 12:00:00", 855,   "哈萨克斯坦", "交通", "阿拉木图→阿克套机票", "用户补充(现金购票)"),
    ("2026-07-11 08:00:00", 781,   "哈萨克斯坦", "交通", "阿克套→第比利斯机票", "用户补充(现金购票)"),
    ("2026-07-04 12:00:00", 44,    "哈萨克斯坦", "通信", "哈萨克斯坦电话卡",   "用户补充(现金)"),
    ("2026-07-22 12:00:00", 39,    "土耳其",     "通信", "土耳其电话卡",       "用户补充(现金)"),
    # 300 美元现金分配（按 1USD=6.76CNY）+ 取现手续费 10
    ("2026-07-05 12:00:00", 20 * 6.76, "哈萨克斯坦", "其他", "美元现金换汇支出",   "300美元现金分配:换钱20美元"),
    ("2026-07-14 12:00:00", 80 * 6.76, "格鲁吉亚",   "其他", "美元现金换汇支出",   "300美元现金分配:换钱80美元"),
    ("2026-07-24 12:00:00", 100 * 6.76, "土耳其",   "其他", "美元现金换汇支出",   "300美元现金分配:换钱100美元"),
    ("2026-08-02 12:00:00", 30 * 6.76, "埃及",     "其他", "埃及落地签证",       "300美元现金分配:落地签30美元"),
    ("2026-08-10 12:00:00", 20 * 6.76, "埃及",     "其他", "美元现金换汇支出",   "300美元现金分配:换钱20美元"),
    ("2026-08-14 12:00:00", 50 * 6.76, "埃及",     "活动", "潜水证费用(现金部分)", "300美元现金分配:50美元混合支付"),
    ("2026-08-24 12:00:00", 100,   "阿联酋",     "其他", "100元现金换迪拜钱",   "用户补充(现金换汇)"),
    ("2026-06-28 12:00:00", 10,    "中国",       "其他", "美元取现手续费",     "用户补充(出行前取款)"),
]
for (dt, amt, country, cat, cp, note) in SUPPLEMENT:
    records.append({
        "source": "补充", "datetime": dt, "dir": "支出", "amount": round(amt, 2),
        "amount_ccy": "CNY", "settle_amount": None, "counterparty": cp,
        "goods": note, "status": "", "type": "", "remark": "",
        "cat": cat, "country": country, "trip": True, "exclude": False, "note": note,
    })

# ---------- 输出明细 ----------
with open(r"D:\亚欧非大环线\_dev\bills-classified.json", "w", encoding="utf-8") as f:
    json.dump(records, f, ensure_ascii=False, indent=1)

lines = []
for i, rec in enumerate(records, 1):
    tag = "✓" if (rec["trip"] and not rec["exclude"]) else ("✗" if rec["exclude"] else "?")
    if rec["source"] == "icbc":
        amt = f"{rec['amount']} {rec['amount_ccy']} → {rec['settle_amount']} USD"
    else:
        amt = f"{rec['amount']} CNY"
    lines.append(f"{tag} [{rec['country']}|{rec['cat']}] {rec['source']} {rec['datetime']} {rec['dir']} {amt} | {rec['counterparty']} | {rec.get('goods','')} | {rec['note']}")
open(r"D:\亚欧非大环线\_dev\bills-classified.txt", "w", encoding="utf-8").write("\n".join(lines))

# ---------- 汇总 ----------
USD_CNY = 6.76  # 由本卡人民币入账交易反推: (354+308.59)/(52.24+45.77)

def cny(rec):
    if rec["source"] == "icbc":
        return rec["settle_amount"] * USD_CNY
    return rec["amount"]

from collections import defaultdict
by_country = defaultdict(lambda: defaultdict(float))
totals = defaultdict(float)
grand = 0.0
for rec in records:
    if rec["exclude"] or not rec["trip"]:
        continue
    by_country[rec["country"]][rec["cat"]] += cny(rec)
    totals[rec["country"]] += cny(rec)
    grand += cny(rec)

out = []
out.append(f"=== 按国家 × 类别（人民币；工行卡按 1USD={USD_CNY}CNY，由本卡人民币入账反推）===")
out.append("国家\t" + "\t".join(CATS) + "\t合计")
for c in ["中国", "哈萨克斯坦", "格鲁吉亚", "亚美尼亚", "土耳其", "埃及", "阿联酋"]:
    row = [c]
    s = 0
    for cat in CATS:
        v = by_country[c].get(cat, 0)
        row.append(f"{v:.0f}")
        s += v
    row.append(f"{s:.0f}")
    out.append("\t".join(row))
    if c == "中国":
        cn_total = s
out.append(f"账单可见总计\t\t\t\t\t\t\t\t{grand:.0f}")

out.append(f"\n用户口径总额: ¥22,400")
out.append(f"账单可见+用户补充+现金分配: ¥{grand:.0f}")
out.append(f"差额: ¥{22400 - grand:.0f}（零散现金/记忆金额取整，如沅陵市内交通、机场大巴、小额现金）")

# 工行卡汇总
icbc_borrow = sum(r["settle_amount"] for r in records if r["source"] == "icbc" and r["dir"] == "借")
icbc_refund = sum(r["settle_amount"] for r in records if r["source"] == "icbc" and r["dir"] == "贷" and r["type"] == "退货")
out.append(f"\n工行卡: 净支出 {icbc_borrow - icbc_refund:.2f} USD ≈ ¥{(icbc_borrow - icbc_refund) * USD_CNY:.0f}")

open(r"D:\亚欧非大环线\_dev\bills-summary.txt", "w", encoding="utf-8").write("\n".join(out))
print("\n".join(out))
