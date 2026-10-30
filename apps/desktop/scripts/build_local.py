import json
import subprocess

# 本地临时增加electronDist位置。

with open("package.json", "r", encoding="utf-8") as f:
    data = json.load(f)

data["build"]["electronDist"] = "node_modules/electron/dist"

with open("package.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=4)

subprocess.call(["bun", "electron-builder", "--publish=never"])

del data["build"]["electronDist"]

with open("package.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=4)

# 完事删除，CI下node_modules里面没有electron，但github CI下electron包下载快
