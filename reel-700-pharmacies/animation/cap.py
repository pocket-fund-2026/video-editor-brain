import sys, json
from playwright.sync_api import sync_playwright
caps=[("c1","The coolest story","coolest"),("c2","pharmacies in Italy","italy"),("c3","a hundred acquisitions","hundred"),("c4","days like that","days"),("c5","me and pushes","")]
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome",args=["--no-sandbox"]); pg=b.new_page(viewport={"width":1080,"height":1920})
    pg.goto("file:///root/reel4/gfx/gfx2.html")
    for n,t,h in caps:
        pg.evaluate("([n,P])=>init(n,P)",["caption",{"text":t,"hl":h}]); pg.evaluate("t=>seek(t)",0.2); pg.screenshot(path=f"/root/reel4/prev2/{n}.png",omit_background=True)
    b.close()
