# -*- coding: utf-8 -*-
"""生成待确认清单 + 用户可读的汇总文件（读取 bills-classified.json）"""
import json

records = json.load(open(r"D:\亚欧非大环线\_dev\bills-classified.json", encoding="utf-8"))
USD = 6.76

# ---------- 待确认清单 ----------
lines = ["=== 待确认项清单（需要你确认后才能定稿）==="]
for r in records:
    if r["source"] == "wechat" and r["dir"] == "支出" and ("待确认" in r.get("note", "")):
        lines.append(f"- {r['datetime'][:10]} {r['amount']}元 | {r['counterparty']} | {r['note']}")
    if r["source"] == "icbc":
        m = r.get("counterparty", "")
        if any(k in m for k in ["Esign", "MEZHD", "FATIH", "NEBAHAT", "giorgi", "teona",
                                "paata", "BT2", "AL PRINCE", "KONYAALTI SUBE"]):
            lines.append(f"- {r['datetime'][:10]} {r['amount']} {r['amount_ccy']}->{r['settle_amount']}USD | {m} | 待确认用途")
open(r"D:\亚欧非大环线\_dev\bills-pending.txt", "w", encoding="utf-8").write("\n".join(lines))

# ---------- 用户可读汇总 ----------
from collections import defaultdict
CATS = ["交通", "住宿", "餐饮", "活动", "门票", "通信", "其他"]

def cny(r):
    return r["settle_amount"] * USD if r["source"] == "icbc" else r["amount"]

by_country = defaultdict(lambda: defaultdict(float))
totals = defaultdict(float)
grand = 0.0
for r in records:
    if r.get("exclude") or not r.get("trip"):
        continue
    by_country[r["country"]][r["cat"]] += cny(r)
    totals[r["country"]] += cny(r)
    grand += cny(r)

out = []
out.append("亚欧非大环线 · 账单汇总（2026-06-29 至 08-26）")
out.append("数据来源：微信支付 68 笔 + 支付宝 134 笔 + 工商银行信用卡 151 笔（美元结算）")
out.append(f"信用卡汇率：按本卡人民币入账交易反推 1USD = {USD} CNY（GetYourGuide 354元→52.24USD；锡瓦取现 308.59元→45.77USD）")
out.append("补充来源：用户提供 6 笔现金/出行前支出 + 出国前 300 美元现金分配（换汇 220 美元 + 落地签 30 美元 + 潜水 50 美元）")
out.append("")
out.append("【一】按国家 × 类别（人民币元）")
out.append("国家\t交通\t住宿\t餐饮\t活动\t门票\t通信\t其他\t合计")
for c in ["中国", "哈萨克斯坦", "格鲁吉亚", "亚美尼亚", "土耳其", "埃及", "阿联酋"]:
    row = [c]
    s = 0
    for cat in CATS:
        v = by_country[c].get(cat, 0)
        row.append(f"{v:.0f}")
        s += v
    row.append(f"{s:.0f}")
    out.append("\t".join(row))
out.append(f"合计\t\t\t\t\t\t\t\t{grand:.0f}")
out.append("")
out.append("【二】对账")
out.append(f"账单可见 + 用户补充 + 现金分配 合计：¥{grand:.0f}")
out.append("用户口径旅行总花费：¥22,400")
out.append(f"差额：¥{22400 - grand:.0f}（用户确认不计，零散现金）")
out.append("")
out.append("【三】大项备注")
out.append("- 中国·交通 ¥1,365 含 伊犁→阿拉木图大巴 ¥203、长沙→乌鲁木齐机票 ¥725、沅陵→长沙大巴 ¥80、杭州→怀化火车 ¥163、伊犁租车+加油等")
out.append("- 哈萨克斯坦·交通 ¥1,919 = 阿拉木图→阿克套 ¥855(现金) + 阿克套→第比利斯 ¥781(现金) + 境内交通(YANDEX打车/地铁等)")
out.append("- 哈萨克斯坦·其他 含 FlyArystan 罚款 ¥157（11,000 坚戈，非机票）")
out.append("- 土耳其·交通 ¥1,426 = 伊斯坦布尔→沙姆沙伊赫机票 ¥524(阿斯兰,提前买) + 机票联订扣回 ¥40 + 境内交通(OBILET/地铁/公交等)")
out.append("- 埃及·交通 ¥2,848 含返程机票「开罗→杭州(经迪拜)」¥2,684.92（去哪儿）")
out.append("- 埃及·活动 ¥2,406 = Seven Heaven 潜水 13,968埃镑(卡付≈278美元≈¥1,879) + 现金 50美元(≈¥338) + 其他")
out.append("- 埃及·餐饮 含达哈卜中国餐厅 ¥542(Seth)：换现金+吃饭未拆分，按餐饮计")
out.append("- 埃及·其他 ≈¥1,676 = ATM取现+手续费 ≈¥1,336 + 落地签30美元≈¥203 + 现金换汇20美元≈¥135")
out.append("- 亚美尼亚·交通 ¥1,242 = 第比利斯→姆兹赫塔→久姆里→埃里温 3人租车自驾分摊 ¥1,225 + YANDEX ¥17（埃里温日常生活几乎全现金，未入账单）")
out.append("- 300 美元现金分配：哈萨克斯坦 20 + 格鲁吉亚 80 + 土耳其 100 + 埃及落地签 30 + 埃及换钱 20 + 潜水 50 = 300 美元；取现手续费 ¥10（中国·其他）")
out.append("- 迪拜另用 100 元现金换迪拜钱（阿联酋·其他）")
out.append("- 潜水总费用口径：13,968埃镑(卡付) + 50美元(现金) 合并计为潜水支出")
open(r"D:\亚欧非大环线\账单\01-账单汇总-按国家分类.txt", "w", encoding="utf-8").write("\n".join(out))
print("\n".join(out))
print("\n\n待确认清单：")
print("\n".join(lines))
