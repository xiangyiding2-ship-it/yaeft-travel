# -*- coding: utf-8 -*-
"""下载 silkloop 首页 + CSS，提取设计系统关键信息"""
import re, urllib.request, ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
    return urllib.request.urlopen(req, context=ctx, timeout=30).read().decode("utf-8", "ignore")

html = get("https://thesilkloop.com")
open(r"D:\亚欧非大环线\_dev\silkloop.html", "w", encoding="utf-8").write(html)
print("HTML bytes:", len(html))

# CSS 链接
css_links = re.findall(r'<link[^>]*rel=["\']stylesheet["\'][^>]*href=["\']([^"\']+)', html)
css_links += re.findall(r'<link[^>]*href=["\']([^"\']+\.css[^"\']*)["\'][^>]*rel=["\']stylesheet', html)
print("CSS LINKS:", css_links)

# 内联样式中的变量
vars_found = set(re.findall(r"--[a-zA-Z0-9-]+:\s*[^;]{1,60}", html))
print("CSS VARS (inline):", list(vars_found)[:40])

css_all = []
for link in css_links:
    if link.startswith("//"):
        link = "https:" + link
    elif link.startswith("/"):
        link = "https://thesilkloop.com" + link
    try:
        css = get(link)
        css_all.append((link, css))
        print("CSS OK:", link, len(css))
    except Exception as e:
        print("CSS FAIL:", link, e)

# 汇总设计线索
joined = "\n".join(c[1] for c in css_all)
open(r"D:\亚欧非大环线\_dev\silkloop.css", "w", encoding="utf-8").write(joined)

print("\n=== 字体 ===")
for m in sorted(set(re.findall(r"font-family:\s*([^;}]{2,80})", joined)))[:15]:
    print(" ", m.strip())
print("\n=== CSS 变量 ===")
for m in sorted(set(re.findall(r"(--[a-zA-Z0-9-]+):\s*([^;]{1,50})", joined)))[:60]:
    print(" ", m[0], "=", m[1].strip())
